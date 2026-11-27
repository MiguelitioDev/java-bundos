import { useEffect, useState, type ReactNode } from 'react'

export function Carregando({ texto = 'Carregando' }: { texto?: string }) {
  const [demorando, setDemorando] = useState(false)
  useEffect(() => {
    const id = window.setTimeout(() => setDemorando(true), 5000)
    return () => window.clearTimeout(id)
  }, [])
  return (
    <div role="status" className="py-8">
      <p className="font-semibold">{texto}…</p>
      <div className="mt-3 space-y-2" aria-hidden="true">
        <div className="esqueleto h-12" />
        <div className="esqueleto h-12 w-4/5" />
      </div>
      {demorando && (
        <p className="mt-3 text-suave">O servidor está acordando. A primeira consulta pode levar até um minuto.</p>
      )}
    </div>
  )
}

export function Falha({ mensagem, aoTentar }: { mensagem: string; aoTentar?: () => void }) {
  return (
    <div role="alert" className="rounded-lg bg-alerta-fundo p-4 text-alerta">
      <p className="font-semibold">{mensagem}</p>
      {aoTentar && (
        <button type="button" className="botao botao-principal mt-3" onClick={aoTentar}>Tentar de novo</button>
      )}
    </div>
  )
}

export function Vazio({ titulo, children }: { titulo: string; children?: ReactNode }) {
  return (
    <div className="rounded-lg bg-nevoa p-6">
      <p className="text-xl font-bold">{titulo}</p>
      <div className="mt-2 flex flex-col items-start gap-4">{children}</div>
    </div>
  )
}
