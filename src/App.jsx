import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { Heart, Lock, Mail, ShieldCheck } from "lucide-react"
import GlassCard from "./components/ui/GlassCard"

const TARGET_DATE = new Date(2026, 1, 14, 0, 0, 0, 0)
const RELATIONSHIP_START = new Date(2023, 1, 14, 0, 0, 0, 0)
const ACCEPTED_KEY = "portal14Accepted"
const LETTER_TEXT =
  "Te invito a cruzar este portal. Una noche cuidada al detalle, una mesa reservada, y una promesa: desconectar el mundo para mirarnos de verdad.\n\nSi aceptas, la ubicacion se desbloquea. Si no, el sistema igual insiste en esperarte."

const TARGET_DATE_TEXT = "14/02/2026"
const TARGET_DATE_DISPLAY = "14 de Febrero"
const LOCKED_TIME = { hours: 19, minutes: 0, seconds: 0, milliseconds: 0 }

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

const getRandomClock = () => ({
  hours: Math.floor(Math.random() * 24),
  minutes: Math.floor(Math.random() * 60),
  seconds: Math.floor(Math.random() * 60),
  milliseconds: Math.floor(Math.random() * 1000),
})

const getRandomDate = () => {
  const day = Math.floor(Math.random() * 28) + 1
  const month = Math.floor(Math.random() * 12) + 1
  const year = Math.floor(Math.random() * 6) + 24
  return `${pad(day)}/${pad(month)}/${pad(year)}`
}

const getElapsed = () => {
  const diff = Math.max(0, Date.now() - RELATIONSHIP_START.getTime())
  const totalSeconds = Math.floor(diff / 1000)
  const seconds = totalSeconds % 60
  const totalMinutes = Math.floor(totalSeconds / 60)
  const minutes = totalMinutes % 60
  const totalHours = Math.floor(totalMinutes / 60)
  const hours = totalHours % 24
  const days = Math.floor(totalHours / 24)
  return { days, hours, minutes, seconds }
}

const LocationDecryptor = ({
  revealed,
  locationText,
  toneClass = "text-portal-gold/90",
}) => {
  const pixels = useMemo(
    () =>
      Array.from({ length: 72 }, (_, index) => ({
        id: index,
        delay: Math.random() * 0.35,
      })),
    [],
  )
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
        <div className="pointer-events-none absolute inset-0 grid grid-cols-12 grid-rows-6">
          {pixels.map((pixel) => (
            <motion.span
              key={pixel.id}
              className="bg-black/80"
              initial={false}
              animate={{ opacity: revealed ? 0 : 1 }}
              transition={{
                duration: revealed ? 0.5 : 0.2,
                delay: revealed ? pixel.delay : 0,
                ease: "easeOut",
              }}
            />
          ))}
        </div>
        <div
          className={`absolute inset-0 flex items-center justify-center px-6 text-center text-[10px] uppercase tracking-[0.2em] sm:text-xs sm:tracking-[0.4em] ${toneClass}`}
        >
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
  const [loadingClock, setLoadingClock] = useState(() => getRandomClock())
  const [loadingDate, setLoadingDate] = useState(() => getRandomDate())
  const [dateResolved, setDateResolved] = useState(false)
  const [dateFinalized, setDateFinalized] = useState(false)
  const [loadingLocked, setLoadingLocked] = useState(false)
  const [shake, setShake] = useState(false)
  const [scanName, setScanName] = useState("NICOLE REYES")
  const [scanResolved, setScanResolved] = useState(false)
  const [scanShake, setScanShake] = useState(false)
  const [noJiggle, setNoJiggle] = useState(false)
  const [elapsed, setElapsed] = useState(() => getElapsed())
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
    if (phase !== "loading" && phase !== "accepted") return
    const interval = setInterval(
      () => setCountdown(getCountdown()),
      prefersReducedMotion ? 200 : 33,
    )
    return () => clearInterval(interval)
  }, [phase, prefersReducedMotion])

  useEffect(() => {
    if (phase !== "loading" || loadingLocked) return
    const interval = setInterval(
      () => setLoadingClock(getRandomClock()),
      prefersReducedMotion ? 300 : 220,
    )
    return () => clearInterval(interval)
  }, [phase, prefersReducedMotion, loadingLocked])

  useEffect(() => {
    if (phase !== "loading") return
    setDateResolved(false)
    setDateFinalized(false)
    setLoadingLocked(false)
    setShake(false)
    setLoadingClock(getRandomClock())
    setLoadingDate(getRandomDate())

    const lockTimer = setTimeout(
      () => {
        setLoadingLocked(true)
        setLoadingClock(LOCKED_TIME)
        setLoadingDate(TARGET_DATE_TEXT)
        setDateResolved(true)
      },
      prefersReducedMotion ? 0 : 3200,
    )
    const scanTimer = setTimeout(
      () => setPhase("scan"),
      prefersReducedMotion ? 0 : 6200,
    )

    return () => {
      clearTimeout(lockTimer)
      clearTimeout(scanTimer)
    }
  }, [phase, prefersReducedMotion])

  useEffect(() => {
    if (phase !== "loading" || loadingLocked) return
    const interval = setInterval(
      () => setLoadingDate(getRandomDate()),
      prefersReducedMotion ? 450 : 260,
    )
    return () => clearInterval(interval)
  }, [phase, prefersReducedMotion, loadingLocked])

  useEffect(() => {
    if (!dateResolved) return
    setShake(true)
    const shakeTimer = setTimeout(
      () => setShake(false),
      prefersReducedMotion ? 0 : 600,
    )
    const timer = setTimeout(
      () => setDateFinalized(true),
      prefersReducedMotion ? 0 : 500,
    )
    return () => {
      clearTimeout(timer)
      clearTimeout(shakeTimer)
    }
  }, [dateResolved, prefersReducedMotion])

  useEffect(() => {
    if (phase !== "scan") return
    setScanResolved(false)
    setScanShake(false)
    setScanName("NICOLE REYES")
    const target = "NICOLE REYES"
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    let iterations = 0

    const scramble = setInterval(() => {
      iterations += 1
      const revealCount = Math.min(iterations, target.length)
      const next = target
        .split("")
        .map((char, index) => {
          if (char === " ") return " "
          if (index < revealCount) return target[index]
          return alphabet[Math.floor(Math.random() * alphabet.length)]
        })
        .join("")
      setScanName(next)

      if (revealCount >= target.length) {
        clearInterval(scramble)
        setScanResolved(true)
      }
    }, prefersReducedMotion ? 30 : 70)

    const timer = setTimeout(
      () => setPhase("sync"),
      prefersReducedMotion ? 0 : 5200,
    )
    return () => {
      clearTimeout(timer)
      clearInterval(scramble)
    }
  }, [phase, prefersReducedMotion])

  useEffect(() => {
    if (!scanResolved) return
    setScanShake(true)
    const timer = setTimeout(
      () => setScanShake(false),
      prefersReducedMotion ? 0 : 600,
    )
    return () => clearTimeout(timer)
  }, [scanResolved, prefersReducedMotion])

  useEffect(() => {
    if (!noJiggle) return
    const timer = setTimeout(
      () => setNoJiggle(false),
      prefersReducedMotion ? 0 : 520,
    )
    return () => clearTimeout(timer)
  }, [noJiggle, prefersReducedMotion])

  useEffect(() => {
    if (phase !== "sync") return
    const timer = setTimeout(
      () => setPhase("question"),
      prefersReducedMotion ? 0 : 5200,
    )
    return () => clearTimeout(timer)
  }, [phase, prefersReducedMotion])

  useEffect(() => {
    if (phase !== "accepted") return
    const interval = setInterval(() => setElapsed(getElapsed()), 1000)
    return () => clearInterval(interval)
  }, [phase])

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

  const isUnlockDateReached = countdown.diff === 0

  const locationText = "COORDENADAS: 19.4326 N 99.1332 W"
  const locationTone = "text-red-400 animate-pulse"

  const acceptInvite = () => {
    try {
      window.localStorage.setItem(ACCEPTED_KEY, "true")
    } catch {
      // ignore storage failures
    }
    setLetterOpen(false)
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
              transition={{ duration: 1.2, ease: "easeOut" }}
            >
              {!prefersReducedMotion && (
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                  <div className="scanline absolute inset-x-0 top-0" />
                </div>
              )}

              <motion.div
                className="relative z-10 space-y-6"
                animate={shake ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              >
                <div className="text-[10px] uppercase tracking-[0.3em] text-portal-gold/90 sm:text-xs sm:tracking-[0.5em]">
                  Detectando hora de acceso...
                </div>
                <div className="font-display text-4xl text-white sm:text-5xl text-crisp">
                  {pad(loadingClock.hours)}:{pad(loadingClock.minutes)}:
                  {pad(loadingClock.seconds)}
                </div>
                <div className="text-xs uppercase tracking-[0.3em] text-portal-gold/85 sm:text-sm sm:tracking-[0.4em]">
                  {pad(loadingClock.milliseconds, 3)} ms
                </div>
                {dateFinalized && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="font-display text-3xl text-portal-gold sm:text-4xl text-crisp"
                  >
                    {TARGET_DATE_DISPLAY}
                  </motion.div>
                )}
                <div className="space-y-2">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-white/70 sm:text-xs sm:tracking-[0.3em]">
                    Fecha cifrada hacia el ...
                  </div>
                  <div className="space-y-1 font-digital text-sm text-white/75 sm:text-base">
                    <div>{loadingDate}</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {phase === "scan" && (
            <motion.div
              key="scan"
              className="relative w-full max-w-2xl text-center"
              variants={pageMotion}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 1.6, ease: "easeOut" }}
            >
              {!prefersReducedMotion && (
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                  <div className="biometric-beam absolute inset-x-0 top-0" />
                </div>
              )}
              <motion.div
                className="relative z-10 space-y-4"
                animate={scanShake ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              >
                <motion.p
                  className="text-[11px] uppercase tracking-[0.45em] text-portal-gold/90 sm:text-xs"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8 }}
                >
                  Detectando ADN...
                </motion.p>
                <motion.p
                  className="font-display text-3xl text-white sm:text-4xl text-crisp"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.9 }}
                >
                  {scanName}
                </motion.p>
                <p className="text-[10px] uppercase tracking-[0.3em] text-white/70 sm:text-xs">
                  Acceso exclusivo verificado
                </p>
              </motion.div>
            </motion.div>
          )}

          {phase === "sync" && (
            <motion.div
              key="sync"
              className="relative w-full max-w-2xl text-center"
              variants={pageMotion}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 1.6, ease: "easeOut" }}
            >
              <div className="relative mx-auto flex h-52 w-52 items-center justify-center sm:h-64 sm:w-64">
                <motion.div
                  className="absolute h-full w-full rounded-full border border-portal-gold/30"
                  animate={{ scale: [0.85, 1.05], opacity: [0.2, 0.8, 0.2] }}
                  transition={{ duration: 4.6, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                  className="absolute h-[70%] w-[70%] rounded-full border border-portal-gold/40"
                  animate={{ scale: [0.8, 1], opacity: [0.2, 0.9, 0.2] }}
                  transition={{
                    duration: 4.2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.4,
                  }}
                />
                <motion.div
                  className="absolute h-[40%] w-[40%] rounded-full bg-portal-gold/15"
                  animate={{ scale: [0.9, 1.1], opacity: [0.4, 1, 0.4] }}
                  transition={{
                    duration: 3.6,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.2,
                  }}
                />
              </div>
              <div className="mt-6 space-y-3">
                <p className="text-[11px] uppercase tracking-[0.45em] text-portal-gold/90 sm:text-xs">
                  Sincronizando senal emocional...
                </p>
                <p className="font-display text-3xl text-white sm:text-4xl text-crisp">
                  Compatibilidad Confirmada
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
              transition={{ duration: 1.1, ease: "easeOut" }}
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

                <h1 className="mt-6 text-center text-4xl font-semibold leading-tight text-white sm:text-5xl md:text-6xl font-display text-crisp">
                  WOULD YOU BE MY VALENTINE ?
                </h1>

                <div className="mt-7">
                  <LocationDecryptor
                    revealed={false}
                    locationText={locationText}
                    toneClass={locationTone}
                  />
                </div>

                <div className="mt-7 space-y-4">
                  <div className="rounded-2xl border border-white/20 bg-white/5 px-5 py-4 text-left text-[11px] uppercase tracking-[0.2em] text-white/70 backdrop-blur sm:text-sm sm:tracking-[0.25em]">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <span className="flex items-center gap-3 text-white/85">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full border border-portal-gold/40 bg-portal-gold/10 text-portal-gold">
                          <Lock className="h-5 w-5" />
                        </span>
                        Carta encriptada
                      </span>
                      <span className="text-[10px] text-portal-gold/75 sm:text-[11px]">
                        Bloqueada hasta aceptar
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 space-y-4">
                  <button
                    type="button"
                    onClick={acceptInvite}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-portal-gold to-portal-gold-light px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white shadow-[0_0_45px_rgba(212,175,55,0.35)] ring-1 ring-portal-gold/60 transition hover:brightness-110 sm:tracking-[0.25em] text-crisp"
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
                    <motion.button
                      type="button"
                      onClick={() => setNoJiggle(true)}
                      className="w-full rounded-full border border-white/30 bg-white/10 px-5 py-3 text-[10px] uppercase tracking-[0.2em] text-white/85 backdrop-blur sm:text-xs sm:tracking-[0.3em]"
                      animate={
                        noJiggle
                          ? {
                              x: [0, -8, 8, -6, 6, 0],
                              rotate: [0, -2, 2, -1, 1, 0],
                            }
                          : { x: 0, rotate: 0 }
                      }
                      transition={{ duration: 0.5, ease: "easeInOut" }}
                    >
                      No
                    </motion.button>
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
                <div className="mt-2 text-left">
                  <LocationDecryptor
                    revealed={true}
                    locationText={locationText}
                    toneClass={locationTone}
                  />
                </div>

                <div className="mt-7 text-left">
                  <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] uppercase tracking-[0.2em] text-portal-gold/80 sm:text-xs sm:tracking-[0.35em]">
                    <span>Temporizador de la carta</span>
                    <span className="text-white/60">
                      {isUnlockDateReached ? "Disponible" : "Bloqueada"}
                    </span>
                  </div>
                  <div className="mt-3 rounded-2xl border border-white/20 bg-white/5 px-5 py-4">
                    <div className="font-display text-2xl text-white sm:text-3xl text-crisp">
                      {pad(countdown.days)}:{pad(countdown.hours)}:
                      {pad(countdown.minutes)}:{pad(countdown.seconds)}
                    </div>
                    <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-white/70 sm:text-xs sm:tracking-[0.3em]">
                      Desbloqueo el 14 de febrero
                    </p>
                  </div>
                </div>

                <div className="mt-6 text-left">
                  <button
                    type="button"
                    onClick={() => {
                      if (!isUnlockDateReached) return
                      setLetterOpen((open) => !open)
                    }}
                    className={`flex w-full flex-wrap items-center justify-between gap-3 rounded-2xl border px-5 py-4 text-left text-[11px] uppercase tracking-[0.2em] backdrop-blur sm:text-sm sm:tracking-[0.25em] ${
                      isUnlockDateReached
                        ? "border-white/30 bg-white/10 text-white/90 transition hover:border-white/50"
                        : "border-white/15 bg-white/5 text-white/50"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full border border-portal-gold/40 bg-portal-gold/10 text-portal-gold">
                        {isUnlockDateReached ? (
                          <Mail className="h-5 w-5" />
                        ) : (
                          <Lock className="h-5 w-5" />
                        )}
                      </span>
                      Carta encriptada
                    </span>
                    <span className="text-[10px] text-portal-gold/75 sm:text-[11px]">
                      {isUnlockDateReached
                        ? letterOpen
                          ? "Cerrar"
                          : "Abrir"
                        : "Bloqueada"}
                    </span>
                  </button>

                  <AnimatePresence>
                    {letterOpen && isUnlockDateReached && (
                      <motion.div
                        key="letter"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="mt-4 overflow-hidden rounded-2xl border border-white/15 bg-white/5 p-5"
                      >
                        <p className="min-h-[120px] whitespace-pre-line text-sm leading-relaxed text-white/90">
                          {typedText}
                          {typedLength < LETTER_TEXT.length && (
                            <span className="ml-1 inline-block h-4 w-[2px] animate-pulse bg-portal-gold/80 align-middle" />
                          )}
                        </p>
                        <div className="mt-5 rounded-xl border border-white/10 bg-black/40 px-4 py-3">
                          <div className="text-[10px] uppercase tracking-[0.3em] text-white/70">
                            Tiempo invertido
                          </div>
                          <div className="mt-2 font-digital text-lg text-portal-gold sm:text-xl">
                            {pad(elapsed.days)}d {pad(elapsed.hours)}h{" "}
                            {pad(elapsed.minutes)}m {pad(elapsed.seconds)}s
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
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
