import { Link } from 'react-router'
import { BotaoFavorito } from '../componentes/BotaoFavorito'
import { CodigoLinha } from '../componentes/CodigoLinha'
import { descricaoChegada } from '../componentes/EstadoVeiculo'
import { Carregando, Falha, Vazio } from '../componentes/Estados'
import { useCarregar } from '../hooks/useCarregar'
import { useTitulo } from '../hooks/useTitulo'
import { useVeiculos } from '../hooks/useVeiculos'
import { servico } from '../services'

export default function Linhas() {
  useTitulo('Linhas e horários')
  const linhas = useCarregar(() => servico.listarLinhas(), 'linhas')
  const { veiculos } = useVeiculos()

  return (
    <div className="margem py-10 lg:py-16">
      <h1 className="titulo-pagina">Linhas e horários</h1>
      {linhas.erro ? (
        <div className="mt-8"><Falha mensagem={linhas.erro} aoTentar={linhas.recarregar} /></div>
      ) : !linhas.dados ? (
        <Carregando texto="Buscando as linhas" />
      ) : linhas.dados.length === 0 ? (
        <div className="mt-8"><Vazio titulo="Nenhuma linha cadastrada ainda." /></div>
      ) : (
        <div className="mt-10 grid gap-12 lg:grid-cols-2">
          {(['externo', 'interno'] as const).map((modulo) => (
            <section key={modulo} aria-labelledby={`titulo-${modulo}`}>
              <h2 id={`titulo-${modulo}`} className="text-2xl font-extrabold">
                {modulo === 'externo' ? 'Ônibus até a Unifor' : 'Carrinho entre os blocos'}
              </h2>
              <ul className="mt-4 space-y-2">
                {linhas.dados!.filter((l) => l.modulo === modulo).map((l) => {
                  const veiculo = veiculos?.find((v) => v.linhaId === l.id)
                  return (
                    <li key={l.id} className="flex items-center gap-1 rounded-lg bg-nevoa pr-2">
                      <Link to={`/linhas/${l.id}`} className="linha-lista min-w-0 flex-1">
                        <CodigoLinha linha={l} />
                        <span className="min-w-0">
                          <span className="block font-bold">{l.nome}</span>
                          <span className="block text-sm">{veiculo ? descricaoChegada(veiculo) : l.sentido}</span>
                        </span>
                      </Link>
                      <BotaoFavorito alvo={{ linhaId: l.id }} nome={`linha ${l.codigo}`} />
                    </li>
                  )
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
