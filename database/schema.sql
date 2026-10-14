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

-- ============================================================================
-- 1. USERS & ROLES
-- ============================================================================
CREATE TABLE users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'staff', -- 'admin', 'manager', 'cashier', 'staff'
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- 'active', 'inactive'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ============================================================================
-- 2. CATEGORIES
-- ============================================================================
CREATE TABLE categories (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 3. SUPPLIERS
-- ============================================================================
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

CREATE INDEX idx_suppliers_company ON suppliers(company);

-- ============================================================================
-- 4. PRODUCTS & INVENTORY
-- ============================================================================
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

CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_brand ON products(brand);
CREATE INDEX idx_products_stock ON products(stock);

-- ============================================================================
-- 5. SERIAL & IMEI TRACKING
-- ============================================================================
CREATE TABLE serial_imei (
    id VARCHAR(64) PRIMARY KEY,
    product_id VARCHAR(64) REFERENCES products(id) ON DELETE CASCADE,
    product_name VARCHAR(255) NOT NULL,
    serial_number VARCHAR(100) NOT NULL UNIQUE,
    imei VARCHAR(100),
    status VARCHAR(50) NOT NULL DEFAULT 'available', -- 'available', 'sold', 'defective', 'in_repair'
    warranty_id VARCHAR(64),
    date_added TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_sold TIMESTAMP,
    customer_ref VARCHAR(255)
);

CREATE INDEX idx_serials_product ON serial_imei(product_id);
CREATE INDEX idx_serials_serial_number ON serial_imei(serial_number);
CREATE INDEX idx_serials_imei ON serial_imei(imei);
CREATE INDEX idx_serials_status ON serial_imei(status);

-- ============================================================================
-- 6. STOCK TRANSACTIONS (AUDIT TRAIL)
-- ============================================================================
CREATE TABLE transactions (
    id VARCHAR(64) PRIMARY KEY,
    product_id VARCHAR(64) REFERENCES products(id) ON DELETE SET NULL,
    product_name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'stock_in', 'stock_out', 'adjustment', 'return'
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

CREATE INDEX idx_transactions_product ON transactions(product_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_date ON transactions(date);

-- ============================================================================
-- 7. WARRANTIES & DIGITAL CERTIFICATES
-- ============================================================================
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
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- 'active', 'expiring_soon', 'expired'
    notes TEXT
);

CREATE INDEX idx_warranties_serial ON warranties(serial_number);
CREATE INDEX idx_warranties_status ON warranties(status);
CREATE INDEX idx_warranties_end_date ON warranties(end_date);

-- ============================================================================
-- 8. WARRANTY CLAIMS & REPAIRS
-- ============================================================================
CREATE TABLE warranty_claims (
    id VARCHAR(64) PRIMARY KEY,
    warranty_id VARCHAR(64) REFERENCES warranties(id) ON DELETE CASCADE,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    issue_description TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'in_repair', -- 'in_repair', 'replaced', 'resolved', 'rejected'
    resolution_notes TEXT
);

CREATE INDEX idx_claims_warranty ON warranty_claims(warranty_id);

-- ============================================================================
-- 9. PURCHASE ORDERS
-- ============================================================================
CREATE TABLE purchase_orders (
    id VARCHAR(64) PRIMARY KEY,
    po_number VARCHAR(100) NOT NULL UNIQUE,
    supplier_id VARCHAR(64) REFERENCES suppliers(id) ON DELETE SET NULL,
    supplier_name VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'draft', 'pending', 'approved', 'received', 'cancelled'
    total_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    items_count INT NOT NULL DEFAULT 0,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expected_delivery TIMESTAMP,
    received_date TIMESTAMP,
    notes TEXT,
    created_by VARCHAR(255)
);

CREATE INDEX idx_po_supplier ON purchase_orders(supplier_id);
CREATE INDEX idx_po_status ON purchase_orders(status);

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

CREATE INDEX idx_po_items_po ON purchase_order_items(po_id);

-- ============================================================================
-- 10. SALES RECEIPTS & POS CHECKOUT
-- ============================================================================
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
    payment_method VARCHAR(50) NOT NULL DEFAULT 'cash', -- 'cash', 'upi', 'card', 'bank_transfer'
    cashier_id VARCHAR(64),
    cashier_name VARCHAR(255),
    total_items INT NOT NULL DEFAULT 1
);

CREATE INDEX idx_receipts_number ON sales_receipts(receipt_number);
CREATE INDEX idx_receipts_date ON sales_receipts(date);

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

CREATE INDEX idx_receipt_items_receipt ON sales_receipt_items(receipt_id);

-- ============================================================================
-- 11. SYSTEM SETTINGS
-- ============================================================================
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

-- ============================================================================
-- 12. AUDIT LOGS
-- ============================================================================
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

CREATE INDEX idx_audit_timestamp ON audit_logs(timestamp);
CREATE INDEX idx_audit_action ON audit_logs(action);

-- ============================================================================
-- 13. SEED DATA (INITIAL PRODUCTION DEFAULTS & DEMO CATALOG)
-- ============================================================================

INSERT INTO users (id, name, email, password_hash, role, status) VALUES
('usr-admin', 'Administrator', 'admin@electrostock.com', 'admin123', 'admin', 'active'),
('usr-manager', 'Priya Sharma (Manager)', 'manager@electrostock.com', 'manager123', 'manager', 'active'),
('usr-cashier', 'shradhal kumavat', 'staff@electrostock.com', 'staff123', 'cashier', 'active'),
('usr-staff', 'Amit Patel (Technician)', 'technician@electrostock.com', 'tech123', 'staff', 'active');

INSERT INTO categories (id, name, description) VALUES
('cat-1', 'Smartphones & Tablets', 'Premium mobile devices, tablets, iPads, and cellular devices.'),
('cat-2', 'Smart TVs & Displays', '4K Ultra HD, OLED, and Crystal LED Smart TVs & monitors.'),
('cat-3', 'Laptops & Workstations', 'Ultrabooks, gaming rigs, and high-performance developer machines.'),
('cat-4', 'Audio & Soundbars', 'Wireless noise-canceling headphones, Bluetooth speakers & Dolby Atmos soundbars.'),
('cat-5', 'Smart Home & Wearables', 'Smartwatches, fitness bands, voice assistants & automation hubs.');

INSERT INTO suppliers (id, name, company, email, phone, address, gstin, payment_terms, status) VALUES
('sup-1', 'Rajesh Gupta', 'Samsung Electronics India Pvt Ltd', 'orders@samsung-india.com', '+91 98111 22334', 'Cyber City, Phase 2, Gurugram, Haryana', '06AAACS1234F1Z5', 'Net 30', 'active'),
('sup-2', 'Anil Mehta', 'Apple Distribution India Ltd', 'b2b@apple-dist.in', '+91 98222 33445', 'BKC Commercial Hub, Bandra East, Mumbai', '27AABCA5678D1Z2', 'Net 15', 'active'),
('sup-3', 'Suresh Reddy', 'Sony Electronics Distribution Hub', 'sales@sony-hub.co.in', '+91 98333 44556', 'Electronic City, Phase 1, Bangalore, Karnataka', '29AABCS9012E1Z8', 'Net 45', 'active');

INSERT INTO products (id, name, sku, category_id, brand, model, supplier_id, stock, min_stock, purchase_price, selling_price, warranty_period_months, description) VALUES
('prod-1', 'Samsung 55" Crystal 4K Smart TV', 'SAM-TV-55-C4K', 'cat-2', 'Samsung', 'UA55CUE70AKLXL', 'sup-1', 12, 3, 34500.00, 42000.00, 0, 'Ultra HD 4K LED Smart TV with PurColor display and HDR10+ support.'),
('prod-2', 'Apple iPhone 15 (128GB - Blue)', 'APL-IPH15-128-BLU', 'cat-1', 'Apple', 'A3090', 'sup-2', 8, 4, 65000.00, 74900.00, 12, 'Dynamic Island, 48MP Main camera, and USB-C connectivity.'),
('prod-3', 'Sony WH-1000XM5 Noise Canceling Headphones', 'SNY-WH5-BLK', 'cat-4', 'Sony', 'WH1000XM5/B', 'sup-3', 15, 5, 21000.00, 26990.00, 12, 'Industry-leading noise cancellation with Auto NC Optimizer and 30-hour battery life.'),
('prod-4', 'HP Pavilion 14 Laptop (Core i5, 16GB, 512GB SSD)', 'HP-PAV14-I5-16', 'cat-3', 'HP', '14-dv2014TU', 'sup-1', 5, 3, 52000.00, 62500.00, 24, 'FHD IPS Micro-Edge display, Intel Iris Xe graphics, and backlit keyboard.');

INSERT INTO system_settings (id, store_name, store_email, store_phone, store_address, currency, currency_symbol, tax_rate, low_stock_threshold_default, auto_alert_low_stock, auto_alert_expiring_warranty, warranty_expiry_warning_days, enable_sound_alerts, theme) VALUES
('set-1', 'ElectroStock Inventory & POS', 'support@electrostock.com', '+91 98765 43210', 'Shop 42, Electronic Market, MG Road, Bangalore 560001', 'INR', '₹', 18.00, 5, TRUE, TRUE, 30, TRUE, 'system');
