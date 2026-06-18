/**
 * DATABASE NAMESPACE ADJUSTMENT: Managed Target Context.
 * Using Aiven's pre-configured primary instance 'defaultdb' to align with cloud infrastructure boundaries.
 * Cascades drop dependencies in exact reverse constraint order to cleanly reset state.
 */
USE defaultdb;

DROP TABLE IF EXISTS transaction_history;
DROP TABLE IF EXISTS customers;
DROP PROCEDURE IF EXISTS TransferMoney;

/**
 * SCHEMA DEFINITION: Core Entities Domain Layout.
 * Configures the master user directory with precise relational primitives.
 * `balance`: Employs exact numeric type fixed-point parameters (`DECIMAL(15, 2)`) rather than 
 * floating-point approximations (`FLOAT`/`DOUBLE`) to completely eliminate binary precision rounding errors.
 */
CREATE TABLE customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    account_no VARCHAR(20) UNIQUE NOT NULL, -- Logical uniquely indexed structural attribute
    pin VARCHAR(255) NOT NULL,              -- Allocated footprint to accommodate future cryptographical hash strings
    balance DECIMAL(15, 2) NOT NULL DEFAULT 0.00
);

/**
 * SCHEMA DEFINITION: Historical Ledger Audit Log.
 * Records sequential transaction events via relational structural binding mappings.
 * INTERVIEW FOCUS: Enforces data normalization patterns by relying on numeric reference constraints 
 * (`FOREIGN KEY`) checking back to the main user directory. Keeps records consistent and ensures 
 * orphans are blocked at the relational database engine level.
 */
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

/**
 * ATOMIC TRANSACTION INTERFACE: Encapsulated Currency Allocation Protocol.
 * Offloads state alteration steps from the Node.js API server straight into a MySQL Stored Procedure.
 * Optimizes performance by executing calculations within the local engine memory footprint, 
 * slashing round-trip serialization latencies to a single command execution cycle.
 */
CREATE PROCEDURE TransferMoney(IN p_sender_id INT, IN p_receiver_id INT, IN p_amount DECIMAL(15,2))
BEGIN
    /**
     * ERROR HANDLING BLOCK: Centralized Catch Invariant.
     * Declares an explicit `SQLEXCEPTION` exit routine acting as a native transaction safety firewall.
     * Guarantees total data atomicity; if a hardware connection drop, deadlock timeout, or physical disk error 
     * occurs at any step, the block triggers an immediate database `ROLLBACK` to revert state.
     */
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SELECT 'Transaction Failed: System Error' AS status;
    END;

    -- Initiates the formal transaction boundary loop boundary
    START TRANSACTION;

    /**
     * PESSIMISTIC CONCURRENCY CONTROL: Multi-User Locking Execution.
     * INTERVIEW FOCUS: Uses the `FOR UPDATE` modifier to explicitly assign exclusive write locks 
     * on the sender account record row. Concurrent transfer actions targeting this precise account identifier 
     * are instantly forced into a queue, eliminating race conditions and double-spending scenarios.
     */
    SELECT balance INTO @sender_balance FROM customers WHERE id = p_sender_id FOR UPDATE;

    -- Business Logic Invariant Validation Step
    IF @sender_balance >= p_amount THEN
        -- Atomic Operation Sequence: Deduct capital asset balances from sender context
        UPDATE customers SET balance = balance - p_amount WHERE id = p_sender_id;
        
        -- Atomic Operation Sequence: Accumulate capital asset balances into recipient context
        UPDATE customers SET balance = balance + p_amount WHERE id = p_receiver_id;
        
        -- Audit Persistence: Logs ledger events to keep an unalterable history trail
        INSERT INTO transaction_history (sender_id, receiver_id, amount) VALUES (p_sender_id, p_receiver_id, p_amount);
        
        -- Persists all modifications to the storage layer, releasing the row-level locks
        COMMIT;
        SELECT 'Transaction Successful' AS status;
    ELSE
        -- Condition Guard Failure: Terminate execution paths and drop lock allocations
        ROLLBACK;
        SELECT 'Transaction Failed: Insufficient Funds' AS status;
    END IF;
END //

DELIMITER ;

/**
 * DATA SEED LAYER: Mock Initialization States.
 * populates the verified schema context with standard test profiles.
 * Sets distinct ledger asset distributions to test execution logic boundaries under local environments.
 */
INSERT INTO customers (name, account_no, pin, balance) VALUES 
('HKS', '1001', '1234', 1208592.00),
('Alex', '1002', '5678', 8500.00),
('Cary', '1003', '619619', 5000.00),
('Graven', '1004', '619619', 4500.00);