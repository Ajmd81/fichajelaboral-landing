import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Crypto from 'expo-crypto'
import { api } from './api'

const STORAGE_KEY = '@fichajelaboral/cola-offline'

export type AccionPendiente =
  | {
      tipo: 'fichaje_entrada'
      clientId: string
      clientTimestamp: string
      payload: { latitud?: number; longitud?: number; mocked?: boolean; tipo?: string; observaciones?: string }
    }
  | {
      tipo: 'fichaje_salida'
      clientId: string
      clientTimestamp: string
      payload: Record<string, never>
    }
  | {
      tipo: 'pausa_iniciar'
      clientId: string
      clientTimestamp: string
      payload: { tipo: string }
    }
  | {
      tipo: 'pausa_reanudar'
      clientId: string
      clientTimestamp: string
      payload: Record<string, never>
    }

export function nuevoClientId(): string {
  return Crypto.randomUUID()
}

export function isoNow(): string {
  // Timestamp local truncado a segundos en formato ISO (el backend hace toLocal pero el formato es válido)
  const d = new Date()
  d.setMilliseconds(0)
  return d.toISOString().replace('Z', '')
}

export async function obtenerCola(): Promise<AccionPendiente[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

async function guardarCola(items: AccionPendiente[]) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

export async function encolar(accion: AccionPendiente) {
  const cola = await obtenerCola()
  cola.push(accion)
  await guardarCola(cola)
}

export async function contarPendientes(): Promise<number> {
  return (await obtenerCola()).length
}

export async function limpiarCola() {
  await AsyncStorage.removeItem(STORAGE_KEY)
}

/** Envía las acciones pendientes en orden. Devuelve cuántas se sincronizaron correctamente. */
export async function sincronizar(): Promise<{ ok: number; fallidas: AccionPendiente[] }> {
  const cola = await obtenerCola()
  if (cola.length === 0) return { ok: 0, fallidas: [] }

  const fallidas: AccionPendiente[] = []
  let ok = 0

  for (const accion of cola) {
    try {
      const body = {
        ...accion.payload,
        clientId: accion.clientId,
        clientTimestamp: accion.clientTimestamp,
      }
      switch (accion.tipo) {
        case 'fichaje_entrada': await api.post('/fichajes/entrada', body); break
        case 'fichaje_salida':  await api.post('/fichajes/salida',  body); break
        case 'pausa_iniciar':   await api.post('/pausas/iniciar',   body); break
        case 'pausa_reanudar':  await api.post('/pausas/reanudar',  body); break
      }
      ok++
    } catch (err: unknown) {
      const e = err as { response?: { status?: number } }
      const status = e?.response?.status
      // 4xx (excepto 408/429) son errores definitivos → descartamos. 5xx o red → reintentar
      if (status && status >= 400 && status < 500 && status !== 408 && status !== 429) {
        // Descartar (idempotencia ya cubre duplicados; otros 4xx son errores del cliente irreparables)
        continue
      }
      fallidas.push(accion)
    }
  }

  await guardarCola(fallidas)
  return { ok, fallidas }
}