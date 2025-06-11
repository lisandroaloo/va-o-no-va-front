"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { PageLayout } from "@/components/page-layout"
import usePostIdea from "@/hooks/usePostIdea"
import MapComponent from "@/components/map"
import { AddressAutocomplete } from "@/components/address-autocomplete"
import { GoogleMapsWrapper } from "@/components/google-maps-wrapper"


export default function FormularioPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    direccion: "",
    tipoComercio: "",
    presupuesto: "",
  })
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null)
  const [markerPosition, setMarkerPosition] = useState<{ lat: number; lng: number } | null>(null);

  const { loading, postIdea } = usePostIdea(); // ✅ Correcto si devuelve un objeto

  useEffect(() => {
    if (coordinates) {
      setMarkerPosition(coordinates);
    } else {
      setMarkerPosition(null);
    }
  }, [coordinates]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Función para geocoding (dirección -> coordenadas)
  const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number } | null> => {
    try {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
      if (!apiKey) {
        console.error("Google Maps API key no configurada")
        return null
      }

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`
      )
      
      const data = await response.json()
      
      if (data.status === 'OK' && data.results && data.results.length > 0) {
        const location = data.results[0].geometry.location
        return { lat: location.lat, lng: location.lng }
      }
      
      return null
    } catch (error) {
      console.error("Error en geocoding:", error)
      return null
    }
  }

  // Función para reverse geocoding (coordenadas -> dirección)
  const reverseGeocode = async (lat: number, lng: number): Promise<string | null> => {
    try {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
      if (!apiKey) return null

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
      )
      
      const data = await response.json()
      
      if (data.status === 'OK' && data.results && data.results.length > 0) {
        return data.results[0].formatted_address
      }
      
      return null
    } catch (error) {
      console.error("Error en reverse geocoding:", error)
      return null
    }
  }

  // Manejar cambios en el campo de dirección
  const handleAddressChange = (address: string) => {
    setFormData((prev) => ({ ...prev, direccion: address }))
  }

  // Manejar coordenadas obtenidas del autocomplete
  const handleAddressCoordinates = (newCoordinates: { lat: number; lng: number }) => {
    setCoordinates(newCoordinates)
  }

  // Manejar clics en el mapa
  const handleMapPositionChange = async (newPosition: { lat: number; lng: number }) => {
    setCoordinates(newPosition)
    setMarkerPosition(newPosition)
    
    // Obtener la dirección correspondiente a las coordenadas
    const address = await reverseGeocode(newPosition.lat, newPosition.lng)
    if (address) {
      setFormData((prev) => ({ ...prev, direccion: address }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      let lat: number
      let lng: number

      // Si tenemos coordenadas, usarlas directamente
      if (coordinates) {
        lat = coordinates.lat
        lng = coordinates.lng
      } else if (formData.direccion.trim()) {
        // Si solo tenemos dirección, geocodificarla
        const coords = await geocodeAddress(formData.direccion)
        if (!coords) {
          alert("No se pudo obtener las coordenadas de la dirección proporcionada")
          setIsLoading(false)
          return
        }
        lat = coords.lat
        lng = coords.lng
      } else {
        alert("Por favor, ingresa una dirección o selecciona una ubicación en el mapa")
        setIsLoading(false)
        return
      }

      // Validar que las coordenadas estén en rangos válidos
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
              Ingresa la dirección de tu negocio o selecciona una ubicación en el mapa para evaluar su viabilidad comercial.
            </p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-6">
              <div className="space-y-4">
                <label className="text-sm font-medium">Ubicación del negocio</label>

                <GoogleMapsWrapper>
                  {/* Campo de dirección con autocomplete */}
                  <div className="space-y-2">
                    <label htmlFor="direccion" className="text-sm font-medium">
                      Dirección
                    </label>
                    <AddressAutocomplete
                      value={formData.direccion}
                      onChange={handleAddressChange}
                      onCoordinatesChange={handleAddressCoordinates}
                      disabled={isLoading}
                      placeholder="Ej: Av. Corrientes 1000, CABA, Argentina"
                    />
                    <p className="text-xs text-gray-500">
                      Escribe y selecciona la dirección de tu negocio desde las sugerencias
                    </p>
                  </div>

                  {/* MAP COMPONENT INTEGRATION */}
                  <div className="mt-4">
                    <label className="text-sm font-medium">O selecciona directamente en el mapa:</label>
                    <div className="mt-2 rounded-md border border-gray-300 overflow-hidden">
                      <MapComponent
                        position={markerPosition}
                        onPositionChange={handleMapPositionChange}
                        mapHeight="300px"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Haz clic en el mapa para seleccionar una ubicación. La dirección se completará automáticamente.
                    </p>
                  </div>
                </GoogleMapsWrapper>
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
