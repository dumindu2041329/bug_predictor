export default function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <span className="logo-dot bg-accent inline-block h-2 w-2 rounded-full" />
      <span
        className={`font-mono text-ink font-semibold tracking-[0.22em] uppercase ${
          compact ? 'text-[0.7rem]' : 'text-xs'
        }`}
      >
        CrossBugSense
      </span>
    </span>
  )
}
