import { useEffect, useState } from 'react'
import NetInfo from '@react-native-community/netinfo'

export function useNetwork() {
  const [online, setOnline] = useState(true)

  useEffect(() => {
    const unsub = NetInfo.addEventListener(state => {
      setOnline(state.isConnected === true && state.isInternetReachable !== false)
    })
    // Estado inicial
    NetInfo.fetch().then(state => {
      setOnline(state.isConnected === true && state.isInternetReachable !== false)
    })
    return () => unsub()
  }, [])

  return online
}