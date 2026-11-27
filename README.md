# UniRota

Mobilidade universitária em tempo real. *"Saiba onde está. Chegue no horário."*

Aplicação **web** que mostra no mapa o transporte externo (ônibus) e o interno (carrinho entre blocos), com horários, favoritos, **chamada do carrinho**, painel do motorista e avaliação. A arquitetura segue o `todo-back` da disciplina (Node, Express e Supabase).

> Projeto estudantil, sem vínculo oficial com a Unifor. Os dados atuais são fictícios.

## Comece aqui

| Pessoa | Área | Leia | Código vai em | Situação |
|---|---|---|---|---|
| **Rafaele** | Banco de dados | [Rafaele/README.md](Rafaele/README.md) | [`database/`](database/) | A fazer |
| **Ricardo** | Back-end (API) | [Ricardo/README.md](Ricardo/README.md) | [`backend/`](backend/) | A fazer |
| **Pedro** | Front-end (web) | [docs/pedro-front.md](docs/pedro-front.md) | [`frontend/`](frontend/) | Implementado, falta revisar e integrar |

Os três: [contrato da API](docs/contrato-api.md) e [relatório com estratégia e prazos](docs/relatorio.md).

## Ver o front funcionando

Precisa do Node.js 22 ou mais novo.

```bash
git clone https://github.com/MiguelitioDev/java-bundos.git
cd java-bundos/frontend
npm install
npm run dev
```

Abra o endereço que aparecer (normalmente `http://localhost:5173`). Sem API configurada, ele roda em **modo demonstração**: qualquer e-mail cria conta, e um e-mail começando com `motorista` abre o painel do motorista.

## Arquitetura

| Camada | Tecnologia | Hospedagem sugerida |
|---|---|---|
| Web | React, TypeScript, Vite, Tailwind CSS, React Router, Leaflet (OpenStreetMap) | Vercel |
| API | Node.js, Express, `@supabase/supabase-js` | Render |
| Banco | Supabase (PostgreSQL, Auth, RLS) | Supabase |

O front nunca fala direto com o banco: tudo passa pela API.

## Como trabalhar no Git

1. Cada pessoa usa a própria branch: `banco/...`, `back/...` ou `front/...`.
2. Cada um mexe na própria pasta. Mudou o contrato da API? Avise os outros dois.
3. Abra um Pull Request para a `main` e peça para outra pessoa conferir.
4. **Nunca** envie arquivos `.env` ou chaves. O repositório é público.

```bash
git pull
git checkout -b back/login   # exemplo
```
