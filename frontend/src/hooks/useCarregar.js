import { useCallback, useEffect, useState } from 'react'

export function useCarregar(carregar, chave) {
  const [estado, setEstado] = useState({ chave })
  const [tentativa, setTentativa] = useState(0)

  useEffect(() => {
    let ativo = true
    setEstado((anterior) => (anterior.chave === chave ? { ...anterior, erro: undefined } : { chave }))
    carregar().then(
      (dados) => ativo && setEstado({ chave, dados }),
      (erro) => ativo && setEstado({ chave, erro: erro.message }),
    )
    return () => {
      ativo = false
    }
    // A função é recriada a cada desenho; quem decide recarregar é a chave.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chave, tentativa])

  const recarregar = useCallback(() => setTentativa((n) => n + 1), [])
  const atual = estado.chave === chave ? estado : { chave }
  return { dados: atual.dados, erro: atual.erro, carregando: atual.dados === undefined && !atual.erro, recarregar }
}
