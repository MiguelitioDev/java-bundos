import { useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { useConta } from '../contextos/Conta'
import { useTitulo } from '../hooks/useTitulo'
import { servico } from '../services'
import { erroConfirmacao, erroEmail, erroSenha, SENHA_MINIMA } from '../services/validacao'
import { CampoTexto } from './CampoTexto'

export function FormularioConta({ modo }) {
  const novo = modo === 'cadastro'
  useTitulo(novo ? 'Criar conta' : 'Entrar')
  const { entrar, cadastrar, sessao } = useConta()
  const navegar = useNavigate()
  const estado = useLocation().state
  // Só aceita voltar para um caminho do próprio site.
  const destino = estado?.de && /^\/(?!\/)/.test(estado.de) && !/^\/(entrar|cadastro)/.test(estado.de) ? estado.de : '/mapa'

  const [campos, setCampos] = useState({ email: '', senha: '', confirmacao: '' })
  const [tentou, setTentou] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [falha, setFalha] = useState(null)
  const [confirmar, setConfirmar] = useState(false)
  const formulario = useRef(null)

  const erros = {
    email: erroEmail(campos.email),
    senha: erroSenha(campos.senha),
    confirmacao: novo ? erroConfirmacao(campos.senha, campos.confirmacao) : null,
  }
  const campo = (nome) => ({
    name: nome,
    value: campos[nome],
    erro: tentou ? erros[nome] : null,
    onChange: (e) => setCampos((c) => ({ ...c, [nome]: e.target.value })),
  })

  async function enviar(evento) {
    evento.preventDefault()
    setTentou(true)
    setFalha(null)
    const primeiro = Object.keys(erros).find((n) => erros[n])
    if (primeiro) {
      formulario.current?.querySelector(`[name="${primeiro}"]`)?.focus()
      return
    }
    setEnviando(true)
    try {
      if (!novo) await entrar(campos.email.trim(), campos.senha)
      else if (!(await cadastrar(campos.email.trim(), campos.senha))) {
        setConfirmar(true)
        return
      }
      navegar(destino, { replace: true })
    } catch (erro) {
      setFalha(erro.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="margem grid gap-10 py-10 lg:grid-cols-[1fr_26rem] lg:py-16">
      <div>
        <h1 className="titulo-pagina">{novo ? 'Criar conta' : 'Entrar'}</h1>
        <p className="mt-4 max-w-md text-lg">{estado?.motivo ?? 'Com a conta você chama o carrinho e guarda suas linhas favoritas.'}</p>
        {servico.modoDemonstracao && (
          <p className="mt-6 max-w-md rounded-lg bg-alerta-fundo p-4 text-alerta">
            Modo demonstração: a conta fica só neste navegador e a senha não é guardada nem conferida. Não use uma senha real.
          </p>
        )}
      </div>

      {confirmar ? (
        <div role="status" className="self-start rounded-lg bg-nevoa p-6">
          <p className="text-xl font-bold">Confirme seu e-mail.</p>
          <p className="mt-2">Enviamos um link para {campos.email}. Depois de confirmar, volte e entre.</p>
          <Link to="/entrar" state={{ de: destino }} className="botao botao-principal mt-4">
            Ir para entrar
          </Link>
        </div>
      ) : (
        <form ref={formulario} onSubmit={enviar} noValidate className="space-y-5">
          {sessao && <p className="rounded-lg bg-nevoa p-3">Você já entrou como {sessao.user.email}.</p>}
          <CampoTexto rotulo="E-mail" type="email" autoComplete="email" inputMode="email" spellCheck={false} {...campo('email')} />
          <CampoTexto
            rotulo="Senha"
            type="password"
            autoComplete={novo ? 'new-password' : 'current-password'}
            ajuda={novo ? `Pelo menos ${SENHA_MINIMA} caracteres.` : undefined}
            {...campo('senha')}
          />
          {novo && <CampoTexto rotulo="Repita a senha" type="password" autoComplete="new-password" {...campo('confirmacao')} />}
          {falha && (
            <p role="alert" className="rounded-lg bg-alerta-fundo p-3 font-semibold text-alerta">
              {falha}
            </p>
          )}
          <button type="submit" className="botao botao-principal botao-grande w-full" disabled={enviando}>
            {enviando ? (novo ? 'Criando a conta…' : 'Entrando…') : novo ? 'Criar conta' : 'Entrar'}
          </button>
          <p>
            {novo ? 'Já tem conta? ' : 'Ainda não tem conta? '}
            <Link to={novo ? '/entrar' : '/cadastro'} state={estado} className="font-bold underline underline-offset-4">
              {novo ? 'Entrar' : 'Criar conta'}
            </Link>
          </p>
          <p className="text-sm text-suave">
            Veja como tratamos seus dados na página de{' '}
            <Link to="/privacidade" className="underline">
              privacidade
            </Link>
            .
          </p>
        </form>
      )}
    </div>
  )
}
