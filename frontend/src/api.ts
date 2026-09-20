import type { ModelsResponse, PredictResponse } from './types'

const API_BASE = import.meta.env.VITE_API_URL ?? ''

/** Fetch the list of available ML models from the backend. */
export async function fetchModels(): Promise<ModelsResponse> {
  const res = await fetch(`${API_BASE}/api/models`)
  if (!res.ok) throw new Error(`Failed to load models (${res.status})`)
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
    body: form,
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? `Prediction failed (${res.status})`)
  }
  return res.json()
}
