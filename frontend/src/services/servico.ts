import type {
  AlvoFavorito, Avaliacao, Corrida, Favorito, Linha, LinhaDetalhe, Modulo, Parada, Sessao, StatusCorrida, Veiculo, VeiculoCadastrado,
} from '../entidades/tipos'

export interface Servico {
  modoDemonstracao: boolean
  listarLinhas(modulo?: Modulo): Promise<Linha[]>
  obterLinha(id: string): Promise<LinhaDetalhe>
  listarParadas(modulo?: Modulo): Promise<Parada[]>
  listarVeiculos(modulo?: Modulo): Promise<Veiculo[]>
  /** Devolve null quando o e-mail precisa ser confirmado antes de entrar. */
  cadastrar(email: string, senha: string): Promise<Sessao | null>
  entrar(email: string, senha: string): Promise<Sessao>
  listarFavoritos(token: string): Promise<Favorito[]>
  adicionarFavorito(token: string, alvo: AlvoFavorito): Promise<Favorito>
  removerFavorito(token: string, id: number): Promise<void>

  /** Corridas de quem pediu, da mais nova para a mais antiga. */
  listarCorridas(token: string): Promise<Corrida[]>
  chamarCarrinho(token: string, origemId: string, destinoId: string): Promise<Corrida>
  atualizarCorrida(token: string, id: number, status: StatusCorrida, veiculoId?: string): Promise<Corrida>

  /** Só para motoristas. */
  listarVeiculosCadastrados(token: string): Promise<VeiculoCadastrado[]>
  listarChamados(token: string): Promise<Corrida[]>
  enviarPosicao(token: string, veiculoId: string, lat: number, lng: number): Promise<void>
  pararPosicao(token: string, veiculoId: string): Promise<void>

  /** Funciona com ou sem conta. */
  enviarAvaliacao(token: string | null, avaliacao: Avaliacao): Promise<void>
}

export class ErroApi extends Error {
  status: number
  constructor(mensagem: string, status = 0) {
    super(mensagem)
    this.name = 'ErroApi'
    this.status = status
  }
}
