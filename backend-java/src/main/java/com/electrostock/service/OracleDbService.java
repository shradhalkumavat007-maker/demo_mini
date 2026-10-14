package com.electrostock.service;

import com.electrostock.model.*;
import java.sql.*;
import java.time.Instant;
import java.util.*;

/**
 * Enterprise Oracle Database Persistence & Synchronization Service
 * Handles JDBC connection and transactions with Oracle Database XE (system / 123456).
 */
public class OracleDbService {

    private static final String DEFAULT_URL = "jdbc:oracle:thin:@localhost:1521:XE";
    private static final String DEFAULT_USER = "system";
    private static final String DEFAULT_PASS = "123456";

    private static String url = System.getProperty("oracle.db.url", System.getenv().getOrDefault("ORACLE_DB_URL", DEFAULT_URL));
    private static String user = System.getProperty("oracle.db.user", System.getenv().getOrDefault("ORACLE_DB_USER", DEFAULT_USER));
    private static String pass = System.getProperty("oracle.db.pass", System.getenv().getOrDefault("ORACLE_DB_PASS", DEFAULT_PASS));

    static {
        try {
            Class.forName("oracle.jdbc.OracleDriver");
        } catch (ClassNotFoundException e) {
            System.err.println("[OracleDbService] Oracle JDBC Driver not found: " + e.getMessage());
        }
    }

    public static Connection getConnection() throws SQLException {
        return DriverManager.getConnection(url, user, pass);
    }

    public static boolean isAvailable() {
        try (Connection conn = getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery("SELECT 1 FROM dual")) {
            return rs.next();
        } catch (Throwable t) {
            return false;
        }
    }

    public static Map<String, Object> getOracleDatabaseStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("url", url);
        stats.put("user", user);
        try (Connection conn = getConnection()) {
            stats.put("connected", true);
            DatabaseMetaData meta = conn.getMetaData();
            stats.put("productName", meta.getDatabaseProductName());
            stats.put("productVersion", meta.getDatabaseProductVersion());

            try (Statement s = conn.createStatement()) {
                ResultSet rs = s.executeQuery("SELECT count(*) FROM products");
                if (rs.next()) stats.put("productCount", rs.getInt(1));
                rs.close();

                rs = s.executeQuery("SELECT count(*) FROM transactions");
                if (rs.next()) stats.put("transactionCount", rs.getInt(1));
                rs.close();

                rs = s.executeQuery("SELECT count(*) FROM serial_imei");
                if (rs.next()) stats.put("serialCount", rs.getInt(1));
                rs.close();
            }
        } catch (Throwable t) {
            stats.put("connected", false);
            stats.put("error", t.getMessage());
        }
        return stats;
    }

    // --- FETCH PRODUCTS ---
    public static List<Product> fetchProducts() {
        List<Product> list = new ArrayList<>();
        String sql = "SELECT id, name, sku, category_id, brand, model, supplier_id, stock, min_stock, purchase_price, selling_price, warranty_period_months, description, image_url, created_at, updated_at FROM products ORDER BY id";
        try (Connection conn = getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            while (rs.next()) {
                Product p = new Product(
                    rs.getString("id"),
                    rs.getString("name"),
                    rs.getString("sku"),
                    rs.getString("category_id"),
                    rs.getString("brand"),
                    rs.getString("model"),
                    rs.getString("supplier_id"),
                    rs.getInt("stock"),
                    rs.getInt("min_stock"),
                    rs.getDouble("purchase_price"),
                    rs.getDouble("selling_price"),
                    rs.getInt("warranty_period_months"),
                    rs.getString("description"),
                    rs.getString("image_url"),
                    rs.getString("created_at"),
                    rs.getString("updated_at")
                );
                list.add(p);
            }
        } catch (SQLException e) {
            System.err.println("[OracleDbService] Error fetching products: " + e.getMessage());
        }
        return list;
    }

    // --- FETCH TRANSACTIONS ---
    public static List<Transaction> fetchTransactions() {
        List<Transaction> list = new ArrayList<>();
        String sql = "SELECT id, product_id, product_name, type, quantity, unit_price, total_value, purchase_cost, profit_loss, trans_date, user_id, user_name, reference, customer_ref, notes, serial_numbers FROM transactions ORDER BY trans_date DESC";
        try (Connection conn = getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            while (rs.next()) {
                String snJson = rs.getString("serial_numbers");
                List<String> sns = new ArrayList<>();
                if (snJson != null && snJson.startsWith("[")) {
                    String clean = snJson.replace("[", "").replace("]", "").replace("\"", "");
                    if (!clean.isBlank()) {
                        for (String part : clean.split(",")) {
                            if (!part.trim().isEmpty()) sns.add(part.trim());
                        }
                    }
                }
                Transaction t = new Transaction(
                    rs.getString("id"),
                    rs.getString("product_id"),
                    rs.getString("product_name"),
                    rs.getString("type"),
                    rs.getInt("quantity"),
                    rs.getDouble("unit_price"),
                    rs.getDouble("total_value"),
                    rs.getDouble("purchase_cost"),
                    rs.getDouble("profit_loss"),
                    rs.getString("trans_date"),
                    rs.getString("user_id"),
                    rs.getString("user_name"),
                    rs.getString("reference"),
                    rs.getString("customer_ref"),
                    rs.getString("notes"),
                    sns
                );
                list.add(t);
            }
        } catch (SQLException e) {
            System.err.println("[OracleDbService] Error fetching transactions: " + e.getMessage());
        }
        return list;
    }

    // --- FETCH CATEGORIES ---
    public static List<Category> fetchCategories() {
        List<Category> list = new ArrayList<>();
        String sql = "SELECT c.id, c.name, c.description, (SELECT count(*) FROM products p WHERE p.category_id = c.id) AS pcount FROM categories c ORDER BY c.id";
        try (Connection conn = getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            while (rs.next()) {
                list.add(new Category(
                    rs.getString("id"),
                    rs.getString("name"),
                    rs.getString("description"),
                    rs.getInt("pcount")
                ));
            }
        } catch (SQLException e) {
            System.err.println("[OracleDbService] Error fetching categories: " + e.getMessage());
        }
        return list;
    }

    // --- FETCH SUPPLIERS ---
    public static List<Supplier> fetchSuppliers() {
        List<Supplier> list = new ArrayList<>();
        String sql = "SELECT id, name, company, phone, email, address, gstin, status, created_at FROM suppliers ORDER BY id";
        try (Connection conn = getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            while (rs.next()) {
                list.add(new Supplier(
                    rs.getString("id"),
                    rs.getString("name"),
                    rs.getString("company"),
                    rs.getString("phone"),
                    rs.getString("email"),
                    rs.getString("address"),
                    rs.getString("gstin"),
                    rs.getString("status"),
                    rs.getString("created_at")
                ));
            }
        } catch (SQLException e) {
            System.err.println("[OracleDbService] Error fetching suppliers: " + e.getMessage());
        }
        return list;
    }

    // --- FETCH SERIALS ---
    public static List<SerialImei> fetchSerials() {
        List<SerialImei> list = new ArrayList<>();
        String sql = "SELECT id, product_id, product_name, serial_number, imei, status, warranty_id, date_added, date_sold, customer_ref FROM serial_imei ORDER BY id";
        try (Connection conn = getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            while (rs.next()) {
                list.add(new SerialImei(
                    rs.getString("id"),
                    rs.getString("product_id"),
                    rs.getString("product_name"),
                    rs.getString("serial_number"),
                    rs.getString("imei"),
                    rs.getString("status"),
                    rs.getString("warranty_id"),
                    rs.getString("date_added"),
                    rs.getString("date_sold"),
                    rs.getString("customer_ref")
                ));
            }
        } catch (SQLException e) {
            System.err.println("[OracleDbService] Error fetching serials: " + e.getMessage());
        }
        return list;
    }

    // --- INSERT PRODUCT ---
    public static void insertProduct(Product p) {
        String sql = "INSERT INTO products (id, name, sku, category_id, brand, model, supplier_id, stock, min_stock, purchase_price, selling_price, warranty_period_months, description, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        try (Connection conn = getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, p.getId());
            ps.setString(2, p.getName());
            ps.setString(3, p.getSku());
            ps.setString(4, p.getCategoryId());
            ps.setString(5, p.getBrand());
            ps.setString(6, p.getModel());
            ps.setString(7, p.getSupplierId());
            ps.setInt(8, p.getStock());
            ps.setInt(9, p.getMinStock());
            ps.setDouble(10, p.getPurchasePrice());
            ps.setDouble(11, p.getSellingPrice());
            ps.setInt(12, p.getWarrantyPeriodMonths());
            ps.setString(13, p.getDescription());
            ps.setString(14, p.getImageUrl());
            ps.executeUpdate();
        } catch (SQLException e) {
            System.err.println("[OracleDbService] Error inserting product " + p.getId() + ": " + e.getMessage());
        }
    }

    // --- UPDATE PRODUCT ---
    public static void updateProduct(Product p) {
        String sql = "UPDATE products SET name = ?, sku = ?, category_id = ?, brand = ?, model = ?, supplier_id = ?, stock = ?, min_stock = ?, purchase_price = ?, selling_price = ?, warranty_period_months = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?";
        try (Connection conn = getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, p.getName());
            ps.setString(2, p.getSku());
            ps.setString(3, p.getCategoryId());
            ps.setString(4, p.getBrand());
            ps.setString(5, p.getModel());
            ps.setString(6, p.getSupplierId());
            ps.setInt(7, p.getStock());
            ps.setInt(8, p.getMinStock());
            ps.setDouble(9, p.getPurchasePrice());
            ps.setDouble(10, p.getSellingPrice());
            ps.setInt(11, p.getWarrantyPeriodMonths());
            ps.setString(12, p.getDescription());
            ps.setString(13, p.getId());
            ps.executeUpdate();
        } catch (SQLException e) {
            System.err.println("[OracleDbService] Error updating product " + p.getId() + ": " + e.getMessage());
        }
    }

    // --- DELETE PRODUCT ---
    public static void deleteProduct(String id) {
        String sql = "DELETE FROM products WHERE id = ?";
        try (Connection conn = getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, id);
            ps.executeUpdate();
        } catch (SQLException e) {
            System.err.println("[OracleDbService] Error deleting product " + id + ": " + e.getMessage());
        }
    }

    // --- UPDATE PRODUCT STOCK ---
    public static void updateProductStock(String productId, int newStock) {
        String sql = "UPDATE products SET stock = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?";
        try (Connection conn = getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, newStock);
            ps.setString(2, productId);
            ps.executeUpdate();
        } catch (SQLException e) {
            System.err.println("[OracleDbService] Error updating stock for " + productId + ": " + e.getMessage());
        }
    }

    // --- INSERT TRANSACTION ---
    public static void insertTransaction(Transaction t) {
        String sql = "INSERT INTO transactions (id, product_id, product_name, type, quantity, unit_price, total_value, purchase_cost, profit_loss, user_id, user_name, reference, customer_ref, notes, serial_numbers) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        try (Connection conn = getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, t.getId());
            ps.setString(2, t.getProductId());
            ps.setString(3, t.getProductName());
            ps.setString(4, t.getType());
            ps.setInt(5, t.getQuantity());
            ps.setDouble(6, t.getUnitPrice());
            ps.setDouble(7, t.getTotalValue());
            ps.setDouble(8, t.getPurchaseCost());
            ps.setDouble(9, t.getProfitLoss());
            ps.setString(10, t.getUserId());
            ps.setString(11, t.getUserName());
            ps.setString(12, t.getReference());
            ps.setString(13, t.getCustomerRef());
            ps.setString(14, t.getNotes());
            String snJson = t.getSerialNumbers() != null ? "[" + String.join(",", t.getSerialNumbers()) + "]" : "[]";
            ps.setString(15, snJson);
            ps.executeUpdate();
        } catch (SQLException e) {
            System.err.println("[OracleDbService] Error inserting transaction " + t.getId() + ": " + e.getMessage());
        }
    }

    // --- INSERT SERIAL ---
    public static void insertSerial(SerialImei s) {
        String sql = "INSERT INTO serial_imei (id, product_id, product_name, serial_number, imei, status, customer_ref) VALUES (?, ?, ?, ?, ?, ?, ?)";
        try (Connection conn = getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, s.getId());
            ps.setString(2, s.getProductId());
            ps.setString(3, s.getProductName());
            ps.setString(4, s.getSerialNumber());
            ps.setString(5, s.getImei());
            ps.setString(6, s.getStatus());
            ps.setString(7, s.getCustomerRef());
            ps.executeUpdate();
        } catch (SQLException e) {
            System.err.println("[OracleDbService] Error inserting serial " + s.getSerialNumber() + ": " + e.getMessage());
        }
    }

    // --- UPDATE SERIAL STATUS ---
    public static void updateSerialStatus(String serialNumber, String status, String customerRef) {
        String sql = "UPDATE serial_imei SET status = ?, customer_ref = ?, date_sold = CASE WHEN ? = 'sold' THEN CURRENT_TIMESTAMP ELSE date_sold END WHERE serial_number = ?";
        try (Connection conn = getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, status);
            ps.setString(2, customerRef);
            ps.setString(3, status);
            ps.setString(4, serialNumber);
            ps.executeUpdate();
        } catch (SQLException e) {
            System.err.println("[OracleDbService] Error updating serial status: " + e.getMessage());
        }
    }
}
