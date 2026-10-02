import mysql from 'mysql2/promise';

async function main() {
  console.log('Connecting to MySQL host localhost...');
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'password',
      port: 3306,
    });

    console.log('Creating database mw_rag if not exists...');
    await connection.query('CREATE DATABASE IF NOT EXISTS mw_rag;');
    await connection.query('USE mw_rag;');

    console.log('Creating SaaS tables...');

    // Tenants table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS tenants (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        plan VARCHAR(100) DEFAULT 'Starter',
        status VARCHAR(50) DEFAULT 'Active',
        queries VARCHAR(100) DEFAULT '0 / 1K',
        storage VARCHAR(100) DEFAULT '0 GB',
        assistants INT DEFAULT 1,
        cost VARCHAR(100) DEFAULT '$0.00',
        last_active VARCHAR(100) DEFAULT 'Now',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role ENUM('super_admin', 'tenant_admin', 'tenant_user') DEFAULT 'tenant_admin',
        tenant_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Documents table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS documents (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tenant_id INT,
        file_name VARCHAR(255) NOT NULL,
        file_type VARCHAR(50) DEFAULT 'PDF',
        file_size VARCHAR(50) DEFAULT '1.0 MB',
        status VARCHAR(50) DEFAULT 'Indexed',
        uploaded_at VARCHAR(100) DEFAULT 'Sep 24',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Web Sources table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS web_sources (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tenant_id INT,
        url VARCHAR(500) NOT NULL,
        pages_indexed INT DEFAULT 0,
        sync_frequency VARCHAR(50) DEFAULT 'Daily',
        last_sync VARCHAR(100) DEFAULT '2h ago',
        errors INT DEFAULT 0,
        status VARCHAR(50) DEFAULT 'Active'
      );
    `);

    // Seed dummy users if empty
    const [userRows] = await connection.query('SELECT COUNT(*) as count FROM users');
    if (userRows[0].count === 0) {
      console.log('Seeding initial Super Admin and Tenant demo users...');
      await connection.query(`
        INSERT INTO users (email, password, name, role) VALUES
        ('admin@mediusware.ai', 'password', 'Super Admin', 'super_admin'),
        ('acme@mediusware.ai', 'password', 'Acme Corp Admin', 'tenant_admin');
      `);
      
      await connection.query(`
        INSERT INTO tenants (name, plan, status, queries, storage, assistants, cost, last_active) VALUES
        ('Acme Corp', 'Business', 'Active', '8,420 / 10K', '8.6 GB', 1, '$412.75', 'Sep 24'),
        ('TechFlow Inc', 'Growth', 'Active', '4,150 / 5K', '4.2 GB', 1, '$210.50', 'Sep 24');
      `);
    }

    console.log('✅ MySQL Database mw_rag initialized successfully!');
    await connection.end();
  } catch (err) {
    console.log('ℹ️ MySQL initialization note:', err.message);
    console.log('Application will seamlessly fallback to high-fidelity mock data mode!');
  }
}

main();
