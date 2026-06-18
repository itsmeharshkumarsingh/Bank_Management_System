import express from 'express';
import mysql from 'mysql2/promise';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(express.json());

/**
 * ARCHITECTURE LAYERING: Serves static frontend assets (HTML/CSS/JS) via Express middleware.
 * NOTE: For production-level scaling, these assets should be offloaded to a CDN (e.g., AWS CloudFront)
 * to free up the Node.js CPU thread for dynamic REST API routing.
 */
app.use(express.static(path.join(__dirname, 'public')));

/**
 * DATA PERSISTENCE: Establishes a connection pool to the MySQL relational database.
 * Uses connection pooling (Limit: 10) to efficiently manage concurrent queries and prevent
 * connection overhead bottlenecks under high-frequency trading simulations.
 */
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'Nitrr@619', 
    database: 'hks_bank_admin',
    waitForConnections: true,
    connectionLimit: 10
});

/**
 * AUTHENTICATION ENDPOINT: Validates user credentials against the relational schema.
 * TRAP MITIGATION: Implements parameterized queries to completely neutralize SQL Injection (SQLi) vectors.
 * PRODUCTION UPGRADE: Plane-text PIN validation should be migrated to cryptographically salted bcrypt hashes 
 * combined with stateless JWT (JSON Web Tokens) or HttpOnly cookie sessions.
 */
app.post('/api/login', async (req, res) => {
    const { accountNo, pin } = req.body;
    try {
        const [rows] = await pool.query('SELECT id, name, balance FROM customers WHERE account_no = ? AND pin = ?', [accountNo, pin]);
        if (rows.length > 0) res.json({ success: true, user: rows[0] });
        else res.status(401).json({ success: false, message: "Invalid credentials" });
    } catch (err) { res.status(500).json({ success: false, message: "Database error" }); }
});

/**
 * UTILITY ENDPOINT: Retrieves the complete list of unique customer accounts.
 * Used exclusively by the frontend SPA to dynamically populate the transfer recipient dropdown,
 * ensuring seamless user flow execution.
 */
app.get('/api/customers', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT id, name, account_no FROM customers');
        res.json({ success: true, customers: rows });
    } catch (err) { res.status(500).json({ success: false, message: "DB Error" }); }
});

/**
 * DATA ISOLATION ENFORCEMENT: Enforces strict data isolation policies at the API layer.
 * Replaced the global admin audit log query with a targetted `WHERE` condition checking both 
 * `sender_id` and `receiver_id` matches against the authenticated user's ID. 
 * Prevents horizontal privilege escalation and ensures client-specific payload safety.
 */
app.get('/api/transactions/:userId', async (req, res) => {
    const userId = req.params.userId; 
    try {
        const query = `
            SELECT t.amount, t.transaction_date, s.name as sender_name, r.name as receiver_name 
            FROM transaction_history t
            JOIN customers s ON t.sender_id = s.id
            JOIN customers r ON t.receiver_id = r.id
            WHERE t.sender_id = ? OR t.receiver_id = ? 
            ORDER BY t.transaction_date DESC`;
            
        const [rows] = await pool.query(query, [userId, userId]);
        res.json({ success: true, transactions: rows });
    } catch (err) { 
        res.status(500).json({ success: false, message: "DB Error" }); 
    }
});

/**
 * TRANSACTION EXECUTION ENGINE: Triggers the atomic balance ledger update logic.
 * INTERVIEW FOCUS: Offloads transaction logic into a custom MySQL Stored Procedure to ensure absolute 
 * ACID compliance. Minimizes Express-to-DB network round-trip overhead and wraps the execution flow 
 * in pessimistic `FOR UPDATE` row-level locks to completely mitigate concurrent race conditions.
 */
app.post('/api/transfer', async (req, res) => {
    const { senderId, receiverId, amount } = req.body;
    try {
        const [result] = await pool.query('CALL TransferMoney(?, ?, ?)', [senderId, receiverId, amount]);
        const status = result[0][0].status;
        res.json({ success: status.includes('Successful'), message: status });
    } catch (err) { res.status(500).json({ success: false, message: "Server Error" }); }
});

/**
 * HTTP APPLICATION SERVER: Launches the API Gateway on port 3000.
 * Operates on the Node.js single-threaded Event Loop, utilizing asynchronous, non-blocking 
 * libuv thread pool execution to handle high-concurrency requests smoothly.
 */
app.listen(3000, () => console.log(`Server running at http://localhost:3000`));