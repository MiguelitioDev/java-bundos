import { servico } from '.'

const demo = servico.modoDemonstracao

/** Frases que mudam quando o site passa a usar a API de verdade. */
export const textos = {
  avisoInicio: demo
    ? 'Demonstração estudantil. Paradas, linhas e horários são fictícios: não espere transporte nesses pontos.'
    : 'Projeto estudantil em fase de teste, sem vínculo oficial com a Unifor. As informações podem falhar.',
  origemPosicoes: demo ? 'Posições simuladas para demonstração.' : 'Posições enviadas pelo celular de quem dirige.',
  rodape: demo
    ? 'Projeto estudantil, sem vínculo oficial com a Unifor. Paradas, linhas, veículos, horários e posições são fictícios nesta demonstração.'
    : 'Projeto estudantil em fase de teste, sem vínculo oficial com a Unifor.',
  horarios: demo ? 'Horários fictícios, de uma tabela de demonstração.' : 'Horários previstos, sujeitos a atraso.',
}
