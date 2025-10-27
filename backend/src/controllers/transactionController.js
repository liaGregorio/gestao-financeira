const db = require('../config/database');

const createTransaction = async (req, res) => {
  try {
    const { description, amount, type, category, date } = req.body;

    if (!description || !amount || !type || !category || !date) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    if (type !== 'income' && type !== 'expense') {
      return res.status(400).json({ error: 'Tipo deve ser income ou expense' });
    }

    const [result] = await db.query(
      'INSERT INTO transactions (user_id, description, amount, type, category, date) VALUES (?, ?, ?, ?, ?, ?)',
      [req.userId, description, amount, type, category, date]
    );

    const [transaction] = await db.query('SELECT * FROM transactions WHERE id = ?', [result.insertId]);

    res.status(201).json({
      message: 'Transação criada com sucesso',
      transaction: transaction[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar transação' });
  }
};

const getTransactions = async (req, res) => {
  try {
    const { type, startDate, endDate, category } = req.query;
    
    let query = 'SELECT * FROM transactions WHERE user_id = ?';
    const params = [req.userId];

    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }

    if (startDate) {
      query += ' AND date >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND date <= ?';
      params.push(endDate);
    }

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    query += ' ORDER BY date DESC, created_at DESC';

    const [transactions] = await db.query(query, params);

    res.json(transactions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar transações' });
  }
};

const getTransactionById = async (req, res) => {
  try {
    const [transactions] = await db.query(
      'SELECT * FROM transactions WHERE id = ? AND user_id = ?',
      [req.params.id, req.userId]
    );

    if (transactions.length === 0) {
      return res.status(404).json({ error: 'Transação não encontrada' });
    }

    res.json(transactions[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar transação' });
  }
};

const updateTransaction = async (req, res) => {
  try {
    const { description, amount, type, category, date } = req.body;

    const [existing] = await db.query(
      'SELECT id FROM transactions WHERE id = ? AND user_id = ?',
      [req.params.id, req.userId]
    );

    if (existing.length === 0) {
      return res.status(404).json({ error: 'Transação não encontrada' });
    }

    const updates = [];
    const values = [];

    if (description) {
      updates.push('description = ?');
      values.push(description);
    }

    if (amount) {
      updates.push('amount = ?');
      values.push(amount);
    }

    if (type) {
      if (type !== 'income' && type !== 'expense') {
        return res.status(400).json({ error: 'Tipo deve ser income ou expense' });
      }
      updates.push('type = ?');
      values.push(type);
    }

    if (category) {
      updates.push('category = ?');
      values.push(category);
    }

    if (date) {
      updates.push('date = ?');
      values.push(date);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'Nenhum campo para atualizar' });
    }

    values.push(req.params.id);

    await db.query(
      `UPDATE transactions SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    const [transaction] = await db.query('SELECT * FROM transactions WHERE id = ?', [req.params.id]);

    res.json({
      message: 'Transação atualizada com sucesso',
      transaction: transaction[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar transação' });
  }
};

const deleteTransaction = async (req, res) => {
  try {
    const [result] = await db.query(
      'DELETE FROM transactions WHERE id = ? AND user_id = ?',
      [req.params.id, req.userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Transação não encontrada' });
    }

    res.json({ message: 'Transação excluída com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao excluir transação' });
  }
};

module.exports = {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction
};
