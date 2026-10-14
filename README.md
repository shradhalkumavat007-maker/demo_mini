<<<<<<< HEAD
# Electronics

[![Open in Bolt](https://bolt.new/static/open-in-bolt.svg)](https://bolt.new/~/sb1-sjb9fk3l)
=======
# ElectroStock - Electronics Inventory & ERP Management System

A full-stack, enterprise-grade Electronics Inventory, Point of Sale, Procurement, and Device Tracking system with:
- **Frontend**: Next.js 13+, React 18, TypeScript, Tailwind CSS, Lucide Icons, Recharts, and Shadcn UI.
- **Backend**: Native Java 21/26 REST API server & Spring Boot 3.2.4 Web MVC on port `8080`.

---

## Quick Start (1-Click Run)

### Launch Everything Together
Double-click:
```bat
start-all.bat
```
This automatically compiles and launches the **Java Backend** on `http://localhost:8080` and the **Next.js Frontend** on `http://localhost:3000` in separate console windows.

### Launch Individually

#### 1. Java Backend (Port 8080)
```bat
start-backend.bat
```
Or:
```bash
cd backend-java
run-backend.bat
```

#### 2. Next.js Frontend (Port 3000)
```bat
start-frontend.bat
```
Or:
```bash
cd Electronics-main
npm run dev
```

---

## System Modules & Features

### 1. Catalog & Products
- **Products (`/products`, `/products/[id]`)**: Comprehensive catalog management with SKU, barcode, warranty period, minimum stock levels, purchase & selling prices.
- **Categories (`/categories`)**: Product classification with automatic live item counts.
- **Suppliers (`/suppliers`, `/suppliers/[id]`)**: Vendor directory, GSTIN tracking, procurement history, and performance metrics.

### 2. Inventory Operations & Tracking
- **Stock In (`/inventory/stock-in`)**: Record inbound shipments, update cost bases, and attach serial numbers.
- **Stock Out (`/inventory/stock-out`)**: Point-of-sale customer dispatches, automatic profit/loss calculation, and warranty generation.
- **Stock History (`/inventory/history`)**: Complete audit trail of every stock movement.
- **Serial / IMEI (`/serial-imei`)**: Individual hardware tracking with status updates (`available`, `sold`, `service`, `reserved`), copy buttons, and CSV exports.
- **Warranty (`/warranty`)**: Digital warranty registration, expiry tracking, claims/RMA processing, and printable certificates.

### 3. Procurement & Replenishment
- **Purchase Center (`/purchase-center`)**: Interactive PO creator with supplier auto-fill, dynamic line items, and estimated GST calculations.
- **Purchase Orders (`/purchase-orders`)**: Order lifecycles (`draft` -> `ordered` -> `received`), order receipts, and 1-click **Receive Items into Inventory**.
- **Reorder Suggestions (`/reorder`)**: Intelligent replenishment recommendations calculating deficits and bulk PO generation.

### 4. Financials & Analytics
- **Profit & Loss (`/profit-loss`)**: Real-time sales revenue, Cost of Goods Sold (COGS), gross profit, profit margins, and visual trend charts.
- **Alerts Center (`/alerts`)**: Notification hub for stock shortages, overdue purchase orders, and expiring warranties.
- **Reports Center (`/reports`)**: Printable and exportable audit reports for inventory valuation, stock movements, and supplier spending.

### 5. Administration
- **User Management (`/users`)**: Staff accounts, role assignments (Admin, Manager, Staff), and access permission matrix.
- **Settings (`/settings`)**: Company profile, currency symbols, tax rates, warning thresholds, theme toggles, and JSON database backup/restore.

---

## Directory Layout
```
Electronics-main/
├── backend-java/               # Complete Java REST Backend (Java 26 / Spring Boot)
│   ├── src/main/java/com/electrostock/
│   │   ├── model/             # Entities: Product, Transaction, SerialImei, etc.
│   │   ├── service/           # DataStore with seed data & business logic
│   │   ├── server/            # Native JDK HTTP REST Server (port 8080)
│   │   ├── controller/        # Spring Boot REST Controllers
│   │   └── config/            # CORS & Web configuration
│   ├── pom.xml                # Maven build definition
│   └── run-backend.bat        # 1-click compilation and execution script
├── Electronics-main/           # Next.js 13 Fullstack Frontend
│   ├── app/                   # App router pages & layouts
│   ├── components/            # UI components (data-table, dialogs, badges)
│   ├── services/              # API Client & business services
│   ├── store/                 # Zustand inventory & authentication state
│   └── types/                 # TypeScript interfaces
├── start-all.bat              # 1-Click Full-Stack Launcher
├── start-backend.bat          # 1-Click Java Backend Launcher
└── start-frontend.bat         # 1-Click Frontend Launcher
```
>>>>>>> 60f4b38 (feat: complete electronics inventory & ERP system with Java backend and Next.js frontend)
