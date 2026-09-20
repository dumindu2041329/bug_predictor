import type {
  AuthResponse,
  Chat,
  ChatSummary,
  ModelsResponse,
  PredictResponse,
  User,
} from './types'

const API_BASE = import.meta.env.VITE_API_URL ?? ''
const TOKEN_KEY = 'cbs_token'

/** Fired whenever the backend rejects our token — the auth layer signs out. */
export const UNAUTHORIZED_EVENT = 'cbs-unauthorized'

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  } catch {
    // storage unavailable — session lasts only while the tab is open
  }
}

function authHeaders(): Record<string, string> {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function errorFrom(res: Response, fallback: string): Promise<Error> {
  if (res.status === 401) window.dispatchEvent(new Event(UNAUTHORIZED_EVENT))
  const body = await res.json().catch(() => ({}))
  return new Error(body.error ?? `${fallback} (${res.status})`)
}

/** Sign in with email + password. Returns the JWT and user profile. */
export async function login(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) throw await errorFrom(res, 'Sign in failed')
  return res.json()
}

/** Create an account. Returns the JWT and user profile (auto sign-in). */
export async function register(
  name: string,
  email: string,
  password: string,
): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  })
  if (!res.ok) throw await errorFrom(res, 'Registration failed')
  return res.json()
}

/** Fetch the signed-in user for the stored token (session restore). */
export async function fetchMe(): Promise<User> {
  const res = await fetch(`${API_BASE}/api/auth/me`, { headers: authHeaders() })
  if (!res.ok) {
    if (res.status === 401) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.msg ?? 'Session expired')
    }
    throw await errorFrom(res, 'Session check failed')
  }
  const data = await res.json()
  return data.user
}

/** Fetch the list of available ML models from the backend. */
export async function fetchModels(): Promise<ModelsResponse> {
  const res = await fetch(`${API_BASE}/api/models`, { headers: authHeaders() })
  if (!res.ok) throw await errorFrom(res, 'Failed to load models')
  return res.json()
}

/** Upload two source files plus the selected model and get predictions. */
export async function predict(
  file1: File,
  file2: File,
  modelKey: string,
): Promise<PredictResponse> {
  const form = new FormData()
  form.append('file1', file1)
  form.append('file2', file2)
  form.append('model', modelKey)

  const res = await fetch(`${API_BASE}/api/predict`, {
    method: 'POST',
    headers: authHeaders(),
    body: form,
  })
  if (!res.ok) throw await errorFrom(res, 'Prediction failed')
  return res.json()
}

/** List the signed-in user's saved analysis chats. */
export async function fetchChats(): Promise<ChatSummary[]> {
  const res = await fetch(`${API_BASE}/api/chats`, { headers: authHeaders() })
  if (!res.ok) throw await errorFrom(res, 'Failed to load chats')
  const data = await res.json()
  return data.chats
}

/** Save a new chat (analysis session) for the signed-in user. */
export async function createChat(
  title: string,
  model: string,
  payload: PredictResponse,
): Promise<ChatSummary> {
  const res = await fetch(`${API_BASE}/api/chats`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ title, model, payload }),
  })
  if (!res.ok) throw await errorFrom(res, 'Failed to save chat')
  const data = await res.json()
  return data.chat
}

/** Fetch one chat with its full stored prediction payload. */
export async function fetchChat(id: number): Promise<Chat> {
  const res = await fetch(`${API_BASE}/api/chats/${id}`, { headers: authHeaders() })
  if (!res.ok) throw await errorFrom(res, 'Failed to load chat')
  const data = await res.json()
  return data.chat
}

/** Permanently delete one of the user's saved chats. */
export async function deleteChat(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/api/chats/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  if (!res.ok) throw await errorFrom(res, 'Failed to delete chat')
}

/** Pin or unpin a chat. */
export async function setChatPinned(id: number, pinned: boolean): Promise<ChatSummary> {
  const res = await fetch(`${API_BASE}/api/chats/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ pinned }),
  })
  if (!res.ok) throw await errorFrom(res, 'Failed to update chat')
  const data = await res.json()
  return data.chat
}
