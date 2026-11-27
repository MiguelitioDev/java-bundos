import { useCallback, useEffect, useRef, useState } from 'react'

export const mensagensLocalizacao = {
  1: 'A localização foi bloqueada. Libere nas permissões do site, no navegador, e tente de novo.',
  2: 'Não foi possível achar sua posição. Confira se a localização do aparelho está ligada.',
  3: 'A busca demorou demais. Em locais fechados isso acontece; tente de novo.',
}

/** A posição do passageiro fica só na memória da página: não é gravada nem enviada. */
export function useLocalizacao() {
  const [posicao, setPosicao] = useState(null)
  const [erro, setErro] = useState(null)
  const [buscando, setBuscando] = useState(false)
  const pedido = useRef(0)

  const pedir = useCallback(() => {
    if (!navigator.geolocation) {
      setErro('Este navegador não informa a localização.')
      return
    }
    const atual = ++pedido.current
    setBuscando(true)
    setErro(null)
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        if (atual !== pedido.current) return
        setPosicao([coords.latitude, coords.longitude])
        setBuscando(false)
      },
      (falha) => {
        if (atual !== pedido.current) return
        setErro(mensagensLocalizacao[falha.code] ?? mensagensLocalizacao[2])
        setBuscando(false)
      },
      { enableHighAccuracy: true, timeout: 15_000, maximumAge: 30_000 },
    )
  }, [])

  const desligar = useCallback(() => {
    pedido.current++
    setPosicao(null)
    setErro(null)
    setBuscando(false)
  }, [])

  useEffect(() => () => void pedido.current++, [])

  return { posicao, erro, buscando, pedir, desligar }
}
