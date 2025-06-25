"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { PageLayout } from "@/components/page-layout"
import usePostIdea from "@/hooks/usePostIdea"
import MapComponent from "@/components/map"


export default function FormularioPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    latitud: "",
    longitud: "",
    tipoComercio: "",
    presupuesto: "",
  })
  const [markerPosition, setMarkerPosition] = useState<{ lat: number; lng: number } | null>(null);

  const { loading, postIdea } = usePostIdea(); // ✅ Correcto si devuelve un objeto

  useEffect(() => {
    const lat = Number.parseFloat(formData.latitud);
    const lng = Number.parseFloat(formData.longitud);
    if (!Number.isNaN(lat) && !Number.isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      setMarkerPosition({ lat, lng });
    } else {
      setMarkerPosition(null);
    }
  }, [formData.latitud, formData.longitud]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleMapPositionChange = (newPosition: { lat: number; lng: number }) => {
    setMarkerPosition(newPosition);
    setFormData((prev) => ({
      ...prev,
      latitud: newPosition.lat.toFixed(6),
      longitud: newPosition.lng.toFixed(6),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validar que las coordenadas estén en rangos válidos
      const lat = Number.parseFloat(formData.latitud)
      const lng = Number.parseFloat(formData.longitud)

      if (lat < -90 || lat > 90) {
        alert("La latitud debe estar entre -90 y 90")
        setIsLoading(false)
        return
      }

      if (lng < -180 || lng > 180) {
        alert("La longitud debe estar entre -180 y 180")
        setIsLoading(false)
        return
      }

      // Preparar datos para el endpoint
      const requestData = {
        latitude: lat,
        longitude: lng,
        businessType: formData.tipoComercio,
        budget: Number.parseInt(formData.presupuesto),
      }

      // Enviar datos al endpoint
      const result = await postIdea(requestData)

      // Guardar todos los datos en sessionStorage (se borra al cerrar la pestaña)
      const analysisData = {
        // Datos del backend
        risk: result?.risk,
        viabilityScore: result?.viabilityScore,
        competition: result?.competition,
        recommendations: result?.recommendations,
        // Datos del formulario
        latitude: lat,
        longitude: lng,
        businessType: formData.tipoComercio,
        budget: Number.parseInt(formData.presupuesto),
        // Timestamp para validar que no sea muy viejo
        timestamp: Date.now(),
      }

      sessionStorage.setItem("analysisResult", JSON.stringify(analysisData))

      // Navegar a la página de resultados sin parámetros
      router.push("/resultado")
    } catch (error) {
      console.error("Error al analizar viabilidad:", error)
      alert("Error al procesar el análisis. Por favor, intenta nuevamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <PageLayout>
      <div className="flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-3xl bg-white rounded-lg border shadow-sm">
          <div className="p-6 border-b">
            <h2 className="text-2xl font-bold">Análisis de viabilidad comercial</h2>
            <p className="text-gray-600 mt-2">
              Ingresa las coordenadas de ubicación, tipo de comercio y presupuesto para evaluar la viabilidad de tu
              negocio.
            </p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-6">
              <div className="space-y-4">
                <label className="text-sm font-medium">Ubicación del negocio</label>

                {/* Campos de coordenadas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="latitud" className="text-sm font-medium">
                      Latitud
                    </label>
                    <input
                      id="latitud"
                      name="latitud"
                      type="number"
                      step="any"
                      placeholder="Ej: 39.9526"
                      value={formData.latitud}
                      onChange={handleChange}
                      required
                      disabled={isLoading}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                      suppressHydrationWarning={true}
                    />
                    <p className="text-xs text-gray-500">Rango válido: -90 a 90</p>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="longitud" className="text-sm font-medium">
                      Longitud
                    </label>
                    <input
                      id="longitud"
                      name="longitud"
                      type="number"
                      step="any"
                      placeholder="Ej: -75.1652"
                      value={formData.longitud}
                      onChange={handleChange}
                      required
                      disabled={isLoading}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                      suppressHydrationWarning={true}
                    />
                    <p className="text-xs text-gray-500">Rango válido: -180 a 180</p>
                  </div>
                </div>

                {/* MAP COMPONENT INTEGRATION */}
                <div className="mt-4">
                  <label className="text-sm font-medium">O selecciona en el mapa:</label>
                  <div className="mt-2 rounded-md border border-gray-300 overflow-hidden">
                    <MapComponent
                      position={markerPosition}
                      onPositionChange={handleMapPositionChange}
                      mapHeight="300px"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="tipoComercio" className="text-sm font-medium">
                  Tipo de comercio
                </label>
                <select
                  id="tipoComercio"
                  name="tipoComercio"
                  value={formData.tipoComercio}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  suppressHydrationWarning={true}
                >
                  <option value="">Selecciona el tipo de comercio</option>
                  <option value="cafe">☕ Café</option>
                  <option value="restaurant">🍽️ Restaurante</option>
                  <option value="convenience_store">🏪 Kiosco</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="presupuesto" className="text-sm font-medium">
                  Presupuesto (USD)
                </label>
                <input
                  id="presupuesto"
                  name="presupuesto"
                  type="number"
                  placeholder="Ej: 50000"
                  value={formData.presupuesto}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  suppressHydrationWarning={true}
                />
                <p className="text-xs text-gray-500">Ingresa tu presupuesto inicial disponible</p>
              </div>
            </div>
            <div className="p-6 border-t flex justify-between">
              <Link href="/">
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading}
                >
                  ← Volver
                </button>
              </Link>
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center justify-center rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Analizando...
                  </>
                ) : (
                  "Analizar viabilidad"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </PageLayout>
  )
}
