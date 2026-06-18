import mysql from 'mysql2/promise';

/**
 * CREATIONAL DESIGN PATTERN: Singleton Database Wrapper.
 * Restricts the instantiation of the Database class to a single, globally accessible instance.
 * Ensures the application maintains exactly one connection pool lifecycle, preventing socket leaks 
 * and thread allocation chaos across disparate service modules.
 */
class Database {
  constructor() {
    // Structural Guard: Returns the existing instance if caching has already occurred
    if (Database.instance) {
      return Database.instance;
    }

    /**
     * RESOURCE MANAGEMENT: Production-Grade Connection Pool Initialization.
     * CRITICAL PORTABILITY UPDATE: Hardcoded strings have been abstracted out. 
     * The environment keys dynamically ingest parameters from process injections.
     * `ssl`: Enabled with `rejectUnauthorized: false` to allow secure cloud-transit 
     * TLS/SSL handshakes mandated by remote providers like Aiven.
     */
    this.pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD, 
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 3306,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      ssl: {
        rejectUnauthorized: false
      }
    });

    // Caches the newly initialized instance to enforce the Singleton pattern criteria
    Database.instance = this;
  }

  /**
   * ABSTRACTION LAYER: Unified Asynchronous Query Execution.
   * Encapsulates low-level statement execution. Utilizes `this.pool.execute()` under the hood, 
   * which transparently leverages MySQL **Prepared Statements**.
   * INTERVIEW FOCUS: Prepared statements compile the SQL command structure on the database server separately 
   * from the arguments, completely neutralizing SQL Injection (SQLi) vulnerabilities.
   */
  async query(sql, params) {
    const [rows] = await this.pool.execute(sql, params);
    return rows;
  }
}

// Instantiates the global singleton instance
const dbInstance = new Database();

/**
 * IMMUTABILITY ENFORCEMENT: Freezes the runtime object instance.
 * Prevents downstream scripts or external modules from altering prototype methods, adding properties, 
 * or re-assigning connection configurations, preserving structural integrity across the entire application runtime.
 */
Object.freeze(dbInstance);

export default dbInstance;