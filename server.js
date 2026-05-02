import express from 'express';
import mysql from 'mysql2/promise';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(express.json());
// This line tells the server to look inside the 'public' folder for your HTML/CSS/JS
app.use(express.static(path.join(__dirname, 'public')));

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'Nitrr@619', 
    database: 'hks_bank_admin',
    waitForConnections: true,
    connectionLimit: 10
});

app.post('/api/login', async (req, res) => {
    const { accountNo, pin } = req.body;
    try {
        const [rows] = await pool.query('SELECT id, name, balance FROM customers WHERE account_no = ? AND pin = ?', [accountNo, pin]);
        if (rows.length > 0) res.json({ success: true, user: rows[0] });
        else res.status(401).json({ success: false, message: "Invalid credentials" });
    } catch (err) { res.status(500).json({ success: false, message: "Database error" }); }
});

app.get('/api/customers', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT id, name, account_no FROM customers');
        res.json({ success: true, customers: rows });
    } catch (err) { res.status(500).json({ success: false, message: "DB Error" }); }
});

// Ensure this is the ONLY /api/transactions route in your server.js
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

app.post('/api/transfer', async (req, res) => {
    const { senderId, receiverId, amount } = req.body;
    try {
        const [result] = await pool.query('CALL TransferMoney(?, ?, ?)', [senderId, receiverId, amount]);
        const status = result[0][0].status;
        res.json({ success: status.includes('Successful'), message: status });
    } catch (err) { res.status(500).json({ success: false, message: "Server Error" }); }
});

app.listen(3000, () => console.log(`Server running at http://localhost:3000`));