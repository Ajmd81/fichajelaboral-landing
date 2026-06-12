import { Tabs } from 'expo-router'
import { Text } from 'react-native'

function Icon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>
}

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: '#00923C',
      tabBarInactiveTintColor: '#9BA5B4',
      tabBarStyle: { borderTopColor: '#DDE2EA', paddingBottom: 4 },
      headerStyle: { backgroundColor: '#fff' },
      headerTitleStyle: { fontWeight: '700', color: '#131B27' },
      headerShadowVisible: false,
    }}>
      <Tabs.Screen name="fichaje"        options={{ title: 'Fichar',    tabBarIcon: ({ focused }) => <Icon emoji="🕐" focused={focused} /> }} />
      <Tabs.Screen name="historial"      options={{ title: 'Historial', tabBarIcon: ({ focused }) => <Icon emoji="📋" focused={focused} /> }} />
      <Tabs.Screen name="vacaciones"     options={{ title: 'Vacaciones', tabBarIcon: ({ focused }) => <Icon emoji="🏖" focused={focused} /> }} />
      <Tabs.Screen name="compensaciones" options={{ title: 'Extras',    tabBarIcon: ({ focused }) => <Icon emoji="💰" focused={focused} /> }} />
      <Tabs.Screen name="perfil"         options={{ title: 'Perfil',    tabBarIcon: ({ focused }) => <Icon emoji="👤" focused={focused} /> }} />
    </Tabs>
  )
}