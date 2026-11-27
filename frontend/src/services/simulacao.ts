// Posição simulada de um veículo. Funções puras, sem nada do navegador:
// o back-end pode usar a mesma conta em GET /veiculos.
import type { Coordenada, EstadoVeiculo } from '../entidades/tipos'
import { distanciaMetros } from './geo'

export interface RotaSimulada {
  trajeto: Coordenada[]
  /** Paradas em ordem, com o ponto do trajeto onde cada uma fica. */
  paradas: { id: string; indiceTrajeto: number }[]
  circular: boolean
  velocidadeMs: number
  paradaSegundos: number
  /** A cada `periodo` segundos o veículo fica `duracao` segundos sem sinal. */
  semSinal?: { periodo: number; duracao: number }
}

export interface Posicao {
  lat: number
  lng: number
  estado: EstadoVeiculo
  proximaParadaId: string
  etaMin: number | null
  /** Instante (segundos) em que esta posição foi observada. */
  observadoEm: number
}

interface Trecho {
  pontos: Coordenada[]
  destinoId: string
  metros: number
}

function montarTrechos(rota: RotaSimulada): Trecho[] {
  const ida = rota.paradas.slice(1).map((destino, i) => {
    const pontos = rota.trajeto.slice(rota.paradas[i].indiceTrajeto, destino.indiceTrajeto + 1)
    const metros = pontos.slice(1).reduce((soma, p, j) => soma + distanciaMetros(pontos[j], p), 0)
    return { pontos, destinoId: destino.id, metros, origemId: rota.paradas[i].id }
  })
  if (rota.circular) return ida
  const volta = [...ida].reverse().map((t) => ({ ...t, pontos: [...t.pontos].reverse(), destinoId: t.origemId }))
  return [...ida, ...volta]
}

function pontoNaDistancia(pontos: Coordenada[], metros: number): Coordenada {
  let restante = metros
  for (let i = 1; i < pontos.length; i++) {
    const passo = distanciaMetros(pontos[i - 1], pontos[i])
    if (passo > 0 && restante <= passo) {
      const f = restante / passo
      const [a, b] = [pontos[i - 1], pontos[i]]
      return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f]
    }
    restante -= passo
  }
  return pontos[pontos.length - 1]
}

export function simularPosicao(rota: RotaSimulada, instante: number, atraso = 0): Posicao {
  const { semSinal } = rota
  let observadoEm = instante
  let perdido = false
  if (semSinal) {
    const inicioPerda = semSinal.periodo - semSinal.duracao
    const noPeriodo = instante % semSinal.periodo
    if (noPeriodo >= inicioPerda) {
      perdido = true
      observadoEm = instante - (noPeriodo - inicioPerda)
    }
  }

  const trechos = montarTrechos(rota)
  const duracoes = trechos.map((t) => t.metros / rota.velocidadeMs)
  const ciclo = duracoes.reduce((soma, d) => soma + d + rota.paradaSegundos, 0)
  let t = (((observadoEm + atraso) % ciclo) + ciclo) % ciclo

  for (let i = 0; i < trechos.length; i++) {
    const trecho = trechos[i]
    if (t < duracoes[i]) {
      const [lat, lng] = pontoNaDistancia(trecho.pontos, t * rota.velocidadeMs)
      return {
        lat,
        lng,
        estado: perdido ? 'sem_sinal' : 'em_movimento',
        proximaParadaId: trecho.destinoId,
        etaMin: perdido ? null : Math.max(1, Math.ceil((duracoes[i] - t) / 60)),
        observadoEm,
      }
    }
    t -= duracoes[i]
    if (t < rota.paradaSegundos) {
      const [lat, lng] = trecho.pontos[trecho.pontos.length - 1]
      return {
        lat,
        lng,
        estado: perdido ? 'sem_sinal' : 'parado',
        proximaParadaId: trechos[(i + 1) % trechos.length].destinoId,
        etaMin: null,
        observadoEm,
      }
    }
    t -= rota.paradaSegundos
  }
  throw new Error('Rota sem trechos para simular')
}
