import { useCallback, useEffect, useRef, useState } from 'react'
import { servico } from '../services'
import { mensagensLocalizacao } from './useLocalizacao'

const INTERVALO_MS = 5000

/** Envia a posição do aparelho do motorista enquanto o painel estiver aberto. */
export function useCompartilharPosicao(token) {
  const [veiculoId, setVeiculoId] = useState(null)
  const [enviadaEm, setEnviadaEm] = useState(null)
  const [erro, setErro] = useState(null)
  const ultima = useRef(null)

  useEffect(() => {
    if (!veiculoId) return
    let ativo = true
    const enviar = () => {
      const p = ultima.current
      if (!p) return
      servico.enviarPosicao(token, veiculoId, p.lat, p.lng).then(
        () => ativo && (setEnviadaEm(new Date()), setErro(null)),
        (falha) => ativo && setErro(falha.message),
      )
    }
    const observar = navigator.geolocation.watchPosition(
      ({ coords }) => {
        const primeira = ultima.current === null
        ultima.current = { lat: coords.latitude, lng: coords.longitude }
        if (primeira) enviar()
      },
      (falha) => setErro(mensagensLocalizacao[falha.code] ?? mensagensLocalizacao[2]),
      { enableHighAccuracy: true, maximumAge: 5000 },
    )
    const relogio = window.setInterval(enviar, INTERVALO_MS)

    // Tela apagada interrompe o envio: pede para o aparelho mantê-la ligada.
    let trava
    const travar = () => {
      if (document.hidden) return
      navigator.wakeLock?.request('screen').then(
        (t) => {
          if (ativo) trava = t
          else void t.release()
        },
        () => {},
      )
    }
    travar()
    document.addEventListener('visibilitychange', travar)

    return () => {
      ativo = false
      navigator.geolocation.clearWatch(observar)
      window.clearInterval(relogio)
      document.removeEventListener('visibilitychange', travar)
      trava?.release()
      ultima.current = null
      // Ao parar ou sair, o veículo some do mapa em vez de ficar congelado.
      servico.pararPosicao(token, veiculoId).catch(() => {})
    }
  }, [veiculoId, token])

  const comecar = useCallback((id) => {
    if (!navigator.geolocation) {
      setErro('Este navegador não informa a localização.')
      return
    }
    setErro(null)
    setEnviadaEm(null)
    setVeiculoId(id)
  }, [])
  const parar = useCallback(() => setVeiculoId(null), [])

  return { veiculoId, enviadaEm, erro, comecar, parar }
}
