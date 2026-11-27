# Rafaele: Banco de dados

Pasta: `database/`. Branches: `banco/...`.

Base: o arquivo `script create e inserts.sql` do `todo-back` (tabela, RLS, políticas e inserts). Repita o mesmo padrão para o UniRota.

## Modelo proposto

| Tabela | Colunas principais |
|---|---|
| `linhas` | `id` text PK, `modulo` (`externo`/`interno`), `nome`, `sentido`, `cor` |
| `paradas` | `id` text PK, `modulo`, `nome`, `lat`, `lng` |
| `linha_paradas` | `linha_id` FK, `parada_id` FK, `ordem`; PK (`linha_id`, `ordem`) |
| `veiculos` | `id` text PK, `linha_id` FK, `nome`, `tipo` (`onibus`/`carrinho`), `estado` (`em_movimento`/`parado`/`sem_sinal`) |
| `horarios` | `id` identity PK, `linha_id` FK, `parada_id` FK, `hora` time, `dias` smallint[] |
| `favoritos` | `id` identity PK, `user_id` uuid FK `auth.users`, `linha_id` FK opcional, `parada_id` FK opcional, `created_at` |

A posição dos veículos não é gravada: o back calcula a posição simulada a partir das paradas.

## Tarefas

- [ ] Criar o projeto no Supabase e adicionar Ricardo e Pedro
- [ ] `database/01-tabelas.sql`: tabelas, chaves e restrições (`check` em `modulo`, `tipo` e `estado`)
- [ ] Em `favoritos`: exigir exatamente um entre `linha_id` e `parada_id`, e impedir repetidos
- [ ] `database/02-politicas.sql`: ativar RLS em **todas** as tabelas
  - [ ] `linhas`, `paradas`, `linha_paradas`, `veiculos`, `horarios`: leitura para `anon` e `authenticated`, sem escrita
  - [ ] `favoritos`: cada usuário lê, insere e apaga apenas os próprios (`auth.uid() = user_id`)
- [ ] `database/03-dados.sql`: dados fictícios baseados na [demo](estrutura-da-demo.md), com coordenadas, ordem das paradas e horários (sem domingo)
- [ ] Configurar o Auth por e-mail e senha (decidir com Ricardo se exige confirmação de e-mail)
- [ ] Criar um usuário de teste (a senha não vai para o repositório)
- [ ] Passar a URL e a chave `anon` ao Ricardo por mensagem privada
- [ ] Testar: sem login lê o mapa, não escreve nada e não vê favoritos
- [ ] Testar: um usuário não vê os favoritos de outro

## Pronto quando

Os três scripts rodam em ordem num projeto vazio e os testes de acesso passam.
