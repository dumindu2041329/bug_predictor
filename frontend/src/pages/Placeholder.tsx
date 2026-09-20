import { Link } from 'react-router-dom'

export default function Placeholder({ title, note }: { title: string; note: string }) {
  return (
    <div className="pb-16">
      <p className="font-mono text-accent mb-2 text-[0.65rem] tracking-[0.3em] uppercase">
        Dashboard
      </p>
      <h1 className="font-display text-3xl font-extrabold tracking-tight uppercase">
        {title}
      </h1>

      <div className="border-line bg-panel mt-8 rounded-2xl border px-6 py-14 text-center">
        <p className="font-mono text-muted text-[0.65rem] tracking-[0.25em] uppercase">
          Nothing here yet
        </p>
        <p className="text-muted mx-auto mt-3 max-w-sm text-sm leading-relaxed">{note}</p>
        <Link
          to="/dashboard"
          className="font-mono text-accent mt-6 inline-block text-xs font-semibold tracking-[0.15em] uppercase underline-offset-4 hover:underline"
        >
          ← Back to Bug Predictor
        </Link>
      </div>
    </div>
  )
}
