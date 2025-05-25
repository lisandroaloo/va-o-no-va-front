import Link from "next/link"
import { PageLayout } from "@/components/page-layout"
import { FeatureCard } from "@/components/feature-card"
import { StepCard } from "@/components/step-card"

export default function LandingPage() {
  const features = [
    {
      title: "Análisis de ubicación",
      description: "Evaluamos si la ubicación es adecuada para tu tipo de negocio.",
    },
    {
      title: "Estudio de mercado",
      description: "Analizamos la competencia y el potencial de clientes en la zona.",
    },
    {
      title: "Recomendaciones",
      description: "Te ofrecemos sugerencias para mejorar la viabilidad de tu negocio.",
    },
    {
      title: "Resultados inmediatos",
      description: "Obtén un análisis detallado en segundos para tomar decisiones informadas.",
    },
  ]

  const steps = [
    {
      step: 1,
      title: "Ingresa las coordenadas",
      description: "Proporciona la latitud y longitud donde planeas establecer tu negocio.",
    },
    {
      step: 2,
      title: "Selecciona tu comercio",
      description: "Elige entre café, restaurante o kiosco y define tu presupuesto.",
    },
    {
      step: 3,
      title: "Recibe el análisis",
      description: "Obtén un informe detallado sobre la viabilidad de tu negocio en esa ubicación.",
    },
  ]

  return (
    <PageLayout>
      <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
        <div className="container px-4 md:px-6 mx-auto max-w-7xl">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                  Descubre si tu negocio será viable
                </h1>
                <p className="max-w-[600px] text-gray-600 md:text-xl">
                  Nuestra herramienta de análisis te ayuda a determinar si tu idea de negocio tiene potencial en la
                  ubicación que has elegido.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href="/formulario">
                  <button className="inline-flex items-center justify-center gap-1 rounded-md bg-gray-900 px-6 py-3 text-sm font-medium text-white hover:bg-gray-800 transition-colors">
                    Comenzar análisis
                  </button>
                </Link>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="w-full">
                <div className="flex flex-col gap-4">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <FeatureCard title={features[0].title} description={features[0].description} />
                    </div>
                    <div className="flex-1">
                      <FeatureCard title={features[1].title} description={features[1].description} />
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <FeatureCard title={features[2].title} description={features[2].description} />
                    </div>
                    <div className="flex-1">
                      <FeatureCard title={features[3].title} description={features[3].description} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-50">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">¿Cómo funciona?</h2>
              <p className="max-w-[700px] text-gray-600 md:text-xl mx-auto">
                En tres simples pasos podrás saber si tu idea de negocio tiene potencial en la ubicación elegida.
              </p>
            </div>
          </div>
          <div className="mx-auto max-w-5xl py-12">
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-1">
                <StepCard step={steps[0].step} title={steps[0].title} description={steps[0].description} />
              </div>
              <div className="flex-1">
                <StepCard step={steps[1].step} title={steps[1].title} description={steps[1].description} />
              </div>
              <div className="flex-1">
                <StepCard step={steps[2].step} title={steps[2].title} description={steps[2].description} />
              </div>
            </div>
          </div>
          <div className="flex justify-center">
            <Link href="/formulario">
              <button className="inline-flex items-center justify-center rounded-md bg-gray-900 px-6 py-3 text-sm font-medium text-white hover:bg-gray-800 transition-colors">
                Comenzar ahora
              </button>
            </Link>
          </div>
        </div>
      </section>
    </PageLayout>
  )
}
