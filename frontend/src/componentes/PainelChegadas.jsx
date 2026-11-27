import { Link } from 'react-router'
import { useCarregar } from '../hooks/useCarregar'
import { useVeiculos } from '../hooks/useVeiculos'
import { servico } from '../services'
import { CodigoLinha } from './CodigoLinha'
import { descricaoChegada, EstadoVeiculo, Previsao } from './EstadoVeiculo'
import { textos } from '../services/textos'
import { Carregando, Falha } from './Estados'

/** Quadro ao vivo da primeira tela: cada veículo, para onde vai e em quanto tempo. */
export function PainelChegadas() {
  const linhas = useCarregar(() => servico.listarLinhas(), 'linhas')
  const { veiculos, erro } = useVeiculos()
  const falha = linhas.erro ?? (veiculos ? undefined : erro)

  return (
    <section aria-labelledby="titulo-painel" className="rounded-2xl bg-tinta p-4 text-white sm:p-6">
      <h2 id="titulo-painel" className="text-2xl font-extrabold tracking-tight">
        Chegando agora
      </h2>
      {falha ? (
        <div className="mt-4">
          <Falha mensagem={falha} aoTentar={linhas.erro ? linhas.recarregar : undefined} />
        </div>
      ) : !linhas.dados || !veiculos ? (
        <Carregando texto="Buscando os veículos" />
      ) : veiculos.length === 0 ? (
        <p className="mt-4 text-lg">Nenhum veículo está enviando a posição agora.</p>
      ) : (
        <ul className="mt-3">
          {veiculos.map((v) => {
            const linha = linhas.dados.find((l) => l.id === v.linhaId)
            if (!linha) return null
            return (
              <li key={v.id}>
                <Link to={`/mapa?modulo=${linha.modulo}&linha=${linha.id}`} className="linha-painel">
                  <CodigoLinha linha={linha} />
                  <span className="min-w-0">
                    <span className="block font-bold">{linha.nome}</span>
                    <span className="block text-sm text-white/85">{descricaoChegada(v)}</span>
                    <span className="block text-sm text-white/85">
                      <EstadoVeiculo estado={v.estado} />
                    </span>
                  </span>
                  <span className="text-right text-agua">
                    <Previsao veiculo={v} />
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
      {erro && veiculos && (
        <p role="status" className="mt-2 text-sm">
          Sem atualização agora. Mostrando as últimas posições.
        </p>
      )}
      <p className="mt-3 text-sm text-white/85">{textos.origemPosicoes}</p>
    </section>
  )
}
