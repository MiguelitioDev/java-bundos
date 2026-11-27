export class ErroApi extends Error {
  constructor(mensagem, status = 0) {
    super(mensagem)
    this.name = 'ErroApi'
    this.status = status
  }
}
