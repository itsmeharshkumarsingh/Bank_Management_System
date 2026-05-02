CREATE DATABASE IF NOT EXISTS hks_bank_admin;
USE hks_bank_admin;

DROP TABLE IF EXISTS transaction_history;
DROP TABLE IF EXISTS customers;
DROP PROCEDURE IF EXISTS TransferMoney;

CREATE TABLE customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    account_no VARCHAR(20) UNIQUE NOT NULL,
    pin VARCHAR(255) NOT NULL,
    balance DECIMAL(15, 2) NOT NULL DEFAULT 0.00
);

CREATE TABLE transaction_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES customers(id),
    FOREIGN KEY (receiver_id) REFERENCES customers(id)
);

DELIMITER //
CREATE PROCEDURE TransferMoney(IN p_sender_id INT, IN p_receiver_id INT, IN p_amount DECIMAL(15,2))
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SELECT 'Transaction Failed: System Error' AS status;
    END;
    START TRANSACTION;
    SELECT balance INTO @sender_balance FROM customers WHERE id = p_sender_id FOR UPDATE;
    IF @sender_balance >= p_amount THEN
        UPDATE customers SET balance = balance - p_amount WHERE id = p_sender_id;
        UPDATE customers SET balance = balance + p_amount WHERE id = p_receiver_id;
        INSERT INTO transaction_history (sender_id, receiver_id, amount) VALUES (p_sender_id, p_receiver_id, p_amount);
        COMMIT;
        SELECT 'Transaction Successful' AS status;
    ELSE
        ROLLBACK;
        SELECT 'Transaction Failed: Insufficient Funds' AS status;
    END IF;
END //
DELIMITER ;

INSERT INTO customers (name, account_no, pin, balance) VALUES 
('HKS', '1001', '1234', 1208592.00),
('Alex', '1002', '5678', 8500.00),
('Cary', '1003', '619619', 5000.00),
('Graven', '1004', '619619', 4500.00);