# Ricardo: Back-end

Pasta: `backend/`. Branches: `back/...`.

Siga a organização do `todo-back`: `config/`, `controlador/`, `rotas/` e `index.js`. As respostas seguem o [contrato da API](contrato-api.md).

## Tarefas

- [ ] Criar o projeto (`express`, `@supabase/supabase-js`, `dotenv`, `cors`; `nodemon` como dependência de desenvolvimento)
- [ ] Scripts `dev` e `start` no `package.json`
- [ ] `config/database.js` lendo `URL` e `API` do `.env` (modelo em `backend/.env.example`)
- [ ] `GET /health`
- [ ] `GET /linhas`, `GET /linhas/:id`, `GET /paradas`
- [ ] `GET /veiculos`: calcular posição simulada, próxima parada e ETA a partir do horário atual e das paradas da linha
- [ ] `POST /auth/cadastro` e `POST /auth/login`
- [ ] Middleware que lê o token `Bearer` e valida o usuário
- [ ] `GET`, `POST` e `DELETE /favoritos`
- [ ] Validar entradas e responder erros como `{ "error": "..." }`
- [ ] CORS liberado só para o endereço do front (e `localhost` no desenvolvimento)
- [ ] Hospedar (sugestão: Render) com as variáveis de ambiente configuradas
- [ ] Enviar a URL pública ao Pedro

## Atenção ao reaproveitar o `todo-back`

- Lá existe um único cliente Supabase para todo o servidor. Nos favoritos, crie um cliente **por requisição** com o token do usuário; sem isso o RLS não sabe quem está pedindo. Para o login, use `auth: { persistSession: false }`.
- Não copie `NODE_TLS_REJECT_UNAUTHORIZED` para o `.env`: com o valor `0`, ela desliga a verificação de certificados.
- Não use a chave `service_role`.
- A porta precisa vir de variável de ambiente. No Render ela se chama `PORT`: use `process.env.PORT || process.env.PORTA || 3000`.

## Pronto quando

Todas as rotas do contrato respondem na URL pública usando o banco do Supabase.
