import { AnalysisData } from "@/app/resultado/page"
import { type NextRequest, NextResponse } from "next/server"

interface CompetitionData {
  oneStar: number
  twoStar: number
  threeStar: number
  fourStar: number
  fiveStar: number
}

export async function POST(request: NextRequest) {
  try {
    const analysisData: AnalysisData = await request.json()

    // Validar que tenemos todos los datos necesarios
    if (!analysisData || typeof analysisData !== "object") {
      return NextResponse.json({ error: "Datos de análisis inválidos" }, { status: 400 })
    }

    // Función para obtener interpretación de scores
    const getScoreInterpretation = (score: number, type: string) => {
      if (type === "risk") {
        if (score <= 30) return "Bajo riesgo"
        if (score <= 60) return "Riesgo moderado"
        return "Alto riesgo"
      } else if (type === "viability") {
        if (score >= 70) return "Alta viabilidad"
        if (score >= 40) return "Viabilidad moderada"
        return "Baja viabilidad"
      }
      return ""
    }

    // Función para obtener emoji del tipo de comercio
    const getComercioEmoji = (businessType: string) => {
      const emojis: Record<string, string> = {
        cafe: "☕",
        restaurante: "🍽️",
        kiosco: "🏪",
      }
      return emojis[businessType] || "🏪"
    }

    // Calcular total de comercios similares
    const totalNearbyBusinesses = analysisData.competition
      ? analysisData.competition.oneStar +
        analysisData.competition.twoStar +
        analysisData.competition.threeStar +
        analysisData.competition.fourStar +
        analysisData.competition.fiveStar
      : 0

    // Función para obtener interpretación de competencia
    const getCompetitionInterpretation = (totalBusinesses: number) => {
      if (totalBusinesses === 0) return "Sin competencia directa"
      if (totalBusinesses <= 3) return "Competencia baja"
      if (totalBusinesses <= 8) return "Competencia moderada"
      return "Competencia alta"
    }


    const getName = (name: String) => {
      if (name === "convenience_store") return "kiosco"
      if (name === "cafe") return "café"
      if (name === "restaurant") return "restaurante"
    }

    // Calcular calificación promedio de competidores
    const calculateAverageRating = (competition: CompetitionData) => {
      const total =
        competition.oneStar + competition.twoStar + competition.threeStar + competition.fourStar + competition.fiveStar
      if (total === 0) return 0

      const weightedSum =
        competition.oneStar * 1 +
        competition.twoStar * 2 +
        competition.threeStar * 3 +
        competition.fourStar * 4 +
        competition.fiveStar * 5

      return (weightedSum / total).toFixed(1)
    }

    const averageRating = calculateAverageRating(analysisData.competition)

    // Determinar estado general
    const getOverallStatus = (viabilityScore: number) => {
      if (viabilityScore >= 70) return { message: "Proyecto recomendado", icon: "✅" }
      if (viabilityScore >= 40) return { message: "Proyecto con potencial", icon: "⚠️" }
      return { message: "Proyecto no recomendado", icon: "❌" }
    }

    const overallStatus = getOverallStatus(analysisData.viabilityScore)
    const currentDate = new Date().toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })

    // Crear el contenido HTML del PDF
    const htmlContent = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reporte de Viabilidad Comercial</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.4;
                color: #333;
                background: #fff;
                font-size: 12px;
            }
            
            .container {
                max-width: 100%;
                margin: 0 auto;
                padding: 20px;
            }
            
            .header {
                text-align: center;
                margin-bottom: 25px;
                border-bottom: 2px solid #e5e7eb;
                padding-bottom: 15px;
                page-break-inside: avoid;
            }
            
            .header h1 {
                font-size: 22px;
                color: #1f2937;
                margin-bottom: 8px;
            }
            
            .header .subtitle {
                font-size: 14px;
                color: #6b7280;
                margin-bottom: 8px;
            }
            
            .header .date {
                font-size: 12px;
                color: #9ca3af;
            }
            
            .status-section {
                background: #f9fafb;
                border: 1px solid #e5e7eb;
                border-radius: 6px;
                padding: 15px;
                margin-bottom: 20px;
                text-align: center;
                page-break-inside: avoid;
            }
            
            .status-icon {
                font-size: 32px;
                margin-bottom: 8px;
            }
            
            .status-message {
                font-size: 18px;
                font-weight: bold;
                color: ${analysisData.viabilityScore >= 70 ? "#059669" : analysisData.viabilityScore >= 40 ? "#d97706" : "#dc2626"};
                margin-bottom: 8px;
            }
            
            .status-description {
                color: #6b7280;
                font-size: 12px;
            }
            
            .section-title {
                font-size: 16px;
                font-weight: bold;
                color: #1f2937;
                margin-bottom: 15px;
                border-bottom: 1px solid #e5e7eb;
                padding-bottom: 8px;
            }
            
            .metrics-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 15px;
                margin-bottom: 20px;
                page-break-inside: avoid;
            }
            
            .metric-card {
                border: 1px solid #e5e7eb;
                border-radius: 6px;
                padding: 15px;
                background: #fff;
            }
            
            .metric-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 10px;
            }
            
            .metric-title {
                font-weight: 600;
                color: #374151;
                font-size: 12px;
            }
            
            .metric-score {
                font-weight: bold;
                font-size: 16px;
                color: #1f2937;
            }
            
            .metric-bar {
                width: 100%;
                height: 6px;
                background: #e5e7eb;
                border-radius: 3px;
                overflow: hidden;
                margin-bottom: 8px;
            }
            
            .metric-fill {
                height: 100%;
                border-radius: 3px;
            }
            
            .metric-interpretation {
                font-size: 10px;
                color: #6b7280;
                font-style: italic;
            }
            
            .competition-section {
                margin-bottom: 20px;
                page-break-inside: avoid;
            }
            
            .competition-summary {
                background: #eff6ff;
                border: 1px solid #bfdbfe;
                border-radius: 6px;
                padding: 15px;
                margin-bottom: 15px;
            }
            
            .competition-stats {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
                gap: 10px;
                margin-bottom: 10px;
            }
            
            .stat-item {
                text-align: center;
                padding: 8px;
                background: #dbeafe;
                border-radius: 4px;
            }
            
            .stat-number {
                font-size: 18px;
                font-weight: bold;
                color: #1e40af;
            }
            
            .stat-label {
                font-size: 10px;
                color: #1e40af;
                margin-top: 3px;
            }
            
            .rating-distribution {
                margin-top: 15px;
            }
            
            .rating-item {
                display: flex;
                align-items: center;
                margin-bottom: 8px;
                padding: 6px;
                background: #f8fafc;
                border-radius: 3px;
            }
            
            .rating-stars {
                width: 60px;
                font-size: 12px;
                color: #fbbf24;
            }
            
            .rating-bar {
                flex: 1;
                height: 16px;
                background: #e5e7eb;
                border-radius: 8px;
                margin: 0 8px;
                overflow: hidden;
            }
            
            .rating-fill {
                height: 100%;
                border-radius: 8px;
            }
            
            .rating-count {
                width: 50px;
                text-align: right;
                font-size: 10px;
                color: #6b7280;
            }
            
            .no-competition {
                text-align: center;
                padding: 15px;
                background: #ecfdf5;
                border: 1px solid #a7f3d0;
                border-radius: 4px;
                margin-top: 10px;
            }
            
            .no-competition-icon {
                font-size: 20px;
                margin-bottom: 8px;
            }
            
            .no-competition-title {
                color: #065f46;
                font-weight: 600;
                font-size: 14px;
            }
            
            .no-competition-text {
                color: #047857;
                font-size: 11px;
                margin-top: 4px;
            }
            
            .recommendations-section {
                margin-bottom: 20px;
                page-break-inside: avoid;
            }
            
            .recommendations-list {
                background: #eff6ff;
                border: 1px solid #bfdbfe;
                border-radius: 6px;
                padding: 15px;
            }
            
            .recommendations-list ul {
                list-style: none;
                padding: 0;
            }
            
            .recommendations-list li {
                margin-bottom: 8px;
                padding-left: 15px;
                position: relative;
                color: #1e40af;
                font-size: 11px;
                line-height: 1.4;
            }
            
            .recommendations-list li:before {
                content: "•";
                color: #3b82f6;
                font-weight: bold;
                position: absolute;
                left: 0;
            }
            
            .details-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 15px;
                page-break-inside: avoid;
            }
            
            .detail-card {
                border: 1px solid #e5e7eb;
                border-radius: 6px;
                padding: 12px;
                background: #fff;
            }
            
            .detail-header {
                display: flex;
                align-items: center;
                gap: 6px;
                margin-bottom: 8px;
            }
            
            .detail-icon {
                font-size: 14px;
            }
            
            .detail-title {
                font-weight: 600;
                color: #374151;
                font-size: 12px;
            }
            
            .detail-content {
                font-size: 10px;
                color: #6b7280;
                line-height: 1.3;
            }
            
            .footer {
                margin-top: 30px;
                padding-top: 15px;
                border-top: 1px solid #e5e7eb;
                text-align: center;
                color: #9ca3af;
                font-size: 10px;
                page-break-inside: avoid;
            }
            
            .green { background: #10b981; }
            .yellow { background: #f59e0b; }
            .red { background: #ef4444; }
            .blue { background: #3b82f6; }
            
            /* Evitar saltos de página problemáticos */
            .page-break-avoid {
                page-break-inside: avoid;
            }
            
            @media print {
                body { 
                    print-color-adjust: exact;
                    -webkit-print-color-adjust: exact;
                }
                .container { 
                    padding: 15px;
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <!-- Header -->
            <div class="header">
                <h1>📈 Reporte de Viabilidad Comercial</h1>
                <div class="subtitle">
                    Análisis de viabilidad para un ${getName(analysisData.businessType)} ${getComercioEmoji(analysisData.businessType)} en ${analysisData.address.split(",")[0]}
                </div>
                <div class="date">Generado el ${currentDate}</div>
            </div>

            <!-- Status General -->
            <div class="status-section">
                <div class="status-icon">${overallStatus.icon}</div>
                <div class="status-message">${overallStatus.message}</div>
            
            </div>

            <!-- Métricas Principales -->
            <div class="page-break-avoid">
                <h2 class="section-title">📊 Métricas de Análisis</h2>
                <div class="metrics-grid">
                    <div class="metric-card">
                        <div class="metric-header">
                            <span class="metric-title">📈 Puntuación de Viabilidad</span>
                            <span class="metric-score">${analysisData.viabilityScore}%</span>
                        </div>
                        <div class="metric-bar">
                            <div class="metric-fill ${analysisData.viabilityScore >= 70 ? "green" : analysisData.viabilityScore >= 40 ? "yellow" : "red"}" 
                                 style="width: ${analysisData.viabilityScore}%"></div>
                        </div>
                        <div class="metric-interpretation">
                            ${getScoreInterpretation(analysisData.viabilityScore, "viability")}
                        </div>
                    </div>

                    <div class="metric-card">
                        <div class="metric-header">
                            <span class="metric-title">⚠️ Puntuación de Riesgo</span>
                            <span class="metric-score">${analysisData.risk.value}%</span>
                        </div>
                        <div class="metric-bar">
                            <div class="metric-fill ${analysisData.risk.value <= 30 ? "green" : analysisData.risk.value <= 60 ? "yellow" : "red"}" 
                                 style="width: ${analysisData.risk.value}%"></div>
                        </div>
                        <div class="metric-interpretation">
                            ${getScoreInterpretation(analysisData.risk.value, "risk")}
                        </div>
                    </div>
                </div>
            </div>

            <!-- Análisis de Competencia -->
            <div class="competition-section">
                <h2 class="section-title">🏢 Análisis de Competencia</h2>
                <div class="competition-summary">
                    <div class="competition-stats">
                        <div class="stat-item">
                            <div class="stat-number">${totalNearbyBusinesses}</div>
                            <div class="stat-label">Comercios similares</div>
                        </div>
                        ${
                          totalNearbyBusinesses > 0
                            ? `
                        <div class="stat-item">
                            <div class="stat-number">${averageRating}★</div>
                            <div class="stat-label">Calificación promedio</div>
                        </div>
                        `
                            : ""
                        }
                        <div class="stat-item">
                            <div class="stat-number" style="font-size: 12px;">${getCompetitionInterpretation(totalNearbyBusinesses)}</div>
                            <div class="stat-label">Nivel de competencia</div>
                        </div>
                    </div>
                    
                    ${
                      totalNearbyBusinesses > 0
                        ? `
                    <div class="rating-distribution">
                        <h4 style="margin-bottom: 10px; color: #1e40af; font-size: 12px;">Distribución de calificaciones:</h4>
                        ${[5, 4, 3, 2, 1]
                          .map((stars) => {
                            const count =
                              analysisData.competition[
                                `${stars === 1 ? "one" : stars === 2 ? "two" : stars === 3 ? "three" : stars === 4 ? "four" : "five"}Star`
                              ] || 0
                            const percentage = totalNearbyBusinesses > 0 ? (count / totalNearbyBusinesses) * 100 : 0
                            const starDisplay = "★".repeat(stars) + "☆".repeat(5 - stars)
                            return `
                            <div class="rating-item">
                                <div class="rating-stars">${starDisplay}</div>
                                <div class="rating-bar">
                                    <div class="rating-fill ${stars >= 4 ? "green" : stars >= 3 ? "yellow" : "red"}" 
                                         style="width: ${percentage}%"></div>
                                </div>
                                <div class="rating-count">${count} comercio${count !== 1 ? "s" : ""}</div>
                            </div>
                          `
                          })
                          .join("")}
                    </div>
                    `
                        : `
                    <div class="no-competition">
                        <div class="no-competition-icon">✨</div>
                        <div class="no-competition-title">¡Excelente oportunidad!</div>
                        <div class="no-competition-text">
                            No se encontraron comercios similares en la zona, lo que representa una ventaja competitiva significativa.
                        </div>
                    </div>
                    `
                    }
                </div>
            </div>

            ${
              analysisData.recommendations && analysisData.recommendations.length > 0
                ? `
            <!-- Recomendaciones -->
            <div class="recommendations-section">
                <h2 class="section-title">🎯 Recomendaciones Estratégicas</h2>
                <div class="recommendations-list">
                    <ul>
                        ${analysisData.recommendations.map((rec: string) => `<li>${rec}</li>`).join("")}
                    </ul>
                </div>
            </div>
            `
                : ""
            }

            <!-- Detalles del Análisis -->
            <div class="page-break-avoid">
                <h2 class="section-title">📋 Detalles del Análisis</h2>
                <div class="details-grid">
                    <div class="detail-card">
                        <div class="detail-header">
                            <span class="detail-icon">📍</span>
                            <span class="detail-title">Ubicación</span>
                        </div>
                        <div class="detail-content">
                            <strong>Coordenadas:</strong> ${analysisData.latitude.toFixed(4)}, ${analysisData.longitude.toFixed(4)}<br>
                            Análisis geográfico y demográfico de la zona.
                        </div>
                    </div>

                    <div class="detail-card">
                        <div class="detail-header">
                            <span class="detail-icon">${getComercioEmoji(analysisData.businessType)}</span>
                            <span class="detail-title">Tipo de Negocio</span>
                        </div>
                        <div class="detail-content">
                            <strong>Categoría:</strong> ${analysisData.businessType}<br>
                            Análisis específico del sector y requerimientos.
                        </div>
                    </div>

                    <div class="detail-card">
                        <div class="detail-header">
                            <span class="detail-icon">💰</span>
                            <span class="detail-title">Presupuesto</span>
                        </div>
                        <div class="detail-content">
                            <strong>Inversión inicial:</strong> $${analysisData.budget.toLocaleString()} USD<br>
                            Evaluación de suficiencia y optimización de recursos.
                        </div>
                    </div>

                    <div class="detail-card">
                        <div class="detail-header">
                            <span class="detail-icon">🎯</span>
                            <span class="detail-title">Metodología</span>
                        </div>
                        <div class="detail-content">
                            <strong>Análisis multifactorial</strong><br>
                            Evaluación de mercado, competencia y factores de riesgo en radio de 500m.
                        </div>
                    </div>
                </div>
            </div>

            <!-- Footer -->
            <div class="footer">
                <p>Este reporte fue generado por Va o no va - Sistema de Análisis de Viabilidad Comercial</p>
                <p>Para más información, visite nuestro sitio web</p>
            </div>
        </div>
    </body>
    </html>
    `

    // Usar Puppeteer para generar el PDF
    const puppeteer = await import("puppeteer")
    const browser = await puppeteer.default.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    })

    const page = await browser.newPage()

    // Configurar el viewport y esperar a que se cargue completamente
    await page.setViewport({ width: 1200, height: 1600 })
    await page.setContent(htmlContent, {
      waitUntil: ["networkidle0", "domcontentloaded"],
      timeout: 30000,
    })

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: {
        top: "15mm",
        right: "15mm",
        bottom: "15mm",
        left: "15mm",
      },
    })

    await browser.close()

    // Retornar el PDF como respuesta
    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="reporte-viabilidad-${getName(analysisData.businessType)}-${new Date().toISOString().split("T")[0]}.pdf"`,
      },
    })
  } catch (error) {
    console.error("Error generating PDF:", error)
    return NextResponse.json({ error: "Error al generar el PDF" }, { status: 500 })
  }
}
