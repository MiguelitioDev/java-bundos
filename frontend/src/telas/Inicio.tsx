import { Link } from 'react-router'
import { CodigoLinha } from '../componentes/CodigoLinha'
import { Carregando, Falha } from '../componentes/Estados'
import { PainelChegadas } from '../componentes/PainelChegadas'
import type { Modulo } from '../entidades/tipos'
import { useCarregar } from '../hooks/useCarregar'
import { useTitulo } from '../hooks/useTitulo'
import { servico } from '../services'
import { textos } from '../services/textos'

const redes: { modulo: Modulo; titulo: string; texto: string }[] = [
  { modulo: 'externo', titulo: 'Até a Unifor', texto: 'Ônibus que saem da Aldeota, da Messejana e da Parangaba, com as paradas no caminho.' },
  { modulo: 'interno', titulo: 'Entre os blocos', texto: 'O carrinho que liga blocos, Biblioteca, Reitoria e Convivência. Você também pode chamá-lo.' },
]

export default function Inicio() {
  useTitulo()
  const linhas = useCarregar(() => servico.listarLinhas(), 'linhas')

  return (
    <>
      <div className="margem grid items-start gap-10 py-10 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:py-16">
        <div className="lg:sticky lg:top-10">
          <h1 className="titulo-capa">Onde está o seu transporte?</h1>
          <p className="mt-6 max-w-md text-xl leading-normal">
            Veja no mapa o ônibus até a Unifor e o carrinho entre os blocos, com a próxima parada e quanto falta.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link to="/mapa" className="botao botao-principal botao-grande">Abrir o mapa</Link>
            <Link to="/chamar" className="botao botao-leve botao-grande">Chamar o carrinho</Link>
          </div>
          <p className="mt-8 max-w-md text-suave">{textos.avisoInicio}</p>
        </div>
        <PainelChegadas />
      </div>

      <section aria-labelledby="titulo-redes" className="bg-nevoa py-16 lg:py-24">
        <div className="margem">
          <h2 id="titulo-redes" className="titulo-secao">Duas redes no mesmo mapa</h2>
          {linhas.erro ? (
            <div className="mt-8"><Falha mensagem={linhas.erro} aoTentar={linhas.recarregar} /></div>
          ) : !linhas.dados ? (
            <Carregando texto="Buscando as linhas" />
          ) : (
            <div className="mt-10 grid gap-12 md:grid-cols-2 md:gap-16">
              {redes.map((rede) => (
                <div key={rede.modulo}>
                  <h3 className="text-2xl font-extrabold">{rede.titulo}</h3>
                  <p className="mt-2 max-w-md">{rede.texto}</p>
                  <ul className="mt-5 space-y-2">
                    {linhas.dados!.filter((l) => l.modulo === rede.modulo).map((l) => (
                      <li key={l.id}>
                        <Link to={`/linhas/${l.id}`} className="linha-lista">
                          <CodigoLinha linha={l} />
                          <span className="font-bold">{l.nome}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <Link to={`/mapa?modulo=${rede.modulo}`} className="botao botao-claro mt-5">
                    Ver {rede.modulo === 'externo' ? 'os ônibus' : 'o carrinho'} no mapa
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section aria-labelledby="titulo-teste" className="py-16 lg:py-24">
        <div className="margem grid items-end gap-8 md:grid-cols-[1.4fr_1fr]">
          <h2 id="titulo-teste" className="titulo-secao">Usou? Conte como foi</h2>
          <div>
            <p className="max-w-md text-lg">
              O UniRota está em teste. Uma nota e duas frases suas entram no relatório que decide os próximos passos.
            </p>
            <Link to="/avaliar" className="botao botao-leve mt-5">Avaliar o UniRota</Link>
          </div>
        </div>
      </section>
    </>
  )
}
