import { useEffect, useRef } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router'
import { useConta } from '../contextos/Conta'
import { textos } from '../services/textos'
import { IconeCarrinho, IconeEstrela, IconeLinhas, IconeMapa, IconePessoa } from './Icones'

const destinos = [
  { para: '/mapa', nome: 'Mapa', Icone: IconeMapa },
  { para: '/linhas', nome: 'Linhas', Icone: IconeLinhas },
  { para: '/chamar', nome: 'Chamar', Icone: IconeCarrinho },
  { para: '/favoritos', nome: 'Favoritos', Icone: IconeEstrela },
]

export function Marca() {
  return (
    <Link to="/" className="flex items-center gap-2.5 text-xl font-extrabold tracking-tight" aria-label="UniRota, página inicial">
      <img src="/favicon.svg" alt="" width="32" height="32" />
      UniRota
    </Link>
  )
}

export function Layout() {
  const { sessao, sair } = useConta()
  const { pathname } = useLocation()
  const principal = useRef(null)
  const primeira = useRef(true)
  const noMapa = pathname === '/mapa'

  // Ao trocar de tela, volta ao topo e leva o foco para o conteúdo.
  useEffect(() => {
    if (primeira.current) {
      primeira.current = false
      return
    }
    window.scrollTo(0, 0)
    principal.current?.focus({ preventScroll: true })
  }, [pathname])

  return (
    <div className="flex min-h-dvh flex-col">
      <a href="#conteudo" className="pular">
        Ir para o conteúdo
      </a>
      <header className="bg-papel">
        <div className="margem flex h-16 items-center justify-between gap-4">
          <Marca />
          <nav aria-label="Principal" className="hidden items-center gap-1 md:flex">
            {destinos.map((d) => (
              <NavLink key={d.para} to={d.para} className="item-menu">
                {d.nome}
              </NavLink>
            ))}
            {sessao?.user.papel === 'motorista' && (
              <NavLink to="/motorista" className="item-menu">
                Motorista
              </NavLink>
            )}
            <NavLink to="/avaliar" className="item-menu">
              Avaliar
            </NavLink>
          </nav>
          {sessao ? (
            <div className="flex items-center gap-3">
              <span className="hidden max-w-52 truncate text-sm text-suave lg:block" title={sessao.user.email}>
                {sessao.user.email}
              </span>
              <button type="button" className="botao botao-leve" onClick={sair}>
                Sair
              </button>
            </div>
          ) : (
            <Link to="/entrar" state={{ de: pathname }} className="botao botao-leve">
              <IconePessoa /> Entrar
            </Link>
          )}
        </div>
      </header>

      {sessao?.user.papel === 'motorista' && pathname !== '/motorista' && (
        <Link to="/motorista" className="block bg-tinta px-4 py-3 text-center font-bold text-white md:hidden">
          Abrir o painel do motorista
        </Link>
      )}

      <main id="conteudo" ref={principal} tabIndex={-1} className="flex flex-1 flex-col outline-none">
        <Outlet />
      </main>

      {!noMapa && (
        <footer className="bg-tinta text-white">
          <div className="margem grid gap-6 py-12 md:grid-cols-[1fr_auto]">
            <div className="max-w-xl">
              <p className="text-4xl font-extrabold tracking-tight">UniRota</p>
              <p className="mt-3 text-white/85">{textos.rodape}</p>
            </div>
            <nav aria-label="Sobre o projeto" className="flex gap-6 self-end">
              <Link to="/avaliar" className="underline underline-offset-4">
                Avaliar
              </Link>
              <Link to="/sobre" className="underline underline-offset-4">
                Sobre
              </Link>
              <Link to="/privacidade" className="underline underline-offset-4">
                Privacidade
              </Link>
            </nav>
          </div>
          <div className="h-16 md:hidden" />
        </footer>
      )}

      <nav aria-label="Principal no celular" className="barra-inferior md:hidden">
        {destinos.map(({ para, nome, Icone }) => (
          <NavLink key={para} to={para} className="item-barra">
            <Icone />
            {nome}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
