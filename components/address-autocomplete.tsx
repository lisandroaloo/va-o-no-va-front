"use client"

import React, { useRef } from 'react'
import { Autocomplete } from '@react-google-maps/api'

interface AddressAutocompleteProps {
  value: string
  onChange: (address: string) => void
  onCoordinatesChange: (coordinates: { lat: number; lng: number }) => void
  disabled?: boolean
  placeholder?: string
  className?: string
}

export function AddressAutocomplete({
  value,
  onChange,
  onCoordinatesChange,
  disabled = false,
  placeholder = "Ingresa la dirección del negocio...",
  className = ""
}: AddressAutocompleteProps) {
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const handlePlaceSelect = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace()
      
      // Validar que el objeto place existe y tiene las propiedades necesarias
      if (!place) {
        console.warn('No se obtuvo información del lugar seleccionado')
        return
      }
      
      // Actualizar la dirección si está disponible
      if (place.formatted_address) {
        onChange(place.formatted_address)
      } else if (place.name) {
        // Fallback al nombre del lugar si no hay formatted_address
        onChange(place.name)
      }
      
      // Actualizar las coordenadas si están disponibles
      if (place.geometry?.location) {
        const lat = place.geometry.location.lat()
        const lng = place.geometry.location.lng()
        onCoordinatesChange({ lat, lng })
      } else {
        console.warn('No se obtuvieron coordenadas para el lugar seleccionado')
      }
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
  }

  return (
    <Autocomplete
      onLoad={(autocomplete) => {
        autocompleteRef.current = autocomplete
      }}
      onPlaceChanged={handlePlaceSelect}
      options={{
        types: ['address'],
        componentRestrictions: { country: ['ar', 'uy', 'cl', 'br', 'py'] }, // Región sudamericana
        fields: ['formatted_address', 'name', 'geometry', 'place_id'], // Especificar qué campos necesitamos
      }}
    >
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed ${className}`}
      />
    </Autocomplete>
  )
} 