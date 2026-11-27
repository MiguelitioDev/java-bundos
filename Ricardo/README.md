# Ricardo: Back-end (API)

Seu código fica em [`backend/`](../backend/). Branches: `back/...`.

As rotas e os formatos estão no [contrato da API](../docs/contrato-api.md). O front já usa exatamente esses formatos: se você seguir o contrato, a integração é só configurar a URL.

**Pode começar já** pela estrutura e pelo login. As rotas de dados dependem das tabelas da Rafaele.

## Padrão da disciplina (o mesmo do `todo-back`)

```
backend/
  index.js
  config/database.js
  middleware/authMiddleware.js
  controlador/   authControl.js, linhaControl.js, veiculoControl.js,
                 favoritoControl.js, corridaControl.js, avaliacaoControl.js
  rotas/         authRoutes.js, linhaRoutes.js, veiculoRoutes.js,
                 favoritoRoutes.js, corridaRoutes.js, avaliacaoRoutes.js
```

- Node.js em CommonJS, Express, `@supabase/supabase-js`, `dotenv`, `cors`
- `.env` com `PORTA`, `URL`, `API` e `FRONT_URL` (modelo em `backend/.env.example`)
- **Middleware**, como na "Atividade Prática Backend": lê `Authorization: Bearer <token>`; sem token responde 401 em JSON; valida com `supabase.auth.getUser(token)`; inválido responde 401; válido grava `req.user` e `req.token` e chama `next()`
- Status: 200, 201 ao criar, 204 sem corpo, 400, 401, 403, 404, 409; erros como `{ "error": "mensagem" }` em português

## Tarefas, na ordem

1. [ ] Criar o projeto, scripts `dev` (nodemon) e `start`, `express.json()`, CORS só para `FRONT_URL` e `http://localhost:5173`, métodos GET, POST, PUT, PATCH e DELETE
2. [ ] `GET /health`
3. [ ] `POST /auth/cadastro` e `POST /auth/login`; incluir `user.papel` lido de `perfis`
4. [ ] `authMiddleware` e um segundo middleware que exige `papel = motorista` (403)
5. [ ] `GET /linhas`, `GET /linhas/:id`, `GET /paradas`
6. [ ] `GET`, `POST`, `DELETE /favoritos`
7. [ ] `GET /corridas`, `POST /corridas`, `PATCH /corridas/:id`
8. [ ] `GET /motorista/veiculos`, `GET /motorista/corridas`
9. [ ] `PUT` e `DELETE /veiculos/:id/posicao`, `GET /veiculos`
10. [ ] `POST /avaliacoes`
11. [ ] Hospedar (sugestão: Render) e enviar a URL ao Pedro

## Regras de `GET /veiculos` (posição real, sem simulação)

- Só entram veículos com posição enviada nos últimos **10 minutos**
- `estado`: sem envio há mais de **30 s** é `sem_sinal`; senão `em_movimento` ou `parado`, pela coluna `em_movimento`
- No `PUT`, `em_movimento` é verdadeiro se a posição mudou mais de 3 m desde o envio anterior
- `proximaParada`: a parada da linha mais próxima da posição
- `etaMin`: só quando em movimento: distância ÷ velocidade (carrinho 2,5 m/s, ônibus 7 m/s), em minutos, no mínimo 1

A mesma conta já está em [`demonstracao.ts`](../frontend/src/services/demonstracao.ts), função `veiculoComMotorista`, e a distância em [`geo.ts`](../frontend/src/services/geo.ts).

## Atenção ao reaproveitar o `todo-back`

- Lá há um único cliente Supabase no servidor. Nas rotas com login, crie um cliente **por requisição** com o token, senão o RLS não sabe quem está pedindo:
  `createClient(process.env.URL, process.env.API, { global: { headers: { Authorization: `Bearer ${req.token}` } }, auth: { persistSession: false } })`
- No login e cadastro, use também `persistSession: false`
- `user_id` sempre vem de `req.user.id`, nunca do corpo da requisição
- Em `avaliacoes`, faça o `insert` **sem** `.select()` (ninguém tem permissão de leitura)
- Chamado ativo repetido: o banco devolve o código `23505`; responda 409. `update` que não altera nenhuma linha: 404 ou 409
- Não copie `NODE_TLS_REJECT_UNAUTHORIZED` para o `.env`: com o valor `0`, ele desliga a verificação de certificados
- Não use a chave `service_role`
- Porta: `process.env.PORT || process.env.PORTA || 3000` (o Render usa `PORT`)

## Testar com o front

No `frontend/.env`, coloque `VITE_API_URL=http://localhost:3000`, rode a API e depois `npm run dev` na pasta `frontend`.

## Pronto quando

Todas as rotas do contrato respondem na URL pública usando o banco do Supabase.

## Prompt para usar com IA

> Estou fazendo a API do projeto UniRota. Leia `Ricardo/README.md`, `docs/contrato-api.md`, os scripts em `database/` e os serviços em `frontend/src/services/`. Crie em `backend/` uma API Express em CommonJS no padrão config/controlador/rotas/middleware, seguindo o contrato exatamente, com Supabase usando a chave anon e um cliente por requisição com o token. Faça uma rota por vez, explique e me diga como testar cada uma.
