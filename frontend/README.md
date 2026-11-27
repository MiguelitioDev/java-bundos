# Front-end (Pedro)

```bash
npm install
npm run dev      # desenvolvimento
npm test         # testes dos serviços
npm run build    # versão de publicação, em dist/
```

| Pasta em `src/` | Conteúdo |
|---|---|
| `telas/` | Uma por rota |
| `componentes/` | Peças reutilizadas |
| `services/` | API (`http.js`), demonstração (`demonstracao.js`), simulação e validação |
| `hooks/`, `contextos/` | Estado, atualização periódica, sessão |
| `dados/` | Paradas, linhas e trajetos da demonstração |

Sem `VITE_API_URL`, roda em modo demonstração. Para usar a API, copie `.env.example` para `.env`. O `.env` não vai para o Git.

Situação e pendências: [docs/pedro-front.md](../docs/pedro-front.md).
