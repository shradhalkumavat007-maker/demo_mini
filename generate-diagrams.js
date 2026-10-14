const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const outDir = path.join(__dirname, 'diagrams');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

// Common CSS styling for clean, professional white-background diagrams
const fontStack = "system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

console.log('Generating 9 Professional UML & Architecture Diagrams for ElectroStock...');

// ============================================================================
// 1. SYSTEM ARCHITECTURE DIAGRAM
// ============================================================================
const svgArchitecture = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1400 900" width="1400" height="900">
  <rect width="1400" height="900" fill="#FFFFFF"/>
  
  <!-- Header -->
  <rect x="50" y="30" width="1300" height="60" rx="8" fill="#1E293B"/>
  <text x="700" y="68" font-family="${fontStack}" font-size="22" font-weight="bold" fill="#FFFFFF" text-anchor="middle" letter-spacing="1">
    ElectroStock - Electronics Inventory &amp; ERP System Architecture
  </text>
  
  <!-- Subtitle -->
  <text x="700" y="115" font-family="${fontStack}" font-size="14" fill="#64748B" text-anchor="middle">
    3-Tier Enterprise Architecture: Client Presentation Layer | Application &amp; REST Logic Layer | Oracle Database Persistence
  </text>

  <!-- ================= TIER 1: PRESENTATION LAYER ================= -->
  <rect x="50" y="140" width="1300" height="200" rx="8" fill="#F8FAFC" stroke="#94A3B8" stroke-width="1.5" stroke-dasharray="6,4"/>
  <rect x="70" y="150" width="260" height="28" rx="4" fill="#0284C7"/>
  <text x="200" y="169" font-family="${fontStack}" font-size="13" font-weight="bold" fill="#FFFFFF" text-anchor="middle">
    TIER 1: PRESENTATION LAYER
  </text>

  <!-- Browser / UI Box -->
  <g transform="translate(100, 195)">
    <rect width="320" height="125" rx="6" fill="#FFFFFF" stroke="#0284C7" stroke-width="2"/>
    <rect width="320" height="32" rx="6" fill="#E0F2FE"/>
    <text x="160" y="21" font-family="${fontStack}" font-size="13" font-weight="bold" fill="#0369A1" text-anchor="middle">Web Client (Browser)</text>
    <text x="20" y="55" font-family="${fontStack}" font-size="12" fill="#334155">• Next.js 13+ Responsive UI (Port 3000)</text>
    <text x="20" y="75" font-family="${fontStack}" font-size="12" fill="#334155">• React 18 Components &amp; Hooks</text>
    <text x="20" y="95" font-family="${fontStack}" font-size="12" fill="#334155">• Tailwind CSS &amp; Radix UI Primitives</text>
    <text x="20" y="115" font-family="${fontStack}" font-size="12" fill="#334155">• Lucide Icons &amp; Recharts Analytics</text>
  </g>

  <!-- Modules Box -->
  <g transform="translate(480, 195)">
    <rect width="440" height="125" rx="6" fill="#FFFFFF" stroke="#0284C7" stroke-width="2"/>
    <rect width="440" height="32" rx="6" fill="#E0F2FE"/>
    <text x="220" y="21" font-family="${fontStack}" font-size="13" font-weight="bold" fill="#0369A1" text-anchor="middle">Application Modules</text>
    <text x="20" y="55" font-family="${fontStack}" font-size="12" fill="#334155">• Catalog &amp; Products (/products)</text>
    <text x="20" y="75" font-family="${fontStack}" font-size="12" fill="#334155">• Inventory Operations (/inventory/stock-in, /stock-out)</text>
    <text x="20" y="95" font-family="${fontStack}" font-size="12" fill="#334155">• Hardware Serial &amp; IMEI Tracker (/serial-imei)</text>
    <text x="20" y="115" font-family="${fontStack}" font-size="12" fill="#334155">• Warranty Certificates &amp; RMA Claims (/warranty)</text>
    <text x="240" y="55" font-family="${fontStack}" font-size="12" fill="#334155">• Purchase Center (/purchase-orders)</text>
    <text x="240" y="75" font-family="${fontStack}" font-size="12" fill="#334155">• POS Receipt Generator (/receipts)</text>
    <text x="240" y="95" font-family="${fontStack}" font-size="12" fill="#334155">• Profit &amp; Loss Financials (/profit-loss)</text>
    <text x="240" y="115" font-family="${fontStack}" font-size="12" fill="#334155">• System Settings &amp; Users (/settings)</text>
  </g>

  <!-- State & Client Service Box -->
  <g transform="translate(980, 195)">
    <rect width="320" height="125" rx="6" fill="#FFFFFF" stroke="#0284C7" stroke-width="2"/>
    <rect width="320" height="32" rx="6" fill="#E0F2FE"/>
    <text x="160" y="21" font-family="${fontStack}" font-size="13" font-weight="bold" fill="#0369A1" text-anchor="middle">Client State &amp; Peripherals</text>
    <text x="20" y="55" font-family="${fontStack}" font-size="12" fill="#334155">• Zustand Centralized Store</text>
    <text x="20" y="75" font-family="${fontStack}" font-size="12" fill="#334155">• API Client (api-client.ts)</text>
    <text x="20" y="95" font-family="${fontStack}" font-size="12" fill="#334155">• Barcode / QR Scanner Integration</text>
    <text x="20" y="115" font-family="${fontStack}" font-size="12" fill="#334155">• CSV &amp; PDF Receipt Export Service</text>
  </g>

  <!-- Flow Arrow Tier 1 -> Tier 2 -->
  <line x1="700" y1="340" x2="700" y2="380" stroke="#0284C7" stroke-width="2.5" marker-end="url(#arrow-blue)"/>
  <text x="710" y="365" font-family="${fontStack}" font-size="11" font-weight="600" fill="#0284C7">HTTP / JSON REST API</text>

  <!-- ================= TIER 2: LOGIC & BACKEND LAYER ================= -->
  <rect x="50" y="380" width="1300" height="250" rx="8" fill="#F8FAFC" stroke="#94A3B8" stroke-width="1.5" stroke-dasharray="6,4"/>
  <rect x="70" y="390" width="310" height="28" rx="4" fill="#2563EB"/>
  <text x="225" y="409" font-family="${fontStack}" font-size="13" font-weight="bold" fill="#FFFFFF" text-anchor="middle">
    TIER 2: APPLICATION &amp; REST LOGIC LAYER
  </text>

  <!-- Next.js API Proxy Box -->
  <g transform="translate(100, 435)">
    <rect width="320" height="175" rx="6" fill="#FFFFFF" stroke="#2563EB" stroke-width="2"/>
    <rect width="320" height="32" rx="6" fill="#DBEAFE"/>
    <text x="160" y="21" font-family="${fontStack}" font-size="13" font-weight="bold" fill="#1D4ED8" text-anchor="middle">Next.js Edge API Proxy (Port 3000)</text>
    <text x="20" y="55" font-family="${fontStack}" font-size="12" fill="#334155">• /api/products (Proxy to Java &amp; DB)</text>
    <text x="20" y="75" font-family="${fontStack}" font-size="12" fill="#334155">• /api/transactions (Proxy to Java &amp; DB)</text>
    <text x="20" y="95" font-family="${fontStack}" font-size="12" fill="#334155">• /api/oracle (Live Telemetry &amp; Stats)</text>
    <text x="20" y="115" font-family="${fontStack}" font-size="12" fill="#334155">• /api/health (Diagnostics)</text>
    <text x="20" y="135" font-family="${fontStack}" font-size="12" fill="#334155">• SQLite Local Dev Cache (Prisma)</text>
    <text x="20" y="155" font-family="${fontStack}" font-size="12" fill="#334155">• Automatic Request Forwarding</text>
  </g>

  <!-- Java 26 Native REST API Server Box -->
  <g transform="translate(480, 435)">
    <rect width="440" height="175" rx="6" fill="#FFFFFF" stroke="#2563EB" stroke-width="2"/>
    <rect width="440" height="32" rx="6" fill="#DBEAFE"/>
    <text x="220" y="21" font-family="${fontStack}" font-size="13" font-weight="bold" fill="#1D4ED8" text-anchor="middle">Java 26 REST API Server (Port 8085)</text>
    <text x="20" y="55" font-family="${fontStack}" font-size="12" fill="#334155">• ElectroStockServer (JDK HttpServer Engine)</text>
    <text x="20" y="75" font-family="${fontStack}" font-size="12" fill="#334155">• Multithreaded Executor Pool (16 Threads)</text>
    <text x="20" y="95" font-family="${fontStack}" font-size="12" fill="#334155">• Full CORS Headers &amp; Preflight Support</text>
    <text x="20" y="115" font-family="${fontStack}" font-size="12" fill="#334155">• Live Terminal Heartbeat Monitor Thread</text>
    <text x="20" y="135" font-family="${fontStack}" font-size="12" fill="#334155">• Fast JSON Parser / Serializer (JsonUtil)</text>
    <text x="20" y="155" font-family="${fontStack}" font-size="12" fill="#334155">• Dynamic Port Binding (8085 / 8080 fallback)</text>
  </g>

  <!-- Business Logic & Oracle Service Box -->
  <g transform="translate(980, 435)">
    <rect width="320" height="175" rx="6" fill="#FFFFFF" stroke="#2563EB" stroke-width="2"/>
    <rect width="320" height="32" rx="6" fill="#DBEAFE"/>
    <text x="160" y="21" font-family="${fontStack}" font-size="13" font-weight="bold" fill="#1D4ED8" text-anchor="middle">Core Services &amp; Persistence</text>
    <text x="20" y="55" font-family="${fontStack}" font-size="12" fill="#334155">• DataStore.java (Thread-safe Cache)</text>
    <text x="20" y="75" font-family="${fontStack}" font-size="12" fill="#334155">• OracleDbService.java (JDBC Bridge)</text>
    <text x="20" y="95" font-family="${fontStack}" font-size="12" fill="#334155">• Stock-In &amp; Stock-Out Validator</text>
    <text x="20" y="115" font-family="${fontStack}" font-size="12" fill="#334155">• COGS &amp; Gross Profit/Loss Engine</text>
    <text x="20" y="135" font-family="${fontStack}" font-size="12" fill="#334155">• Warranty Lifecycle State Machine</text>
    <text x="20" y="155" font-family="${fontStack}" font-size="12" fill="#334155">• Automated Low-Stock Alert Monitor</text>
  </g>

  <!-- Flow Arrow Tier 2 -> Tier 3 -->
  <line x1="700" y1="630" x2="700" y2="670" stroke="#2563EB" stroke-width="2.5" marker-end="url(#arrow-blue)"/>
  <text x="710" y="655" font-family="${fontStack}" font-size="11" font-weight="600" fill="#2563EB">Oracle JDBC Thin Protocol (TCP 1521)</text>

  <!-- ================= TIER 3: DATABASE TIER ================= -->
  <rect x="50" y="670" width="1300" height="190" rx="8" fill="#F8FAFC" stroke="#94A3B8" stroke-width="1.5" stroke-dasharray="6,4"/>
  <rect x="70" y="680" width="280" height="28" rx="4" fill="#0D9488"/>
  <text x="210" y="699" font-family="${fontStack}" font-size="13" font-weight="bold" fill="#FFFFFF" text-anchor="middle">
    TIER 3: DATABASE PERSISTENCE LAYER
  </text>

  <!-- Oracle XE Cylinder & Details -->
  <g transform="translate(100, 725)">
    <rect width="320" height="115" rx="6" fill="#FFFFFF" stroke="#0D9488" stroke-width="2"/>
    <rect width="320" height="30" rx="6" fill="#CCFBF1"/>
    <text x="160" y="20" font-family="${fontStack}" font-size="13" font-weight="bold" fill="#0F766E" text-anchor="middle">Oracle Database 10g Express Edition</text>
    <text x="20" y="52" font-family="${fontStack}" font-size="12" fill="#334155">• Instance SID: XE | Port: 1521</text>
    <text x="20" y="72" font-family="${fontStack}" font-size="12" fill="#334155">• Schema / User: system / 123456</text>
    <text x="20" y="92" font-family="${fontStack}" font-size="12" fill="#334155">• JDBC: jdbc:oracle:thin:@localhost:1521:XE</text>
  </g>

  <!-- Database Tables Box -->
  <g transform="translate(480, 725)">
    <rect width="780" height="115" rx="6" fill="#FFFFFF" stroke="#0D9488" stroke-width="2"/>
    <rect width="780" height="30" rx="6" fill="#CCFBF1"/>
    <text x="390" y="20" font-family="${fontStack}" font-size="13" font-weight="bold" fill="#0F766E" text-anchor="middle">ElectroStock Oracle SQL Database Relational Schema</text>
    <text x="20" y="52" font-family="${fontStack}" font-size="12" fill="#334155">• PRODUCTS (Catalog, SKU, Brand, Stock, Prices)</text>
    <text x="20" y="72" font-family="${fontStack}" font-size="12" fill="#334155">• TRANSACTIONS (Stock-In, Stock-Out, Profit/Loss, Audit)</text>
    <text x="20" y="92" font-family="${fontStack}" font-size="12" fill="#334155">• SERIAL_IMEI (Individual Hardware SN Tracking)</text>
    <text x="390" y="52" font-family="${fontStack}" font-size="12" fill="#334155">• CATEGORIES &amp; SUPPLIERS (GSTIN, Terms)</text>
    <text x="390" y="72" font-family="${fontStack}" font-size="12" fill="#334155">• WARRANTIES &amp; WARRANTY_CLAIMS (RMA)</text>
    <text x="390" y="92" font-family="${fontStack}" font-size="12" fill="#334155">• PURCHASE_ORDERS &amp; SALES_RECEIPTS</text>
  </g>

  <!-- Markers -->
  <defs>
    <marker id="arrow-blue" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#2563EB"/>
    </marker>
  </defs>
</svg>`;

fs.writeFileSync(path.join(outDir, '01_system_architecture.svg'), svgArchitecture);
console.log('✓ 01_system_architecture.svg created');

// ============================================================================
// 2. UML USE CASE DIAGRAM
// ============================================================================
const svgUseCase = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1300 950" width="1300" height="950">
  <rect width="1300" height="950" fill="#FFFFFF"/>
  
  <!-- Header -->
  <rect x="50" y="25" width="1200" height="55" rx="8" fill="#1E293B"/>
  <text x="650" y="60" font-family="${fontStack}" font-size="20" font-weight="bold" fill="#FFFFFF" text-anchor="middle">
    ElectroStock - UML Use Case Diagram
  </text>

  <!-- System Boundary -->
  <rect x="360" y="105" width="600" height="810" rx="10" fill="#F8FAFC" stroke="#334155" stroke-width="2"/>
  <text x="660" y="135" font-family="${fontStack}" font-size="15" font-weight="bold" fill="#1E293B" text-anchor="middle">
    ElectroStock Inventory &amp; ERP Management System
  </text>

  <!-- Actor 1: Administrator -->
  <g transform="translate(120, 200)">
    <circle cx="40" cy="30" r="18" fill="#FFFFFF" stroke="#0F172A" stroke-width="2"/>
    <line x1="40" y1="48" x2="40" y2="95" stroke="#0F172A" stroke-width="2"/>
    <line x1="10" y1="65" x2="70" y2="65" stroke="#0F172A" stroke-width="2"/>
    <line x1="40" y1="95" x2="15" y2="135" stroke="#0F172A" stroke-width="2"/>
    <line x1="40" y1="95" x2="65" y2="135" stroke="#0F172A" stroke-width="2"/>
    <text x="40" y="160" font-family="${fontStack}" font-size="13" font-weight="bold" fill="#0F172A" text-anchor="middle">Administrator</text>
  </g>

  <!-- Actor 2: Store Manager -->
  <g transform="translate(120, 410)">
    <circle cx="40" cy="30" r="18" fill="#FFFFFF" stroke="#0F172A" stroke-width="2"/>
    <line x1="40" y1="48" x2="40" y2="95" stroke="#0F172A" stroke-width="2"/>
    <line x1="10" y1="65" x2="70" y2="65" stroke="#0F172A" stroke-width="2"/>
    <line x1="40" y1="95" x2="15" y2="135" stroke="#0F172A" stroke-width="2"/>
    <line x1="40" y1="95" x2="65" y2="135" stroke="#0F172A" stroke-width="2"/>
    <text x="40" y="160" font-family="${fontStack}" font-size="13" font-weight="bold" fill="#0F172A" text-anchor="middle">Store Manager</text>
  </g>

  <!-- Actor 3: Cashier / POS Staff -->
  <g transform="translate(120, 630)">
    <circle cx="40" cy="30" r="18" fill="#FFFFFF" stroke="#0F172A" stroke-width="2"/>
    <line x1="40" y1="48" x2="40" y2="95" stroke="#0F172A" stroke-width="2"/>
    <line x1="10" y1="65" x2="70" y2="65" stroke="#0F172A" stroke-width="2"/>
    <line x1="40" y1="95" x2="15" y2="135" stroke="#0F172A" stroke-width="2"/>
    <line x1="40" y1="95" x2="65" y2="135" stroke="#0F172A" stroke-width="2"/>
    <text x="40" y="160" font-family="${fontStack}" font-size="13" font-weight="bold" fill="#0F172A" text-anchor="middle">Cashier / POS Staff</text>
  </g>

  <!-- Actor 4: Technician / Support -->
  <g transform="translate(1080, 410)">
    <circle cx="40" cy="30" r="18" fill="#FFFFFF" stroke="#0F172A" stroke-width="2"/>
    <line x1="40" y1="48" x2="40" y2="95" stroke="#0F172A" stroke-width="2"/>
    <line x1="10" y1="65" x2="70" y2="65" stroke="#0F172A" stroke-width="2"/>
    <line x1="40" y1="95" x2="15" y2="135" stroke="#0F172A" stroke-width="2"/>
    <line x1="40" y1="95" x2="65" y2="135" stroke="#0F172A" stroke-width="2"/>
    <text x="40" y="160" font-family="${fontStack}" font-size="13" font-weight="bold" fill="#0F172A" text-anchor="middle">Technician / Support</text>
  </g>

  <!-- Actor 5: Oracle Database Server -->
  <g transform="translate(1080, 650)">
    <rect x="0" y="10" width="90" height="90" rx="6" fill="#F1F5F9" stroke="#0D9488" stroke-width="2"/>
    <text x="45" y="45" font-family="${fontStack}" font-size="11" font-weight="bold" fill="#0F766E" text-anchor="middle">&lt;&lt;System&gt;&gt;</text>
    <text x="45" y="65" font-family="${fontStack}" font-size="12" font-weight="bold" fill="#0F766E" text-anchor="middle">Oracle DB</text>
    <text x="45" y="80" font-family="${fontStack}" font-size="11" fill="#0F766E" text-anchor="middle">(XE Engine)</text>
  </g>

  <!-- Use Cases Inside Boundary -->
  <!-- UC1 -->
  <g transform="translate(430, 160)">
    <ellipse cx="140" cy="25" rx="130" ry="24" fill="#FFFFFF" stroke="#2563EB" stroke-width="2"/>
    <text x="140" y="30" font-family="${fontStack}" font-size="12" font-weight="bold" fill="#1E293B" text-anchor="middle">Manage System Users &amp; Roles</text>
  </g>

  <!-- UC2 -->
  <g transform="translate(680, 190)">
    <ellipse cx="130" cy="25" rx="120" ry="24" fill="#FFFFFF" stroke="#2563EB" stroke-width="2"/>
    <text x="130" y="30" font-family="${fontStack}" font-size="12" font-weight="bold" fill="#1E293B" text-anchor="middle">System Settings &amp; Backup</text>
  </g>

  <!-- UC3 -->
  <g transform="translate(420, 240)">
    <ellipse cx="140" cy="25" rx="130" ry="24" fill="#FFFFFF" stroke="#2563EB" stroke-width="2"/>
    <text x="140" y="30" font-family="${fontStack}" font-size="12" font-weight="bold" fill="#1E293B" text-anchor="middle">Manage Catalog &amp; Products</text>
  </g>

  <!-- UC4 -->
  <g transform="translate(420, 320)">
    <ellipse cx="140" cy="25" rx="130" ry="24" fill="#FFFFFF" stroke="#2563EB" stroke-width="2"/>
    <text x="140" y="30" font-family="${fontStack}" font-size="12" font-weight="bold" fill="#1E293B" text-anchor="middle">Stock Inbound Consignments</text>
  </g>

  <!-- UC5 -->
  <g transform="translate(680, 320)">
    <ellipse cx="130" cy="25" rx="120" ry="24" fill="#FFFFFF" stroke="#2563EB" stroke-width="2"/>
    <text x="130" y="30" font-family="${fontStack}" font-size="12" font-weight="bold" fill="#1E293B" text-anchor="middle">Purchase Orders &amp; Suppliers</text>
  </g>

  <!-- UC6 -->
  <g transform="translate(420, 410)">
    <ellipse cx="140" cy="25" rx="130" ry="24" fill="#FFFFFF" stroke="#2563EB" stroke-width="2"/>
    <text x="140" y="30" font-family="${fontStack}" font-size="12" font-weight="bold" fill="#1E293B" text-anchor="middle">Process Customer POS Sale</text>
  </g>

  <!-- UC7 -->
  <g transform="translate(680, 440)">
    <ellipse cx="130" cy="25" rx="120" ry="24" fill="#FFFFFF" stroke="#2563EB" stroke-width="2"/>
    <text x="130" y="30" font-family="${fontStack}" font-size="12" font-weight="bold" fill="#1E293B" text-anchor="middle">Generate Sales Receipts</text>
  </g>

  <!-- UC8 -->
  <g transform="translate(420, 500)">
    <ellipse cx="140" cy="25" rx="130" ry="24" fill="#FFFFFF" stroke="#2563EB" stroke-width="2"/>
    <text x="140" y="30" font-family="${fontStack}" font-size="12" font-weight="bold" fill="#1E293B" text-anchor="middle">Track Hardware Serial / IMEI</text>
  </g>

  <!-- UC9 -->
  <g transform="translate(680, 530)">
    <ellipse cx="130" cy="25" rx="120" ry="24" fill="#FFFFFF" stroke="#2563EB" stroke-width="2"/>
    <text x="130" y="30" font-family="${fontStack}" font-size="12" font-weight="bold" fill="#1E293B" text-anchor="middle">Manage Digital Warranties</text>
  </g>

  <!-- UC10 -->
  <g transform="translate(680, 620)">
    <ellipse cx="130" cy="25" rx="120" ry="24" fill="#FFFFFF" stroke="#2563EB" stroke-width="2"/>
    <text x="130" y="30" font-family="${fontStack}" font-size="12" font-weight="bold" fill="#1E293B" text-anchor="middle">Process RMA Warranty Claims</text>
  </g>

  <!-- UC11 -->
  <g transform="translate(420, 650)">
    <ellipse cx="140" cy="25" rx="130" ry="24" fill="#FFFFFF" stroke="#2563EB" stroke-width="2"/>
    <text x="140" y="30" font-family="${fontStack}" font-size="12" font-weight="bold" fill="#1E293B" text-anchor="middle">Audit Stock History &amp; Profit/Loss</text>
  </g>

  <!-- UC12 -->
  <g transform="translate(540, 750)">
    <ellipse cx="150" cy="28" rx="140" ry="26" fill="#CCFBF1" stroke="#0D9488" stroke-width="2"/>
    <text x="150" y="33" font-family="${fontStack}" font-size="12" font-weight="bold" fill="#0F766E" text-anchor="middle">Persist &amp; Sync to Oracle SQL DB</text>
  </g>

  <!-- Association Lines -->
  <!-- Admin -> UC1, UC2, UC3, UC5, UC11 -->
  <line x1="200" y1="230" x2="430" y2="185" stroke="#64748B" stroke-width="1.5"/>
  <line x1="200" y1="240" x2="680" y2="215" stroke="#64748B" stroke-width="1.5"/>
  <line x1="200" y1="250" x2="420" y2="265" stroke="#64748B" stroke-width="1.5"/>
  <line x1="200" y1="260" x2="420" y2="675" stroke="#64748B" stroke-width="1.5"/>

  <!-- Manager -> UC3, UC4, UC5, UC11 -->
  <line x1="200" y1="460" x2="420" y2="270" stroke="#64748B" stroke-width="1.5"/>
  <line x1="200" y1="470" x2="420" y2="345" stroke="#64748B" stroke-width="1.5"/>
  <line x1="200" y1="480" x2="680" y2="345" stroke="#64748B" stroke-width="1.5"/>
  <line x1="200" y1="490" x2="420" y2="675" stroke="#64748B" stroke-width="1.5"/>

  <!-- Cashier -> UC6, UC7, UC8 -->
  <line x1="200" y1="680" x2="420" y2="435" stroke="#64748B" stroke-width="1.5"/>
  <line x1="200" y1="690" x2="680" y2="465" stroke="#64748B" stroke-width="1.5"/>
  <line x1="200" y1="700" x2="420" y2="525" stroke="#64748B" stroke-width="1.5"/>

  <!-- Tech -> UC8, UC9, UC10 -->
  <line x1="1080" y1="460" x2="700" y2="525" stroke="#64748B" stroke-width="1.5"/>
  <line x1="1080" y1="470" x2="810" y2="555" stroke="#64748B" stroke-width="1.5"/>
  <line x1="1080" y1="480" x2="810" y2="645" stroke="#64748B" stroke-width="1.5"/>

  <!-- <<include>> relationships -->
  <!-- UC6 includes UC7 -->
  <line x1="560" y1="435" x2="680" y2="460" stroke="#0284C7" stroke-width="1.5" stroke-dasharray="4,3"/>
  <text x="610" y="440" font-family="${fontStack}" font-size="10" fill="#0284C7">&lt;&lt;include&gt;&gt;</text>

  <!-- UC6 includes UC9 -->
  <line x1="550" y1="445" x2="690" y2="535" stroke="#0284C7" stroke-width="1.5" stroke-dasharray="4,3"/>
  <text x="615" y="495" font-family="${fontStack}" font-size="10" fill="#0284C7">&lt;&lt;include&gt;&gt;</text>

  <!-- UC12 connected to Oracle DB -->
  <line x1="840" y1="770" x2="1080" y2="700" stroke="#0D9488" stroke-width="2"/>
</svg>`;

fs.writeFileSync(path.join(outDir, '02_use_case_diagram.svg'), svgUseCase);
console.log('✓ 02_use_case_diagram.svg created');

// ============================================================================
// 3. UML CLASS DIAGRAM
// ============================================================================
const svgClass = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1500 1100" width="1500" height="1100">
  <rect width="1500" height="1100" fill="#FFFFFF"/>
  
  <!-- Header -->
  <rect x="50" y="25" width="1400" height="55" rx="8" fill="#1E293B"/>
  <text x="750" y="60" font-family="${fontStack}" font-size="20" font-weight="bold" fill="#FFFFFF" text-anchor="middle">
    ElectroStock - UML Class Diagram
  </text>

  <!-- Class 1: Product -->
  <g transform="translate(480, 120)">
    <rect width="280" height="230" rx="4" fill="#FFFFFF" stroke="#2563EB" stroke-width="2"/>
    <rect width="280" height="30" rx="4" fill="#DBEAFE"/>
    <text x="140" y="20" font-family="${fontStack}" font-size="14" font-weight="bold" fill="#1D4ED8" text-anchor="middle">Product</text>
    <line x1="0" y1="30" x2="280" y2="30" stroke="#2563EB" stroke-width="1.5"/>
    <text x="12" y="50" font-family="${fontStack}" font-size="11" fill="#1E293B">- id: String</text>
    <text x="12" y="68" font-family="${fontStack}" font-size="11" fill="#1E293B">- name: String</text>
    <text x="12" y="86" font-family="${fontStack}" font-size="11" fill="#1E293B">- sku: String</text>
    <text x="12" y="104" font-family="${fontStack}" font-size="11" fill="#1E293B">- categoryId: String</text>
    <text x="12" y="122" font-family="${fontStack}" font-size="11" fill="#1E293B">- brand: String</text>
    <text x="12" y="140" font-family="${fontStack}" font-size="11" fill="#1E293B">- stock: int</text>
    <text x="12" y="158" font-family="${fontStack}" font-size="11" fill="#1E293B">- purchasePrice: double</text>
    <text x="12" y="176" font-family="${fontStack}" font-size="11" fill="#1E293B">- sellingPrice: double</text>
    <line x1="0" y1="186" x2="280" y2="186" stroke="#2563EB" stroke-width="1"/>
    <text x="12" y="204" font-family="${fontStack}" font-size="11" fill="#1E293B">+ getStockStatus(): String</text>
    <text x="12" y="220" font-family="${fontStack}" font-size="11" fill="#1E293B">+ updateStock(qty: int): void</text>
  </g>

  <!-- Class 2: Category -->
  <g transform="translate(100, 150)">
    <rect width="240" height="150" rx="4" fill="#FFFFFF" stroke="#2563EB" stroke-width="2"/>
    <rect width="240" height="30" rx="4" fill="#DBEAFE"/>
    <text x="120" y="20" font-family="${fontStack}" font-size="14" font-weight="bold" fill="#1D4ED8" text-anchor="middle">Category</text>
    <line x1="0" y1="30" x2="240" y2="30" stroke="#2563EB" stroke-width="1.5"/>
    <text x="12" y="52" font-family="${fontStack}" font-size="11" fill="#1E293B">- id: String</text>
    <text x="12" y="70" font-family="${fontStack}" font-size="11" fill="#1E293B">- name: String</text>
    <text x="12" y="88" font-family="${fontStack}" font-size="11" fill="#1E293B">- description: String</text>
    <text x="12" y="106" font-family="${fontStack}" font-size="11" fill="#1E293B">- productCount: int</text>
    <line x1="0" y1="116" x2="240" y2="116" stroke="#2563EB" stroke-width="1"/>
    <text x="12" y="136" font-family="${fontStack}" font-size="11" fill="#1E293B">+ recalculateCounts(): void</text>
  </g>

  <!-- Class 3: Supplier -->
  <g transform="translate(900, 130)">
    <rect width="250" height="180" rx="4" fill="#FFFFFF" stroke="#2563EB" stroke-width="2"/>
    <rect width="250" height="30" rx="4" fill="#DBEAFE"/>
    <text x="125" y="20" font-family="${fontStack}" font-size="14" font-weight="bold" fill="#1D4ED8" text-anchor="middle">Supplier</text>
    <line x1="0" y1="30" x2="250" y2="30" stroke="#2563EB" stroke-width="1.5"/>
    <text x="12" y="52" font-family="${fontStack}" font-size="11" fill="#1E293B">- id: String</text>
    <text x="12" y="70" font-family="${fontStack}" font-size="11" fill="#1E293B">- name: String</text>
    <text x="12" y="88" font-family="${fontStack}" font-size="11" fill="#1E293B">- company: String</text>
    <text x="12" y="106" font-family="${fontStack}" font-size="11" fill="#1E293B">- gstin: String</text>
    <text x="12" y="124" font-family="${fontStack}" font-size="11" fill="#1E293B">- status: String</text>
    <line x1="0" y1="134" x2="250" y2="134" stroke="#2563EB" stroke-width="1"/>
    <text x="12" y="156" font-family="${fontStack}" font-size="11" fill="#1E293B">+ getOrders(): List&lt;PO&gt;</text>
  </g>

  <!-- Class 4: Transaction -->
  <g transform="translate(100, 430)">
    <rect width="270" height="220" rx="4" fill="#FFFFFF" stroke="#2563EB" stroke-width="2"/>
    <rect width="270" height="30" rx="4" fill="#DBEAFE"/>
    <text x="135" y="20" font-family="${fontStack}" font-size="14" font-weight="bold" fill="#1D4ED8" text-anchor="middle">Transaction</text>
    <line x1="0" y1="30" x2="270" y2="30" stroke="#2563EB" stroke-width="1.5"/>
    <text x="12" y="52" font-family="${fontStack}" font-size="11" fill="#1E293B">- id: String</text>
    <text x="12" y="70" font-family="${fontStack}" font-size="11" fill="#1E293B">- productId: String</text>
    <text x="12" y="88" font-family="${fontStack}" font-size="11" fill="#1E293B">- type: String (stock_in/out)</text>
    <text x="12" y="106" font-family="${fontStack}" font-size="11" fill="#1E293B">- quantity: int</text>
    <text x="12" y="124" font-family="${fontStack}" font-size="11" fill="#1E293B">- unitPrice: double</text>
    <text x="12" y="142" font-family="${fontStack}" font-size="11" fill="#1E293B">- totalValue: double</text>
    <text x="12" y="160" font-family="${fontStack}" font-size="11" fill="#1E293B">- profitLoss: double</text>
    <line x1="0" y1="170" x2="270" y2="170" stroke="#2563EB" stroke-width="1"/>
    <text x="12" y="192" font-family="${fontStack}" font-size="11" fill="#1E293B">+ computeProfit(): double</text>
    <text x="12" y="210" font-family="${fontStack}" font-size="11" fill="#1E293B">+ toOracleRow(): Object[]</text>
  </g>

  <!-- Class 5: SerialImei -->
  <g transform="translate(480, 440)">
    <rect width="280" height="200" rx="4" fill="#FFFFFF" stroke="#2563EB" stroke-width="2"/>
    <rect width="280" height="30" rx="4" fill="#DBEAFE"/>
    <text x="140" y="20" font-family="${fontStack}" font-size="14" font-weight="bold" fill="#1D4ED8" text-anchor="middle">SerialImei</text>
    <line x1="0" y1="30" x2="280" y2="30" stroke="#2563EB" stroke-width="1.5"/>
    <text x="12" y="52" font-family="${fontStack}" font-size="11" fill="#1E293B">- id: String</text>
    <text x="12" y="70" font-family="${fontStack}" font-size="11" fill="#1E293B">- productId: String</text>
    <text x="12" y="88" font-family="${fontStack}" font-size="11" fill="#1E293B">- serialNumber: String</text>
    <text x="12" y="106" font-family="${fontStack}" font-size="11" fill="#1E293B">- imei: String</text>
    <text x="12" y="124" font-family="${fontStack}" font-size="11" fill="#1E293B">- status: String</text>
    <text x="12" y="142" font-family="${fontStack}" font-size="11" fill="#1E293B">- customerRef: String</text>
    <line x1="0" y1="152" x2="280" y2="152" stroke="#2563EB" stroke-width="1"/>
    <text x="12" y="174" font-family="${fontStack}" font-size="11" fill="#1E293B">+ markSold(cust: String): void</text>
    <text x="12" y="192" font-family="${fontStack}" font-size="11" fill="#1E293B">+ setServiceStatus(): void</text>
  </g>

  <!-- Class 6: Warranty -->
  <g transform="translate(880, 440)">
    <rect width="270" height="200" rx="4" fill="#FFFFFF" stroke="#2563EB" stroke-width="2"/>
    <rect width="270" height="30" rx="4" fill="#DBEAFE"/>
    <text x="135" y="20" font-family="${fontStack}" font-size="14" font-weight="bold" fill="#1D4ED8" text-anchor="middle">Warranty</text>
    <line x1="0" y1="30" x2="270" y2="30" stroke="#2563EB" stroke-width="1.5"/>
    <text x="12" y="52" font-family="${fontStack}" font-size="11" fill="#1E293B">- id: String</text>
    <text x="12" y="70" font-family="${fontStack}" font-size="11" fill="#1E293B">- serialNumber: String</text>
    <text x="12" y="88" font-family="${fontStack}" font-size="11" fill="#1E293B">- customerName: String</text>
    <text x="12" y="106" font-family="${fontStack}" font-size="11" fill="#1E293B">- startDate: Timestamp</text>
    <text x="12" y="124" font-family="${fontStack}" font-size="11" fill="#1E293B">- endDate: Timestamp</text>
    <text x="12" y="142" font-family="${fontStack}" font-size="11" fill="#1E293B">- status: String</text>
    <line x1="0" y1="152" x2="270" y2="152" stroke="#2563EB" stroke-width="1"/>
    <text x="12" y="174" font-family="${fontStack}" font-size="11" fill="#1E293B">+ isExpired(): boolean</text>
    <text x="12" y="192" font-family="${fontStack}" font-size="11" fill="#1E293B">+ addClaim(claim: Claim): void</text>
  </g>

  <!-- Class 7: DataStore (Service) -->
  <g transform="translate(480, 750)">
    <rect width="280" height="240" rx="4" fill="#FFFFFF" stroke="#0F766E" stroke-width="2"/>
    <rect width="280" height="30" rx="4" fill="#CCFBF1"/>
    <text x="140" y="20" font-family="${fontStack}" font-size="14" font-weight="bold" fill="#0F766E" text-anchor="middle">DataStore (Singleton)</text>
    <line x1="0" y1="30" x2="280" y2="30" stroke="#0F766E" stroke-width="1.5"/>
    <text x="12" y="52" font-family="${fontStack}" font-size="11" fill="#1E293B">- instance: DataStore</text>
    <text x="12" y="70" font-family="${fontStack}" font-size="11" fill="#1E293B">- products: List&lt;Product&gt;</text>
    <text x="12" y="88" font-family="${fontStack}" font-size="11" fill="#1E293B">- transactions: List&lt;Transaction&gt;</text>
    <text x="12" y="106" font-family="${fontStack}" font-size="11" fill="#1E293B">- serials: List&lt;SerialImei&gt;</text>
    <line x1="0" y1="116" x2="280" y2="116" stroke="#0F766E" stroke-width="1"/>
    <text x="12" y="136" font-family="${fontStack}" font-size="11" fill="#1E293B">+ getInstance(): DataStore</text>
    <text x="12" y="154" font-family="${fontStack}" font-size="11" fill="#1E293B">+ addProduct(p: Product): Product</text>
    <text x="12" y="172" font-family="${fontStack}" font-size="11" fill="#1E293B">+ stockIn(prodId, qty, ...): Map</text>
    <text x="12" y="190" font-family="${fontStack}" font-size="11" fill="#1E293B">+ stockOut(prodId, qty, ...): Map</text>
    <text x="12" y="208" font-family="${fontStack}" font-size="11" fill="#1E293B">+ seedInitialData(): void</text>
  </g>

  <!-- Class 8: OracleDbService -->
  <g transform="translate(880, 750)">
    <rect width="270" height="240" rx="4" fill="#FFFFFF" stroke="#0F766E" stroke-width="2"/>
    <rect width="270" height="30" rx="4" fill="#CCFBF1"/>
    <text x="135" y="20" font-family="${fontStack}" font-size="14" font-weight="bold" fill="#0F766E" text-anchor="middle">OracleDbService</text>
    <line x1="0" y1="30" x2="270" y2="30" stroke="#0F766E" stroke-width="1.5"/>
    <text x="12" y="52" font-family="${fontStack}" font-size="11" fill="#1E293B">- url: jdbc:oracle:thin:@...:XE</text>
    <text x="12" y="70" font-family="${fontStack}" font-size="11" fill="#1E293B">- user: system</text>
    <text x="12" y="88" font-family="${fontStack}" font-size="11" fill="#1E293B">- pass: 123456</text>
    <line x1="0" y1="98" x2="270" y2="98" stroke="#0F766E" stroke-width="1"/>
    <text x="12" y="118" font-family="${fontStack}" font-size="11" fill="#1E293B">+ isAvailable(): boolean</text>
    <text x="12" y="136" font-family="${fontStack}" font-size="11" fill="#1E293B">+ fetchProducts(): List&lt;Prod&gt;</text>
    <text x="12" y="154" font-family="${fontStack}" font-size="11" fill="#1E293B">+ fetchTransactions(): List&lt;Txn&gt;</text>
    <text x="12" y="172" font-family="${fontStack}" font-size="11" fill="#1E293B">+ insertProduct(p: Product): void</text>
    <text x="12" y="190" font-family="${fontStack}" font-size="11" fill="#1E293B">+ insertTransaction(t: Txn): void</text>
    <text x="12" y="208" font-family="${fontStack}" font-size="11" fill="#1E293B">+ updateProductStock(id, qty): void</text>
  </g>

  <!-- Relationships -->
  <!-- Category 1 to * Product -->
  <line x1="340" y1="210" x2="480" y2="210" stroke="#334155" stroke-width="1.5"/>
  <text x="350" y="200" font-family="${fontStack}" font-size="12" fill="#334155">1</text>
  <text x="460" y="200" font-family="${fontStack}" font-size="12" fill="#334155">0..*</text>

  <!-- Product * to 1 Supplier -->
  <line x1="760" y1="210" x2="900" y2="210" stroke="#334155" stroke-width="1.5"/>
  <text x="770" y="200" font-family="${fontStack}" font-size="12" fill="#334155">0..*</text>
  <text x="880" y="200" font-family="${fontStack}" font-size="12" fill="#334155">1</text>

  <!-- Product 1 to * Transaction -->
  <line x1="480" y1="320" x2="270" y2="430" stroke="#334155" stroke-width="1.5"/>
  <text x="430" y="340" font-family="${fontStack}" font-size="12" fill="#334155">1</text>
  <text x="290" y="420" font-family="${fontStack}" font-size="12" fill="#334155">0..*</text>

  <!-- Product 1 to * SerialImei -->
  <line x1="620" y1="350" x2="620" y2="440" stroke="#334155" stroke-width="1.5"/>
  <text x="630" y="370" font-family="${fontStack}" font-size="12" fill="#334155">1</text>
  <text x="630" y="430" font-family="${fontStack}" font-size="12" fill="#334155">0..*</text>

  <!-- Product 1 to * Warranty -->
  <line x1="760" y1="320" x2="950" y2="440" stroke="#334155" stroke-width="1.5"/>
  <text x="790" y="340" font-family="${fontStack}" font-size="12" fill="#334155">1</text>
  <text x="920" y="420" font-family="${fontStack}" font-size="12" fill="#334155">0..*</text>

  <!-- DataStore -> OracleDbService -->
  <line x1="760" y1="870" x2="880" y2="870" stroke="#0F766E" stroke-width="2" stroke-dasharray="5,4"/>
  <text x="790" y="860" font-family="${fontStack}" font-size="11" fill="#0F766E">&lt;&lt;uses&gt;&gt;</text>
</svg>`;

fs.writeFileSync(path.join(outDir, '03_class_diagram.svg'), svgClass);
console.log('✓ 03_class_diagram.svg created');

// ============================================================================
// 4. UML SEQUENCE DIAGRAM
// ============================================================================
const svgSequence = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1400 950" width="1400" height="950">
  <rect width="1400" height="950" fill="#FFFFFF"/>
  
  <!-- Header -->
  <rect x="50" y="25" width="1300" height="55" rx="8" fill="#1E293B"/>
  <text x="700" y="60" font-family="${fontStack}" font-size="20" font-weight="bold" fill="#FFFFFF" text-anchor="middle">
    ElectroStock - UML Sequence Diagram: POS Customer Sale &amp; Stock Deduction
  </text>

  <!-- Lifeline Boxes -->
  <!-- Cashier -->
  <rect x="70" y="110" width="140" height="40" rx="4" fill="#F1F5F9" stroke="#334155" stroke-width="2"/>
  <text x="140" y="135" font-family="${fontStack}" font-size="13" font-weight="bold" fill="#1E293B" text-anchor="middle">Cashier (User)</text>
  <line x1="140" y1="150" x2="140" y2="880" stroke="#94A3B8" stroke-width="1.5" stroke-dasharray="4,4"/>

  <!-- Next.js POS UI -->
  <rect x="300" y="110" width="160" height="40" rx="4" fill="#E0F2FE" stroke="#0284C7" stroke-width="2"/>
  <text x="380" y="135" font-family="${fontStack}" font-size="13" font-weight="bold" fill="#0369A1" text-anchor="middle">Next.js POS UI</text>
  <line x1="380" y1="150" x2="380" y2="880" stroke="#94A3B8" stroke-width="1.5" stroke-dasharray="4,4"/>

  <!-- API Client -->
  <rect x="540" y="110" width="160" height="40" rx="4" fill="#E0F2FE" stroke="#0284C7" stroke-width="2"/>
  <text x="620" y="135" font-family="${fontStack}" font-size="13" font-weight="bold" fill="#0369A1" text-anchor="middle">api-client.ts</text>
  <line x1="620" y1="150" x2="620" y2="880" stroke="#94A3B8" stroke-width="1.5" stroke-dasharray="4,4"/>

  <!-- Java Server -->
  <rect x="780" y="110" width="180" height="40" rx="4" fill="#DBEAFE" stroke="#2563EB" stroke-width="2"/>
  <text x="870" y="135" font-family="${fontStack}" font-size="13" font-weight="bold" fill="#1D4ED8" text-anchor="middle">Java REST Server</text>
  <line x1="870" y1="150" x2="870" y2="880" stroke="#94A3B8" stroke-width="1.5" stroke-dasharray="4,4"/>

  <!-- DataStore -->
  <rect x="1030" y="110" width="150" height="40" rx="4" fill="#CCFBF1" stroke="#0D9488" stroke-width="2"/>
  <text x="1105" y="135" font-family="${fontStack}" font-size="13" font-weight="bold" fill="#0F766E" text-anchor="middle">DataStore Service</text>
  <line x1="1105" y1="150" x2="1105" y2="880" stroke="#94A3B8" stroke-width="1.5" stroke-dasharray="4,4"/>

  <!-- Oracle DB -->
  <rect x="1230" y="110" width="140" height="40" rx="4" fill="#FEF3C7" stroke="#D97706" stroke-width="2"/>
  <text x="1300" y="135" font-family="${fontStack}" font-size="13" font-weight="bold" fill="#B45309" text-anchor="middle">Oracle DB (XE)</text>
  <line x1="1300" y1="150" x2="1300" y2="880" stroke="#94A3B8" stroke-width="1.5" stroke-dasharray="4,4"/>

  <!-- Step 1: Scan / Enter Item -->
  <line x1="140" y1="190" x2="380" y2="190" stroke="#1E293B" stroke-width="1.5" marker-end="url(#arrow-dark)"/>
  <text x="240" y="180" font-family="${fontStack}" font-size="11" fill="#1E293B" text-anchor="middle">1. Scan Barcode / SKU</text>

  <!-- Step 2: Fetch Product Info -->
  <line x1="380" y1="230" x2="620" y2="230" stroke="#1E293B" stroke-width="1.5" marker-end="url(#arrow-dark)"/>
  <text x="500" y="220" font-family="${fontStack}" font-size="11" fill="#1E293B" text-anchor="middle">2. getProduct(id)</text>

  <!-- Step 3: Forward GET -->
  <line x1="620" y1="260" x2="870" y2="260" stroke="#1E293B" stroke-width="1.5" marker-end="url(#arrow-dark)"/>
  <text x="745" y="250" font-family="${fontStack}" font-size="11" fill="#1E293B" text-anchor="middle">3. GET /api/products/{id}</text>

  <!-- Step 4: Product details return -->
  <line x1="870" y1="300" x2="380" y2="300" stroke="#1E293B" stroke-width="1.5" stroke-dasharray="4,3" marker-end="url(#arrow-dark)"/>
  <text x="625" y="290" font-family="${fontStack}" font-size="11" fill="#1E293B" text-anchor="middle">4. Return Product Details &amp; Live Stock</text>

  <!-- Step 5: Confirm Checkout -->
  <line x1="140" y1="360" x2="380" y2="360" stroke="#1E293B" stroke-width="1.5" marker-end="url(#arrow-dark)"/>
  <text x="250" y="350" font-family="${fontStack}" font-size="11" fill="#1E293B" text-anchor="middle">5. Confirm Sale &amp; Select Serial SN</text>

  <!-- Step 6: Dispatch POST -->
  <line x1="380" y1="410" x2="620" y2="410" stroke="#1E293B" stroke-width="1.5" marker-end="url(#arrow-dark)"/>
  <text x="500" y="400" font-family="${fontStack}" font-size="11" fill="#1E293B" text-anchor="middle">6. stockOut({productId, qty, price})</text>

  <!-- Step 7: POST to Java REST -->
  <line x1="620" y1="450" x2="870" y2="450" stroke="#1E293B" stroke-width="1.5" marker-end="url(#arrow-dark)"/>
  <text x="745" y="440" font-family="${fontStack}" font-size="11" fill="#1E293B" text-anchor="middle">7. POST /api/inventory/stock-out</text>

  <!-- Step 8: Call DataStore.stockOut -->
  <line x1="870" y1="490" x2="1105" y2="490" stroke="#1E293B" stroke-width="1.5" marker-end="url(#arrow-dark)"/>
  <text x="985" y="480" font-family="${fontStack}" font-size="11" fill="#1E293B" text-anchor="middle">8. stockOut(productId, qty, price, ...)</text>

  <!-- Self execution: Stock & Profit Calc -->
  <rect x="1100" y="520" width="10" height="50" fill="#CCFBF1" stroke="#0D9488"/>
  <text x="1120" y="540" font-family="${fontStack}" font-size="11" fill="#0F766E">9. Validate Stock &gt;= Qty</text>
  <text x="1120" y="555" font-family="${fontStack}" font-size="11" fill="#0F766E">10. Calculate Profit/Loss (Sales - COGS)</text>

  <!-- Step 11: SQL Insert to Oracle -->
  <line x1="1105" y1="600" x2="1300" y2="600" stroke="#D97706" stroke-width="2" marker-end="url(#arrow-orange)"/>
  <text x="1200" y="590" font-family="${fontStack}" font-size="11" font-weight="bold" fill="#B45309" text-anchor="middle">11. INSERT INTO transactions ...</text>

  <!-- Step 12: SQL Update Stock in Oracle -->
  <line x1="1105" y1="640" x2="1300" y2="640" stroke="#D97706" stroke-width="2" marker-end="url(#arrow-orange)"/>
  <text x="1200" y="630" font-family="${fontStack}" font-size="11" font-weight="bold" fill="#B45309" text-anchor="middle">12. UPDATE products SET stock = ...</text>

  <!-- Step 13: SQL Update Serial in Oracle -->
  <line x1="1105" y1="680" x2="1300" y2="680" stroke="#D97706" stroke-width="2" marker-end="url(#arrow-orange)"/>
  <text x="1200" y="670" font-family="${fontStack}" font-size="11" font-weight="bold" fill="#B45309" text-anchor="middle">13. UPDATE serial_imei (status='sold')</text>

  <!-- Step 14: Commit -->
  <line x1="1300" y1="720" x2="1105" y2="720" stroke="#D97706" stroke-width="1.5" stroke-dasharray="4,3" marker-end="url(#arrow-dark)"/>
  <text x="1200" y="710" font-family="${fontStack}" font-size="11" fill="#B45309" text-anchor="middle">14. Oracle COMMIT Successful</text>

  <!-- Step 15: Return to Server -->
  <line x1="1105" y1="760" x2="870" y2="760" stroke="#1E293B" stroke-width="1.5" stroke-dasharray="4,3" marker-end="url(#arrow-dark)"/>
  <text x="985" y="750" font-family="${fontStack}" font-size="11" fill="#1E293B" text-anchor="middle">15. Return {success: true, txn}</text>

  <!-- Step 16: HTTP 200 to UI -->
  <line x1="870" y1="800" x2="380" y2="800" stroke="#0284C7" stroke-width="1.5" stroke-dasharray="4,3" marker-end="url(#arrow-blue)"/>
  <text x="625" y="790" font-family="${fontStack}" font-size="11" fill="#0284C7" text-anchor="middle">16. HTTP 200 OK (Sale Completed)</text>

  <!-- Step 17: UI Updates & Prints Receipt -->
  <line x1="380" y1="840" x2="140" y2="840" stroke="#1E293B" stroke-width="1.5" stroke-dasharray="4,3" marker-end="url(#arrow-dark)"/>
  <text x="250" y="830" font-family="${fontStack}" font-size="11" font-weight="bold" fill="#16A34A" text-anchor="middle">17. Print Receipt &amp; Digital Warranty</text>

  <defs>
    <marker id="arrow-dark" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#1E293B"/>
    </marker>
    <marker id="arrow-blue" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#0284C7"/>
    </marker>
    <marker id="arrow-orange" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#D97706"/>
    </marker>
  </defs>
</svg>`;

fs.writeFileSync(path.join(outDir, '04_sequence_diagram.svg'), svgSequence);
console.log('✓ 04_sequence_diagram.svg created');

// ============================================================================
// 5. UML ACTIVITY DIAGRAM
// ============================================================================
const svgActivity = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1050" width="1200" height="1050">
  <rect width="1200" height="1050" fill="#FFFFFF"/>
  
  <!-- Header -->
  <rect x="50" y="25" width="1100" height="55" rx="8" fill="#1E293B"/>
  <text x="600" y="60" font-family="${fontStack}" font-size="20" font-weight="bold" fill="#FFFFFF" text-anchor="middle">
    ElectroStock - UML Activity Diagram: Stock Management Workflow
  </text>

  <!-- Start Node -->
  <circle cx="600" cy="120" r="15" fill="#0F172A"/>

  <line x1="600" y1="135" x2="600" y2="175" stroke="#0F172A" stroke-width="2" marker-end="url(#arrow-dark)"/>

  <!-- Activity 1 -->
  <rect x="470" y="175" width="260" height="45" rx="8" fill="#F8FAFC" stroke="#2563EB" stroke-width="2"/>
  <text x="600" y="202" font-family="${fontStack}" font-size="13" font-weight="bold" fill="#1E293B" text-anchor="middle">User Selects Inventory Action</text>

  <line x1="600" y1="220" x2="600" y2="260" stroke="#0F172A" stroke-width="2" marker-end="url(#arrow-dark)"/>

  <!-- Decision 1: Stock In vs Stock Out -->
  <polygon points="600,260 670,300 600,340 530,300" fill="#FEF3C7" stroke="#D97706" stroke-width="2"/>
  <text x="600" y="305" font-family="${fontStack}" font-size="11" font-weight="bold" fill="#B45309" text-anchor="middle">Action Type?</text>

  <!-- Left Branch: Stock In -->
  <line x1="530" y1="300" x2="300" y2="300" stroke="#0F172A" stroke-width="2"/>
  <line x1="300" y1="300" x2="300" y2="360" stroke="#0F172A" stroke-width="2" marker-end="url(#arrow-dark)"/>
  <text x="380" y="290" font-family="${fontStack}" font-size="11" font-weight="bold" fill="#1D4ED8">[Stock-In / Restock]</text>

  <rect x="180" y="360" width="240" height="45" rx="8" fill="#F8FAFC" stroke="#2563EB" stroke-width="2"/>
  <text x="300" y="388" font-family="${fontStack}" font-size="12" fill="#1E293B" text-anchor="middle">Select Product &amp; Inbound PO</text>

  <line x1="300" y1="405" x2="300" y2="445" stroke="#0F172A" stroke-width="2" marker-end="url(#arrow-dark)"/>

  <rect x="180" y="445" width="240" height="45" rx="8" fill="#F8FAFC" stroke="#2563EB" stroke-width="2"/>
  <text x="300" y="473" font-family="${fontStack}" font-size="12" fill="#1E293B" text-anchor="middle">Scan / Assign Hardware Serial Nos</text>

  <line x1="300" y1="490" x2="300" y2="530" stroke="#0F172A" stroke-width="2" marker-end="url(#arrow-dark)"/>

  <rect x="180" y="530" width="240" height="45" rx="8" fill="#F8FAFC" stroke="#2563EB" stroke-width="2"/>
  <text x="300" y="558" font-family="${fontStack}" font-size="12" fill="#1E293B" text-anchor="middle">Increment Product Stock (+Qty)</text>

  <!-- Right Branch: Stock Out -->
  <line x1="670" y1="300" x2="900" y2="300" stroke="#0F172A" stroke-width="2"/>
  <line x1="900" y1="300" x2="900" y2="360" stroke="#0F172A" stroke-width="2" marker-end="url(#arrow-dark)"/>
  <text x="800" y="290" font-family="${fontStack}" font-size="11" font-weight="bold" fill="#1D4ED8">[Stock-Out / POS Sale]</text>

  <rect x="780" y="360" width="240" height="45" rx="8" fill="#F8FAFC" stroke="#2563EB" stroke-width="2"/>
  <text x="900" y="388" font-family="${fontStack}" font-size="12" fill="#1E293B" text-anchor="middle">Select Product &amp; Selling Qty</text>

  <line x1="900" y1="405" x2="900" y2="445" stroke="#0F172A" stroke-width="2" marker-end="url(#arrow-dark)"/>

  <!-- Decision: Stock Available? -->
  <polygon points="900,445 960,480 900,515 840,480" fill="#FEF3C7" stroke="#D97706" stroke-width="2"/>
  <text x="900" y="484" font-family="${fontStack}" font-size="10" font-weight="bold" fill="#B45309" text-anchor="middle">Stock &gt;= Qty?</text>

  <!-- Insufficient Stock Error -->
  <line x1="960" y1="480" x2="1080" y2="480" stroke="#DC2626" stroke-width="2"/>
  <line x1="1080" y1="480" x2="1080" y2="540" stroke="#DC2626" stroke-width="2" marker-end="url(#arrow-dark)"/>
  <text x="1010" y="470" font-family="${fontStack}" font-size="10" font-weight="bold" fill="#DC2626">[No]</text>

  <rect x="1000" y="540" width="160" height="40" rx="6" fill="#FEE2E2" stroke="#DC2626" stroke-width="1.5"/>
  <text x="1080" y="565" font-family="${fontStack}" font-size="11" font-weight="bold" fill="#B91C1C" text-anchor="middle">Display Error &amp; Abort</text>

  <!-- Sufficient Stock -->
  <line x1="900" y1="515" x2="900" y2="555" stroke="#0F172A" stroke-width="2" marker-end="url(#arrow-dark)"/>
  <text x="915" y="535" font-family="${fontStack}" font-size="10" font-weight="bold" fill="#16A34A">[Yes]</text>

  <rect x="780" y="555" width="240" height="45" rx="8" fill="#F8FAFC" stroke="#2563EB" stroke-width="2"/>
  <text x="900" y="582" font-family="${fontStack}" font-size="12" fill="#1E293B" text-anchor="middle">Deduct Stock &amp; Calc Profit/Loss</text>

  <!-- Merge / Join -->
  <line x1="300" y1="575" x2="300" y2="650" stroke="#0F172A" stroke-width="2"/>
  <line x1="300" y1="650" x2="520" y2="650" stroke="#0F172A" stroke-width="2"/>
  <line x1="900" y1="600" x2="900" y2="650" stroke="#0F172A" stroke-width="2"/>
  <line x1="900" y1="650" x2="680" y2="650" stroke="#0F172A" stroke-width="2"/>

  <!-- Synchronization bar -->
  <rect x="520" y="646" width="160" height="8" rx="2" fill="#0F172A"/>

  <line x1="600" y1="654" x2="600" y2="694" stroke="#0F172A" stroke-width="2" marker-end="url(#arrow-dark)"/>

  <!-- Action: Oracle Persistence -->
  <rect x="440" y="694" width="320" height="50" rx="8" fill="#CCFBF1" stroke="#0D9488" stroke-width="2"/>
  <text x="600" y="723" font-family="${fontStack}" font-size="13" font-weight="bold" fill="#0F766E" text-anchor="middle">
    Persist &amp; Commit to Oracle Database XE
  </text>

  <line x1="600" y1="744" x2="600" y2="784" stroke="#0F172A" stroke-width="2" marker-end="url(#arrow-dark)"/>

  <!-- Decision: Low stock check -->
  <polygon points="600,784 670,820 600,856 530,820" fill="#FEF3C7" stroke="#D97706" stroke-width="2"/>
  <text x="600" y="824" font-family="${fontStack}" font-size="10" font-weight="bold" fill="#B45309" text-anchor="middle">Stock &lt;= Min?</text>

  <!-- Alert -->
  <line x1="670" y1="820" x2="800" y2="820" stroke="#D97706" stroke-width="2"/>
  <line x1="800" y1="820" x2="800" y2="865" stroke="#D97706" stroke-width="2" marker-end="url(#arrow-dark)"/>
  <text x="730" y="810" font-family="${fontStack}" font-size="10" font-weight="bold" fill="#D97706">[Yes]</text>

  <rect x="710" y="865" width="180" height="40" rx="6" fill="#FEF3C7" stroke="#D97706" stroke-width="1.5"/>
  <text x="800" y="890" font-family="${fontStack}" font-size="11" font-weight="bold" fill="#B45309" text-anchor="middle">Trigger Low-Stock Alert</text>

  <!-- Join back -->
  <line x1="600" y1="856" x2="600" y2="930" stroke="#0F172A" stroke-width="2"/>
  <line x1="800" y1="905" x2="800" y2="930" stroke="#0F172A" stroke-width="2"/>
  <line x1="800" y1="930" x2="600" y2="930" stroke="#0F172A" stroke-width="2"/>

  <line x1="600" y1="930" x2="600" y2="970" stroke="#0F172A" stroke-width="2" marker-end="url(#arrow-dark)"/>

  <!-- Final Node -->
  <circle cx="600" cy="990" r="18" fill="#FFFFFF" stroke="#0F172A" stroke-width="2"/>
  <circle cx="600" cy="990" r="11" fill="#0F172A"/>
</svg>`;

fs.writeFileSync(path.join(outDir, '05_activity_diagram.svg'), svgActivity);
console.log('✓ 05_activity_diagram.svg created');

// ============================================================================
// 6. UML STATE MACHINE DIAGRAM
// ============================================================================
const svgStateMachine = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1350 850" width="1350" height="850">
  <rect width="1350" height="850" fill="#FFFFFF"/>
  
  <!-- Header -->
  <rect x="50" y="25" width="1250" height="55" rx="8" fill="#1E293B"/>
  <text x="675" y="60" font-family="${fontStack}" font-size="20" font-weight="bold" fill="#FFFFFF" text-anchor="middle">
    ElectroStock - UML State Machine Diagram: Hardware Serial &amp; Warranty Lifecycle
  </text>

  <!-- Initial Node -->
  <circle cx="100" cy="220" r="14" fill="#0F172A"/>
  <line x1="114" y1="220" x2="180" y2="220" stroke="#0F172A" stroke-width="2" marker-end="url(#arrow-dark)"/>
  <text x="145" y="210" font-family="${fontStack}" font-size="11" fill="#64748B" text-anchor="middle">Purchase PO</text>

  <!-- State 1: Inbound Ordered -->
  <rect x="180" y="195" width="180" height="55" rx="8" fill="#F1F5F9" stroke="#475569" stroke-width="2"/>
  <text x="270" y="228" font-family="${fontStack}" font-size="13" font-weight="bold" fill="#1E293B" text-anchor="middle">Inbound Ordered</text>

  <!-- Transition -> Available -->
  <line x1="360" y1="220" x2="440" y2="220" stroke="#0F172A" stroke-width="2" marker-end="url(#arrow-dark)"/>
  <text x="400" y="210" font-family="${fontStack}" font-size="10" fill="#475569" text-anchor="middle">Receive &amp; SN</text>

  <!-- State 2: Available in Stock -->
  <rect x="440" y="195" width="200" height="55" rx="8" fill="#ECFDF5" stroke="#059669" stroke-width="2"/>
  <text x="540" y="228" font-family="${fontStack}" font-size="13" font-weight="bold" fill="#047857" text-anchor="middle">Available in Stock</text>

  <!-- Transition -> Sold -->
  <line x1="640" y1="220" x2="740" y2="220" stroke="#0F172A" stroke-width="2" marker-end="url(#arrow-dark)"/>
  <text x="690" y="210" font-family="${fontStack}" font-size="10" fill="#475569" text-anchor="middle">POS Checkout</text>

  <!-- State 3: Sold to Customer -->
  <rect x="740" y="195" width="180" height="55" rx="8" fill="#EFF6FF" stroke="#2563EB" stroke-width="2"/>
  <text x="830" y="228" font-family="${fontStack}" font-size="13" font-weight="bold" fill="#1D4ED8" text-anchor="middle">Sold &amp; Dispatched</text>

  <!-- Transition -> Active Warranty -->
  <line x1="920" y1="220" x2="1010" y2="220" stroke="#0F172A" stroke-width="2" marker-end="url(#arrow-dark)"/>
  <text x="965" y="210" font-family="${fontStack}" font-size="10" fill="#475569" text-anchor="middle">Register</text>

  <!-- State 4: Active Warranty -->
  <rect x="1010" y="195" width="200" height="55" rx="8" fill="#EFF6FF" stroke="#2563EB" stroke-width="2"/>
  <text x="1110" y="228" font-family="${fontStack}" font-size="13" font-weight="bold" fill="#1D4ED8" text-anchor="middle">Warranty Active</text>

  <!-- RMA Cycle (Down and across) -->
  <line x1="1110" y1="250" x2="1110" y2="380" stroke="#0F172A" stroke-width="2"/>
  <line x1="1110" y1="380" x2="850" y2="380" stroke="#0F172A" stroke-width="2" marker-end="url(#arrow-dark)"/>
  <text x="980" y="370" font-family="${fontStack}" font-size="11" fill="#DC2626">Customer Files RMA Claim</text>

  <!-- State 5: In Repair -->
  <rect x="650" y="350" width="200" height="60" rx="8" fill="#FEF3C7" stroke="#D97706" stroke-width="2"/>
  <text x="750" y="378" font-family="${fontStack}" font-size="13" font-weight="bold" fill="#B45309" text-anchor="middle">In Repair / RMA</text>
  <text x="750" y="398" font-family="${fontStack}" font-size="10" fill="#92400E" text-anchor="middle">Hardware Diagnosis</text>

  <!-- Return from repair to Active Warranty -->
  <line x1="750" y1="350" x2="750" y2="300" stroke="#16A34A" stroke-width="2"/>
  <line x1="750" y1="300" x2="1050" y2="300" stroke="#16A34A" stroke-width="2"/>
  <line x1="1050" y1="300" x2="1050" y2="250" stroke="#16A34A" stroke-width="2" marker-end="url(#arrow-dark)"/>
  <text x="900" y="290" font-family="${fontStack}" font-size="10" font-weight="bold" fill="#16A34A">Repair Resolved &amp; Returned</text>

  <!-- Transition from Active Warranty to Expiring Soon -->
  <line x1="1110" y1="250" x2="1110" y2="520" stroke="#0F172A" stroke-width="2" marker-end="url(#arrow-dark)"/>
  <text x="1115" y="470" font-family="${fontStack}" font-size="10" fill="#D97706">&lt; 30 Days Left</text>

  <!-- State 6: Expiring Soon -->
  <rect x="1010" y="520" width="200" height="55" rx="8" fill="#FEF3C7" stroke="#D97706" stroke-width="2"/>
  <text x="1110" y="553" font-family="${fontStack}" font-size="13" font-weight="bold" fill="#B45309" text-anchor="middle">Expiring Soon</text>

  <!-- Transition to Expired -->
  <line x1="1110" y1="575" x2="1110" y2="670" stroke="#0F172A" stroke-width="2" marker-end="url(#arrow-dark)"/>
  <text x="1115" y="630" font-family="${fontStack}" font-size="10" fill="#475569">End Date Reached</text>

  <!-- State 7: Expired -->
  <rect x="1010" y="670" width="200" height="55" rx="8" fill="#F1F5F9" stroke="#64748B" stroke-width="2"/>
  <text x="1110" y="703" font-family="${fontStack}" font-size="13" font-weight="bold" fill="#475569" text-anchor="middle">Warranty Expired</text>

  <!-- Final State -->
  <line x1="1010" y1="697" x2="880" y2="697" stroke="#0F172A" stroke-width="2" marker-end="url(#arrow-dark)"/>
  <circle cx="850" cy="697" r="16" fill="#FFFFFF" stroke="#0F172A" stroke-width="2"/>
  <circle cx="850" cy="697" r="10" fill="#0F172A"/>
  <text x="850" y="730" font-family="${fontStack}" font-size="11" fill="#475569" text-anchor="middle">Archived Record</text>
</svg>`;

fs.writeFileSync(path.join(outDir, '06_state_machine_diagram.svg'), svgStateMachine);
console.log('✓ 06_state_machine_diagram.svg created');

// ============================================================================
// 7. UML COMPONENT DIAGRAM
// ============================================================================
const svgComponent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1350 900" width="1350" height="900">
  <rect width="1350" height="900" fill="#FFFFFF"/>
  
  <!-- Header -->
  <rect x="50" y="25" width="1250" height="55" rx="8" fill="#1E293B"/>
  <text x="675" y="60" font-family="${fontStack}" font-size="20" font-weight="bold" fill="#FFFFFF" text-anchor="middle">
    ElectroStock - UML Component Diagram
  </text>

  <!-- Subsystem 1: Client Subsystem -->
  <rect x="70" y="110" width="360" height="740" rx="8" fill="#F8FAFC" stroke="#0284C7" stroke-width="2" stroke-dasharray="6,4"/>
  <text x="250" y="140" font-family="${fontStack}" font-size="15" font-weight="bold" fill="#0369A1" text-anchor="middle">
    &lt;&lt;subsystem&gt;&gt; Frontend Client
  </text>

  <!-- Component: UI Pages -->
  <g transform="translate(110, 170)">
    <rect width="280" height="100" rx="4" fill="#FFFFFF" stroke="#0284C7" stroke-width="1.5"/>
    <rect x="-10" y="15" width="20" height="12" fill="#E0F2FE" stroke="#0284C7"/>
    <rect x="-10" y="45" width="20" height="12" fill="#E0F2FE" stroke="#0284C7"/>
    <text x="140" y="30" font-family="${fontStack}" font-size="12" font-weight="bold" fill="#0369A1" text-anchor="middle">&lt;&lt;component&gt;&gt;</text>
    <text x="140" y="50" font-family="${fontStack}" font-size="13" font-weight="bold" fill="#1E293B" text-anchor="middle">Next.js UI Pages</text>
    <text x="140" y="75" font-family="${fontStack}" font-size="11" fill="#64748B" text-anchor="middle">Products, POS, Inventory, History</text>
  </g>

  <!-- Component: Zustand Store -->
  <g transform="translate(110, 310)">
    <rect width="280" height="100" rx="4" fill="#FFFFFF" stroke="#0284C7" stroke-width="1.5"/>
    <rect x="-10" y="15" width="20" height="12" fill="#E0F2FE" stroke="#0284C7"/>
    <rect x="-10" y="45" width="20" height="12" fill="#E0F2FE" stroke="#0284C7"/>
    <text x="140" y="30" font-family="${fontStack}" font-size="12" font-weight="bold" fill="#0369A1" text-anchor="middle">&lt;&lt;component&gt;&gt;</text>
    <text x="140" y="50" font-family="${fontStack}" font-size="13" font-weight="bold" fill="#1E293B" text-anchor="middle">Zustand Store Engine</text>
    <text x="140" y="75" font-family="${fontStack}" font-size="11" fill="#64748B" text-anchor="middle">inventory-store.ts, auth-store.ts</text>
  </g>

  <!-- Component: API Client -->
  <g transform="translate(110, 450)">
    <rect width="280" height="100" rx="4" fill="#FFFFFF" stroke="#0284C7" stroke-width="1.5"/>
    <rect x="-10" y="15" width="20" height="12" fill="#E0F2FE" stroke="#0284C7"/>
    <rect x="-10" y="45" width="20" height="12" fill="#E0F2FE" stroke="#0284C7"/>
    <text x="140" y="30" font-family="${fontStack}" font-size="12" font-weight="bold" fill="#0369A1" text-anchor="middle">&lt;&lt;component&gt;&gt;</text>
    <text x="140" y="50" font-family="${fontStack}" font-size="13" font-weight="bold" fill="#1E293B" text-anchor="middle">API Client Layer</text>
    <text x="140" y="75" font-family="${fontStack}" font-size="11" fill="#64748B" text-anchor="middle">api-client.ts (Fetch REST Client)</text>
  </g>

  <!-- Subsystem 2: Java Backend Subsystem -->
  <rect x="490" y="110" width="380" height="740" rx="8" fill="#F8FAFC" stroke="#2563EB" stroke-width="2" stroke-dasharray="6,4"/>
  <text x="680" y="140" font-family="${fontStack}" font-size="15" font-weight="bold" fill="#1D4ED8" text-anchor="middle">
    &lt;&lt;subsystem&gt;&gt; Java 26 REST Backend
  </text>

  <!-- Component: REST Server -->
  <g transform="translate(540, 170)">
    <rect width="280" height="100" rx="4" fill="#FFFFFF" stroke="#2563EB" stroke-width="1.5"/>
    <rect x="-10" y="15" width="20" height="12" fill="#DBEAFE" stroke="#2563EB"/>
    <rect x="-10" y="45" width="20" height="12" fill="#DBEAFE" stroke="#2563EB"/>
    <text x="140" y="30" font-family="${fontStack}" font-size="12" font-weight="bold" fill="#1D4ED8" text-anchor="middle">&lt;&lt;component&gt;&gt;</text>
    <text x="140" y="50" font-family="${fontStack}" font-size="13" font-weight="bold" fill="#1E293B" text-anchor="middle">ElectroStockServer</text>
    <text x="140" y="75" font-family="${fontStack}" font-size="11" fill="#64748B" text-anchor="middle">JDK HttpServer, CORS, Port 8085</text>
  </g>

  <!-- Component: DataStore Core -->
  <g transform="translate(540, 310)">
    <rect width="280" height="100" rx="4" fill="#FFFFFF" stroke="#2563EB" stroke-width="1.5"/>
    <rect x="-10" y="15" width="20" height="12" fill="#DBEAFE" stroke="#2563EB"/>
    <rect x="-10" y="45" width="20" height="12" fill="#DBEAFE" stroke="#2563EB"/>
    <text x="140" y="30" font-family="${fontStack}" font-size="12" font-weight="bold" fill="#1D4ED8" text-anchor="middle">&lt;&lt;component&gt;&gt;</text>
    <text x="140" y="50" font-family="${fontStack}" font-size="13" font-weight="bold" fill="#1E293B" text-anchor="middle">DataStore Service</text>
    <text x="140" y="75" font-family="${fontStack}" font-size="11" fill="#64748B" text-anchor="middle">In-Memory Cache &amp; Domain Logic</text>
  </g>

  <!-- Component: OracleDbService -->
  <g transform="translate(540, 450)">
    <rect width="280" height="100" rx="4" fill="#FFFFFF" stroke="#2563EB" stroke-width="1.5"/>
    <rect x="-10" y="15" width="20" height="12" fill="#DBEAFE" stroke="#2563EB"/>
    <rect x="-10" y="45" width="20" height="12" fill="#DBEAFE" stroke="#2563EB"/>
    <text x="140" y="30" font-family="${fontStack}" font-size="12" font-weight="bold" fill="#1D4ED8" text-anchor="middle">&lt;&lt;component&gt;&gt;</text>
    <text x="140" y="50" font-family="${fontStack}" font-size="13" font-weight="bold" fill="#1E293B" text-anchor="middle">OracleDbService</text>
    <text x="140" y="75" font-family="${fontStack}" font-size="11" fill="#64748B" text-anchor="middle">JDBC Persistence &amp; Queries</text>
  </g>

  <!-- Component: JsonUtil -->
  <g transform="translate(540, 590)">
    <rect width="280" height="100" rx="4" fill="#FFFFFF" stroke="#2563EB" stroke-width="1.5"/>
    <rect x="-10" y="15" width="20" height="12" fill="#DBEAFE" stroke="#2563EB"/>
    <rect x="-10" y="45" width="20" height="12" fill="#DBEAFE" stroke="#2563EB"/>
    <text x="140" y="30" font-family="${fontStack}" font-size="12" font-weight="bold" fill="#1D4ED8" text-anchor="middle">&lt;&lt;component&gt;&gt;</text>
    <text x="140" y="50" font-family="${fontStack}" font-size="13" font-weight="bold" fill="#1E293B" text-anchor="middle">JsonUtil Parser</text>
    <text x="140" y="75" font-family="${fontStack}" font-size="11" fill="#64748B" text-anchor="middle">Native JSON Serialization</text>
  </g>

  <!-- Subsystem 3: Database Subsystem -->
  <rect x="930" y="110" width="350" height="740" rx="8" fill="#F8FAFC" stroke="#0D9488" stroke-width="2" stroke-dasharray="6,4"/>
  <text x="1105" y="140" font-family="${fontStack}" font-size="15" font-weight="bold" fill="#0F766E" text-anchor="middle">
    &lt;&lt;subsystem&gt;&gt; Database Layer
  </text>

  <!-- Component: JDBC Driver -->
  <g transform="translate(970, 230)">
    <rect width="270" height="100" rx="4" fill="#FFFFFF" stroke="#0D9488" stroke-width="1.5"/>
    <rect x="-10" y="15" width="20" height="12" fill="#CCFBF1" stroke="#0D9488"/>
    <rect x="-10" y="45" width="20" height="12" fill="#CCFBF1" stroke="#0D9488"/>
    <text x="135" y="30" font-family="${fontStack}" font-size="12" font-weight="bold" fill="#0F766E" text-anchor="middle">&lt;&lt;component&gt;&gt;</text>
    <text x="135" y="50" font-family="${fontStack}" font-size="13" font-weight="bold" fill="#1E293B" text-anchor="middle">Oracle JDBC Driver</text>
    <text x="135" y="75" font-family="${fontStack}" font-size="11" fill="#64748B" text-anchor="middle">ojdbc14.jar (Thin Client)</text>
  </g>

  <!-- Component: Oracle XE Database Tables -->
  <g transform="translate(970, 450)">
    <rect width="270" height="180" rx="4" fill="#FFFFFF" stroke="#0D9488" stroke-width="1.5"/>
    <rect x="-10" y="15" width="20" height="12" fill="#CCFBF1" stroke="#0D9488"/>
    <rect x="-10" y="45" width="20" height="12" fill="#CCFBF1" stroke="#0D9488"/>
    <text x="135" y="30" font-family="${fontStack}" font-size="12" font-weight="bold" fill="#0F766E" text-anchor="middle">&lt;&lt;database&gt;&gt;</text>
    <text x="135" y="50" font-family="${fontStack}" font-size="13" font-weight="bold" fill="#1E293B" text-anchor="middle">Oracle 10g XE Tables</text>
    <text x="15" y="80" font-family="${fontStack}" font-size="11" fill="#334155">• PRODUCTS</text>
    <text x="15" y="100" font-family="${fontStack}" font-size="11" fill="#334155">• TRANSACTIONS</text>
    <text x="15" y="120" font-family="${fontStack}" font-size="11" fill="#334155">• SERIAL_IMEI</text>
    <text x="15" y="140" font-family="${fontStack}" font-size="11" fill="#334155">• WARRANTIES</text>
    <text x="140" y="80" font-family="${fontStack}" font-size="11" fill="#334155">• USERS</text>
    <text x="140" y="100" font-family="${fontStack}" font-size="11" fill="#334155">• CATEGORIES</text>
    <text x="140" y="120" font-family="${fontStack}" font-size="11" fill="#334155">• SUPPLIERS</text>
    <text x="140" y="140" font-family="${fontStack}" font-size="11" fill="#334155">• RECEIPTS</text>
  </g>

  <!-- Connecting Arrows -->
  <line x1="390" y1="500" x2="540" y2="220" stroke="#0284C7" stroke-width="2"/>
  <line x1="680" y1="270" x2="680" y2="310" stroke="#2563EB" stroke-width="2"/>
  <line x1="680" y1="410" x2="680" y2="450" stroke="#2563EB" stroke-width="2"/>
  <line x1="820" y1="500" x2="970" y2="280" stroke="#0D9488" stroke-width="2"/>
  <line x1="1105" y1="330" x2="1105" y2="450" stroke="#0D9488" stroke-width="2"/>
</svg>`;

fs.writeFileSync(path.join(outDir, '07_component_diagram.svg'), svgComponent);
console.log('✓ 07_component_diagram.svg created');

// ============================================================================
// 8. UML DEPLOYMENT DIAGRAM
// ============================================================================
const svgDeployment = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1350 850" width="1350" height="850">
  <rect width="1350" height="850" fill="#FFFFFF"/>
  
  <!-- Header -->
  <rect x="50" y="25" width="1250" height="55" rx="8" fill="#1E293B"/>
  <text x="675" y="60" font-family="${fontStack}" font-size="20" font-weight="bold" fill="#FFFFFF" text-anchor="middle">
    ElectroStock - UML Deployment Diagram
  </text>

  <!-- Node 1: Client Workstation -->
  <g transform="translate(80, 130)">
    <!-- 3D Node box -->
    <polygon points="0,20 20,0 300,0 280,20" fill="#E2E8F0" stroke="#475569" stroke-width="1.5"/>
    <polygon points="280,20 300,0 300,320 280,340" fill="#CBD5E1" stroke="#475569" stroke-width="1.5"/>
    <rect x="0" y="20" width="280" height="320" fill="#FFFFFF" stroke="#475569" stroke-width="1.5"/>
    <text x="140" y="50" font-family="${fontStack}" font-size="13" font-weight="bold" fill="#1E293B" text-anchor="middle">&lt;&lt;device&gt;&gt;</text>
    <text x="140" y="70" font-family="${fontStack}" font-size="14" font-weight="bold" fill="#0F172A" text-anchor="middle">Client Workstation / POS</text>
    <line x1="20" y1="85" x2="260" y2="85" stroke="#E2E8F0" stroke-width="1.5"/>

    <!-- Artifact: Browser -->
    <rect x="25" y="105" width="230" height="75" rx="4" fill="#F8FAFC" stroke="#0284C7" stroke-width="1.5"/>
    <text x="140" y="125" font-family="${fontStack}" font-size="11" font-weight="bold" fill="#0369A1" text-anchor="middle">&lt;&lt;artifact&gt;&gt;</text>
    <text x="140" y="145" font-family="${fontStack}" font-size="12" font-weight="bold" fill="#1E293B" text-anchor="middle">Chrome / Edge Browser</text>
    <text x="140" y="165" font-family="${fontStack}" font-size="11" fill="#64748B" text-anchor="middle">HTML5, CSS3, JS Client</text>

    <!-- Artifact: Barcode Scanner -->
    <rect x="25" y="195" width="230" height="55" rx="4" fill="#F8FAFC" stroke="#475569" stroke-width="1.5"/>
    <text x="140" y="218" font-family="${fontStack}" font-size="11" font-weight="bold" fill="#1E293B" text-anchor="middle">USB / Camera Scanner</text>
    <text x="140" y="235" font-family="${fontStack}" font-size="10" fill="#64748B" text-anchor="middle">Serial / Barcode Input</text>

    <!-- Artifact: Receipt Printer -->
    <rect x="25" y="260" width="230" height="55" rx="4" fill="#F8FAFC" stroke="#475569" stroke-width="1.5"/>
    <text x="140" y="283" font-family="${fontStack}" font-size="11" font-weight="bold" fill="#1E293B" text-anchor="middle">POS Thermal Printer</text>
    <text x="140" y="300" font-family="${fontStack}" font-size="10" fill="#64748B" text-anchor="middle">Customer Receipts</text>
  </g>

  <!-- Connection: Client to Next.js -->
  <line x1="380" y1="280" x2="480" y2="280" stroke="#0284C7" stroke-width="2"/>
  <text x="430" y="270" font-family="${fontStack}" font-size="11" font-weight="bold" fill="#0284C7" text-anchor="middle">HTTP :3000</text>

  <!-- Node 2: Web Server (Next.js) -->
  <g transform="translate(480, 130)">
    <polygon points="0,20 20,0 340,0 320,20" fill="#E2E8F0" stroke="#475569" stroke-width="1.5"/>
    <polygon points="320,20 340,0 340,320 320,340" fill="#CBD5E1" stroke="#475569" stroke-width="1.5"/>
    <rect x="0" y="20" width="320" height="320" fill="#FFFFFF" stroke="#475569" stroke-width="1.5"/>
    <text x="160" y="50" font-family="${fontStack}" font-size="13" font-weight="bold" fill="#1E293B" text-anchor="middle">&lt;&lt;device / execution environment&gt;&gt;</text>
    <text x="160" y="70" font-family="${fontStack}" font-size="14" font-weight="bold" fill="#0F172A" text-anchor="middle">Next.js Web Server</text>
    <line x1="20" y1="85" x2="300" y2="85" stroke="#E2E8F0" stroke-width="1.5"/>

    <rect x="25" y="105" width="270" height="95" rx="4" fill="#F8FAFC" stroke="#0284C7" stroke-width="1.5"/>
    <text x="160" y="125" font-family="${fontStack}" font-size="11" font-weight="bold" fill="#0369A1" text-anchor="middle">&lt;&lt;artifact&gt;&gt;</text>
    <text x="160" y="145" font-family="${fontStack}" font-size="12" font-weight="bold" fill="#1E293B" text-anchor="middle">Next.js 13 Fullstack App</text>
    <text x="160" y="165" font-family="${fontStack}" font-size="11" fill="#64748B" text-anchor="middle">Node.js Engine (Port 3000)</text>
    <text x="160" y="185" font-family="${fontStack}" font-size="11" fill="#64748B" text-anchor="middle">SSR &amp; API Route Handlers</text>

    <rect x="25" y="215" width="270" height="95" rx="4" fill="#F8FAFC" stroke="#475569" stroke-width="1.5"/>
    <text x="160" y="235" font-family="${fontStack}" font-size="11" font-weight="bold" fill="#1E293B" text-anchor="middle">&lt;&lt;artifact&gt;&gt;</text>
    <text x="160" y="255" font-family="${fontStack}" font-size="12" font-weight="bold" fill="#1E293B" text-anchor="middle">Prisma SQLite Dev Cache</text>
    <text x="160" y="275" font-family="${fontStack}" font-size="11" fill="#64748B" text-anchor="middle">electrostock.db</text>
    <text x="160" y="295" font-family="${fontStack}" font-size="11" fill="#64748B" text-anchor="middle">Local fallback &amp; session store</text>
  </g>

  <!-- Connection: Next.js to Java -->
  <line x1="820" y1="280" x2="920" y2="280" stroke="#2563EB" stroke-width="2"/>
  <text x="870" y="270" font-family="${fontStack}" font-size="11" font-weight="bold" fill="#2563EB" text-anchor="middle">REST :8085</text>

  <!-- Node 3: Java REST Application Server -->
  <g transform="translate(920, 130)">
    <polygon points="0,20 20,0 360,0 340,20" fill="#E2E8F0" stroke="#475569" stroke-width="1.5"/>
    <polygon points="340,20 360,0 360,320 340,340" fill="#CBD5E1" stroke="#475569" stroke-width="1.5"/>
    <rect x="0" y="20" width="340" height="320" fill="#FFFFFF" stroke="#475569" stroke-width="1.5"/>
    <text x="170" y="50" font-family="${fontStack}" font-size="13" font-weight="bold" fill="#1E293B" text-anchor="middle">&lt;&lt;device / execution environment&gt;&gt;</text>
    <text x="170" y="70" font-family="${fontStack}" font-size="14" font-weight="bold" fill="#0F766E" text-anchor="middle">Java Application Server</text>
    <line x1="20" y1="85" x2="320" y2="85" stroke="#E2E8F0" stroke-width="1.5"/>

    <rect x="25" y="105" width="290" height="95" rx="4" fill="#F8FAFC" stroke="#2563EB" stroke-width="1.5"/>
    <text x="170" y="125" font-family="${fontStack}" font-size="11" font-weight="bold" fill="#1D4ED8" text-anchor="middle">&lt;&lt;artifact&gt;&gt;</text>
    <text x="170" y="145" font-family="${fontStack}" font-size="12" font-weight="bold" fill="#1E293B" text-anchor="middle">ElectroStock REST Server</text>
    <text x="170" y="165" font-family="${fontStack}" font-size="11" fill="#64748B" text-anchor="middle">Java 26 SE Runtime (Port 8085)</text>
    <text x="170" y="185" font-family="${fontStack}" font-size="11" fill="#64748B" text-anchor="middle">JDK HttpServer + 16-Thread Pool</text>

    <rect x="25" y="215" width="290" height="95" rx="4" fill="#F8FAFC" stroke="#0F766E" stroke-width="1.5"/>
    <text x="170" y="235" font-family="${fontStack}" font-size="11" font-weight="bold" fill="#0F766E" text-anchor="middle">&lt;&lt;artifact&gt;&gt;</text>
    <text x="170" y="255" font-family="${fontStack}" font-size="12" font-weight="bold" fill="#1E293B" text-anchor="middle">Oracle JDBC Thin Driver</text>
    <text x="170" y="275" font-family="${fontStack}" font-size="11" fill="#64748B" text-anchor="middle">ojdbc14.jar (lib/ojdbc14.jar)</text>
    <text x="170" y="295" font-family="${fontStack}" font-size="11" fill="#64748B" text-anchor="middle">OracleDbService.class</text>
  </g>

  <!-- Connection: Java to Oracle DB (Vertical) -->
  <line x1="1090" y1="470" x2="1090" y2="550" stroke="#0D9488" stroke-width="2.5"/>
  <text x="1100" y="515" font-family="${fontStack}" font-size="11" font-weight="bold" fill="#0D9488">JDBC TCP :1521</text>

  <!-- Node 4: Database Server -->
  <g transform="translate(920, 550)">
    <polygon points="0,20 20,0 360,0 340,20" fill="#E2E8F0" stroke="#475569" stroke-width="1.5"/>
    <polygon points="340,20 360,0 360,230 340,250" fill="#CBD5E1" stroke="#475569" stroke-width="1.5"/>
    <rect x="0" y="20" width="340" height="230" fill="#FFFFFF" stroke="#475569" stroke-width="1.5"/>
    <text x="170" y="50" font-family="${fontStack}" font-size="13" font-weight="bold" fill="#1E293B" text-anchor="middle">&lt;&lt;device / database system&gt;&gt;</text>
    <text x="170" y="70" font-family="${fontStack}" font-size="14" font-weight="bold" fill="#0F766E" text-anchor="middle">Oracle Database Host</text>
    <line x1="20" y1="85" x2="320" y2="85" stroke="#E2E8F0" stroke-width="1.5"/>

    <rect x="25" y="105" width="290" height="115" rx="4" fill="#F8FAFC" stroke="#0D9488" stroke-width="1.5"/>
    <text x="170" y="130" font-family="${fontStack}" font-size="11" font-weight="bold" fill="#0F766E" text-anchor="middle">&lt;&lt;database environment&gt;&gt;</text>
    <text x="170" y="150" font-family="${fontStack}" font-size="13" font-weight="bold" fill="#1E293B" text-anchor="middle">Oracle Database 10g XE</text>
    <text x="170" y="170" font-family="${fontStack}" font-size="11" fill="#334155">• Service: OracleServiceXE (Port 1521)</text>
    <text x="170" y="188" font-family="${fontStack}" font-size="11" fill="#334155">• Schema: system / 123456</text>
    <text x="170" y="206" font-family="${fontStack}" font-size="11" fill="#334155">• Datafiles: SYSTEM.DBF, USERS.DBF</text>
  </g>
</svg>`;

fs.writeFileSync(path.join(outDir, '08_deployment_diagram.svg'), svgDeployment);
console.log('✓ 08_deployment_diagram.svg created');

// ============================================================================
// 9. DATABASE ENTITY-RELATIONSHIP (ER) DIAGRAM
// ============================================================================
const svgER = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1500 1150" width="1500" height="1150">
  <rect width="1500" height="1150" fill="#FFFFFF"/>
  
  <!-- Header -->
  <rect x="50" y="25" width="1400" height="55" rx="8" fill="#1E293B"/>
  <text x="750" y="60" font-family="${fontStack}" font-size="20" font-weight="bold" fill="#FFFFFF" text-anchor="middle">
    ElectroStock - Database Entity-Relationship (ER) Diagram (Oracle SQL Schema)
  </text>

  <!-- Table 1: CATEGORIES -->
  <g transform="translate(80, 120)">
    <rect width="260" height="130" rx="4" fill="#FFFFFF" stroke="#1E293B" stroke-width="2"/>
    <rect width="260" height="28" rx="4" fill="#1E293B"/>
    <text x="130" y="19" font-family="${fontStack}" font-size="12" font-weight="bold" fill="#FFFFFF" text-anchor="middle">CATEGORIES</text>
    <text x="12" y="48" font-family="${fontStack}" font-size="11" font-weight="bold" fill="#DC2626">PK</text>
    <text x="40" y="48" font-family="${fontStack}" font-size="11" fill="#1E293B">id: VARCHAR2(64)</text>
    <text x="40" y="68" font-family="${fontStack}" font-size="11" fill="#1E293B">name: VARCHAR2(255) [UNIQUE]</text>
    <text x="40" y="88" font-family="${fontStack}" font-size="11" fill="#1E293B">description: VARCHAR2(1000)</text>
    <text x="40" y="108" font-family="${fontStack}" font-size="11" fill="#1E293B">created_at: TIMESTAMP</text>
  </g>

  <!-- Table 2: SUPPLIERS -->
  <g transform="translate(80, 310)">
    <rect width="260" height="190" rx="4" fill="#FFFFFF" stroke="#1E293B" stroke-width="2"/>
    <rect width="260" height="28" rx="4" fill="#1E293B"/>
    <text x="130" y="19" font-family="${fontStack}" font-size="12" font-weight="bold" fill="#FFFFFF" text-anchor="middle">SUPPLIERS</text>
    <text x="12" y="48" font-family="${fontStack}" font-size="11" font-weight="bold" fill="#DC2626">PK</text>
    <text x="40" y="48" font-family="${fontStack}" font-size="11" fill="#1E293B">id: VARCHAR2(64)</text>
    <text x="40" y="68" font-family="${fontStack}" font-size="11" fill="#1E293B">name: VARCHAR2(255)</text>
    <text x="40" y="88" font-family="${fontStack}" font-size="11" fill="#1E293B">company: VARCHAR2(255)</text>
    <text x="40" y="108" font-family="${fontStack}" font-size="11" fill="#1E293B">email: VARCHAR2(255)</text>
    <text x="40" y="128" font-family="${fontStack}" font-size="11" fill="#1E293B">phone: VARCHAR2(50)</text>
    <text x="40" y="148" font-family="${fontStack}" font-size="11" fill="#1E293B">gstin: VARCHAR2(50)</text>
    <text x="40" y="168" font-family="${fontStack}" font-size="11" fill="#1E293B">status: VARCHAR2(50)</text>
  </g>

  <!-- Table 3: PRODUCTS -->
  <g transform="translate(460, 180)">
    <rect width="300" height="270" rx="4" fill="#FFFFFF" stroke="#2563EB" stroke-width="2.5"/>
    <rect width="300" height="28" rx="4" fill="#2563EB"/>
    <text x="150" y="19" font-family="${fontStack}" font-size="12" font-weight="bold" fill="#FFFFFF" text-anchor="middle">PRODUCTS</text>
    <text x="12" y="48" font-family="${fontStack}" font-size="11" font-weight="bold" fill="#DC2626">PK</text>
    <text x="40" y="48" font-family="${fontStack}" font-size="11" fill="#1E293B">id: VARCHAR2(64)</text>
    <text x="40" y="68" font-family="${fontStack}" font-size="11" fill="#1E293B">name: VARCHAR2(255)</text>
    <text x="40" y="88" font-family="${fontStack}" font-size="11" fill="#1E293B">sku: VARCHAR2(100) [UNIQUE]</text>
    <text x="12" y="108" font-family="${fontStack}" font-size="11" font-weight="bold" fill="#2563EB">FK</text>
    <text x="40" y="108" font-family="${fontStack}" font-size="11" fill="#1E293B">category_id: VARCHAR2(64)</text>
    <text x="40" y="128" font-family="${fontStack}" font-size="11" fill="#1E293B">brand: VARCHAR2(100)</text>
    <text x="40" y="148" font-family="${fontStack}" font-size="11" fill="#1E293B">model: VARCHAR2(100)</text>
    <text x="12" y="168" font-family="${fontStack}" font-size="11" font-weight="bold" fill="#2563EB">FK</text>
    <text x="40" y="168" font-family="${fontStack}" font-size="11" fill="#1E293B">supplier_id: VARCHAR2(64)</text>
    <text x="40" y="188" font-family="${fontStack}" font-size="11" fill="#1E293B">stock: NUMBER(10)</text>
    <text x="40" y="208" font-family="${fontStack}" font-size="11" fill="#1E293B">min_stock: NUMBER(10)</text>
    <text x="40" y="228" font-family="${fontStack}" font-size="11" fill="#1E293B">purchase_price: NUMBER(12,2)</text>
    <text x="40" y="248" font-family="${fontStack}" font-size="11" fill="#1E293B">selling_price: NUMBER(12,2)</text>
  </g>

  <!-- Table 4: SERIAL_IMEI -->
  <g transform="translate(880, 120)">
    <rect width="280" height="210" rx="4" fill="#FFFFFF" stroke="#1E293B" stroke-width="2"/>
    <rect width="280" height="28" rx="4" fill="#1E293B"/>
    <text x="140" y="19" font-family="${fontStack}" font-size="12" font-weight="bold" fill="#FFFFFF" text-anchor="middle">SERIAL_IMEI</text>
    <text x="12" y="48" font-family="${fontStack}" font-size="11" font-weight="bold" fill="#DC2626">PK</text>
    <text x="40" y="48" font-family="${fontStack}" font-size="11" fill="#1E293B">id: VARCHAR2(64)</text>
    <text x="12" y="68" font-family="${fontStack}" font-size="11" font-weight="bold" fill="#2563EB">FK</text>
    <text x="40" y="68" font-family="${fontStack}" font-size="11" fill="#1E293B">product_id: VARCHAR2(64)</text>
    <text x="40" y="88" font-family="${fontStack}" font-size="11" fill="#1E293B">product_name: VARCHAR2(255)</text>
    <text x="40" y="108" font-family="${fontStack}" font-size="11" fill="#1E293B">serial_number: VARCHAR2(100) [UQ]</text>
    <text x="40" y="128" font-family="${fontStack}" font-size="11" fill="#1E293B">imei: VARCHAR2(100)</text>
    <text x="40" y="148" font-family="${fontStack}" font-size="11" fill="#1E293B">status: VARCHAR2(50)</text>
    <text x="40" y="168" font-family="${fontStack}" font-size="11" fill="#1E293B">customer_ref: VARCHAR2(255)</text>
    <text x="40" y="188" font-family="${fontStack}" font-size="11" fill="#1E293B">date_sold: TIMESTAMP</text>
  </g>

  <!-- Table 5: TRANSACTIONS -->
  <g transform="translate(880, 380)">
    <rect width="280" height="270" rx="4" fill="#FFFFFF" stroke="#1E293B" stroke-width="2"/>
    <rect width="280" height="28" rx="4" fill="#1E293B"/>
    <text x="140" y="19" font-family="${fontStack}" font-size="12" font-weight="bold" fill="#FFFFFF" text-anchor="middle">TRANSACTIONS</text>
    <text x="12" y="48" font-family="${fontStack}" font-size="11" font-weight="bold" fill="#DC2626">PK</text>
    <text x="40" y="48" font-family="${fontStack}" font-size="11" fill="#1E293B">id: VARCHAR2(64)</text>
    <text x="12" y="68" font-family="${fontStack}" font-size="11" font-weight="bold" fill="#2563EB">FK</text>
    <text x="40" y="68" font-family="${fontStack}" font-size="11" fill="#1E293B">product_id: VARCHAR2(64)</text>
    <text x="40" y="88" font-family="${fontStack}" font-size="11" fill="#1E293B">product_name: VARCHAR2(255)</text>
    <text x="40" y="108" font-family="${fontStack}" font-size="11" fill="#1E293B">type: VARCHAR2(50)</text>
    <text x="40" y="128" font-family="${fontStack}" font-size="11" fill="#1E293B">quantity: NUMBER(10)</text>
    <text x="40" y="148" font-family="${fontStack}" font-size="11" fill="#1E293B">unit_price: NUMBER(12,2)</text>
    <text x="40" y="168" font-family="${fontStack}" font-size="11" fill="#1E293B">total_value: NUMBER(12,2)</text>
    <text x="40" y="188" font-family="${fontStack}" font-size="11" fill="#1E293B">purchase_cost: NUMBER(12,2)</text>
    <text x="40" y="208" font-family="${fontStack}" font-size="11" fill="#1E293B">profit_loss: NUMBER(12,2)</text>
    <text x="40" y="228" font-family="${fontStack}" font-size="11" fill="#1E293B">trans_date: TIMESTAMP</text>
    <text x="40" y="248" font-family="${fontStack}" font-size="11" fill="#1E293B">user_name: VARCHAR2(255)</text>
  </g>

  <!-- Table 6: WARRANTIES -->
  <g transform="translate(460, 520)">
    <rect width="300" height="210" rx="4" fill="#FFFFFF" stroke="#1E293B" stroke-width="2"/>
    <rect width="300" height="28" rx="4" fill="#1E293B"/>
    <text x="150" y="19" font-family="${fontStack}" font-size="12" font-weight="bold" fill="#FFFFFF" text-anchor="middle">WARRANTIES</text>
    <text x="12" y="48" font-family="${fontStack}" font-size="11" font-weight="bold" fill="#DC2626">PK</text>
    <text x="40" y="48" font-family="${fontStack}" font-size="11" fill="#1E293B">id: VARCHAR2(64)</text>
    <text x="12" y="68" font-family="${fontStack}" font-size="11" font-weight="bold" fill="#2563EB">FK</text>
    <text x="40" y="68" font-family="${fontStack}" font-size="11" fill="#1E293B">product_id: VARCHAR2(64)</text>
    <text x="40" y="88" font-family="${fontStack}" font-size="11" fill="#1E293B">serial_number: VARCHAR2(100)</text>
    <text x="40" y="108" font-family="${fontStack}" font-size="11" fill="#1E293B">customer_name: VARCHAR2(255)</text>
    <text x="40" y="128" font-family="${fontStack}" font-size="11" fill="#1E293B">customer_phone: VARCHAR2(50)</text>
    <text x="40" y="148" font-family="${fontStack}" font-size="11" fill="#1E293B">start_date: TIMESTAMP</text>
    <text x="40" y="168" font-family="${fontStack}" font-size="11" fill="#1E293B">end_date: TIMESTAMP</text>
    <text x="40" y="188" font-family="${fontStack}" font-size="11" fill="#1E293B">status: VARCHAR2(50)</text>
  </g>

  <!-- Table 7: WARRANTY_CLAIMS -->
  <g transform="translate(80, 560)">
    <rect width="260" height="150" rx="4" fill="#FFFFFF" stroke="#1E293B" stroke-width="2"/>
    <rect width="260" height="28" rx="4" fill="#1E293B"/>
    <text x="130" y="19" font-family="${fontStack}" font-size="12" font-weight="bold" fill="#FFFFFF" text-anchor="middle">WARRANTY_CLAIMS</text>
    <text x="12" y="48" font-family="${fontStack}" font-size="11" font-weight="bold" fill="#DC2626">PK</text>
    <text x="40" y="48" font-family="${fontStack}" font-size="11" fill="#1E293B">id: VARCHAR2(64)</text>
    <text x="12" y="68" font-family="${fontStack}" font-size="11" font-weight="bold" fill="#2563EB">FK</text>
    <text x="40" y="68" font-family="${fontStack}" font-size="11" fill="#1E293B">warranty_id: VARCHAR2(64)</text>
    <text x="40" y="88" font-family="${fontStack}" font-size="11" fill="#1E293B">claim_date: TIMESTAMP</text>
    <text x="40" y="108" font-family="${fontStack}" font-size="11" fill="#1E293B">issue_description: VARCHAR2(2000)</text>
    <text x="40" y="128" font-family="${fontStack}" font-size="11" fill="#1E293B">status: VARCHAR2(50)</text>
  </g>

  <!-- Table 8: USERS -->
  <g transform="translate(80, 780)">
    <rect width="260" height="170" rx="4" fill="#FFFFFF" stroke="#1E293B" stroke-width="2"/>
    <rect width="260" height="28" rx="4" fill="#1E293B"/>
    <text x="130" y="19" font-family="${fontStack}" font-size="12" font-weight="bold" fill="#FFFFFF" text-anchor="middle">USERS</text>
    <text x="12" y="48" font-family="${fontStack}" font-size="11" font-weight="bold" fill="#DC2626">PK</text>
    <text x="40" y="48" font-family="${fontStack}" font-size="11" fill="#1E293B">id: VARCHAR2(64)</text>
    <text x="40" y="68" font-family="${fontStack}" font-size="11" fill="#1E293B">name: VARCHAR2(255)</text>
    <text x="40" y="88" font-family="${fontStack}" font-size="11" fill="#1E293B">email: VARCHAR2(255) [UNIQUE]</text>
    <text x="40" y="108" font-family="${fontStack}" font-size="11" fill="#1E293B">password_hash: VARCHAR2(255)</text>
    <text x="40" y="128" font-family="${fontStack}" font-size="11" fill="#1E293B">role: VARCHAR2(50)</text>
    <text x="40" y="148" font-family="${fontStack}" font-size="11" fill="#1E293B">status: VARCHAR2(50)</text>
  </g>

  <!-- Table 9: SALES_RECEIPTS -->
  <g transform="translate(460, 780)">
    <rect width="300" height="170" rx="4" fill="#FFFFFF" stroke="#1E293B" stroke-width="2"/>
    <rect width="300" height="28" rx="4" fill="#1E293B"/>
    <text x="150" y="19" font-family="${fontStack}" font-size="12" font-weight="bold" fill="#FFFFFF" text-anchor="middle">SALES_RECEIPTS</text>
    <text x="12" y="48" font-family="${fontStack}" font-size="11" font-weight="bold" fill="#DC2626">PK</text>
    <text x="40" y="48" font-family="${fontStack}" font-size="11" fill="#1E293B">id: VARCHAR2(64)</text>
    <text x="40" y="68" font-family="${fontStack}" font-size="11" fill="#1E293B">receipt_number: VARCHAR2(100) [UQ]</text>
    <text x="40" y="88" font-family="${fontStack}" font-size="11" fill="#1E293B">customer_name: VARCHAR2(255)</text>
    <text x="40" y="108" font-family="${fontStack}" font-size="11" fill="#1E293B">subtotal: NUMBER(12,2)</text>
    <text x="40" y="128" font-family="${fontStack}" font-size="11" fill="#1E293B">grand_total: NUMBER(12,2)</text>
    <text x="40" y="148" font-family="${fontStack}" font-size="11" fill="#1E293B">payment_method: VARCHAR2(50)</text>
  </g>

  <!-- Table 10: PURCHASE_ORDERS -->
  <g transform="translate(880, 780)">
    <rect width="280" height="170" rx="4" fill="#FFFFFF" stroke="#1E293B" stroke-width="2"/>
    <rect width="280" height="28" rx="4" fill="#1E293B"/>
    <text x="140" y="19" font-family="${fontStack}" font-size="12" font-weight="bold" fill="#FFFFFF" text-anchor="middle">PURCHASE_ORDERS</text>
    <text x="12" y="48" font-family="${fontStack}" font-size="11" font-weight="bold" fill="#DC2626">PK</text>
    <text x="40" y="48" font-family="${fontStack}" font-size="11" fill="#1E293B">id: VARCHAR2(64)</text>
    <text x="40" y="68" font-family="${fontStack}" font-size="11" fill="#1E293B">po_number: VARCHAR2(100) [UQ]</text>
    <text x="12" y="88" font-family="${fontStack}" font-size="11" font-weight="bold" fill="#2563EB">FK</text>
    <text x="40" y="88" font-family="${fontStack}" font-size="11" fill="#1E293B">supplier_id: VARCHAR2(64)</text>
    <text x="40" y="108" font-family="${fontStack}" font-size="11" fill="#1E293B">supplier_name: VARCHAR2(255)</text>
    <text x="40" y="128" font-family="${fontStack}" font-size="11" fill="#1E293B">status: VARCHAR2(50)</text>
    <text x="40" y="148" font-family="${fontStack}" font-size="11" fill="#1E293B">total_amount: NUMBER(12,2)</text>
  </g>

  <!-- Relationship Lines (Crow's Foot) -->
  <!-- Categories 1 to * Products -->
  <line x1="340" y1="180" x2="460" y2="230" stroke="#2563EB" stroke-width="2"/>
  <text x="350" y="175" font-family="${fontStack}" font-size="12" font-weight="bold" fill="#2563EB">1</text>
  <text x="440" y="220" font-family="${fontStack}" font-size="12" font-weight="bold" fill="#2563EB">∞</text>

  <!-- Suppliers 1 to * Products -->
  <line x1="340" y1="360" x2="460" y2="330" stroke="#2563EB" stroke-width="2"/>
  <text x="350" y="375" font-family="${fontStack}" font-size="12" font-weight="bold" fill="#2563EB">1</text>
  <text x="440" y="320" font-family="${fontStack}" font-size="12" font-weight="bold" fill="#2563EB">∞</text>

  <!-- Products 1 to * SerialImei -->
  <line x1="760" y1="230" x2="880" y2="200" stroke="#2563EB" stroke-width="2"/>
  <text x="770" y="220" font-family="${fontStack}" font-size="12" font-weight="bold" fill="#2563EB">1</text>
  <text x="860" y="195" font-family="${fontStack}" font-size="12" font-weight="bold" fill="#2563EB">∞</text>

  <!-- Products 1 to * Transactions -->
  <line x1="760" y1="340" x2="880" y2="440" stroke="#2563EB" stroke-width="2"/>
  <text x="770" y="335" font-family="${fontStack}" font-size="12" font-weight="bold" fill="#2563EB">1</text>
  <text x="860" y="430" font-family="${fontStack}" font-size="12" font-weight="bold" fill="#2563EB">∞</text>

  <!-- Products 1 to * Warranties -->
  <line x1="600" y1="450" x2="600" y2="520" stroke="#2563EB" stroke-width="2"/>
  <text x="610" y="470" font-family="${fontStack}" font-size="12" font-weight="bold" fill="#2563EB">1</text>
  <text x="610" y="505" font-family="${fontStack}" font-size="12" font-weight="bold" fill="#2563EB">∞</text>

  <!-- Warranties 1 to * Warranty Claims -->
  <line x1="460" y1="620" x2="340" y2="620" stroke="#2563EB" stroke-width="2"/>
  <text x="445" y="615" font-family="${fontStack}" font-size="12" font-weight="bold" fill="#2563EB">1</text>
  <text x="355" y="615" font-family="${fontStack}" font-size="12" font-weight="bold" fill="#2563EB">∞</text>
</svg>`;

fs.writeFileSync(path.join(outDir, '09_entity_relationship_diagram.svg'), svgER);
console.log('✓ 09_entity_relationship_diagram.svg created');

// ============================================================================
// 10. UML OBJECT DIAGRAM (RUNTIME INSTANCE SNAPSHOT)
// ============================================================================
const svgObject = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1400 960" width="1400" height="960">
  <rect width="1400" height="960" fill="#FFFFFF"/>
  
  <!-- Header -->
  <rect x="50" y="25" width="1300" height="55" rx="8" fill="#1E293B"/>
  <text x="700" y="60" font-family="${fontStack}" font-size="20" font-weight="bold" fill="#FFFFFF" text-anchor="middle">
    ElectroStock - UML Object Diagram
  </text>
  <text x="700" y="105" font-family="${fontStack}" font-size="13" fill="#64748B" text-anchor="middle">
    Runtime Instance Model: Concrete Objects, Slot Attribute Values &amp; Associations at Time T0
  </text>

  <!-- Object Links (Rendered first so boxes sit cleanly on top) -->
  <!-- laptopsCategory to macbookPro16 -->
  <line x1="320" y1="205" x2="390" y2="205" stroke="#334155" stroke-width="2"/>
  <text x="355" y="195" font-family="${fontStack}" font-size="11" fill="#475569" text-anchor="middle">classifiedAs</text>

  <!-- appleWholesale to macbookPro16 -->
  <line x1="770" y1="205" x2="710" y2="205" stroke="#334155" stroke-width="2"/>
  <text x="740" y="195" font-family="${fontStack}" font-size="11" fill="#475569" text-anchor="middle">suppliedBy</text>

  <!-- macbookPro16 to serialUnit01 -->
  <line x1="450" y1="310" x2="215" y2="370" stroke="#334155" stroke-width="2"/>
  <text x="310" y="340" font-family="${fontStack}" font-size="11" fill="#475569">hasSerial</text>

  <!-- macbookPro16 to serialUnit02 -->
  <line x1="535" y1="310" x2="525" y2="370" stroke="#334155" stroke-width="2"/>
  <text x="540" y="345" font-family="${fontStack}" font-size="11" fill="#475569">hasSerial</text>

  <!-- macbookPro16 to posSaleTxn -->
  <line x1="670" y1="310" x2="770" y2="370" stroke="#334155" stroke-width="2"/>
  <text x="725" y="340" font-family="${fontStack}" font-size="11" fill="#475569">itemTransacted</text>

  <!-- posSaleTxn to receiptRec -->
  <line x1="990" y1="440" x2="1050" y2="440" stroke="#334155" stroke-width="2"/>
  <text x="1020" y="430" font-family="${fontStack}" font-size="11" fill="#475569" text-anchor="middle">billedUnder</text>

  <!-- cashierAlex to posSaleTxn -->
  <line x1="1170" y1="270" x2="940" y2="370" stroke="#334155" stroke-width="2"/>
  <text x="1070" y="315" font-family="${fontStack}" font-size="11" fill="#475569">processedBy</text>

  <!-- serialUnit01 to warrantyAppleCare -->
  <line x1="205" y1="515" x2="205" y2="590" stroke="#334155" stroke-width="2"/>
  <text x="215" y="555" font-family="${fontStack}" font-size="11" fill="#475569">coveredBy</text>

  <!-- warrantyAppleCare to claim01 -->
  <line x1="330" y1="660" x2="390" y2="660" stroke="#334155" stroke-width="2"/>
  <text x="360" y="650" font-family="${fontStack}" font-size="11" fill="#475569" text-anchor="middle">hasClaim</text>

  <!-- activeDataStore to oracleDbService -->
  <line x1="510" y1="845" x2="580" y2="845" stroke="#0F766E" stroke-width="2" stroke-dasharray="5,4"/>
  <text x="545" y="835" font-family="${fontStack}" font-size="11" fill="#0F766E" text-anchor="middle">jdbcSync</text>

  <!-- ================= ROW 1 OBJECTS ================= -->

  <!-- Object: laptopsCategory : Category -->
  <g transform="translate(60, 130)">
    <rect width="260" height="150" rx="6" fill="#F8FAFC" stroke="#0284C7" stroke-width="2"/>
    <rect width="260" height="34" rx="6" fill="#E0F2FE"/>
    <text x="130" y="22" font-family="${fontStack}" font-size="12" font-weight="bold" text-decoration="underline" fill="#0369A1" text-anchor="middle">
      laptopsCategory : Category
    </text>
    <text x="15" y="58" font-family="${fontStack}" font-size="11" fill="#334155">id = "cat-001"</text>
    <text x="15" y="78" font-family="${fontStack}" font-size="11" fill="#334155">name = "Laptops &amp; Notebooks"</text>
    <text x="15" y="98" font-family="${fontStack}" font-size="11" fill="#334155">description = "Portable Compute"</text>
    <text x="15" y="118" font-family="${fontStack}" font-size="11" fill="#334155">status = "ACTIVE"</text>
    <text x="15" y="138" font-family="${fontStack}" font-size="11" fill="#334155">itemCount = 24</text>
  </g>

  <!-- Central Object: macbookPro16 : Product -->
  <g transform="translate(390, 130)">
    <rect width="320" height="180" rx="6" fill="#F8FAFC" stroke="#2563EB" stroke-width="2"/>
    <rect width="320" height="34" rx="6" fill="#DBEAFE"/>
    <text x="160" y="22" font-family="${fontStack}" font-size="13" font-weight="bold" text-decoration="underline" fill="#1D4ED8" text-anchor="middle">
      macbookPro16 : Product
    </text>
    <text x="15" y="56" font-family="${fontStack}" font-size="11" fill="#334155">id = "prod-001"</text>
    <text x="15" y="74" font-family="${fontStack}" font-size="11" fill="#334155">name = "MacBook Pro 16\" M3 Max"</text>
    <text x="15" y="92" font-family="${fontStack}" font-size="11" fill="#334155">sku = "APL-MBP-16-M3"</text>
    <text x="15" y="110" font-family="${fontStack}" font-size="11" fill="#334155">brand = "Apple"</text>
    <text x="15" y="128" font-family="${fontStack}" font-size="11" fill="#334155">stock = 14</text>
    <text x="15" y="146" font-family="${fontStack}" font-size="11" fill="#334155">purchasePrice = 2499.00 USD</text>
    <text x="15" y="164" font-family="${fontStack}" font-size="11" fill="#334155">sellingPrice = 2899.00 USD</text>
  </g>

  <!-- Object: appleWholesale : Supplier -->
  <g transform="translate(770, 130)">
    <rect width="270" height="150" rx="6" fill="#F8FAFC" stroke="#0284C7" stroke-width="2"/>
    <rect width="270" height="34" rx="6" fill="#E0F2FE"/>
    <text x="135" y="22" font-family="${fontStack}" font-size="12" font-weight="bold" text-decoration="underline" fill="#0369A1" text-anchor="middle">
      appleWholesale : Supplier
    </text>
    <text x="15" y="58" font-family="${fontStack}" font-size="11" fill="#334155">id = "sup-001"</text>
    <text x="15" y="78" font-family="${fontStack}" font-size="11" fill="#334155">name = "Apple India Enterprise"</text>
    <text x="15" y="98" font-family="${fontStack}" font-size="11" fill="#334155">gstin = "27AABCA1234F1Z5"</text>
    <text x="15" y="118" font-family="${fontStack}" font-size="11" fill="#334155">phone = "+91-80-6789-1000"</text>
    <text x="15" y="138" font-family="${fontStack}" font-size="11" fill="#334155">status = "VERIFIED"</text>
  </g>

  <!-- Object: cashierAlex : User -->
  <g transform="translate(1090, 130)">
    <rect width="250" height="140" rx="6" fill="#F8FAFC" stroke="#D97706" stroke-width="2"/>
    <rect width="250" height="34" rx="6" fill="#FEF3C7"/>
    <text x="125" y="22" font-family="${fontStack}" font-size="12" font-weight="bold" text-decoration="underline" fill="#B45309" text-anchor="middle">
      cashierAlex : User
    </text>
    <text x="15" y="58" font-family="${fontStack}" font-size="11" fill="#334155">id = "usr-003"</text>
    <text x="15" y="78" font-family="${fontStack}" font-size="11" fill="#334155">username = "alex_cashier"</text>
    <text x="15" y="98" font-family="${fontStack}" font-size="11" fill="#334155">role = "CASHIER"</text>
    <text x="15" y="118" font-family="${fontStack}" font-size="11" fill="#334155">active = true</text>
  </g>

  <!-- ================= ROW 2 OBJECTS ================= -->

  <!-- Object: serialUnit01 : SerialImei -->
  <g transform="translate(60, 370)">
    <rect width="270" height="145" rx="6" fill="#F8FAFC" stroke="#DB2777" stroke-width="2"/>
    <rect width="270" height="34" rx="6" fill="#FCE7F3"/>
    <text x="135" y="22" font-family="${fontStack}" font-size="12" font-weight="bold" text-decoration="underline" fill="#BE185D" text-anchor="middle">
      serialUnit01 : SerialImei
    </text>
    <text x="15" y="56" font-family="${fontStack}" font-size="11" fill="#334155">id = "ser-101"</text>
    <text x="15" y="74" font-family="${fontStack}" font-size="11" fill="#334155">serialNumber = "SN-MBP-9801"</text>
    <text x="15" y="92" font-family="${fontStack}" font-size="11" fill="#334155">imei = "356789123456781"</text>
    <text x="15" y="110" font-family="${fontStack}" font-size="11" font-weight="bold" fill="#DC2626">status = "SOLD"</text>
    <text x="15" y="128" font-family="${fontStack}" font-size="11" fill="#334155">customerRef = "CUST-901"</text>
  </g>

  <!-- Object: serialUnit02 : SerialImei -->
  <g transform="translate(390, 370)">
    <rect width="270" height="145" rx="6" fill="#F8FAFC" stroke="#16A34A" stroke-width="2"/>
    <rect width="270" height="34" rx="6" fill="#DCFCE7"/>
    <text x="135" y="22" font-family="${fontStack}" font-size="12" font-weight="bold" text-decoration="underline" fill="#15803D" text-anchor="middle">
      serialUnit02 : SerialImei
    </text>
    <text x="15" y="56" font-family="${fontStack}" font-size="11" fill="#334155">id = "ser-102"</text>
    <text x="15" y="74" font-family="${fontStack}" font-size="11" fill="#334155">serialNumber = "SN-MBP-9802"</text>
    <text x="15" y="92" font-family="${fontStack}" font-size="11" fill="#334155">imei = "356789123456782"</text>
    <text x="15" y="110" font-family="${fontStack}" font-size="11" font-weight="bold" fill="#16A34A">status = "IN_STOCK"</text>
    <text x="15" y="128" font-family="${fontStack}" font-size="11" fill="#334155">customerRef = null</text>
  </g>

  <!-- Object: posSaleTxn : Transaction -->
  <g transform="translate(710, 370)">
    <rect width="280" height="165" rx="6" fill="#F8FAFC" stroke="#7C3AED" stroke-width="2"/>
    <rect width="280" height="34" rx="6" fill="#EDE9FE"/>
    <text x="140" y="22" font-family="${fontStack}" font-size="12" font-weight="bold" text-decoration="underline" fill="#6D28D9" text-anchor="middle">
      posSaleTxn : Transaction
    </text>
    <text x="15" y="56" font-family="${fontStack}" font-size="11" fill="#334155">id = "txn-801"</text>
    <text x="15" y="74" font-family="${fontStack}" font-size="11" fill="#334155">type = "STOCK_OUT"</text>
    <text x="15" y="92" font-family="${fontStack}" font-size="11" fill="#334155">quantity = 1</text>
    <text x="15" y="110" font-family="${fontStack}" font-size="11" fill="#334155">unitPrice = 2899.00 USD</text>
    <text x="15" y="128" font-family="${fontStack}" font-size="11" fill="#334155">totalValue = 2899.00 USD</text>
    <text x="15" y="146" font-family="${fontStack}" font-size="11" font-weight="bold" fill="#16A34A">profitLoss = +400.00 USD</text>
  </g>

  <!-- Object: receiptRec : SalesReceipt -->
  <g transform="translate(1050, 370)">
    <rect width="290" height="150" rx="6" fill="#F8FAFC" stroke="#7C3AED" stroke-width="2"/>
    <rect width="290" height="34" rx="6" fill="#EDE9FE"/>
    <text x="145" y="22" font-family="${fontStack}" font-size="12" font-weight="bold" text-decoration="underline" fill="#6D28D9" text-anchor="middle">
      receiptRec : SalesReceipt
    </text>
    <text x="15" y="56" font-family="${fontStack}" font-size="11" fill="#334155">id = "rcpt-501"</text>
    <text x="15" y="74" font-family="${fontStack}" font-size="11" fill="#334155">receiptNo = "REC-2026-0891"</text>
    <text x="15" y="92" font-family="${fontStack}" font-size="11" fill="#334155">customerName = "John Doe"</text>
    <text x="15" y="110" font-family="${fontStack}" font-size="11" fill="#334155">grandTotal = 2899.00 USD</text>
    <text x="15" y="128" font-family="${fontStack}" font-size="11" fill="#334155">payment = "CREDIT_CARD"</text>
  </g>

  <!-- ================= ROW 3 OBJECTS ================= -->

  <!-- Object: warrantyAppleCare : Warranty -->
  <g transform="translate(60, 590)">
    <rect width="270" height="160" rx="6" fill="#F8FAFC" stroke="#4F46E5" stroke-width="2"/>
    <rect width="270" height="34" rx="6" fill="#E0E7FF"/>
    <text x="135" y="22" font-family="${fontStack}" font-size="12" font-weight="bold" text-decoration="underline" fill="#4338CA" text-anchor="middle">
      warrantyAppleCare : Warranty
    </text>
    <text x="15" y="56" font-family="${fontStack}" font-size="11" fill="#334155">id = "war-401"</text>
    <text x="15" y="74" font-family="${fontStack}" font-size="11" fill="#334155">customerName = "John Doe"</text>
    <text x="15" y="92" font-family="${fontStack}" font-size="11" fill="#334155">customerPhone = "+1-555-0199"</text>
    <text x="15" y="110" font-family="${fontStack}" font-size="11" fill="#334155">startDate = "2026-10-10"</text>
    <text x="15" y="128" font-family="${fontStack}" font-size="11" fill="#334155">endDate = "2028-10-10"</text>
    <text x="15" y="146" font-family="${fontStack}" font-size="11" font-weight="bold" fill="#16A34A">status = "ACTIVE"</text>
  </g>

  <!-- Object: claim01 : WarrantyClaim -->
  <g transform="translate(390, 590)">
    <rect width="280" height="150" rx="6" fill="#F8FAFC" stroke="#DC2626" stroke-width="2"/>
    <rect width="280" height="34" rx="6" fill="#FEE2E2"/>
    <text x="140" y="22" font-family="${fontStack}" font-size="12" font-weight="bold" text-decoration="underline" fill="#B91C1C" text-anchor="middle">
      claim01 : WarrantyClaim
    </text>
    <text x="15" y="56" font-family="${fontStack}" font-size="11" fill="#334155">id = "clm-001"</text>
    <text x="15" y="74" font-family="${fontStack}" font-size="11" fill="#334155">claimDate = "2026-10-10"</text>
    <text x="15" y="92" font-family="${fontStack}" font-size="11" fill="#334155">issue = "Display flicker under load"</text>
    <text x="15" y="110" font-family="${fontStack}" font-size="11" font-weight="bold" fill="#D97706">status = "IN_INSPECTION"</text>
    <text x="15" y="128" font-family="${fontStack}" font-size="11" fill="#334155">assignedTech = "tech-01"</text>
  </g>

  <!-- Legend & Runtime Notes Card -->
  <g transform="translate(710, 570)">
    <rect width="630" height="180" rx="6" fill="#F8FAFC" stroke="#94A3B8" stroke-width="1.5"/>
    <rect width="630" height="32" rx="6" fill="#F1F5F9"/>
    <text x="315" y="21" font-family="${fontStack}" font-size="12" font-weight="bold" fill="#334155" text-anchor="middle">
      Runtime State &amp; Object Diagram Specification (Snapshot T0)
    </text>
    <text x="20" y="55" font-family="${fontStack}" font-size="11" fill="#475569">• UML 2.5 Standard: Instance names and class types are underlined (&lt;u&gt;instance : Class&lt;/u&gt;).</text>
    <text x="20" y="75" font-family="${fontStack}" font-size="11" fill="#475569">• Solid connecting lines depict concrete runtime Links (instantiated associations).</text>
    <text x="20" y="95" font-family="${fontStack}" font-size="11" fill="#475569">• Instance slot values show live data synchronized with Oracle 10g XE schema tables.</text>
    <text x="20" y="115" font-family="${fontStack}" font-size="11" fill="#475569">• Demonstrates sale of unit 'SN-MBP-9801', profit calculation (+400 USD), and active warranty claim.</text>
    <text x="20" y="135" font-family="${fontStack}" font-size="11" fill="#475569">• Pure white background (#FFFFFF) with high-contrast typography, ready for academic printing.</text>
  </g>

  <!-- ================= ROW 4: INFRASTRUCTURE SINGLETONS ================= -->

  <!-- Object: activeDataStore : DataStore -->
  <g transform="translate(60, 785)">
    <rect width="450" height="125" rx="6" fill="#F8FAFC" stroke="#0F766E" stroke-width="2"/>
    <rect width="450" height="32" rx="6" fill="#CCFBF1"/>
    <text x="225" y="21" font-family="${fontStack}" font-size="12" font-weight="bold" text-decoration="underline" fill="#115E59" text-anchor="middle">
      activeDataStore : DataStore &lt;&lt;Singleton&gt;&gt;
    </text>
    <text x="20" y="55" font-family="${fontStack}" font-size="11" fill="#334155">cachedProductCount = 10</text>
    <text x="20" y="75" font-family="${fontStack}" font-size="11" fill="#334155">cachedTransactionCount = 6</text>
    <text x="20" y="95" font-family="${fontStack}" font-size="11" fill="#334155">cacheStatus = "SYNCHRONIZED"</text>
    <text x="240" y="55" font-family="${fontStack}" font-size="11" fill="#334155">httpPortBinding = 8085</text>
    <text x="240" y="75" font-family="${fontStack}" font-size="11" fill="#334155">executorPoolActive = 16</text>
    <text x="240" y="95" font-family="${fontStack}" font-size="11" fill="#334155">dirtyFlag = false</text>
  </g>

  <!-- Object: oracleDbService : OracleDbService -->
  <g transform="translate(580, 785)">
    <rect width="760" height="125" rx="6" fill="#F8FAFC" stroke="#0F766E" stroke-width="2"/>
    <rect width="760" height="32" rx="6" fill="#CCFBF1"/>
    <text x="380" y="21" font-family="${fontStack}" font-size="12" font-weight="bold" text-decoration="underline" fill="#115E59" text-anchor="middle">
      oracleDbService : OracleDbService &lt;&lt;Singleton&gt;&gt;
    </text>
    <text x="20" y="55" font-family="${fontStack}" font-size="11" fill="#334155">jdbcUrl = "jdbc:oracle:thin:@localhost:1521:XE"</text>
    <text x="20" y="75" font-family="${fontStack}" font-size="11" fill="#334155">dbUser = "system"</text>
    <text x="20" y="95" font-family="${fontStack}" font-size="11" fill="#334155">connectionPoolActive = 5</text>
    <text x="400" y="55" font-family="${fontStack}" font-size="11" fill="#334155">oracleConnected = true</text>
    <text x="400" y="75" font-family="${fontStack}" font-size="11" fill="#334155">lastHeartbeat = "2026-10-10 14:32:00"</text>
    <text x="400" y="95" font-family="${fontStack}" font-size="11" fill="#334155">driver = "oracle.jdbc.driver.OracleDriver"</text>
  </g>
</svg>`;

fs.writeFileSync(path.join(outDir, '10_object_diagram.svg'), svgObject);
console.log('✓ 10_object_diagram.svg created');

// Generate HTML preview gallery
const htmlGallery = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>ElectroStock - UML & System Architecture Diagrams Gallery</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; background: #F1F5F9; color: #0F172A; margin: 0; padding: 30px; }
    h1 { text-align: center; margin-bottom: 8px; color: #1E293B; }
    p.sub { text-align: center; color: #64748B; margin-top: 0; margin-bottom: 30px; }
    .grid { display: flex; flex-direction: column; gap: 40px; max-width: 1400px; margin: 0 auto; }
    .card { background: #FFFFFF; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); padding: 24px; }
    .card-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #E2E8F0; padding-bottom: 12px; margin-bottom: 16px; }
    .card-title { font-size: 18px; font-weight: bold; color: #1E293B; }
    .card-meta { font-size: 13px; color: #64748B; }
    .img-wrapper { background: #FFFFFF; border: 1px solid #CBD5E1; border-radius: 8px; overflow: hidden; display: flex; justify-content: center; }
    img { width: 100%; height: auto; max-width: 1300px; display: block; }
    .btn { display: inline-block; padding: 6px 14px; background: #2563EB; color: #FFF; text-decoration: none; border-radius: 6px; font-size: 12px; font-weight: 600; }
  </style>
</head>
<body>
  <h1>ElectroStock - Electronics Inventory &amp; ERP System</h1>
  <p class="sub">Complete College Project Report UML &amp; Architectural Diagram Suite (Pure Vector &amp; High Resolution PNG)</p>
  
  <div class="grid">
    <div class="card">
      <div class="card-header">
        <div class="card-title">1. System Architecture Diagram</div>
        <div class="card-meta">3-Tier Architecture | <a class="btn" href="01_system_architecture.svg" download>Download SVG</a> <a class="btn" href="01_system_architecture.png" download>Download PNG</a></div>
      </div>
      <div class="img-wrapper"><img src="01_system_architecture.svg" alt="System Architecture"></div>
    </div>

    <div class="card">
      <div class="card-header">
        <div class="card-title">2. UML Use Case Diagram</div>
        <div class="card-meta">Actors &amp; Subsystems | <a class="btn" href="02_use_case_diagram.svg" download>Download SVG</a> <a class="btn" href="02_use_case_diagram.png" download>Download PNG</a></div>
      </div>
      <div class="img-wrapper"><img src="02_use_case_diagram.svg" alt="UML Use Case Diagram"></div>
    </div>

    <div class="card">
      <div class="card-header">
        <div class="card-title">3. UML Class Diagram</div>
        <div class="card-meta">Domain Entities &amp; Services | <a class="btn" href="03_class_diagram.svg" download>Download SVG</a> <a class="btn" href="03_class_diagram.png" download>Download PNG</a></div>
      </div>
      <div class="img-wrapper"><img src="03_class_diagram.svg" alt="UML Class Diagram"></div>
    </div>

    <div class="card">
      <div class="card-header">
        <div class="card-title">4. UML Sequence Diagram: POS Customer Sale</div>
        <div class="card-meta">Execution Flow &amp; Stock Deduction | <a class="btn" href="04_sequence_diagram.svg" download>Download SVG</a> <a class="btn" href="04_sequence_diagram.png" download>Download PNG</a></div>
      </div>
      <div class="img-wrapper"><img src="04_sequence_diagram.svg" alt="UML Sequence Diagram"></div>
    </div>

    <div class="card">
      <div class="card-header">
        <div class="card-title">5. UML Activity Diagram: Stock Operations</div>
        <div class="card-meta">Stock In &amp; Stock Out Workflow | <a class="btn" href="05_activity_diagram.svg" download>Download SVG</a> <a class="btn" href="05_activity_diagram.png" download>Download PNG</a></div>
      </div>
      <div class="img-wrapper"><img src="05_activity_diagram.svg" alt="UML Activity Diagram"></div>
    </div>

    <div class="card">
      <div class="card-header">
        <div class="card-title">6. UML State Machine Diagram: Device &amp; Warranty Lifecycle</div>
        <div class="card-meta">Serial State Transitions | <a class="btn" href="06_state_machine_diagram.svg" download>Download SVG</a> <a class="btn" href="06_state_machine_diagram.png" download>Download PNG</a></div>
      </div>
      <div class="img-wrapper"><img src="06_state_machine_diagram.svg" alt="UML State Machine Diagram"></div>
    </div>

    <div class="card">
      <div class="card-header">
        <div class="card-title">7. UML Component Diagram</div>
        <div class="card-meta">Modular Subsystem Architecture | <a class="btn" href="07_component_diagram.svg" download>Download SVG</a> <a class="btn" href="07_component_diagram.png" download>Download PNG</a></div>
      </div>
      <div class="img-wrapper"><img src="07_component_diagram.svg" alt="UML Component Diagram"></div>
    </div>

    <div class="card">
      <div class="card-header">
        <div class="card-title">8. UML Deployment Diagram</div>
        <div class="card-meta">Physical Nodes &amp; Execution Environment | <a class="btn" href="08_deployment_diagram.svg" download>Download SVG</a> <a class="btn" href="08_deployment_diagram.png" download>Download PNG</a></div>
      </div>
      <div class="img-wrapper"><img src="08_deployment_diagram.svg" alt="UML Deployment Diagram"></div>
    </div>

    <div class="card">
      <div class="card-header">
        <div class="card-title">9. Database Entity-Relationship (ER) Diagram</div>
        <div class="card-meta">Oracle SQL Relational Schema | <a class="btn" href="09_entity_relationship_diagram.svg" download>Download SVG</a> <a class="btn" href="09_entity_relationship_diagram.png" download>Download PNG</a></div>
      </div>
      <div class="img-wrapper"><img src="09_entity_relationship_diagram.svg" alt="ER Diagram"></div>
    </div>

    <div class="card">
      <div class="card-header">
        <div class="card-title">10. UML Object Diagram</div>
        <div class="card-meta">Runtime Instance Snapshot &amp; Slot State | <a class="btn" href="10_object_diagram.svg" download>Download SVG</a> <a class="btn" href="10_object_diagram.png" download>Download PNG</a></div>
      </div>
      <div class="img-wrapper"><img src="10_object_diagram.svg" alt="UML Object Diagram"></div>
    </div>
  </div>
</body>
</html>`;

fs.writeFileSync(path.join(outDir, 'index.html'), htmlGallery);
console.log('✓ index.html preview gallery created');

console.log('ALL DIAGRAMS SUCCESSFULLY GENERATED IN diagrams/ !');

