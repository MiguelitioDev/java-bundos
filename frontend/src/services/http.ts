import type { Corrida, Favorito, Linha, LinhaDetalhe, Modulo, Parada, Sessao, Veiculo, VeiculoCadastrado } from '../entidades/tipos'
import { ErroApi, type Servico } from './servico'

// Hospedagens gratuitas podem levar quase um minuto para acordar.
const TEMPO_LIMITE_MS = 60_000

export function criarServicoHttp(base: string): Servico {
  async function pedir<T>(caminho: string, opcoes: { metodo?: string; corpo?: unknown; token?: string } = {}): Promise<T> {
    const headers: Record<string, string> = {}
    if (opcoes.corpo !== undefined) headers['Content-Type'] = 'application/json'
    if (opcoes.token) headers.Authorization = `Bearer ${opcoes.token}`

    let resposta: Response
    try {
      resposta = await fetch(base + caminho, {
        method: opcoes.metodo ?? 'GET',
        headers,
        body: opcoes.corpo === undefined ? undefined : JSON.stringify(opcoes.corpo),
        signal: AbortSignal.timeout(TEMPO_LIMITE_MS),
      })
    } catch {
      throw new ErroApi('Não foi possível falar com o servidor. Confira sua conexão e tente de novo.')
    }

    if (resposta.status === 204) return undefined as T
    const dados = await resposta.json().catch(() => null)
    if (!resposta.ok) throw new ErroApi(dados?.error ?? `O servidor respondeu com erro ${resposta.status}.`, resposta.status)
    if (dados === null && resposta.status !== 201) throw new ErroApi('O servidor enviou uma resposta que não deu para ler.', resposta.status)
    return dados as T
  }

  const filtro = (modulo?: Modulo) => (modulo ? `?modulo=${modulo}` : '')
  type RespostaAuth = { token: string | null; user: Sessao['user'] }
  const autenticar = (rota: string, email: string, password: string) =>
    pedir<RespostaAuth>(`/auth/${rota}`, { metodo: 'POST', corpo: { email, password } })

  return {
    modoDemonstracao: false,
    listarLinhas: (modulo) => pedir<Linha[]>(`/linhas${filtro(modulo)}`),
    obterLinha: (id) => pedir<LinhaDetalhe>(`/linhas/${encodeURIComponent(id)}`),
    listarParadas: (modulo) => pedir<Parada[]>(`/paradas${filtro(modulo)}`),
    listarVeiculos: (modulo) => pedir<Veiculo[]>(`/veiculos${filtro(modulo)}`),
    async cadastrar(email, senha) {
      const { token, user } = await autenticar('cadastro', email, senha)
      return token ? { token, user } : null
    },
    async entrar(email, senha) {
      const { token, user } = await autenticar('login', email, senha)
      if (!token) throw new ErroApi('O servidor não devolveu o acesso. Tente de novo.')
      return { token, user }
    },
    listarFavoritos: (token) => pedir<Favorito[]>('/favoritos', { token }),
    adicionarFavorito: (token, alvo) => pedir<Favorito>('/favoritos', { metodo: 'POST', corpo: alvo, token }),
    removerFavorito: (token, id) => pedir<void>(`/favoritos/${id}`, { metodo: 'DELETE', token }),
    listarCorridas: (token) => pedir<Corrida[]>('/corridas', { token }),
    chamarCarrinho: (token, origemId, destinoId) => pedir<Corrida>('/corridas', { metodo: 'POST', corpo: { origemId, destinoId }, token }),
    atualizarCorrida: (token, id, status, veiculoId) =>
      pedir<Corrida>(`/corridas/${id}`, { metodo: 'PATCH', corpo: { status, veiculoId }, token }),
    listarVeiculosCadastrados: (token) => pedir<VeiculoCadastrado[]>('/motorista/veiculos', { token }),
    listarChamados: (token) => pedir<Corrida[]>('/motorista/corridas', { token }),
    enviarPosicao: (token, veiculoId, lat, lng) =>
      pedir<void>(`/veiculos/${encodeURIComponent(veiculoId)}/posicao`, { metodo: 'PUT', corpo: { lat, lng }, token }),
    pararPosicao: (token, veiculoId) => pedir<void>(`/veiculos/${encodeURIComponent(veiculoId)}/posicao`, { metodo: 'DELETE', token }),
    enviarAvaliacao: (token, avaliacao) => pedir<void>('/avaliacoes', { metodo: 'POST', corpo: avaliacao, token: token ?? undefined }),
  }
}
