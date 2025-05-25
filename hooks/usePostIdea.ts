import { IValue } from '@/app/resultado/page';
import { useState } from 'react'


interface RequestData {
  latitude: number
  longitude: number
  businessType: string
  budget: number
}

 
interface EvaluationResult {
  risk: IValue
  viabilityScore: number
  competition: IValue
  recommendations: string[]
  latitude: number
  longitude: number
  businessType: string
  budget: number
}


const usePostIdea = () => {
  const [loading, setLoading] = useState(false)

  const postIdea = async ( requestData:RequestData  ) => {
    try {
      setLoading(true)

      const _res = await fetch(`http://localhost:8080/idea`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude: requestData.latitude,
          longitude: requestData.longitude,
          businessType: requestData.businessType,
          budget: requestData.budget,
        }),
      })

      const res: EvaluationResult = await _res.json()

      return res
    } catch (error: unknown) {
      if (error instanceof Error) {
        alert(error.message)
      } else {
        alert('An unknown error occurred')
      }
    } finally {
      setLoading(false)
    }
  }
  return { loading, postIdea }
}

export default usePostIdea