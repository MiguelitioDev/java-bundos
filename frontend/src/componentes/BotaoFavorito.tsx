import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { useConta } from '../contextos/Conta'
import type { AlvoFavorito } from '../entidades/tipos'
import { IconeEstrela } from './Icones'

export function BotaoFavorito({ alvo, nome, comTexto = false }: { alvo: AlvoFavorito; nome: string; comTexto?: boolean }) {
  const { sessao, favoritos, favoritoDe, alternarFavorito } = useConta()
  const [salvando, setSalvando] = useState(false)
  const navegar = useNavigate()
  const { pathname, search } = useLocation()
  const marcado = Boolean(favoritoDe(alvo))

  async function aoClicar() {
    if (!sessao) {
      navegar('/entrar', { state: { de: pathname + search, motivo: `Entre para guardar ${nome} nos favoritos.` } })
      return
    }
    setSalvando(true)
    await alternarFavorito(alvo)
    setSalvando(false)
  }

  return (
    <button
      type="button"
      className={comTexto ? `botao ${marcado ? 'botao-marcado' : 'botao-leve'}` : `botao-icone ${marcado ? 'text-teal-forte' : 'text-suave'}`}
      aria-pressed={marcado}
      aria-label={comTexto ? undefined : `Favorito: ${nome}`}
      disabled={salvando || (sessao !== null && favoritos === undefined)}
      onClick={aoClicar}
    >
      <IconeEstrela cheia={marcado} />
      {comTexto && (marcado ? 'Nos favoritos' : 'Favoritar linha')}
    </button>
  )
}
