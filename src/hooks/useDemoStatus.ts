import { getSession } from '../services/auth'

export function useDemoStatus() {
  const session = getSession()
  return {
    isDemo:         session?.demo ?? false,
    diasRestantes:  session?.diasRestantesDemo,
    diasTotales:    session?.diasTotalesDemo,
  }
}