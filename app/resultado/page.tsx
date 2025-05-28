"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { PageLayout } from "@/components/page-layout"

interface AnalysisData {
  risk: IValue
  viabilityScore: number
  competition: IValue
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


export default function ResultadoPage() {
  const router = useRouter()
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDownloading, setIsDownloading] = useState(false)


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
      setTimeout(() => setProgressViability(data.viabilityScore), 500)
      setTimeout(() => setProgressRisk(data.risk.value), 700)
      setTimeout(() => setProgressCompetition(data.competition.value), 900)
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

  return (
    <PageLayout>
      <div className="flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-4xl bg-white rounded-lg border shadow-sm">
          <div className="p-6 border-b">
            <h2 className="text-2xl font-bold">Resultado del análisis</h2>
            <p className="text-gray-600 mt-2">
              Análisis de viabilidad para un{" "}
              {{
                "convenience-store": "kiosco",
                "restaurant": "restaurante",
                "cafe": "café"
              }[analysisData.businessType] || analysisData.businessType}{" "}
              en las coordenadas {analysisData.latitude.toFixed(4)}, {analysisData.longitude.toFixed(4)} con un presupuesto de $
              {analysisData.budget.toLocaleString()} USD
            </p>
          </div>

          <div className="p-6 space-y-6">
            {/* Estado general */}
            <div className="flex items-center gap-3 p-4 border rounded-lg bg-gray-50">
              <span className="text-4xl">{overallStatus.icon}</span>
              <div>
                <h3 className={`font-bold text-xl ${overallStatus.color}`}>{overallStatus.message}</h3>
                <p className="text-gray-600">
                  Basado en el análisis de viabilidad, riesgo y competencia de tu proyecto empresarial.
                </p>
              </div>
            </div>

            {/* Métricas principales */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Viabilidad */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">📈 Puntuación de Viabilidad</span>
                  <span className="text-sm font-medium">{analysisData.viabilityScore}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-1000 ease-out ${getScoreColor(analysisData.viabilityScore)}`}
                    style={{ width: `${progressViability}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-600">
                  {getScoreInterpretation(analysisData.viabilityScore, "viability")}
                </p>
              </div>

              {/* Riesgo */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">⚠️ Puntuación de Riesgo</span>
                  <span className="text-sm font-medium">{analysisData.risk.value}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-1000 ease-out ${getScoreColor(analysisData.risk.value, true)}`}
                    style={{ width: `${progressRisk}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-600">{getScoreInterpretation(analysisData.risk.value, "risk")}</p>
              </div>

              {/* Competencia */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">🏢 Análisis de Competencia</span>
                  <span className="text-sm font-medium">{analysisData.competition.value} </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-1000 ease-out ${getScoreColor(analysisData.competition.value, false, true)}`}
                    style={{
                      width: `${progressCompetition < 10
                          ? 10
                          : progressCompetition <= 20
                            ? 50
                            : 100
                        }%`
                    }}
                  ></div>

                </div>
                <p className="text-xs text-gray-600">
                  {getScoreInterpretation(analysisData.competition.value, "competition")}
                </p>
              </div>
            </div>

            {/* Recomendaciones */}
            {analysisData.recommendations.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-bold text-lg">🎯 Recomendaciones estratégicas</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <ul className="space-y-2">
                    {analysisData.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="mt-1 text-blue-600">•</span>
                        <span className="text-blue-800">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Detalles del análisis */}
            <div className="space-y-3">
              <h3 className="font-bold text-lg">📊 Detalles del análisis</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">📍</span>
                    <span className="font-medium">Ubicación</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Coordenadas: {analysisData.latitude.toFixed(4)}, {analysisData.longitude.toFixed(4)}
                  </p>
                  <p className="text-sm text-gray-600">Análisis geográfico y demográfico de la zona.</p>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{getComercioEmoji()}</span>
                    <span className="font-medium">Tipo de negocio</span>
                  </div>
                  <p className="text-sm text-gray-600">Categoría: {analysisData.businessType}</p>
                  <p className="text-sm text-gray-600">Análisis específico del sector y requerimientos.</p>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">💰</span>
                    <span className="font-medium">Presupuesto</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Inversión inicial: ${analysisData.budget.toLocaleString()} USD
                  </p>
                  <p className="text-sm text-gray-600">Evaluación de suficiencia y optimización de recursos.</p>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">🎯</span>
                    <span className="font-medium">Metodología</span>
                  </div>
                  <p className="text-sm text-gray-600">Análisis multifactorial</p>
                  <p className="text-sm text-gray-600">Evaluación de mercado, competencia y factores de riesgo.</p>
                </div>
              </div>
            </div>
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
