import { useState } from 'react'
import { METRIC_ORDER, type FilePrediction } from '../types'

const SOURCE_METRICS = new Set<string>(METRIC_ORDER.slice(0, 19))

function groupLabel(key: string): string {
  return SOURCE_METRICS.has(key) ? 'Source / OO metrics' : 'Code smell metrics'
}

export default function ResultCard({ result }: { result: FilePrediction }) {
  const [showMetrics, setShowMetrics] = useState(false)
  const buggy = result.prediction === 1
  const prob = result.buggy_probability

  return (
    <div className="rounded-2xl border border-line bg-panel p-6">
      {/* Header */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-mono text-[0.65rem] tracking-[0.2em] text-muted uppercase">
            {result.language}
          </p>
          <h3 className="max-w-[240px] truncate text-lg font-semibold text-ink">
            {result.filename}
          </h3>
        </div>
        <span
          className={`rounded-full px-4 py-1 font-mono text-xs font-bold tracking-wider uppercase ${
            buggy ? 'bg-accent-2/15 text-accent-2' : 'bg-good/15 text-good'
          }`}
        >
          {buggy ? 'Buggy' : 'Clean'}
        </span>
      </div>

      {/* Probability bar */}
      <div className="mb-4">
        <div className="mb-1 flex items-center justify-between text-xs text-muted">
          <span>Buggy probability</span>
          <span className="font-mono text-ink">{prob.toFixed(2)}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-card">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              buggy ? 'bg-accent-2' : 'bg-good'
            }`}
            style={{ width: `${prob}%` }}
          />
        </div>
      </div>

      {/* Metrics toggle */}
      <button
        type="button"
        onClick={() => setShowMetrics((v) => !v)}
        className="text-xs font-semibold text-accent underline-offset-4 hover:underline"
      >
        {showMetrics ? 'Hide' : 'Show'} extracted metrics (24)
      </button>

      {showMetrics && (
        <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-1 rounded-xl bg-card p-4 sm:grid-cols-3">
          {METRIC_ORDER.map((key) => (
            <div
              key={key}
              className="flex items-baseline justify-between gap-2 border-b border-line/50 py-1 last:border-0"
              title={groupLabel(key)}
            >
              <span className="font-mono text-xs text-muted">{key}</span>
              <span className="font-mono text-xs text-ink">{result.metrics[key]}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
