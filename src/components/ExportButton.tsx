import React from 'react';
import { Download } from 'lucide-react';
import type { AnalysisResult } from '../types/index.js';

interface ExportButtonProps {
  result: AnalysisResult;
}

export function ExportButton({ result }: ExportButtonProps) {
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

  return (
    <div className="flex gap-2">
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
    </div>
  );
}