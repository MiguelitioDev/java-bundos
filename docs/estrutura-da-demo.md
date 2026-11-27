# Estrutura da demo (referência)

Levantado dos textos da demo mobile e dos slides. A versão web usa isto como guia de telas e fluxo; não haverá APK por enquanto.

## Fluxo principal

1. Abre o UniRota
2. Escolhe Externo ou Interno
3. Vê no mapa o veículo e o trajeto
4. Consulta a próxima parada e a previsão
5. Organiza o deslocamento

## Telas e recursos

- **Início:** apresentação e aviso de dados demonstrativos
- **Mapa:** alternância de módulo, veículos, paradas, trajeto e painel inferior
- **Favoritos e horários:** linhas e paradas favoritas, horários previstos
- **Sua localização:** opcional, com parada mais próxima
- **Sobre e Privacidade:** créditos, aviso de projeto não oficial e dados guardados

## O que muda na web

| Demo mobile | Versão web |
|---|---|
| Sem login | Mapa sem login; login só para favoritos |
| Favoritos guardados no aparelho | Favoritos no banco |
| Mapa offline e mapa real | Só o mapa real |
| Dados embutidos no app | Dados no Supabase, servidos pela API |

## Paradas da demo

Os identificadores abaixo aparecem na demo e podem ser reaproveitados como `id`.

**Externo:** `ext-unifor`, `ext-aldeota`, `ext-benfica`, `ext-iguatemi`, `ext-parangaba`, `ext-riomar`, `ext-viasul`, `ext-mc-13maio`, `ext-mc-domluis`, `ext-mc-messejana`, `ext-mc-ws`

Nomes: Parada Unifor; frente do Shopping Aldeota, Shopping Benfica, Iguatemi Bosque, Shopping Parangaba, RioMar Fortaleza, Via Sul Shopping; e frente do McDonald's 13 de Maio, Dom Luís, Messejana e Washington Soares.

**Interno:** `int-a`, `int-b`, `int-c`, `int-d`, `int-m`, `int-biblioteca`, `int-reitoria`, `int-convivencia`

Nomes: Blocos A, B, C, D e M; Biblioteca; Reitoria; Convivência.

Linhas internas citadas: "Circular dos blocos" e "Reitoria ↔ Bloco M". As linhas externas, as coordenadas e os horários precisam ser conferidos na demo ou definidos pela equipe.

> Todas as paradas, linhas e horários são fictícios. Os lugares citados são só referência geográfica e não têm vínculo com o projeto.
