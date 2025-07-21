"use client"

import type React from "react"

import { useState, useEffect, useCallback, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { PageLayout } from "@/components/page-layout"
import usePostIdea from "@/hooks/usePostIdea"
import MapComponent from "@/components/map"
import { AddressAutocomplete } from "@/components/address-autocomplete"
import { GoogleMapsWrapper } from "@/components/google-maps-wrapper"


export default function FormularioPage() {
  const router = useRouter()
  // No longer need local isLoading, the hook will provide it.
  const [formData, setFormData] = useState({
    direccion: "",
    latitud: "",
    longitud: "",
    tipoComercio: "",
    presupuesto: "",
    descripcion: "",
  })
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null)
  const [markerPosition, setMarkerPosition] = useState<{ lat: number; lng: number } | null>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [lastAutocompleteAddress, setLastAutocompleteAddress] = useState<string>("");

  // Use the new function from the hook
  const { loading: isSubmitting, error, postIdeaAndNavigate } = usePostIdea()

  // An effect to show errors from the hook
  useEffect(() => {
    // We get an error message from the URL if the fetch fails in the background
    const params = new URLSearchParams(window.location.search)
    const urlError = params.get("error")
    if (urlError) {
      alert(`Error en el análisis: ${decodeURIComponent(urlError)}. Por favor, intente de nuevo.`)
      // Clean up the URL
      router.replace("/formulario", { scroll: false })
    }

    if (error) {
      alert(`Error: ${error}`)
    }
  }, [error, router])

  // Función para actualizar el marcador del mapa
  const updateMarkerPosition = useCallback(() => {
    if (coordinates) {
      setMarkerPosition(coordinates);
    } else {
      setMarkerPosition(null);
    }
  }, [coordinates]);

  // Efecto para actualizar marcador cuando cambian las coordenadas
  useEffect(() => {
    updateMarkerPosition();
  }, [updateMarkerPosition]);

  // Limpiar timeout al desmontar el componente
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

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
    
    // Si la dirección cambió respecto a la del autocomplete, limpiar coordenadas
    if (lastAutocompleteAddress && address !== lastAutocompleteAddress) {
      setCoordinates(null);
      setLastAutocompleteAddress("");
    }
    
    // Limpiar el timeout anterior si existe
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    // Solo hacer geocodificación si hay texto y no está vacío
    if (address.trim().length > 3) {
      debounceTimeoutRef.current = setTimeout(async () => {
        try {
          const coords = await geocodeAddress(address.trim());
          if (coords) {
            setCoordinates(coords);
            setFormData((prev) => ({
              ...prev,
              latitud: coords.lat.toFixed(6),
              longitud: coords.lng.toFixed(6),
            }));
          }
        } catch (error) {
          console.error("Error en geocodificación automática:", error);
        }
      }, 1500); // Esperar 1.5 segundos después de que el usuario deje de escribir
    }
  }

  // Manejar coordenadas obtenidas del autocomplete
  const handleAddressCoordinates = useCallback((newCoordinates: { lat: number; lng: number }) => {
    setCoordinates(newCoordinates);
    setLastAutocompleteAddress(formData.direccion); // Guardar la dirección del autocomplete
    // Actualizar también los campos internos para el formulario
    setFormData((prev) => ({
      ...prev,
      latitud: newCoordinates.lat.toFixed(6),
      longitud: newCoordinates.lng.toFixed(6),
    }));
  }, [formData.direccion]);

  // Manejar clics en el mapa
  const handleMapPositionChange = useCallback(async (newPosition: { lat: number; lng: number }) => {
    setCoordinates(newPosition);
    
    // Actualizar campos manuales
    setFormData((prev) => ({
      ...prev,
      latitud: newPosition.lat.toFixed(6),
      longitud: newPosition.lng.toFixed(6),
    }));
    
    // Obtener la dirección correspondiente a las coordenadas
    const address = await reverseGeocode(newPosition.lat, newPosition.lng);
    if (address) {
      setFormData((prev) => ({ ...prev, direccion: address }));
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // The hook will set its own loading state. No need for setIsLoading here.

    let lat: number
    let lng: number

    // Priority 1: Use coordinates from map click or autocomplete
    if (coordinates) {
      lat = coordinates.lat
      lng = coordinates.lng
    }
    // Priority 2: Geocode address from input if no coordinates are set
    else if (formData.direccion.trim()) {
      const coords = await geocodeAddress(formData.direccion)
      if (!coords) {
        alert("No se pudo obtener las coordenadas de la dirección proporcionada. Verifique que sea válida.")
        return
      }
      lat = coords.lat
      lng = coords.lng
    } else {
      alert("Por favor, ingresa una dirección o selecciona una ubicación en el mapa.")
      return
    }

    // Basic validation
    if (!formData.tipoComercio || !formData.presupuesto) {
      alert("Por favor, completa todos los campos requeridos.")
      return
    }

    // Prepare data for the endpoint
    const requestData = {
      latitude: lat,
      longitude: lng,
      businessType: formData.tipoComercio,
      budget: Number.parseInt(formData.presupuesto),
      // The 'description' from the form is now passed correctly.
      // The hook will add this and the timestamp to the final result.
      description: formData.direccion,
    }

    // Call the new function. It will handle navigation and background fetching.
    postIdeaAndNavigate(requestData, router)
  }

  return (
    <PageLayout>
      <div className="flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-3xl bg-white rounded-lg border shadow-sm">
          <div className="p-6 border-b">
            <h2 className="text-2xl font-bold">Análisis de viabilidad comercial</h2>
            <p className="text-gray-600 mt-2">
              Ingresa la dirección de tu negocio o coordenadas específicas para evaluar su viabilidad comercial.
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
                      disabled={isSubmitting}
                      placeholder="Av Corrientes 1232, Ciudad Autónoma de Buenos Aires"
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
                      Haz clic en el mapa para seleccionar una ubicación. La dirección y coordenadas se completarán automáticamente.
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
                  disabled={isSubmitting}
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
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  suppressHydrationWarning={true}
                />
                <p className="text-xs text-gray-500">Ingresa tu presupuesto inicial disponible</p>
              </div>
              <div className="space-y-2">
                <label htmlFor="descripcion" className="text-sm font-medium">
                  Descripción
                </label>
                <input
                  id="descripcion"
                  name="descripcion"
                  type="text"
                  placeholder="Quiero abrir un café con tematica de Star Wars y platillos veganos"
                  value={formData.descripcion}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  suppressHydrationWarning={true}
                />
                <p className="text-xs text-gray-500">Ingresa una breve descripción de tu negocio y que lo hace unico</p>
              </div>
            </div>
            <div className="p-6 border-t flex justify-between">
              <Link href="/">
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                  suppressHydrationWarning={true}
                >
                  ← Volver
                </button>
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                suppressHydrationWarning={true}
              >
                {isSubmitting ? (
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
