import type { Modulo } from '../entidades/tipos'
import { servico } from '../services'
import { useRepetir } from './useRepetir'

const INTERVALO_MS = servico.modoDemonstracao ? 2000 : 5000

/** Veículos atualizados. Em caso de falha mantém as últimas posições e informa o erro. */
export function useVeiculos(modulo?: Modulo) {
  const { dados, erro } = useRepetir(() => servico.listarVeiculos(modulo), INTERVALO_MS, modulo ?? 'todos')
  return { veiculos: dados, erro }
}
