import { useRef, useState, type DragEvent } from 'react'

const ACCEPTED_EXTENSIONS = ['.cs', '.csharp', '.js', '.jsx', '.ts', '.tsx']

interface FileDropzoneProps {
  label: string
  file: File | null
  onFileSelected: (file: File | null) => void
}

function isAccepted(name: string): boolean {
  const lower = name.toLowerCase()
  return ACCEPTED_EXTENSIONS.some((ext) => lower.endsWith(ext))
}

export default function FileDropzone({ label, file, onFileSelected }: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [rejected, setRejected] = useState(false)

  const handleFiles = (files: FileList | null) => {
    const selected = files?.[0]
    if (!selected) return
    if (!isAccepted(selected.name)) {
      setRejected(true)
      onFileSelected(null)
      return
    }
    setRejected(false)
    onFileSelected(selected)
  }

  const onDrop = (e: DragEvent) => {
    e.preventDefault()
    setDragging(false)
    handleFiles(e.dataTransfer.files)
  }

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault()
        setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors ${
        dragging
          ? 'border-accent bg-card'
          : file
            ? 'border-good/60 bg-card'
            : rejected
              ? 'border-accent-2/60 bg-card'
              : 'border-line bg-panel hover:border-accent/50'
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_EXTENSIONS.join(',')}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      <span className="font-mono text-[0.65rem] tracking-[0.2em] text-muted uppercase">
        {label}
      </span>

      {file ? (
        <>
          <span className="max-w-full truncate text-sm font-semibold text-ink">{file.name}</span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onFileSelected(null)
              setRejected(false)
            }}
            className="text-xs text-muted underline-offset-2 hover:text-accent-2 hover:underline"
          >
            Remove file
          </button>
        </>
      ) : (
        <>
          <span className={rejected ? 'text-sm text-accent-2' : 'text-sm text-ink'}>
            {rejected ? 'Only .cs / .js / .ts source files are supported' : 'Drop a source file or browse'}
          </span>
          <span className="text-xs text-muted">.cs · .js · .ts</span>
        </>
      )}
    </div>
  )
}
