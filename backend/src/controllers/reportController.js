const db = require('../config/database');

const getDashboard = async (req, res) => {
  try {
    const { month, year } = req.query;
    const currentDate = new Date();
    const targetMonth = month || (currentDate.getMonth() + 1);
    const targetYear = year || currentDate.getFullYear();

    const [balance] = await db.query(
      `SELECT 
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as totalIncome,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as totalExpense
      FROM transactions 
      WHERE user_id = ?`,
      [req.userId]
    );

    const [monthlyData] = await db.query(
      `SELECT 
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as monthIncome,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as monthExpense
      FROM transactions 
      WHERE user_id = ? AND MONTH(date) = ? AND YEAR(date) = ?`,
      [req.userId, targetMonth, targetYear]
    );

    const [categoryData] = await db.query(
      `SELECT 
        category,
        type,
        SUM(amount) as total
      FROM transactions 
      WHERE user_id = ? AND MONTH(date) = ? AND YEAR(date) = ?
      GROUP BY category, type
      ORDER BY total DESC`,
      [req.userId, targetMonth, targetYear]
    );

    const totalIncome = parseFloat(balance[0].totalIncome) || 0;
    const totalExpense = parseFloat(balance[0].totalExpense) || 0;
    const currentBalance = totalIncome - totalExpense;

    const monthIncome = parseFloat(monthlyData[0].monthIncome) || 0;
    const monthExpense = parseFloat(monthlyData[0].monthExpense) || 0;

    res.json({
      balance: {
        total: currentBalance,
        totalIncome,
        totalExpense
      },
      monthly: {
        month: targetMonth,
        year: targetYear,
        income: monthIncome,
        expense: monthExpense,
        balance: monthIncome - monthExpense
      },
      categoryBreakdown: categoryData
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar dados do dashboard' });
  }
};

const getReportByPeriod = async (req, res) => {
  try {
    const { startDate, endDate, type } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Data inicial e final são obrigatórias' });
    }

    let query = `
      SELECT 
        DATE_FORMAT(date, '%Y-%m') as period,
        type,
        SUM(amount) as total,
        COUNT(*) as count
      FROM transactions 
      WHERE user_id = ? AND date BETWEEN ? AND ?
    `;
    const params = [req.userId, startDate, endDate];

    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }

    query += ' GROUP BY period, type ORDER BY period DESC';

    const [report] = await db.query(query, params);

    res.json(report);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao gerar relatório' });
  }
};

const getCategoryReport = async (req, res) => {
  try {
    const { month, year } = req.query;
    const currentDate = new Date();
    const targetMonth = month || (currentDate.getMonth() + 1);
    const targetYear = year || currentDate.getFullYear();

    const [categoryReport] = await db.query(
      `SELECT 
        category,
        type,
        SUM(amount) as total,
        COUNT(*) as count,
        AVG(amount) as average
      FROM transactions 
      WHERE user_id = ? AND MONTH(date) = ? AND YEAR(date) = ?
      GROUP BY category, type
      ORDER BY total DESC`,
      [req.userId, targetMonth, targetYear]
    );

    res.json(categoryReport);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao gerar relatório de categorias' });
  }
};

module.exports = {
  getDashboard,
  getReportByPeriod,
  getCategoryReport
};
