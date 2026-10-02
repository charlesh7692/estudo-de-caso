# Estudo de Caso: Sistema de reservas de salas

## Visão geral

Este projeto implementa um sistema de reservas de salas de reunião com autenticação simples, CRUD de salas e reservas, validação de regras de negócio e frontend em React. A arquitetura foi pensada para atender ao conteúdo programático do estudo de caso e para funcionar localmente com poucos passos.

## Stack escolhida

- Frontend: React + Vite + React Router
- Backend: Node.js + Express
- Banco de dados: PostgreSQL (`pg`)
- Segurança: bcrypt para hash de senhas, JWT para autenticação, CORS e validação no servidor
- Documentação: Swagger/OpenAPI
- Testes: Node test runner no backend
- Containerização: Docker Compose

## Requisitos

- Node.js 20+
- npm 10+
- Docker e Docker Compose (opcional, para execução em container)

## Instalação

1. Clone ou copie o projeto para sua máquina.
2. Garanta que o PostgreSQL esteja ativo e que o banco `estudo` exista. A configuração padrão aponta para `localhost:5432`, usuário `postgres` e banco `estudo`.

3. Na raiz do repositório, instale as dependências:

```bash
npm install
```

4. Copie o arquivo de ambiente e ajuste os valores conforme sua instalação do PostgreSQL:

```bash
cp .env.example .env
```

5. Inicie a API e o frontend em terminais separados:

```bash
npm --workspace backend run dev
npm --workspace frontend run dev
```

Ou, em ambiente com Docker Compose, que inicia um PostgreSQL isolado para o projeto:

```bash
docker compose up --build
```

## Variáveis de ambiente

Arquivo `.env.example` com exemplo:

```env
PORT=4000
JWT_SECRET=troque-por-uma-chave-forte
BCRYPT_ROUNDS=10
FRONTEND_URL=http://localhost:5173
LOG_LEVEL=info
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=123
DB_NAME=estudo
VITE_API_URL=http://localhost:4000/api
```

## Estrutura de pastas

```text
.
├── backend/
│   ├── src/
│   ├── tests/
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
├── .env.example
├── docker-compose.yml
├── README.md
└── package.json
```

## Funcionalidades implementadas

- Cadastro e login de usuários
- Listagem e cadastro de salas
- Criação de reservas com validação de data, hora e sobreposição
- Exclusão lógica de reservas e salas
- Filtros por data, sala e status
- Ordenação por data e horário
- Mensagens padronizadas de erro e sucesso
- Documentação interativa da API em Swagger
- Logs de requisições
- Testes automatizados para regras de negócio críticas

## Regras de negócio principais

- O horário de início deve ser menor que o fim.
- Não pode haver sobreposição de reservas na mesma sala.
- Não é permitido reservar em um dia passado.
- Salas e reservas marcadas como inativas não aparecem em operações normais.
- Senhas são armazenadas com hash usando bcrypt.
- Todas as respostas da API evitam expor a stack trace ou detalhes internos.

## Premissas e decisões

- O schema PostgreSQL é criado automaticamente na inicialização da API. O usuário configurado precisa ter permissão para criar tabelas e índices no banco `estudo`.
- O Docker Compose usa um PostgreSQL isolado; a execução local sem Docker usa a instância definida nas variáveis `DB_*`.
- A referência de tempo utilizada é o horário de Brasília (UTC−3), mesmo que a aplicação invoque a data local do servidor como contexto geral.
- A autenticação é simples e adequada ao escopo do estudo de caso.
- Os nomes de tabelas e colunas foram definidos em inglês e snake_case.

## Funcionalidades não implementadas

- Integração com pagamentos
- Notificações por e-mail ou WhatsApp
- Multi-tenancy
- Autorização por papéis complexos
- Modo de produção com balanceamento, cache e observabilidade avançada

## Uso de inteligência artificial

Este projeto foi estruturado com apoio de inteligência artificial para geração de arquitetura, arquivos base e documentação inicial. A implementação final foi validada e ajustada manualmente para garantir consistência técnica.

## Observações finais

O projeto está preparado para servir como base de estudo de caso, com foco em arquitetura, boas práticas, segurança, documentação e desenvolvimento full-stack.
