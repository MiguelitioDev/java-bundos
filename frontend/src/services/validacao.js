export const SENHA_MINIMA = 6

export function erroEmail(email) {
  if (!email.trim()) return 'Digite seu e-mail.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return 'Digite um e-mail no formato nome@exemplo.com.'
  return null
}

export function erroSenha(senha) {
  if (!senha) return 'Digite sua senha.'
  if (senha.length < SENHA_MINIMA) return `A senha precisa ter pelo menos ${SENHA_MINIMA} caracteres.`
  return null
}

export function erroConfirmacao(senha, confirmacao) {
  if (!confirmacao) return 'Repita a senha.'
  if (senha !== confirmacao) return 'As duas senhas estão diferentes.'
  return null
}
