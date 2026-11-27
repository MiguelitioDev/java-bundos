import { useId } from 'react'

export function CampoTexto({ rotulo, erro, ajuda, ...props }) {
  const id = useId()
  const descricao = [ajuda && `${id}-ajuda`, erro && `${id}-erro`].filter(Boolean).join(' ') || undefined
  return (
    <div>
      <label htmlFor={id} className="font-bold">
        {rotulo}
      </label>
      <input id={id} className="campo" aria-invalid={Boolean(erro)} aria-describedby={descricao} {...props} />
      {ajuda && (
        <p id={`${id}-ajuda`} className="mt-1.5 text-sm text-suave">
          {ajuda}
        </p>
      )}
      {erro && (
        <p id={`${id}-erro`} className="mt-1.5 text-sm font-semibold text-erro">
          {erro}
        </p>
      )}
    </div>
  )
}
