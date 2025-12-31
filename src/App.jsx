import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import SkillSetupPage from './pages/SkillSetupPage'
import Dashboard from './pages/Dashboard'
import OnboardingPage from './pages/OnboardingPage'

import ProtectedRoute from './components/ProtectedRoute'
import SkillSetupRoute from './components/SkillSetupRoute'
import SetupCompleteRoute from './components/SetupCompleteRoute'

function App() {
  return (
    <AuthProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
          <Routes>
            <Route path="/" element={<LandingPage />} />

            <Route path="/login" element={<LoginPage />} />
            <Route path="/skill-setup" element={
              <ProtectedRoute>
                <SetupCompleteRoute>
                  <SkillSetupPage />
                </SetupCompleteRoute>
              </ProtectedRoute>
            } />
            <Route path="/onboarding" element={
              <ProtectedRoute>
                <SetupCompleteRoute>
                  <OnboardingPage />
                </SetupCompleteRoute>
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <SkillSetupRoute>
                  <Dashboard />
                </SkillSetupRoute>
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App