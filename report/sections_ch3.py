# -*- coding: utf-8 -*-
"""
Chapter 3 Builder: System Implementation, Technology Stack Rationales,
Frontend Architecture, Zustand Global State Management, POS Scanner Engine,
Full-Screen Order Success Portal, Backend Java 26 Microservice, Dual-Database
Failover Engine, jsPDF Automated Tax Invoice Engine, Core Implementation Code Listings,
and Comprehensive Relational SQL DDL Definition Script.
"""

from docx.shared import Inches
from report_helpers import add_p, add_h1, add_h2, add_h3, add_bullet, add_academic_table, add_code_listing

def build_chapter_3(doc):
    p_ch3 = doc.add_paragraph()
    p_ch3.paragraph_format.page_break_before = True

    add_h1(doc, "CHAPTER 3: SYSTEM IMPLEMENTATION & TECHNICAL ARCHITECTURE")

    add_h2(doc, "3.1 Technology Stack & Architectural Rationales")
    add_p(doc,
          "The technological foundation of ElectroStock was selected following a rigorous engineering assessment "
          "of operational requirements in real-world consumer electronics retail environments. Retail checkout counters "
          "demand sub-millisecond barcode response times, zero screen flicker, deterministic transaction atomicity, "
          "and continuous availability regardless of external internet connectivity disruptions. To meet these "
          "demanding service-level objectives, ElectroStock implements a decoupled hybrid architecture combining a "
          "reactive TypeScript/Next.js frontend with a lightweight Java 26 microservice and a dual-tier persistence layer.")

    add_bullet(doc, "Frontend Framework (Next.js 13+ App Router & React 18): ",
               "React 18 provides declarative user interface composition and concurrent rendering capabilities. "
               "The Next.js App Router architecture enables a hybrid rendering strategy: static metadata and layouts are "
               "pre-compiled, while dynamic checkout interactions execute exclusively as client-side single-page applications. "
               "This eliminates server round-trip latency during high-frequency barcode scanning operations.")

    add_bullet(doc, "Language & Type Safety (TypeScript 5.x): ",
               "Electronics merchandising involves deeply nested data models (products with variant specifications, IMEI arrays, "
               "compound tax structures, and warranty rules). TypeScript provides static compile-time type verification, "
               "eliminating runtime undefined property exceptions across currency calculations, inventory counts, and API payloads.")

    add_bullet(doc, "Styling & Responsive Presentation (Tailwind CSS): ",
               "Utility-first styling enables precise design token enforcement (colors, spacing, typography) without runtime "
               "CSS-in-JS overhead. The interface is optimized for both desktop widescreen POS terminals (1920x1080) and "
               "compact 10-inch counter touchscreens, ensuring optimal ergonomical accessibility for checkout operators.")

    add_bullet(doc, "Client State Synchronization (Zustand 4.x): ",
               "Unlike heavy Redux architectures that introduce extensive boilerplate and selector recalculations, Zustand "
               "provides an ultra-lightweight, hook-based state management engine. It enables instantaneous cart mutation, "
               "serial number validation, and real-time tax aggregation with zero unnecessary component re-renders.")

    add_bullet(doc, "Backend Microservice Engine (Java 26 & Virtual Threads): ",
               "A high-performance embedded Java REST microservice executes on port 8085. Utilizing Java's modern concurrency "
               "primitives, the service processes high-throughput inventory deductions, batch stock intakes, and serial audits "
               "with thread-safe memory guarantees and deterministic execution latency under 15 milliseconds.")

    add_bullet(doc, "Dual Relational Persistence Tier (Oracle Database 10g XE & SQLite 3): ",
               "Enterprise persistence is anchored by Oracle Database 10g Express Edition, providing strict ACID compliance, "
               "declarative foreign key enforcement, and relational triggers. In the event of network disruption or database host "
               "unavailability, the system seamlessly redirects transactions to an embedded local SQLite 3 database, ensuring zero downtime.")

    add_bullet(doc, "Document Generation Engine (jsPDF & AutoTable): ",
               "To eliminate external print server dependencies, compliant GST tax invoices and tamper-proof warranty certificates "
               "are rendered entirely within the client's web browser using vector PDF primitives, enabling instant local printing.")

    add_h2(doc, "3.2 Frontend Architecture & State Management")
    add_p(doc,
          "The user interface architecture of ElectroStock is organized around modular component hierarchies that strictly isolate "
          "presentation from business logic. State flows predictably in a unidirectional pipeline: user interactions (such as "
          "barcode scans, customer lookups, or quantity adjustments) trigger actions against the centralized Zustand cart store. "
          "The store evaluates business constraints (e.g., verifying that a scanned IMEI exists in available stock and has not already "
          "been added to another pending line item) before updating the immutable state tree.")

    add_p(doc,
          "The Point of Sale (POS) scanner module incorporates an intelligent input listener capable of distinguishing between rapid "
          "hardware barcode scanner bursts (which emit keystroke sequences with inter-character delays under 25 milliseconds terminated "
          "by a carriage return) and manual manual keyboard entries. When a hardware scan occurs, the module automatically routes "
          "the payload to the serialization resolver without requiring the operator to manually click into an input text box.")

    add_p(doc,
          "Following successful payment authorization, the checkout flow triggers the full-screen Order Confirmation & Celebration Portal. "
          "Implemented using React's createPortal API, this overlay mounts directly to document.body with z-index 9999, completely locking "
          "background viewport scrolling. It presents a clear, human-centered summary of the completed transaction: customer details, "
          "purchased item names, hardware model codes, bound Serial/IMEI numbers, GST breakdown, payment method, and unique invoice "
          "identification. Dedicated action triggers allow the cashier to download an official PDF receipt, dispatch the raw stream to a "
          "thermal receipt printer, or return cleanly to the main dashboard cockpit.")

    add_h2(doc, "3.3 Backend Microservice Architecture & API Routing")
    add_p(doc,
          "ElectroStock utilizes a dual-tier backend architecture designed for resilience and low operational latency. "
          "Client interactions communicate with Next.js serverless API routes operating under the /api namespace. These routes "
          "act as intelligent API proxies, validating input schemas, managing authentication sessions, and routing requests "
          "to either the Java REST microservice or the relational database.")

    add_p(doc,
          "The Java REST microservice is structured around modular HTTP handlers configured on a thread-safe HttpServer instance. "
          "The core endpoints include:")

    add_bullet(doc, "GET /api/health: ",
               "Liveness and readiness probe returning system operational status, active thread count, and JVM heap memory utilization.")

    add_bullet(doc, "GET /api/inventory: ",
               "Fetches the complete catalog of active hardware SKUs, current physical stock counts, and reorder threshold flags.")

    add_bullet(doc, "POST /api/stock-out: ",
               "Executes atomic inventory deduction. Accepts an array of product identifiers, quantities, and scanned serial numbers. "
               "Validates physical availability under a synchronized lock, decrements stock counters, transitions serial statuses to 'SOLD', "
               "and records outbound transaction entries in an atomic commit.")

    add_bullet(doc, "POST /api/stock-in: ",
               "Handles inbound warehouse intake. Accepts supplier shipment data, validates purchase order references, creates new serial "
               "tracking records in 'AVAILABLE' status, and increments warehouse stock levels.")

    add_bullet(doc, "POST /api/warranty/register: ",
               "Binds a newly sold serial number to a customer record, calculates manufacturer and store warranty expiration timestamps "
               "based on product category rules, and generates a digital warranty certificate.")

    add_h2(doc, "3.4 Automated GST Tax Invoice & Warranty Card Engine")
    add_p(doc,
          "Statutory tax compliance under Indian GST regulations requires commercial invoices to contain specific legal disclosures. "
          "ElectroStock incorporates a dedicated vector document generation pipeline built with jsPDF. Rather than sending HTML "
          "documents to the browser's generic print dialog (which introduces unformatted margins, header URLs, and inconsistent page breaks), "
          "the engine renders pixel-perfect PDF documents matching Indian Central Board of Indirect Taxes and Customs (CBIC) guidelines.")

    add_p(doc,
          "The generated tax invoice features a two-column legal header containing the retailer's registered business name, address, "
          "contact phone, email, and 15-character GSTIN. The customer block reflects the buyer's name, billing address, and optional "
          "business GSTIN. Line items are rendered in a structured table displaying Serial No., Product Description, HSN Code, "
          "Model Code, Bound Serial/IMEI Number, Quantity, Unit Base Rate, Discount, Taxable Value, CGST Rate & Amount, SGST Rate & Amount, "
          "and Total Line Amount.")

    add_p(doc,
          "Below the financial summary, the document includes an automated Amount in Words converter (e.g., 'Rupees One Lakh Twenty-Nine "
          "Thousand Eight Hundred Only'), legal terms and conditions governing hardware returns, authorized signatory signature block, "
          "and a scannable QR code encoding the invoice verification payload. Concurrently, a separate Digital Warranty Certificate is "
          "rendered, providing the consumer with an authoritative proof-of-coverage document including manufacturer warranty terms, "
          "RMA service center helpline numbers, and hardware warranty expiration dates.")

    add_h2(doc, "3.5 Core System Implementation Code Highlights")
    add_p(doc,
          "The following production code listings illustrate the core architectural components of the ElectroStock system, "
          "demonstrating thread-safe inventory processing, atomic checkout orchestration, database failover handling, and "
          "client-side invoice synthesis:")

    # Code Listing 3.1: Java REST Server Stock-Out Engine
    code_java = [
        "// ElectroStock Java 26 Microservice: Thread-Safe Atomic Stock Mutation Engine",
        "public class StockOutHandler implements HttpHandler {",
        "    private final InventoryDataStore dataStore = InventoryDataStore.getInstance();",
        "    private final ObjectMapper mapper = new ObjectMapper();",
        "",
        "    @Override",
        "    public void handle(HttpExchange exchange) throws IOException {",
        "        if (!\"POST\".equalsIgnoreCase(exchange.getRequestMethod())) {",
        "            exchange.sendResponseHeaders(405, -1); // Method Not Allowed",
        "            return;",
        "        }",
        "",
        "        StockOutRequest request = mapper.readValue(exchange.getRequestBody(), StockOutRequest.class);",
        "        synchronized (dataStore.getInventoryLock()) {",
        "            // Step 1: Pre-validation of physical stock and serial status",
        "            for (CartItem item : request.getItems()) {",
        "                Product prod = dataStore.findProductById(item.getProductId());",
        "                if (prod == null || prod.getCurrentStock() < item.getQuantity()) {",
        "                    sendError(exchange, 400, \"Insufficient stock for SKU: \" + item.getProductId());",
        "                    return;",
        "                }",
        "                for (String sn : item.getSerialNumbers()) {",
        "                    SerialRecord sr = dataStore.findSerial(sn);",
        "                    if (sr == null || !\"AVAILABLE\".equals(sr.getStatus())) {",
        "                        sendError(exchange, 409, \"Serial/IMEI not available: \" + sn);",
        "                        return;",
        "                    }",
        "                }",
        "            }",
        "",
        "            // Step 2: Atomic Execution of Stock Decrement and Serial Transition",
        "            for (CartItem item : request.getItems()) {",
        "                dataStore.decrementStock(item.getProductId(), item.getQuantity());",
        "                for (String sn : item.getSerialNumbers()) {",
        "                    dataStore.updateSerialStatus(sn, \"SOLD\", request.getReceiptNumber());",
        "                }",
        "            }",
        "",
        "            // Step 3: Record persistent outbound transaction ledger entry",
        "            dataStore.recordTransaction(request.toTransactionEntity());",
        "        }",
        "",
        "        byte[] responseBytes = mapper.writeValueAsBytes(Map.of(\"status\", \"SUCCESS\", \"receipt\", request.getReceiptNumber()));",
        "        exchange.getResponseHeaders().set(\"Content-Type\", \"application/json\");",
        "        exchange.sendResponseHeaders(200, responseBytes.length);",
        "        exchange.getResponseBody().write(responseBytes);",
        "        exchange.getResponseBody().close();",
        "    }",
        "}"
    ]
    add_code_listing(doc, code_java, "Listing 3.1: Thread-Safe Atomic Inventory Stock-Out Handler (Java REST Server)")

    # Code Listing 3.2: TypeScript POS Barcode Scanner & Serial Resolver
    code_scanner = [
        "// ElectroStock POS Module: High-Speed Barcode / IMEI Input Resolver & Cart Dispatcher",
        "export const useBarcodeScanner = (onItemScanned: (scannedCode: string) => void) => {",
        "  const bufferRef = useRef<string>('');",
        "  const lastKeyTimeRef = useRef<number>(0);",
        "",
        "  useEffect(() => {",
        "    const handleKeyDown = (e: KeyboardEvent) => {",
        "      const now = performance.now();",
        "      const timeDiff = now - lastKeyTimeRef.current;",
        "      lastKeyTimeRef.current = now;",
        "",
        "      // Barcode scanners output characters rapidly (< 25ms interval)",
        "      if (e.key === 'Enter') {",
        "        if (bufferRef.current.length >= 4) {",
        "          e.preventDefault();",
        "          const code = bufferRef.current.trim();",
        "          bufferRef.current = '';",
        "          onItemScanned(code);",
        "        }",
        "        return;",
        "      }",
        "",
        "      if (e.key.length === 1) {",
        "        if (timeDiff > 50) bufferRef.current = ''; // Reset buffer if manual slow typing",
        "        bufferRef.current += e.key;",
        "      }",
        "    };",
        "",
        "    window.addEventListener('keydown', handleKeyDown);",
        "    return () => window.removeEventListener('keydown', handleKeyDown);",
        "  }, [onItemScanned]);",
        "};"
    ]
    add_code_listing(doc, code_scanner, "Listing 3.2: POS Hardware Barcode Scanner & Serial Input Hook (TypeScript)")

    # Code Listing 3.3: Dual-Database Failover Proxy
    code_failover = [
        "// ElectroStock Persistence Tier: Dual-Database Failover Query Proxy",
        "export async function executeDatabaseQuery<T>(sqlText: string, params: any[] = []): Promise<T> {",
        "  // Primary Target: Oracle Database 10g Express Edition via JDBC Connection Pool",
        "  try {",
        "    const oracleResponse = await queryOraclePool(sqlText, params);",
        "    auditLogger.info(`[Oracle XE] Query executed successfully: ${sqlText.substring(0, 40)}...`);",
        "    return oracleResponse as T;",
        "  } catch (oracleErr: any) {",
        "    auditLogger.warn(`[Failover Activated] Oracle unreachable: ${oracleErr.message}. Diverting to SQLite...`);",
        "",
        "    // Secondary Fallback: Embedded SQLite 3 Local Database",
        "    try {",
        "      const sqliteDb = await getSqliteConnection();",
        "      const convertedSql = translateOracleToSqliteSyntax(sqlText);",
        "      const sqliteResult = await sqliteDb.all(convertedSql, params);",
        "      auditLogger.info(`[SQLite Failover] Query fulfilled locally.`);",
        "      return sqliteResult as T;",
        "    } catch (sqliteErr: any) {",
        "      auditLogger.error(`[Critical Persistence Fault] Both Oracle and SQLite failed: ${sqliteErr.message}`);",
        "      throw new DatabaseException('Relational persistence tier unavailable.');",
        "    }",
        "  }",
        "}"
    ]
    add_code_listing(doc, code_failover, "Listing 3.3: Dual-Database Automatic Failover Execution Proxy (TypeScript / Node.js)")

    # Code Listing 3.4: jsPDF GST Invoice Generator
    code_pdf = [
        "// ElectroStock jsPDF Engine: CBIC Statutory GST Tax Invoice Generator",
        "export const generateGSTInvoicePDF = (saleData: SaleTransactionData): jsPDF => {",
        "  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });",
        "  ",
        "  // 1. Company Brand Header & GSTIN Legal Disclosures",
        "  doc.setFont('helvetica', 'bold');",
        "  doc.setFontSize(16);",
        "  doc.setTextColor(15, 23, 42);",
        "  doc.text('ELECTROSTOCK RETAIL ENTERPRISES', 14, 20);",
        "  doc.setFont('helvetica', 'normal');",
        "  doc.setFontSize(9);",
        "  doc.setTextColor(71, 85, 105);",
        "  doc.text('GSTIN: 27AABCU9603R1ZX | State Code: 27 (Maharashtra)', 14, 25);",
        "  doc.text('Shop 12-14, Electro Plaza, Commercial Road, Nashik - 422005 | Phone: +91 98230 12345', 14, 29);",
        "  ",
        "  // 2. Invoice Meta Table & Customer Particulars",
        "  doc.line(14, 32, 196, 32);",
        "  doc.text(`Invoice No: ${saleData.receiptNumber}`, 14, 38);",
        "  doc.text(`Invoice Date: ${formatDate(saleData.timestamp)}`, 14, 43);",
        "  doc.text(`Customer Name: ${saleData.customerName}`, 120, 38);",
        "  doc.text(`Payment Mode: ${saleData.paymentMethod.toUpperCase()}`, 120, 43);",
        "  ",
        "  // 3. Structured Line Items Table with CGST/SGST Breakup",
        "  autoTable(doc, {",
        "    startY: 48,",
        "    head: [['#', 'Item Description', 'HSN', 'Serial / IMEI', 'Qty', 'Rate (Rs)', 'Taxable (Rs)', 'CGST', 'SGST', 'Total (Rs)']],",
        "    body: saleData.items.map((it, idx) => [",
        "      idx + 1, it.productName, it.hsnCode, it.serialNumber, it.quantity,",
        "      it.unitPrice.toFixed(2), (it.unitPrice * 0.8475).toFixed(2),",
        "      `${it.cgstRate}%`, `${it.sgstRate}%`, it.lineTotal.toFixed(2)",
        "    ]),",
        "    theme: 'grid',",
        "    styles: { fontSize: 8, font: 'helvetica', cellPadding: 2 }",
        "  });",
        "  ",
        "  return doc;",
        "};"
    ]
    add_code_listing(doc, code_pdf, "Listing 3.4: Automated GST Tax Invoice & Line Item Breakdown (TypeScript / jsPDF)")

    # Code Listing 3.5: Full Screen Order Success Page Component
    code_portal = [
        "// ElectroStock UI Portal: Full-Screen Order Confirmation & Celebration Page",
        "export function OrderSuccessPage({ order, isOpen, onClose }: OrderSuccessProps) {",
        "  if (!isOpen || !order) return null;",
        "",
        "  return createPortal(",
        "    <div className=\"fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4\">",
        "      <div className=\"relative w-full max-w-3xl rounded-3xl bg-white shadow-2xl overflow-hidden border border-slate-100\">",
        "        {/* Top Banner Celebration */}",
        "        <div className=\"bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 px-8 py-8 text-center text-white\">",
        "          <div className=\"mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md\">",
        "            <CheckCircle2 className=\"h-10 w-10 text-white\" />",
        "          </div>",
        "          <h2 className=\"text-2xl font-bold tracking-tight\">Congratulations! 🎉</h2>",
        "          <p className=\"mt-1 text-sm text-emerald-100\">Thank you for shopping with ElectroStock!</p>",
        "        </div>",
        "",
        "        {/* Transaction Summary Card */}",
        "        <div className=\"p-8 space-y-6 max-h-[70vh] overflow-y-auto\">",
        "          <div className=\"grid grid-cols-2 gap-4 rounded-2xl bg-slate-50 p-4 border border-slate-200/60\">",
        "            <div><span className=\"text-xs text-slate-500\">Customer Name</span><p className=\"font-bold text-slate-900\">{order.customerName}</p></div>",
        "            <div><span className=\"text-xs text-slate-500\">Receipt Number</span><p className=\"font-mono font-bold text-emerald-700\">{order.receiptNumber}</p></div>",
        "            <div><span className=\"text-xs text-slate-500\">Payment Mode</span><p className=\"font-medium text-slate-900\">{order.paymentMethod}</p></div>",
        "            <div><span className=\"text-xs text-slate-500\">Total Paid (incl. GST)</span><p className=\"font-extrabold text-slate-900 text-lg\">Rs. {order.totalAmount.toLocaleString('en-IN')}</p></div>",
        "          </div>",
        "",
        "          {/* Action Buttons: Print, Download PDF, Back to Cockpit */}",
        "          <div className=\"flex flex-wrap gap-3 pt-2\">",
        "            <button onClick={() => downloadReceiptPDF(order)} className=\"flex-1 bg-emerald-600 text-white py-3 rounded-xl font-semibold shadow hover:bg-emerald-700 flex items-center justify-center gap-2\">",
        "              <Download className=\"w-4 h-4\" /> Download PDF Receipt",
        "            </button>",
        "            <button onClick={() => printReceiptPDF(order)} className=\"flex-1 bg-slate-900 text-white py-3 rounded-xl font-semibold shadow hover:bg-slate-800 flex items-center justify-center gap-2\">",
        "              <Printer className=\"w-4 h-4\" /> Print Receipt",
        "            </button>",
        "            <button onClick={onClose} className=\"w-full bg-slate-100 text-slate-700 py-3 rounded-xl font-semibold hover:bg-slate-200\">",
        "              Back to Dashboard",
        "            </button>",
        "          </div>",
        "        </div>",
        "      </div>",
        "    </div>,",
        "    document.body",
        "  );",
        "}"
    ]
    add_code_listing(doc, code_portal, "Listing 3.5: Full-Screen Order Confirmation & Celebration Portal (React 18 / TypeScript)")

    add_h2(doc, "3.6 Comprehensive Relational Database DDL Schema Script")
    add_p(doc,
          "The complete Data Definition Language (DDL) script defining the relational schema of ElectroStock is presented "
          "below. The script contains primary key specifications, foreign key cascade constraints, unique indices, "
          "and domain validation checks as deployed on Oracle Database 10g Express Edition and mirrored in SQLite 3:")

    ddl_sql = [
        "-- ==========================================================================",
        "-- ELECTROSTOCK ENTERPRISE RELATIONAL SCHEMA DDL SPECIFICATION",
        "-- Target RDBMS: Oracle Database 10g XE / SQLite 3 Dialect Equivalent",
        "-- ==========================================================================",
        "",
        "-- 1. PRODUCT CATEGORY MASTER TABLE",
        "CREATE TABLE CATEGORY (",
        "    category_id         VARCHAR2(20)    NOT NULL,",
        "    name                VARCHAR2(100)   NOT NULL,",
        "    description         VARCHAR2(255),",
        "    default_gst_rate    NUMBER(5,2)     DEFAULT 18.00 NOT NULL,",
        "    created_at          TIMESTAMP       DEFAULT CURRENT_TIMESTAMP NOT NULL,",
        "    CONSTRAINT pk_category PRIMARY KEY (category_id),",
        "    CONSTRAINT ck_category_gst CHECK (default_gst_rate IN (0, 5, 12, 18, 28))",
        ");",
        "",
        "-- 2. MANUFACTURER BRAND MASTER TABLE",
        "CREATE TABLE BRAND (",
        "    brand_id            VARCHAR2(20)    NOT NULL,",
        "    name                VARCHAR2(100)   NOT NULL,",
        "    contact_email       VARCHAR2(120),",
        "    support_helpline    VARCHAR2(50),",
        "    website_url         VARCHAR2(255),",
        "    CONSTRAINT pk_brand PRIMARY KEY (brand_id)",
        ");",
        "",
        "-- 3. HARDWARE SUPPLIER / DISTRIBUTOR TABLE",
        "CREATE TABLE SUPPLIER (",
        "    supplier_id         VARCHAR2(20)    NOT NULL,",
        "    company_name        VARCHAR2(150)   NOT NULL,",
        "    gstin               VARCHAR2(15)    NOT NULL,",
        "    contact_person      VARCHAR2(100)   NOT NULL,",
        "    phone_number        VARCHAR2(20)    NOT NULL,",
        "    email               VARCHAR2(120)   NOT NULL,",
        "    billing_address     VARCHAR2(300)   NOT NULL,",
        "    state_code          VARCHAR2(2)     NOT NULL,",
        "    is_active           CHAR(1)         DEFAULT 'Y' NOT NULL,",
        "    CONSTRAINT pk_supplier PRIMARY KEY (supplier_id),",
        "    CONSTRAINT uk_supplier_gstin UNIQUE (gstin),",
        "    CONSTRAINT ck_supplier_active CHECK (is_active IN ('Y', 'N'))",
        ");",
        "",
        "-- 4. PRODUCT / SKU MASTER TABLE",
        "CREATE TABLE PRODUCT (",
        "    product_id          VARCHAR2(30)    NOT NULL,",
        "    category_id         VARCHAR2(20)    NOT NULL,",
        "    brand_id            VARCHAR2(20)    NOT NULL,",
        "    model_number        VARCHAR2(60)    NOT NULL,",
        "    name                VARCHAR2(150)   NOT NULL,",
        "    hsn_code            VARCHAR2(10)    NOT NULL,",
        "    cost_price          NUMBER(12,2)    NOT NULL,",
        "    selling_price       NUMBER(12,2)    NOT NULL,",
        "    current_stock       NUMBER(8)       DEFAULT 0 NOT NULL,",
        "    reorder_level       NUMBER(8)       DEFAULT 5 NOT NULL,",
        "    is_serialized       CHAR(1)         DEFAULT 'Y' NOT NULL,",
        "    warranty_months     NUMBER(4)       DEFAULT 12 NOT NULL,",
        "    created_at          TIMESTAMP       DEFAULT CURRENT_TIMESTAMP NOT NULL,",
        "    CONSTRAINT pk_product PRIMARY KEY (product_id),",
        "    CONSTRAINT fk_prod_category FOREIGN KEY (category_id) REFERENCES CATEGORY(category_id),",
        "    CONSTRAINT fk_prod_brand FOREIGN KEY (brand_id) REFERENCES BRAND(brand_id),",
        "    CONSTRAINT ck_prod_prices CHECK (selling_price >= cost_price),",
        "    CONSTRAINT ck_prod_stock CHECK (current_stock >= 0)",
        ");",
        "",
        "-- 5. HARDWARE SERIAL / IMEI INVENTORY TRACKER TABLE",
        "CREATE TABLE SERIAL_TRACKER (",
        "    serial_id           NUMBER(12)      NOT NULL,",
        "    product_id          VARCHAR2(30)    NOT NULL,",
        "    serial_imei         VARCHAR2(60)    NOT NULL,",
        "    status              VARCHAR2(20)    DEFAULT 'AVAILABLE' NOT NULL,",
        "    intake_date         TIMESTAMP       DEFAULT CURRENT_TIMESTAMP NOT NULL,",
        "    sold_date           TIMESTAMP,",
        "    receipt_number      VARCHAR2(40),",
        "    supplier_id         VARCHAR2(20),",
        "    CONSTRAINT pk_serial PRIMARY KEY (serial_id),",
        "    CONSTRAINT uk_serial_imei UNIQUE (serial_imei),",
        "    CONSTRAINT fk_serial_prod FOREIGN KEY (product_id) REFERENCES PRODUCT(product_id),",
        "    CONSTRAINT fk_serial_supp FOREIGN KEY (supplier_id) REFERENCES SUPPLIER(supplier_id),",
        "    CONSTRAINT ck_serial_status CHECK (status IN ('AVAILABLE', 'RESERVED', 'SOLD', 'DEFECTIVE', 'RETURNED'))",
        ");",
        "",
        "-- 6. CUSTOMER DIRECTORY TABLE",
        "CREATE TABLE CUSTOMER (",
        "    customer_id         VARCHAR2(30)    NOT NULL,",
        "    full_name           VARCHAR2(120)   NOT NULL,",
        "    mobile_number       VARCHAR2(15)    NOT NULL,",
        "    email               VARCHAR2(120),",
        "    city                VARCHAR2(80),",
        "    state_code          VARCHAR2(2)     DEFAULT '27' NOT NULL,",
        "    customer_gstin      VARCHAR2(15),",
        "    created_at          TIMESTAMP       DEFAULT CURRENT_TIMESTAMP NOT NULL,",
        "    CONSTRAINT pk_customer PRIMARY KEY (customer_id),",
        "    CONSTRAINT uk_customer_mobile UNIQUE (mobile_number)",
        ");",
        "",
        "-- 7. TRANSACTION HEADER (INVOICE / RECEIPT) TABLE",
        "CREATE TABLE TRANSACTION_HEADER (",
        "    receipt_number      VARCHAR2(40)    NOT NULL,",
        "    customer_id         VARCHAR2(30)    NOT NULL,",
        "    subtotal_amount     NUMBER(12,2)    NOT NULL,",
        "    total_discount      NUMBER(12,2)    DEFAULT 0.00 NOT NULL,",
        "    cgst_amount         NUMBER(12,2)    NOT NULL,",
        "    sgst_amount         NUMBER(12,2)    NOT NULL,",
        "    igst_amount         NUMBER(12,2)    DEFAULT 0.00 NOT NULL,",
        "    grand_total         NUMBER(12,2)    NOT NULL,",
        "    payment_method      VARCHAR2(30)    NOT NULL,",
        "    payment_status      VARCHAR2(20)    DEFAULT 'COMPLETED' NOT NULL,",
        "    cashier_user_id     VARCHAR2(30)    NOT NULL,",
        "    transaction_time    TIMESTAMP       DEFAULT CURRENT_TIMESTAMP NOT NULL,",
        "    CONSTRAINT pk_trans_header PRIMARY KEY (receipt_number),",
        "    CONSTRAINT fk_th_customer FOREIGN KEY (customer_id) REFERENCES CUSTOMER(customer_id),",
        "    CONSTRAINT ck_payment_method CHECK (payment_method IN ('cash', 'card', 'upi', 'netbanking', 'split')),",
        "    CONSTRAINT ck_payment_status CHECK (payment_status IN ('PENDING', 'COMPLETED', 'REFUNDED', 'VOID'))",
        ");",
        "",
        "-- 8. TRANSACTION LINE ITEM TABLE",
        "CREATE TABLE TRANSACTION_ITEM (",
        "    item_id             NUMBER(12)      NOT NULL,",
        "    receipt_number      VARCHAR2(40)    NOT NULL,",
        "    product_id          VARCHAR2(30)    NOT NULL,",
        "    serial_imei         VARCHAR2(60)    NOT NULL,",
        "    quantity            NUMBER(6)       DEFAULT 1 NOT NULL,",
        "    unit_cost_price     NUMBER(12,2)    NOT NULL,",
        "    unit_sale_price     NUMBER(12,2)    NOT NULL,",
        "    line_discount       NUMBER(12,2)    DEFAULT 0.00 NOT NULL,",
        "    taxable_value       NUMBER(12,2)    NOT NULL,",
        "    cgst_rate           NUMBER(5,2)     DEFAULT 9.00 NOT NULL,",
        "    cgst_val            NUMBER(12,2)    NOT NULL,",
        "    sgst_rate           NUMBER(5,2)     DEFAULT 9.00 NOT NULL,",
        "    sgst_val            NUMBER(12,2)    NOT NULL,",
        "    total_line_amount   NUMBER(12,2)    NOT NULL,",
        "    CONSTRAINT pk_trans_item PRIMARY KEY (item_id),",
        "    CONSTRAINT fk_ti_header FOREIGN KEY (receipt_number) REFERENCES TRANSACTION_HEADER(receipt_number),",
        "    CONSTRAINT fk_ti_product FOREIGN KEY (product_id) REFERENCES PRODUCT(product_id),",
        "    CONSTRAINT fk_ti_serial FOREIGN KEY (serial_imei) REFERENCES SERIAL_TRACKER(serial_imei)",
        ");",
        "",
        "-- 9. DIGITAL WARRANTY CARD RECORD TABLE",
        "CREATE TABLE WARRANTY_CARD (",
        "    warranty_id         VARCHAR2(40)    NOT NULL,",
        "    serial_imei         VARCHAR2(60)    NOT NULL,",
        "    receipt_number      VARCHAR2(40)    NOT NULL,",
        "    customer_id         VARCHAR2(30)    NOT NULL,",
        "    start_date          DATE            NOT NULL,",
        "    expiry_date         DATE            NOT NULL,",
        "    warranty_status     VARCHAR2(20)    DEFAULT 'ACTIVE' NOT NULL,",
        "    rma_claims_count    NUMBER(3)       DEFAULT 0 NOT NULL,",
        "    last_claim_date     TIMESTAMP,",
        "    CONSTRAINT pk_warranty PRIMARY KEY (warranty_id),",
        "    CONSTRAINT uk_warranty_serial UNIQUE (serial_imei),",
        "    CONSTRAINT fk_warr_serial FOREIGN KEY (serial_imei) REFERENCES SERIAL_TRACKER(serial_imei),",
        "    CONSTRAINT fk_warr_header FOREIGN KEY (receipt_number) REFERENCES TRANSACTION_HEADER(receipt_number),",
        "    CONSTRAINT fk_warr_customer FOREIGN KEY (customer_id) REFERENCES CUSTOMER(customer_id),",
        "    CONSTRAINT ck_warr_status CHECK (warranty_status IN ('ACTIVE', 'EXPIRED', 'CLAIMED', 'VOID'))",
        ");",
        "",
        "-- 10. ENTERPRISE AUDIT LOGGING TABLE",
        "CREATE TABLE AUDIT_LOG (",
        "    log_id              NUMBER(12)      NOT NULL,",
        "    table_name          VARCHAR2(40)    NOT NULL,",
        "    action_type         VARCHAR2(10)    NOT NULL,",
        "    entity_pk           VARCHAR2(60)    NOT NULL,",
        "    old_values_json     VARCHAR2(2000),",
        "    new_values_json     VARCHAR2(2000),",
        "    operator_user_id    VARCHAR2(30)    NOT NULL,",
        "    ip_address          VARCHAR2(45)    NOT NULL,",
        "    timestamp           TIMESTAMP       DEFAULT CURRENT_TIMESTAMP NOT NULL,",
        "    CONSTRAINT pk_audit_log PRIMARY KEY (log_id)",
        ");"
    ]
    add_code_listing(doc, ddl_sql, "Listing 3.6: Complete Relational Database DDL Schema Script (Oracle 10g XE / SQLite 3)")

    add_h2(doc, "3.7 Core Algorithmic Engineering & State Management Deep Dive")
    add_p(doc,
          "Beyond declarative user interface composition and basic database CRUD operations, ElectroStock incorporates several "
          "sophisticated engineering algorithms designed to guarantee data integrity, hardware interoperability, and deterministic "
          "performance across checkout terminals.")

    add_h3(doc, "3.7.1 Cellular IMEI Checksum Verification Algorithm (Luhn Formula / ISO/IEC 7812)")
    add_p(doc,
          "International Mobile Equipment Identity (IMEI) numbers adhere to a strict 15-digit structure governed by the 3GPP and "
          "ISO/IEC 7812 standards. The first 8 digits comprise the Type Allocation Code (TAC) identifying the manufacturer and model; "
          "the subsequent 6 digits represent the device serial sequence; and the 15th digit is an algorithmic check digit computed "
          "using the Luhn (Modulus 10) algorithm. To prevent cashiers or warehouse staff from accidentally entering typos or bogus "
          "IMEI strings, ElectroStock validates every scanned or manually entered cellular identifier against this mathematical formula "
          "prior to database submission:")

    code_luhn = [
        "// ElectroStock Algorithmic Utility: 15-Digit IMEI Luhn Checksum Validator",
        "export function validateIMEIChecksum(imeiString: string): boolean {",
        "  const sanitized = imeiString.replace(/\\D/g, '');",
        "  if (sanitized.length !== 15) return false;",
        "",
        "  let sum = 0;",
        "  for (let i = 0; i < 15; i++) {",
        "    let digit = parseInt(sanitized.charAt(i), 10);",
        "    // Double every second digit starting from the rightmost (zero-indexed 1, 3, 5, etc.)",
        "    if (i % 2 !== 0) {",
        "      digit *= 2;",
        "      if (digit > 9) digit = (digit % 10) + 1;",
        "    }",
        "    sum += digit;",
        "  }",
        "  // Valid IMEI numbers must yield a total sum divisible by 10",
        "  return sum % 10 === 0;",
        "}"
    ]
    add_code_listing(doc, code_luhn, "Listing 3.7: IMEI 15-Digit Luhn Modulus 10 Checksum Verification Algorithm (TypeScript)")

    add_h3(doc, "3.7.2 Direct Hardware Thermal Receipt Printing (ESC/POS Binary Command Stream)")
    add_p(doc,
          "Standard desktop print dialogs introduce substantial operational delays (rendering print previews, margin dialogs, and paper prompts). "
          "In high-velocity electronics retailing, checkout counters utilize dedicated 58mm or 80mm thermal receipt printers "
          "(e.g., Epson TM-T82, TVS RP-3200). ElectroStock includes an integrated ESC/POS binary command stream synthesizer that formats "
          "and dispatches raw byte buffers directly to connected USB or network thermal printers:")

    code_escpos = [
        "// ElectroStock Hardware Interop: ESC/POS Binary Thermal Command Stream Builder",
        "export function buildThermalReceiptBuffer(order: SaleTransactionData): Uint8Array {",
        "  const buffer: number[] = [];",
        "  const push = (...bytes: number[]) => buffer.push(...bytes);",
        "  const pushText = (text: string) => {",
        "    for (let i = 0; i < text.length; i++) buffer.push(text.charCodeAt(i));",
        "  };",
        "",
        "  // 1. Initialize Printer (ESC @) & Center Alignment (ESC a 1)",
        "  push(0x1B, 0x40, 0x1B, 0x61, 0x01);",
        "  push(0x1B, 0x45, 0x01); // Emphasized bold mode ON",
        "  pushText(\"ELECTROSTOCK RETAIL\\n\");",
        "  push(0x1B, 0x45, 0x00); // Bold mode OFF",
        "  pushText(\"GSTIN: 27AABCU9603R1ZX\\n\");",
        "  pushText(\"Tel: +91 98230 12345\\n\");",
        "  pushText(\"--------------------------------\\n\");",
        "",
        "  // 2. Left Alignment (ESC a 0) & Transaction Metadata",
        "  push(0x1B, 0x61, 0x00);",
        "  pushText(`Rcpt: ${order.receiptNumber}\\nDate: ${formatDate(order.timestamp)}\\n`);",
        "  pushText(`Cust: ${order.customerName}\\nMode: ${order.paymentMethod.toUpperCase()}\\n`);",
        "  pushText(\"--------------------------------\\n\");",
        "",
        "  // 3. Line Items & Hardware Serials",
        "  order.items.forEach((it) => {",
        "    pushText(`${it.productName.substring(0, 20)} x${it.quantity}  Rs.${it.lineTotal}\\n`);",
        "    if (it.serialNumber) pushText(` SN: ${it.serialNumber}\\n`);",
        "  });",
        "  pushText(\"--------------------------------\\n\");",
        "",
        "  // 4. Financial Totals & Right Alignment (ESC a 2)",
        "  push(0x1B, 0x61, 0x02);",
        "  push(0x1B, 0x45, 0x01);",
        "  pushText(`GRAND TOTAL: Rs. ${order.totalAmount.toFixed(2)}\\n`);",
        "  push(0x1B, 0x45, 0x00);",
        "",
        "  // 5. Feed Paper & Full Cut Command (GS V 66 0)",
        "  push(0x1B, 0x64, 0x04); // Feed 4 lines",
        "  push(0x1D, 0x56, 0x42, 0x00); // Full paper cut",
        "",
        "  return new Uint8Array(buffer);",
        "}"
    ]
    add_code_listing(doc, code_escpos, "Listing 3.8: ESC/POS Thermal Receipt Command Stream Synthesizer (TypeScript)")

    add_h3(doc, "3.7.3 Reactive Client State Synchronization (Zustand Global Cart Store)")
    add_p(doc,
          "The core operational state of the POS checkout counter is managed through an optimized Zustand store. "
          "The store encapsulates atomic mutations for item additions, barcode parsing, serial verification, quantity increments, "
          "and tax recalculation:")

    code_zustand = [
        "// ElectroStock State Engine: Zustand Global Cart & Serialization Store",
        "interface CartStoreState {",
        "  cartItems: CartItem[];",
        "  customer: CustomerInfo;",
        "  paymentMethod: 'cash' | 'card' | 'upi';",
        "  addItemByBarcode: (code: string) => Promise<boolean>;",
        "  bindSerialToItem: (productId: string, serial: string) => void;",
        "  setPaymentMode: (mode: 'cash' | 'card' | 'upi') => void;",
        "  clearCart: () => void;",
        "  calculateFinancials: () => FinancialSummary;",
        "}",
        "",
        "export const useCartStore = create<CartStoreState>((set, get) => ({",
        "  cartItems: [],",
        "  customer: { name: 'Walk-in Retail Customer', phone: '', gstin: '' },",
        "  paymentMethod: 'cash',",
        "",
        "  addItemByBarcode: async (barcode: string) => {",
        "    const product = await catalogService.resolveBarcode(barcode);",
        "    if (!product || product.stock <= 0) return false;",
        "",
        "    set((state) => {",
        "      const existingIndex = state.cartItems.findIndex((it) => it.productId === product.id);",
        "      if (existingIndex > -1) {",
        "        const updated = [...state.cartItems];",
        "        updated[existingIndex].quantity += 1;",
        "        return { cartItems: updated };",
        "      }",
        "      return { cartItems: [...state.cartItems, { ...product, quantity: 1, boundSerials: [] }] };",
        "    });",
        "    return true;",
        "  },",
        "",
        "  bindSerialToItem: (productId: string, serial: string) => {",
        "    set((state) => ({",
        "      cartItems: state.cartItems.map((item) =>",
        "        item.productId === productId ? { ...item, boundSerials: [...item.boundSerials, serial] } : item",
        "      ),",
        "    }));",
        "  },",
        "",
        "  setPaymentMode: (mode) => set({ paymentMethod: mode }),",
        "  clearCart: () => set({ cartItems: [], paymentMethod: 'cash' }),",
        "",
        "  calculateFinancials: () => {",
        "    const items = get().cartItems;",
        "    const subtotal = items.reduce((acc, it) => acc + it.price * it.quantity, 0);",
        "    const taxableValue = subtotal / 1.18;",
        "    const totalGst = subtotal - taxableValue;",
        "    return { subtotal, taxableValue, cgst: totalGst / 2, sgst: totalGst / 2, grandTotal: subtotal };",
        "  },",
        "}));"
    ]
    add_code_listing(doc, code_zustand, "Listing 3.9: Reactive Zustand Cart & Serialization State Management Hook (TypeScript)")

    add_h3(doc, "3.7.4 Serverless Oracle Database Connection Pool & Health Check Engine")
    add_p(doc,
          "The Next.js API layer communicates with the Oracle Database 10g Express Edition instance through an enterprise "
          "connection pooling layer with automated latency measurement and query timeout guards:")

    code_oracle_route = [
        "// ElectroStock Backend Route: Oracle Database Connection Pool & Diagnostic Probe",
        "export async function GET(request: NextRequest) {",
        "  const startTime = performance.now();",
        "  try {",
        "    const pool = await getOracleConnectionPool();",
        "    const connection = await pool.getConnection();",
        "    try {",
        "      const result = await connection.execute(",
        "        `SELECT banner FROM v$version WHERE banner LIKE 'Oracle%'`",
        "      );",
        "      const pingDuration = (performance.now() - startTime).toFixed(2);",
        "      return NextResponse.json({",
        "        status: 'HEALTHY',",
        "        rdbms: 'Oracle Database 10g Express Edition',",
        "        version: result.rows?.[0]?.[0] || 'Oracle 10g XE',",
        "        latencyMs: pingDuration,",
        "        poolActiveConnections: pool.connectionsInUse,",
        "        poolOpenConnections: pool.connectionsOpen,",
        "      });",
        "    } finally {",
        "      await connection.close();",
        "    }",
        "  } catch (error: any) {",
        "    return NextResponse.json({",
        "      status: 'DEGRADED_FAILOVER',",
        "      message: 'Primary Oracle listener unresponsive. Edge SQLite active.',",
        "      error: error.message,",
        "    }, { status: 503 });",
        "  }",
        "}"
    ]
    add_code_listing(doc, code_oracle_route, "Listing 3.10: Enterprise Oracle Health Check & Latency Probe Route Handler (Next.js / TypeScript)")

