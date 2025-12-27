import React, { useState, lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import SystemBoot from './components/SystemBoot'

// Lazy load route components for code splitting
const CreativeDashboard = lazy(() => import('./modules/creative/CreativeDashboard'))
const ProStudio = lazy(() => import('./modules/studio/ProStudio'))
const AssetLibrary = lazy(() => import('./modules/estudio/AssetLibrary'))
const TrainingCenter = lazy(() => import('./modules/training/TrainingCenter'))
const SettingsPage = lazy(() => import('./modules/settings/SettingsPage'))
const ModelHubPage = lazy(() => import('./modules/hub/ModelHubPage'))

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
    <div className="text-center">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
      <p className="text-gray-300 text-lg">Cargando módulo...</p>
    </div>
  </div>
)

const App: React.FC = () => {
  const [booted, setBooted] = useState(false)

  if (!booted) {
    return <SystemBoot onComplete={() => setBooted(true)} />
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Navigate to="/creative" replace />} />
          <Route
            path="creative"
            element={
              <Suspense fallback={<LoadingFallback />}>
                <CreativeDashboard />
              </Suspense>
            }
          />
          <Route
            path="studio"
            element={
              <Suspense fallback={<LoadingFallback />}>
                <ProStudio />
              </Suspense>
            }
          />
          <Route
            path="library"
            element={
              <Suspense fallback={<LoadingFallback />}>
                <AssetLibrary />
              </Suspense>
            }
          />
          <Route
            path="training"
            element={
              <Suspense fallback={<LoadingFallback />}>
                <TrainingCenter />
              </Suspense>
            }
          />
          <Route
            path="hub"
            element={
              <Suspense fallback={<LoadingFallback />}>
                <ModelHubPage />
              </Suspense>
            }
          />
          <Route
            path="settings"
            element={
              <Suspense fallback={<LoadingFallback />}>
                <SettingsPage />
              </Suspense>
            }
          />
        </Route>
      </Routes>
    </Router>
  )
}

export default App

