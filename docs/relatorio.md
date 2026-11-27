# Relatório do projeto UniRota

Situação em 27/11/2026.

## 1. Objetivo

Aplicação web que mostra o transporte universitário no mapa e permite chamar o carrinho do campus, testada com pessoas de verdade, com o retorno delas registrado.

## 2. O que foi pedido

| Origem | Pedido |
|---|---|
| Professor | Aplicação web baseada no `todo-back`: implementada, hospedada e com banco de dados funcionando |
| Informação trazida por um colega (áudio) | Versão funcional, sem dados simulados; só web, sem aplicativo; teste com o público; cadastro e chamada do carrinho; coleta de opiniões; relatório de como seria a aplicação real |

O segundo item veio de uma conversa e foi transcrito automaticamente. **Vale confirmar com o professor.**

## 3. Padrão visto na disciplina

- Back-end: Node.js com Express e Supabase, separado em `config/`, `controlador/`, `rotas/` e `middleware/`; login com token JWT; RLS no banco.
- Front-end: React com Vite e Tailwind, separado em componentes e serviços, com `fetch`, estados de carregamento e erro. A ementa pede componentes, entidades, serviços, navegação entre telas e validação de formulários.
- Datas no ambiente virtual: apresentação final em **04/12**. O plano de ensino cita avaliação e apresentação em **02/12** para a turma 83. **Confirmar a data.**

## 4. Arquitetura

```
Navegador (React)  →  API (Express)  →  Supabase (PostgreSQL, Auth, RLS)
celular do motorista ─ envia a posição ─┘
```

## 5. Situação

| Parte | Responsável | Situação |
|---|---|---|
| Front-end | Pedro | Implementado em modo demonstração. Falta revisar no navegador, polir, ligar à API e hospedar |
| Banco | Rafaele | A fazer ([guia](../Rafaele/README.md)) |
| API | Ricardo | A fazer ([guia](../Ricardo/README.md)) |

Verificado no front: compilação e 10 testes automatizados dos serviços (simulação, horários, conta, favoritos, chamados, posição do motorista e validação). **Ainda não verificado:** as telas no navegador, celular e tablet, acessibilidade e integração com a API.

Telas: início, mapa (externo e interno), linhas e horários, chamar o carrinho, painel do motorista, avaliação, favoritos, cadastro e login, sobre e privacidade.

**Modo demonstração:** sem a API, o front usa dados fictícios guardados no navegador e veículos simulados. Com `VITE_API_URL` preenchida, passa a usar o banco e as posições reais dos motoristas.

## 6. Estratégia: front primeiro, banco e API depois

| Etapa | Quem | Prazo sugerido |
|---|---|---|
| 1. Front com dados de demonstração e contrato da API | Pedro | feito |
| 2. Tabelas, políticas e dados | Rafaele | 29/11 |
| 3. API (login e mapa primeiro; depois chamados, posição e avaliações) | Ricardo | 30/11 |
| 4. Integração e hospedagem | os três | 01/12 |
| 5. Teste com o público | os três | 01/12 e 02/12 |
| 6. Relatório final e apresentação | os três | até a data confirmada |

Se a apresentação for em 02/12, o teste precisa ser curto, em 01/12.

Uso de IA: cada pessoa usa o prompt do próprio guia, revisa o que a IA gerar e abre um Pull Request.

## 7. Plano do teste com o público

**Antes:** pedir autorização à Unifor para o teste com os carrinhos; conseguir ao menos um motorista participante; trocar as paradas fictícias pelas reais; testar o fluxo entre dois celulares.

**Participantes:** estudantes voluntários, avisados de que é um teste e que o transporte normal não muda.

**Roteiro de cada pessoa:** criar conta → abrir o mapa → chamar o carrinho → acompanhar → concluir → avaliar.

**O que medir:** notas de 1 a 5, comentários, chamados feitos, aceitos, concluídos e cancelados, tempo até o aceite e falhas observadas (essas contagens saem do banco).

**Cuidados:** LGPD (coletar o mínimo, publicar só resultados reunidos), localização do motorista só com consentimento, primeiro acesso lento em hospedagem gratuita.

**Limites conhecidos:** a posição depende do celular do motorista com a tela ligada; não há aviso por notificação; não há redefinição de senha.

## 8. Resultados do teste (preencher depois)

| Indicador | Resultado |
|---|---|
| Participantes | |
| Chamados feitos / concluídos / cancelados | |
| Tempo médio até o aceite | |
| Nota média | |
| Elogios mais citados | |
| Problemas mais citados | |

## 9. Como seria a aplicação real (preencher depois do teste)

- O que a universidade precisaria autorizar e manter
- Rastreador no veículo no lugar do celular
- Quem atende os chamados e em que horários
- Custos de hospedagem e manutenção
- Mudanças pedidas pelos participantes
