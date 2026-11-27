import type { EstadoVeiculo as Estado, Veiculo } from '../entidades/tipos'

export const nomeEstado: Record<Estado, string> = {
  em_movimento: 'Em movimento',
  parado: 'Parado',
  sem_sinal: 'Sem sinal',
}

/** Estado com forma e texto, para não depender só da cor. */
export function EstadoVeiculo({ estado }: { estado: Estado }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`marca-estado marca-${estado}`} aria-hidden="true" />
      {nomeEstado[estado]}
    </span>
  )
}

export function descricaoChegada(v: Veiculo): string {
  const destino = v.proximaParada?.nome
  if (v.estado === 'sem_sinal') {
    const hora = new Date(v.atualizadoEm).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    return `Última posição às ${hora}`
  }
  if (!destino) return 'Próxima parada não informada'
  return v.estado === 'parado' ? `Em uma parada. Próxima: ${destino}` : `Próxima: ${destino}`
}

export function Previsao({ veiculo }: { veiculo: Veiculo }) {
  if (veiculo.etaMin === null) {
    return <span className="text-sm opacity-80">sem previsão</span>
  }
  return (
    <span className="whitespace-nowrap tabular-nums">
      <strong key={veiculo.etaMin} className="troca text-3xl font-extrabold">{veiculo.etaMin}</strong>
      <span className="ml-1 text-sm">min</span>
    </span>
  )
}
