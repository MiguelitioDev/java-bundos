# Rafaele: Banco de dados (Supabase)

Seus scripts ficam em [`database/`](../database/). Branches: `banco/...`.

**Você começa agora.** O front já está pronto para usar, e o Ricardo precisa das suas tabelas.

## Padrão da disciplina

Siga o `script create e inserts.sql` do `todo-back`: criar a tabela, ativar RLS, uma política por operação e depois os inserts.

## 1. Projeto

- [ ] Criar o projeto no Supabase e adicionar Ricardo e Pedro
- [ ] Em Authentication, deixar e-mail e senha ligados. Para o teste com o público, **desligar a confirmação de e-mail** simplifica o cadastro (combine com o Ricardo)

## 2. `database/01-tabelas.sql`

| Tabela | Colunas |
|---|---|
| `perfis` | `user_id` uuid PK → `auth.users` (cascade), `papel` text padrão `'passageiro'` (`passageiro`/`motorista`) |
| `linhas` | `id` text PK, `modulo` (`externo`/`interno`), `codigo`, `nome`, `sentido`, `cor`, `trajeto` jsonb |
| `paradas` | `id` text PK, `modulo`, `nome`, `lat` double precision, `lng` double precision |
| `linha_paradas` | `linha_id` FK, `parada_id` FK, `ordem` int; PK (`linha_id`, `ordem`) |
| `veiculos` | `id` text PK, `linha_id` FK, `nome`, `tipo` (`onibus`/`carrinho`), `lat`, `lng` (podem ser nulos), `em_movimento` boolean, `atualizado_em` timestamptz |
| `horarios` | `id` identity PK, `linha_id` FK, `parada_id` FK, `hora` time, `dias` smallint[] |
| `favoritos` | `id` identity PK, `user_id` FK, `linha_id` FK opcional, `parada_id` FK opcional, `created_at` |
| `corridas` | `id` identity PK, `user_id` FK, `origem_id` FK, `destino_id` FK, `status` (`aguardando`/`aceita`/`concluida`/`cancelada`), `veiculo_id` FK opcional, `motorista_id` uuid opcional, `criada_em` |
| `avaliacoes` | `id` identity PK, `user_id` uuid opcional, `nota` smallint (1 a 5), `comentario` text (até 500), `criada_em` |

Restrições:

- [ ] `check` em todos os campos com valores fixos
- [ ] `favoritos`: exatamente um entre `linha_id` e `parada_id`, sem repetidos
- [ ] `corridas`: origem diferente do destino
- [ ] `corridas`: **um chamado ativo por pessoa**
  `create unique index ... on corridas (user_id) where status in ('aguardando','aceita');`
- [ ] Gatilho que cria a linha em `perfis` quando alguém se cadastra (procure "Supabase handle_new_user trigger")

## 3. `database/02-politicas.sql`

Ative RLS em **todas** as tabelas.

| Tabela | Quem pode o quê |
|---|---|
| `linhas`, `paradas`, `linha_paradas`, `horarios` | `anon` e `authenticated` leem. Ninguém escreve |
| `veiculos` | Todos leem. Só motorista atualiza, e só `lat`, `lng`, `em_movimento`, `atualizado_em` (use `revoke update` e `grant update (colunas)`) |
| `perfis` | Cada um lê o próprio. Ninguém altera pela API |
| `favoritos` | Cada um lê, cria e apaga os próprios |
| `corridas` | Passageiro: lê e cria as próprias (sempre `aguardando`) e só pode mudar para `cancelada` enquanto ativa. Motorista: lê as ativas e as dele; aceita uma `aguardando` (gravando `motorista_id = auth.uid()`) e conclui as que aceitou. Libere `update` só em `status`, `veiculo_id`, `motorista_id` |
| `avaliacoes` | `anon` e `authenticated` apenas inserem (`user_id` nulo ou o próprio). Ninguém lê pela API: a equipe lê no painel do Supabase |

## 4. `database/03-dados.sql`

- [ ] Gerar os inserts a partir de [`dados-iniciais.json`](dados-iniciais.json), que está nesta pasta: 19 paradas, 5 linhas, 25 ligações linha-parada, 5 veículos e 1.113 horários (a IA converte para SQL)
- [ ] Ordem: `paradas`, `linhas`, `linha_paradas`, `veiculos`, `horarios`
- [ ] Veículos começam com `lat`, `lng` e `atualizado_em` nulos: eles só aparecem quando um motorista envia a posição

Esses dados são os da demonstração (fictícios). **Antes do teste com o público**, a equipe precisa trocar pelas paradas e trajetos reais do carrinho no campus.

## 5. Usuários e entrega

- [ ] Criar um usuário passageiro e um motorista de teste (senhas fora do repositório)
- [ ] Marcar o motorista: `update perfis set papel = 'motorista' where user_id = '...';`
- [ ] Enviar a URL e a chave `anon` ao Ricardo por mensagem privada

## Testes

- [ ] Sem login: lê o mapa, envia avaliação, não escreve em mais nada
- [ ] Um passageiro não vê favoritos nem chamados de outro
- [ ] Passageiro não consegue mover veículo nem se tornar motorista
- [ ] Dois motoristas não conseguem aceitar o mesmo chamado

## Pronto quando

Os três scripts rodam em ordem num projeto vazio e os testes acima passam.

## Prompt para usar com IA

> Estou fazendo o banco do projeto UniRota no Supabase. Leia `Rafaele/README.md`, `docs/contrato-api.md` e `Rafaele/dados-iniciais.json`. Crie `database/01-tabelas.sql`, `database/02-politicas.sql` e `database/03-dados.sql` exatamente com as tabelas, restrições e políticas descritas, no estilo do script do todo-back. O back-end usa só a chave anon mais o token do usuário. Explique cada política e me diga como testar.
