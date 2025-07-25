import { IValue } from '@/app/resultado/page';
import { useState, useCallback } from 'react'


interface RequestData {
  latitude: number
  longitude: number
  businessType: string
  budget: number
  description: string
}

export interface CompetitionScores{
  oneStar: number
  twoStar: number
  threeStar: number
  fourStar: number
  fiveStar: number
}

 
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

const handleAnalizarIdea = async ( requestData:RequestData  ) => {
  const response = await fetch("http://localhost:8080/ideas/ia", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      latitude: requestData.latitude,
      longitude: requestData.longitude,
      businessType: requestData.businessType,
      budget: requestData.budget,
    }),
  });

  const data = await response.json();
  console.log("Respuesta del análisis IA:", data);
  return data;
};

const usePostIdea = () => {
  const [loading, setLoading] = useState(false)

  const postIdea = useCallback(async ( requestData:RequestData  ) => {
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
          description: requestData.description
        }),
      })

      const res: EvaluationResult = await _res.json()

      // 🔍 DEBUG: Ver exactamente qué datos llegan del backend
      console.log('🎯 BACKEND RESPONSE - Datos completos:', res)
      console.log('🎯 BACKEND RESPONSE - Competition object:', res.competition)
      console.log('🎯 BACKEND RESPONSE - Competition type:', typeof res.competition)
      console.log('🎯 BACKEND RESPONSE - Competition keys:', res.competition ? Object.keys(res.competition) : 'null')

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
  }, [])
  return { loading, postIdea }
}

export default usePostIdea