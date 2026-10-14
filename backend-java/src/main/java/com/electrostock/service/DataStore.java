package com.electrostock.service;

import com.electrostock.model.*;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

public class DataStore {
    private static DataStore instance;

    private final List<Product> products = Collections.synchronizedList(new ArrayList<>());
    private final List<Category> categories = Collections.synchronizedList(new ArrayList<>());
    private final List<Supplier> suppliers = Collections.synchronizedList(new ArrayList<>());
    private final List<Transaction> transactions = Collections.synchronizedList(new ArrayList<>());
    private final List<SerialImei> serials = Collections.synchronizedList(new ArrayList<>());
    private final List<Warranty> warranties = Collections.synchronizedList(new ArrayList<>());
    private final List<PurchaseOrder> purchaseOrders = Collections.synchronizedList(new ArrayList<>());
    private final List<Alert> alerts = Collections.synchronizedList(new ArrayList<>());
    private final List<User> users = Collections.synchronizedList(new ArrayList<>());
    private SystemSettings settings = new SystemSettings();
    // Sale receipts stored by receiptNumber
    private final Map<String, Map<String, Object>> receipts = new ConcurrentHashMap<>();

    private DataStore() {
        seedInitialData();
    }

    public static synchronized DataStore getInstance() {
        if (instance == null) {
            instance = new DataStore();
        }
        return instance;
    }

    private void seedInitialData() {
        if (OracleDbService.isAvailable()) {
            List<Product> oracleProducts = OracleDbService.fetchProducts();
            if (!oracleProducts.isEmpty()) {
                System.out.println("==================================================");
                System.out.println(" [Oracle DB] Connected to Oracle Database (system/123456)");
                System.out.println(" [Oracle DB] Loaded live products, transactions & catalog!");
                System.out.println("==================================================");
                products.addAll(oracleProducts);
                categories.addAll(OracleDbService.fetchCategories());
                suppliers.addAll(OracleDbService.fetchSuppliers());
                transactions.addAll(OracleDbService.fetchTransactions());
                serials.addAll(OracleDbService.fetchSerials());
                seedDefaultUsers();
                generateAlerts();
                return;
            }
        }

        // Fallback: in-memory seed catalog if Oracle tables are empty or offline
        // 1. Categories
        categories.add(new Category("cat-1", "Smartphones", "Flagship, mid-range & 5G smartphones", 2));
        categories.add(new Category("cat-2", "Laptops & Computers", "MacBooks, Windows Ultrabooks, and workstations", 2));
        categories.add(new Category("cat-3", "Audio & Headphones", "Noise cancelling wireless headphones & earbuds", 1));
        categories.add(new Category("cat-4", "Wearables & Watches", "Smartwatches, fitness bands and smart rings", 1));
        categories.add(new Category("cat-5", "Displays & Monitors", "4K OLED monitors and gaming displays", 1));

        // 2. Suppliers
        suppliers.add(new Supplier("sup-1", "Anand Sharma", "Apex Electronics Dist", "+91 98765 11111", "anand@apexdist.in", "Okhla Phase 3, New Delhi", "07AAAAA0000A1Z5", "active", "2024-01-10T10:00:00Z"));
        suppliers.add(new Supplier("sup-2", "Priya Verma", "Samsung Hub Logistics", "+91 98765 22222", "priya@samsunghub.in", "Whitefield, Bengaluru", "29BBBBB1111B1Z2", "active", "2024-01-12T10:00:00Z"));
        suppliers.add(new Supplier("sup-3", "Karan Malhotra", "Global Tech Imports", "+91 98765 33333", "karan@globaltech.in", "Bandra Kurla Complex, Mumbai", "27CCCCC2222C1Z9", "active", "2024-01-15T10:00:00Z"));

        // 3. Products
        products.add(new Product("prod-1", "iPhone 15 Pro Max 256GB", "SKU-IPH-15PM-256", "cat-1", "Apple", "A3106", "sup-1", 14, 5, 125000.0, 159900.0, 12, "Flagship Apple smartphone with titanium finish and A17 Pro chip.", null, "2024-01-01T10:00:00Z", "2024-01-01T10:00:00Z"));
        products.add(new Product("prod-2", "Samsung Galaxy S24 Ultra", "SKU-SAM-S24U-512", "cat-1", "Samsung", "SM-S928B", "sup-2", 8, 4, 110000.0, 139999.0, 12, "Galaxy AI enabled flagship with Snapdragon 8 Gen 3.", null, "2024-01-02T10:00:00Z", "2024-01-02T10:00:00Z"));
        products.add(new Product("prod-3", "MacBook Pro 16\" M3 Max", "SKU-APP-MBP16-M3", "cat-2", "Apple", "MRW13LL/A", "sup-1", 4, 2, 280000.0, 349900.0, 24, "Liquid Retina XDR, 36GB Unified Memory, 1TB SSD.", null, "2024-01-03T10:00:00Z", "2024-01-03T10:00:00Z"));
        products.add(new Product("prod-4", "Dell XPS 15 9530", "SKU-DEL-XPS15-I9", "cat-2", "Dell", "XPS-9530", "sup-3", 3, 3, 190000.0, 235000.0, 12, "Intel Core i9 13th Gen, 32GB RAM, RTX 4070, OLED 3.5K.", null, "2024-01-04T10:00:00Z", "2024-01-04T10:00:00Z"));
        products.add(new Product("prod-5", "Sony WH-1000XM5 Wireless Headphones", "SKU-SNY-WH1000XM5", "cat-3", "Sony", "WH1000XM5/B", "sup-3", 18, 5, 22000.0, 29990.0, 12, "Industry leading wireless noise cancelling headphones.", null, "2024-01-05T10:00:00Z", "2024-01-05T10:00:00Z"));
        products.add(new Product("prod-6", "Apple Watch Ultra 2", "SKU-APP-AWU2-49", "cat-4", "Apple", "MREG3LL/A", "sup-1", 1, 3, 72000.0, 89900.0, 12, "Titanium case with precision GPS and 3000 nits display.", null, "2024-01-06T10:00:00Z", "2024-01-06T10:00:00Z"));
        products.add(new Product("prod-7", "LG UltraFine 27\" 4K Ergo", "SKU-LG-27UN880", "cat-5", "LG", "27UN880-B", "sup-3", 0, 2, 34000.0, 44999.0, 36, "4K UHD IPS Display with USB-C and Ergonomic Stand.", null, "2024-01-07T10:00:00Z", "2024-01-07T10:00:00Z"));

        // 4. Serials
        serials.add(new SerialImei("ser-1", "prod-1", "iPhone 15 Pro Max 256GB", "SN-IPH15PM-001", "863920194850123", "available", null, "2024-01-10T12:00:00Z", null, null));
        serials.add(new SerialImei("ser-2", "prod-1", "iPhone 15 Pro Max 256GB", "SN-IPH15PM-002", "863920194850124", "available", null, "2024-01-10T12:00:00Z", null, null));
        serials.add(new SerialImei("ser-3", "prod-1", "iPhone 15 Pro Max 256GB", "SN-IPH15PM-003", "863920194850125", "sold", "war-1", "2024-01-10T12:00:00Z", "2024-01-15T14:30:00Z", "Vikram Patel"));
        serials.add(new SerialImei("ser-4", "prod-2", "Samsung Galaxy S24 Ultra", "SN-S24U-9901", "354920194850981", "available", null, "2024-01-12T12:00:00Z", null, null));
        serials.add(new SerialImei("ser-5", "prod-3", "MacBook Pro 16\" M3 Max", "SN-MBP16-M3-441", null, "available", null, "2024-01-14T12:00:00Z", null, null));
        serials.add(new SerialImei("ser-6", "prod-6", "Apple Watch Ultra 2", "SN-AWU2-7712", "867720194850999", "service", null, "2024-01-15T12:00:00Z", null, null));

        // 5. Warranties
        warranties.add(new Warranty("war-1", "prod-1", "iPhone 15 Pro Max 256GB", "SN-IPH15PM-003", "Vikram Patel", "Vikram Patel", "vikram.patel@gmail.com", "+91 99887 76655", "2024-01-15T14:30:00Z", "2025-01-15T14:30:00Z", "active", "Purchased with AppleCare complementary package.", new ArrayList<>()));
        warranties.add(new Warranty("war-2", "prod-3", "MacBook Pro 16\" M3 Max", "SN-MBP16-M3-440", "TechCorp Solutions", "TechCorp Solutions", "it@techcorp.in", "+91 98111 22334", "2023-01-10T10:00:00Z", "2024-01-10T10:00:00Z", "expired", "Company workstation device.", new ArrayList<>()));
        warranties.add(new Warranty("war-3", "prod-5", "Sony WH-1000XM5 Wireless Headphones", "SN-SNY-WH5-110", "Neha Roy", "Neha Roy", "neha.roy@yahoo.com", "+91 97777 88888", "2023-11-20T10:00:00Z", Instant.now().plus(15, ChronoUnit.DAYS).toString(), "expiring_soon", "Standard warranty.", new ArrayList<>()));

        // 6. Transactions
        transactions.add(new Transaction("txn-in-1", "prod-1", "iPhone 15 Pro Max 256GB", "stock_in", 15, 125000.0, 1875000.0, 1875000.0, 0.0, "2024-01-10T10:00:00Z", "usr-1", "Rahul Sharma", "PO-2024-001", "", "Initial batch from Apex Dist", List.of("SN-IPH15PM-001", "SN-IPH15PM-002", "SN-IPH15PM-003")));
        transactions.add(new Transaction("txn-in-2", "prod-2", "Samsung Galaxy S24 Ultra", "stock_in", 10, 110000.0, 1100000.0, 1100000.0, 0.0, "2024-01-12T10:00:00Z", "usr-1", "Rahul Sharma", "PO-2024-002", "", "Received batch from Samsung Hub", List.of("SN-S24U-9901")));
        transactions.add(new Transaction("txn-out-1", "prod-1", "iPhone 15 Pro Max 256GB", "stock_out", 1, 159900.0, 159900.0, 125000.0, 34900.0, "2024-01-15T14:30:00Z", "usr-2", "Amit Patel", "", "Vikram Patel", "Direct customer store walk-in sale", List.of("SN-IPH15PM-003")));
        transactions.add(new Transaction("txn-out-2", "prod-2", "Samsung Galaxy S24 Ultra", "stock_out", 2, 139999.0, 279998.0, 220000.0, 59998.0, "2024-01-18T16:00:00Z", "usr-2", "Amit Patel", "", "Corporate Tech Ltd", "Bulk executive phones", new ArrayList<>()));

        // 7. Purchase Orders
        List<PurchaseOrderItem> po1Items = List.of(new PurchaseOrderItem("prod-1", "iPhone 15 Pro Max 256GB", 15, 15, 125000.0, 1875000.0));
        purchaseOrders.add(new PurchaseOrder("po-1", "PO-2024-001", "sup-1", "Apex Electronics Dist", po1Items, 1875000.0, "received", "2024-01-08T10:00:00Z", "2024-01-10T10:00:00Z", "2024-01-10T11:00:00Z", "usr-1", "Rahul Sharma", "Priority air freight batch."));

        List<PurchaseOrderItem> po2Items = List.of(new PurchaseOrderItem("prod-7", "LG UltraFine 27\" 4K Ergo", 5, 0, 34000.0, 170000.0));
        purchaseOrders.add(new PurchaseOrder("po-2", "PO-2024-002", "sup-3", "Global Tech Imports", po2Items, 170000.0, "ordered", "2024-01-20T10:00:00Z", Instant.now().plus(3, ChronoUnit.DAYS).toString(), null, "usr-1", "Rahul Sharma", "Restock out of stock display monitors."));

        // 8. Users
        seedDefaultUsers();

        // 9. Initial Alerts
        generateAlerts();
    }

    private void seedDefaultUsers() {
        users.add(new User("usr-admin", "Administrator", "admin@electrostock.com", "admin", "active", "2024-01-20T09:00:00Z", "2023-01-01T00:00:00Z"));
        users.add(new User("usr-manager", "Priya Sharma (Manager)", "manager@electrostock.com", "manager", "active", "2024-01-19T14:00:00Z", "2023-06-01T00:00:00Z"));
        users.add(new User("usr-cashier", "shradhal kumavat", "staff@electrostock.com", "staff", "active", "2024-01-18T18:00:00Z", "2023-09-01T00:00:00Z"));
        users.add(new User("usr-staff", "Amit Patel (Technician)", "technician@electrostock.com", "staff", "active", "2024-01-18T18:00:00Z", "2023-09-01T00:00:00Z"));
    }

    // --- PRODUCTS ---
    public List<Product> getProducts() { return new ArrayList<>(products); }
    public Optional<Product> getProductById(String id) {
        return products.stream().filter(p -> p.getId().equals(id)).findFirst();
    }
    public Product addProduct(Product product) {
        if (product.getId() == null || product.getId().isEmpty()) {
            product.setId("prod-" + UUID.randomUUID().toString().substring(0, 8));
        }
        String now = Instant.now().toString();
        if (product.getCreatedAt() == null || product.getCreatedAt().isEmpty()) {
            product.setCreatedAt(now);
        }
        product.setUpdatedAt(now);
        products.removeIf(p -> p.getId().equals(product.getId()) || (p.getSku() != null && p.getSku().equals(product.getSku())));
        products.add(product);
        try {
            OracleDbService.insertProduct(product);
        } catch (Throwable t) {
            System.err.println("[DataStore] Oracle insert notice: " + t.getMessage());
        }
        recalcCategoryCounts();
        generateAlerts();
        return product;
    }
    public boolean updateProduct(String id, Product updated) {
        for (int i = 0; i < products.size(); i++) {
            if (products.get(i).getId().equals(id)) {
                updated.setId(id);
                updated.setUpdatedAt(Instant.now().toString());
                products.set(i, updated);
                try { OracleDbService.updateProduct(updated); } catch (Throwable ignored) {}
                recalcCategoryCounts();
                generateAlerts();
                return true;
            }
        }
        return false;
    }
    public boolean deleteProduct(String id) {
        boolean removed = products.removeIf(p -> p.getId().equals(id));
        if (removed) {
            try { OracleDbService.deleteProduct(id); } catch (Throwable ignored) {}
            serials.removeIf(s -> s.getProductId().equals(id));
            recalcCategoryCounts();
            generateAlerts();
        }
        return removed;
    }

    // --- CATEGORIES ---
    public List<Category> getCategories() { return new ArrayList<>(categories); }
    public Category addCategory(String name, String description) {
        Category c = new Category("cat-" + UUID.randomUUID().toString().substring(0, 8), name, description, 0);
        categories.add(c);
        return c;
    }
    public boolean updateCategory(String id, String name, String description) {
        for (Category c : categories) {
            if (c.getId().equals(id)) {
                c.setName(name);
                c.setDescription(description);
                return true;
            }
        }
        return false;
    }
    public boolean deleteCategory(String id) {
        return categories.removeIf(c -> c.getId().equals(id));
    }
    private void recalcCategoryCounts() {
        for (Category c : categories) {
            long count = products.stream().filter(p -> p.getCategoryId() != null && p.getCategoryId().equals(c.getId())).count();
            c.setProductCount((int) count);
        }
    }

    // --- SUPPLIERS ---
    public List<Supplier> getSuppliers() { return new ArrayList<>(suppliers); }
    public Optional<Supplier> getSupplierById(String id) {
        return suppliers.stream().filter(s -> s.getId().equals(id)).findFirst();
    }
    public Supplier addSupplier(Supplier s) {
        if (s.getId() == null || s.getId().isEmpty()) {
            s.setId("sup-" + UUID.randomUUID().toString().substring(0, 8));
        }
        s.setCreatedAt(Instant.now().toString());
        suppliers.add(s);
        return s;
    }
    public boolean updateSupplier(String id, Supplier updated) {
        for (int i = 0; i < suppliers.size(); i++) {
            if (suppliers.get(i).getId().equals(id)) {
                updated.setId(id);
                suppliers.set(i, updated);
                return true;
            }
        }
        return false;
    }
    public boolean deleteSupplier(String id) {
        return suppliers.removeIf(s -> s.getId().equals(id));
    }

    // --- INVENTORY OPERATIONS ---
    public synchronized Map<String, Object> stockIn(String productId, int quantity, double purchasePrice,
                                                    String userId, String userName, String ref, String notes,
                                                    List<String> serialNumbers) {
        Optional<Product> opt = getProductById(productId);
        if (opt.isEmpty()) return Map.of("success", false, "error", "Product not found");

        Product p = opt.get();
        p.setStock(p.getStock() + quantity);
        p.setPurchasePrice(purchasePrice);
        p.setUpdatedAt(Instant.now().toString());

        String now = Instant.now().toString();
        Transaction txn = new Transaction(
            "txn-in-" + System.currentTimeMillis() % 100000,
            p.getId(), p.getName(), "stock_in", quantity, purchasePrice,
            quantity * purchasePrice, quantity * purchasePrice, 0.0,
            now, userId, userName, ref, "", notes, serialNumbers
        );
        transactions.add(0, txn);
        try {
            OracleDbService.insertTransaction(txn);
            OracleDbService.updateProductStock(p.getId(), p.getStock());
        } catch (Throwable ignored) {}

        if (serialNumbers != null) {
            for (String sn : serialNumbers) {
                SerialImei sim = new SerialImei(
                    "ser-" + UUID.randomUUID().toString().substring(0, 8),
                    p.getId(), p.getName(), sn, null, "available", null, now, null, null
                );
                serials.add(0, sim);
                try { OracleDbService.insertSerial(sim); } catch (Throwable ignored) {}
            }
        }

        generateAlerts();
        return Map.of("success", true, "transaction", txn);
    }

    public synchronized Map<String, Object> stockOut(String productId, int quantity, double sellingPrice,
                                                     String userId, String userName, String customerRef, String notes,
                                                     List<String> serialNumbers) {
        Optional<Product> opt = getProductById(productId);
        if (opt.isEmpty()) return Map.of("success", false, "error", "Product not found");

        Product p = opt.get();
        if (p.getStock() < quantity) {
            return Map.of("success", false, "error", "Insufficient stock. Available: " + p.getStock() + ", Requested: " + quantity);
        }

        p.setStock(p.getStock() - quantity);
        p.setUpdatedAt(Instant.now().toString());

        double totalSales = quantity * sellingPrice;
        double cost = quantity * p.getPurchasePrice();
        double profit = totalSales - cost;
        String now = Instant.now().toString();

        Transaction txn = new Transaction(
            "txn-out-" + System.currentTimeMillis() % 100000,
            p.getId(), p.getName(), "stock_out", quantity, sellingPrice,
            totalSales, cost, profit,
            now, userId, userName, "", customerRef, notes, serialNumbers
        );
        transactions.add(0, txn);
        try {
            OracleDbService.insertTransaction(txn);
            OracleDbService.updateProductStock(p.getId(), p.getStock());
        } catch (Throwable ignored) {}

        if (serialNumbers != null) {
            for (String sn : serialNumbers) {
                for (SerialImei s : serials) {
                    if (s.getSerialNumber().equals(sn)) {
                        s.setStatus("sold");
                        s.setDateSold(now);
                        s.setCustomerRef(customerRef);
                    }
                }

                // Create customer warranty
                String endDate = Instant.now().plus(p.getWarrantyPeriodMonths() * 30L, ChronoUnit.DAYS).toString();
                warranties.add(0, new Warranty(
                    "war-" + UUID.randomUUID().toString().substring(0, 8),
                    p.getId(), p.getName(), sn, customerRef, customerRef, "", "",
                    now, endDate, "active", "Auto-issued on point of sale dispatch.", new ArrayList<>()
                ));
            }
        }

        generateAlerts();
        return Map.of("success", true, "transaction", txn);
    }

    public List<Transaction> getTransactions() { return new ArrayList<>(transactions); }

    // --- SERIALS ---
    public List<SerialImei> getSerials() { return new ArrayList<>(serials); }
    public boolean addSerial(String productId, String serialNumber, String imei) {
        Optional<Product> prod = getProductById(productId);
        if (prod.isEmpty()) return false;
        serials.add(0, new SerialImei(
            "ser-" + UUID.randomUUID().toString().substring(0, 8),
            prod.get().getId(), prod.get().getName(), serialNumber, imei,
            "available", null, Instant.now().toString(), null, null
        ));
        return true;
    }
    public boolean updateSerialStatus(String id, String status) {
        for (SerialImei s : serials) {
            if (s.getId().equals(id)) {
                s.setStatus(status);
                if ("sold".equals(status)) {
                    s.setDateSold(Instant.now().toString());
                }
                return true;
            }
        }
        return false;
    }

    // --- WARRANTIES ---
    public List<Warranty> getWarranties() { return new ArrayList<>(warranties); }
    public Warranty addWarranty(Warranty w) {
        if (w.getId() == null || w.getId().isEmpty()) {
            w.setId("war-" + UUID.randomUUID().toString().substring(0, 8));
        }
        warranties.add(0, w);
        generateAlerts();
        return w;
    }
    public boolean claimWarranty(String warrantyId, String issueDescription, String status, String resolutionNotes) {
        for (Warranty w : warranties) {
            if (w.getId().equals(warrantyId)) {
                WarrantyClaim claim = new WarrantyClaim(
                    "clm-" + UUID.randomUUID().toString().substring(0, 8),
                    warrantyId, Instant.now().toString(), issueDescription, status, resolutionNotes
                );
                w.getClaims().add(0, claim);
                return true;
            }
        }
        return false;
    }

    // --- PURCHASE ORDERS ---
    public List<PurchaseOrder> getPurchaseOrders() { return new ArrayList<>(purchaseOrders); }
    public PurchaseOrder createPurchaseOrder(PurchaseOrder po) {
        if (po.getId() == null || po.getId().isEmpty()) {
            po.setId("po-" + UUID.randomUUID().toString().substring(0, 8));
        }
        if (po.getPoNumber() == null || po.getPoNumber().isEmpty()) {
            po.setPoNumber("PO-" + (2024 + purchaseOrders.size() / 100) + "-" + String.format("%03d", purchaseOrders.size() + 1));
        }
        po.setCreatedDate(Instant.now().toString());
        po.setStatus("draft");

        double total = 0;
        for (PurchaseOrderItem item : po.getItems()) {
            item.setTotal(item.getQuantity() * item.getUnitPrice());
            total += item.getTotal();
        }
        po.setTotalCost(total);
        purchaseOrders.add(0, po);
        generateAlerts();
        return po;
    }
    public boolean updatePOStatus(String id, String status) {
        for (PurchaseOrder po : purchaseOrders) {
            if (po.getId().equals(id)) {
                po.setStatus(status);
                generateAlerts();
                return true;
            }
        }
        return false;
    }
    public synchronized boolean receivePurchaseOrder(String id, String userId, String userName) {
        for (PurchaseOrder po : purchaseOrders) {
            if (po.getId().equals(id)) {
                po.setStatus("received");
                po.setReceivedDate(Instant.now().toString());

                // Automatically stock in items into product inventory!
                for (PurchaseOrderItem item : po.getItems()) {
                    item.setReceivedQuantity(item.getQuantity());
                    Optional<Product> prodOpt = getProductById(item.getProductId());
                    if (prodOpt.isPresent()) {
                        Product p = prodOpt.get();
                        p.setStock(p.getStock() + item.getQuantity());
                        p.setPurchasePrice(item.getUnitPrice());
                        p.setUpdatedAt(Instant.now().toString());

                        transactions.add(0, new Transaction(
                            "txn-in-" + System.currentTimeMillis() % 100000,
                            p.getId(), p.getName(), "stock_in", item.getQuantity(),
                            item.getUnitPrice(), item.getTotal(), item.getTotal(), 0.0,
                            Instant.now().toString(), userId, userName, po.getPoNumber(),
                            "", "Automated fulfillment from PO " + po.getPoNumber(), new ArrayList<>()
                        ));
                    }
                }
                generateAlerts();
                return true;
            }
        }
        return false;
    }

    // --- REORDER SUGGESTIONS ---
    public List<Map<String, Object>> getReorderSuggestions() {
        List<Map<String, Object>> list = new ArrayList<>();
        for (Product p : products) {
            if (p.getStock() <= p.getMinStock()) {
                int suggestedQty = Math.max(p.getMinStock() * 2 - p.getStock(), 5);
                double estimatedCost = suggestedQty * p.getPurchasePrice();
                Optional<Supplier> sup = getSupplierById(p.getSupplierId());

                Map<String, Object> item = new HashMap<>();
                item.put("product", p);
                item.put("currentStock", p.getStock());
                item.put("minStock", p.getMinStock());
                item.put("deficit", Math.max(0, p.getMinStock() - p.getStock()));
                item.put("suggestedQty", suggestedQty);
                item.put("estimatedCost", estimatedCost);
                item.put("supplierName", sup.map(Supplier::getCompany).orElse("Default Supplier"));
                item.put("status", p.getStock() == 0 ? "out_of_stock" : "low_stock");
                list.add(item);
            }
        }
        return list;
    }

    // --- PROFIT & LOSS CALCULATIONS ---
    public Map<String, Object> getProfitLossAnalytics() {
        double totalRevenue = 0;
        double totalCOGS = 0;
        double grossProfit = 0;
        double totalLoss = 0;

        for (Transaction t : transactions) {
            if ("stock_out".equals(t.getType())) {
                totalRevenue += t.getTotalValue();
                totalCOGS += t.getPurchaseCost();
                if (t.getProfitLoss() >= 0) {
                    grossProfit += t.getProfitLoss();
                } else {
                    totalLoss += Math.abs(t.getProfitLoss());
                }
            }
        }

        double netProfit = totalRevenue - totalCOGS;
        double margin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0.0;

        Map<String, Object> res = new HashMap<>();
        res.put("totalRevenue", totalRevenue);
        res.put("totalCOGS", totalCOGS);
        res.put("grossProfit", grossProfit);
        res.put("totalLoss", totalLoss);
        res.put("netProfit", netProfit);
        res.put("profitMargin", margin);
        return res;
    }

    // --- ALERTS ---
    public List<Alert> getAlerts() { return new ArrayList<>(alerts); }
    public void markAlertRead(String id) {
        for (Alert a : alerts) {
            if (a.getId().equals(id)) a.setRead(true);
        }
    }
    public void resolveAlert(String id) {
        for (Alert a : alerts) {
            if (a.getId().equals(id)) {
                a.setResolved(true);
                a.setRead(true);
            }
        }
    }
    public synchronized void generateAlerts() {
        alerts.clear();
        String now = Instant.now().toString();

        // 1. Stock alerts
        for (Product p : products) {
            if (p.getStock() == 0) {
                alerts.add(new Alert("alt-" + UUID.randomUUID().toString().substring(0, 8),
                    "out_of_stock", "danger", p.getName() + " is completely out of stock!",
                    p.getName() + " (SKU: " + p.getSku() + ") stock is 0. Please create a replenishment order immediately.",
                    p.getId(), p.getName(), false, false, now));
            } else if (p.getStock() <= p.getMinStock()) {
                alerts.add(new Alert("alt-" + UUID.randomUUID().toString().substring(0, 8),
                    "low_stock", "warning", p.getName() + " is below minimum stock threshold",
                    p.getName() + " stock level is currently " + p.getStock() + " (min threshold: " + p.getMinStock() + ").",
                    p.getId(), p.getName(), false, false, now));
            }
        }

        // 2. PO alerts
        for (PurchaseOrder po : purchaseOrders) {
            if ("ordered".equals(po.getStatus()) || "pending".equals(po.getStatus())) {
                alerts.add(new Alert("alt-" + UUID.randomUUID().toString().substring(0, 8),
                    "pending_po", "warning", "PO " + po.getPoNumber() + " is awaiting fulfillment",
                    "Purchase order " + po.getPoNumber() + " from " + po.getSupplierName() + " has not yet been received.",
                    null, null, false, false, now));
            }
        }
    }

    // --- USERS ---
    public List<User> getUsers() { return new ArrayList<>(users); }
    public User addUser(User u) {
        if (u.getId() == null || u.getId().isEmpty()) {
            u.setId("usr-" + UUID.randomUUID().toString().substring(0, 8));
        }
        u.setCreatedAt(Instant.now().toString());
        users.add(u);
        return u;
    }
    public boolean updateUser(String id, User updated) {
        for (int i = 0; i < users.size(); i++) {
            if (users.get(i).getId().equals(id)) {
                updated.setId(id);
                users.set(i, updated);
                return true;
            }
        }
        return false;
    }
    public boolean deleteUser(String id) {
        return users.removeIf(u -> u.getId().equals(id));
    }

    // --- SETTINGS ---
    public SystemSettings getSettings() { return settings; }
    public void updateSettings(SystemSettings s) { this.settings = s; }

    // --- RECEIPTS ---
    public void addReceipt(String receiptNumber, Map<String, Object> receipt) {
        receipts.put(receiptNumber, receipt);
    }
    public List<Map<String, Object>> getReceipts() {
        return new ArrayList<>(receipts.values());
    }
    public Map<String, Object> getReceipt(String receiptNumber) {
        return receipts.get(receiptNumber);
    }
}
