import { criarServicoDemonstracao } from './demonstracao'
import { criarServicoHttp } from './http'
import type { Servico } from './servico'

const urlApi = (import.meta.env.VITE_API_URL ?? '').trim().replace(/\/$/, '')

// Sem VITE_API_URL o site roda sozinho, com dados demonstrativos.
export const servico: Servico = urlApi ? criarServicoHttp(urlApi) : criarServicoDemonstracao(window.localStorage)

export { ErroApi } from './servico'
