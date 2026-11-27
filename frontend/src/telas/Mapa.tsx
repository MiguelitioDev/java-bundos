import { useCallback, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { CodigoLinha } from '../componentes/CodigoLinha'
import { descricaoChegada, EstadoVeiculo, Previsao } from '../componentes/EstadoVeiculo'
import { Carregando, Falha } from '../componentes/Estados'
import { IconeCarrinho, IconeMira } from '../componentes/Icones'
import MapaRede from '../componentes/MapaRede'
import { SeletorModulo } from '../componentes/SeletorModulo'
import type { Modulo, Parada } from '../entidades/tipos'
import { useCarregar } from '../hooks/useCarregar'
import { useLocalizacao } from '../hooks/useLocalizacao'
import { useTitulo } from '../hooks/useTitulo'
import { useVeiculos } from '../hooks/useVeiculos'
import { servico } from '../services'
import { minutosAPe, paradaMaisProxima } from '../services/geo'
import { textos } from '../services/textos'

async function carregarRede(modulo: Modulo) {
  const resumo = await servico.listarLinhas(modulo)
  const [linhas, paradas] = await Promise.all([Promise.all(resumo.map((l) => servico.obterLinha(l.id))), servico.listarParadas(modulo)])
  return { linhas, paradas }
}

function MinhaPosicao({ localizacao, paradas }: { localizacao: ReturnType<typeof useLocalizacao>; paradas: Parada[] }) {
  const [explicando, setExplicando] = useState(false)
  const { posicao, erro, buscando, pedir, desligar } = localizacao
  const proxima = posicao ? paradaMaisProxima(posicao, paradas) : null
  const encerrar = () => {
    setExplicando(false)
    desligar()
  }

  if (proxima) {
    return (
      <div className="surgir rounded-lg bg-nevoa p-4" role="status">
        {proxima.metros > 5000 ? (
          <p>Você está longe das paradas deste tipo de transporte.</p>
        ) : (
          <>
            <p className="text-sm">Parada mais próxima</p>
            <p className="text-lg font-bold">{proxima.parada.nome}</p>
            <p>Cerca de {minutosAPe(proxima.metros)} min a pé, em linha reta.</p>
          </>
        )}
        <button type="button" className="botao botao-claro mt-3" onClick={encerrar}>Parar de usar minha localização</button>
      </div>
    )
  }

  if (explicando || buscando || erro) {
    return (
      <div className="surgir rounded-lg bg-nevoa p-4">
        {erro ? (
          <p role="alert" className="font-semibold">{erro}</p>
        ) : (
          <p>Sua posição aparece como um ponto azul e serve para achar a parada mais próxima. Ela não é gravada nem enviada à equipe.</p>
        )}
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" className="botao botao-principal" disabled={buscando} onClick={pedir}>
            {buscando ? 'Buscando sua posição…' : erro ? 'Tentar de novo' : 'Permitir localização'}
          </button>
          <button type="button" className="botao botao-claro" onClick={encerrar}>Agora não</button>
        </div>
      </div>
    )
  }

  return (
    <button type="button" className="botao botao-leve w-full" onClick={() => setExplicando(true)}>
      <IconeMira /> Usar minha localização
    </button>
  )
}

export default function Mapa() {
  useTitulo('Mapa')
  const [params, setParams] = useSearchParams()
  const modulo: Modulo = params.get('modulo') === 'interno' ? 'interno' : 'externo'
  const rede = useCarregar(() => carregarRede(modulo), modulo)
  const { veiculos, erro } = useVeiculos(modulo)
  const localizacao = useLocalizacao()

  const pedida = params.get('linha')
  const selecionada = rede.dados?.linhas.some((l) => l.id === pedida) ? pedida : null

  const selecionar = useCallback(
    (linhaId: string | null) => {
      setParams(linhaId ? { modulo, linha: linhaId } : { modulo }, { replace: true })
    },
    [modulo, setParams],
  )

  return (
    <div className="tela-mapa">
      <div className="area-mapa">
        <MapaRede
          linhas={rede.dados?.linhas ?? []}
          veiculos={veiculos ?? []}
          linhaSelecionada={selecionada}
          posicao={localizacao.posicao}
          aoSelecionar={selecionar}
        />
      </div>

      <section className="painel-mapa" aria-labelledby="titulo-mapa">
        <h1 id="titulo-mapa" className="text-2xl font-extrabold tracking-tight">
          {modulo === 'externo' ? 'Ônibus até a Unifor' : 'Carrinho entre os blocos'}
        </h1>
        <SeletorModulo valor={modulo} aoMudar={(m) => setParams({ modulo: m })} />

        {rede.erro ? (
          <Falha mensagem={rede.erro} aoTentar={rede.recarregar} />
        ) : !rede.dados ? (
          <Carregando texto="Buscando as linhas" />
        ) : (
          <>
            {erro && (
              <p role="status" className="rounded-lg bg-alerta-fundo p-3 text-alerta">
                {veiculos ? 'Sem atualização agora. Mostrando as últimas posições.' : erro}
              </p>
            )}
            {modulo === 'interno' && (
              <Link to="/chamar" className="botao botao-principal w-full"><IconeCarrinho /> Chamar o carrinho</Link>
            )}
            <ul className="space-y-2">
              {rede.dados.linhas.map((linha) => {
                const doVeiculo = veiculos?.filter((v) => v.linhaId === linha.id) ?? []
                const aberta = selecionada === linha.id
                return (
                  <li key={linha.id} className={`rounded-lg ${aberta ? 'bg-tinta text-white' : 'bg-nevoa'}`}>
                    <button type="button" className="linha-mapa" aria-pressed={aberta} onClick={() => selecionar(aberta ? null : linha.id)}>
                      <CodigoLinha linha={linha} />
                      <span className="min-w-0 text-left">
                        <span className="block font-bold">{linha.nome}</span>
                        {veiculos && doVeiculo.length === 0 && <span className="block text-sm">Nenhum veículo agora</span>}
                        {doVeiculo.map((v) => (
                          <span key={v.id} className="block text-sm">
                            <span className="block"><EstadoVeiculo estado={v.estado} /></span>
                            <span className="block">{descricaoChegada(v)}</span>
                          </span>
                        ))}
                      </span>
                      <span className={`text-right ${aberta ? 'text-agua' : ''}`}>
                        {doVeiculo[0] && <Previsao veiculo={doVeiculo[0]} />}
                      </span>
                    </button>
                    {aberta && (
                      <div className="surgir px-3 pb-3">
                        <Link to={`/linhas/${linha.id}`} className="botao botao-claro w-full">Ver paradas e horários</Link>
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
            <MinhaPosicao localizacao={localizacao} paradas={rede.dados.paradas} />
          </>
        )}
        <p className="text-sm text-suave">
          {textos.origemPosicoes} <Link to="/avaliar" className="underline">Avaliar</Link> · <Link to="/privacidade" className="underline">Privacidade</Link>
        </p>
      </section>
    </div>
  )
}
