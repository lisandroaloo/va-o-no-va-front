interface FeatureCardProps {
  title: string
  description: string
}

export function FeatureCard({ title, description }: FeatureCardProps) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border p-4 bg-white shadow-sm h-full">
      <div className="flex items-center gap-2">
        <span className="text-green-500 text-lg">✓</span>
        <h3 className="font-semibold">{title}</h3>
      </div>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  )
}
