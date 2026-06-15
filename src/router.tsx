import { createBrowserRouter } from 'react-router-dom'
import { PublicLayout }          from './components/PublicLayout'
import { LandingPage }           from './pages/LandingPage'
import { RegistroPage }          from './pages/RegistroPage'
import { LoginPage }             from './pages/LoginPage'
import { RecuperarPasswordPage } from './pages/RecuperarPasswordPage'
import { ContactoPage }          from './pages/ContactoPage'
import { PrivacidadPage }        from './pages/PrivacidadPage'
import { TerminosPage }          from './pages/TerminosPage'
import { AvisoLegalPage }        from './pages/AvisoLegalPage'
import { PanelLayout }           from './panel/PanelLayout'
import { DashboardPage }         from './panel/DashboardPage'
import { EmpleadosPage }         from './panel/EmpleadosPage'
import { FichajesPage }          from './panel/FichajesPage'
import { PanelLoginPage }        from './panel/PanelLoginPage'
import { VacacionesPage }        from './panel/VacacionesPage'
import { ComputoEquipoPage }     from './panel/ComputoEquipoPage'
import { ComputoEmpleadoPage }   from './panel/ComputoEmpleadoPage'
import { RltResumenPage }        from './panel/RltResumenPage'
import { RltFichajesPage }       from './panel/RltFichajesPage'
import { RltVacacionesPage }     from './panel/RltVacacionesPage'
import { IntegridadPage }        from './panel/IntegridadPanel'
import { LicenciaPage}           from './panel/LicenciaPage'

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: '/',            element: <LandingPage /> },
      { path: '/registro',    element: <RegistroPage /> },
      { path: '/login',       element: <LoginPage /> },
      { path: '/recuperar',   element: <RecuperarPasswordPage /> },
      { path: '/contacto',    element: <ContactoPage /> },
      { path: '/privacidad',  element: <PrivacidadPage /> },
      { path: '/terminos',    element: <TerminosPage /> },
      { path: '/aviso-legal', element: <AvisoLegalPage /> },
    ],
  },
  {
    path: '/:slug/login',
    element: <PanelLoginPage />,
  },
  {
    path: '/:slug',
    element: <PanelLayout />,
    children: [
      { index: true,                element: <DashboardPage /> },
      { path: 'dashboard',          element: <DashboardPage /> },
      { path: 'empleados',          element: <EmpleadosPage /> },
      { path: 'fichajes',           element: <FichajesPage /> },
      { path: 'vacaciones',         element: <VacacionesPage /> },
      { path: 'computo-equipo',     element: <ComputoEquipoPage /> },
      { path: 'computo-empleado',   element: <ComputoEmpleadoPage /> },
      { path: 'licencia',           element: <LicenciaPage /> },
      // RLT
      { path: 'rlt-resumen',        element: <RltResumenPage /> },
      { path: 'rlt-fichajes',       element: <RltFichajesPage /> },
      { path: 'rlt-vacaciones',     element: <RltVacacionesPage /> },
      { path: 'integridad',         element: <IntegridadPage /> },
    ],
  },
])