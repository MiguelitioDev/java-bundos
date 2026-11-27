// Implementação local do contrato, usada enquanto a API não está publicada.
import rede from '../dados/rede.json'
import type {
  Corrida, Coordenada, Favorito, Horario, Linha, LinhaDetalhe, Modulo, Parada, Sessao, StatusCorrida, Veiculo,
} from '../entidades/tipos'
import { distanciaMetros, paradaMaisProxima } from './geo'
import { paraHora, paraMinutos } from './horarios'
import { ErroApi, type Servico } from './servico'
import { simularPosicao, type RotaSimulada } from './simulacao'

type LinhaRede = (typeof rede.linhas)[number]
const paradas = rede.paradas as Parada[]
const paradaPorId = new Map(paradas.map((p) => [p.id, p]))

function rotaDe(linha: LinhaRede): RotaSimulada {
  const carrinho = linha.veiculo.tipo === 'carrinho'
  return {
    trajeto: linha.trajeto as Coordenada[],
    paradas: linha.paradas,
    circular: linha.sentido === 'Circular',
    velocidadeMs: carrinho ? 2.5 : 7,
    paradaSegundos: carrinho ? 20 : 30,
    semSinal: linha.id === 'd03' ? { periodo: 300, duracao: 75 } : undefined,
  }
}

const resumo = ({ id, modulo, codigo, nome, sentido, cor }: LinhaRede): Linha =>
  ({ id, modulo: modulo as Modulo, codigo, nome, sentido, cor })

/** Horários previstos fictícios: saída da primeira parada mais o tempo de percurso. */
function horariosDe(linha: LinhaRede): Horario[] {
  const rota = rotaDe(linha)
  let segundos = 0
  const atrasos = linha.paradas.map((parada, i) => {
    if (i > 0) {
      const pontos = rota.trajeto.slice(linha.paradas[i - 1].indiceTrajeto, parada.indiceTrajeto + 1)
      const metros = pontos.slice(1).reduce((s, p, j) => s + distanciaMetros(pontos[j], p), 0)
      segundos += metros / rota.velocidadeMs + rota.paradaSegundos
    }
    return { paradaId: parada.id, minutos: Math.round(segundos / 60) }
  })
  // Na linha circular, o fim da volta não conta como outro horário da primeira parada.
  const publicados = rota.circular ? atrasos.slice(0, -1) : atrasos
  return linha.partidas.flatMap((faixa) => {
    const horarios: Horario[] = []
    for (let saida = paraMinutos(faixa.inicio); saida <= paraMinutos(faixa.fim); saida += faixa.intervaloMin) {
      for (const { paradaId, minutos } of publicados) horarios.push({ paradaId, hora: paraHora(saida + minutos), dias: faixa.dias })
    }
    return horarios
  })
}

interface Armazenamento {
  getItem(chave: string): string | null
  setItem(chave: string, valor: string): void
}

const CHAVE_CONTAS = 'unirota.demo.contas'
const chaveFavoritos = (token: string) => `unirota.demo.favoritos.${token}`
const CHAVE_CORRIDAS = 'unirota.demo.corridas'
const CHAVE_POSICOES = 'unirota.demo.posicoes'
const CHAVE_AVALIACOES = 'unirota.demo.avaliacoes'
/** Sem posição nova por este tempo, o veículo aparece sem sinal. */
export const SEM_SINAL_APOS_MS = 30_000
const ESQUECER_APOS_MS = 600_000

type CorridaSalva = Corrida & { usuarioId: string }
type PosicaoSalva = { lat: number; lng: number; em: number; moveu: boolean }

/** Veículo com motorista: vale a posição enviada pelo aparelho, e não a simulada. */
function veiculoComMotorista(linha: LinhaRede, p: PosicaoSalva, agora: number): Pick<Veiculo, 'estado' | 'lat' | 'lng' | 'proximaParada' | 'etaMin' | 'atualizadoEm'> {
  const daLinha = linha.paradas.map((x) => paradaPorId.get(x.id)!)
  const perto = paradaMaisProxima([p.lat, p.lng], daLinha)!
  const estado = agora - p.em > SEM_SINAL_APOS_MS ? 'sem_sinal' : p.moveu ? 'em_movimento' : 'parado'
  return {
    estado,
    lat: p.lat,
    lng: p.lng,
    proximaParada: { id: perto.parada.id, nome: perto.parada.nome },
    etaMin: estado === 'em_movimento' ? Math.max(1, Math.ceil(perto.metros / 2.5 / 60)) : null,
    atualizadoEm: new Date(p.em).toISOString(),
  }
}

export function criarServicoDemonstracao(armazenamento: Armazenamento, relogio: () => number = Date.now): Servico {
  const ler = <T>(chave: string, padrao: T): T => {
    try {
      const texto = armazenamento.getItem(chave)
      return texto ? (JSON.parse(texto) as T) : padrao
    } catch {
      return padrao
    }
  }
  const gravar = (chave: string, valor: unknown) => {
    try {
      armazenamento.setItem(chave, JSON.stringify(valor))
    } catch {
      throw new ErroApi('Seu navegador não deixou salvar. Libere o armazenamento do site e tente de novo.')
    }
  }
  const filtrar = <T extends { modulo: string }>(itens: T[], modulo?: Modulo) =>
    modulo ? itens.filter((i) => i.modulo === modulo) : itens
  // Na demonstração, e-mails que começam com "motorista" abrem o painel do motorista.
  const sessaoDe = (email: string): Sessao => ({
    token: `demo:${email}`,
    user: { id: `demo:${email}`, email, papel: email.startsWith('motorista') ? 'motorista' : 'passageiro' },
  })
  const posicoes = () => ler<Record<string, PosicaoSalva>>(CHAVE_POSICOES, {})
  const corridas = () => ler<CorridaSalva[]>(CHAVE_CORRIDAS, [])
  const semDono = ({ usuarioId: _, ...corrida }: CorridaSalva): Corrida => corrida
  const ativa = (c: Corrida) => c.status === 'aguardando' || c.status === 'aceita'
  const exigirMotorista = (token: string) => {
    if (!token.startsWith('demo:motorista')) throw new ErroApi('Esta área é só para motoristas.', 403)
  }
  const normalizar = (email: string) => email.trim().toLowerCase()

  return {
    modoDemonstracao: true,
    async listarLinhas(modulo) {
      return filtrar(rede.linhas.map(resumo), modulo)
    },
    async obterLinha(id): Promise<LinhaDetalhe> {
      const linha = rede.linhas.find((l) => l.id === id)
      if (!linha) throw new ErroApi('Linha não encontrada.', 404)
      return {
        ...resumo(linha),
        trajeto: linha.trajeto as Coordenada[],
        paradas: linha.paradas
          // A parada que fecha a volta de uma linha circular não aparece duas vezes.
          .filter((p, i) => linha.paradas.findIndex((q) => q.id === p.id) === i)
          .map((p, i) => {
            const { nome, lat, lng } = paradaPorId.get(p.id)!
            return { id: p.id, nome, lat, lng, ordem: i + 1 }
          }),
        horarios: horariosDe(linha),
      }
    },
    async listarParadas(modulo) {
      return filtrar(paradas, modulo)
    },
    async listarVeiculos(modulo): Promise<Veiculo[]> {
      const agora = relogio()
      const instante = agora / 1000
      const enviadas = posicoes()
      return filtrar(rede.linhas, modulo).map((linha) => {
        const i = rede.linhas.indexOf(linha)
        const doMotorista = enviadas[linha.veiculo.id]
        if (doMotorista && agora - doMotorista.em < ESQUECER_APOS_MS) {
          const tipo = linha.veiculo.tipo as Veiculo['tipo']
          return { ...linha.veiculo, tipo, linhaId: linha.id, ...veiculoComMotorista(linha, doMotorista, agora) }
        }
        const posicao = simularPosicao(rotaDe(linha), instante, i * 137)
        const proxima = paradaPorId.get(posicao.proximaParadaId)!
        return {
          ...linha.veiculo,
          tipo: linha.veiculo.tipo as Veiculo['tipo'],
          linhaId: linha.id,
          estado: posicao.estado,
          lat: posicao.lat,
          lng: posicao.lng,
          proximaParada: { id: proxima.id, nome: proxima.nome },
          etaMin: posicao.etaMin,
          atualizadoEm: new Date(posicao.observadoEm * 1000).toISOString(),
        }
      })
    },
    // Na demonstração nenhuma senha é guardada nem conferida: a conta é só o e-mail.
    async cadastrar(email) {
      const conta = normalizar(email)
      const contas = ler<string[]>(CHAVE_CONTAS, [])
      if (contas.includes(conta)) throw new ErroApi('Já existe uma conta com este e-mail. Use a tela de entrar.', 409)
      gravar(CHAVE_CONTAS, [...contas, conta])
      return sessaoDe(conta)
    },
    async entrar(email) {
      const conta = normalizar(email)
      if (!ler<string[]>(CHAVE_CONTAS, []).includes(conta)) {
        throw new ErroApi('Não há conta com este e-mail neste navegador. Crie a conta primeiro.', 401)
      }
      return sessaoDe(conta)
    },
    async listarFavoritos(token) {
      return ler<Favorito[]>(chaveFavoritos(token), [])
    },
    async adicionarFavorito(token, alvo) {
      const atuais = ler<Favorito[]>(chaveFavoritos(token), [])
      const novo: Favorito = { id: atuais.reduce((m, f) => Math.max(m, f.id), 0) + 1, linhaId: null, paradaId: null, ...alvo }
      const repetido = atuais.find((f) => f.linhaId === novo.linhaId && f.paradaId === novo.paradaId)
      if (repetido) return repetido
      gravar(chaveFavoritos(token), [...atuais, novo])
      return novo
    },
    async removerFavorito(token, id) {
      gravar(chaveFavoritos(token), ler<Favorito[]>(chaveFavoritos(token), []).filter((f) => f.id !== id))
    },

    async listarCorridas(token) {
      return corridas().filter((c) => c.usuarioId === token).map(semDono).reverse()
    },
    async chamarCarrinho(token, origemId, destinoId) {
      const validas = [origemId, destinoId].every((id) => paradaPorId.get(id)?.modulo === 'interno')
      if (!validas || origemId === destinoId) throw new ErroApi('Escolha duas paradas diferentes do campus.', 400)
      const todas = corridas()
      if (todas.some((c) => c.usuarioId === token && ativa(c))) throw new ErroApi('Você já tem um chamado em andamento.', 409)
      const nova: CorridaSalva = {
        id: todas.reduce((m, c) => Math.max(m, c.id), 0) + 1,
        usuarioId: token,
        origemId,
        destinoId,
        status: 'aguardando',
        veiculoId: null,
        criadaEm: new Date(relogio()).toISOString(),
      }
      gravar(CHAVE_CORRIDAS, [...todas, nova])
      return semDono(nova)
    },
    async atualizarCorrida(token, id, status: StatusCorrida, veiculoId) {
      const todas = corridas()
      const corrida = todas.find((c) => c.id === id)
      if (!corrida) throw new ErroApi('Chamado não encontrado.', 404)
      if (status === 'cancelada') {
        if (corrida.usuarioId !== token) throw new ErroApi('Chamado não encontrado.', 404)
        if (!ativa(corrida)) throw new ErroApi('Este chamado já foi encerrado.', 409)
      } else {
        exigirMotorista(token)
        const permitido = (status === 'aceita' && corrida.status === 'aguardando') || (status === 'concluida' && corrida.status === 'aceita')
        if (!permitido) throw new ErroApi('Este chamado mudou. Veja a lista atualizada.', 409)
        if (status === 'aceita') corrida.veiculoId = veiculoId ?? null
      }
      corrida.status = status
      gravar(CHAVE_CORRIDAS, todas)
      return semDono(corrida)
    },
    async listarVeiculosCadastrados(token) {
      exigirMotorista(token)
      return rede.linhas
        .filter((l) => l.veiculo.tipo === 'carrinho')
        .map((l) => ({ ...l.veiculo, tipo: 'carrinho' as const, linhaId: l.id }))
    },
    async listarChamados(token) {
      exigirMotorista(token)
      return corridas().filter(ativa).map(semDono)
    },
    async enviarPosicao(token, veiculoId, lat, lng) {
      exigirMotorista(token)
      const todas = posicoes()
      const antes = todas[veiculoId]
      const moveu = !antes || distanciaMetros([antes.lat, antes.lng], [lat, lng]) > 3
      gravar(CHAVE_POSICOES, { ...todas, [veiculoId]: { lat, lng, em: relogio(), moveu } })
    },
    async pararPosicao(token, veiculoId) {
      exigirMotorista(token)
      const { [veiculoId]: _, ...resto } = posicoes()
      gravar(CHAVE_POSICOES, resto)
    },
    async enviarAvaliacao(_token, avaliacao) {
      gravar(CHAVE_AVALIACOES, [...ler<unknown[]>(CHAVE_AVALIACOES, []), { ...avaliacao, criadaEm: new Date(relogio()).toISOString() }])
    },
  }
}
