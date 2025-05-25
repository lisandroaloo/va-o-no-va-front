import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validar que todos los campos requeridos estén presentes
    const { latitude, longitude, businessType, budget } = body

    if (typeof latitude !== "number" || typeof longitude !== "number") {
      return NextResponse.json({ error: "Latitude and longitude must be numbers" }, { status: 400 })
    }

    if (!businessType || typeof businessType !== "string") {
      return NextResponse.json({ error: "Business type is required" }, { status: 400 })
    }

    if (typeof budget !== "number" || budget <= 0) {
      return NextResponse.json({ error: "Budget must be a positive number" }, { status: 400 })
    }

    // Validar rangos de coordenadas
    if (latitude < -90 || latitude > 90) {
      return NextResponse.json({ error: "Latitude must be between -90 and 90" }, { status: 400 })
    }

    if (longitude < -180 || longitude > 180) {
      return NextResponse.json({ error: "Longitude must be between -180 and 180" }, { status: 400 })
    }

    // Verificar que las variables de entorno estén configuradas
    const BACKEND_URL = "http://localhost:8080"

    if (!BACKEND_URL) {
      console.error("BACKEND_URL environment variable is not set")
      return NextResponse.json({ error: "Configuración del servidor incompleta" }, { status: 500 })
    }

    // Preparar datos para enviar a tu backend
    const requestData = {
      latitude,
      longitude,
      businessType,
      budget,
    }

    // Preparar headers
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }

    console.log(`Making request to: ${BACKEND_URL}/api/analyze`)

    // Hacer la llamada a tu backend externo con timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 segundos timeout

    try {
      const backendResponse = await fetch(`${BACKEND_URL}/api/analyze`, {
        method: "POST",
        headers,
        body: JSON.stringify(requestData),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!backendResponse.ok) {
        const errorText = await backendResponse.text()
        console.error(`Backend error: ${backendResponse.status} ${backendResponse.statusText}`, errorText)

        if (backendResponse.status === 401) {
          return NextResponse.json({ error: "Error de autenticación con el servidor de análisis" }, { status: 500 })
        }

        if (backendResponse.status === 404) {
          return NextResponse.json({ error: "Endpoint de análisis no encontrado" }, { status: 500 })
        }

        return NextResponse.json({ error: "Error al procesar el análisis en el servidor" }, { status: 500 })
      }

      const backendData = await backendResponse.json()
      console.log("Backend response:", backendData)

      // Validar que la respuesta del backend tenga la estructura esperada
      if (
        typeof backendData.risk_score !== "number" ||
        typeof backendData.viability_score !== "number" ||
        typeof backendData.competition_score !== "number"
      ) {
        console.error("Invalid backend response structure:", backendData)
        return NextResponse.json({ error: "Respuesta inválida del servidor de análisis" }, { status: 500 })
      }

      // Retornar los datos del backend
      return NextResponse.json({
        risk_score: backendData.risk_score,
        viability_score: backendData.viability_score,
        competition_score: backendData.competition_score,
        recommendations: Array.isArray(backendData.recommendations) ? backendData.recommendations : [],
      })
    } catch (fetchError) {
      clearTimeout(timeoutId)

      if (fetchError instanceof Error && fetchError.name === "AbortError") {
        console.error("Request timeout")
        return NextResponse.json({ error: "Timeout: El análisis está tomando demasiado tiempo" }, { status: 504 })
      }

      throw fetchError
    }
  } catch (error) {
    console.error("Error connecting to backend:", error)

    // Verificar si es un error de conexión
    if (error instanceof TypeError && error.message.includes("fetch")) {
      return NextResponse.json(
        {
          error: "No se pudo conectar con el servidor de análisis. Verifica tu conexión.",
        },
        { status: 503 },
      )
    }

    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
