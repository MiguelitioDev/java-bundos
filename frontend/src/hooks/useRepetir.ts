import { useCallback, useEffect, useRef, useState } from 'react'

/** Busca de novo a cada `intervaloMs` enquanto a aba está visível. `atualizar` busca na hora. */
export function useRepetir<T>(buscar: () => Promise<T>, intervaloMs: number, chave: string) {
  const [estado, setEstado] = useState<{ chave: string; dados?: T; erro?: string }>({ chave })
  const [versao, setVersao] = useState(0)
  const funcao = useRef(buscar)
  funcao.current = buscar

  useEffect(() => {
    let ativo = true
    let espera = 0
    async function rodar() {
      window.clearTimeout(espera)
      if (!document.hidden) {
        try {
          const dados = await funcao.current()
          if (ativo) setEstado({ chave, dados })
        } catch (erro) {
          if (ativo) setEstado((a) => ({ chave, dados: a.chave === chave ? a.dados : undefined, erro: (erro as Error).message }))
        }
      }
      if (ativo) {
        window.clearTimeout(espera)
        espera = window.setTimeout(rodar, intervaloMs)
      }
    }
    rodar()
    document.addEventListener('visibilitychange', rodar)
    return () => {
      ativo = false
      window.clearTimeout(espera)
      document.removeEventListener('visibilitychange', rodar)
    }
  }, [chave, intervaloMs, versao])

  const atualizar = useCallback(() => setVersao((v) => v + 1), [])
  const atual = estado.chave === chave ? estado : { chave }
  return { dados: atual.dados, erro: atual.erro, atualizar }
}
