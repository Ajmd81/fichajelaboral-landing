import { useEffect, useState } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal,
  ActivityIndicator, Alert, TextInput, Platform,
} from 'react-native'
import { api } from '../../services/api'

interface Vacaciones {
  id: number
  fechaInicio: string
  fechaFin: string
  diasLaborables: number
  estado: 'PENDIENTE' | 'APROBADA' | 'RECHAZADA'
  comentario?: string
  motivoRechazo?: string
  fechaSolicitud: string
}

interface Disponibles {
  anio: number
  diasTotales: number
  diasUsados: number
  diasPendientes: number
  diasDisponibles: number
}

export default function VacacionesScreen() {
  const [solicitudes, setSolicitudes] = useState<Vacaciones[]>([])
  const [disponibles, setDisponibles] = useState<Disponibles | null>(null)
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [saving, setSaving] = useState(false)

  // Formulario
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin,    setFechaFin]    = useState('')
  const [comentario,  setComentario]  = useState('')
  const [errorForm,   setErrorForm]   = useState('')

  async function cargar() {
    try {
      const [s, d] = await Promise.all([
        api.get('/vacaciones/mis'),
        api.get('/vacaciones/disponibles'),
      ])
      setSolicitudes(s.data)
      setDisponibles(d.data)
    } catch {
      // silencioso
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void cargar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function solicitar() {
    setErrorForm('')
    if (!fechaInicio || !fechaFin) {
      setErrorForm('Introduce las dos fechas')
      return
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaInicio) || !/^\d{4}-\d{2}-\d{2}$/.test(fechaFin)) {
      setErrorForm('Formato de fecha: AAAA-MM-DD (ej: 2026-08-01)')
      return
    }
    setSaving(true)
    try {
      await api.post('/vacaciones', { fechaInicio, fechaFin, comentario })
      setModal(false)
      setFechaInicio('')
      setFechaFin('')
      setComentario('')
      await cargar()
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } }
      setErrorForm(e?.response?.data?.message ?? 'Error al solicitar')
    } finally {
      setSaving(false)
    }
  }

  async function cancelar(id: number) {
    Alert.alert('Cancelar solicitud', '¿Seguro que quieres cancelar esta solicitud?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Sí, cancelar', style: 'destructive', onPress: async () => {
          try {
            await api.delete('/vacaciones/' + id)
            await cargar()
          } catch (err: unknown) {
            const e = err as { response?: { data?: { message?: string } } }
            Alert.alert('Error', e?.response?.data?.message ?? 'No se pudo cancelar')
          }
        }
      }
    ])
  }

  if (loading) {
    return <View style={s.center}><ActivityIndicator size="large" color="#00923C" /></View>
  }

  return (
    <ScrollView contentContainerStyle={s.container}>
      {/* Resumen disponibles */}
      {disponibles && (
        <View style={s.summary}>
          <Text style={s.summaryTitle}>Días disponibles {disponibles.anio}</Text>
          <Text style={s.summaryBig}>{disponibles.diasDisponibles}</Text>
          <Text style={s.summarySub}>
            de {disponibles.diasTotales} días totales · {disponibles.diasUsados} usados · {disponibles.diasPendientes} pendientes
          </Text>
        </View>
      )}

      {/* Botón solicitar */}
      <TouchableOpacity style={s.solicitarBtn} onPress={() => setModal(true)} activeOpacity={0.85}>
        <Text style={s.solicitarText}>+ Solicitar vacaciones</Text>
      </TouchableOpacity>

      {/* Lista de solicitudes */}
      <Text style={s.sectionTitle}>Mis solicitudes</Text>
      {solicitudes.length === 0 ? (
        <Text style={s.empty}>Aún no has solicitado vacaciones.</Text>
      ) : (
        solicitudes.map(v => (
          <View key={v.id} style={s.card}>
            <View style={s.cardHeader}>
              <Text style={s.cardDate}>{formatFecha(v.fechaInicio)} → {formatFecha(v.fechaFin)}</Text>
              <View style={[s.badge, estadoStyle(v.estado)]}>
                <Text style={[s.badgeText, { color: estadoColor(v.estado) }]}>{estadoLabel(v.estado)}</Text>
              </View>
            </View>
            <Text style={s.cardDias}>{v.diasLaborables} días laborables</Text>
            {v.comentario  && <Text style={s.cardComentario}>📝 {v.comentario}</Text>}
            {v.motivoRechazo && <Text style={s.cardRechazo}>✕ {v.motivoRechazo}</Text>}
            {v.estado === 'PENDIENTE' && (
              <TouchableOpacity style={s.cancelBtn} onPress={() => cancelar(v.id)}>
                <Text style={s.cancelText}>Cancelar solicitud</Text>
              </TouchableOpacity>
            )}
          </View>
        ))
      )}

      {/* Modal solicitar */}
      <Modal visible={modal} transparent animationType="slide" onRequestClose={() => setModal(false)}>
        <View style={s.modalOverlay}>
          <View style={s.modalSheet}>
            <Text style={s.modalTitle}>Solicitar vacaciones</Text>
            <Text style={s.modalSubtitle}>Indica el periodo y un comentario opcional</Text>

            <Text style={s.label}>Fecha inicio</Text>
            <TextInput style={s.input} placeholder="2026-08-01"
              value={fechaInicio} onChangeText={setFechaInicio}
              autoCapitalize="none" keyboardType={Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'default'} />

            <Text style={s.label}>Fecha fin</Text>
            <TextInput style={s.input} placeholder="2026-08-15"
              value={fechaFin} onChangeText={setFechaFin}
              autoCapitalize="none" keyboardType={Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'default'} />

            <Text style={s.label}>Comentario (opcional)</Text>
            <TextInput style={[s.input, { height: 70, textAlignVertical: 'top' }]}
              placeholder="Ej: vacaciones de verano"
              value={comentario} onChangeText={setComentario} multiline />

            {!!errorForm && (
              <View style={s.errorBox}><Text style={s.errorText}>{errorForm}</Text></View>
            )}

            <View style={s.modalActions}>
              <TouchableOpacity style={s.modalCancelBtn} onPress={() => setModal(false)}>
                <Text style={s.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.modalSaveBtn, saving && s.btnDisabled]}
                onPress={solicitar} disabled={saving}>
                {saving ? <ActivityIndicator color="#fff" /> : <Text style={s.modalSaveText}>Solicitar</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  )
}

function estadoLabel(e: string) {
  return e === 'APROBADA' ? 'Aprobada' : e === 'RECHAZADA' ? 'Rechazada' : 'Pendiente'
}
function estadoColor(e: string) {
  return e === 'APROBADA' ? '#00923C' : e === 'RECHAZADA' ? '#D2514E' : '#B07300'
}
function estadoStyle(e: string) {
  return { backgroundColor: e === 'APROBADA' ? '#E6F5EC' : e === 'RECHAZADA' ? '#FEF0F0' : '#FFF6E1' }
}
function formatFecha(s: string): string {
  if (!s) return '—'
  const d = new Date(s)
  return isNaN(d.getTime()) ? s : d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const s = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#D6F0E0', flexGrow: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#D6F0E0' },
  summary: {
    backgroundColor: '#fff', borderRadius: 20, padding: 20, alignItems: 'center', marginBottom: 16,
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12, elevation: 3,
  },
  summaryTitle: { fontSize: 13, color: '#5A6475', marginBottom: 4 },
  summaryBig:   { fontSize: 48, fontWeight: '700', color: '#00923C' },
  summarySub:   { fontSize: 12, color: '#5A6475', textAlign: 'center', marginTop: 4 },
  solicitarBtn: {
    backgroundColor: '#00923C', borderRadius: 14, padding: 16, alignItems: 'center',
    marginBottom: 24, shadowColor: '#00923C', shadowOpacity: 0.30, shadowRadius: 10, elevation: 4,
  },
  solicitarText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  sectionTitle:  { fontSize: 15, fontWeight: '700', color: '#131B27', marginBottom: 10 },
  empty:         { fontSize: 14, color: '#5A6475', textAlign: 'center', padding: 20 },
  card: {
    backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 10,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  cardHeader:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4, flexWrap: 'wrap', gap: 8 },
  cardDate:     { fontSize: 14, fontWeight: '600', color: '#131B27' },
  cardDias:     { fontSize: 12, color: '#5A6475', marginBottom: 6 },
  cardComentario:{ fontSize: 13, color: '#5A6475', marginTop: 4 },
  cardRechazo:  { fontSize: 13, color: '#D2514E', marginTop: 4 },
  badge:        { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 99 },
  badgeText:    { fontSize: 11, fontWeight: '700' },
  cancelBtn:    { marginTop: 10, padding: 8, alignItems: 'center', backgroundColor: '#FEF0F0', borderRadius: 8 },
  cancelText:   { color: '#D2514E', fontSize: 12, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalSheet:   { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 32 },
  modalTitle:    { fontSize: 20, fontWeight: '700', color: '#131B27' },
  modalSubtitle: { fontSize: 13, color: '#5A6475', marginBottom: 18 },
  label: { fontSize: 12, fontWeight: '600', color: '#5A6475', marginBottom: 6, marginTop: 8 },
  input: { borderWidth: 1.5, borderColor: '#DDE2EA', borderRadius: 10, padding: 12, fontSize: 15, backgroundColor: '#F7F9FC' },
  errorBox:  { backgroundColor: '#FEF0F0', borderRadius: 8, padding: 12, marginTop: 10, borderLeftWidth: 3, borderLeftColor: '#D2514E' },
  errorText: { color: '#D2514E', fontSize: 13 },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 18 },
  modalCancelBtn: { flex: 1, padding: 14, borderRadius: 10, borderWidth: 1.5, borderColor: '#DDE2EA', alignItems: 'center' },
  modalCancelText: { color: '#5A6475', fontWeight: '700' },
  modalSaveBtn:   { flex: 1, padding: 14, borderRadius: 10, backgroundColor: '#00923C', alignItems: 'center' },
  modalSaveText:  { color: '#fff', fontWeight: '700' },
  btnDisabled: { opacity: 0.6 },
})