export function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary text-sm font-semibold text-primary-foreground shadow-[var(--shadow-soft)]">
        SP
      </div>
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Social</p>
        <h1 className="text-xl font-semibold text-foreground">Platform</h1>
      </div>
    </div>
  )
}
