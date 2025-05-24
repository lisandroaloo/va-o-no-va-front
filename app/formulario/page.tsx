"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { PageLayout } from "@/components/page-layout"

export default function FormularioPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    latitud: "",
    longitud: "",
    tipoComercio: "",
    presupuesto: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Calcular un puntaje simple basado en los datos ingresados
    // En una aplicación real, esto sería un algoritmo más complejo
    const score = Math.floor(Math.random() * 100) + 1

    // Navegar a la página de resultados con los datos del formulario
    router.push(
      `/resultado?score=${score}&latitud=${encodeURIComponent(formData.latitud)}&longitud=${encodeURIComponent(formData.longitud)}&tipo=${encodeURIComponent(formData.tipoComercio)}&presupuesto=${encodeURIComponent(formData.presupuesto)}`,
    )
  }

  return (
    <PageLayout>
      <div className="flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-3xl bg-white rounded-lg border shadow-sm">
          <div className="p-6 border-b">
            <h2 className="text-2xl font-bold">Análisis de viabilidad comercial</h2>
            <p className="text-gray-600 mt-2">
              Ingresa las coordenadas, tipo de comercio y presupuesto para evaluar la viabilidad de tu negocio.
            </p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <label htmlFor="latitud" className="text-sm font-medium">
                  Latitud
                </label>
                <input
                  id="latitud"
                  name="latitud"
                  type="number"
                  step="any"
                  placeholder="Ej: -34.6037"
                  value={formData.latitud}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
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
                  placeholder="Ej: -58.3816"
                  value={formData.longitud}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Selecciona el tipo de comercio</option>
                  <option value="cafe">☕ Café</option>
                  <option value="restaurante">🍽️ Restaurante</option>
                  <option value="kiosco">🏪 Kiosco</option>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="p-6 border-t flex justify-between">
              <Link href="/">
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  ← Volver
                </button>
              </Link>
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
              >
                Analizar viabilidad
              </button>
            </div>
          </form>
        </div>
      </div>
    </PageLayout>
  )
}
