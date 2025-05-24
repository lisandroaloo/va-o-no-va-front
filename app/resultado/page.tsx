"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { PageLayout } from "@/components/page-layout"

export default function ResultadoPage() {
  const searchParams = useSearchParams()
  const score = Number.parseInt(searchParams.get("score") || "0")
  const latitud = searchParams.get("latitud") || ""
  const longitud = searchParams.get("longitud") || ""
  const tipoComercio = searchParams.get("tipo") || ""
  const presupuesto = searchParams.get("presupuesto") || ""

  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => setProgress(score), 500)
    return () => clearTimeout(timer)
  }, [score])

  // Determinar el estado de viabilidad basado en el puntaje
  const getViabilityStatus = () => {
    if (score >= 70) return { status: "viable", color: "text-green-500", icon: "✅", message: "Altamente viable" }
    if (score >= 40) return { status: "posible", color: "text-yellow-500", icon: "⚠️", message: "Posiblemente viable" }
    return { status: "no-viable", color: "text-red-500", icon: "❌", message: "Poco viable" }
  }

  const viability = getViabilityStatus()

  // Generar recomendaciones basadas en el puntaje y tipo de comercio
  const getRecommendations = () => {
    const baseRecommendations = {
      cafe: {
        high: ["Considera horarios extendidos para captar más clientes", "Ofrece opciones de trabajo remoto con WiFi"],
        medium: ["Evalúa la competencia de cafeterías cercanas", "Considera un menú más diversificado"],
        low: [
          "La zona puede no tener suficiente tráfico peatonal para un café",
          "Considera una ubicación más comercial",
        ],
      },
      restaurante: {
        high: [
          "Planifica un menú acorde al perfil socioeconómico de la zona",
          "Considera delivery para ampliar alcance",
        ],
        medium: ["Analiza los horarios de mayor demanda en la zona", "Evalúa opciones de estacionamiento"],
        low: [
          "La inversión puede ser muy alta para esta ubicación",
          "Considera un formato más pequeño como food truck",
        ],
      },
      kiosco: {
        high: ["Aprovecha la alta rotación con productos de consumo rápido", "Considera horarios extendidos"],
        medium: ["Evalúa qué productos tienen mayor demanda en la zona", "Considera alianzas con delivery"],
        low: ["Puede haber demasiada competencia de supermercados cercanos", "Evalúa una ubicación con más tránsito"],
      },
    }

    const comercioRecommendations =
      baseRecommendations[tipoComercio as keyof typeof baseRecommendations] || baseRecommendations.cafe

    if (score >= 70) return comercioRecommendations.high
    if (score >= 40) return comercioRecommendations.medium
    return comercioRecommendations.low
  }

  const recommendations = getRecommendations()

  // Determinar el color de la barra de progreso
  const getProgressColor = () => {
    if (score >= 70) return "bg-green-500"
    if (score >= 40) return "bg-yellow-500"
    return "bg-red-500"
  }

  // Obtener emoji del tipo de comercio
  const getComercioEmoji = () => {
    const emojis = {
      cafe: "☕",
      restaurante: "🍽️",
      kiosco: "🏪",
    }
    return emojis[tipoComercio as keyof typeof emojis] || "🏪"
  }

  return (
    <PageLayout>
      <div className="flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-3xl bg-white rounded-lg border shadow-sm">
          <div className="p-6 border-b">
            <h2 className="text-2xl font-bold">Resultado del análisis</h2>
            <p className="text-gray-600 mt-2">
              Análisis de viabilidad para un {getComercioEmoji()} {tipoComercio} en las coordenadas {latitud},{" "}
              {longitud} con presupuesto de ${presupuesto} USD
            </p>
          </div>
          <div className="p-6 space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Puntuación de viabilidad</span>
                <span className="text-sm font-medium">{score}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-1000 ease-out ${getProgressColor()}`}
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>

            <div className="flex items-center gap-2 p-4 border rounded-lg">
              <span className="text-4xl">{viability.icon}</span>
              <div>
                <h3 className="font-bold text-xl">{viability.message}</h3>
                <p className="text-gray-600">
                  {score >= 70
                    ? "Tu idea de negocio tiene un alto potencial de éxito en esta ubicación."
                    : score >= 40
                      ? "Tu idea tiene potencial, pero considera nuestras recomendaciones para mejorar sus posibilidades de éxito."
                      : "Esta ubicación o tipo de negocio presenta desafíos significativos. Revisa nuestras recomendaciones."}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-bold text-lg">Recomendaciones para tu {tipoComercio}</h3>
              <ul className="space-y-2">
                {recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="mt-1 text-blue-500">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="font-bold text-lg">Factores considerados</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 border rounded-lg">
                  <span className="font-medium">📍 Ubicación geográfica</span>
                  <p className="text-sm text-gray-600">
                    Análisis de las coordenadas {latitud}, {longitud} y su entorno comercial.
                  </p>
                </div>
                <div className="p-3 border rounded-lg">
                  <span className="font-medium">🏪 Tipo de comercio</span>
                  <p className="text-sm text-gray-600">
                    Evaluación específica para {tipoComercio} y sus requerimientos.
                  </p>
                </div>
                <div className="p-3 border rounded-lg">
                  <span className="font-medium">💰 Presupuesto disponible</span>
                  <p className="text-sm text-gray-600">
                    Análisis de viabilidad con ${presupuesto} USD de inversión inicial.
                  </p>
                </div>
                <div className="p-3 border rounded-lg">
                  <span className="font-medium">🏢 Competencia local</span>
                  <p className="text-sm text-gray-600">Evaluación de negocios similares en un radio de 500m.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="p-6 border-t flex flex-col sm:flex-row gap-4">
            <Link href="/formulario" className="w-full sm:w-auto">
              <button className="w-full inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                ← Volver al formulario
              </button>
            </Link>
            <div className="flex gap-2 w-full sm:w-auto sm:ml-auto">
              <button className="flex-1 sm:flex-none inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                📄 Descargar PDF
              </button>
              <button className="flex-1 sm:flex-none inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                📤 Compartir
              </button>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
