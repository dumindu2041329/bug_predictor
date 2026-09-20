import type { ModelInfo } from '../types'

interface ModelSelectorProps {
  models: ModelInfo[]
  selected: string
  onSelect: (key: string) => void
}

export default function ModelSelector({ models, selected, onSelect }: ModelSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {models.map((model) => {
        const active = model.key === selected
        return (
          <button
            key={model.key}
            type="button"
            onClick={() => onSelect(model.key)}
            className={`flex flex-col items-start gap-1 rounded-xl border px-4 py-3 text-left transition-colors ${
              active
                ? 'border-accent bg-card'
                : 'border-line bg-panel hover:border-accent/50'
            }`}
          >
            <span className={`text-sm font-semibold ${active ? 'text-accent' : 'text-ink'}`}>
              {model.name}
            </span>
            <span className="font-mono text-xs text-muted">
              acc {model.accuracy.toFixed(2)}%
            </span>
          </button>
        )
      })}
    </div>
  )
}
