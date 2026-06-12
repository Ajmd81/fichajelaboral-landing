import { useEffect, useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native'
import { router } from 'expo-router'
import { getSession, logout } from '../../services/auth'

export default function PerfilScreen() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [session, setSession] = useState<any>(null)

  useEffect(() => {
    getSession().then(setSession)
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

  if (!session) {
    return <View style={s.center}><ActivityIndicator color="#00923C" /></View>
  }

  const isDemo = session.demo === true
  const diasRestantes = session.diasRestantesDemo ?? 0

  return (
    <View style={s.container}>
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
        <InfoRow label="Empresa" value={session.empresaNombre ?? session.empresaSlug} />
        <InfoRow label="Slug" value={session.empresaSlug} />
        <InfoRow label="Rol" value={session.role === 'ADMIN' ? 'Administrador' : 'Empleado'} />
        {isDemo && <InfoRow label="Plan" value={`Demo (${diasRestantes} días restantes)`} />}
      </View>

      <TouchableOpacity style={s.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
        <Text style={s.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
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
  container: { flex: 1, backgroundColor: '#D6F0E0', padding: 20 },
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
  infoCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 24, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 10, elevation: 3 },
  logoutBtn: { backgroundColor: '#FEF0F0', borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#F9C8C8' },
  logoutText: { color: '#D2514E', fontWeight: '700', fontSize: 15 },
})