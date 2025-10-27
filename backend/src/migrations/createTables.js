const mysql = require('mysql2/promise');
require('dotenv').config();

async function runMigrations() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 3306
  });

  try {
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
    console.log('Database created or already exists');

    await connection.query(`USE ${process.env.DB_NAME}`);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('Table users created');

    await connection.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        type ENUM('income', 'expense') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Table categories created');

    await connection.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        description VARCHAR(255) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        type ENUM('income', 'expense') NOT NULL,
        category VARCHAR(100) NOT NULL,
        date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('Table transactions created');

    const [categories] = await connection.query('SELECT COUNT(*) as count FROM categories');
    if (categories[0].count === 0) {
      await connection.query(`
        INSERT INTO categories (name, type) VALUES
        ('Salário', 'income'),
        ('Freelance', 'income'),
        ('Investimentos', 'income'),
        ('Outros', 'income'),
        ('Alimentação', 'expense'),
        ('Transporte', 'expense'),
        ('Moradia', 'expense'),
        ('Lazer', 'expense'),
        ('Saúde', 'expense'),
        ('Educação', 'expense'),
        ('Compras', 'expense'),
        ('Outros', 'expense')
      `);
      console.log('Default categories inserted');
    }

    console.log('All migrations completed successfully');
  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    await connection.end();
  }
}

runMigrations();
