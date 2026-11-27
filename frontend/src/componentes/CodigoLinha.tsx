import type { Linha } from '../entidades/tipos'

/** Letreiro da linha, como o destino na frente do ônibus. */
export function CodigoLinha({ linha, grande = false }: { linha: Pick<Linha, 'codigo' | 'cor'>; grande?: boolean }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-md font-extrabold tabular-nums text-white ring-1 ring-white/50 ${
        grande ? 'h-14 min-w-20 px-3 text-3xl' : 'h-8 min-w-13 px-2 text-base'
      }`}
      style={{ backgroundColor: linha.cor }}
    >
      {linha.codigo}
    </span>
  )
}
