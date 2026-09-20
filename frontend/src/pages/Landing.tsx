import { Link } from 'react-router-dom'
import Brand from '../components/Brand'
import ThemeToggle from '../components/ThemeToggle'
import { METRIC_ORDER } from '../types'

const STEPS = [
  {
    index: '01',
    title: 'Upload source files',
    body: 'Drop two C# or JavaScript files into the predictor. Each is scanned independently.',
  },
  {
    index: '02',
    title: 'Select a model',
    body: 'Choose among five trained classifiers — Random Forest, KNN, Logistic Regression, Naïve Bayes or XGBoost.',
  },
  {
    index: '03',
    title: 'Read the verdict',
    body: 'Every file gets a buggy-probability reading on a calibrated 0–100 scale, plus its full 24-metric breakdown.',
  },
]

export default function Landing() {
  return (
    <div className="relative z-10 min-h-screen">
      {/* Top bar */}
      <div className="border-line bg-panel/95 sticky top-0 z-20 border-b backdrop-blur-[2px]">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-6 py-3">
          <Brand />
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              to="/login"
              className="font-mono text-muted hover:text-ink hidden text-[0.65rem] font-semibold tracking-[0.18em] uppercase transition-colors sm:block"
            >
              Log in
            </Link>
            <Link
              to="/register"
              className="font-mono bg-accent text-on-accent hover:opacity-85 rounded-full px-4 py-2 text-[0.65rem] font-bold tracking-[0.18em] uppercase transition-opacity"
            >
              Create account
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6 pb-24">
        {/* Hero */}
        <header className="pt-16 pb-6">
          <p className="font-mono text-accent mb-4 text-[0.65rem] tracking-[0.3em] uppercase">
            Research instrument · ML defect scoring
          </p>
          <h1 className="font-display text-5xl leading-[1.02] font-extrabold tracking-tight uppercase sm:text-6xl">
            Is this file
            <br />
            <span className="text-accent">bug-prone?</span>
          </h1>
          <p className="text-muted mt-5 max-w-xl text-sm leading-relaxed">
            CrossBugSense scores C# and JavaScript source files against twenty-four
            source-code and code-smell metrics, then calls the verdict with a
            machine-learning model trained on real defect data.
          </p>

          {/* Spec readout */}
          <dl className="border-line mt-9 grid max-w-xl grid-cols-2 gap-px overflow-hidden rounded-xl border sm:grid-cols-4">
            {[
              ['Languages', 'C# · JS'],
              ['Metrics / file', '24'],
              ['Models', '05'],
              ['Verdict', '0 / 1'],
            ].map(([term, detail]) => (
              <div key={term} className="bg-panel px-4 py-3">
                <dt className="font-mono text-muted text-[0.6rem] tracking-[0.18em] uppercase">
                  {term}
                </dt>
                <dd className="font-mono text-ink mt-1 text-sm font-semibold">{detail}</dd>
              </div>
            ))}
          </dl>

          {/* Calibration list */}
          <div className="border-line bg-panel mt-4 max-w-xl rounded-xl border px-4 py-3">
            <p className="font-mono text-muted text-[0.6rem] tracking-[0.18em] uppercase">
              Calibration list — measured channels
            </p>
            <p className="font-mono text-ink/80 mt-2 text-[0.68rem] leading-relaxed break-words">
              {METRIC_ORDER.join(' · ')}
            </p>
          </div>
        </header>

        {/* How it works */}
        <section className="mt-16">
          <div className="mb-6 flex items-center gap-4">
            <h2 className="font-display text-muted text-sm font-semibold tracking-[0.18em] uppercase">
              How it works
            </h2>
            <span className="bg-line h-px flex-1" aria-hidden="true" />
          </div>
          <ol className="grid gap-4 sm:grid-cols-3">
            {STEPS.map((step) => (
              <li key={step.index} className="border-line bg-panel rounded-xl border p-5">
                <span className="font-mono text-accent text-xs font-semibold">
                  {step.index}
                </span>
                <h3 className="font-display mt-3 text-sm font-bold text-ink">{step.title}</h3>
                <p className="text-muted mt-2 text-sm leading-relaxed">{step.body}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* CTA */}
        <section className="border-line bg-panel mt-16 rounded-2xl border p-8 text-center sm:p-10">
          <h2 className="font-display text-2xl font-extrabold tracking-tight uppercase sm:text-3xl">
            Start predicting
          </h2>
          <p className="text-muted mx-auto mt-3 max-w-sm text-sm leading-relaxed">
            Create a free account to open the dashboard and score your first two files.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/register"
              className="font-display bg-accent text-on-accent hover:opacity-85 rounded-xl px-8 py-3.5 text-sm font-bold tracking-[0.18em] uppercase transition-opacity"
            >
              Create account
            </Link>
            <Link
              to="/login"
              className="font-mono border-line text-ink hover:border-accent rounded-xl border px-8 py-3.5 text-sm font-semibold tracking-[0.18em] uppercase transition-colors"
            >
              Sign in
            </Link>
          </div>
        </section>

        <footer className="border-line text-muted mt-24 border-t pt-6 text-center font-mono text-[0.65rem] tracking-widest uppercase">
          CrossBugSense · Research Project · A.U. Santhusha Sliate
        </footer>
      </div>
    </div>
  )
}
