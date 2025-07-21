import { IValue } from "@/app/resultado/page"
import { useState } from "react"
import { type AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime"

interface RequestData {
  latitude: number
  longitude: number
  businessType: string
  budget: number
  description: string // This is expected to be the address
}

export interface CompetitionScores {
  oneStar: number
  twoStar: number
  threeStar: number
  fourStar: number
  fiveStar: number
}

// This represents the raw data structure coming from the backend
interface EvaluationResult {
  risk: IValue
  viabilityScore: number
  competition: CompetitionScores
  recommendations: string[]
  latitude: number
  longitude: number
  businessType: string
  budget: number
}

const usePostIdea = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const postIdeaAndNavigate = (requestData: RequestData, router: AppRouterInstance) => {
    setLoading(true)
    setError(null)

    // 1. Navigate IMMEDIATELY to the loading screen.
    // The user will see `app/resultado/loading.tsx` right away.
    router.push("/resultado")

    // 2. Perform the fetch in the background. We don't `await` it here,
    // so the function finishes executing immediately after the fetch starts.
    fetch(`http://localhost:8080/idea`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        latitude: requestData.latitude,
        longitude: requestData.longitude,
        businessType: requestData.businessType,
        budget: requestData.budget,
        description: requestData.description,
      }),
    })
      .then(async (_res) => {
        if (!_res.ok) {
          const errorBody = await _res.json().catch(() => ({ message: "Error fetching data, please try again." }))
          throw new Error(errorBody.message || `Request failed with status ${_res.status}`)
        }
        return _res.json()
      })
      .then((res: EvaluationResult) => {
        // 3. When the data is successfully received, we enrich it with the address
        // from the form and a timestamp.
        const finalResult = {
          ...res,
          address: requestData.description,
          timestamp: Date.now(),
        }

        // 4. We store the complete data in sessionStorage. The results page
        // will be waiting for this.
        sessionStorage.setItem("analysisResult", JSON.stringify(finalResult))
      })
      .catch((err: Error) => {
        console.error("Error posting idea:", err)
        setError(err.message)

        // 5. CRITICAL: If the fetch fails, we must redirect the user away from
        // the loading screen, otherwise they will be stuck forever. We send
        // them back to the form with an error message.
        sessionStorage.removeItem("analysisResult") // Clean up partial data
        router.push(`/formulario?error=${encodeURIComponent(err.message)}`)
      })
      .finally(() => {
        // This loading state is for the submit button on the form page,
        // it can be set to false once the process is handed off.
        setLoading(false)
      })
  }
  return { loading, error, postIdeaAndNavigate }
}

export default usePostIdea