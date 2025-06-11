"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { PageLayout } from "@/components/page-layout"
import { CompetitionScores } from "@/hooks/usePostIdea"
import { Tooltip } from "@/components/tooltip"
import { RatingChart } from "@/components/rating-chart"

export interface AnalysisData {
  risk: IValue
  viabilityScore: number
  competition: CompetitionScores
  recommendations: string[]
  latitude: number
  longitude: number
  businessType: string
  budget: number
  timestamp: number
}
export interface IValue {
  value: number
}

interface RatingData {
  stars: number
  count: number
}


export default function ResultadoPage() {
  const router = useRouter()
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDownloading, setIsDownloading] = useState(false)
  const [showRecommendations, setShowRecommendations] = useState(false)
  const [isAnalyzingWithAI, setIsAnalyzingWithAI] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<any | null>(null);
  const [aiAnalysisError, setAiAnalysisError] = useState<string | null>(null);
  

  const [progressViability, setProgressViability] = useState(0)
  const [progressRisk, setProgressRisk] = useState(0)
  const [progressCompetition, setProgressCompetition] = useState(0)

  useEffect(() => {
    // Intentar cargar los datos del sessionStorage
    try {
      const storedData = sessionStorage.getItem("analysisResult")

      if (!storedData) {
        // No hay datos, redirigir al formulario
        router.push("/formulario")
        return
      }

      const data: AnalysisData = JSON.parse(storedData)

      // Verificar que los datos no sean muy viejos (más de 1 hora)
      const oneHour = 60 * 60 * 1000
      if (Date.now() - data.timestamp > oneHour) {
        // Datos muy viejos, limpiar y redirigir
        sessionStorage.removeItem("analysisResult")
        router.push("/formulario")
        return
      }

      setAnalysisData(data)
      console.log(data)
      setIsLoading(false)

      // Animar las barras de progreso
      setTimeout(() => setProgressViability(data.viabilityScore || 0), 500)
      setTimeout(() => setProgressRisk(data.risk?.value || 0), 700)
    } catch (error) {
      console.error("Error loading analysis data:", error)
      sessionStorage.removeItem("analysisResult")
      router.push("/formulario")
    }
  }, [router])

  // Limpiar datos cuando el usuario sale de la página
  useEffect(() => {
    const handleBeforeUnload = () => {
      sessionStorage.removeItem("analysisResult")
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [])

  if (isLoading || !analysisData) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-gray-600">Cargando resultados...</p>
          </div>
        </div>
      </PageLayout>
    )
  }

  const downloadPDF = async () => {
    if (!analysisData) return

    setIsDownloading(true)
    try {
      const response = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(analysisData),
      })

      if (!response.ok) {
        throw new Error("Error al generar el PDF")
      }

      // Obtener el blob del PDF
      const blob = await response.blob()

      // Crear URL temporal para el blob
      const url = window.URL.createObjectURL(blob)

      // Crear elemento de descarga
      const a = document.createElement("a")
      a.href = url
      a.download = `reporte-viabilidad-${analysisData.businessType}-${new Date().toISOString().split("T")[0]}.pdf`
      document.body.appendChild(a)
      a.click()

      // Limpiar
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Error downloading PDF:", error)
      alert("Error al descargar el reporte. Por favor, intenta nuevamente.")
    } finally {
      setIsDownloading(false)
    }
  }

  const getScoreColor = (score: number, isRisk = false, isCompetition = false) => {
    if (isRisk) {
      if (score <= 30) return "bg-green-500"
      if (score <= 60) return "bg-yellow-500"
      return "bg-red-500"
    } else if (isCompetition) {
      if (score >= 20) return "bg-red-500"
      if (score >= 10) return "bg-yellow-500"
      return "bg-green-500"
    } else {
      // Para viabilidad y competencia: mayor score = mejor
      if (score >= 70) return "bg-green-500"
      if (score >= 40) return "bg-yellow-500"
      return "bg-red-500"
    }
  }

  // Función para obtener texto de interpretación
  const getScoreInterpretation = (score: number, type: string) => {
    if (type === "risk") {
      if (score <= 30) return "Bajo riesgo"
      if (score <= 60) return "Riesgo moderado"
      return "Alto riesgo"
    } else if (type === "viability") {
      if (score >= 70) return "Alta viabilidad"
      if (score >= 40) return "Viabilidad moderada"
      return "Baja viabilidad"
    } else if (type === "competition") {
      if (score >= 20) return "Alta competencia"
      if (score >= 10) return "Competencia moderada"
      return "Baja competencia"
    }
    return ""
  }

  
    const getName = (name: String) => {
      if (name === "convenience_store") return "kiosco"
      if (name === "cafe") return "café"
      if (name === "restaurant") return "restaurante"
    }


  // Determinar el estado general basado en viability_score
  const getOverallStatus = () => {
    if (analysisData.viabilityScore >= 70)
      return { icon: "✅", message: "Proyecto recomendado", color: "text-green-600" }
    if (analysisData.viabilityScore >= 40)
      return { icon: "⚠️", message: "Proyecto con potencial", color: "text-yellow-600" }
    return { icon: "❌", message: "Proyecto no recomendado", color: "text-red-600" }
  }

  const overallStatus = getOverallStatus()

  // Obtener emoji del tipo de comercio
  const getComercioEmoji = () => {
    const emojis = {
      cafe: "☕",
      restaurante: "🍽️",
      kiosco: "🏪",
    }
    return emojis[analysisData.businessType as keyof typeof emojis] || "🏪"
  }


  const handleNewAnalysis = () => {
    // Limpiar datos y redirigir
    sessionStorage.removeItem("analysisResult")
    router.push("/formulario")
  }

  
  // Tooltips explicativos concisos
  const tooltips = {
    viability:
      "Evalúa la probabilidad de éxito basada en densidad poblacional, poder adquisitivo, accesibilidad y flujo peatonal.",
    risk: "Identifica obstáculos como regulaciones locales, competencia directa y factores externos que podrían afectar tu negocio.",
    competition:
      "Analiza la cantidad y calidad de negocios similares en un radio de 500m, incluyendo sus calificaciones promedio.",
  }

  const totalNearbyBusinesses = analysisData.competition
    ? analysisData.competition.oneStar +
      analysisData.competition.twoStar +
      analysisData.competition.threeStar +
      analysisData.competition.fourStar +
      analysisData.competition.fiveStar
    : 0

  
  const convertCompetitionToRatingData = (competition: CompetitionScores): RatingData[] => {
    return [
      { stars: 1, count: competition.oneStar },
      { stars: 2, count: competition.twoStar },
      { stars: 3, count: competition.threeStar },
      { stars: 4, count: competition.fourStar },
      { stars: 5, count: competition.fiveStar },
    ]
  }


  // Convertir datos de competencia para el gráfico
  const ratingData = analysisData.competition ? convertCompetitionToRatingData(analysisData.competition) : []

  const handleAdvancedAIAnalysis = async () => {
    if (!analysisData) return;

    setIsAnalyzingWithAI(true);
    setAiAnalysisResult(null);
    setAiAnalysisError(null);

    try {
      const requestPayload = {
        latitude: analysisData.latitude,
        longitude: analysisData.longitude,
        businessType: analysisData.businessType,
        budget: analysisData.budget,
      };

      const response = await fetch("http://localhost:8080/ideas/ia", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestPayload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Error desconocido del servidor de IA" }));
        throw new Error(errorData.message || `Error del servidor de IA: ${response.status}`);
      }

      const data = await response.json();
      console.log("Respuesta del análisis IA avanzado:", data);
      setAiAnalysisResult(data); // Store the result if you want to display it
      // For now, just an alert. You can expand this to show data in the UI.
      alert("Análisis con IA avanzado completado. Revisa la consola para ver los detalles.");

    } catch (error: any) {
      console.error("Error en el análisis con IA avanzado:", error);
      setAiAnalysisError(error.message || "Ocurrió un error al contactar el servicio de IA.");
      alert(`Error en el análisis con IA avanzado: ${error.message || "Ocurrió un error."}`);
    } finally {
      setIsAnalyzingWithAI(false);
    }
  };

 return (
    <PageLayout>
      <div className="flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-4xl bg-white rounded-lg border shadow-sm">
          <div className="p-6 border-b">
            <h2 className="text-2xl font-bold">Resultado del análisis</h2>
            <p className="text-gray-600 mt-2">
              Análisis de viabilidad de un {getName(analysisData.businessType)} con un presupuesto de $
              {analysisData.budget.toLocaleString()} USD
            </p>
          </div>

          <div className="p-6 space-y-6">
            {/* Estado general */}
            <div className="flex items-center gap-3 p-4 border rounded-lg bg-gray-50">
              <span className="text-4xl">{overallStatus.icon}</span>
              <div>
                <h3 className={`font-bold text-xl ${overallStatus.color}`}>{overallStatus.message}</h3>
              </div>
            </div>

            {/* Métricas principales separadas por secciones */}
            <div className="space-y-8">
              {/* Sección de Viabilidad */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl">📈</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Puntuación de Viabilidad</h3>
                      <Tooltip content={tooltips.viability} position="bottom">
                        <p className="text-sm text-gray-600 cursor-help hover:text-gray-800">
                          Probabilidad de éxito del negocio en esta ubicación
                        </p>
                      </Tooltip>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-gray-900">{analysisData.viabilityScore}%</div>
                    <div className="text-sm text-gray-600">
                      {getScoreInterpretation(analysisData.viabilityScore, "viability")}
                    </div>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className={`h-4 rounded-full transition-all duration-1000 ease-out ${getScoreColor(analysisData.viabilityScore)}`}
                    style={{ width: `${progressViability}%` }}
                  ></div>
                </div>
              </div>

              {/* Sección de Riesgo */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl">⚠️</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Puntuación de Riesgo</h3>
                      <Tooltip content={tooltips.risk} position="bottom">
                        <p className="text-sm text-gray-600 cursor-help hover:text-gray-800">
                          Factores que podrían afectar negativamente tu negocio
                        </p>
                      </Tooltip>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-gray-900">{analysisData.risk.value}%</div>
                    <div className="text-sm text-gray-600">
                      {getScoreInterpretation(analysisData.risk.value, "risk")}
                    </div>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className={`h-4 rounded-full transition-all duration-1000 ease-out ${getScoreColor(analysisData.risk.value, true)}`}
                    style={{ width: `${progressRisk}%` }}
                  ></div>
                </div>
              </div>

              {/* Sección de Competencia unificada con gráfico */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl">🏢</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Análisis de Competencia</h3>
                      <Tooltip content={tooltips.competition} position="bottom">
                        <p className="text-sm text-gray-600 cursor-help hover:text-gray-800">
                          Comercios similares encontrados en un radio de 500m
                        </p>
                      </Tooltip>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-gray-900">{totalNearbyBusinesses}</div>
                    <div className="text-sm text-gray-600">
                      {totalNearbyBusinesses === 1 ? "comercio similar" : "comercios similares"}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {getScoreInterpretation(totalNearbyBusinesses,"competition")}
                    </div>
                  </div>
                </div>

                {/* Gráfico de comercios cercanos integrado */}
                {totalNearbyBusinesses > 0 ? (
                  <div className="mt-4">
                    <RatingChart
                      data={ratingData}
                      title={`Distribución de calificaciones de ${analysisData.businessType}s cercanos`}
                    />
                  </div>
                ) : (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-green-600 text-lg">✨</span>
                      <div>
                        <p className="text-green-800 font-medium">¡Excelente oportunidad!</p>
                        <p className="text-green-700 text-sm">
                          No se encontraron comercios similares en la zona, lo que representa una ventaja competitiva
                          significativa.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Botón para mostrar/ocultar recomendaciones */}
            <div className="border-t pt-4">
              <button
                onClick={() => setShowRecommendations(!showRecommendations)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <span className={`transform transition-transform ${showRecommendations ? "rotate-90" : ""}`}>▶</span>
                <span className="text-sm font-medium">
                  {showRecommendations ? "Ocultar recomendaciones" : "Ver recomendaciones estratégicas"}
                </span>
              </button>
            </div>

            {/* Recomendaciones (colapsables) */}
            {showRecommendations && analysisData.recommendations.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-bold text-lg text-blue-900 mb-3">🎯 Recomendaciones estratégicas</h3>
                <ul className="space-y-2">
                  {analysisData.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="mt-1 text-blue-600">•</span>
                      <span className="text-blue-800">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="p-6 border-t flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleNewAnalysis}
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              ← Nuevo análisis
            </button>
            <div className="flex gap-2 w-full sm:w-auto sm:ml-auto">
              <button
                onClick={downloadPDF}
                disabled={isDownloading}
                className="flex-1 sm:flex-none inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDownloading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-700 mr-2"></div>
                    Generando...
                  </>
                ) : (
                  <>📄 Descargar reporte</>
                )}
              </button>
              <button className="flex-1 sm:flex-none inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                📤 Compartir resultados
              </button>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
