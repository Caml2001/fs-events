import React from 'react';
import { Download, FileArchive } from 'lucide-react';
import JSZip from 'jszip';
import type { AnalysisResult } from '../types/index.js';

interface ExportButtonProps {
  result: AnalysisResult;
  images?: string[];
}

export function ExportButton({ result, images = [] }: ExportButtonProps) {
  const exportAsJSON = () => {
    const dataStr = JSON.stringify(result, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `figma-events-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const exportAsMarkdown = () => {
    let markdown = `# Análisis de Eventos - ${new Date().toLocaleDateString()}\n\n`;
    markdown += `## Descripción del flujo\n${result.flowDescription}\n\n`;
    
    result.screens.forEach(screen => {
      markdown += `## ${screen.screenName}\n\n`;
      screen.events.forEach(event => {
        markdown += `### ${event.element}\n`;
        markdown += `- **Tipo:** ${event.type}\n`;
        markdown += `- **Descripción:** ${event.description}\n`;
        markdown += `- **Evento:** \`${event.action}\`\n`;
        if (event.properties) {
          markdown += `- **Propiedades:**\n`;
          Object.entries(event.properties).forEach(([key, value]) => {
            markdown += `  - ${key}: ${value}\n`;
          });
        }
        if (event.navigation) markdown += `- **Navegación:** ${event.navigation}\n`;
        if (event.validation) markdown += `- **Validación:** ${event.validation}\n`;
        markdown += `\n`;
      });
    });
    
    const dataUri = 'data:text/markdown;charset=utf-8,'+ encodeURIComponent(markdown);
    const exportFileDefaultName = `figma-events-${new Date().toISOString().split('T')[0]}.md`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const exportAsSDK = () => {
    let sdkCode = `// Eventos de tracking para: ${result.flowDescription}\n`;
    sdkCode += `// Generado el: ${new Date().toLocaleDateString()}\n\n`;
    
    result.screens.forEach(screen => {
      sdkCode += `// ${screen.screenName}\n`;
      screen.events.forEach(event => {
        const properties = {
          screen: event.properties?.screen || 'unknown',
          timestamp: '${new Date().toISOString()}',
          session_id: '${sessionId}',
          user_id: '${userId}',
          event_id: '${uuidv4()}',
          platform: '${platform}',
          ...event.properties,
        };
        
        const propsString = JSON.stringify(properties, null, 2)
          .replace(/"\$\{([^}]+)\}"/g, '$1');
        
        sdkCode += `\n// ${event.description}\n`;
        sdkCode += `analytics.track('${event.action}', ${propsString});\n`;
      });
      sdkCode += '\n';
    });
    
    const dataUri = 'data:text/javascript;charset=utf-8,'+ encodeURIComponent(sdkCode);
    const exportFileDefaultName = `figma-events-sdk-${new Date().toISOString().split('T')[0]}.js`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const exportAsZip = async () => {
    const zip = new JSZip();
    const flowName = result.flowDescription.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    
    // Create a modified result where screenName references images
    const modifiedResult = {
      ...result,
      screens: result.screens.map((screen, index) => ({
        ...screen,
        screenName: `img_${index + 1}`,
        originalScreenName: screen.screenName
      }))
    };
    
    // Add the events JSON file
    zip.file(`${flowName}_eventos.json`, JSON.stringify(modifiedResult, null, 2));
    
    // Create images folder
    const imgFolder = zip.folder(`${flowName}_imagenes`);
    
    // Add images to the folder
    if (images.length > 0 && imgFolder) {
      for (let i = 0; i < images.length; i++) {
        const imageData = images[i];
        const base64Data = imageData.split(',')[1]; // Remove data:image/png;base64, prefix
        imgFolder.file(`img_${i + 1}.png`, base64Data, { base64: true });
      }
    }
    
    // Generate and download the ZIP file
    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${flowName}.zip`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex gap-2 flex-wrap">
      <button
        onClick={exportAsJSON}
        className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
      >
        <Download className="h-4 w-4" />
        Exportar JSON
      </button>
      <button
        onClick={exportAsMarkdown}
        className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
      >
        <Download className="h-4 w-4" />
        Exportar Markdown
      </button>
      <button
        onClick={exportAsSDK}
        className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
      >
        <Download className="h-4 w-4" />
        Exportar SDK
      </button>
      <button
        onClick={exportAsZip}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <FileArchive className="h-4 w-4" />
        Exportar ZIP
      </button>
    </div>
  );
}