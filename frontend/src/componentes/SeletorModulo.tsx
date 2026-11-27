import type { Modulo } from '../entidades/tipos'

const opcoes: { valor: Modulo; nome: string; detalhe: string }[] = [
  { valor: 'externo', nome: 'Externo', detalhe: 'Ônibus' },
  { valor: 'interno', nome: 'Interno', detalhe: 'Carrinho' },
]

export function SeletorModulo({ valor, aoMudar }: { valor: Modulo; aoMudar: (m: Modulo) => void }) {
  return (
    <fieldset className="seletor">
      <legend className="sr-only">Tipo de transporte</legend>
      <span className="seletor-fundo" style={{ transform: valor === 'interno' ? 'translateX(100%)' : 'none' }} aria-hidden="true" />
      {opcoes.map((o) => (
        <label key={o.valor} className="seletor-opcao">
          <input type="radio" name="modulo" value={o.valor} checked={valor === o.valor} onChange={() => aoMudar(o.valor)} className="sr-only" />
          <span className="font-bold">{o.nome}</span>
          <span className="text-sm">{o.detalhe}</span>
        </label>
      ))}
    </fieldset>
  )
}
