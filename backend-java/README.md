# ElectroStock Java Backend

Full-featured Enterprise Java REST API Backend for the **ElectroStock Electronics Inventory & ERP System**.

## Technology Stack
- **Java**: 21 / 26 (SE Runtime)
- **Framework Options**:
  - **Native High-Performance JDK Server**: `com.sun.net.httpserver.HttpServer` (zero external dependencies, runs instantly on any machine with JDK)
  - **Spring Boot 3.2.4**: Full enterprise Spring Web MVC with REST Controllers, CORS configuration, and Jackson JSON support

---

## How to Run

### Option 1: 1-Click Run with JDK (Recommended & Instant)
No Maven installation needed!
Simply double-click:
```bat
run-backend.bat
```
Or from the command line:
```bash
cd backend-java
javac -d bin src/main/java/com/electrostock/model/*.java src/main/java/com/electrostock/util/*.java src/main/java/com/electrostock/service/*.java src/main/java/com/electrostock/server/*.java
java -cp bin com.electrostock.server.ElectroStockServer
```
Server starts on **`http://localhost:8080`**.

### Option 2: Run with Maven / Spring Boot
If Maven is installed or inside IntelliJ IDEA / Eclipse:
```bash
cd backend-java
mvn clean spring-boot:run
```

---

## API Endpoints

### 1. Products
- `GET /api/products` - List all products with current stock, price, category, and SKU
- `GET /api/products/{id}` - Get product details by ID
- `POST /api/products` - Create new product
- `PUT /api/products/{id}` - Update product
- `DELETE /api/products/{id}` - Delete product

### 2. Categories & Suppliers
- `GET /api/categories` - List categories with product counts
- `POST /api/categories` - Add category
- `PUT /api/categories/{id}` - Update category
- `DELETE /api/categories/{id}` - Delete category
- `GET /api/suppliers` - List verified suppliers
- `GET /api/suppliers/{id}` - Get supplier details
- `POST /api/suppliers` - Add supplier
- `PUT /api/suppliers/{id}` - Update supplier
- `DELETE /api/suppliers/{id}` - Delete supplier

### 3. Inventory Operations
- `POST /api/inventory/stock-in` - Record inbound shipment, update stock levels, log serial numbers
- `POST /api/inventory/stock-out` - Record customer sales dispatch, compute profit/loss, mark serials sold, auto-issue warranty
- `GET /api/inventory/transactions` - Complete stock in/out audit ledger

### 4. Serial & IMEI Tracking
- `GET /api/serials` - List all tracked serial numbers and IMEIs
- `POST /api/serials` - Register single serial/IMEI
- `PUT /api/serials/{id}` - Update device status (`available`, `sold`, `service`, `reserved`)

### 5. Warranties & Claims
- `GET /api/warranties` - List customer warranty coverages
- `POST /api/warranties` - Issue new warranty certificate
- `POST /api/warranties/{id}/claims` - File and process warranty repair/RMA claim

### 6. Purchase Orders & Reorder
- `GET /api/purchase-orders` - List all purchase orders
- `POST /api/purchase-orders` - Create new purchase order with line items
- `PUT /api/purchase-orders/{id}/status` - Change status (`draft`, `pending`, `approved`, `ordered`, `cancelled`)
- `POST /api/purchase-orders/{id}/receive` - Receive purchase order into inventory
- `GET /api/reorder` - Automated replenishment recommendations for low-stock and out-of-stock products

### 7. Financials & Analytics
- `GET /api/profit-loss` - Real-time revenue, COGS, gross profit, and margin analytics
- `GET /api/alerts` - System alert notifications (stock shortage, overdue POs)
- `PUT /api/alerts/{id}/read` - Mark alert as read
- `PUT /api/alerts/{id}/resolve` - Mark alert as resolved

### 8. Administration & Settings
- `GET /api/users` - List staff and administrator accounts
- `POST /api/users` - Create user
- `PUT /api/users/{id}` - Update user role / details
- `DELETE /api/users/{id}` - Delete user
- `GET /api/settings` - Organization profile and warning thresholds
- `PUT /api/settings` - Update settings
- `POST /api/auth/login` - Authenticate staff credentials
