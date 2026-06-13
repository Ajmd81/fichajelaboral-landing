import { useEffect, useState } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator,
  Modal, TextInput, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native'
import { router } from 'expo-router'
import { getSession, logout } from '../../services/auth'
import { api } from '../../services/api'

interface Session {
  username?: string
  role?: string
  empresaSlug?: string
  empresaNombre?: string
  demo?: boolean
  diasRestantesDemo?: number
}

export default function PerfilScreen() {
  const [session, setSession] = useState<Session | null>(null)

  // Modal cambio contraseña
  const [modal,           setModal]           = useState(false)
  const [passwordActual,  setPasswordActual]  = useState('')
  const [passwordNueva,   setPasswordNueva]   = useState('')
  const [passwordRepetir, setPasswordRepetir] = useState('')
  const [saving,          setSaving]          = useState(false)
  const [error,           setError]           = useState('')
  const [verPassword,     setVerPassword]     = useState(false)

  useEffect(() => {
    void getSession().then(setSession)
  }, [])

  function handleLogout() {
    Alert.alert('Cerrar sesión', '¿Seguro que quieres salir?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Salir', style: 'destructive', onPress: async () => {
          await logout()
          router.replace('/login')
        }
      }
    ])
  }

  function abrirModalPassword() {
    setPasswordActual('')
    setPasswordNueva('')
    setPasswordRepetir('')
    setError('')
    setVerPassword(false)
    setModal(true)
  }

  async function cambiarPassword() {
    setError('')
    if (!passwordActual || !passwordNueva || !passwordRepetir) {
      setError('Rellena todos los campos.')
      return
    }
    if (passwordNueva.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres.')
      return
    }
    if (passwordNueva !== passwordRepetir) {
      setError('Las contraseñas nuevas no coinciden.')
      return
    }
    if (passwordNueva === passwordActual) {
      setError('La nueva contraseña no puede ser igual a la actual.')
      return
    }

    setSaving(true)
    try {
      await api.post('/auth/cambiar-password', {
        passwordActual,
        passwordNueva,
      })
      setModal(false)
      Alert.alert('Contraseña cambiada', 'Tu contraseña se ha actualizado correctamente.')
    } catch (err: unknown) {
      const e = err as { response?: { status?: number; data?: { message?: string } } }
      const msg = e?.response?.data?.message ?? ''
      if (e?.response?.status === 401) {
        setError('La contraseña actual no es correcta.')
      } else if (msg) {
        setError(msg)
      } else {
        setError('Error al cambiar la contraseña. Inténtalo de nuevo.')
      }
    } finally {
      setSaving(false)
    }
  }

  if (!session) {
    return <View style={s.center}><ActivityIndicator color="#00923C" /></View>
  }

  const isDemo = session.demo === true
  const diasRestantes = session.diasRestantesDemo ?? 0

  return (
    <ScrollView contentContainerStyle={s.container}>
      {/* Banner demo */}
      {isDemo && (
        <View style={[s.demoBanner, diasRestantes <= 3 ? s.demoUrgente : diasRestantes <= 7 ? s.demoAdvertencia : s.demoNormal]}>
          <Text style={s.demoText}>
            {diasRestantes > 0
              ? `🕐 Demo · ${diasRestantes} ${diasRestantes === 1 ? 'día' : 'días'} restantes`
              : '⚠️ ¡Demo expirada! Contacta con el administrador.'}
          </Text>
        </View>
      )}

      {/* Avatar */}
      <View style={s.avatarWrap}>
        <View style={s.avatar}>
          <Text style={s.avatarText}>{session.username?.[0]?.toUpperCase() ?? '?'}</Text>
        </View>
        <Text style={s.username}>{session.username}</Text>
        <View style={[s.roleBadge, session.role === 'ADMIN' ? s.roleAdmin : s.roleEmployee]}>
          <Text style={[s.roleText, { color: session.role === 'ADMIN' ? '#0C447C' : '#085041' }]}>
            {session.role === 'ADMIN' ? 'Administrador' : 'Empleado'}
          </Text>
        </View>
      </View>

      {/* Info */}
      <View style={s.infoCard}>
        <InfoRow label="Empresa" value={session.empresaNombre ?? session.empresaSlug ?? '—'} />
        <InfoRow label="Slug" value={session.empresaSlug ?? '—'} />
        <InfoRow label="Rol" value={session.role === 'ADMIN' ? 'Administrador' : 'Empleado'} />
        {isDemo && <InfoRow label="Plan" value={`Demo (${diasRestantes} días restantes)`} />}
      </View>

      {/* Cambiar contraseña */}
      <TouchableOpacity style={s.actionBtn} onPress={abrirModalPassword} activeOpacity={0.8}>
        <Text style={s.actionIcon}>🔒</Text>
        <View style={{ flex: 1 }}>
          <Text style={s.actionTitle}>Cambiar contraseña</Text>
          <Text style={s.actionDesc}>Actualiza la contraseña de acceso a la app</Text>
        </View>
        <Text style={s.actionArrow}>›</Text>
      </TouchableOpacity>

      {/* Logout */}
      <TouchableOpacity style={s.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
        <Text style={s.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>

      {/* ─── Modal cambiar contraseña ─── */}
      <Modal visible={modal} transparent animationType="slide" onRequestClose={() => setModal(false)}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={s.modalOverlay}>
            <View style={s.modalSheet}>
              <View style={s.modalHeader}>
                <Text style={s.modalTitle}>Cambiar contraseña</Text>
                <TouchableOpacity onPress={() => setModal(false)}>
                  <Text style={s.modalClose}>✕</Text>
                </TouchableOpacity>
              </View>

              <Text style={s.label}>Contraseña actual</Text>
              <TextInput style={s.input}
                placeholder="••••••"
                secureTextEntry={!verPassword}
                value={passwordActual}
                onChangeText={setPasswordActual} />

              <Text style={s.label}>Nueva contraseña</Text>
              <TextInput style={s.input}
                placeholder="Mínimo 6 caracteres"
                secureTextEntry={!verPassword}
                value={passwordNueva}
                onChangeText={setPasswordNueva} />

              <Text style={s.label}>Repetir nueva contraseña</Text>
              <TextInput style={s.input}
                placeholder="Repítela para confirmar"
                secureTextEntry={!verPassword}
                value={passwordRepetir}
                onChangeText={setPasswordRepetir} />

              <TouchableOpacity onPress={() => setVerPassword(v => !v)} style={s.toggleBtn}>
                <Text style={s.toggleText}>{verPassword ? '🙈 Ocultar contraseñas' : '👁 Mostrar contraseñas'}</Text>
              </TouchableOpacity>

              {!!error && (
                <View style={s.errorBox}><Text style={s.errorText}>{error}</Text></View>
              )}

              <View style={s.modalActions}>
                <TouchableOpacity style={s.modalCancelBtn} onPress={() => setModal(false)} disabled={saving}>
                  <Text style={s.modalCancelText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[s.modalSaveBtn, saving && s.btnDisabled]}
                  onPress={cambiarPassword} disabled={saving}>
                  {saving
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={s.modalSaveText}>Guardar</Text>}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </ScrollView>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#EEF1F5' }}>
      <Text style={{ fontSize: 14, color: '#5A6475' }}>{label}</Text>
      <Text style={{ fontSize: 14, fontWeight: '600', color: '#131B27' }}>{value}</Text>
    </View>
  )
}

const s = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#D6F0E0', padding: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#D6F0E0' },
  demoBanner: { borderRadius: 12, padding: 12, marginBottom: 16 },
  demoNormal: { backgroundColor: '#E6F5EC', borderWidth: 1, borderColor: '#00923C' },
  demoAdvertencia: { backgroundColor: '#FAEEDA', borderWidth: 1, borderColor: '#F5A623' },
  demoUrgente: { backgroundColor: '#FEF0F0', borderWidth: 1, borderColor: '#D2514E' },
  demoText: { fontSize: 13, fontWeight: '600', textAlign: 'center', color: '#131B27' },
  avatarWrap: { alignItems: 'center', marginBottom: 24 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#00923C', justifyContent: 'center', alignItems: 'center', marginBottom: 12, shadowColor: '#00923C', shadowOpacity: 0.30, shadowRadius: 10, elevation: 4 },
  avatarText: { fontSize: 32, color: '#fff', fontWeight: '700' },
  username: { fontSize: 20, fontWeight: '700', color: '#131B27', marginBottom: 6 },
  roleBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 99 },
  roleAdmin: { backgroundColor: '#E6F1FB' },
  roleEmployee: { backgroundColor: '#E1F5EE' },
  roleText: { fontSize: 12, fontWeight: '700' },
  infoCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 10, elevation: 3 },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  actionIcon: { fontSize: 24 },
  actionTitle: { fontSize: 15, fontWeight: '700', color: '#131B27' },
  actionDesc: { fontSize: 12, color: '#5A6475', marginTop: 2 },
  actionArrow: { fontSize: 22, color: '#9BA5B4' },
  logoutBtn: { backgroundColor: '#FEF0F0', borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#F9C8C8', marginTop: 8 },
  logoutText: { color: '#D2514E', fontWeight: '700', fontSize: 15 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalSheet:   { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 32 },
  modalHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  modalTitle:   { fontSize: 20, fontWeight: '700', color: '#131B27' },
  modalClose:   { fontSize: 22, color: '#9BA5B4' },
  label: { fontSize: 12, fontWeight: '600', color: '#5A6475', marginBottom: 6, marginTop: 10 },
  input: { borderWidth: 1.5, borderColor: '#DDE2EA', borderRadius: 10, padding: 12, fontSize: 15, backgroundColor: '#F7F9FC' },
  toggleBtn:  { alignSelf: 'center', marginTop: 12, padding: 8 },
  toggleText: { fontSize: 13, color: '#00923C', fontWeight: '600' },
  errorBox:  { backgroundColor: '#FEF0F0', borderRadius: 8, padding: 12, marginTop: 14, borderLeftWidth: 3, borderLeftColor: '#D2514E' },
  errorText: { color: '#D2514E', fontSize: 13, lineHeight: 18 },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 20 },
  modalCancelBtn: { flex: 1, padding: 14, borderRadius: 10, borderWidth: 1.5, borderColor: '#DDE2EA', alignItems: 'center' },
  modalCancelText: { color: '#5A6475', fontWeight: '700' },
  modalSaveBtn:   { flex: 1, padding: 14, borderRadius: 10, backgroundColor: '#00923C', alignItems: 'center' },
  modalSaveText:  { color: '#fff', fontWeight: '700' },
  btnDisabled:    { opacity: 0.6 },
})