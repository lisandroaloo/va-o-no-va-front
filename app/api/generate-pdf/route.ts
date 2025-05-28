import { type NextRequest, NextResponse } from "next/server"


export async function POST(request: NextRequest) {
    try {
        const analysisData = await request.json()

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
            } else if (type === "competition") {
                if (score >= 20) return "Alta competencia"
                if (score >= 10) return "Competencia moderada"
                return "Baja competencia"
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

        // Determinar estado general
        const getOverallStatus = (viabilityScore: number) => {
            if (viabilityScore >= 70) return { message: "Proyecto recomendado", icon: "✅" }
            if (viabilityScore >= 40) return { message: "Proyecto con potencial", icon: "⚠️" }
            return { message: "Proyecto no recomendado", icon: "❌" }
        }

        const overallStatus = getOverallStatus(analysisData.viability_score)
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
                line-height: 1.6;
                color: #333;
                background: #fff;
            }
            
            .container {
                max-width: 800px;
                margin: 0 auto;
                padding: 40px 20px;
            }
            
            .header {
                text-align: center;
                margin-bottom: 40px;
                border-bottom: 3px solid #e5e7eb;
                padding-bottom: 20px;
            }
            
            .header h1 {
                font-size: 28px;
                color: #1f2937;
                margin-bottom: 10px;
            }
            
            .header .subtitle {
                font-size: 16px;
                color: #6b7280;
                margin-bottom: 10px;
            }
            
            .header .date {
                font-size: 14px;
                color: #9ca3af;
            }
            
            .status-section {
                background: #f9fafb;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                padding: 20px;
                margin-bottom: 30px;
                text-align: center;
            }
            
            .status-icon {
                font-size: 48px;
                margin-bottom: 10px;
            }
            
            .status-message {
                font-size: 24px;
                font-weight: bold;
                color: ${analysisData.viability_score >= 70 ? "#059669" : analysisData.viability_score >= 40 ? "#d97706" : "#dc2626"};
                margin-bottom: 10px;
            }
            
            .status-description {
                color: #6b7280;
                font-size: 14px;
            }
            
            .metrics-section {
                margin-bottom: 30px;
            }
            
            .section-title {
                font-size: 20px;
                font-weight: bold;
                color: #1f2937;
                margin-bottom: 20px;
                border-bottom: 2px solid #e5e7eb;
                padding-bottom: 10px;
            }
            
            .metrics-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 20px;
                margin-bottom: 30px;
            }
            
            .metric-card {
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                padding: 20px;
                background: #fff;
            }
            
            .metric-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 15px;
            }
            
            .metric-title {
                font-weight: 600;
                color: #374151;
                font-size: 14px;
            }
            
            .metric-score {
                font-weight: bold;
                font-size: 18px;
                color: #1f2937;
            }
            
            .metric-bar {
                width: 100%;
                height: 8px;
                background: #e5e7eb;
                border-radius: 4px;
                overflow: hidden;
                margin-bottom: 10px;
            }
            
            .metric-fill {
                height: 100%;
                border-radius: 4px;
            }
            
            .metric-interpretation {
                font-size: 12px;
                color: #6b7280;
                font-style: italic;
            }
            
            .recommendations-section {
                margin-bottom: 30px;
            }
            
            .recommendations-list {
                background: #eff6ff;
                border: 1px solid #bfdbfe;
                border-radius: 8px;
                padding: 20px;
            }
            
            .recommendations-list ul {
                list-style: none;
                padding: 0;
            }
            
            .recommendations-list li {
                margin-bottom: 10px;
                padding-left: 20px;
                position: relative;
                color: #1e40af;
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
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 20px;
            }
            
            .detail-card {
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                padding: 15px;
                background: #fff;
            }
            
            .detail-header {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-bottom: 10px;
            }
            
            .detail-icon {
                font-size: 18px;
            }
            
            .detail-title {
                font-weight: 600;
                color: #374151;
            }
            
            .detail-content {
                font-size: 14px;
                color: #6b7280;
                line-height: 1.4;
            }
            
            .footer {
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
                text-align: center;
                color: #9ca3af;
                font-size: 12px;
            }
            
            .green { background: #10b981; }
            .yellow { background: #f59e0b; }
            .red { background: #ef4444; }
            
            @media print {
                body { print-color-adjust: exact; }
                .container { padding: 20px; }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <!-- Header -->
            <div class="header">
                <h1>📈 Reporte de Viabilidad Comercial</h1>
                <div class="subtitle">
                    Análisis para ${analysisData.businessType} en coordenadas ${analysisData.latitude.toFixed(4)}, ${analysisData.longitude.toFixed(4)}
                </div>
                <div class="date">Generado el ${currentDate}</div>
            </div>

            <!-- Status General -->
            <div class="status-section">
                <div class="status-icon">${overallStatus.icon}</div>
                <div class="status-message">${overallStatus.message}</div>
                <div class="status-description">
                    Basado en el análisis de viabilidad, riesgo y competencia de tu proyecto empresarial.
                </div>
            </div>

            <!-- Métricas Principales -->
            <div class="metrics-section">
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
                                 style="width: ${analysisData.risk_score}%"></div>
                        </div>
                        <div class="metric-interpretation">
                            ${getScoreInterpretation(analysisData.risk.value, "risk")}
                        </div>
                    </div>

                    <div class="metric-card">
                        <div class="metric-header">
                            <span class="metric-title">🏢 Análisis de Competencia</span>
                            <span class="metric-score">${analysisData.competition.value}</span>
                        </div>
                       <div class="metric-bar">
                        <div
                            class="metric-fill 
                            ${analysisData.competition.value >= 20 ? "red" :
                                        analysisData.competition.value >= 10 ? "yellow" : "green"}"
                            style="width: ${analysisData.competition.value < 10
                                        ? 10
                                        : analysisData.competition.value <= 20
                                            ? 50
                                            : 100
                                    }%">
                        </div>
                        </div>
                        <div class="metric-interpretation">
                            ${getScoreInterpretation(analysisData.competition.value, "competition")}
                        </div>
                    </div>
                </div>
            </div>

            ${analysisData.recommendations && analysisData.recommendations.length > 0
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
            <div class="details-section">
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
                            Evaluación de mercado, competencia y factores de riesgo.
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
        await page.setContent(htmlContent, { waitUntil: "networkidle0" })

        const pdfBuffer = await page.pdf({
            format: "A4",
            printBackground: true,
            margin: {
                top: "20mm",
                right: "20mm",
                bottom: "20mm",
                left: "20mm",
            },
        })

        await browser.close()

        // Retornar el PDF como respuesta
        return new NextResponse(pdfBuffer, {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="reporte-viabilidad-${analysisData.businessType}-${new Date().toISOString().split("T")[0]}.pdf"`,
            },
        })
    } catch (error) {
        console.error("Error generating PDF:", error)
        return NextResponse.json({ error: "Error al generar el PDF" }, { status: 500 })
    }
}
