"use client"

interface RatingData {
  stars: number
  count: number
}

interface RatingChartProps {
  data: RatingData[]
  title?: string
}

export function RatingChart({ data, title = "Distribución de calificaciones" }: RatingChartProps) {
  // Calcular el total para los porcentajes
  const total = data.reduce((sum, item) => sum + item.count, 0)

  // Encontrar el valor máximo para escalar las barras
  const maxCount = Math.max(...data.map((item) => item.count))

  // Generar datos completos (1-5 estrellas)
  const completeData = [5, 4, 3, 2, 1].map((stars) => {
    const existing = data.find((item) => item.stars === stars)
    return {
      stars,
      count: existing?.count || 0,
    }
  })

  // Función para obtener color según las estrellas
  const getBarColor = (stars: number) => {
    switch (stars) {
      case 5:
        return "bg-green-500"
      case 4:
        return "bg-green-400"
      case 3:
        return "bg-yellow-400"
      case 2:
        return "bg-orange-400"
      case 1:
        return "bg-red-400"
      default:
        return "bg-gray-400"
    }
  }

  // Función para generar estrellas visuales
  const renderStars = (count: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`text-sm ${i < count ? "text-yellow-400" : "text-gray-300"}`}>
        ★
      </span>
    ))
  }

  if (total === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-800 mb-2">{title}</h4>
        <p className="text-gray-500 text-sm">No hay datos de comercios cercanos disponibles</p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h4 className="font-medium text-gray-800 mb-4">{title}</h4>

      {/* Resumen total */}
      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <span className="font-semibold">{total}</span> comercios similares encontrados en un radio de 500m
        </p>
      </div>

      {/* Gráfico de barras */}
      <div className="space-y-3">
        {completeData.map(({ stars, count }) => {
          const percentage = total > 0 ? (count / total) * 100 : 0
          const barWidth = maxCount > 0 ? (count / maxCount) * 100 : 0

          return (
            <div key={stars} className="flex items-center gap-3">
              {/* Estrellas */}
              <div className="flex items-center gap-1 w-20">{renderStars(stars)}</div>

              {/* Barra de progreso */}
              <div className="flex-1 relative">
                <div className="w-full bg-gray-200 rounded-full h-6 relative overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ease-out ${getBarColor(stars)}`}
                    style={{ width: `${barWidth}%` }}
                  />
                  {/* Texto dentro de la barra */}
                  {count > 0 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-medium text-white drop-shadow-sm">
                        {count} comercio{count !== 1 ? "s" : ""}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Porcentaje */}
              <div className="w-12 text-right">
                <span className="text-xs text-gray-600">{percentage.toFixed(0)}%</span>
              </div>
            </div>
          )
        })}
      </div>

 
    </div>
  )
}
