-- ============================================================================
-- ElectroStock Enterprise Electronics Inventory & ERP Management System
-- Production Database Schema (Compatible with PostgreSQL, MySQL, MariaDB, SQLite)
-- ============================================================================

-- Drop existing tables if re-initializing (in reverse dependency order)
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS system_settings;
DROP TABLE IF EXISTS sales_receipt_items;
DROP TABLE IF EXISTS sales_receipts;
DROP TABLE IF EXISTS purchase_order_items;
DROP TABLE IF EXISTS purchase_orders;
DROP TABLE IF EXISTS warranty_claims;
DROP TABLE IF EXISTS warranties;
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS serial_imei;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS suppliers;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;

-- 1. USERS & ROLES
CREATE TABLE users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'staff',
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. CATEGORIES
CREATE TABLE categories (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. SUPPLIERS
CREATE TABLE suppliers (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    gstin VARCHAR(50),
    payment_terms VARCHAR(100),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. PRODUCTS & INVENTORY
CREATE TABLE products (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100) NOT NULL UNIQUE,
    category_id VARCHAR(64) REFERENCES categories(id) ON DELETE SET NULL,
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    supplier_id VARCHAR(64) REFERENCES suppliers(id) ON DELETE SET NULL,
    stock INT NOT NULL DEFAULT 0,
    min_stock INT NOT NULL DEFAULT 5,
    purchase_price DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    selling_price DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    warranty_period_months INT NOT NULL DEFAULT 0,
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. SERIAL & IMEI TRACKING
CREATE TABLE serial_imei (
    id VARCHAR(64) PRIMARY KEY,
    product_id VARCHAR(64) REFERENCES products(id) ON DELETE CASCADE,
    product_name VARCHAR(255) NOT NULL,
    serial_number VARCHAR(100) NOT NULL UNIQUE,
    imei VARCHAR(100),
    status VARCHAR(50) NOT NULL DEFAULT 'available',
    warranty_id VARCHAR(64),
    date_added TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_sold TIMESTAMP,
    customer_ref VARCHAR(255)
);

-- 6. TRANSACTIONS
CREATE TABLE transactions (
    id VARCHAR(64) PRIMARY KEY,
    product_id VARCHAR(64) REFERENCES products(id) ON DELETE SET NULL,
    product_name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(12,2) NOT NULL,
    total_value DECIMAL(12,2) NOT NULL,
    purchase_cost DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    profit_loss DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id VARCHAR(64),
    user_name VARCHAR(255),
    reference VARCHAR(100),
    customer_ref VARCHAR(255),
    notes TEXT
);

-- 7. WARRANTIES
CREATE TABLE warranties (
    id VARCHAR(64) PRIMARY KEY,
    product_id VARCHAR(64) REFERENCES products(id) ON DELETE SET NULL,
    product_name VARCHAR(255) NOT NULL,
    serial_number VARCHAR(100) NOT NULL,
    customer_ref VARCHAR(255) NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255),
    customer_phone VARCHAR(50),
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    notes TEXT
);

-- 8. WARRANTY CLAIMS
CREATE TABLE warranty_claims (
    id VARCHAR(64) PRIMARY KEY,
    warranty_id VARCHAR(64) REFERENCES warranties(id) ON DELETE CASCADE,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    issue_description TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'in_repair',
    resolution_notes TEXT
);

-- 9. PURCHASE ORDERS
CREATE TABLE purchase_orders (
    id VARCHAR(64) PRIMARY KEY,
    po_number VARCHAR(100) NOT NULL UNIQUE,
    supplier_id VARCHAR(64) REFERENCES suppliers(id) ON DELETE SET NULL,
    supplier_name VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    total_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    items_count INT NOT NULL DEFAULT 0,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expected_delivery TIMESTAMP,
    received_date TIMESTAMP,
    notes TEXT,
    created_by VARCHAR(255)
);

CREATE TABLE purchase_order_items (
    id VARCHAR(64) PRIMARY KEY,
    po_id VARCHAR(64) REFERENCES purchase_orders(id) ON DELETE CASCADE,
    product_id VARCHAR(64) REFERENCES products(id) ON DELETE SET NULL,
    product_name VARCHAR(255) NOT NULL,
    sku VARCHAR(100) NOT NULL,
    quantity INT NOT NULL,
    received_quantity INT DEFAULT 0,
    unit_cost DECIMAL(12,2) NOT NULL,
    total_cost DECIMAL(12,2) NOT NULL
);

-- 10. SALES RECEIPTS
CREATE TABLE sales_receipts (
    id VARCHAR(64) PRIMARY KEY,
    receipt_number VARCHAR(100) NOT NULL UNIQUE,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50),
    customer_email VARCHAR(255),
    customer_address TEXT,
    subtotal DECIMAL(12,2) NOT NULL,
    discount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    grand_total DECIMAL(12,2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL DEFAULT 'cash',
    cashier_id VARCHAR(64),
    cashier_name VARCHAR(255),
    total_items INT NOT NULL DEFAULT 1
);

CREATE TABLE sales_receipt_items (
    id VARCHAR(64) PRIMARY KEY,
    receipt_id VARCHAR(64) REFERENCES sales_receipts(id) ON DELETE CASCADE,
    product_id VARCHAR(64),
    sku VARCHAR(100) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    brand VARCHAR(100),
    model VARCHAR(100),
    quantity INT NOT NULL,
    unit_price DECIMAL(12,2) NOT NULL,
    discount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    total DECIMAL(12,2) NOT NULL,
    warranty_period_months INT DEFAULT 0
);

-- 11. SYSTEM SETTINGS
CREATE TABLE system_settings (
    id VARCHAR(64) PRIMARY KEY,
    store_name VARCHAR(255) DEFAULT 'ElectroStock',
    store_email VARCHAR(255) DEFAULT 'support@electrostock.com',
    store_phone VARCHAR(50) DEFAULT '+91 98765 43210',
    store_address TEXT,
    currency VARCHAR(10) DEFAULT 'INR',
    currency_symbol VARCHAR(10) DEFAULT '₹',
    tax_rate DECIMAL(5,2) DEFAULT 18.00,
    low_stock_threshold_default INT DEFAULT 5,
    auto_alert_low_stock BOOLEAN DEFAULT TRUE,
    auto_alert_expiring_warranty BOOLEAN DEFAULT TRUE,
    warranty_expiry_warning_days INT DEFAULT 30,
    enable_sound_alerts BOOLEAN DEFAULT TRUE,
    theme VARCHAR(20) DEFAULT 'system'
);

-- 12. AUDIT LOGS
CREATE TABLE audit_logs (
    id VARCHAR(64) PRIMARY KEY,
    action VARCHAR(100) NOT NULL,
    action_label VARCHAR(255) NOT NULL,
    user_name VARCHAR(255),
    user_id VARCHAR(64),
    user_role VARCHAR(50),
    date VARCHAR(20),
    time VARCHAR(20),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    related_id VARCHAR(100),
    description TEXT,
    ip_address VARCHAR(50)
);
