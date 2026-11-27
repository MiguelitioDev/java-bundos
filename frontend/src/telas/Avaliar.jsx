import { useState } from 'react'
import { Link } from 'react-router'
import { useConta } from '../contextos/Conta'
import { useTitulo } from '../hooks/useTitulo'
import { servico } from '../services'

const notas = ['Muito ruim', 'Ruim', 'Regular', 'Boa', 'Muito boa']
const LIMITE = 500

export default function Avaliar() {
  useTitulo('Avaliar')
  const { sessao } = useConta()
  const [nota, setNota] = useState(0)
  const [comentario, setComentario] = useState('')
  const [tentou, setTentou] = useState(false)
  const [estado, setEstado] = useState('parado')
  const [falha, setFalha] = useState(null)

  async function enviar(evento) {
    evento.preventDefault()
    setTentou(true)
    setFalha(null)
    if (!nota) return
    setEstado('enviando')
    try {
      await servico.enviarAvaliacao(sessao?.token ?? null, { nota, comentario: comentario.trim() })
      setEstado('enviado')
    } catch (e) {
      setFalha(e.message)
      setEstado('parado')
    }
  }

  return (
    <div className="margem grid gap-10 py-10 lg:grid-cols-[1fr_30rem] lg:py-16">
      <div>
        <h1 className="titulo-pagina">Como foi usar o UniRota?</h1>
        <p className="mt-4 max-w-md text-lg">Sua resposta entra no relatório do teste e ajuda a decidir o que mudar.</p>
        {servico.modoDemonstracao && (
          <p className="mt-6 max-w-md rounded-lg bg-alerta-fundo p-4 text-alerta">Modo demonstração: a resposta fica só neste navegador.</p>
        )}
      </div>
      {estado === 'enviado' ? (
        <div role="status" className="surgir self-start rounded-2xl bg-tinta p-6 text-white">
          <p className="text-2xl font-extrabold">Avaliação enviada. Obrigado!</p>
          <Link to="/mapa" className="botao botao-claro mt-5">
            Voltar ao mapa
          </Link>
        </div>
      ) : (
        <form onSubmit={enviar} noValidate className="space-y-6">
          <fieldset aria-describedby={tentou && !nota ? 'erro-nota' : undefined}>
            <legend className="font-bold">Sua nota</legend>
            <div className="mt-2 grid grid-cols-5 gap-2">
              {notas.map((texto, i) => (
                <label key={texto} className="nota">
                  <input type="radio" name="nota" className="sr-only" checked={nota === i + 1} onChange={() => setNota(i + 1)} />
                  <span className="text-3xl font-extrabold">{i + 1}</span>
                  <span className="text-xs leading-tight">{texto}</span>
                </label>
              ))}
            </div>
            {tentou && !nota && (
              <p id="erro-nota" role="alert" className="mt-2 font-semibold text-erro">
                Escolha uma nota de 1 a 5.
              </p>
            )}
          </fieldset>
          <label className="block">
            <span className="font-bold">O que funcionou e o que atrapalhou? (opcional)</span>
            <textarea className="campo min-h-32" maxLength={LIMITE} value={comentario} onChange={(e) => setComentario(e.target.value)} />
            <span className="mt-1 block text-sm text-suave">
              Não escreva dados pessoais. {comentario.length} de {LIMITE} caracteres.
            </span>
          </label>
          {falha && (
            <p role="alert" className="rounded-lg bg-alerta-fundo p-3 font-semibold text-alerta">
              {falha}
            </p>
          )}
          <button type="submit" className="botao botao-principal botao-grande w-full" disabled={estado === 'enviando'}>
            {estado === 'enviando' ? 'Enviando…' : 'Enviar avaliação'}
          </button>
        </form>
      )}
    </div>
  )
}
