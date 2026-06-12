import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native'
import { router } from 'expo-router'
import { login } from '../services/auth'

export default function LoginScreen() {
  const [form, setForm] = useState({ empresaSlug: '', telefono: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function normalizarTelefono(input: string): string {
    return input.replace(/[\s\-()]/g, '').replace(/^\+34/, '').replace(/^0034/, '')
  }

  function esTelefonoValido(tel: string): boolean {
    return /^[67]\d{8}$/.test(tel)
  }

  async function handleLogin() {
    setError('')

    if (!form.empresaSlug || !form.telefono || !form.password) {
      setError('Rellena todos los campos.')
      return
    }

    const tel = normalizarTelefono(form.telefono)
    if (!esTelefonoValido(tel)) {
      setError('Teléfono inválido.\nDebe ser un móvil español (9 dígitos comenzando por 6 o 7).')
      return
    }

    setLoading(true)
    try {
      await login(form.empresaSlug, tel, form.password)
      router.replace('/(tabs)/fichaje')
    } catch (err: unknown) {
      const e = err as {
        response?: { status?: number; data?: { message?: string } }
        code?: string
        message?: string
      }
      const status = e?.response?.status ?? 0
      const msg    = e?.response?.data?.message ?? ''

      // ── Sin response = network error real ────────────────────
      if (!e?.response) {
        if (e?.code === 'ECONNABORTED') {
          setError('El servidor tardó demasiado en responder. Vuelve a intentarlo.')
        } else {
          setError('Sin conexión al servidor.\nComprueba tu internet o vuelve a intentarlo más tarde.')
        }
        return
      }

      // ── Errores con response: usar status + mensaje ──────────
      if (status === 403 && msg.includes('DEMO_EXPIRADA')) {
        setError('El periodo de demo ha finalizado.\nContacta con el administrador para activar la licencia.')
      } else if (status === 403 && (msg.includes('DEVICE_NOT_AUTHORIZED') || msg.toLowerCase().includes('dispositivo'))) {
        setError('Este usuario ya está vinculado a otro dispositivo.\nContacta con el administrador.')
      } else if (status === 401) {
        setError('Teléfono o contraseña incorrectos.')
      } else if (msg) {
        setError(msg)
      } else {
        setError('Error inesperado (código ' + status + ').\nInténtalo de nuevo.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
        {/* Logo */}
        <View style={s.logoWrap}>
          <View style={s.logoCircle}>
            <Text style={s.logoIcon}>🕐</Text>
          </View>
          <Text style={s.title}>FichajesLaborales</Text>
          <Text style={s.subtitle}>Accede con tu teléfono móvil</Text>
        </View>

        {/* Formulario */}
        <View style={s.card}>
          <Text style={s.label}>Empresa</Text>
          <TextInput style={s.input} placeholder="mi-empresa"
            autoCapitalize="none" autoCorrect={false}
            value={form.empresaSlug}
            onChangeText={v => setForm(p => ({ ...p, empresaSlug: v }))} />

          <Text style={s.label}>Teléfono móvil</Text>
          <TextInput
            style={s.input}
            placeholder="600 123 456"
            keyboardType="phone-pad"
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={15}
            value={form.telefono}
            onChangeText={v => setForm(p => ({ ...p, telefono: v }))} />
          <Text style={s.helper}>Móvil español de 9 dígitos (sin prefijo)</Text>

          <Text style={s.label}>Contraseña</Text>
          <TextInput style={s.input} placeholder="••••••"
            secureTextEntry
            value={form.password}
            onChangeText={v => setForm(p => ({ ...p, password: v }))} />

          {!!error && <View style={s.errorBox}><Text style={s.errorText}>{error}</Text></View>}

          <TouchableOpacity style={[s.btn, loading && s.btnDisabled]}
            onPress={handleLogin} disabled={loading} activeOpacity={0.8}>
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={s.btnText}>Entrar</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const s = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: 24, backgroundColor: '#D6F0E0' },
  logoWrap: { alignItems: 'center', marginBottom: 28 },
  logoCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#E6F5EC', justifyContent: 'center', alignItems: 'center', marginBottom: 12, borderWidth: 2, borderColor: '#00923C' },
  logoIcon: { fontSize: 34 },
  title: { fontSize: 24, fontWeight: '700', color: '#131B27' },
  subtitle: { fontSize: 14, color: '#5A6475', marginTop: 4 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 24, shadowColor: '#000', shadowOpacity: 0.10, shadowRadius: 12, elevation: 4 },
  label: { fontSize: 13, fontWeight: '600', color: '#5A6475', marginBottom: 5, marginTop: 14 },
  helper: { fontSize: 11, color: '#9BA5B4', marginTop: 4 },
  input: { borderWidth: 1.5, borderColor: '#DDE2EA', borderRadius: 10, padding: 12, fontSize: 15, backgroundColor: '#F7F9FC' },
  errorBox: { backgroundColor: '#FEF0F0', borderRadius: 8, padding: 12, marginTop: 14, borderLeftWidth: 3, borderLeftColor: '#D2514E' },
  errorText: { color: '#D2514E', fontSize: 13, lineHeight: 18 },
  btn: { backgroundColor: '#00923C', borderRadius: 12, padding: 15, alignItems: 'center', marginTop: 22, shadowColor: '#00923C', shadowOpacity: 0.30, shadowRadius: 8, elevation: 3 },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
})