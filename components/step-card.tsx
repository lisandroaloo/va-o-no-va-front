interface StepCardProps {
  step: number
  title: string
  description: string
}

export function StepCard({ step, title, description }: StepCardProps) {
  return (
    <div className="flex flex-col space-y-4 rounded-lg border bg-white p-6 h-full">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
        <span className="text-xl font-bold">{step}</span>
      </div>
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}
