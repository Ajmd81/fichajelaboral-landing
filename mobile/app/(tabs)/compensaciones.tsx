import { useEffect, useState } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal,
  ActivityIndicator, Alert,
} from 'react-native'
import { api } from '../../services/api'

interface Compensacion {
  id: number
  empleadoId: number
  anio: number
  mes: number
  horasExtrasDiurnas: number
  horasExtrasNocturnas: number
  modoCompensacion?: 'DINERO' | 'DESCANSO'
  firmado: boolean
  fechaFirma?: string
  hashFirma?: string
}

const MESES = [
  '', 'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'
]

export default function CompensacionesScreen() {
  const [items, setItems] = useState<Compensacion[]>([])
  const [loading, setLoading] = useState(true)
  const [target, setTarget] = useState<Compensacion | null>(null)
  const [saving, setSaving] = useState(false)

  async function cargar() {
    try {
      const r = await api.get('/compensaciones/pendientes')
      setItems(r.data)
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

  async function firmar(modo: 'DINERO' | 'DESCANSO') {
    if (!target) return
    setSaving(true)
    try {
      await api.post('/compensaciones/' + target.id + '/firmar', { modo })
      setTarget(null)
      await cargar()
      Alert.alert('Firmado', 'Tu elección ha sido registrada con firma digital.')
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } }
      Alert.alert('Error', e?.response?.data?.message ?? 'No se pudo firmar')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <View style={s.center}><ActivityIndicator size="large" color="#00923C" /></View>
  }

  return (
    <ScrollView contentContainerStyle={s.container}>
      <Text style={s.title}>Horas extras pendientes de firmar</Text>
      <Text style={s.subtitle}>
        La Ley Control Horario 2026 te permite elegir cómo compensar tus horas extras. Tu firma queda registrada con sellado hash inmutable.
      </Text>

      {items.length === 0 ? (
        <View style={s.empty}>
          <Text style={s.emptyIcon}>✓</Text>
          <Text style={s.emptyText}>No tienes compensaciones pendientes</Text>
        </View>
      ) : (
        items.map(c => {
          const total = c.horasExtrasDiurnas + c.horasExtrasNocturnas
          return (
            <View key={c.id} style={s.card}>
              <Text style={s.cardPeriodo}>{MESES[c.mes]} {c.anio}</Text>
              <View style={s.row}>
                <View style={s.col}>
                  <Text style={s.colLabel}>Extras diurnas</Text>
                  <Text style={s.colValue}>{c.horasExtrasDiurnas.toFixed(2)} h</Text>
                </View>
                <View style={s.col}>
                  <Text style={s.colLabel}>Extras nocturnas</Text>
                  <Text style={s.colValue}>{c.horasExtrasNocturnas.toFixed(2)} h</Text>
                </View>
                <View style={s.col}>
                  <Text style={s.colLabel}>Total</Text>
                  <Text style={[s.colValue, { color: '#00923C' }]}>{total.toFixed(2)} h</Text>
                </View>
              </View>
              <TouchableOpacity style={s.firmarBtn} onPress={() => setTarget(c)}>
                <Text style={s.firmarText}>Elegir compensación →</Text>
              </TouchableOpacity>
            </View>
          )
        })
      )}

      {/* Modal de firma */}
      <Modal visible={!!target} transparent animationType="slide" onRequestClose={() => setTarget(null)}>
        <View style={s.modalOverlay}>
          <View style={s.modalSheet}>
            <Text style={s.modalTitle}>¿Cómo quieres compensarlas?</Text>
            {target && (
              <Text style={s.modalSubtitle}>
                {(target.horasExtrasDiurnas + target.horasExtrasNocturnas).toFixed(2)} h extras de {MESES[target.mes]} {target.anio}
              </Text>
            )}

            <TouchableOpacity style={s.opcionBtn} onPress={() => firmar('DINERO')} disabled={saving}>
              <Text style={s.opcionEmoji}>💰</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.opcionTitle}>Pagar en nómina</Text>
                <Text style={s.opcionDesc}>Se abonarán las horas en tu próxima nómina</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={s.opcionBtn} onPress={() => firmar('DESCANSO')} disabled={saving}>
              <Text style={s.opcionEmoji}>🌴</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.opcionTitle}>Compensar con descanso</Text>
                <Text style={s.opcionDesc}>Las horas se convertirán en tiempo libre equivalente</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={s.modalCancel} onPress={() => setTarget(null)} disabled={saving}>
              <Text style={s.modalCancelText}>Cancelar</Text>
            </TouchableOpacity>

            {saving && <ActivityIndicator color="#00923C" style={{ marginTop: 12 }} />}
          </View>
        </View>
      </Modal>
    </ScrollView>
  )
}

const s = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#D6F0E0', flexGrow: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#D6F0E0' },
  title: { fontSize: 22, fontWeight: '700', color: '#131B27' },
  subtitle: { fontSize: 13, color: '#5A6475', marginTop: 4, marginBottom: 20, lineHeight: 18 },
  empty: { alignItems: 'center', padding: 40 },
  emptyIcon: { fontSize: 48, color: '#00923C', marginBottom: 12 },
  emptyText: { fontSize: 15, color: '#5A6475' },
  card: {
    backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  cardPeriodo: { fontSize: 16, fontWeight: '700', color: '#131B27', marginBottom: 12 },
  row: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  col: { flex: 1 },
  colLabel: { fontSize: 11, color: '#5A6475', textTransform: 'uppercase', marginBottom: 4 },
  colValue: { fontSize: 16, fontWeight: '700', color: '#131B27' },
  firmarBtn: { backgroundColor: '#00923C', borderRadius: 10, padding: 12, alignItems: 'center' },
  firmarText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 32 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#131B27' },
  modalSubtitle: { fontSize: 13, color: '#5A6475', marginBottom: 20, marginTop: 4 },
  opcionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingVertical: 16, paddingHorizontal: 16, borderRadius: 12,
    backgroundColor: '#F7F9FC', marginBottom: 10,
  },
  opcionEmoji: { fontSize: 30 },
  opcionTitle: { fontSize: 16, fontWeight: '700', color: '#131B27' },
  opcionDesc: { fontSize: 12, color: '#5A6475', marginTop: 2 },
  modalCancel: { marginTop: 4, padding: 14, alignItems: 'center' },
  modalCancelText: { fontSize: 15, fontWeight: '600', color: '#5A6475' },
})