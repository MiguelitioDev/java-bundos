import { useEffect, useState } from 'react'

/** Relógio que avança a cada meio minuto, para os horários previstos. */
export function useAgora() {
  const [agora, setAgora] = useState(() => new Date())
  useEffect(() => {
    const id = window.setInterval(() => setAgora(new Date()), 30_000)
    return () => window.clearInterval(id)
  }, [])
  return agora
}
