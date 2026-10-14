package com.electrostock.server;

import com.electrostock.model.*;
import com.electrostock.service.DataStore;
import com.electrostock.util.JsonUtil;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;

import java.io.*;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.stream.Collectors;

public class ElectroStockServer {

    private static int PORT = 8085;
    private static final DataStore store = DataStore.getInstance();

    public static void main(String[] args) throws IOException {
        int targetPort = Integer.parseInt(System.getProperty("server.port", System.getenv().getOrDefault("PORT", "8085")));
        HttpServer server = null;
        try {
            server = HttpServer.create(new InetSocketAddress(targetPort), 0);
            PORT = targetPort;
        } catch (java.net.BindException e1) {
            try {
                targetPort = 8080;
                server = HttpServer.create(new InetSocketAddress(targetPort), 0);
                PORT = targetPort;
            } catch (java.net.BindException e2) {
                targetPort = 8090;
                server = HttpServer.create(new InetSocketAddress(targetPort), 0);
                PORT = targetPort;
            }
        }
        System.out.println("==================================================");
        System.out.println(" ElectroStock Java Backend REST API Server");
        System.out.println(" Starting on: http://localhost:" + PORT);
        System.out.println(" Connected to: Oracle 10g XE (system / 123456)");
        System.out.println("==================================================");

        // API Handler
        server.createContext("/api", new ApiHandler());

        server.setExecutor(java.util.concurrent.Executors.newFixedThreadPool(16));
        server.start();

        long startTime = System.currentTimeMillis();
        // Background Heartbeat Monitor Thread - logs server vitality to terminal every 20 seconds
        Thread heartbeatThread = new Thread(() -> {
            while (true) {
                try {
                    Thread.sleep(20000);
                    long uptimeSec = (System.currentTimeMillis() - startTime) / 1000;
                    long totalMem = Runtime.getRuntime().totalMemory() / (1024 * 1024);
                    long freeMem = Runtime.getRuntime().freeMemory() / (1024 * 1024);
                    String time = java.time.LocalTime.now().truncatedTo(java.time.temporal.ChronoUnit.SECONDS).toString();
                    System.out.printf("[%s] [JAVA HEARTBEAT] ALIVE (Port %d) | Uptime: %ds | Products: %d | Categories: %d | Serials: %d | Memory: %dMB/%dMB\n",
                        time, PORT, uptimeSec, store.getProducts().size(), store.getCategories().size(), store.getSerials().size(),
                        (totalMem - freeMem), totalMem);
                } catch (InterruptedException e) {
                    break;
                }
            }
        });
        heartbeatThread.setDaemon(true);
        heartbeatThread.setName("Java-Backend-Heartbeat");
        heartbeatThread.start();

        System.out.println("✓ Server is listening on http://localhost:" + PORT);
        System.out.println("✓ Heartbeat monitor active - tracking latency & health!");
        System.out.println("✓ Ready to accept frontend requests from Next.js!");
    }

    static class ApiHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            exchange.setAttribute("startTime", System.currentTimeMillis());

            // Apply CORS headers to every request
            exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
            exchange.getResponseHeaders().add("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
            exchange.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
            exchange.getResponseHeaders().add("Content-Type", "application/json; charset=UTF-8");

            String method = exchange.getRequestMethod();
            if ("OPTIONS".equalsIgnoreCase(method)) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }

            String path = exchange.getRequestURI().getPath();
            String query = exchange.getRequestURI().getQuery();
            String body = readBody(exchange);

            try {
                // Route dispatch
                if (path.equals("/api/health")) {
                    long totalMem = Runtime.getRuntime().totalMemory() / (1024 * 1024);
                    long freeMem = Runtime.getRuntime().freeMemory() / (1024 * 1024);
                    boolean oracleAlive = com.electrostock.service.OracleDbService.isAvailable();
                    String healthJson = String.format(
                        "{\"status\":\"healthy\",\"server\":\"Java 26 HTTP Server\",\"port\":%d,\"oracleConnected\":%b,\"database\":\"Oracle 10g XE (system@localhost:1521/XE)\",\"counts\":{\"products\":%d,\"categories\":%d,\"suppliers\":%d,\"serials\":%d,\"transactions\":%d},\"memoryMb\":%d,\"timestamp\":\"%s\"}",
                        PORT, oracleAlive, store.getProducts().size(), store.getCategories().size(), store.getSuppliers().size(),
                        store.getSerials().size(), store.getTransactions().size(), (totalMem - freeMem), java.time.Instant.now()
                    );
                    sendJson(exchange, 200, healthJson);
                } else if (path.equals("/api/oracle/status") && "GET".equalsIgnoreCase(method)) {
                    Map<String, Object> stats = com.electrostock.service.OracleDbService.getOracleDatabaseStats();
                    sendJson(exchange, 200, JsonUtil.mapToJson(stats));
                }
                // --- AUTH ---
                else if (path.equals("/api/auth/login") && "POST".equalsIgnoreCase(method)) {
                    handleLogin(exchange, body);
                } else if (path.equals("/api/auth/me") && "GET".equalsIgnoreCase(method)) {
                    User u = store.getUsers().get(0);
                    sendJson(exchange, 200, JsonUtil.toJson(u));
                }
                // --- PRODUCTS ---
                else if (path.equals("/api/products")) {
                    if ("GET".equalsIgnoreCase(method)) {
                        List<Product> list = store.getProducts();
                        String json = "[" + list.stream().map(JsonUtil::toJson).collect(Collectors.joining(",")) + "]";
                        sendJson(exchange, 200, json);
                    } else if ("POST".equalsIgnoreCase(method)) {
                        Map<String, String> map = JsonUtil.parseSimpleJson(body);
                        Product p = new Product();
                        if (map.containsKey("id") && !map.get("id").isEmpty()) {
                            p.setId(map.get("id"));
                        }
                        p.setName(map.getOrDefault("name", "New Product"));
                        p.setSku(map.getOrDefault("sku", "SKU-" + System.currentTimeMillis() % 10000));
                        p.setCategoryId(map.getOrDefault("categoryId", "cat-1"));
                        p.setBrand(map.getOrDefault("brand", "Generic"));
                        p.setModel(map.getOrDefault("model", "Standard"));
                        p.setSupplierId(map.getOrDefault("supplierId", "sup-1"));
                        p.setStock(parseInt(map.get("stock"), 0));
                        p.setMinStock(parseInt(map.get("minStock"), 5));
                        p.setPurchasePrice(parseDouble(map.get("purchasePrice"), 0.0));
                        p.setSellingPrice(parseDouble(map.get("sellingPrice"), 0.0));
                        p.setWarrantyPeriodMonths(parseInt(map.get("warrantyPeriodMonths"), 0));
                        p.setDescription(map.getOrDefault("description", ""));
                        if (map.containsKey("imageUrl") && !map.get("imageUrl").isEmpty() && !"null".equals(map.get("imageUrl"))) {
                            p.setImageUrl(map.get("imageUrl"));
                        }
                        Product created = store.addProduct(p);
                        sendJson(exchange, 201, JsonUtil.toJson(created));
                    }
                } else if (path.startsWith("/api/products/")) {
                    String id = path.substring("/api/products/".length());
                    if ("GET".equalsIgnoreCase(method)) {
                        Optional<Product> opt = store.getProductById(id);
                        if (opt.isPresent()) sendJson(exchange, 200, JsonUtil.toJson(opt.get()));
                        else sendJson(exchange, 404, "{\"error\":\"Product not found\"}");
                    } else if ("DELETE".equalsIgnoreCase(method)) {
                        boolean ok = store.deleteProduct(id);
                        sendJson(exchange, 200, "{\"success\":" + ok + "}");
                    } else if ("PUT".equalsIgnoreCase(method)) {
                        Optional<Product> opt = store.getProductById(id);
                        if (opt.isPresent()) {
                            Product p = opt.get();
                            Map<String, String> map = JsonUtil.parseSimpleJson(body);
                            if (map.containsKey("name")) p.setName(map.get("name"));
                            if (map.containsKey("sku")) p.setSku(map.get("sku"));
                            if (map.containsKey("purchasePrice")) p.setPurchasePrice(parseDouble(map.get("purchasePrice"), p.getPurchasePrice()));
                            if (map.containsKey("sellingPrice")) p.setSellingPrice(parseDouble(map.get("sellingPrice"), p.getSellingPrice()));
                            if (map.containsKey("minStock")) p.setMinStock(parseInt(map.get("minStock"), p.getMinStock()));
                            if (map.containsKey("warrantyPeriodMonths")) p.setWarrantyPeriodMonths(parseInt(map.get("warrantyPeriodMonths"), p.getWarrantyPeriodMonths()));
                            store.updateProduct(id, p);
                            sendJson(exchange, 200, JsonUtil.toJson(p));
                        } else {
                            sendJson(exchange, 404, "{\"error\":\"Product not found\"}");
                        }
                    }
                }
                // --- CATEGORIES ---
                else if (path.equals("/api/categories")) {
                    if ("GET".equalsIgnoreCase(method)) {
                        List<Category> list = store.getCategories();
                        String json = "[" + list.stream().map(JsonUtil::toJson).collect(Collectors.joining(",")) + "]";
                        sendJson(exchange, 200, json);
                    } else if ("POST".equalsIgnoreCase(method)) {
                        Map<String, String> map = JsonUtil.parseSimpleJson(body);
                        Category c = store.addCategory(map.getOrDefault("name", "New Category"), map.getOrDefault("description", ""));
                        sendJson(exchange, 201, JsonUtil.toJson(c));
                    }
                } else if (path.startsWith("/api/categories/")) {
                    String id = path.substring("/api/categories/".length());
                    if ("DELETE".equalsIgnoreCase(method)) {
                        boolean ok = store.deleteCategory(id);
                        sendJson(exchange, 200, "{\"success\":" + ok + "}");
                    } else if ("PUT".equalsIgnoreCase(method)) {
                        Map<String, String> map = JsonUtil.parseSimpleJson(body);
                        boolean ok = store.updateCategory(id, map.getOrDefault("name", ""), map.getOrDefault("description", ""));
                        sendJson(exchange, 200, "{\"success\":" + ok + "}");
                    }
                }
                // --- SUPPLIERS ---
                else if (path.equals("/api/suppliers")) {
                    if ("GET".equalsIgnoreCase(method)) {
                        List<Supplier> list = store.getSuppliers();
                        String json = "[" + list.stream().map(JsonUtil::toJson).collect(Collectors.joining(",")) + "]";
                        sendJson(exchange, 200, json);
                    } else if ("POST".equalsIgnoreCase(method)) {
                        Map<String, String> map = JsonUtil.parseSimpleJson(body);
                        Supplier s = new Supplier(null, map.getOrDefault("name", ""), map.getOrDefault("company", ""),
                            map.getOrDefault("phone", ""), map.getOrDefault("email", ""), map.getOrDefault("address", ""),
                            map.getOrDefault("gstin", ""), "active", null);
                        Supplier created = store.addSupplier(s);
                        sendJson(exchange, 201, JsonUtil.toJson(created));
                    }
                } else if (path.startsWith("/api/suppliers/")) {
                    String id = path.substring("/api/suppliers/".length());
                    if ("GET".equalsIgnoreCase(method)) {
                        Optional<Supplier> opt = store.getSupplierById(id);
                        if (opt.isPresent()) sendJson(exchange, 200, JsonUtil.toJson(opt.get()));
                        else sendJson(exchange, 404, "{\"error\":\"Supplier not found\"}");
                    } else if ("DELETE".equalsIgnoreCase(method)) {
                        boolean ok = store.deleteSupplier(id);
                        sendJson(exchange, 200, "{\"success\":" + ok + "}");
                    }
                }
                // --- INVENTORY STOCK IN & OUT ---
                else if (path.equals("/api/inventory/stock-in") && "POST".equalsIgnoreCase(method)) {
                    Map<String, String> map = JsonUtil.parseSimpleJson(body);
                    String productId = map.get("productId");
                    int quantity = parseInt(map.get("quantity"), 1);
                    double purchasePrice = parseDouble(map.get("purchasePrice"), 0.0);
                    String ref = map.getOrDefault("reference", "");
                    String notes = map.getOrDefault("notes", "");
                    Map<String, Object> res = store.stockIn(productId, quantity, purchasePrice, "usr-1", "Admin", ref, notes, new ArrayList<>());
                    sendJson(exchange, 200, "{\"success\":" + res.get("success") + "}");
                } else if (path.equals("/api/inventory/stock-out") && "POST".equalsIgnoreCase(method)) {
                    Map<String, String> map = JsonUtil.parseSimpleJson(body);
                    String productId = map.get("productId");
                    int quantity = parseInt(map.get("quantity"), 1);
                    double sellingPrice = parseDouble(map.get("sellingPrice"), 0.0);
                    String customer = map.getOrDefault("customerRef", "Walk-in");
                    String notes = map.getOrDefault("notes", "");
                    Map<String, Object> res = store.stockOut(productId, quantity, sellingPrice, "usr-1", "Admin", customer, notes, new ArrayList<>());
                    if (Boolean.TRUE.equals(res.get("success"))) {
                        sendJson(exchange, 200, "{\"success\":true}");
                    } else {
                        sendJson(exchange, 400, "{\"success\":false,\"error\":\"" + res.get("error") + "\"}");
                    }
                } else if ((path.equals("/api/transactions") || path.equals("/api/inventory/transactions")) && "GET".equalsIgnoreCase(method)) {
                    List<Transaction> list = store.getTransactions();
                    String json = "[" + list.stream().map(JsonUtil::toJson).collect(Collectors.joining(",")) + "]";
                    sendJson(exchange, 200, json);
                }
                // --- SERIALS ---
                else if (path.equals("/api/serials")) {
                    if ("GET".equalsIgnoreCase(method)) {
                        List<SerialImei> list = store.getSerials();
                        String json = "[" + list.stream().map(JsonUtil::toJson).collect(Collectors.joining(",")) + "]";
                        sendJson(exchange, 200, json);
                    } else if ("POST".equalsIgnoreCase(method)) {
                        Map<String, String> map = JsonUtil.parseSimpleJson(body);
                        boolean ok = store.addSerial(map.get("productId"), map.get("serialNumber"), map.get("imei"));
                        sendJson(exchange, ok ? 201 : 400, "{\"success\":" + ok + "}");
                    }
                } else if (path.startsWith("/api/serials/") && "PUT".equalsIgnoreCase(method)) {
                    String id = path.substring("/api/serials/".length());
                    Map<String, String> map = JsonUtil.parseSimpleJson(body);
                    boolean ok = store.updateSerialStatus(id, map.getOrDefault("status", "available"));
                    sendJson(exchange, 200, "{\"success\":" + ok + "}");
                }
                // --- WARRANTIES ---
                else if (path.equals("/api/warranties")) {
                    if ("GET".equalsIgnoreCase(method)) {
                        List<Warranty> list = store.getWarranties();
                        String json = "[" + list.stream().map(JsonUtil::toJson).collect(Collectors.joining(",")) + "]";
                        sendJson(exchange, 200, json);
                    } else if ("POST".equalsIgnoreCase(method)) {
                        Map<String, String> map = JsonUtil.parseSimpleJson(body);
                        String prodId = map.get("productId");
                        Optional<Product> prod = store.getProductById(prodId);
                        String prodName = prod.map(Product::getName).orElse("Device");
                        int months = parseInt(map.get("durationMonths"), 12);
                        String start = java.time.Instant.now().toString();
                        String end = java.time.Instant.now().plus(months * 30L, java.time.temporal.ChronoUnit.DAYS).toString();
                        Warranty w = new Warranty(null, prodId, prodName, map.get("serialNumber"),
                            map.get("customerName"), map.get("customerName"), map.get("customerEmail"),
                            map.get("customerPhone"), start, end, "active", map.get("notes"), new ArrayList<>());
                        Warranty created = store.addWarranty(w);
                        sendJson(exchange, 201, JsonUtil.toJson(created));
                    }
                } else if (path.matches("/api/warranties/[^/]+/claims") && "POST".equalsIgnoreCase(method)) {
                    String[] parts = path.split("/");
                    String warrantyId = parts[3];
                    Map<String, String> map = JsonUtil.parseSimpleJson(body);
                    boolean ok = store.claimWarranty(warrantyId, map.getOrDefault("issueDescription", ""),
                        map.getOrDefault("status", "in_repair"), map.getOrDefault("resolutionNotes", ""));
                    sendJson(exchange, 200, "{\"success\":" + ok + "}");
                }
                // --- PURCHASE ORDERS ---
                else if (path.equals("/api/purchase-orders")) {
                    if ("GET".equalsIgnoreCase(method)) {
                        List<PurchaseOrder> list = store.getPurchaseOrders();
                        String json = "[" + list.stream().map(JsonUtil::toJson).collect(Collectors.joining(",")) + "]";
                        sendJson(exchange, 200, json);
                    } else if ("POST".equalsIgnoreCase(method)) {
                        Map<String, String> map = JsonUtil.parseSimpleJson(body);
                        PurchaseOrder po = new PurchaseOrder();
                        po.setSupplierId(map.getOrDefault("supplierId", "sup-1"));
                        Optional<Supplier> sup = store.getSupplierById(po.getSupplierId());
                        po.setSupplierName(sup.map(Supplier::getCompany).orElse("Supplier"));
                        po.setExpectedDate(map.getOrDefault("expectedDate", java.time.Instant.now().plus(7, java.time.temporal.ChronoUnit.DAYS).toString()));
                        po.setNotes(map.getOrDefault("notes", ""));
                        po.setUserId("usr-1");
                        po.setUserName("Admin");
                        PurchaseOrder created = store.createPurchaseOrder(po);
                        sendJson(exchange, 201, JsonUtil.toJson(created));
                    }
                } else if (path.matches("/api/purchase-orders/[^/]+/receive") && "POST".equalsIgnoreCase(method)) {
                    String[] parts = path.split("/");
                    String id = parts[3];
                    boolean ok = store.receivePurchaseOrder(id, "usr-1", "Admin");
                    sendJson(exchange, 200, "{\"success\":" + ok + "}");
                } else if (path.matches("/api/purchase-orders/[^/]+/status") && "PUT".equalsIgnoreCase(method)) {
                    String[] parts = path.split("/");
                    String id = parts[3];
                    Map<String, String> map = JsonUtil.parseSimpleJson(body);
                    boolean ok = store.updatePOStatus(id, map.getOrDefault("status", "pending"));
                    sendJson(exchange, 200, "{\"success\":" + ok + "}");
                }
                // --- REORDER ---
                else if (path.equals("/api/reorder") && "GET".equalsIgnoreCase(method)) {
                    List<Map<String, Object>> list = store.getReorderSuggestions();
                    StringBuilder sb = new StringBuilder("[");
                    for (int i = 0; i < list.size(); i++) {
                        Map<String, Object> item = list.get(i);
                        Product p = (Product) item.get("product");
                        sb.append(String.format(
                            "{\"product\":%s,\"currentStock\":%d,\"minStock\":%d,\"deficit\":%d,\"suggestedQty\":%d,\"estimatedCost\":%.2f,\"supplierName\":\"%s\",\"status\":\"%s\"}",
                            JsonUtil.toJson(p), item.get("currentStock"), item.get("minStock"), item.get("deficit"),
                            item.get("suggestedQty"), item.get("estimatedCost"), JsonUtil.escape((String) item.get("supplierName")),
                            item.get("status")
                        ));
                        if (i < list.size() - 1) sb.append(",");
                    }
                    sb.append("]");
                    sendJson(exchange, 200, sb.toString());
                }
                // --- PROFIT & LOSS ---
                else if (path.equals("/api/profit-loss") && "GET".equalsIgnoreCase(method)) {
                    Map<String, Object> stats = store.getProfitLossAnalytics();
                    String json = String.format(
                        "{\"totalRevenue\":%.2f,\"totalCOGS\":%.2f,\"grossProfit\":%.2f,\"totalLoss\":%.2f,\"netProfit\":%.2f,\"profitMargin\":%.2f}",
                        stats.get("totalRevenue"), stats.get("totalCOGS"), stats.get("grossProfit"),
                        stats.get("totalLoss"), stats.get("netProfit"), stats.get("profitMargin")
                    );
                    sendJson(exchange, 200, json);
                }
                // --- ALERTS ---
                else if (path.equals("/api/alerts") && "GET".equalsIgnoreCase(method)) {
                    List<Alert> list = store.getAlerts();
                    String json = "[" + list.stream().map(JsonUtil::toJson).collect(Collectors.joining(",")) + "]";
                    sendJson(exchange, 200, json);
                } else if (path.matches("/api/alerts/[^/]+/read") && "PUT".equalsIgnoreCase(method)) {
                    String[] parts = path.split("/");
                    store.markAlertRead(parts[3]);
                    sendJson(exchange, 200, "{\"success\":true}");
                } else if (path.matches("/api/alerts/[^/]+/resolve") && "PUT".equalsIgnoreCase(method)) {
                    String[] parts = path.split("/");
                    store.resolveAlert(parts[3]);
                    sendJson(exchange, 200, "{\"success\":true}");
                }
                // --- USERS ---
                else if (path.equals("/api/users")) {
                    if ("GET".equalsIgnoreCase(method)) {
                        List<User> list = store.getUsers();
                        String json = "[" + list.stream().map(JsonUtil::toJson).collect(Collectors.joining(",")) + "]";
                        sendJson(exchange, 200, json);
                    } else if ("POST".equalsIgnoreCase(method)) {
                        Map<String, String> map = JsonUtil.parseSimpleJson(body);
                        User u = new User(null, map.getOrDefault("name", "New User"), map.getOrDefault("email", ""),
                            map.getOrDefault("role", "staff"), "active", null, null);
                        User created = store.addUser(u);
                        sendJson(exchange, 201, JsonUtil.toJson(created));
                    }
                } else if (path.startsWith("/api/users/")) {
                    String id = path.substring("/api/users/".length());
                    if ("DELETE".equalsIgnoreCase(method)) {
                        boolean ok = store.deleteUser(id);
                        sendJson(exchange, 200, "{\"success\":" + ok + "}");
                    }
                }
                // --- SETTINGS ---
                else if (path.equals("/api/settings")) {
                    if ("GET".equalsIgnoreCase(method)) {
                        sendJson(exchange, 200, JsonUtil.toJson(store.getSettings()));
                    } else if ("PUT".equalsIgnoreCase(method)) {
                        Map<String, String> map = JsonUtil.parseSimpleJson(body);
                        SystemSettings s = store.getSettings();
                        if (map.containsKey("storeName")) s.setStoreName(map.get("storeName"));
                        if (map.containsKey("storeEmail")) s.setStoreEmail(map.get("storeEmail"));
                        if (map.containsKey("storePhone")) s.setStorePhone(map.get("storePhone"));
                        if (map.containsKey("storeAddress")) s.setStoreAddress(map.get("storeAddress"));
                        if (map.containsKey("currency")) s.setCurrency(map.get("currency"));
                        if (map.containsKey("currencySymbol")) s.setCurrencySymbol(map.get("currencySymbol"));
                        if (map.containsKey("taxRate")) s.setTaxRate(parseDouble(map.get("taxRate"), s.getTaxRate()));
                        store.updateSettings(s);
                        sendJson(exchange, 200, JsonUtil.toJson(s));
                    }
                }
                // --- SALES CHECKOUT & RECEIPTS ---
                else if (path.equals("/api/sales/checkout") && "POST".equalsIgnoreCase(method)) {
                    handleCheckout(exchange, body);
                }
                else if (path.equals("/api/sales/receipts") && "GET".equalsIgnoreCase(method)) {
                    List<Map<String, Object>> recs = store.getReceipts();
                    StringBuilder sb = new StringBuilder("[");
                    for (int i = 0; i < recs.size(); i++) {
                        sb.append(mapToJson(recs.get(i)));
                        if (i < recs.size() - 1) sb.append(",");
                    }
                    sb.append("]");
                    sendJson(exchange, 200, sb.toString());
                }
                else if (path.startsWith("/api/sales/receipts/") && "GET".equalsIgnoreCase(method)) {
                    String receiptId = path.substring("/api/sales/receipts/".length());
                    Map<String, Object> rec = store.getReceipt(receiptId);
                    if (rec != null) {
                        sendJson(exchange, 200, mapToJson(rec));
                    } else {
                        sendJson(exchange, 404, "{\"error\":\"Receipt not found\"}");
                    }
                }
                else {
                    sendJson(exchange, 404, "{\"error\":\"Route not found: " + path + "\"}");
                }
            } catch (Exception e) {
                String time = java.time.LocalTime.now().truncatedTo(java.time.temporal.ChronoUnit.SECONDS).toString();
                System.err.printf("[%s] [JAVA ERR 500] %s %s -> %s: %s\n", time, method, path, e.getClass().getSimpleName(), e.getMessage());
                e.printStackTrace();
                sendJson(exchange, 500, "{\"error\":\"Internal Server Error: " + JsonUtil.escape(e.getMessage()) + "\"}");
            }
        }

        private void handleLogin(HttpExchange exchange, String body) throws IOException {
            Map<String, String> map = JsonUtil.parseSimpleJson(body);
            String email = map.getOrDefault("email", "").toLowerCase();
            String password = map.getOrDefault("password", "");

            Optional<User> opt = store.getUsers().stream()
                .filter(u -> u.getEmail().toLowerCase().equals(email))
                .findFirst();

            if (opt.isPresent()) {
                User u = opt.get();
                u.setLastLogin(java.time.Instant.now().toString());
                sendJson(exchange, 200, "{\"success\":true,\"user\":" + JsonUtil.toJson(u) + ",\"token\":\"token-" + UUID.randomUUID() + "\"}");
            } else {
                sendJson(exchange, 401, "{\"success\":false,\"error\":\"Invalid credentials\"}");
            }
        }

        private String readBody(HttpExchange exchange) throws IOException {
            InputStream is = exchange.getRequestBody();
            String clStr = exchange.getRequestHeaders().getFirst("Content-Length");
            if (clStr != null) {
                try {
                    int cl = Integer.parseInt(clStr.trim());
                    if (cl <= 0) return "";
                    byte[] data = is.readNBytes(cl);
                    return new String(data, StandardCharsets.UTF_8);
                } catch (Exception ignored) {}
            }
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            byte[] buf = new byte[2048];
            int read;
            while ((read = is.read(buf)) != -1) {
                baos.write(buf, 0, read);
            }
            return baos.toString(StandardCharsets.UTF_8);
        }

        private void sendJson(HttpExchange exchange, int statusCode, String responseJson) throws IOException {
            byte[] bytes = responseJson.getBytes(StandardCharsets.UTF_8);
            if ("HEAD".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(statusCode, -1);
                return;
            }
            exchange.sendResponseHeaders(statusCode, bytes.length);
            try (OutputStream os = exchange.getResponseBody()) {
                os.write(bytes);
            }

            Long startTime = (Long) exchange.getAttribute("startTime");
            long duration = startTime != null ? System.currentTimeMillis() - startTime : 0;
            String time = java.time.LocalTime.now().truncatedTo(java.time.temporal.ChronoUnit.SECONDS).toString();
            String method = exchange.getRequestMethod();
            String path = exchange.getRequestURI().getPath();
            if (statusCode >= 400) {
                System.err.printf("[%s] [JAVA ERR %d] %s %s (%dms)\n", time, statusCode, method, path, duration);
            } else {
                System.out.printf("[%s] [JAVA %d] %s %s (%dms)\n", time, statusCode, method, path, duration);
            }
        }

        private int parseInt(String val, int defaultVal) {
            try { return Integer.parseInt(val.replaceAll("[^0-9-]", "")); } catch (Exception e) { return defaultVal; }
        }

        private double parseDouble(String val, double defaultVal) {
            try { return Double.parseDouble(val.replaceAll("[^0-9.-]", "")); } catch (Exception e) { return defaultVal; }
        }

        /** Handle POS checkout: parse cart items, stockOut each, build and save receipt */
        @SuppressWarnings("unchecked")
        private void handleCheckout(HttpExchange exchange, String body) throws IOException {
            try {
                // Extract top-level fields
                Map<String, String> topLevel = JsonUtil.parseSimpleJson(body);
                String paymentMethod = topLevel.getOrDefault("paymentMethod", "cash");
                String paymentRef = topLevel.getOrDefault("paymentReference", "");
                String notes = topLevel.getOrDefault("notes", "");
                double grandTotal = parseDouble(topLevel.get("grandTotal"), 0.0);
                double orderDiscount = parseDouble(topLevel.get("discount"), 0.0);

                // Extract customer name from nested customer object
                String customerName = "Walk-in Customer";
                int custStart = body.indexOf("\"customer\"");
                if (custStart != -1) {
                    int nameIdx = body.indexOf("\"name\"", custStart);
                    if (nameIdx != -1) {
                        int valStart = body.indexOf(":", nameIdx) + 1;
                        while (valStart < body.length() && (body.charAt(valStart) == ' ' || body.charAt(valStart) == '"')) valStart++;
                        int valEnd = body.indexOf("\"", valStart);
                        if (valEnd != -1) customerName = body.substring(valStart, valEnd);
                    }
                }

                // Parse items array - extract productId, quantity, unitPrice, discount, serialNumbers
                String receiptNumber = "RCP-" + (System.currentTimeMillis() % 10000000L);
                String now = java.time.Instant.now().toString();

                // Find items array in raw body
                int itemsStart = body.indexOf("\"items\"");
                if (itemsStart == -1) {
                    sendJson(exchange, 400, "{\"error\":\"No items in cart\"}");
                    return;
                }

                // Find array bounds
                int arrOpen = body.indexOf("[", itemsStart);
                int arrClose = -1;
                int depth = 0;
                for (int i = arrOpen; i < body.length(); i++) {
                    if (body.charAt(i) == '[') depth++;
                    else if (body.charAt(i) == ']') { depth--; if (depth == 0) { arrClose = i; break; } }
                }

                if (arrOpen == -1 || arrClose == -1) {
                    sendJson(exchange, 400, "{\"error\":\"Malformed items array\"}");
                    return;
                }

                // Split items by finding each { } object
                String itemsJson = body.substring(arrOpen + 1, arrClose);
                List<String> itemJsons = new ArrayList<>();
                int objDepth = 0; int objStart = -1;
                for (int i = 0; i < itemsJson.length(); i++) {
                    char c = itemsJson.charAt(i);
                    if (c == '{') { if (objDepth == 0) objStart = i; objDepth++; }
                    else if (c == '}') { objDepth--; if (objDepth == 0 && objStart != -1) { itemJsons.add(itemsJson.substring(objStart, i + 1)); objStart = -1; } }
                }

                if (itemJsons.isEmpty()) {
                    sendJson(exchange, 400, "{\"error\":\"Cart is empty\"}");
                    return;
                }

                StringBuilder receiptItemsJson = new StringBuilder("[");
                double subtotal = 0;

                for (int idx = 0; idx < itemJsons.size(); idx++) {
                    String itemStr = itemJsons.get(idx);
                    Map<String, String> itemMap = JsonUtil.parseSimpleJson(itemStr);

                    String productId = itemMap.get("productId");
                    String productName = itemMap.getOrDefault("productName", "Unknown");
                    int qty = parseInt(itemMap.get("quantity"), 1);
                    double unitPrice = parseDouble(itemMap.get("unitPrice"), 0.0);
                    double itemDiscount = parseDouble(itemMap.get("discount"), 0.0);
                    double lineTotal = unitPrice * qty - itemDiscount;
                    subtotal += lineTotal;

                    // Extract serialNumbers array from item JSON
                    List<String> serials = new ArrayList<>();
                    int snStart = itemStr.indexOf("\"serialNumbers\"");
                    if (snStart != -1) {
                        int snArrOpen = itemStr.indexOf("[", snStart);
                        int snArrClose = itemStr.indexOf("]", snArrOpen);
                        if (snArrOpen != -1 && snArrClose != -1) {
                            String snArr = itemStr.substring(snArrOpen + 1, snArrClose);
                            for (String sn : snArr.split(",")) {
                                String cleaned = sn.trim().replaceAll("^\"|\"$", "");
                                if (!cleaned.isEmpty()) serials.add(cleaned);
                            }
                        }
                    }

                    // Perform stock-out
                    Map<String, Object> result = store.stockOut(
                        productId, qty, unitPrice,
                        "usr-1", "Admin",
                        customerName, notes,
                        serials.isEmpty() ? null : serials
                    );

                    if (!Boolean.TRUE.equals(result.get("success"))) {
                        sendJson(exchange, 400, "{\"error\":\"Stock error for " +
                            JsonUtil.escape(productName) + ": " + JsonUtil.escape(String.valueOf(result.get("error"))) + "\"}");
                        return;
                    }

                    receiptItemsJson.append(String.format(
                        "{\"productId\":\"%s\",\"productName\":\"%s\",\"quantity\":%d,\"unitPrice\":%.2f,\"discount\":%.2f,\"total\":%.2f}",
                        JsonUtil.escape(productId), JsonUtil.escape(productName), qty, unitPrice, itemDiscount, lineTotal
                    ));
                    if (idx < itemJsons.size() - 1) receiptItemsJson.append(",");
                }
                receiptItemsJson.append("]");

                // Build receipt JSON
                String receiptJson = String.format(
                    "{\"receiptNumber\":\"%s\",\"createdAt\":\"%s\",\"customerName\":\"%s\",\"items\":%s," +
                    "\"subtotal\":%.2f,\"discount\":%.2f,\"grandTotal\":%.2f," +
                    "\"paymentMethod\":\"%s\",\"paymentReference\":\"%s\",\"notes\":\"%s\",\"status\":\"completed\"}",
                    receiptNumber, now, JsonUtil.escape(customerName),
                    receiptItemsJson.toString(), subtotal, orderDiscount,
                    grandTotal > 0 ? grandTotal : subtotal - orderDiscount,
                    JsonUtil.escape(paymentMethod), JsonUtil.escape(paymentRef), JsonUtil.escape(notes)
                );

                // Save receipt (as raw string map)
                Map<String, Object> receiptMap = new java.util.LinkedHashMap<>();
                receiptMap.put("receiptNumber", receiptNumber);
                receiptMap.put("json", receiptJson);
                store.addReceipt(receiptNumber, receiptMap);

                sendJson(exchange, 200, "{\"success\":true,\"receiptNumber\":\"" + receiptNumber + "\",\"receipt\":" + receiptJson + "}");

            } catch (Exception e) {
                e.printStackTrace();
                sendJson(exchange, 500, "{\"error\":\"Checkout failed: " + JsonUtil.escape(e.getMessage()) + "\"}");
            }
        }

        /** Generic Map<String, Object> to JSON string */
        private String mapToJson(Map<String, Object> map) {
            if (map == null) return "null";
            StringBuilder sb = new StringBuilder("{");
            boolean first = true;
            for (Map.Entry<String, Object> e : map.entrySet()) {
                if (!first) sb.append(",");
                first = false;
                sb.append("\"").append(JsonUtil.escape(e.getKey())).append("\":");
                Object val = e.getValue();
                if (val == null) sb.append("null");
                else if (val instanceof String) sb.append("\"").append(JsonUtil.escape((String) val)).append("\"");
                else if (val instanceof Number || val instanceof Boolean) sb.append(val);
                else sb.append("\"").append(JsonUtil.escape(val.toString())).append("\"");
            }
            sb.append("}");
            return sb.toString();
        }
    }
}
