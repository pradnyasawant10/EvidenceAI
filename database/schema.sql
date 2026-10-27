-- =========================================================
-- EvidenceAI - Digital Evidence Management & AI Analysis System
-- Complete Database Schema (MySQL / MariaDB)
-- =========================================================

CREATE DATABASE IF NOT EXISTS evidence_ai CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE evidence_ai;

-- ---------------------------------------------------------
-- 1. ROLES TABLE
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS roles (
    role_id INT PRIMARY KEY AUTO_INCREMENT,
    role_name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed Initial Roles
INSERT INTO roles (role_id, role_name, description) VALUES
(1, 'Admin', 'Primary System Administrator with full security access'),
(2, 'Administrator', 'System Administrator with overall management privileges'),
(3, 'Investigator', 'Investigation Officer managing cases, evidence, and custody logs'),
(4, 'Forensic Officer', 'Digital Forensic Expert performing analysis and chain-of-custody tracking')
ON DUPLICATE KEY UPDATE role_name=VALUES(role_name);

-- ---------------------------------------------------------
-- 2. USERS TABLE
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    role_id INT NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20) DEFAULT NULL,
    badge_number VARCHAR(50) DEFAULT NULL,
    status ENUM('Active', 'Inactive', 'Suspended') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE CASCADE
);

-- Seed Default Admin User (Password: Admin@123)
-- Hash generated using werkzeug scrypt
INSERT INTO users (user_id, role_id, full_name, email, password, phone, badge_number, status) VALUES
(1, 1, 'Pradnya Sawant', 'pradnyasawant555@gmail.com', 'scrypt:32768:8:1$UL0nkbWflFfrK9qI$34a8c3136687477ef39221e424602cb9926f338334f74dd9b083c7cb4cbdac1e976154decb7e90e5f92bd5c6a66a85103fef7b437a25357e61005bf9ed25295c', '1234567891', 'EAI-ADMIN-01', 'Active'),
(2, 2, 'Administrator', 'admin@evidenceai.com', 'scrypt:32768:8:1$FuKjIGMOc2MyVHxx$cf7e3fb13269ede6cbbce3bb7ab33fea8686e1421337834bb3dee2cc207bf45f3c1918f26d597ef5b5498193b0208afc6290683a2673a2d838fef80f4d6f602b', '9876543210', 'EAI-SYS-02', 'Active'),
(3, 3, 'Tukaram Munde', 'tukaram.munde@evidenceai.com', 'scrypt:32768:8:1$m1QmT62ajh4TxzFT$03c455c48be4a45c460d4b6a376c6a3b6c5d599060768c0cafdc4792621cfc503bd6e3577b1bcd00fabc9e2d6ed782ab002879070ccd2be6c005c9026cc513ae', '9822012345', 'EAI-INV-03', 'Active'),
(4, 4, 'Dr. Sachin Sureshrao Bhosale', 'sachin.bhosale@evidenceai.com', 'scrypt:32768:8:1$PpSun5Vrem5e9fR0$f9147faa8f4a57276d50453f6f7862f77ca940c2563ff6812c6400bf20da14041f263f9e2fb2712e27c8d3ca6270fa6d08275483b83e1425bd8e55933571f8e4', '9890123456', 'EAI-FOR-04', 'Active')
ON DUPLICATE KEY UPDATE email=VALUES(email);

-- ---------------------------------------------------------
-- 3. CASES TABLE
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS cases (
    case_id INT PRIMARY KEY AUTO_INCREMENT,
    case_number VARCHAR(50) NOT NULL UNIQUE,
    case_title VARCHAR(255) NOT NULL,
    description TEXT,
    crime_type VARCHAR(100) DEFAULT 'Digital Forensics',
    incident_date DATETIME DEFAULT NULL,
    location VARCHAR(255) DEFAULT NULL,
    status ENUM('Open', 'Under Investigation', 'Pending Review', 'Closed') DEFAULT 'Open',
    priority ENUM('Low', 'Medium', 'High', 'Critical') DEFAULT 'Medium',
    officer_id INT DEFAULT NULL,
    created_by INT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (officer_id) REFERENCES users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL
);

-- ---------------------------------------------------------
-- 4. EVIDENCE TABLE
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS evidence (
    evidence_id INT PRIMARY KEY AUTO_INCREMENT,
    evidence_number VARCHAR(50) NOT NULL UNIQUE,
    case_id INT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT DEFAULT 0,
    file_hash VARCHAR(128) NOT NULL,
    evidence_type VARCHAR(50) NOT NULL,
    description TEXT,
    source_device VARCHAR(255) DEFAULT 'Digital Seizure',
    uploaded_by INT DEFAULT NULL,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'Stored Securely',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (case_id) REFERENCES cases(case_id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(user_id) ON DELETE SET NULL
);

-- ---------------------------------------------------------
-- 5. AI ANALYSIS TABLE
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS ai_analysis (
    analysis_id INT PRIMARY KEY AUTO_INCREMENT,
    evidence_id INT NOT NULL,
    analysis_type VARCHAR(50) NOT NULL,
    result LONGTEXT,
    confidence FLOAT DEFAULT 0,
    model_name VARCHAR(100) DEFAULT 'EvidenceAI Multi-Modal',
    status VARCHAR(50) DEFAULT 'Completed',
    analyzed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (evidence_id) REFERENCES evidence(evidence_id) ON DELETE CASCADE
);

-- ---------------------------------------------------------
-- 6. CHAIN OF CUSTODY TABLE
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS chain_of_custody (
    custody_id INT PRIMARY KEY AUTO_INCREMENT,
    evidence_id INT NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    performed_by INT DEFAULT NULL,
    action_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    FOREIGN KEY (evidence_id) REFERENCES evidence(evidence_id) ON DELETE CASCADE,
    FOREIGN KEY (performed_by) REFERENCES users(user_id) ON DELETE SET NULL
);

-- ---------------------------------------------------------
-- 7. ACTIVITY LOGS TABLE
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS activity_logs (
    log_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT DEFAULT NULL,
    action_type VARCHAR(100) NOT NULL,
    module_name VARCHAR(100) NOT NULL,
    description TEXT,
    case_id INT DEFAULT NULL,
    evidence_id INT DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (case_id) REFERENCES cases(case_id) ON DELETE SET NULL,
    FOREIGN KEY (evidence_id) REFERENCES evidence(evidence_id) ON DELETE SET NULL
);

-- ---------------------------------------------------------
-- 8. CASE NOTES TABLE
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS case_notes (
    note_id INT PRIMARY KEY AUTO_INCREMENT,
    case_id INT NOT NULL,
    user_id INT DEFAULT NULL,
    note_text TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (case_id) REFERENCES cases(case_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
);

-- ---------------------------------------------------------
-- 9. REPORTS TABLE
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS reports (
    report_id INT PRIMARY KEY AUTO_INCREMENT,
    case_id INT NOT NULL,
    report_title VARCHAR(255) NOT NULL,
    report_type VARCHAR(100) DEFAULT 'Investigation',
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    generated_by INT DEFAULT NULL,
    generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'Generated',
    FOREIGN KEY (case_id) REFERENCES cases(case_id) ON DELETE CASCADE,
    FOREIGN KEY (generated_by) REFERENCES users(user_id) ON DELETE SET NULL
);

