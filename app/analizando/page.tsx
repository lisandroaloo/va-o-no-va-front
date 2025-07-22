"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import usePostIdea from "@/hooks/usePostIdea"
import { CommercialAnalysisLoading } from "@/components/comercial-analysis-loading"

export default function AnalyzingPage() {
  const router = useRouter()
  const { postIdea } = usePostIdea()
  const [formData, setFormData] = useState<{ businessType: string; address: string } | null>(null)

  useEffect(() => {
    const formDataString = sessionStorage.getItem("formDataForAnalysis")
    if (!formDataString) {
      alert("No se encontraron datos para analizar. Por favor, vuelve a intentarlo.")
      router.push("/formulario")
      return
    }

    const parsedData = JSON.parse(formDataString)
    setFormData(parsedData)

    const processRequest = async () => {
      try {
        const result = await postIdea(parsedData)

        if (!result) {
          throw new Error("La respuesta del servidor fue vacía o indefinida.")
        }

        const analysisData = {
          risk: result.risk.value,
          viabilityScore: result.viabilityScore,
          competition: result.competition,
          recommendations: result.recommendations,
          latitude: parsedData.latitude,
          longitude: parsedData.longitude,
          businessType: parsedData.businessType,
          budget: parsedData.budget,
          address: parsedData.address,
          timestamp: Date.now(),
        }

        sessionStorage.setItem("analysisResult", JSON.stringify(analysisData))
        
        router.push("/resultado")

      } catch (err) {
        console.error("Error al analizar viabilidad:", err)
        alert("Ocurrió un error al procesar el análisis. Por favor, intenta nuevamente.")
        sessionStorage.removeItem("formDataForAnalysis")
        router.push("/formulario")
      }
    }

    processRequest()
  }, [router, postIdea])

  if (!formData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-gray-900 mx-auto"></div>
      </div>
    )
  }

  return (
    <CommercialAnalysisLoading
      businessType={formData.businessType}
      address={formData.address}
      duration={120000}
    />
  )
} 