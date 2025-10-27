const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const reportRoutes = require('./routes/reportRoutes');
const categoryRoutes = require('./routes/categoryRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/categories', categoryRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'API de Gestão Financeira' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
