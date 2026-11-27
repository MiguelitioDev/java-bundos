import { ErroApi } from './servico'

// Hospedagens gratuitas podem levar quase um minuto para acordar.
const TEMPO_LIMITE_MS = 60_000

export function criarServicoHttp(base) {
  async function pedir(caminho, opcoes = {}) {
    const headers = {}
    if (opcoes.corpo !== undefined) headers['Content-Type'] = 'application/json'
    if (opcoes.token) headers.Authorization = `Bearer ${opcoes.token}`

    let resposta
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

    if (resposta.status === 204) return undefined
    const dados = await resposta.json().catch(() => null)
    if (!resposta.ok) throw new ErroApi(dados?.error ?? `O servidor respondeu com erro ${resposta.status}.`, resposta.status)
    if (dados === null && resposta.status !== 201)
      throw new ErroApi('O servidor enviou uma resposta que não deu para ler.', resposta.status)
    return dados
  }

  const filtro = (modulo) => (modulo ? `?modulo=${modulo}` : '')

  const autenticar = (rota, email, password) => pedir(`/auth/${rota}`, { metodo: 'POST', corpo: { email, password } })

  return {
    modoDemonstracao: false,
    listarLinhas: (modulo) => pedir(`/linhas${filtro(modulo)}`),
    obterLinha: (id) => pedir(`/linhas/${encodeURIComponent(id)}`),
    listarParadas: (modulo) => pedir(`/paradas${filtro(modulo)}`),
    listarVeiculos: (modulo) => pedir(`/veiculos${filtro(modulo)}`),
    async cadastrar(email, senha) {
      const { token, user } = await autenticar('cadastro', email, senha)
      return token ? { token, user } : null
    },
    async entrar(email, senha) {
      const { token, user } = await autenticar('login', email, senha)
      if (!token) throw new ErroApi('O servidor não devolveu o acesso. Tente de novo.')
      return { token, user }
    },
    listarFavoritos: (token) => pedir('/favoritos', { token }),
    adicionarFavorito: (token, alvo) => pedir('/favoritos', { metodo: 'POST', corpo: alvo, token }),
    removerFavorito: (token, id) => pedir(`/favoritos/${id}`, { metodo: 'DELETE', token }),
    listarCorridas: (token) => pedir('/corridas', { token }),
    chamarCarrinho: (token, origemId, destinoId) => pedir('/corridas', { metodo: 'POST', corpo: { origemId, destinoId }, token }),
    atualizarCorrida: (token, id, status, veiculoId) => pedir(`/corridas/${id}`, { metodo: 'PATCH', corpo: { status, veiculoId }, token }),
    listarVeiculosCadastrados: (token) => pedir('/motorista/veiculos', { token }),
    listarChamados: (token) => pedir('/motorista/corridas', { token }),
    enviarPosicao: (token, veiculoId, lat, lng) =>
      pedir(`/veiculos/${encodeURIComponent(veiculoId)}/posicao`, { metodo: 'PUT', corpo: { lat, lng }, token }),
    pararPosicao: (token, veiculoId) => pedir(`/veiculos/${encodeURIComponent(veiculoId)}/posicao`, { metodo: 'DELETE', token }),
    enviarAvaliacao: (token, avaliacao) => pedir('/avaliacoes', { metodo: 'POST', corpo: avaliacao, token: token ?? undefined }),
  }
}
