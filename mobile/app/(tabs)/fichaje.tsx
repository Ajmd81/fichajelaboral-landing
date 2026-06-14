import { useEffect, useState } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, ScrollView, RefreshControl, Modal,
} from 'react-native'
import * as Location from 'expo-location'
import { api } from '../../services/api'

interface FichajeActivo {
  id: number
  horaEntrada: string
  latitud?: number
  longitud?: number
}

interface PausaActiva {
  id: number
  fichajeId: number
  horaInicio: string
  tipo: 'DESCANSO' | 'COMIDA' | 'INTERRUPCION'
}

type TipoFichaje = 'JORNADA' | 'DESPLAZAMIENTO' | 'VISITA_COMERCIAL' | 'REUNION_EXTERNA' | 'FORMACION'
type TipoPausa   = 'DESCANSO' | 'COMIDA' | 'INTERRUPCION'

const TIPOS_FICHAJE: { val: TipoFichaje; label: string; emoji: string }[] = [
  { val: 'JORNADA',          label: 'Jornada',          emoji: '🕐' },
  { val: 'DESPLAZAMIENTO',   label: 'Desplazamiento',   emoji: '🚗' },
  { val: 'VISITA_COMERCIAL', label: 'Visita comercial', emoji: '💼' },
  { val: 'REUNION_EXTERNA',  label: 'Reunión externa',  emoji: '🤝' },
  { val: 'FORMACION',        label: 'Formación',        emoji: '🎓' },
]

const TIPOS_PAUSA: { val: TipoPausa; label: string; emoji: string }[] = [
  { val: 'DESCANSO',     label: 'Descanso',     emoji: '☕' },
  { val: 'COMIDA',       label: 'Comida',       emoji: '🍴' },
  { val: 'INTERRUPCION', label: 'Interrupción', emoji: '⏸' },
]

export default function FichajeScreen() {
  const [fichajeActivo, setFichajeActivo] = useState<FichajeActivo | null>(null)
  const [pausaActiva,   setPausaActiva]   = useState<PausaActiva | null>(null)
  const [loading,       setLoading]       = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [refreshing,    setRefreshing]    = useState(false)
  const [tiempo,        setTiempo]        = useState('')
  const [hora,          setHora]          = useState('')

  // Modal selector de tipo de fichaje
  const [modalTipoFichaje, setModalTipoFichaje] = useState(false)
  // Modal selector de tipo de pausa
  const [modalTipoPausa, setModalTipoPausa] = useState(false)

  // Reloj en tiempo real
  useEffect(() => {
    const tick = () => {
      const now = new Date()
      setHora(now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
      if (fichajeActivo && !pausaActiva) {
        const [day, month, yearTime] = fichajeActivo.horaEntrada.split('/')
        const [year, time] = yearTime.split(' ')
        const entrada = new Date(`${year}-${month}-${day}T${time}:00`)
        const diff = Math.floor((Date.now() - entrada.getTime()) / 1000)
        if (diff > 0) {
          const h = Math.floor(diff / 3600)
          const m = Math.floor((diff % 3600) / 60)
          const s = diff % 60
          setTiempo(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`)
        }
      }
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [fichajeActivo, pausaActiva])

  async function cargar() {
    try {
      try {
        const { data } = await api.get('/fichajes/activo')
        setFichajeActivo(data)
      } catch (err: unknown) {
        const e = err as { response?: { status?: number } }
        if (e?.response?.status === 404) setFichajeActivo(null)
      }

      try {
        const { data } = await api.get('/pausas/activa')
        setPausaActiva(data ?? null)
      } catch {
        setPausaActiva(null)
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    void cargar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function getLocation() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') return null
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })
      return {
        latitud:  loc.coords.latitude,
        longitud: loc.coords.longitude,
        mocked:   loc.mocked === true,    // ← Android lo proporciona, iOS siempre será false
      }
    } catch {
      return null
    }
  }

  async function handleEntrada(tipo: TipoFichaje) {
    setModalTipoFichaje(false)
    setActionLoading(true)
    try {
      const loc = await getLocation()
      await api.post('/fichajes/entrada', { ...(loc ?? {}), tipo })
      await cargar()
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } }
      const msg = e?.response?.data?.message ?? 'Error al registrar entrada'
      Alert.alert('No se puede fichar', msg)
    } finally {
      setActionLoading(false)
    }
  }

  function handleSalida() {
    if (pausaActiva) {
      Alert.alert('Pausa activa', 'Reanuda la pausa antes de registrar la salida.')
      return
    }
    Alert.alert('Registrar salida', '¿Confirmas que quieres registrar tu salida?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Confirmar', style: 'destructive', onPress: async () => {
          setActionLoading(true)
          try {
            await api.post('/fichajes/salida')
            setFichajeActivo(null)
            setTiempo('')
          } catch (err: unknown) {
            const e = err as { response?: { data?: { message?: string } } }
            Alert.alert('Error', e?.response?.data?.message ?? 'Error al registrar salida')
          } finally {
            setActionLoading(false)
          }
        }
      }
    ])
  }

  async function iniciarPausa(tipo: TipoPausa) {
    setModalTipoPausa(false)
    setActionLoading(true)
    try {
      await api.post('/pausas/iniciar', { tipo })
      await cargar()
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } }
      Alert.alert('Error', e?.response?.data?.message ?? 'No se pudo iniciar la pausa')
    } finally {
      setActionLoading(false)
    }
  }

  async function reanudar() {
    setActionLoading(true)
    try {
      await api.post('/pausas/reanudar')
      await cargar()
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } }
      Alert.alert('Error', e?.response?.data?.message ?? 'No se pudo reanudar')
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return <View style={s.center}><ActivityIndicator size="large" color="#00923C" /></View>
  }

  const activo = !!fichajeActivo
  const enPausa = !!pausaActiva

  return (
    <ScrollView
      contentContainerStyle={s.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); void cargar() }} tintColor="#00923C" />}
    >
      {/* Reloj */}
      <View style={s.clockCard}>
        <Text style={s.clockTime}>{hora}</Text>
        <Text style={s.clockDate}>
          {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
        </Text>
      </View>

      {/* Estado actual */}
      <View style={[
        s.statusCard,
        enPausa ? s.statusPausa : activo ? s.statusActivo : s.statusInactivo
      ]}>
        <Text style={[s.statusDot, { color: enPausa ? '#F5A623' : activo ? '#00923C' : '#9BA5B4' }]}>
          {enPausa ? '⏸' : activo ? '●' : '○'}
        </Text>
        <View style={{ flex: 1 }}>
          <Text style={[s.statusLabel, { color: enPausa ? '#B07300' : activo ? '#00923C' : '#5A6475' }]}>
            {enPausa ? 'En pausa' : activo ? 'Trabajando' : 'Sin fichar'}
          </Text>
          {activo && fichajeActivo && !enPausa && (
            <>
              <Text style={s.statusSub}>Entrada: {fichajeActivo.horaEntrada}</Text>
              {!!tiempo && <Text style={s.statusTimer}>{tiempo}</Text>}
            </>
          )}
          {enPausa && pausaActiva && (
            <Text style={s.statusSub}>
              {TIPOS_PAUSA.find(t => t.val === pausaActiva.tipo)?.label ?? pausaActiva.tipo} desde {new Date(pausaActiva.horaInicio).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
            </Text>
          )}
        </View>
      </View>

      {/* Botón principal */}
      {!activo && (
        <TouchableOpacity
          style={[s.mainBtn, s.btnEntrada, actionLoading && s.btnDisabled]}
          onPress={() => setModalTipoFichaje(true)}
          disabled={actionLoading}
          activeOpacity={0.85}
        >
          {actionLoading
            ? <ActivityIndicator color="#fff" size="large" />
            : <>
                <Text style={s.mainBtnIcon}>▶</Text>
                <Text style={s.mainBtnText}>Registrar entrada</Text>
              </>
          }
        </TouchableOpacity>
      )}

      {activo && !enPausa && (
        <>
          <TouchableOpacity
            style={[s.mainBtn, s.btnSalida, actionLoading && s.btnDisabled]}
            onPress={handleSalida}
            disabled={actionLoading}
            activeOpacity={0.85}
          >
            {actionLoading
              ? <ActivityIndicator color="#fff" size="large" />
              : <>
                  <Text style={s.mainBtnIcon}>⏹</Text>
                  <Text style={s.mainBtnText}>Registrar salida</Text>
                </>
            }
          </TouchableOpacity>

          <TouchableOpacity
            style={[s.pausaBtn, actionLoading && s.btnDisabled]}
            onPress={() => setModalTipoPausa(true)}
            disabled={actionLoading}
            activeOpacity={0.85}
          >
            <Text style={s.pausaBtnText}>⏸ Iniciar pausa</Text>
          </TouchableOpacity>
        </>
      )}

      {enPausa && (
        <TouchableOpacity
          style={[s.mainBtn, s.btnReanudar, actionLoading && s.btnDisabled]}
          onPress={reanudar}
          disabled={actionLoading}
          activeOpacity={0.85}
        >
          {actionLoading
            ? <ActivityIndicator color="#fff" size="large" />
            : <>
                <Text style={s.mainBtnIcon}>▶</Text>
                <Text style={s.mainBtnText}>Reanudar jornada</Text>
              </>
          }
        </TouchableOpacity>
      )}

      <Text style={s.hint}>
        {enPausa  ? 'Pulsa para reanudar tu jornada'
         : activo ? 'Pulsa para iniciar pausa o registrar salida'
         :         'Pulsa para iniciar tu jornada laboral'}
      </Text>

      {/* Modal: tipo de fichaje */}
      <Modal visible={modalTipoFichaje} transparent animationType="slide"
             onRequestClose={() => setModalTipoFichaje(false)}>
        <View style={s.modalOverlay}>
          <View style={s.modalSheet}>
            <Text style={s.modalTitle}>¿Qué tipo de jornada?</Text>
            <Text style={s.modalSubtitle}>Selecciona la categoría de tu fichaje</Text>
            {TIPOS_FICHAJE.map(t => (
              <TouchableOpacity key={t.val} style={s.modalOption}
                onPress={() => handleEntrada(t.val)} activeOpacity={0.7}>
                <Text style={s.modalOptionEmoji}>{t.emoji}</Text>
                <Text style={s.modalOptionLabel}>{t.label}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={s.modalCancel} onPress={() => setModalTipoFichaje(false)}>
              <Text style={s.modalCancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal: tipo de pausa */}
      <Modal visible={modalTipoPausa} transparent animationType="slide"
             onRequestClose={() => setModalTipoPausa(false)}>
        <View style={s.modalOverlay}>
          <View style={s.modalSheet}>
            <Text style={s.modalTitle}>¿Qué tipo de pausa?</Text>
            <Text style={s.modalSubtitle}>Las interrupciones cuentan como tiempo trabajado</Text>
            {TIPOS_PAUSA.map(t => (
              <TouchableOpacity key={t.val} style={s.modalOption}
                onPress={() => iniciarPausa(t.val)} activeOpacity={0.7}>
                <Text style={s.modalOptionEmoji}>{t.emoji}</Text>
                <Text style={s.modalOptionLabel}>{t.label}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={s.modalCancel} onPress={() => setModalTipoPausa(false)}>
              <Text style={s.modalCancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  )
}

const s = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: '#D6F0E0', alignItems: 'center' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#D6F0E0' },
  clockCard: {
    backgroundColor: '#fff', borderRadius: 20, padding: 28, alignItems: 'center',
    width: '100%', marginBottom: 16,
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12, elevation: 3,
  },
  clockTime: { fontSize: 48, fontWeight: '700', color: '#131B27', letterSpacing: 2 },
  clockDate: { fontSize: 14, color: '#5A6475', marginTop: 4, textTransform: 'capitalize' },
  statusCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderRadius: 14, padding: 16, width: '100%', marginBottom: 28,
  },
  statusActivo:   { backgroundColor: '#E6F5EC', borderWidth: 1, borderColor: '#00923C' },
  statusInactivo: { backgroundColor: '#fff',    borderWidth: 1, borderColor: '#DDE2EA' },
  statusPausa:    { backgroundColor: '#FFF6E1', borderWidth: 1, borderColor: '#F5A623' },
  statusDot:   { fontSize: 22 },
  statusLabel: { fontSize: 16, fontWeight: '700' },
  statusSub:   { fontSize: 13, color: '#5A6475', marginTop: 2 },
  statusTimer: { fontSize: 22, fontWeight: '700', color: '#00923C', marginTop: 4, letterSpacing: 1 },
  mainBtn: {
    width: 200, height: 200, borderRadius: 100,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 20, elevation: 6,
    marginBottom: 16,
  },
  btnEntrada:  { backgroundColor: '#00923C' },
  btnSalida:   { backgroundColor: '#D2514E' },
  btnReanudar: { backgroundColor: '#00923C' },
  btnDisabled: { opacity: 0.6 },
  mainBtnIcon: { fontSize: 36, color: '#fff', marginBottom: 8 },
  mainBtnText: { fontSize: 16, fontWeight: '700', color: '#fff', textAlign: 'center' },
  pausaBtn: {
    backgroundColor: '#fff', borderRadius: 14, paddingVertical: 14, paddingHorizontal: 32,
    borderWidth: 2, borderColor: '#F5A623', marginBottom: 12,
  },
  pausaBtnText: { color: '#B07300', fontSize: 15, fontWeight: '700' },
  hint: { fontSize: 13, color: '#5A6475', textAlign: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalSheet:   {
    backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, paddingBottom: 32,
  },
  modalTitle:    { fontSize: 20, fontWeight: '700', color: '#131B27', marginBottom: 4 },
  modalSubtitle: { fontSize: 13, color: '#5A6475', marginBottom: 18 },
  modalOption: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingVertical: 14, paddingHorizontal: 16, borderRadius: 12,
    backgroundColor: '#F7F9FC', marginBottom: 8,
  },
  modalOptionEmoji: { fontSize: 24 },
  modalOptionLabel: { fontSize: 16, fontWeight: '600', color: '#131B27' },
  modalCancel:     { marginTop: 8, padding: 14, alignItems: 'center' },
  modalCancelText: { fontSize: 15, fontWeight: '600', color: '#5A6475' },
})