import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
import { ChatProvider } from './chat/ChatContext'
import { RedirectIfAuthed, RequireAuth } from './components/ProtectedRoute'
import ChatView from './pages/ChatView'
import Dashboard from './pages/Dashboard'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Placeholder from './pages/Placeholder'
import Predictor from './pages/Predictor'
import Register from './pages/Register'

export default function App() {
  return (
    <AuthProvider>
      <ChatProvider>
        <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route
            path="/login"
            element={
              <RedirectIfAuthed>
                <Login />
              </RedirectIfAuthed>
            }
          />
          <Route
            path="/register"
            element={
              <RedirectIfAuthed>
                <Register />
              </RedirectIfAuthed>
            }
          />
          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <Dashboard />
              </RequireAuth>
            }
          >
            <Route index element={<Predictor />} />
            <Route path="chat/:chatId" element={<ChatView />} />
            <Route
              path="profile"
              element={
                <Placeholder
                  title="Profile"
                  note="Your account details and preferences will live here once the research tooling is wired up."
                />
              }
            />
            <Route
              path="settings"
              element={
                <Placeholder
                  title="Settings"
                  note="Model thresholds, dataset sources and workspace settings are on the roadmap."
                />
              }
            />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </BrowserRouter>
      </ChatProvider>
    </AuthProvider>
  )
}
