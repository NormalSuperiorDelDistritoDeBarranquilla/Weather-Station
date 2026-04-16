import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { AuthRedirectRoute } from './components/AuthRedirectRoute'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AppShell } from './layouts/AppShell'
import { AboutPage } from './pages/AboutPage'
import { ChartsPage } from './pages/ChartsPage'
import { ConsoleHomePage } from './pages/ConsoleHomePage'
import { DashboardPage } from './pages/DashboardPage'
import { HistoryPage } from './pages/HistoryPage'
import { HomePage } from './pages/HomePage'
import { LiveStatusPage } from './pages/LiveStatusPage'
import { LoginPage } from './pages/LoginPage'
import { LocationPage } from './pages/LocationPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { ProjectAboutPage } from './pages/ProjectAboutPage'
import { SensorDetailPage } from './pages/SensorDetailPage'
import { TechnologiesPage } from './pages/TechnologiesPage'

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/estado-en-vivo" element={<LiveStatusPage />} />
        <Route path="/ubicacion" element={<LocationPage />} />
        <Route path="/tecnologias" element={<TechnologiesPage />} />
        <Route
          path="/login"
          element={
            <AuthRedirectRoute>
              <LoginPage />
            </AuthRedirectRoute>
          }
        />
        <Route path="/about" element={<AboutPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route path="/dashboard" element={<ConsoleHomePage />} />
            <Route path="/overview" element={<DashboardPage />} />
            <Route path="/sensors/:metricKey" element={<SensorDetailPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/charts" element={<ChartsPage />} />
            <Route path="/project-about" element={<ProjectAboutPage />} />
          </Route>
        </Route>

        <Route path="/inicio" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}
