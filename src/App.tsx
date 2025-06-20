import { useState } from 'react'
import { Sparkles, Loader2 } from 'lucide-react'
import './App.css'
import { ImageUploader } from './components/ImageUploader'
import { EventsDisplay } from './components/EventsDisplay'
import { ExportButton } from './components/ExportButton'
import { analyzeScreens } from './services/openRouterService'
import type { AnalysisResult } from './types/index.js'

function App() {
  const [images, setImages] = useState<string[]>([])
  const [context, setContext] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleAnalyze = async () => {
    if (images.length === 0) {
      setError('Por favor, sube al menos una pantalla de Figma')
      return
    }

    if (!context.trim()) {
      setError('Por favor, proporciona contexto sobre el flujo')
      return
    }

    setIsAnalyzing(true)
    setError(null)

    try {
      const analysisResult = await analyzeScreens(images, context)
      setResult(analysisResult)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al analizar las pantallas')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleReset = () => {
    setImages([])
    setContext('')
    setResult(null)
    setError(null)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Figma Events Analyzer</h1>
          </div>
          <p className="text-gray-600">
            Analiza pantallas de Figma y genera automáticamente todos los eventos del flujo
          </p>
        </header>

        {!result ? (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-4">1. Sube las pantallas de Figma</h2>
              <ImageUploader images={images} onImagesChange={setImages} />
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-4">2. Proporciona contexto del flujo</h2>
              <textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="Ejemplo: Este flujo es de registro de usuario. El usuario puede registrarse con email o con redes sociales. Debe validar su email y completar su perfil..."
                className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div className="flex justify-center">
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || images.length === 0 || !context.trim()}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Analizando...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    Analizar Pantallas
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Resultados del Análisis</h2>
                <div className="flex gap-2">
                  <ExportButton result={result} />
                  <button
                    onClick={handleReset}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Nuevo Análisis
                  </button>
                </div>
              </div>
              <EventsDisplay result={result} images={images} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
