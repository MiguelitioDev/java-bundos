import { useTitulo } from '../hooks/useTitulo'

export function PaginaTexto({ titulo, blocos }) {
  useTitulo(titulo)
  return (
    <div className="margem py-10 lg:py-16">
      <h1 className="titulo-pagina">{titulo}</h1>
      <div className="mt-10 grid gap-x-16 gap-y-10 md:grid-cols-2">
        {blocos.map((b) => (
          <section key={b.titulo} className="texto">
            <h2 className="text-2xl font-extrabold">{b.titulo}</h2>
            {b.corpo}
          </section>
        ))}
      </div>
    </div>
  )
}
