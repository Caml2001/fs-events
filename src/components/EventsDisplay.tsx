import React from 'react';
import type { AnalysisResult, UIEvent } from '../types/index.js';

interface EventsDisplayProps {
  result: AnalysisResult;
  images: string[];
}

export function EventsDisplay({ result, images }: EventsDisplayProps) {
  const generateSDKCode = (event: UIEvent) => {
    // Construir objeto de propiedades limpio
    const baseProps: any = {
      screen: event.properties?.screen || 'unknown',
    };
    
    // Solo agregar propiedades que existan
    if (event.properties?.button_context) baseProps.button_context = event.properties.button_context;
    if (event.properties?.value !== undefined) baseProps.value = event.properties.value;
    if (event.properties?.step !== undefined) baseProps.step = event.properties.step;
    if (event.properties?.method) baseProps.method = event.properties.method;
    
    // Propiedades runtime
    baseProps.timestamp = '${new Date().toISOString()}';
    baseProps.session_id = '${sessionId}';
    baseProps.user_id = '${userId}';
    baseProps.event_id = '${uuidv4()}';
    baseProps.platform = '${platform}';

    // Formatear de manera compacta
    const propsString = JSON.stringify(baseProps, null, 2)
      .replace(/"\$\{([^}]+)\}"/g, '$1'); // Convertir strings template a código real

    return `analytics.track('${event.action}', ${propsString});`;
  };

  return (
    <div className="space-y-8">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">Descripción del flujo</h3>
        <p className="text-blue-800">{result.flowDescription}</p>
      </div>

      {result.screens.map((screen, screenIndex) => (
        <div key={screenIndex} className="space-y-4">
          {/* Imagen de la pantalla */}
          <div className="bg-gray-100 p-4 rounded-lg">
            <h3 className="font-bold text-lg mb-2">{screen.screenName}</h3>
            {images[screenIndex] && (
              <img 
                src={images[screenIndex]} 
                alt={screen.screenName}
                className="w-full h-auto max-h-96 object-contain rounded border border-gray-300"
              />
            )}
          </div>

          {/* Grid de eventos como código SDK */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h4 className="font-semibold text-gray-900 mb-4">Eventos SDK</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {screen.events.map((event, eventIndex) => (
                <div key={event.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">Evento {eventIndex + 1}</span>
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">{event.type}</span>
                    </div>
                    <p className="text-xs text-gray-600">{event.description}</p>
                  </div>
                  <div className="bg-gray-900 text-gray-100 p-3 rounded-md overflow-x-auto">
                    <pre className="text-xs">
                      <code>{generateSDKCode(event)}</code>
                    </pre>
                  </div>
                  <button 
                    onClick={() => navigator.clipboard.writeText(generateSDKCode(event))}
                    className="mt-2 w-full text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 py-1 px-2 rounded transition-colors"
                  >
                    Copiar código
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}