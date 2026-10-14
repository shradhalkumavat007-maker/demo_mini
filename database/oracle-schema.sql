-- ============================================================================
-- ElectroStock Enterprise Electronics Inventory & ERP Management System
-- Production Oracle Database Schema & Seed Data (Oracle 10g / 11g / 19c / XE)
-- Target User: system / 123456
-- ============================================================================

SET DEFINE OFF;
SET FEEDBACK ON;
SET ECHO OFF;
SET LINESIZE 250;
SET PAGESIZE 100;

PROMPT [1/6] Cleaning up old ElectroStock tables if present...

BEGIN
   FOR c IN (
       SELECT table_name FROM user_tables 
       WHERE table_name IN (
           'AUDIT_LOGS', 'SYSTEM_SETTINGS', 'SALES_RECEIPT_ITEMS', 'SALES_RECEIPTS',
           'PURCHASE_ORDER_ITEMS', 'PURCHASE_ORDERS', 'WARRANTY_CLAIMS', 'WARRANTIES',
           'TRANSACTIONS', 'SERIAL_IMEI', 'PRODUCTS', 'SUPPLIERS', 'CATEGORIES', 'USERS'
       )
   ) LOOP
      EXECUTE IMMEDIATE 'DROP TABLE ' || c.table_name || ' CASCADE CONSTRAINTS';
   END LOOP;
END;
/

PROMPT [2/6] Creating Oracle Database Tables...

-- 1. USERS
CREATE TABLE users (
    id VARCHAR2(64) PRIMARY KEY,
    name VARCHAR2(255) NOT NULL,
    email VARCHAR2(255) NOT NULL UNIQUE,
    password_hash VARCHAR2(255) NOT NULL,
    role VARCHAR2(50) DEFAULT 'staff' NOT NULL,
    status VARCHAR2(50) DEFAULT 'active' NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. CATEGORIES
CREATE TABLE categories (
    id VARCHAR2(64) PRIMARY KEY,
    name VARCHAR2(255) NOT NULL UNIQUE,
    description VARCHAR2(1000),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. SUPPLIERS
CREATE TABLE suppliers (
    id VARCHAR2(64) PRIMARY KEY,
    name VARCHAR2(255) NOT NULL,
    company VARCHAR2(255) NOT NULL,
    email VARCHAR2(255),
    phone VARCHAR2(50),
    address VARCHAR2(1000),
    gstin VARCHAR2(50),
    payment_terms VARCHAR2(100),
    status VARCHAR2(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_suppliers_company ON suppliers(company);

-- 4. PRODUCTS & INVENTORY
CREATE TABLE products (
    id VARCHAR2(64) PRIMARY KEY,
    name VARCHAR2(255) NOT NULL,
    sku VARCHAR2(100) NOT NULL UNIQUE,
    category_id VARCHAR2(64) REFERENCES categories(id) ON DELETE SET NULL,
    brand VARCHAR2(100) NOT NULL,
    model VARCHAR2(100) NOT NULL,
    supplier_id VARCHAR2(64) REFERENCES suppliers(id) ON DELETE SET NULL,
    stock NUMBER(10) DEFAULT 0 NOT NULL,
    min_stock NUMBER(10) DEFAULT 5 NOT NULL,
    purchase_price NUMBER(12,2) DEFAULT 0.00 NOT NULL,
    selling_price NUMBER(12,2) DEFAULT 0.00 NOT NULL,
    warranty_period_months NUMBER(10) DEFAULT 0 NOT NULL,
    description VARCHAR2(2000),
    image_url VARCHAR2(1000),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_brand ON products(brand);
CREATE INDEX idx_products_stock ON products(stock);

-- 5. SERIAL & IMEI TRACKING
CREATE TABLE serial_imei (
    id VARCHAR2(64) PRIMARY KEY,
    product_id VARCHAR2(64) REFERENCES products(id) ON DELETE CASCADE,
    product_name VARCHAR2(255) NOT NULL,
    serial_number VARCHAR2(100) NOT NULL UNIQUE,
    imei VARCHAR2(100),
    status VARCHAR2(50) DEFAULT 'available' NOT NULL,
    warranty_id VARCHAR2(64),
    date_added TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_sold TIMESTAMP,
    customer_ref VARCHAR2(255)
);

CREATE INDEX idx_serials_product ON serial_imei(product_id);
CREATE INDEX idx_serials_status ON serial_imei(status);

-- 6. STOCK TRANSACTIONS (AUDIT TRAIL)
CREATE TABLE transactions (
    id VARCHAR2(64) PRIMARY KEY,
    product_id VARCHAR2(64) REFERENCES products(id) ON DELETE SET NULL,
    product_name VARCHAR2(255) NOT NULL,
    type VARCHAR2(50) NOT NULL,
    quantity NUMBER(10) NOT NULL,
    unit_price NUMBER(12,2) NOT NULL,
    total_value NUMBER(12,2) NOT NULL,
    purchase_cost NUMBER(12,2) DEFAULT 0.00 NOT NULL,
    profit_loss NUMBER(12,2) DEFAULT 0.00 NOT NULL,
    trans_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id VARCHAR2(64),
    user_name VARCHAR2(255),
    reference VARCHAR2(100),
    customer_ref VARCHAR2(255),
    notes VARCHAR2(1000),
    serial_numbers VARCHAR2(2000)
);

CREATE INDEX idx_txn_product ON transactions(product_id);
CREATE INDEX idx_txn_type ON transactions(type);
CREATE INDEX idx_txn_date ON transactions(trans_date);

-- 7. WARRANTIES
CREATE TABLE warranties (
    id VARCHAR2(64) PRIMARY KEY,
    product_id VARCHAR2(64) REFERENCES products(id) ON DELETE SET NULL,
    product_name VARCHAR2(255) NOT NULL,
    serial_number VARCHAR2(100) NOT NULL,
    customer_ref VARCHAR2(255) NOT NULL,
    customer_name VARCHAR2(255) NOT NULL,
    customer_email VARCHAR2(255),
    customer_phone VARCHAR2(50),
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    status VARCHAR2(50) DEFAULT 'active' NOT NULL,
    notes VARCHAR2(1000)
);

CREATE INDEX idx_war_status ON warranties(status);

-- 8. WARRANTY CLAIMS
CREATE TABLE warranty_claims (
    id VARCHAR2(64) PRIMARY KEY,
    warranty_id VARCHAR2(64) REFERENCES warranties(id) ON DELETE CASCADE,
    claim_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    issue_description VARCHAR2(2000) NOT NULL,
    status VARCHAR2(50) DEFAULT 'in_repair' NOT NULL,
    resolution_notes VARCHAR2(2000)
);

-- 9. PURCHASE ORDERS
CREATE TABLE purchase_orders (
    id VARCHAR2(64) PRIMARY KEY,
    po_number VARCHAR2(100) NOT NULL UNIQUE,
    supplier_id VARCHAR2(64) REFERENCES suppliers(id) ON DELETE SET NULL,
    supplier_name VARCHAR2(255) NOT NULL,
    status VARCHAR2(50) DEFAULT 'pending' NOT NULL,
    total_amount NUMBER(12,2) DEFAULT 0.00 NOT NULL,
    items_count NUMBER(10) DEFAULT 0 NOT NULL,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expected_delivery TIMESTAMP,
    received_date TIMESTAMP,
    notes VARCHAR2(1000),
    created_by VARCHAR2(255)
);

CREATE TABLE purchase_order_items (
    id VARCHAR2(64) PRIMARY KEY,
    po_id VARCHAR2(64) REFERENCES purchase_orders(id) ON DELETE CASCADE,
    product_id VARCHAR2(64) REFERENCES products(id) ON DELETE SET NULL,
    product_name VARCHAR2(255) NOT NULL,
    sku VARCHAR2(100) NOT NULL,
    quantity NUMBER(10) NOT NULL,
    received_quantity NUMBER(10) DEFAULT 0,
    unit_cost NUMBER(12,2) NOT NULL,
    total_cost NUMBER(12,2) NOT NULL
);

-- 10. SALES RECEIPTS
CREATE TABLE sales_receipts (
    id VARCHAR2(64) PRIMARY KEY,
    receipt_number VARCHAR2(100) NOT NULL UNIQUE,
    receipt_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    customer_name VARCHAR2(255) NOT NULL,
    customer_phone VARCHAR2(50),
    customer_email VARCHAR2(255),
    customer_address VARCHAR2(1000),
    subtotal NUMBER(12,2) NOT NULL,
    discount NUMBER(12,2) DEFAULT 0.00 NOT NULL,
    grand_total NUMBER(12,2) NOT NULL,
    payment_method VARCHAR2(50) DEFAULT 'cash' NOT NULL,
    cashier_id VARCHAR2(64),
    cashier_name VARCHAR2(255),
    total_items NUMBER(10) DEFAULT 1 NOT NULL
);

CREATE TABLE sales_receipt_items (
    id VARCHAR2(64) PRIMARY KEY,
    receipt_id VARCHAR2(64) REFERENCES sales_receipts(id) ON DELETE CASCADE,
    product_id VARCHAR2(64),
    sku VARCHAR2(100) NOT NULL,
    product_name VARCHAR2(255) NOT NULL,
    brand VARCHAR2(100),
    model VARCHAR2(100),
    quantity NUMBER(10) NOT NULL,
    unit_price NUMBER(12,2) NOT NULL,
    discount NUMBER(12,2) DEFAULT 0.00 NOT NULL,
    total NUMBER(12,2) NOT NULL,
    warranty_period_months NUMBER(10) DEFAULT 0
);

-- 11. SYSTEM SETTINGS
CREATE TABLE system_settings (
    id VARCHAR2(64) PRIMARY KEY,
    store_name VARCHAR2(255) DEFAULT 'ElectroStock',
    store_email VARCHAR2(255) DEFAULT 'support@electrostock.com',
    store_phone VARCHAR2(50) DEFAULT '+91 98765 43210',
    store_address VARCHAR2(1000),
    currency VARCHAR2(10) DEFAULT 'INR',
    currency_symbol VARCHAR2(10) DEFAULT '₹',
    tax_rate NUMBER(5,2) DEFAULT 18.00,
    low_stock_threshold_default NUMBER(10) DEFAULT 5,
    auto_alert_low_stock NUMBER(1) DEFAULT 1,
    auto_alert_expiring_warranty NUMBER(1) DEFAULT 1,
    warranty_expiry_warning_days NUMBER(10) DEFAULT 30,
    enable_sound_alerts NUMBER(1) DEFAULT 1,
    theme VARCHAR2(20) DEFAULT 'system'
);

-- 12. AUDIT LOGS
CREATE TABLE audit_logs (
    id VARCHAR2(64) PRIMARY KEY,
    action VARCHAR2(100) NOT NULL,
    action_label VARCHAR2(255) NOT NULL,
    user_name VARCHAR2(255),
    user_id VARCHAR2(64),
    user_role VARCHAR2(50),
    log_date VARCHAR2(20),
    log_time VARCHAR2(20),
    log_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    related_id VARCHAR2(100),
    description VARCHAR2(2000),
    ip_address VARCHAR2(50)
);

PROMPT [3/6] Seeding Initial Enterprise Data...

-- 1. USERS
INSERT INTO users (id, name, email, password_hash, role, status)
VALUES ('usr-admin', 'Administrator', 'admin@electrostock.com', 'admin123', 'admin', 'active');

INSERT INTO users (id, name, email, password_hash, role, status)
VALUES ('usr-manager', 'Priya Sharma (Manager)', 'manager@electrostock.com', 'manager123', 'manager', 'active');

INSERT INTO users (id, name, email, password_hash, role, status)
VALUES ('usr-cashier', 'shradhal kumavat', 'staff@electrostock.com', 'staff123', 'cashier', 'active');

INSERT INTO users (id, name, email, password_hash, role, status)
VALUES ('usr-staff', 'Amit Patel (Technician)', 'technician@electrostock.com', 'tech123', 'staff', 'active');

-- 2. CATEGORIES
INSERT INTO categories (id, name, description)
VALUES ('cat-1', 'Smartphones & Tablets', 'Premium mobile devices, iPads, and 5G cellular hardware');

INSERT INTO categories (id, name, description)
VALUES ('cat-2', 'Smart TVs & Displays', '4K Ultra HD, OLED, and Crystal LED Smart TVs & Monitors');

INSERT INTO categories (id, name, description)
VALUES ('cat-3', 'Laptops & Workstations', 'Ultrabooks, MacBooks, and high-performance gaming rigs');

INSERT INTO categories (id, name, description)
VALUES ('cat-4', 'Audio & Soundbars', 'Noise-canceling headphones, Bluetooth speakers & Dolby Atmos soundbars');

INSERT INTO categories (id, name, description)
VALUES ('cat-5', 'Smart Home & Wearables', 'Smartwatches, fitness wearables, mice, keyboards & accessories');

INSERT INTO categories (id, name, description)
VALUES ('cat-6', 'Printers & Imaging', 'Ink tank, laser printers, scanners & imaging peripherals');

-- 3. SUPPLIERS
INSERT INTO suppliers (id, name, company, email, phone, address, gstin, payment_terms, status)
VALUES ('sup-1', 'Rajesh Sharma', 'Apex Electronics Dist. Ltd.', 'rajesh@apexelectronics.in', '+91 98201 11223', 'Plot 44, Lamington Road, Mumbai - 400007', '27AABCA1234F1Z5', 'Net 30', 'active');

INSERT INTO suppliers (id, name, company, email, phone, address, gstin, payment_terms, status)
VALUES ('sup-2', 'Anil Mehta', 'Apple Distribution India Ltd', 'b2b@apple-dist.in', '+91 98222 33445', 'BKC Commercial Hub, Bandra East, Mumbai - 400051', '27AABCA5678D1Z2', 'Net 15', 'active');

INSERT INTO suppliers (id, name, company, email, phone, address, gstin, payment_terms, status)
VALUES ('sup-3', 'Suresh Reddy', 'Sony Electronics Distribution Hub', 'sales@sony-hub.co.in', '+91 98333 44556', 'Electronic City, Phase 1, Bangalore - 560100', '29AABCS9012E1Z8', 'Net 45', 'active');

INSERT INTO suppliers (id, name, company, email, phone, address, gstin, payment_terms, status)
VALUES ('sup-4', 'Vikram Mehta', 'Global Tech Wholesale', 'sales@globaltechdist.com', '+91 98102 33445', 'B-12, Nehru Place, New Delhi - 110019', '07AAECG5678K1ZQ', 'Net 30', 'active');

-- 4. PRODUCTS
INSERT INTO products (id, name, sku, category_id, brand, model, supplier_id, stock, min_stock, purchase_price, selling_price, warranty_period_months, description)
VALUES ('prod-1', 'iPhone 15 Pro Max 256GB', 'SKU-IPH-15PM-256', 'cat-1', 'Apple', 'A3106', 'sup-2', 14, 5, 125000.00, 159900.00, 12, 'Flagship Apple smartphone with titanium finish and A17 Pro chip.');

INSERT INTO products (id, name, sku, category_id, brand, model, supplier_id, stock, min_stock, purchase_price, selling_price, warranty_period_months, description)
VALUES ('prod-2', 'Samsung Galaxy S24 Ultra 512GB', 'SKU-SAM-S24U-512', 'cat-1', 'Samsung', 'SM-S928B', 'sup-1', 8, 4, 110000.00, 139999.00, 12, 'Galaxy AI enabled flagship with Snapdragon 8 Gen 3 and titanium build.');

INSERT INTO products (id, name, sku, category_id, brand, model, supplier_id, stock, min_stock, purchase_price, selling_price, warranty_period_months, description)
VALUES ('prod-3', 'MacBook Pro 16" M3 Max 1TB', 'SKU-APP-MBP16-M3', 'cat-3', 'Apple', 'MRW13LL/A', 'sup-2', 4, 2, 280000.00, 349900.00, 24, 'Liquid Retina XDR, 36GB Unified Memory, 1TB SSD, 16-core CPU.');

INSERT INTO products (id, name, sku, category_id, brand, model, supplier_id, stock, min_stock, purchase_price, selling_price, warranty_period_months, description)
VALUES ('prod-4', 'Dell XPS 15 9530 (i9/32GB/1TB/RTX 4070)', 'SKU-DEL-XPS15-I9', 'cat-3', 'Dell', 'XPS-9530', 'sup-4', 3, 3, 190000.00, 235000.00, 12, 'Intel Core i9 13th Gen, 32GB RAM, OLED 3.5K touch display.');

INSERT INTO products (id, name, sku, category_id, brand, model, supplier_id, stock, min_stock, purchase_price, selling_price, warranty_period_months, description)
VALUES ('prod-5', 'Sony WH-1000XM5 Wireless Headphones', 'SKU-SNY-WH1000XM5', 'cat-4', 'Sony', 'WH1000XM5/B', 'sup-3', 18, 5, 22000.00, 29990.00, 12, 'Industry leading noise cancelling headphones with 30-hour battery life.');

INSERT INTO products (id, name, sku, category_id, brand, model, supplier_id, stock, min_stock, purchase_price, selling_price, warranty_period_months, description)
VALUES ('prod-6', 'Apple Watch Ultra 2 (49mm Titanium)', 'SKU-APP-AWU2-49', 'cat-5', 'Apple', 'MREG3LL/A', 'sup-2', 6, 3, 72000.00, 89900.00, 12, 'Titanium case with precision dual-frequency GPS and 3000 nits display.');

INSERT INTO products (id, name, sku, category_id, brand, model, supplier_id, stock, min_stock, purchase_price, selling_price, warranty_period_months, description)
VALUES ('prod-7', 'Samsung 55" Crystal 4K Smart TV', 'SAM-TV-55-C4K', 'cat-2', 'Samsung', 'UA55CUE70AKLXL', 'sup-1', 12, 3, 34500.00, 42000.00, 24, 'Ultra HD 4K LED Smart TV with PurColor display and HDR10+ support.');

INSERT INTO products (id, name, sku, category_id, brand, model, supplier_id, stock, min_stock, purchase_price, selling_price, warranty_period_months, description)
VALUES ('prod-8', 'LG UltraFine 27" 4K Ergo Monitor', 'SKU-LG-27UN880', 'cat-2', 'LG', '27UN880-B', 'sup-4', 5, 2, 34000.00, 44999.00, 36, '4K UHD IPS Display with USB-C 60W power delivery and ergonomic arm stand.');

INSERT INTO products (id, name, sku, category_id, brand, model, supplier_id, stock, min_stock, purchase_price, selling_price, warranty_period_months, description)
VALUES ('prod-9', 'Logitech MX Master 3S Wireless Mouse', 'LOG-MX-M3S', 'cat-5', 'Logitech', '910-006561', 'sup-4', 22, 8, 6500.00, 8995.00, 12, 'Quiet clicks, 8K DPI laser tracking, MagSpeed electromagnetic scroll.');

INSERT INTO products (id, name, sku, category_id, brand, model, supplier_id, stock, min_stock, purchase_price, selling_price, warranty_period_months, description)
VALUES ('prod-10', 'Canon PIXMA G2012 All-in-One Printer', 'CAN-PRT-G2012', 'cat-6', 'Canon', 'G2012', 'sup-4', 4, 2, 12000.00, 13999.00, 12, 'High-yield color ink tank printer with print, scan, and copy functions.');

-- 5. SERIAL / IMEI TRACKING
INSERT INTO serial_imei (id, product_id, product_name, serial_number, imei, status, warranty_id, date_added, date_sold, customer_ref)
VALUES ('ser-1', 'prod-1', 'iPhone 15 Pro Max 256GB', 'SN-IPH15PM-001', '863920194850123', 'available', NULL, CURRENT_TIMESTAMP, NULL, NULL);

INSERT INTO serial_imei (id, product_id, product_name, serial_number, imei, status, warranty_id, date_added, date_sold, customer_ref)
VALUES ('ser-2', 'prod-1', 'iPhone 15 Pro Max 256GB', 'SN-IPH15PM-002', '863920194850124', 'available', NULL, CURRENT_TIMESTAMP, NULL, NULL);

INSERT INTO serial_imei (id, product_id, product_name, serial_number, imei, status, warranty_id, date_added, date_sold, customer_ref)
VALUES ('ser-3', 'prod-1', 'iPhone 15 Pro Max 256GB', 'SN-IPH15PM-003', '863920194850125', 'sold', 'war-1', CURRENT_TIMESTAMP - 10, CURRENT_TIMESTAMP - 2, 'Vikram Patel');

INSERT INTO serial_imei (id, product_id, product_name, serial_number, imei, status, warranty_id, date_added, date_sold, customer_ref)
VALUES ('ser-4', 'prod-2', 'Samsung Galaxy S24 Ultra 512GB', 'SN-S24U-9901', '354920194850981', 'available', NULL, CURRENT_TIMESTAMP, NULL, NULL);

INSERT INTO serial_imei (id, product_id, product_name, serial_number, imei, status, warranty_id, date_added, date_sold, customer_ref)
VALUES ('ser-5', 'prod-3', 'MacBook Pro 16" M3 Max 1TB', 'SN-MBP16-M3-441', NULL, 'available', NULL, CURRENT_TIMESTAMP, NULL, NULL);

-- 6. STOCK TRANSACTIONS (STOCK IN & STOCK OUT WITH PROFIT/LOSS)
INSERT INTO transactions (id, product_id, product_name, type, quantity, unit_price, total_value, purchase_cost, profit_loss, trans_date, user_id, user_name, reference, customer_ref, notes, serial_numbers)
VALUES ('txn-in-1', 'prod-1', 'iPhone 15 Pro Max 256GB', 'stock_in', 15, 125000.00, 1875000.00, 1875000.00, 0.00, CURRENT_TIMESTAMP - 15, 'usr-admin', 'Administrator', 'PO-2024-001', '', 'Inbound air consignment from Apple Distribution', '["SN-IPH15PM-001","SN-IPH15PM-002","SN-IPH15PM-003"]');

INSERT INTO transactions (id, product_id, product_name, type, quantity, unit_price, total_value, purchase_cost, profit_loss, trans_date, user_id, user_name, reference, customer_ref, notes, serial_numbers)
VALUES ('txn-in-2', 'prod-2', 'Samsung Galaxy S24 Ultra 512GB', 'stock_in', 10, 110000.00, 1100000.00, 1100000.00, 0.00, CURRENT_TIMESTAMP - 12, 'usr-admin', 'Administrator', 'PO-2024-002', '', 'Batch delivery from Samsung Apex Dist', '["SN-S24U-9901"]');

INSERT INTO transactions (id, product_id, product_name, type, quantity, unit_price, total_value, purchase_cost, profit_loss, trans_date, user_id, user_name, reference, customer_ref, notes, serial_numbers)
VALUES ('txn-in-3', 'prod-7', 'Samsung 55" Crystal 4K Smart TV', 'stock_in', 15, 34500.00, 517500.00, 517500.00, 0.00, CURRENT_TIMESTAMP - 8, 'usr-admin', 'Administrator', 'PO-2024-003', '', 'Wholesale batch delivery from Apex Electronics', '[]');

INSERT INTO transactions (id, product_id, product_name, type, quantity, unit_price, total_value, purchase_cost, profit_loss, trans_date, user_id, user_name, reference, customer_ref, notes, serial_numbers)
VALUES ('txn-out-1', 'prod-1', 'iPhone 15 Pro Max 256GB', 'stock_out', 1, 159900.00, 159900.00, 125000.00, 34900.00, CURRENT_TIMESTAMP - 5, 'usr-cashier', 'shradhal kumavat', 'REC-2024-101', 'Vikram Patel', 'Direct customer retail walk-in dispatch', '["SN-IPH15PM-003"]');

INSERT INTO transactions (id, product_id, product_name, type, quantity, unit_price, total_value, purchase_cost, profit_loss, trans_date, user_id, user_name, reference, customer_ref, notes, serial_numbers)
VALUES ('txn-out-2', 'prod-2', 'Samsung Galaxy S24 Ultra 512GB', 'stock_out', 2, 139999.00, 279998.00, 220000.00, 59998.00, CURRENT_TIMESTAMP - 3, 'usr-cashier', 'shradhal kumavat', 'REC-2024-102', 'Corporate Tech Ltd', 'Bulk executive devices sale', '[]');

INSERT INTO transactions (id, product_id, product_name, type, quantity, unit_price, total_value, purchase_cost, profit_loss, trans_date, user_id, user_name, reference, customer_ref, notes, serial_numbers)
VALUES ('txn-out-3', 'prod-7', 'Samsung 55" Crystal 4K Smart TV', 'stock_out', 3, 42000.00, 126000.00, 103500.00, 22500.00, CURRENT_TIMESTAMP - 1, 'usr-manager', 'Priya Sharma (Manager)', 'REC-2024-103', 'Hotel Regency Landmark', 'Hospitality display order dispatch', '[]');

-- 7. WARRANTIES
INSERT INTO warranties (id, product_id, product_name, serial_number, customer_ref, customer_name, customer_email, customer_phone, start_date, end_date, status, notes)
VALUES ('war-1', 'prod-1', 'iPhone 15 Pro Max 256GB', 'SN-IPH15PM-003', 'Vikram Patel', 'Vikram Patel', 'vikram.patel@gmail.com', '+91 99887 76655', CURRENT_TIMESTAMP - 5, CURRENT_TIMESTAMP + 360, 'active', 'Official 1-year AppleCare warranty coverage.');

-- 8. SYSTEM SETTINGS
INSERT INTO system_settings (id, store_name, store_email, store_phone, store_address, currency, currency_symbol, tax_rate, low_stock_threshold_default, auto_alert_low_stock, auto_alert_expiring_warranty, warranty_expiry_warning_days, enable_sound_alerts, theme)
VALUES ('set-1', 'ElectroStock Inventory & ERP', 'support@electrostock.com', '+91 98765 43210', 'Shop 42, Electronics Hub, MG Road, Bangalore 560001', 'INR', '₹', 18.00, 5, 1, 1, 30, 1, 'system');

-- 9. AUDIT LOGS
INSERT INTO audit_logs (id, action, action_label, user_name, user_id, user_role, log_date, log_time, related_id, description, ip_address)
VALUES ('log-1', 'db_init', 'Oracle DB Configured', 'Administrator', 'usr-admin', 'admin', '2026-10-09', '23:55:00', 'system', 'Oracle Database schema and product catalog configured for system/123456', '127.0.0.1');

COMMIT;

PROMPT [4/6] Verification: Product Count & Records in Oracle Database:
SELECT count(*) AS total_products FROM products;

COL id FORMAT A8;
COL name FORMAT A34;
COL sku FORMAT A18;
COL stock FORMAT 999;
COL selling_price FORMAT 999999.99;
SELECT id, name, sku, stock, selling_price FROM products ORDER BY id;

PROMPT [5/6] Verification: Transactions Count & Records in Oracle Database:
SELECT count(*) AS total_transactions FROM transactions;

COL id FORMAT A10;
COL product_name FORMAT A32;
COL type FORMAT A10;
COL quantity FORMAT 999;
COL total_value FORMAT 9999999.99;
COL profit_loss FORMAT 999999.99;
SELECT id, product_name, type, quantity, total_value, profit_loss FROM transactions ORDER BY id;

PROMPT [6/6] Oracle Database Configuration & Product Transaction Verification Completed Successfully!
EXIT;
