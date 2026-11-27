import { useEffect } from 'react'

export function useTitulo(titulo) {
  useEffect(() => {
    document.title = titulo ? `${titulo} · UniRota` : 'UniRota · Mobilidade universitária'
  }, [titulo])
}
