import { Link } from 'react-router'
import { BotaoFavorito } from '../componentes/BotaoFavorito'
import { CodigoLinha } from '../componentes/CodigoLinha'
import { descricaoChegada, Previsao } from '../componentes/EstadoVeiculo'
import { Carregando, Falha, Vazio } from '../componentes/Estados'
import { useConta } from '../contextos/Conta'
import type { LinhaDetalhe } from '../entidades/tipos'
import { useAgora } from '../hooks/useAgora'
import { useCarregar } from '../hooks/useCarregar'
import { useTitulo } from '../hooks/useTitulo'
import { useVeiculos } from '../hooks/useVeiculos'
import { servico } from '../services'
import { proximosHorarios } from '../services/horarios'

async function carregarLinhas() {
  const resumo = await servico.listarLinhas()
  return Promise.all(resumo.map((l) => servico.obterLinha(l.id)))
}

function Lista({ linhas }: { linhas: LinhaDetalhe[] }) {
  const { favoritos = [] } = useConta()
  const { veiculos } = useVeiculos()
  const agora = useAgora()
  const minhasLinhas = linhas.filter((l) => favoritos.some((f) => f.linhaId === l.id))
  const minhasParadas = favoritos.flatMap((f) => {
    const passam = linhas.filter((l) => l.paradas.some((p) => p.id === f.paradaId))
    const parada = passam[0]?.paradas.find((p) => p.id === f.paradaId)
    return parada ? [{ parada, passam }] : []
  })

  if (!minhasLinhas.length && !minhasParadas.length) {
    return (
      <Vazio titulo="Você ainda não tem favoritos.">
        <p>Toque na estrela de uma linha ou parada para ela aparecer aqui.</p>
        <Link to="/linhas" className="botao botao-principal">Escolher linhas</Link>
      </Vazio>
    )
  }

  return (
    <div className="grid gap-12 lg:grid-cols-2">
      <section aria-labelledby="fav-linhas">
        <h2 id="fav-linhas" className="text-2xl font-extrabold">Linhas</h2>
        {!minhasLinhas.length && <p className="mt-3 text-suave">Nenhuma linha favorita.</p>}
        <ul className="mt-4 space-y-2">
          {minhasLinhas.map((l) => {
            const v = veiculos?.find((x) => x.linhaId === l.id)
            return (
              <li key={l.id} className="flex items-center gap-1 rounded-lg bg-nevoa pr-2">
                <Link to={`/linhas/${l.id}`} className="linha-lista min-w-0 flex-1">
                  <CodigoLinha linha={l} />
                  <span className="min-w-0 flex-1">
                    <span className="block font-bold">{l.nome}</span>
                    {v && <span className="block text-sm">{descricaoChegada(v)}</span>}
                  </span>
                  {v && <Previsao veiculo={v} />}
                </Link>
                <BotaoFavorito alvo={{ linhaId: l.id }} nome={`linha ${l.codigo}`} />
              </li>
            )
          })}
        </ul>
      </section>
      <section aria-labelledby="fav-paradas">
        <h2 id="fav-paradas" className="text-2xl font-extrabold">Paradas</h2>
        {!minhasParadas.length && <p className="mt-3 text-suave">Nenhuma parada favorita.</p>}
        <ul className="mt-4 space-y-2">
          {minhasParadas.map(({ parada, passam }) => (
            <li key={parada.id} className="rounded-lg bg-nevoa p-3">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-lg font-bold">{parada.nome}</h3>
                <BotaoFavorito alvo={{ paradaId: parada.id }} nome={parada.nome} />
              </div>
              <ul className="mt-2 space-y-2">
                {passam.map((l) => {
                  const horas = proximosHorarios(l.horarios, parada.id, agora, 3)
                  return (
                    <li key={l.id}>
                      <Link to={`/linhas/${l.id}?parada=${parada.id}`} className="flex items-center gap-3">
                        <CodigoLinha linha={l} />
                        <span className="tabular-nums">{horas.length ? `Previsto: ${horas.join(', ')}` : 'Sem mais horários hoje'}</span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

function ListaCarregada() {
  const { favoritos, erro, recarregarFavoritos } = useConta()
  const linhas = useCarregar(carregarLinhas, 'detalhes')
  if (linhas.erro) return <Falha mensagem={linhas.erro} aoTentar={linhas.recarregar} />
  if (!favoritos && erro) return <Falha mensagem={erro} aoTentar={recarregarFavoritos} />
  if (!linhas.dados || !favoritos) return <Carregando texto="Buscando seus favoritos" />
  return (
    <>
      {erro && <div className="mb-6"><Falha mensagem={erro} /></div>}
      <Lista linhas={linhas.dados} />
    </>
  )
}

export default function Favoritos() {
  useTitulo('Favoritos')
  const { sessao, erro } = useConta()
  return (
    <div className="margem py-10 lg:py-16">
      <h1 className="titulo-pagina">Favoritos</h1>
      <div className="mt-8">
        {sessao ? (
          <ListaCarregada />
        ) : (
          <Vazio titulo="Entre para ver seus favoritos.">
            <p>{erro ?? 'O mapa continua aberto sem conta. Os favoritos ficam ligados ao seu e-mail.'}</p>
            <div className="flex flex-wrap gap-3">
              <Link to="/entrar" state={{ de: '/favoritos' }} className="botao botao-principal">Entrar</Link>
              <Link to="/cadastro" state={{ de: '/favoritos' }} className="botao botao-claro">Criar conta</Link>
            </div>
          </Vazio>
        )}
      </div>
    </div>
  )
}
