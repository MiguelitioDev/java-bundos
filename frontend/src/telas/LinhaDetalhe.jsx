import { useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router'
import { BotaoFavorito } from '../componentes/BotaoFavorito'
import { CodigoLinha } from '../componentes/CodigoLinha'
import { descricaoChegada, EstadoVeiculo, Previsao } from '../componentes/EstadoVeiculo'
import { Carregando, Falha } from '../componentes/Estados'
import { useAgora } from '../hooks/useAgora'
import { useCarregar } from '../hooks/useCarregar'
import { useTitulo } from '../hooks/useTitulo'
import { useVeiculos } from '../hooks/useVeiculos'
import { servico } from '../services'
import { horariosDoDia, proximosHorarios } from '../services/horarios'
import { textos } from '../services/textos'

const dias = [
  { nome: 'Segunda a sexta', exemplo: 1 },
  { nome: 'Sábado', exemplo: 6 },
  { nome: 'Domingo', exemplo: 0 },
]
const grupoDe = (dia) => (dia === 0 ? 0 : dia === 6 ? 6 : 1)

export default function LinhaDetalhe() {
  const { id = '' } = useParams()
  const [params, setParams] = useSearchParams()
  const linha = useCarregar(() => servico.obterLinha(id), id)
  const { veiculos } = useVeiculos()
  const agora = useAgora()
  const [dia, setDia] = useState(() => grupoDe(new Date().getDay()))
  useTitulo(linha.dados ? `${linha.dados.codigo} ${linha.dados.nome}` : 'Linha')

  if (linha.erro) {
    return (
      <div className="margem py-10">
        <h1 className="titulo-pagina">Linha indisponível</h1>
        <div className="mt-6">
          <Falha mensagem={linha.erro} aoTentar={linha.recarregar} />
        </div>
        <Link to="/linhas" className="botao botao-leve mt-6">
          Ver todas as linhas
        </Link>
      </div>
    )
  }
  if (!linha.dados)
    return (
      <div className="margem">
        <Carregando texto="Buscando a linha" />
      </div>
    )

  const dados = linha.dados
  const veiculo = veiculos?.find((v) => v.linhaId === dados.id)
  const parada = dados.paradas.find((p) => p.id === params.get('parada')) ?? dados.paradas[0]
  const quadro = parada ? horariosDoDia(dados.horarios, parada.id, dia) : []
  const proximo = parada && dia === grupoDe(agora.getDay()) ? proximosHorarios(dados.horarios, parada.id, agora, 1)[0] : undefined

  return (
    <div className="margem py-10 lg:py-16">
      <div className="flex flex-wrap items-center gap-4">
        <CodigoLinha linha={dados} grande />
        <div>
          <h1 className="titulo-pagina">{dados.nome}</h1>
          <p className="text-suave">{dados.sentido}</p>
        </div>
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link to={`/mapa?modulo=${dados.modulo}&linha=${dados.id}`} className="botao botao-principal">
          Ver no mapa
        </Link>
        <BotaoFavorito alvo={{ linhaId: dados.id }} nome={`linha ${dados.codigo}`} comTexto />
        {dados.modulo === 'interno' && parada && (
          <Link to={`/chamar?de=${parada.id}`} className="botao botao-leve">
            Chamar o carrinho
          </Link>
        )}
      </div>

      {veiculo && (
        <div className="mt-8 flex items-center justify-between gap-4 rounded-2xl bg-tinta p-5 text-white">
          <div>
            <p className="text-lg font-bold">{veiculo.nome}</p>
            <p>
              <EstadoVeiculo estado={veiculo.estado} />
            </p>
            <p>{descricaoChegada(veiculo)}</p>
          </div>
          <span className="text-agua">
            <Previsao veiculo={veiculo} />
          </span>
        </div>
      )}

      <div className="mt-12 grid gap-12 lg:grid-cols-2">
        <section aria-labelledby="titulo-paradas">
          <h2 id="titulo-paradas" className="text-2xl font-extrabold">
            Paradas
          </h2>
          <p className="mt-1 text-suave">Escolha uma parada para ver os horários dela.</p>
          <ol className="percurso mt-4" style={{ '--cor': dados.cor }}>
            {dados.paradas.map((p) => {
              const seguintes = proximosHorarios(dados.horarios, p.id, agora, 2)
              const chegando = veiculo?.proximaParada?.id === p.id && veiculo.etaMin !== null
              return (
                <li key={p.id} className="flex items-center gap-1">
                  <button
                    type="button"
                    className="parada-percurso"
                    aria-pressed={p.id === parada?.id}
                    onClick={() => setParams({ parada: p.id }, { replace: true })}
                  >
                    <span className="block font-bold">{p.nome}</span>
                    <span className="block text-sm">
                      {seguintes.length ? `Previsto hoje: ${seguintes.join(' e ')}` : 'Sem mais horários hoje'}
                    </span>
                    {chegando && <span className="block text-sm font-bold">Veículo chega em {veiculo.etaMin} min</span>}
                  </button>
                  <BotaoFavorito alvo={{ paradaId: p.id }} nome={p.nome} />
                </li>
              )
            })}
          </ol>
          {dados.sentido === 'Circular' && <p className="mt-3 text-suave">Depois da última parada, o trajeto volta para a primeira.</p>}
        </section>

        <section aria-labelledby="titulo-horarios">
          <h2 id="titulo-horarios" className="text-2xl font-extrabold">
            Horários previstos
          </h2>
          <p className="mt-1 text-suave" aria-live="polite">
            {parada?.nome}
          </p>
          <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Dia da semana">
            {dias.map((d) => (
              <button
                key={d.exemplo}
                type="button"
                className={`botao ${dia === d.exemplo ? 'botao-marcado' : 'botao-leve'}`}
                aria-pressed={dia === d.exemplo}
                onClick={() => setDia(d.exemplo)}
              >
                {d.nome}
              </button>
            ))}
          </div>
          {quadro.length === 0 ? (
            <p className="mt-6 rounded-lg bg-nevoa p-4">Não há horários previstos neste dia.</p>
          ) : (
            <ul className="quadro-horarios mt-6">
              {quadro.map((h) => (
                <li key={h} className={h === proximo ? 'bg-tinta font-extrabold text-white' : 'bg-nevoa'}>
                  {h}
                  {h === proximo && <span className="sr-only"> (próximo)</span>}
                </li>
              ))}
            </ul>
          )}
          <p className="mt-4 text-sm text-suave">{textos.horarios}</p>
        </section>
      </div>
    </div>
  )
}
