import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { AlvoFavorito, Favorito, Sessao } from '../entidades/tipos'
import { ErroApi, servico } from '../services'

const CHAVE = servico.modoDemonstracao ? 'unirota.demo.sessao' : 'unirota.sessao'

interface Conta {
  sessao: Sessao | null
  /** undefined enquanto carrega */
  favoritos: Favorito[] | undefined
  erro: string | null
  entrar(email: string, senha: string): Promise<void>
  cadastrar(email: string, senha: string): Promise<boolean>
  sair(): void
  favoritoDe(alvo: AlvoFavorito): Favorito | undefined
  alternarFavorito(alvo: AlvoFavorito): Promise<void>
  recarregarFavoritos(): void
}

const Contexto = createContext<Conta | null>(null)

function sessaoSalva(): Sessao | null {
  try {
    const texto = window.localStorage.getItem(CHAVE)
    return texto ? (JSON.parse(texto) as Sessao) : null
  } catch {
    return null
  }
}

function salvar(sessao: Sessao | null) {
  try {
    if (sessao) window.localStorage.setItem(CHAVE, JSON.stringify(sessao))
    else window.localStorage.removeItem(CHAVE)
  } catch {
    // Sem armazenamento, a sessão vale só até fechar a página.
  }
}

export function ProvedorConta({ children }: { children: ReactNode }) {
  const [sessao, setSessao] = useState(sessaoSalva)
  const [favoritos, setFavoritos] = useState<Favorito[]>()
  const [erro, setErro] = useState<string | null>(null)
  const [tentativa, setTentativa] = useState(0)

  const guardar = useCallback((nova: Sessao | null) => {
    salvar(nova)
    setFavoritos(undefined)
    setSessao(nova)
  }, [])

  const tratar = useCallback(
    (falha: unknown) => {
      if (falha instanceof ErroApi && falha.status === 401) {
        guardar(null)
        setErro('Seu acesso expirou. Entre de novo para ver os favoritos.')
      } else setErro((falha as Error).message)
    },
    [guardar],
  )

  useEffect(() => {
    if (!sessao) return
    let ativo = true
    setErro(null)
    servico.listarFavoritos(sessao.token).then(
      (lista) => ativo && setFavoritos(lista),
      (falha) => ativo && tratar(falha),
    )
    return () => {
      ativo = false
    }
  }, [sessao, tentativa, tratar])

  const valor = useMemo<Conta>(() => {
    const favoritoDe = (alvo: AlvoFavorito) =>
      favoritos?.find((f) => ('linhaId' in alvo ? f.linhaId === alvo.linhaId : f.paradaId === alvo.paradaId))
    return {
      sessao,
      favoritos: sessao ? favoritos : undefined,
      erro,
      async entrar(email, senha) {
        const nova = await servico.entrar(email, senha)
        setErro(null)
        guardar(nova)
      },
      async cadastrar(email, senha) {
        const nova = await servico.cadastrar(email, senha)
        if (nova) {
          setErro(null)
          guardar(nova)
        }
        return nova !== null
      },
      sair() {
        setErro(null)
        guardar(null)
      },
      favoritoDe,
      async alternarFavorito(alvo) {
        if (!sessao) return
        setErro(null)
        try {
          const existente = favoritoDe(alvo)
          if (existente) {
            await servico.removerFavorito(sessao.token, existente.id)
            setFavoritos((lista) => lista?.filter((f) => f.id !== existente.id))
          } else {
            const novo = await servico.adicionarFavorito(sessao.token, alvo)
            setFavoritos((lista) => [...(lista ?? []).filter((f) => f.id !== novo.id), novo])
          }
        } catch (falha) {
          tratar(falha)
        }
      },
      recarregarFavoritos: () => setTentativa((n) => n + 1),
    }
  }, [sessao, favoritos, erro, guardar, tratar])

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>
}

export function useConta() {
  const conta = useContext(Contexto)
  if (!conta) throw new Error('useConta precisa estar dentro de ProvedorConta')
  return conta
}
