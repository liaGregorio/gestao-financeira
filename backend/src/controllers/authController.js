const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    const [existingUser] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );

    const token = jwt.sign({ id: result.insertId }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'Usuário criado com sucesso',
      token,
      user: {
        id: result.insertId,
        name,
        email
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao registrar usuário' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (users.length === 0) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const user = users[0];
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'Login realizado com sucesso',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao realizar login' });
  }
};

const getProfile = async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT id, name, email, created_at FROM users WHERE id = ?',
      [req.userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json(users[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar perfil' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name && !email) {
      return res.status(400).json({ error: 'Informe pelo menos um campo para atualizar' });
    }

    const updates = [];
    const values = [];

    if (name) {
      updates.push('name = ?');
      values.push(name);
    }

    if (email) {
      const [existingUser] = await db.query(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email, req.userId]
      );
      if (existingUser.length > 0) {
        return res.status(400).json({ error: 'Email já está em uso' });
      }
      updates.push('email = ?');
      values.push(email);
    }

    values.push(req.userId);

    await db.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    const [users] = await db.query(
      'SELECT id, name, email FROM users WHERE id = ?',
      [req.userId]
    );

    res.json({
      message: 'Perfil atualizado com sucesso',
      user: users[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar perfil' });
  }
};

module.exports = { register, login, getProfile, updateProfile };
