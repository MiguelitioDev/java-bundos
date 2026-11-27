import { Link } from 'react-router'
import { useTitulo } from '../hooks/useTitulo'

export default function NaoEncontrada() {
  useTitulo('Página não encontrada')
  return (
    <div className="margem py-16">
      <h1 className="titulo-pagina">Essa rota não existe</h1>
      <p className="mt-4 text-lg">O endereço pode ter sido digitado errado ou a página mudou de lugar.</p>
      <Link to="/mapa" className="botao botao-principal mt-6">
        Abrir o mapa
      </Link>
    </div>
  )
}
