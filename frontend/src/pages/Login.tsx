import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import AuthShell, { inputClass, labelClass } from '../components/AuthShell'

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setPending(true)
    setError(null)
    try {
      await signIn(email, password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed.')
    } finally {
      setPending(false)
    }
  }

  return (
    <AuthShell>
      <h1 className="font-display text-2xl font-extrabold tracking-tight uppercase">Sign in</h1>
      <p className="text-muted mt-2 text-sm">
        Welcome back — pick up where you left off.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
        <div>
          <label htmlFor="email" className={labelClass}>
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            placeholder="you@studio.dev"
          />
        </div>
        <div>
          <label htmlFor="password" className={labelClass}>
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
            placeholder="••••••••"
          />
        </div>

        {error && (
          <p
            role="alert"
            className="border-accent-2/40 bg-accent-2/10 text-accent-2 rounded-lg border px-4 py-3 text-sm"
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className={`font-display w-full rounded-xl py-3 text-sm font-bold tracking-[0.18em] uppercase transition-colors ${
            pending ? 'bg-card text-muted cursor-not-allowed' : 'bg-accent text-on-accent hover:opacity-85'
          }`}
        >
          {pending ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p className="text-muted mt-6 text-center text-sm">
        No account yet?{' '}
        <Link to="/register" className="text-accent font-semibold underline-offset-4 hover:underline">
          Create one
        </Link>
      </p>
    </AuthShell>
  )
}
