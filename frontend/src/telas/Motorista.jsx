import { useState } from 'react'
import { Link } from 'react-router'
import { Carregando, Falha, Vazio } from '../componentes/Estados'
import { useConta } from '../contextos/Conta'

import { useCarregar } from '../hooks/useCarregar'
import { useCompartilharPosicao } from '../hooks/useCompartilharPosicao'
import { useRepetir } from '../hooks/useRepetir'
import { useTitulo } from '../hooks/useTitulo'
import { servico } from '../services'

async function carregarCadastro(token) {
  const [veiculos, paradas] = await Promise.all([servico.listarVeiculosCadastrados(token), servico.listarParadas('interno')])
  return { veiculos, paradas }
}

function Painel({ sessao }) {
  const cadastro = useCarregar(() => carregarCadastro(sessao.token), sessao.token)
  const chamados = useRepetir(() => servico.listarChamados(sessao.token), 3000, sessao.token)
  const posicao = useCompartilharPosicao(sessao.token)
  const [escolhido, setEscolhido] = useState('')
  const [ocupado, setOcupado] = useState(null)
  const [falha, setFalha] = useState(null)

  if (cadastro.erro) return <Falha mensagem={cadastro.erro} aoTentar={cadastro.recarregar} />
  if (!cadastro.dados) return <Carregando texto="Preparando o painel" />

  const { veiculos, paradas } = cadastro.dados
  if (!veiculos.length) return <Vazio titulo="Nenhum carrinho cadastrado ainda." />
  const veiculoId = posicao.veiculoId ?? (escolhido || veiculos[0].id)
  const nome = (id) => paradas.find((p) => p.id === id)?.nome ?? id

  async function mudar(id, status) {
    setOcupado(id)
    setFalha(null)
    try {
      await servico.atualizarCorrida(sessao.token, id, status, veiculoId)
    } catch (e) {
      setFalha(e.message)
    }
    setOcupado(null)
    chamados.atualizar()
  }

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <section aria-labelledby="titulo-posicao">
        <h2 id="titulo-posicao" className="text-2xl font-extrabold">
          Seu carrinho
        </h2>
        <label className="mt-4 block">
          <span className="font-bold">Veículo</span>
          <select className="campo" value={veiculoId} disabled={posicao.veiculoId !== null} onChange={(e) => setEscolhido(e.target.value)}>
            {veiculos.map((v) => (
              <option key={v.id} value={v.id}>
                {v.nome} ({v.id})
              </option>
            ))}
          </select>
        </label>
        <div role="status" className={`mt-4 rounded-2xl p-5 ${posicao.veiculoId ? 'bg-tinta text-white' : 'bg-nevoa'}`}>
          <p className="text-2xl font-extrabold">{posicao.veiculoId ? 'Posição ligada' : 'Posição desligada'}</p>
          <p className="mt-1">
            {!posicao.veiculoId
              ? 'Os passageiros só veem o carrinho depois que você ligar.'
              : posicao.enviadaEm
                ? `Último envio às ${posicao.enviadaEm.toLocaleTimeString('pt-BR')}.`
                : 'Aguardando o primeiro sinal do aparelho…'}
          </p>
        </div>
        {posicao.erro && (
          <div className="mt-3">
            <Falha mensagem={posicao.erro} />
          </div>
        )}
        <button
          type="button"
          className={`botao botao-grande mt-4 w-full ${posicao.veiculoId ? 'botao-leve' : 'botao-principal'}`}
          onClick={() => (posicao.veiculoId ? posicao.parar() : posicao.comecar(veiculoId))}
        >
          {posicao.veiculoId ? 'Parar de enviar minha posição' : 'Começar a enviar minha posição'}
        </button>
        <p className="mt-3 text-sm text-suave">
          Enquanto estiver ligado, a localização deste aparelho aparece no mapa para todos. Deixe esta tela aberta e o celular desbloqueado.
        </p>
      </section>

      <section aria-labelledby="titulo-chamados">
        <h2 id="titulo-chamados" className="text-2xl font-extrabold">
          Chamados
        </h2>
        {falha && (
          <div className="mt-3">
            <Falha mensagem={falha} />
          </div>
        )}
        {chamados.erro && (
          <p role="status" className="mt-3 rounded-lg bg-alerta-fundo p-3 text-alerta">
            {chamados.erro}
          </p>
        )}
        {!chamados.dados ? (
          !chamados.erro && <Carregando texto="Buscando chamados" />
        ) : chamados.dados.length === 0 ? (
          <p className="mt-4 rounded-lg bg-nevoa p-4">Nenhum chamado agora. A lista se atualiza sozinha.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {chamados.dados.map((c) => (
              <li key={c.id} className="surgir rounded-lg bg-nevoa p-4">
                <p className="text-lg font-bold">
                  {nome(c.origemId)} → {nome(c.destinoId)}
                </p>
                <p className="text-sm">
                  Pedido às {new Date(c.criadaEm).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  {c.status === 'aceita' && `, aceito (${c.veiculoId})`}
                </p>
                <button
                  type="button"
                  className="botao botao-principal mt-3"
                  disabled={ocupado !== null || (c.status === 'aguardando' && !posicao.veiculoId)}
                  onClick={() => mudar(c.id, c.status === 'aguardando' ? 'aceita' : 'concluida')}
                >
                  {c.status === 'aguardando' ? 'Aceitar chamado' : 'Concluir viagem'}
                </button>
                {c.status === 'aguardando' && !posicao.veiculoId && <p className="mt-2 text-sm">Ligue sua posição para aceitar.</p>}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

export default function Motorista() {
  useTitulo('Painel do motorista')
  const { sessao } = useConta()
  return (
    <div className="margem py-10 lg:py-16">
      <h1 className="titulo-pagina">Painel do motorista</h1>
      <div className="mt-8">
        {sessao?.user.papel === 'motorista' ? (
          <Painel key={sessao.token} sessao={sessao} />
        ) : (
          <Vazio titulo="Esta área é só para motoristas.">
            <p>
              {servico.modoDemonstracao
                ? 'Para testar, crie uma conta com um e-mail que comece com "motorista".'
                : 'A equipe do projeto libera o acesso para cada motorista participante.'}
            </p>
            <Link to="/cadastro" state={{ de: '/motorista' }} className="botao botao-principal">
              Criar conta
            </Link>
            <Link to="/entrar" state={{ de: '/motorista' }} className="botao botao-claro">
              Entrar com outra conta
            </Link>
          </Vazio>
        )}
      </div>
    </div>
  )
}
