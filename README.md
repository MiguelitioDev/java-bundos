# UniRota

Mobilidade universitária em tempo real. *"Saiba onde está. Chegue no horário."*

Aplicação **web** que mostra no mapa o transporte externo (ônibus) e o interno (carrinho entre blocos), com paradas, linhas, horários previstos e favoritos. A arquitetura do back-end parte do projeto `todo-back` (Node, Express e Supabase), pedido como base pelo professor.

> Projeto estudantil, não oficial da Unifor. Paradas, linhas, veículos, horários e posições são **fictícios**.

## Equipe e funções

| Pessoa | Área | Pasta | Tarefas |
|---|---|---|---|
| **Rafaele** | Banco de dados (Supabase) | [`database/`](database/) | [docs/rafaele-banco.md](docs/rafaele-banco.md) |
| **Ricardo** | Back-end (API) | [`backend/`](backend/) | [docs/ricardo-back.md](docs/ricardo-back.md) |
| **Pedro** | Front-end (web) | [`frontend/`](frontend/) | [docs/pedro-front.md](docs/pedro-front.md) |

## O que precisa ser entregue

- [ ] Aplicação web implementada
- [ ] Hospedada, com link público
- [ ] Banco de dados funcionando

## Stack

| Camada | Tecnologia | Hospedagem sugerida |
|---|---|---|
| Banco | Supabase (PostgreSQL, Auth, RLS) | Supabase |
| API | Node.js, Express 5, `@supabase/supabase-js` | Render |
| Web | React, TypeScript, Vite, Tailwind CSS, Leaflet (OpenStreetMap) | Vercel |

```
Navegador (frontend)  →  API (backend)  →  Supabase (database)
```

O front nunca fala direto com o banco: tudo passa pela API.

## Escopo

**Entra:** mapa, alternância Externo/Interno, linhas, paradas, veículos simulados, horários previstos, login, favoritos, localização do usuário (opcional), páginas "Sobre" e "Privacidade".

**Fica de fora por enquanto:** APK/app Android, GPS real, mapa offline.

A demo mobile serve só como referência de telas e fluxo: veja [docs/estrutura-da-demo.md](docs/estrutura-da-demo.md).

## Ordem de trabalho

| Etapa | Rafaele (banco) | Ricardo (back) | Pedro (front) |
|---|---|---|---|
| 1. Combinar | Revisar o [contrato da API](docs/contrato-api.md) | Revisar o contrato | Revisar o contrato |
| 2. Construir em paralelo | Tabelas, RLS e dados | Estrutura e rotas | Telas com dados de exemplo no formato do contrato |
| 3. Integrar | Ajustar dados e políticas | Ligar a API ao banco | Trocar os dados de exemplo pela API |
| 4. Publicar | Conferir o banco em produção | Hospedar a API | Hospedar o site |
| 5. Revisar | Testar tudo junto | Testar tudo junto | Testar tudo junto (celular e computador) |

Dependências: o back precisa das tabelas para concluir as rotas; o front precisa da API publicada para a entrega final.

## Como trabalhar no Git

1. Cada pessoa usa a própria branch: `banco/...`, `back/...` ou `front/...`.
2. Cada um mexe na própria pasta. Mudou o contrato da API? Avise os outros dois.
3. Abra um Pull Request para a `main` e peça para outra pessoa conferir.
4. **Nunca** envie arquivos `.env` ou chaves. O repositório é público.

```bash
git clone https://github.com/MiguelitioDev/java-bundos.git
cd java-bundos
git checkout -b back/rotas-linhas   # exemplo
```
