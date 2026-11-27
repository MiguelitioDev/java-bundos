# Contrato da API

O front já está implementado com estes formatos (veja `frontend/src/services/http.ts` e `frontend/src/entidades/tipos.ts`). Mudou algo? Avise os três e atualize este arquivo.

- JSON, com nomes em camelCase.
- Erros: status adequado e `{ "error": "mensagem em português" }`.
- 🔒 exige `Authorization: Bearer <token>`. 🚗 exige também usuário com papel `motorista` (senão 403).
- `modulo`: `externo` ou `interno`.
- Ver o mapa **não exige login**.

## Rotas

| Método | Rota | Corpo | Resposta |
|---|---|---|---|
| GET | `/health` | | `{ "status": "ok" }` |
| GET | `/linhas?modulo=` | | lista de linhas |
| GET | `/linhas/:id` | | linha com `paradas`, `horarios`, `trajeto` (404) |
| GET | `/paradas?modulo=` | | lista de paradas |
| GET | `/veiculos?modulo=` | | lista de veículos com posição |
| POST | `/auth/cadastro` | `email`, `password` | 201, sessão |
| POST | `/auth/login` | `email`, `password` | sessão (401) |
| GET 🔒 | `/favoritos` | | lista |
| POST 🔒 | `/favoritos` | `linhaId` **ou** `paradaId` | 201, favorito |
| DELETE 🔒 | `/favoritos/:id` | | 204 |
| GET 🔒 | `/corridas` | | chamados do usuário, mais novo primeiro |
| POST 🔒 | `/corridas` | `origemId`, `destinoId` (paradas internas, diferentes) | 201, chamado (400; 409 se já houver um ativo) |
| PATCH 🔒 | `/corridas/:id` | `status`, `veiculoId` (ao aceitar) | chamado (403, 404, 409) |
| GET 🚗 | `/motorista/veiculos` | | carrinhos cadastrados |
| GET 🚗 | `/motorista/corridas` | | chamados `aguardando` e os aceitos por ele |
| PUT 🚗 | `/veiculos/:id/posicao` | `lat`, `lng` | 204 |
| DELETE 🚗 | `/veiculos/:id/posicao` | | 204 (veículo sai do mapa) |
| POST | `/avaliacoes` | `nota` (1 a 5), `comentario` (até 500, pode ser vazio) | 201 (token opcional) |

Quem pode mudar o status de um chamado:

- Passageiro dono: `cancelada`, se estiver `aguardando` ou `aceita`.
- Motorista: `aceita` (de `aguardando`) e `concluida` (de `aceita`, pelo mesmo motorista).

## Formatos

Valores ilustrativos.

### Linha, em `GET /linhas`

```json
{ "id": "c01", "modulo": "interno", "codigo": "C01", "nome": "Circular dos blocos", "sentido": "Circular", "cor": "#13302B" }
```

### `GET /linhas/:id`

Tudo o que a linha tem, mais:

```json
{
  "paradas": [{ "id": "int-a", "nome": "Bloco A", "lat": -3.771, "lng": -38.4811, "ordem": 1 }],
  "horarios": [{ "paradaId": "int-a", "hora": "07:00", "dias": [1, 2, 3, 4, 5] }],
  "trajeto": [[-3.771, -38.4811], [-3.7707, -38.4814]]
}
```

`dias`: 0 = domingo, 6 = sábado. `sentido` igual a `Circular` indica volta fechada.

### Parada, em `GET /paradas`

```json
{ "id": "int-a", "modulo": "interno", "nome": "Bloco A", "lat": -3.771, "lng": -38.4811 }
```

### Veículo, em `GET /veiculos`

```json
{
  "id": "carrinho-1", "linhaId": "c01", "nome": "Carrinho demo", "tipo": "carrinho",
  "estado": "em_movimento", "lat": -3.7707, "lng": -38.4812,
  "proximaParada": { "id": "int-b", "nome": "Bloco B" },
  "etaMin": 2, "atualizadoEm": "2026-12-02T10:30:00Z"
}
```

`estado`: `em_movimento`, `parado` ou `sem_sinal`. `etaMin` é `null` quando parado ou sem sinal.

`GET /motorista/veiculos` devolve só `id`, `linhaId`, `nome`, `tipo`.

### Sessão (login e cadastro)

```json
{ "message": "Login realizado com sucesso", "token": "<jwt>", "user": { "id": "<uuid>", "email": "aluno@exemplo.com", "papel": "passageiro" } }
```

No cadastro, `token: null` significa que o e-mail precisa ser confirmado.

### Favorito

```json
{ "id": 1, "linhaId": "c01", "paradaId": null }
```

### Chamado

```json
{ "id": 7, "origemId": "int-a", "destinoId": "int-m", "status": "aguardando", "veiculoId": null, "criadaEm": "2026-12-02T10:30:00Z" }
```
