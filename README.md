# Street Foods

Sistema web para lanchonete com cardapio digital, carrinho, checkout, acompanhamento de pedidos e painel administrativo.

O projeto simula um fluxo completo de delivery/local: cliente escolhe produtos, adiciona itens ao carrinho, finaliza o pedido e acompanha o status. O administrador gerencia produtos, valores, imagens, dados da loja e status dos pedidos.

## Tecnologias

- React
- Vite
- Node.js
- Express
- TypeScript
- Prisma
- PostgreSQL
- Tailwind CSS
- Lucide React

## Funcionalidades

- Cardapio com categorias
- Carrinho com taxa de entrega e taxa de servico
- Adicionais no produto
- Checkout com retirada ou entrega
- Opcoes de pagamento: PIX, dinheiro, debito e credito
- QR Code PIX e copia e cola
- Login e cadastro de cliente
- Conta de administrador
- Painel admin para editar produtos, imagens, valores e dados da loja
- Atualizacao de status do pedido pelo admin
- Acompanhamento do pedido pelo cliente
- Historico de pedidos finalizados
- Botao de WhatsApp e link de localizacao
- Modo escuro e identidade visual street

## Como Rodar

Instale as dependencias do backend:

```bash
npm install
```

Instale as dependencias do frontend:

```bash
cd frontend
npm install
```

Configure o `.env` do backend com a URL do banco:

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/ecomerce_lanche"
```

Gere o Prisma Client:

```bash
npx prisma generate
```

Rode as migrations:

```bash
npx prisma migrate dev
```

Suba o backend:

```bash
npm run dev
```

Suba o frontend:

```bash
cd frontend
npm run dev
```

## Destaques Tecnicos

- API REST com Express e TypeScript
- Modelagem de dados com Prisma
- Persistencia de pedidos, clientes, produtos e configuracoes da loja
- Separacao entre area do cliente e area administrativa
- Fluxo de status do pedido integrado entre admin e cliente
- Interface responsiva para celular e desktop

## Observacoes

Arquivos sensiveis como `.env` e dados locais nao devem ser versionados.

Este projeto mostra experiencia pratica com aplicacao full stack, integracao frontend/backend, banco de dados e dashboard administrativo.
