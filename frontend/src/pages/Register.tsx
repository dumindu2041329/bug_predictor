import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import AuthShell, { inputClass, labelClass } from '../components/AuthShell'

export default function Register() {
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setPending(true)
    setError(null)
    try {
      await signUp(name, email, password)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed.')
    } finally {
      setPending(false)
    }
  }

  return (
    <AuthShell>
      <h1 className="font-display text-2xl font-extrabold tracking-tight uppercase">
        Create account
      </h1>
      <p className="text-muted mt-2 text-sm">
        One account, unlimited file scorings.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
        <div>
          <label htmlFor="name" className={labelClass}>
            Name
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
            placeholder="Your name"
          />
        </div>
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
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
            placeholder="At least 8 characters"
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
          {pending ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="text-muted mt-6 text-center text-sm">
        Already registered?{' '}
        <Link to="/login" className="text-accent font-semibold underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
    </AuthShell>
  )
}
