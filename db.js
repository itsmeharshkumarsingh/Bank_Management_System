import mysql from 'mysql2/promise';

class Database {
  constructor() {
    if (Database.instance) {
      return Database.instance;
    }

    this.pool = mysql.createPool({
      host: 'localhost',
      user: 'root',
      password: 'Nitrr@619', // Update this
      database: 'bank_management',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    Database.instance = this;
  }

  async query(sql, params) {
    const [rows] = await this.pool.execute(sql, params);
    return rows;
  }
}

const dbInstance = new Database();
Object.freeze(dbInstance);
export default dbInstance;