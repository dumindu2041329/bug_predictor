import { useEffect, useState } from 'react'
import { fetchModels, predict } from './api'
import FileDropzone from './components/FileDropzone'
import ModelSelector from './components/ModelSelector'
import ResultCard from './components/ResultCard'
import type { FilePrediction, ModelInfo, PredictResponse } from './types'

export default function App() {
  const [models, setModels] = useState<ModelInfo[]>([])
  const [selectedModel, setSelectedModel] = useState('random_forest')
  const [file1, setFile1] = useState<File | null>(null)
  const [file2, setFile2] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<PredictResponse | null>(null)

  useEffect(() => {
    fetchModels()
      .then((data) => {
        setModels(data.models)
        if (data.models.length > 0 && !data.models.some((m) => m.key === selectedModel)) {
          setSelectedModel(data.models[0].key)
        }
      })
      .catch((err: Error) => setError(err.message))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const canAnalyse = Boolean(file1 && file2 && selectedModel) && !loading

  const handleAnalyse = async () => {
    if (!file1 || !file2) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const data = await predict(file1, file2, selectedModel)
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  const summary = (files: FilePrediction[]) => {
    const buggy = files.filter((f) => f.prediction === 1).length
    return { buggy, total: files.length }
  }

  return (
    <div className="relative z-10 mx-auto max-w-4xl px-6 pb-24">
      {/* Header */}
      <header className="border-line border-b pb-8">
        <div className="mb-6 mt-10 flex items-center gap-2.5">
          <span className="logo-dot bg-accent inline-block h-2 w-2 rounded-full" />
          <span className="font-mono text-accent text-sm tracking-[0.2em] uppercase">
            CrossBugSense
          </span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Cross-Language
          <br />
          <span className="text-accent">Bug Predictor</span>
        </h1>
        <p className="text-muted mt-4 max-w-xl text-sm leading-relaxed">
          Upload two C# or JavaScript source files. Twenty-four source-code and code-smell
          metrics are extracted from each file and scored by a machine-learning model to
          predict whether the file is bug-prone.
        </p>
      </header>

      {/* Upload section */}
      <section className="mt-10">
        <h2 className="font-mono text-muted mb-4 text-xs tracking-[0.25em] uppercase">
          01 — Upload source files
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <FileDropzone label="File A" file={file1} onFileSelected={setFile1} />
          <FileDropzone label="File B" file={file2} onFileSelected={setFile2} />
        </div>
      </section>

      {/* Model section */}
      <section className="mt-10">
        <h2 className="font-mono text-muted mb-4 text-xs tracking-[0.25em] uppercase">
          02 — Select model
        </h2>
        {models.length > 0 ? (
          <ModelSelector models={models} selected={selectedModel} onSelect={setSelectedModel} />
        ) : (
          <p className="text-muted text-sm">Loading models from backend…</p>
        )}
      </section>

      {/* Analyse button */}
      <section className="mt-10 flex justify-center">
        <button
          type="button"
          onClick={handleAnalyse}
          disabled={!canAnalyse}
          className={`rounded-xl px-10 py-4 font-mono text-sm font-bold tracking-[0.15em] uppercase transition-colors ${
            canAnalyse
              ? 'bg-accent text-white hover:bg-accent/85'
              : 'bg-card text-muted cursor-not-allowed'
          }`}
        >
          {loading ? 'Analysing…' : 'Analyse & Predict'}
        </button>
      </section>

      {/* Error */}
      {error && (
        <div className="border-accent-2/40 bg-accent-2/10 text-accent-2 mt-8 rounded-xl border px-5 py-4 text-sm">
          {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <section className="mt-12">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-mono text-muted text-xs tracking-[0.25em] uppercase">
              03 — Prediction results
            </h2>
            <p className="text-muted text-xs">
              <span className="text-ink font-semibold">{result.model}</span> · test accuracy{' '}
              <span className="font-mono">{result.model_accuracy.toFixed(2)}%</span> ·{' '}
              <span className="text-accent-2 font-mono">
                {summary(result.files).buggy}/{summary(result.files).total}
              </span>{' '}
              files flagged buggy
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            {result.files.map((f) => (
              <ResultCard key={`${f.filename}-${f.language}`} result={f} />
            ))}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-line text-muted mt-20 border-t pt-6 text-center font-mono text-[0.65rem] tracking-widest uppercase">
        CrossBugSense · Research Project · A.U. Santhusha Sliate
      </footer>
    </div>
  )
}
