import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { Heart, Mail, ShieldCheck } from "lucide-react"
import GlassCard from "./components/ui/GlassCard"

const TARGET_DATE = new Date(2026, 1, 14, 0, 0, 0, 0)
const ACCEPTED_KEY = "portal14Accepted"
const LETTER_TEXT =
  "Te invito a cruzar este portal. Una noche cuidada al detalle, una mesa reservada, y una promesa: desconectar el mundo para mirarnos de verdad.\n\nSi aceptas, la ubicacion se desbloquea. Si no, el sistema igual insiste en esperarte."

const getCountdown = () => {
  const now = Date.now()
  const diff = Math.max(0, TARGET_DATE.getTime() - now)
  const milliseconds = diff % 1000
  const totalSeconds = Math.floor(diff / 1000)
  const seconds = totalSeconds % 60
  const totalMinutes = Math.floor(totalSeconds / 60)
  const minutes = totalMinutes % 60
  const totalHours = Math.floor(totalMinutes / 60)
  const hours = totalHours % 24
  const days = Math.floor(totalHours / 24)

  return { diff, days, hours, minutes, seconds, milliseconds }
}

const pad = (value, length = 2) => String(value).padStart(length, "0")

const LocationDecryptor = ({ revealed, locationText }) => {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] uppercase tracking-[0.2em] text-portal-gold/80 sm:text-[11px] sm:tracking-[0.35em]">
        <span>Location Decryptor</span>
        <span className="text-white/60">
          {revealed ? "Desencriptado" : "Enmascarado"}
        </span>
      </div>
      <div className="relative h-40 overflow-hidden sm:h-48">
        <motion.div
          className="radar-map absolute inset-0"
          initial={false}
          animate={{
            filter: revealed ? "blur(0px)" : "blur(18px)",
            scale: revealed ? 1 : 1.02,
          }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/60" />
        </motion.div>
        <div className="absolute inset-0 flex items-center justify-center px-6 text-center text-[10px] uppercase tracking-[0.2em] text-portal-gold/90 sm:text-xs sm:tracking-[0.4em]">
          <span className="max-w-[22rem] rounded-full bg-black/45 px-4 py-2 leading-snug backdrop-blur sm:max-w-none">
            {locationText}
          </span>
        </div>
      </div>
      <div className="text-[10px] uppercase tracking-[0.2em] text-white/70 sm:text-xs sm:tracking-[0.3em]">
        {revealed
          ? "Coordenadas verificadas"
          : "Detectando coordenadas de acceso..."}
      </div>
    </div>
  )
}

const getInitialPhase = () => {
  if (typeof window === "undefined") return "loading"
  try {
    return window.localStorage.getItem(ACCEPTED_KEY) === "true"
      ? "accepted"
      : "loading"
  } catch {
    return "loading"
  }
}

const pageMotion = {
  initial: { opacity: 0, y: 18, filter: "blur(6px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  exit: { opacity: 0, y: -14, filter: "blur(6px)" },
}

function App() {
  const [phase, setPhase] = useState(() => getInitialPhase())
  const [countdown, setCountdown] = useState(() => getCountdown())
  const [noPos, setNoPos] = useState({ x: 0, y: 0 })
  const [isCoarsePointer, setIsCoarsePointer] = useState(false)
  const [letterOpen, setLetterOpen] = useState(false)
  const [typedLength, setTypedLength] = useState(0)
  const prefersReducedMotion = useReducedMotion()
  const noZoneRef = useRef(null)
  const noButtonRef = useRef(null)

  useEffect(() => {
    const media = window.matchMedia("(pointer: coarse)")
    const update = () => setIsCoarsePointer(media.matches)
    update()
    if (media.addEventListener) {
      media.addEventListener("change", update)
      return () => media.removeEventListener("change", update)
    }
    media.addListener(update)
    return () => media.removeListener(update)
  }, [])

  useEffect(() => {
    if (phase !== "loading") return
    const interval = setInterval(
      () => setCountdown(getCountdown()),
      prefersReducedMotion ? 200 : 33,
    )
    return () => clearInterval(interval)
  }, [phase, prefersReducedMotion])

  useEffect(() => {
    if (phase !== "loading") return
    const timer = setTimeout(
      () => setPhase("question"),
      prefersReducedMotion ? 0 : 2600,
    )
    return () => clearTimeout(timer)
  }, [phase, prefersReducedMotion])

  useEffect(() => {
    if (phase !== "question") return
    const zone = noZoneRef.current
    const button = noButtonRef.current
    if (!zone || !button) return
    const zoneRect = zone.getBoundingClientRect()
    const buttonRect = button.getBoundingClientRect()
    setNoPos({
      x: Math.max(0, (zoneRect.width - buttonRect.width) / 2),
      y: Math.max(0, (zoneRect.height - buttonRect.height) / 2),
    })
  }, [phase])

  useEffect(() => {
    if (!letterOpen) {
      setTypedLength(0)
      return
    }
    let current = 0
    setTypedLength(0)
    const interval = setInterval(
      () => {
        current += 1
        setTypedLength(Math.min(current, LETTER_TEXT.length))
        if (current >= LETTER_TEXT.length) clearInterval(interval)
      },
      prefersReducedMotion ? 10 : 34,
    )
    return () => clearInterval(interval)
  }, [letterOpen, prefersReducedMotion])

  const shouldEvade = !isCoarsePointer

  const handleForceField = useCallback(
    (event) => {
      if (!shouldEvade) return
      const zone = noZoneRef.current
      const button = noButtonRef.current
      if (!zone || !button) return

      const zoneRect = zone.getBoundingClientRect()
      const buttonRect = button.getBoundingClientRect()
      const pointerX = event.clientX - zoneRect.left
      const pointerY = event.clientY - zoneRect.top
      const centerX = noPos.x + buttonRect.width / 2
      const centerY = noPos.y + buttonRect.height / 2
      const dx = centerX - pointerX
      const dy = centerY - pointerY
      const distance = Math.hypot(dx, dy)

      if (distance > 100) return

      const push = 140
      const normX = distance === 0 ? 1 : dx / distance
      const normY = distance === 0 ? 0 : dy / distance
      const padding = 6
      const maxX = Math.max(0, zoneRect.width - buttonRect.width - padding * 2)
      const maxY = Math.max(0, zoneRect.height - buttonRect.height - padding * 2)

      let targetX = centerX + normX * push - buttonRect.width / 2
      let targetY = centerY + normY * push - buttonRect.height / 2

      targetX = Math.min(maxX + padding, Math.max(padding, targetX))
      targetY = Math.min(maxY + padding, Math.max(padding, targetY))

      setNoPos({ x: targetX, y: targetY })
    },
    [noPos, shouldEvade],
  )

  const typedText = useMemo(
    () => LETTER_TEXT.slice(0, typedLength),
    [typedLength],
  )

  const locationText =
    phase === "accepted"
      ? "Ubicacion de la cita: Lumen Rooftop, CDMX"
      : "Ubicacion de la cita: [REDACTED]"

  const acceptInvite = () => {
    try {
      window.localStorage.setItem(ACCEPTED_KEY, "true")
    } catch {
      // ignore storage failures
    }
    setPhase("accepted")
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-portal-black text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-48 left-1/2 h-[620px] w-[620px] -translate-x-1/2 rounded-full bg-portal-gold/15 blur-[180px]" />
        <div className="absolute bottom-[-180px] right-[-140px] h-[420px] w-[420px] rounded-full bg-portal-gold/10 blur-[150px]" />
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-white/5 to-transparent" />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 sm:py-16">
        <AnimatePresence mode="wait">
          {phase === "loading" && (
            <motion.div
              key="loading"
              className="relative w-full max-w-2xl text-center"
              variants={pageMotion}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.9, ease: "easeOut" }}
            >
              {!prefersReducedMotion && (
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                  <div className="scanline absolute inset-x-0 top-0" />
                </div>
              )}

              <div className="relative z-10 space-y-6">
                <div className="text-[10px] uppercase tracking-[0.3em] text-portal-gold/90 sm:text-xs sm:tracking-[0.5em]">
                  Detectando coordenadas de acceso...
                </div>
                <div className="font-display text-4xl text-white sm:text-5xl text-crisp">
                  {pad(countdown.days)}:{pad(countdown.hours)}:{pad(countdown.minutes)}
                  :{pad(countdown.seconds)}
                </div>
                <div className="text-xs uppercase tracking-[0.3em] text-portal-gold/85 sm:text-sm sm:tracking-[0.4em]">
                  {pad(countdown.milliseconds, 3)} ms
                </div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/70 sm:text-xs sm:tracking-[0.3em]">
                  Cuenta regresiva cifrada hacia el 14
                </p>
              </div>
            </motion.div>
          )}

          {phase === "question" && (
            <motion.div
              key="question"
              className="w-full max-w-[680px]"
              variants={pageMotion}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.9, ease: "easeOut" }}
            >
              <GlassCard>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-portal-gold/85">
                    <ShieldCheck className="h-5 w-5" />
                    <span className="text-[10px] uppercase tracking-[0.2em] sm:text-xs sm:tracking-[0.35em]">
                      Canal encriptado
                    </span>
                  </div>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-white/70 sm:text-xs sm:tracking-[0.3em]">
                    Sesion segura
                  </span>
                </div>

                <h1 className="mt-6 text-3xl font-semibold leading-tight text-white sm:text-4xl font-display text-crisp">
                  Serias mi Valentine?
                </h1>
                <p className="mt-3 text-sm text-white/90 sm:text-base text-crisp">
                  Una invitacion cifrada, exclusiva y sin retorno. Solo un{" "}
                  <span className="text-portal-gold font-semibold">SI</span>{" "}
                  desbloquea el acceso.
                </p>

                <div className="mt-7">
                  <LocationDecryptor
                    revealed={false}
                    locationText={locationText}
                  />
                </div>

                <div className="mt-7 space-y-4">
                  <button
                    type="button"
                    onClick={() => setLetterOpen((open) => !open)}
                    className="flex w-full flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/25 bg-white/5 px-5 py-4 text-left text-[11px] uppercase tracking-[0.2em] text-white/85 backdrop-blur transition hover:border-white/40 sm:text-sm sm:tracking-[0.25em]"
                  >
                    <span className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full border border-portal-gold/40 bg-portal-gold/10 text-portal-gold">
                        <Mail className="h-5 w-5" />
                      </span>
                      Carta encriptada
                    </span>
                    <span className="text-[10px] text-portal-gold/75 sm:text-[11px]">
                      {letterOpen ? "Cerrar" : "Abrir"}
                    </span>
                  </button>

                  <AnimatePresence>
                    {letterOpen && (
                      <motion.div
                        key="letter"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="overflow-hidden rounded-2xl border border-white/15 bg-white/5 p-5"
                      >
                        <p className="min-h-[120px] whitespace-pre-line text-sm leading-relaxed text-white/90">
                          {typedText}
                          {typedLength < LETTER_TEXT.length && (
                            <span className="ml-1 inline-block h-4 w-[2px] animate-pulse bg-portal-gold/80 align-middle" />
                          )}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="mt-8 space-y-4">
                  <button
                    type="button"
                    onClick={acceptInvite}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-portal-gold to-portal-gold-light px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-black shadow-[0_0_45px_rgba(212,175,55,0.35)] ring-1 ring-portal-gold/60 transition hover:brightness-110 sm:tracking-[0.25em]"
                  >
                    Aceptar invitacion
                    <Heart className="h-4 w-4" />
                  </button>

                  {shouldEvade ? (
                    <div className="space-y-2">
                      <div className="text-[10px] uppercase tracking-[0.2em] text-white/65 sm:text-[11px] sm:tracking-[0.35em]">
                        Rechazar acceso
                      </div>
                      <div
                        ref={noZoneRef}
                        onMouseMove={handleForceField}
                        onMouseEnter={handleForceField}
                        className="relative h-28 w-full overflow-hidden"
                      >
                        <motion.button
                          ref={noButtonRef}
                          type="button"
                          className="absolute left-0 top-0 rounded-full border border-white/30 bg-white/10 px-5 py-2 text-xs uppercase tracking-[0.3em] text-white/85 backdrop-blur"
                          animate={{ x: noPos.x, y: noPos.y }}
                          transition={{ duration: 0 }}
                        >
                          No
                        </motion.button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="w-full rounded-full border border-white/30 bg-white/10 px-5 py-3 text-[10px] uppercase tracking-[0.2em] text-white/85 backdrop-blur sm:text-xs sm:tracking-[0.3em]"
                    >
                      No
                    </button>
                  )}
                </div>
              </GlassCard>
            </motion.div>
          )}

          {phase === "accepted" && (
            <motion.div
              key="accepted"
              className="w-full max-w-[680px]"
              variants={pageMotion}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 1.0, ease: "easeOut" }}
            >
              <GlassCard className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-portal-gold/30 bg-portal-gold/10">
                  <Heart className="h-7 w-7 text-portal-gold" />
                </div>
                <h2 className="mt-6 text-3xl font-display text-portal-gold sm:text-4xl text-crisp">
                  Identidad Confirmada. Acceso al Corazon Concedido.
                </h2>
                <p className="mt-3 text-sm text-white/90 sm:text-base text-crisp">
                  Coordenadas liberadas. Tu lugar ya esta asegurado.
                </p>

                <div className="mt-7 text-left">
                  <LocationDecryptor
                    revealed={true}
                    locationText={locationText}
                  />
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default App
