# 🚀 Rocket Store API

## Descrição
API de e-commerce desenvolvida com NestJS. Esta aplicação oferece um backend robusto com funcionalidades completas de gerenciamento de produtos, carrinho de compras, autenticação de usuários e processamento de pedidos.

## 💻 Tecnologias Utilizadas
- NestJS
- TypeScript
- SQLite
- JWT para autenticação
- Swagger para documentação
- Class Validator para validação de dados

## 🛠️ Funcionalidades Principais

### Produtos
- Listagem de produtos
- Cadastro de novos produtos
- Atualização de produtos existentes
- Remoção de produtos
- Consulta de detalhes do produto

### Carrinho de Compras
- Adicionar produtos ao carrinho
- Remover produtos do carrinho
- Atualizar quantidade de itens
- Visualizar carrinho atual

### Autenticação
- Registro de novos usuários
- Login com geração de token JWT
- Proteção de rotas privadas

### Pedidos
- Criação de pedidos
- Histórico de pedidos
- Detalhamento de pedidos

## 📋 Pré-requisitos
- Node.js (versão 14 ou superior)
- npm ou yarn

## 🚀 Instalação

1. Clone o repositório:
```bash
git clone [URL_DO_REPOSITÓRIO]
cd rocket-store-api
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:
```env
PORT=3000
JWT_SECRET=sua_chave_secreta
```

4. Inicie o servidor:
```bash
npm run start:dev
```

## 📚 Documentação da API

A documentação completa da API está disponível através do Swagger UI. Após iniciar o servidor, acesse:
```
http://localhost:3000/api
```

### Principais Endpoints

#### Autenticação
- POST `/auth/register` - Registro de novo usuário
- POST `/auth/login` - Login de usuário

#### Produtos
- GET `/products` - Lista todos os produtos
- GET `/products/:id` - Obtém detalhes de um produto
- POST `/products` - Cria novo produto
- PUT `/products/:id` - Atualiza um produto
- DELETE `/products/:id` - Remove um produto

#### Carrinho
- GET `/cart` - Visualiza o carrinho atual
- POST `/cart/items` - Adiciona item ao carrinho
- PUT `/cart/items/:id` - Atualiza quantidade de um item
- DELETE `/cart/items/:id` - Remove item do carrinho

#### Pedidos
- POST `/checkout` - Finaliza a compra
- GET `/orders` - Lista pedidos do usuário
- GET `/orders/:id` - Obtém detalhes de um pedido

## 🔒 Autenticação

A API utiliza autenticação JWT. Para acessar endpoints protegidos, inclua o token no header:
```
Authorization: Bearer [seu_token]
```

## 🧪 Testando a API

Você pode testar a API usando:
- Swagger UI (http://localhost:3000/api)
- Postman
- Insomnia
- Thunder Client (extensão VS Code)

## 🧪 Testes Unitários

O projeto conta com uma suíte completa de testes unitários implementada com Jest. Os testes cobrem todos os serviços principais da aplicação:

### Cobertura de Testes
- Total de Suítes: 7
- Total de Testes: 38
- Serviços Testados:
  - AuthService: Autenticação e registro de usuários
  - CartService: Gerenciamento do carrinho de compras
  - ProductService: CRUD de produtos
  - OrderService: Processamento de pedidos
  - UsersService: Gerenciamento de usuários

### Executando os Testes
```bash
# Executa todos os testes
npm test

# Executa testes com coverage
npm run test:cov

# Executa testes em modo watch
npm run test:watch
```

### Principais Casos de Teste
- Autenticação:
  - Registro de usuário
  - Login com credenciais válidas/inválidas
  - Validação de token JWT

- Carrinho:
  - Adição de itens
  - Remoção de itens
  - Atualização de quantidades
  - Limpeza do carrinho

- Produtos:
  - Criação de produtos
  - Atualização de informações
  - Remoção lógica (soft delete)
  - Gestão de estoque

- Pedidos:
  - Criação de pedidos
  - Validação de itens
  - Processamento de checkout

### Boas Práticas Implementadas
- Mocking de repositórios TypeORM
- Testes de casos de sucesso e erro
- Validação de exceções
- Isolamento de dependências
- Cobertura de casos de borda

## 📝 Estrutura do Projeto
```
src/
├── auth/           # Autenticação
├── products/       # Gerenciamento de produtos
├── cart/          # Carrinho de compras
├── orders/        # Pedidos
├── users/         # Gerenciamento de usuários
└── main.ts        # Arquivo principal
```

## 🤝 Contribuindo

1. Faça o fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença
Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👥 Autores
- Seu Nome - Desenvolvedor Principal

## 🙏 Agradecimentos
- NestJS Team
- Comunidade Open Source