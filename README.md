# Gestão Financeira

Aplicação full stack para controle de transações financeiras com dashboard analítico.

## Stack Tecnológica

### Backend
- Node.js + Express
- MySQL (XAMPP)
- JWT para autenticação
- bcrypt para hash de senhas

### Frontend
- React Native (Expo)
- React Navigation
- Axios
- AsyncStorage
- React Native Chart Kit

## Instruções de Instalação

### Backend

1. Inicie o MySQL no XAMPP

2. Configure o arquivo `.env` no backend se necessário:
```
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=gestao_financeira
JWT_SECRET=sua_chave_secreta_muito_segura_aqui_mude_em_producao
```

3. Execute as migrations para criar o banco de dados:
```bash
cd backend
npm run migrate
```

4. Inicie o servidor:
```bash
npm run dev
```

O backend estará rodando em `http://localhost:3000`

### Frontend

1. Instale as dependências:
```bash
cd frontend
npm install
```

2. Configure a URL da API em `src/services/api.js` se necessário

3. Inicie o aplicativo:
```bash
npm start
```

4. Use o Expo Go no seu celular ou um emulador para testar

## Funcionalidades

### Autenticação
- Registro de usuários
- Login com JWT
- Gerenciamento de perfil

### Transações
- Criar receitas e despesas
- Editar transações
- Excluir transações
- Filtrar por tipo (receitas/despesas)
- Categorização automática

### Dashboard
- Saldo total
- Receitas e despesas do mês
- Gráfico de gastos por categoria

### Categorias Disponíveis

**Receitas:**
- Salário
- Freelance
- Investimentos
- Outros

**Despesas:**
- Alimentação
- Transporte
- Moradia
- Lazer
- Saúde
- Educação
- Compras
- Outros

## Endpoints da API

### Autenticação
- POST `/api/auth/register` - Criar conta
- POST `/api/auth/login` - Fazer login
- GET `/api/auth/profile` - Obter perfil (requer token)
- PUT `/api/auth/profile` - Atualizar perfil (requer token)

### Transações
- GET `/api/transactions` - Listar transações (requer token)
- GET `/api/transactions/:id` - Obter transação específica (requer token)
- POST `/api/transactions` - Criar transação (requer token)
- PUT `/api/transactions/:id` - Atualizar transação (requer token)
- DELETE `/api/transactions/:id` - Excluir transação (requer token)

### Relatórios
- GET `/api/reports/dashboard` - Dashboard principal (requer token)
- GET `/api/reports/period` - Relatório por período (requer token)
- GET `/api/reports/categories` - Relatório por categorias (requer token)

### Categorias
- GET `/api/categories` - Listar categorias (requer token)
