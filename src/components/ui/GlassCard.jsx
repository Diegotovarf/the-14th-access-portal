import clsx from "clsx"

const GlassCard = ({ children, className = "" }) => {
  return (
    <div
      className={clsx(
        "relative overflow-hidden rounded-[28px] border border-white/30 bg-[linear-gradient(135deg,rgba(255,255,255,0.22),rgba(255,255,255,0.06))] p-8 text-white shadow-[0_40px_140px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.2)] backdrop-blur-[28px]",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.22),transparent_62%)]" />
      <div className="relative z-10">{children}</div>
    </div>
  )
}

export default GlassCard
