# High-Concurrency Bank Management System

A robust, full-stack implementation of a financial transaction ledger. Built to handle concurrency and data integrity issues inherent in distributed systems, this application leverages advanced SQL features alongside a non-blocking Node.js architecture.

## 🎯 About The Project

Building a banking system is trivial; building a banking system that doesn't break under concurrent load is engineering.

**The Problem:** In a standard `UPDATE` based system, two simultaneous transactions involving the same account will cause a Race Condition, leading to data corruption and phantom balances.

**The Solution:** This architecture implements strict **ACID transactions** via SQL Stored Procedures and utilizes **Row-Level Locking (`FOR UPDATE`)** to freeze database rows during execution, ensuring absolute mathematical integrity during fund transfers.

## ✨ Features

*   **Concurrency Safe:** Handles simultaneous requests safely using DB-level row locks.
*   **Singleton Connection Pooling:** Centralized MySQL connection pool limits socket connections, preventing memory leaks and mimicking the efficiency of static classes in C++.
*   **Custom Rate Limiting:** Built-in Express middleware to throttle API requests and mitigate brute-force attacks.
*   **Asynchronous Non-Blocking I/O:** Fully utilizes JavaScript `Promises` and `async/await` to ensure the Node Event Loop remains unblocked during heavy DB queries.
*   **Glassmorphism UI:** A modern, responsive frontend using CSS backdrops and the Fetch API for seamless, page-refresh-free data updates.

## 🚀 Getting Started

1. **Clone & Install:**
   ```bash
   git clone [https://github.com/itsmeharshkumarsingh/Secure-Bank-System.git](https://github.com/itsmeharshkumarsingh/Secure-Bank-System.git)
   cd Secure-Bank-System
   npm install