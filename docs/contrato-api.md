# Contrato da API

Proposta inicial para os três trabalharem em paralelo. Pode mudar, desde que todos sejam avisados e este arquivo seja atualizado.

- Formato: JSON.
- Erros: status HTTP adequado e corpo `{ "error": "mensagem" }`, como no `todo-back`.
- Rotas com 🔒 exigem o cabeçalho `Authorization: Bearer <token>`.
- `modulo` aceita `externo` ou `interno`.
- Consultar o mapa **não exige login**. Login só para favoritos.

## Rotas

| Método | Rota | Descrição |
|---|---|---|
| GET | `/health` | `{ "status": "ok" }` |
| GET | `/linhas?modulo=` | Lista de linhas |
| GET | `/linhas/:id` | Linha com paradas em ordem e horários |
| GET | `/paradas?modulo=` | Lista de paradas |
| GET | `/veiculos?modulo=` | Veículos com posição e estado |
| POST | `/auth/cadastro` | Cria conta (`email`, `password`) |
| POST | `/auth/login` | Entra (`email`, `password`) |
| GET 🔒 | `/favoritos` | Favoritos do usuário |
| POST 🔒 | `/favoritos` | Corpo: `{ "linhaId": "..." }` **ou** `{ "paradaId": "..." }` |
| DELETE 🔒 | `/favoritos/:id` | Remove um favorito (responde 204) |

## Exemplos de resposta

Os valores abaixo são ilustrativos.

### `GET /linhas?modulo=interno`

```json
[
  { "id": "int-circular", "modulo": "interno", "nome": "Circular dos blocos", "sentido": "Circular", "cor": "#1f7a4d" }
]
```

### `GET /linhas/:id`

```json
{
  "id": "int-circular",
  "modulo": "interno",
  "nome": "Circular dos blocos",
  "sentido": "Circular",
  "cor": "#1f7a4d",
  "paradas": [
    { "id": "int-a", "nome": "Bloco A", "lat": -3.7690, "lng": -38.4780, "ordem": 1 }
  ],
  "horarios": [
    { "paradaId": "int-a", "hora": "07:30", "dias": [1, 2, 3, 4, 5] }
  ]
}
```

`dias`: 0 = domingo, 6 = sábado.

### `GET /paradas?modulo=interno`

```json
[
  { "id": "int-a", "modulo": "interno", "nome": "Bloco A", "lat": -3.7690, "lng": -38.4780 }
]
```

### `GET /veiculos?modulo=interno`

```json
[
  {
    "id": "carrinho-1",
    "linhaId": "int-circular",
    "nome": "Carrinho demo",
    "tipo": "carrinho",
    "estado": "em_movimento",
    "lat": -3.7692,
    "lng": -38.4783,
    "proximaParada": { "id": "int-b", "nome": "Bloco B" },
    "etaMin": 3,
    "atualizadoEm": "2026-01-01T10:30:00Z"
  }
]
```

- `estado`: `em_movimento`, `parado` ou `sem_sinal`.
- `etaMin`: `null` quando não houver previsão (parado ou sem sinal).
- `sem_sinal`: `lat`/`lng` trazem a última posição conhecida.

### `POST /auth/login`

```json
{
  "message": "Login realizado com sucesso",
  "token": "<jwt>",
  "user": { "id": "<uuid>", "email": "aluno@exemplo.com" }
}
```

### `GET /favoritos`

```json
[
  { "id": 1, "linhaId": "int-circular", "paradaId": null },
  { "id": 2, "linhaId": null, "paradaId": "int-a" }
]
```
