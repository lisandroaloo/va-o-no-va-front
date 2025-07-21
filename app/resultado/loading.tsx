"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { PageLayout } from "@/components/page-layout"

const loadingMessages = [
  { text: "Iniciando análisis de ubicación...", icon: "🚀", duration: 4000 },
  { text: "Estamos analizando los alrededores..", icon: "🔍", duration: 5000 },
  { text: "Revisando el flujo peatonal de la zona", icon: "🚶‍♂️", duration: 4500 },
  { text: "Estamos analizando las reseñas de la competencia..", icon: "⭐", duration: 5500 },
  { text: "Calculando densidad poblacional", icon: "👥", duration: 4000 },
  { text: "Evaluando poder adquisitivo del área", icon: "💰", duration: 4500 },
  { text: "Estamos analizando todo con Inteligencia Artificial", icon: "🧠", duration: 6000 },
  { text: "Procesando datos de ubicaciones similares", icon: "📊", duration: 4500 },
  { text: "Tenes un local bueno cerca creo, dejame que lo checkeo", icon: "🏪", duration: 5000 },
  { text: "Analizando factores de riesgo", icon: "⚠️", duration: 4000 },
  { text: "Generando recomendaciones personalizadas", icon: "💡", duration: 5000 },
  { text: "Casi terminamos, preparando tu reporte...", icon: "📋", duration: 4000 },
  { text: "¡Listo! Redirigiendo a tus resultados", icon: "✅", duration: 2000 },
]

export default function LoadingScreen() {
  const router = useRouter()
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [isVisible, setIsVisible] = useState(true)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])

  // Efecto SEPARADO para el progreso continuo - SIN dependencias que lo reinicien
  useEffect(() => {
    let progressInterval: NodeJS.Timeout
    let totalElapsed = 0
    const totalDuration = 60000 // 1 minuto

    // Actualizar progreso cada 100ms de forma continua
    progressInterval = setInterval(() => {
      totalElapsed += 100
      const newProgress = Math.min((totalElapsed / totalDuration) * 100, 100)
      setProgress(newProgress)

      // Activar pasos basándose en el progreso
      const newCompletedSteps: number[] = []
      if (newProgress >= 25) newCompletedSteps.push(0) // Ubicación
      if (newProgress >= 50) newCompletedSteps.push(1) // Competencia
      if (newProgress >= 75) newCompletedSteps.push(2) // IA
      if (newProgress >= 95) newCompletedSteps.push(3) // Reporte

      setCompletedSteps(newCompletedSteps)

      if (totalElapsed >= totalDuration) {
        clearInterval(progressInterval)
        setTimeout(() => {
          router.push("/resultado")
        }, 500)
      }
    }, 100)

    return () => {
      clearInterval(progressInterval)
    }
  }, [router]) // Solo depende del router

  // Efecto SEPARADO para los mensajes
  useEffect(() => {
    let messageTimeout: NodeJS.Timeout

    // Función para mostrar el siguiente mensaje
    const showNextMessage = () => {
      if (currentMessageIndex < loadingMessages.length - 1) {
        setIsVisible(false)

        setTimeout(() => {
          setCurrentMessageIndex((prev) => prev + 1)
          setIsVisible(true)
        }, 400)

        messageTimeout = setTimeout(showNextMessage, loadingMessages[currentMessageIndex + 1]?.duration || 4000)
      }
    }

    // Iniciar con el primer mensaje
    if (currentMessageIndex < loadingMessages.length - 1) {
      messageTimeout = setTimeout(showNextMessage, loadingMessages[currentMessageIndex].duration)
    }

    return () => {
      clearTimeout(messageTimeout)
    }
  }, [currentMessageIndex]) // Solo depende del índice del mensaje

  const currentMessage = loadingMessages[currentMessageIndex]

  const steps = [
    { name: "Ubicación", icon: "📍" },
    { name: "Competencia", icon: "🏢" },
    { name: "IA", icon: "🧠" },
    { name: "Reporte", icon: "📋" },
  ]

  return (
    <PageLayout>
      <div className="flex items-center justify-center min-h-[80vh] p-4">
        <div className="w-full max-w-4xl relative">
          {/* Contenedor principal estilo Discord - MÁS GRANDE */}
          <div className="bg-white rounded-lg border shadow-lg p-10">
            {/* Header */}
            <div className="text-center mb-10">
              <h1 className="text-3xl font-bold text-gray-900 mb-3">Analizando tu ubicación</h1>
              <p className="text-lg text-gray-600">
                Nuestro modelo de IA está procesando todos los datos para darte el mejor análisis
              </p>
            </div>

            {/* Área de mensaje principal con animaciones mejoradas - MÁS GRANDE */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-10 mb-8 min-h-[160px] flex items-center justify-center relative overflow-hidden">
              {/* Efecto de fondo animado */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 animate-pulse"></div>

              <div
                className={`text-center relative z-10 transition-all duration-500 ease-out transform ${
                  isVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-4 scale-95"
                }`}
              >
                {/* Icono con animación mejorada */}
                <div className="relative mb-6">
                  <div className="text-6xl transform transition-all duration-700 hover:scale-110">
                    {currentMessage.icon}
                  </div>
                  {/* Círculo de fondo animado */}
                  <div className="absolute inset-0 -m-3 rounded-full bg-gradient-to-r from-blue-400/20 to-purple-400/20 animate-ping"></div>
                </div>

                {/* Mensaje con efecto de escritura */}
                <div className="relative">
                  <p className="text-2xl text-gray-800 font-medium leading-relaxed">{currentMessage.text}</p>
                  {/* Cursor parpadeante */}
                  <span className="inline-block w-0.5 h-7 bg-blue-500 ml-1 animate-pulse"></span>
                </div>

                {/* Partículas decorativas */}
                <div className="absolute -top-2 -right-2 w-2 h-2 bg-blue-400 rounded-full animate-bounce opacity-60"></div>
                <div
                  className="absolute -bottom-2 -left-2 w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce opacity-60"
                  style={{ animationDelay: "0.5s" }}
                ></div>
              </div>
            </div>

            {/* Barra de progreso con animación de salto vertical */}
            <div className="mb-10 flex justify-center">
              <div className="w-full max-w-2xl">
                <div className="w-full bg-gray-200 rounded-full h-5 shadow-inner animate-bounce-subtle">
                  <div
                    className="bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600 h-5 rounded-full transition-all duration-300 ease-out relative overflow-hidden"
                    style={{ width: `${progress}%` }}
                  >
                    {/* Efecto de brillo que se mueve */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Indicadores de estado mejorados con checkmarks - MUCHO MÁS GRANDES */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {steps.map((step, index) => {
                const isCompleted = completedSteps.includes(index)
                const isActive = !isCompleted && (index === 0 ? progress >= 5 : completedSteps.includes(index - 1))

                return (
                  <div
                    key={index}
                    className={`flex flex-col items-center gap-4 p-6 rounded-xl transition-all duration-500 transform ${
                      isCompleted
                        ? "bg-green-50 border-2 border-green-200 scale-105 shadow-md"
                        : isActive
                          ? "bg-blue-50 border-2 border-blue-200 animate-pulse"
                          : "bg-gray-50 border-2 border-gray-200"
                    }`}
                  >
                    {/* Icono del paso más grande */}
                    <div className="text-3xl mb-2">{step.icon}</div>

                    {/* Estado del paso */}
                    <div className="relative">
                      {isCompleted ? (
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center transform transition-all duration-300">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      ) : (
                        <div
                          className={`w-8 h-8 rounded-full transition-all duration-500 flex items-center justify-center ${
                            isActive ? "bg-blue-500 animate-pulse shadow-lg" : "bg-gray-300"
                          }`}
                        >
                          {isActive && <div className="w-3 h-3 bg-white rounded-full animate-ping"></div>}
                        </div>
                      )}
                    </div>

                    {/* Nombre del paso */}
                    <span
                      className={`text-base font-semibold text-center transition-colors duration-300 ${
                        isCompleted ? "text-green-700" : isActive ? "text-blue-700" : "text-gray-600"
                      }`}
                    >
                      {step.name}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Footer con información adicional */}
            <div className="pt-8 border-t border-gray-200">
              <div className="flex items-center justify-center gap-4 text-base text-gray-500">
                <div className="relative">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
                  <div className="absolute inset-0 rounded-full border-2 border-blue-200 animate-ping"></div>
                </div>
                <span className="font-medium">Procesando con tecnología de vanguardia...</span>
              </div>
            </div>
          </div>

          {/* Elementos decorativos flotantes mejorados */}
          <div className="absolute top-16 left-8 animate-float opacity-30">
            <div className="text-4xl filter drop-shadow-lg">🏪</div>
          </div>
          <div className="absolute top-24 right-12 animate-float-delayed opacity-30">
            <div className="text-4xl filter drop-shadow-lg">📊</div>
          </div>
          <div className="absolute bottom-16 left-16 animate-float opacity-30">
            <div className="text-4xl filter drop-shadow-lg">🧠</div>
          </div>
          <div className="absolute bottom-24 right-8 animate-float-delayed opacity-30">
            <div className="text-3xl filter drop-shadow-lg">⭐</div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
