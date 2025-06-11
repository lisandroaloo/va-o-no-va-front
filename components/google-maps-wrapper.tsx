"use client"

import React from 'react'
import { LoadScript } from '@react-google-maps/api'

const libraries: ("places" | "geometry" | "drawing" | "visualization")[] = ['places']

interface GoogleMapsWrapperProps {
  children: React.ReactNode
}

export function GoogleMapsWrapper({ children }: GoogleMapsWrapperProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  if (!apiKey) {
    return (
      <div className="p-4 border border-red-300 bg-red-50 rounded-md">
        <p className="text-red-600 text-sm">
          Error: La clave API de Google Maps no está configurada.
        </p>
      </div>
    )
  }

  return (
    <LoadScript 
      googleMapsApiKey={apiKey} 
      libraries={libraries}
    >
      {children}
    </LoadScript>
  )
} 