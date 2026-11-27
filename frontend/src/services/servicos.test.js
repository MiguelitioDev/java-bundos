import { describe, expect, it } from 'vitest'
import rede from '../dados/rede.json'
import { criarServicoDemonstracao } from './demonstracao'
import { distanciaMetros } from './geo'
import { horariosDoDia, proximosHorarios } from './horarios'
import { simularPosicao } from './simulacao'
import { erroConfirmacao, erroEmail, erroSenha } from './validacao'

// Duas paradas separadas por cerca de 111 m; a 11,1 m/s o trecho dura 10 s.
const rota = {
  trajeto: [
    [0, 0],
    [0.001, 0],
  ],
  paradas: [
    { id: 'a', indiceTrajeto: 0 },
    { id: 'b', indiceTrajeto: 1 },
  ],
  circular: false,
  velocidadeMs: 11.12,
  paradaSegundos: 5,
}

const memoria = () => {
  const dados = new Map()
  return { getItem: (c) => dados.get(c) ?? null, setItem: (c, v) => void dados.set(c, v), dados }
}

describe('simularPosicao', () => {
  it('anda em direção à próxima parada, com previsão', () => {
    const p = simularPosicao(rota, 5)
    expect(p.estado).toBe('em_movimento')
    expect(p.proximaParadaId).toBe('b')
    expect(p.etaMin).toBe(1)
    expect(p.lat).toBeGreaterThan(0)
    expect(p.lat).toBeLessThan(0.001)
  })
  it('fica parado na parada, sem previsão, e depois volta', () => {
    const p = simularPosicao(rota, 12)
    expect(p).toMatchObject({ estado: 'parado', etaMin: null, proximaParadaId: 'a', lat: 0.001 })
    expect(simularPosicao(rota, 20).proximaParadaId).toBe('a')
  })
  it('sem sinal mantém a última posição conhecida e não promete horário', () => {
    const comPerda = { ...rota, semSinal: { periodo: 100, duracao: 40 } }
    const a = simularPosicao(comPerda, 70)
    const b = simularPosicao(comPerda, 95)
    expect(a.estado).toBe('sem_sinal')
    expect(a.etaMin).toBeNull()
    expect([b.lat, b.lng, b.observadoEm]).toEqual([a.lat, a.lng, a.observadoEm])
  })
})

describe('dados demonstrativos', () => {
  it('cada parada de cada linha está sobre o trajeto', () => {
    for (const linha of rede.linhas) {
      for (const p of linha.paradas) {
        const parada = rede.paradas.find((q) => q.id === p.id)
        const ponto = linha.trajeto[p.indiceTrajeto]
        expect(distanciaMetros(ponto, [parada.lat, parada.lng])).toBeLessThan(25)
      }
    }
  })
  it('não tem horário no domingo e tem em dia útil', async () => {
    const linha = await criarServicoDemonstracao(memoria()).obterLinha('c01')
    expect(horariosDoDia(linha.horarios, 'int-a', 0)).toEqual([])
    expect(horariosDoDia(linha.horarios, 'int-a', 5)[0]).toBe('07:00')
    expect(proximosHorarios(linha.horarios, 'int-a', new Date(2026, 11, 4, 7, 5), 2)).toEqual(['07:15', '07:30'])
  })
  it('linha circular não repete a parada inicial', async () => {
    const linha = await criarServicoDemonstracao(memoria()).obterLinha('c01')
    expect(new Set(linha.paradas.map((p) => p.id)).size).toBe(linha.paradas.length)
  })
})

describe('conta e favoritos na demonstração', () => {
  it('não guarda a senha e não repete favorito', async () => {
    const m = memoria()
    const s = criarServicoDemonstracao(m)
    const sessao = await s.cadastrar('Aluno@Exemplo.com', 'segredo-teste')
    await s.adicionarFavorito(sessao.token, { linhaId: 'c01' })
    await s.adicionarFavorito(sessao.token, { linhaId: 'c01' })
    expect(await s.listarFavoritos(sessao.token)).toHaveLength(1)
    expect([...m.dados.values()].join()).not.toContain('segredo-teste')
    await expect(s.entrar('outro@exemplo.com', 'x')).rejects.toThrow('Não há conta')
  })
})

describe('validação dos formulários', () => {
  it('recusa entradas inválidas e aceita válidas', () => {
    expect(erroEmail('ana')).not.toBeNull()
    expect(erroEmail('ana@exemplo.com')).toBeNull()
    expect(erroSenha('123')).not.toBeNull()
    expect(erroConfirmacao('123456', '123457')).not.toBeNull()
    expect(erroConfirmacao('123456', '123456')).toBeNull()
  })
})

describe('chamar o carrinho', () => {
  it('vai de aguardando a concluída, com um chamado ativo por pessoa', async () => {
    const s = criarServicoDemonstracao(memoria())
    const aluno = await s.cadastrar('aluno@exemplo.com', 'x')
    const motorista = await s.cadastrar('motorista@exemplo.com', 'x')
    expect(motorista.user.papel).toBe('motorista')
    await expect(s.chamarCarrinho(aluno.token, 'int-a', 'int-a')).rejects.toThrow('diferentes')
    const corrida = await s.chamarCarrinho(aluno.token, 'int-a', 'int-m')
    await expect(s.chamarCarrinho(aluno.token, 'int-b', 'int-m')).rejects.toThrow('em andamento')
    await expect(s.atualizarCorrida(aluno.token, corrida.id, 'aceita', 'carrinho-1')).rejects.toThrow('motoristas')
    await s.atualizarCorrida(motorista.token, corrida.id, 'aceita', 'carrinho-1')
    await s.atualizarCorrida(motorista.token, corrida.id, 'concluida')
    expect((await s.listarCorridas(aluno.token))[0]).toMatchObject({ status: 'concluida', veiculoId: 'carrinho-1' })
    expect(await s.listarChamados(motorista.token)).toEqual([])
  })
  it('usa a posição do motorista e marca sem sinal quando ela envelhece', async () => {
    let agora = 1_000_000_000
    const s = criarServicoDemonstracao(memoria(), () => agora)
    const motorista = await s.cadastrar('motorista@exemplo.com', 'x')
    await s.enviarPosicao(motorista.token, 'carrinho-1', -3.77, -38.48)
    const ver = async () => (await s.listarVeiculos('interno')).find((v) => v.id === 'carrinho-1')
    expect(await ver()).toMatchObject({ lat: -3.77, estado: 'em_movimento' })
    agora += 60_000
    expect(await ver()).toMatchObject({ lat: -3.77, estado: 'sem_sinal', etaMin: null })
  })
})
