const db = require('../config/database');

const getCategories = async (req, res) => {
  try {
    const { type } = req.query;
    
    let query = 'SELECT * FROM categories';
    const params = [];

    if (type) {
      query += ' WHERE type = ?';
      params.push(type);
    }

    query += ' ORDER BY name';

    const [categories] = await db.query(query, params);

    res.json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar categorias' });
  }
};

module.exports = { getCategories };
