import { useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { Carregando, Falha, Vazio } from '../componentes/Estados'
import { IconeMira } from '../componentes/Icones'
import { useConta } from '../contextos/Conta'

import { useCarregar } from '../hooks/useCarregar'
import { useLocalizacao } from '../hooks/useLocalizacao'
import { useRepetir } from '../hooks/useRepetir'
import { useTitulo } from '../hooks/useTitulo'
import { useVeiculos } from '../hooks/useVeiculos'
import { servico } from '../services'
import { paradaMaisProxima } from '../services/geo'

const situacao = {
  aguardando: { titulo: 'Chamado enviado', texto: 'Esperando um motorista aceitar. Esta tela se atualiza sozinha.' },
  aceita: { titulo: 'Carrinho a caminho', texto: 'Um motorista aceitou. Espere na parada de embarque.' },
  concluida: { titulo: 'Viagem concluída', texto: 'Que tal contar como foi?' },
  cancelada: { titulo: 'Chamado cancelado', texto: 'Você pode fazer um novo quando quiser.' },
}

function Formulario({ paradas, aoChamar }) {
  const [params] = useSearchParams()
  const pedida = params.get('de') ?? ''
  const [escolha, setEscolha] = useState({ origem: paradas.some((p) => p.id === pedida) ? pedida : '', destino: '' })
  const [tentou, setTentou] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [falha, setFalha] = useState(null)
  const { posicao, erro, buscando, pedir } = useLocalizacao()

  const proxima = posicao ? paradaMaisProxima(posicao, paradas) : null
  const sugerida = proxima && proxima.metros <= 500 ? proxima.parada : null
  const problema = !escolha.origem
    ? 'Escolha onde você vai embarcar.'
    : !escolha.destino
      ? 'Escolha para onde você vai.'
      : escolha.origem === escolha.destino
        ? 'Embarque e destino precisam ser paradas diferentes.'
        : null

  async function enviar(evento) {
    evento.preventDefault()
    setTentou(true)
    setFalha(null)
    if (problema) return
    setEnviando(true)
    try {
      await aoChamar(escolha.origem, escolha.destino)
    } catch (e) {
      setFalha(e.message)
      setEnviando(false)
    }
  }

  const seletor = (nome, rotulo) => (
    <label className="block">
      <span className="font-bold">{rotulo}</span>
      <select
        name={nome}
        className="campo"
        value={escolha[nome]}
        aria-invalid={tentou && !escolha[nome]}
        onChange={(e) => setEscolha((a) => ({ ...a, [nome]: e.target.value }))}
      >
        <option value="">Escolha uma parada</option>
        {paradas.map((p) => (
          <option key={p.id} value={p.id}>
            {p.nome}
          </option>
        ))}
      </select>
    </label>
  )

  return (
    <form onSubmit={enviar} noValidate className="max-w-md space-y-5">
      {seletor('origem', 'Onde você está')}
      <div>
        <button type="button" className="botao botao-leve" disabled={buscando} onClick={pedir}>
          <IconeMira /> {buscando ? 'Buscando sua posição…' : 'Usar a parada mais próxima'}
        </button>
        <p className="mt-2 text-sm text-suave">Sua posição serve só para sugerir a parada e não sai do navegador.</p>
        {erro && (
          <p role="alert" className="mt-2 font-semibold text-erro">
            {erro}
          </p>
        )}
        {sugerida && escolha.origem !== sugerida.id && (
          <button
            type="button"
            className="botao botao-marcado surgir mt-2"
            onClick={() => setEscolha((a) => ({ ...a, origem: sugerida.id }))}
          >
            Embarcar em {sugerida.nome}
          </button>
        )}
        {proxima && !sugerida && (
          <p role="status" className="mt-2">
            Você está longe das paradas do campus. Escolha na lista.
          </p>
        )}
      </div>
      {seletor('destino', 'Para onde vai')}
      {tentou && problema && (
        <p role="alert" className="font-semibold text-erro">
          {problema}
        </p>
      )}
      {falha && (
        <p role="alert" className="rounded-lg bg-alerta-fundo p-3 font-semibold text-alerta">
          {falha}
        </p>
      )}
      <button type="submit" className="botao botao-principal botao-grande w-full" disabled={enviando}>
        {enviando ? 'Chamando…' : 'Chamar o carrinho'}
      </button>
    </form>
  )
}

function Painel({ sessao }) {
  const paradas = useCarregar(() => servico.listarParadas('interno'), 'paradas-internas')
  const corridas = useRepetir(() => servico.listarCorridas(sessao.token), 3000, sessao.token)
  const { veiculos } = useVeiculos('interno')
  const [cancelando, setCancelando] = useState(false)
  const [falha, setFalha] = useState(null)
  const [dispensada, setDispensada] = useState(null)

  if (paradas.erro) return <Falha mensagem={paradas.erro} aoTentar={paradas.recarregar} />
  if (!corridas.dados && corridas.erro) return <Falha mensagem={corridas.erro} aoTentar={corridas.atualizar} />
  if (!paradas.dados || !corridas.dados) return <Carregando texto="Preparando o chamado" />

  const ultima = corridas.dados[0]
  const ativa = ultima && (ultima.status === 'aguardando' || ultima.status === 'aceita')
  const mostrar = ultima && (ativa || (ultima.status === 'concluida' && dispensada !== ultima.id)) ? ultima : null
  const nome = (id) => paradas.dados.find((p) => p.id === id)?.nome ?? id
  const veiculo = veiculos?.find((v) => v.id === mostrar?.veiculoId)

  async function cancelar(id) {
    setCancelando(true)
    setFalha(null)
    try {
      await servico.atualizarCorrida(sessao.token, id, 'cancelada')
    } catch (e) {
      setFalha(e.message)
    }
    setCancelando(false)
    corridas.atualizar()
  }

  if (!mostrar) {
    return (
      <Formulario
        paradas={paradas.dados}
        aoChamar={async (origem, destino) => {
          await servico.chamarCarrinho(sessao.token, origem, destino)
          corridas.atualizar()
        }}
      />
    )
  }

  return (
    <div className="max-w-xl">
      <div key={mostrar.status} role="status" className="surgir rounded-2xl bg-tinta p-6 text-white">
        <p className="text-3xl font-extrabold tracking-tight">{situacao[mostrar.status].titulo}</p>
        <p className="mt-2">{situacao[mostrar.status].texto}</p>
        <dl className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-agua">Embarque</dt>
            <dd className="text-lg font-bold">{nome(mostrar.origemId)}</dd>
          </div>
          <div>
            <dt className="text-sm text-agua">Destino</dt>
            <dd className="text-lg font-bold">{nome(mostrar.destinoId)}</dd>
          </div>
        </dl>
        {mostrar.status === 'aceita' && veiculo && (
          <Link to={`/mapa?modulo=interno&linha=${veiculo.linhaId}`} className="botao botao-claro mt-5">
            Ver o carrinho no mapa
          </Link>
        )}
      </div>
      {corridas.erro && (
        <p role="status" className="mt-3">
          Sem atualização agora. Tentando de novo.
        </p>
      )}
      {falha && (
        <div className="mt-3">
          <Falha mensagem={falha} />
        </div>
      )}
      <div className="mt-5 flex flex-wrap gap-3">
        {ativa ? (
          <button type="button" className="botao botao-leve" disabled={cancelando} onClick={() => cancelar(mostrar.id)}>
            {cancelando ? 'Cancelando…' : 'Cancelar chamado'}
          </button>
        ) : (
          <>
            <Link to="/avaliar" className="botao botao-principal">
              Avaliar a viagem
            </Link>
            <button type="button" className="botao botao-leve" onClick={() => setDispensada(mostrar.id)}>
              Fazer outro chamado
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default function Chamar() {
  useTitulo('Chamar o carrinho')
  const { sessao } = useConta()
  return (
    <div className="margem py-10 lg:py-16">
      <h1 className="titulo-pagina">Chamar o carrinho</h1>
      <p className="mt-3 max-w-xl text-lg">Peça o carrinho de uma parada do campus até outra.</p>
      {servico.modoDemonstracao && (
        <p className="mt-4 max-w-xl rounded-lg bg-alerta-fundo p-4 text-alerta">Modo demonstração: nenhum carrinho de verdade é chamado.</p>
      )}
      <div className="mt-8">
        {sessao ? (
          <Painel key={sessao.token} sessao={sessao} />
        ) : (
          <Vazio titulo="Entre para chamar o carrinho.">
            <p>O motorista precisa saber que o chamado é de uma pessoa cadastrada.</p>
            <div className="flex flex-wrap gap-3">
              <Link to="/entrar" state={{ de: '/chamar' }} className="botao botao-principal">
                Entrar
              </Link>
              <Link to="/cadastro" state={{ de: '/chamar' }} className="botao botao-claro">
                Criar conta
              </Link>
            </div>
          </Vazio>
        )}
      </div>
    </div>
  )
}
