import { useState } from 'react'
import { PaginaTexto } from '../componentes/PaginaTexto'
import { useConta } from '../contextos/Conta'
import { servico } from '../services'

function ApagarDemonstracao() {
  const { sair } = useConta()
  const [etapa, setEtapa] = useState('inicio')

  function apagar() {
    try {
      Object.keys(window.localStorage)
        .filter((c) => c.startsWith('unirota.'))
        .forEach((c) => window.localStorage.removeItem(c))
    } catch {
      // Sem armazenamento não há o que apagar.
    }
    sair()
    setEtapa('feito')
  }

  if (etapa === 'feito')
    return (
      <p role="status">
        <strong>Dados apagados deste navegador.</strong>
      </p>
    )
  if (etapa === 'inicio') {
    return (
      <button type="button" className="botao botao-leve" onClick={() => setEtapa('confirmar')}>
        Apagar meus dados deste navegador
      </button>
    )
  }
  return (
    <div className="flex flex-wrap items-center gap-3">
      <p className="w-full">Contas, favoritos, chamados e avaliações de demonstração serão apagados. Isso não pode ser desfeito.</p>
      <button type="button" className="botao botao-principal" onClick={apagar}>
        Apagar
      </button>
      <button type="button" className="botao botao-leve" onClick={() => setEtapa('inicio')}>
        Cancelar
      </button>
    </div>
  )
}

export default function Privacidade() {
  const demo = servico.modoDemonstracao
  return (
    <PaginaTexto
      titulo="Privacidade"
      blocos={[
        {
          titulo: 'O que guardamos',
          corpo: demo ? (
            <p>
              Nesta demonstração, e-mail, favoritos, chamados, avaliações e a posição enviada por um motorista de teste ficam só neste
              navegador. A senha não é gravada nem enviada.
            </p>
          ) : (
            <p>
              Seu e-mail, as linhas e paradas favoritas, os chamados do carrinho (embarque, destino e horário) e as avaliações que você
              enviar. A conta e a senha são tratadas pelo serviço de autenticação do Supabase. O acesso fica salvo neste navegador até você
              sair.
            </p>
          ),
        },
        {
          titulo: 'Para que usamos',
          corpo: (
            <p>
              Para mostrar os favoritos, atender os chamados e escrever o relatório do teste, sempre com resultados reunidos, sem
              identificar pessoas.
            </p>
          ),
        },
        {
          titulo: 'Localização de passageiros',
          corpo: (
            <p>
              É opcional e só é pedida quando você toca no botão. Ela fica na memória da página, não é gravada nem enviada à equipe. No
              mapa, a tela se centraliza nela, e por isso o OpenStreetMap recebe o pedido das imagens daquela área.
            </p>
          ),
        },
        {
          titulo: 'Localização de motoristas',
          corpo: (
            <p>
              Só motoristas liberados pela equipe enviam posição, e apenas depois de ligar o envio no painel. Ela aparece no mapa para todos
              e guarda-se somente a mais recente. Ao parar, o veículo sai do mapa.
            </p>
          ),
        },
        {
          titulo: 'Mapa e hospedagem',
          corpo: (
            <p>
              As imagens do mapa vêm dos servidores do OpenStreetMap, que recebem seu endereço IP e a área vista. A hospedagem do site
              também registra acessos técnicos. Não há anúncios nem ferramentas de análise de visitantes.
            </p>
          ),
        },
        {
          titulo: 'Seus direitos',
          corpo: demo ? (
            <>
              <p>Você pode apagar tudo o que esta demonstração guardou.</p>
              <ApagarDemonstracao />
            </>
          ) : (
            <p>
              Pela LGPD, você pode pedir acesso, correção ou exclusão dos seus dados. Fale com a equipe do projeto pelo professor da
              disciplina ou pelo repositório no GitHub.
            </p>
          ),
        },
      ]}
    />
  )
}
