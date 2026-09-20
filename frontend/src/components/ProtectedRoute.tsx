import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

function SessionLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="font-mono text-muted text-xs tracking-[0.2em] uppercase">
        Restoring session
        <span className="load-dot"> ·</span>
        <span className="load-dot"> ·</span>
        <span className="load-dot"> ·</span>
      </p>
    </div>
  )
}

/** Block unauthenticated visitors; remembers where they were headed. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { status } = useAuth()
  const location = useLocation()

  if (status === 'loading') return <SessionLoader />
  if (status !== 'authed') {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }
  return <>{children}</>
}

/** Keep signed-in users out of the login / register screens. */
export function RedirectIfAuthed({ children }: { children: ReactNode }) {
  const { status } = useAuth()

  if (status === 'loading') return <SessionLoader />
  if (status === 'authed') return <Navigate to="/dashboard" replace />
  return <>{children}</>
}
