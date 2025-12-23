import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import CreativeDashboard from './modules/creative/CreativeDashboard'
import ProStudio from './modules/studio/ProStudio'
import AssetLibrary from './modules/estudio/AssetLibrary'
import TrainingCenter from './modules/training/TrainingCenter'
import SettingsPage from './modules/settings/SettingsPage'
import SystemBoot from './components/SystemBoot' // Import Boot Screen

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
          <Route path="creative" element={<CreativeDashboard />} />
          <Route path="studio" element={<ProStudio />} />
          <Route path="assets" element={<AssetLibrary />} />
          <Route path="training" element={<TrainingCenter />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
