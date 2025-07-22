"use client"

import { useEffect, useState } from "react"
import { PageLayout } from "@/components/page-layout"
import {
  Building2,
  Store,
  Coffee,
  Users,
  TrendingUp,
  MapPin,
  Car,
  ShoppingBag,
  Utensils,
  BarChart3,
  CheckCircle2,
  Loader2,
} from "lucide-react"

interface LoadingScreenProps {
  businessType?: string
  address?: string
  onComplete?: () => void
  duration?: number
}

export default function LoadingScreen({
  businessType = "comercio",
  address = "la ubicación seleccionada",
  onComplete,
  duration = 6000,
}: LoadingScreenProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [currentCityIcon, setCurrentCityIcon] = useState(0)

  const steps = [
    {
      title: "Analizando ubicación seleccionada",
      description: "Procesando coordenadas y características del área",
      icon: MapPin,
    },
    {
      title: "Evaluando competencia cercana",
      description: "Identificando negocios similares en un radio de 500m",
      icon: Store,
    },
    {
      title: "Calculando tráfico peatonal",
      description: "Estimando flujo de personas y horarios pico",
      icon: Users,
    },
    {
      title: "Analizando demografía local",
      description: "Estudiando perfil socioeconómico del área",
      icon: BarChart3,
    },
    {
      title: "Evaluando accesibilidad",
      description: "Analizando transporte público y estacionamiento",
      icon: Car,
    },
    {
      title: "Estimando rentabilidad",
      description: "Calculando proyecciones financieras y ROI",
      icon: TrendingUp,
    },
    {
      title: "Generando reporte final",
      description: "Compilando análisis completo de viabilidad",
      icon: CheckCircle2,
    },
  ]

  const cityIcons = [Building2, Store, Coffee, Utensils, ShoppingBag, Users]

  const getBusinessTypeIcon = () => {
    switch (businessType?.toLowerCase()) {
      case "cafe":
        return Coffee
      case "restaurant":
        return Utensils
      case "convenience_store":
        return Store
      default:
        return Store
    }
  }

  const BusinessIcon = getBusinessTypeIcon()

  useEffect(() => {
    const stepDuration = duration / steps.length

    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < steps.length - 1) {
          return prev + 1
        } else {
          clearInterval(stepInterval)
          if (onComplete) {
            setTimeout(onComplete, 800)
          }
          return prev
        }
      })
    }, stepDuration)

    return () => clearInterval(stepInterval)
  }, [duration, steps.length, onComplete])

  useEffect(() => {
    const iconInterval = setInterval(() => {
      setCurrentCityIcon((prev) => (prev + 1) % cityIcons.length)
    }, 800)

    return () => clearInterval(iconInterval)
  }, [cityIcons.length])

  const CurrentCityIcon = cityIcons[currentCityIcon]

  return (
    <PageLayout>
      <div className="flex items-center justify-center p-4 md:p-8 min-h-[calc(100vh-200px)]">
        <div className="w-full max-w-3xl bg-white rounded-lg border shadow-sm">
          {/* Header */}
          <div className="p-6 border-b">
            <div className="flex items-center justify-center mb-4">
              {/* Animated City Skyline */}
              <div className="relative">
                <div className="flex items-end space-x-1 mb-4">
                  {/* Buildings with different heights */}
                  <div className="w-8 h-12 bg-gray-300 rounded-t-sm animate-pulse delay-100"></div>
                  <div className="w-6 h-16 bg-gray-400 rounded-t-sm animate-pulse delay-200"></div>
                  <div className="w-10 h-20 bg-gray-900 rounded-t-sm animate-pulse delay-300 flex items-center justify-center">
                    <BusinessIcon className="w-5 h-5 text-white animate-bounce" />
                  </div>
                  <div className="w-7 h-14 bg-gray-500 rounded-t-sm animate-pulse delay-400"></div>
                  <div className="w-9 h-18 bg-gray-300 rounded-t-sm animate-pulse delay-500"></div>
                </div>

                {/* Floating city icon */}
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center border-2 border-gray-200 animate-bounce">
                    <CurrentCityIcon className="w-6 h-6 text-gray-600" />
                  </div>
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-center">Análisis de viabilidad comercial</h2>
            <p className="text-gray-600 mt-2 text-center">
              Evaluando la viabilidad de tu <span className="font-medium">{businessType}</span> en{" "}
              <span className="font-medium">{address}</span>
            </p>
          </div>

          {/* Progress Steps */}
          <div className="p-6">
            <div className="space-y-4 mb-6">
              {steps.map((step, index) => {
                const StepIcon = step.icon
                const isCompleted = index < currentStep
                const isCurrent = index === currentStep
                const isUpcoming = index > currentStep

                return (
                  <div
                    key={index}
                    className={`flex items-start space-x-4 p-4 rounded-lg transition-all duration-500 ${
                      isCurrent
                        ? "bg-gray-50 border-l-4 border-gray-900 transform scale-105"
                        : isCompleted
                          ? "bg-green-50 border-l-4 border-green-500"
                          : "bg-gray-50 opacity-60"
                    }`}
                  >
                    <div
                      className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isCompleted
                          ? "bg-green-500 text-white"
                          : isCurrent
                            ? "bg-gray-900 text-white animate-pulse"
                            : "bg-gray-200 text-gray-400"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 animate-bounce" />
                      ) : isCurrent ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <StepIcon className="w-5 h-5" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3
                        className={`text-sm font-medium transition-colors duration-300 ${
                          isCurrent || isCompleted ? "text-gray-900" : "text-gray-500"
                        }`}
                      >
                        {step.title}
                      </h3>
                      <p
                        className={`text-xs mt-1 transition-colors duration-300 ${
                          isCurrent || isCompleted ? "text-gray-600" : "text-gray-400"
                        }`}
                      >
                        {step.description}
                      </p>
                    </div>

                    {isCurrent && (
                      <div className="flex space-x-1">
                        {[0, 1, 2].map((i) => (
                          <div
                            key={i}
                            className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: `${i * 0.1}s` }}
                          ></div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progreso del análisis</span>
                <span>{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gray-900 h-3 rounded-full transition-all duration-700 ease-out relative overflow-hidden"
                  style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"></div>
                </div>
              </div>
            </div>

            {/* Status Message */}
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-600 text-sm">
                {currentStep < steps.length - 1
                  ? "Analizando datos en tiempo real..."
                  : "¡Análisis completado! Preparando resultados..."}
              </p>
              <div className="flex justify-center mt-2 space-x-1">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
