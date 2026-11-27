// Formatos de dados do contrato da API (docs/contrato-api.md).

export type Modulo = 'externo' | 'interno'
export type EstadoVeiculo = 'em_movimento' | 'parado' | 'sem_sinal'
export type TipoVeiculo = 'onibus' | 'carrinho'
export type Coordenada = [lat: number, lng: number]

export interface Linha {
  id: string
  modulo: Modulo
  codigo: string
  nome: string
  sentido: string
  cor: string
}

export interface Parada {
  id: string
  modulo: Modulo
  nome: string
  lat: number
  lng: number
}

export interface ParadaDaLinha {
  id: string
  nome: string
  lat: number
  lng: number
  ordem: number
}

export interface Horario {
  paradaId: string
  /** "HH:MM" */
  hora: string
  /** 0 = domingo, 6 = sábado */
  dias: number[]
}

export interface LinhaDetalhe extends Linha {
  paradas: ParadaDaLinha[]
  horarios: Horario[]
  trajeto: Coordenada[]
}

export interface Veiculo {
  id: string
  linhaId: string
  nome: string
  tipo: TipoVeiculo
  estado: EstadoVeiculo
  lat: number
  lng: number
  proximaParada: { id: string; nome: string } | null
  etaMin: number | null
  atualizadoEm: string
}

export type Papel = 'passageiro' | 'motorista'

export interface Usuario {
  id: string
  email: string
  papel: Papel
}

export interface Sessao {
  token: string
  user: Usuario
}

export interface Favorito {
  id: number
  linhaId: string | null
  paradaId: string | null
}

export type AlvoFavorito = { linhaId: string } | { paradaId: string }

export type StatusCorrida = 'aguardando' | 'aceita' | 'concluida' | 'cancelada'

/** Chamado do carrinho: de uma parada até outra. */
export interface Corrida {
  id: number
  origemId: string
  destinoId: string
  status: StatusCorrida
  veiculoId: string | null
  criadaEm: string
}

export interface VeiculoCadastrado {
  id: string
  linhaId: string
  nome: string
  tipo: TipoVeiculo
}

export interface Avaliacao {
  nota: number
  comentario: string
}
