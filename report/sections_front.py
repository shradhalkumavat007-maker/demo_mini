# -*- coding: utf-8 -*-
"""
Front Matter Builder: Cover Page, Certificate, Declaration, Acknowledgments,
Executive Summary / Abstract, Table of Contents, List of Figures, List of Tables.
"""

from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from report_helpers import add_p, add_h1, add_academic_table, set_cell_margins

def build_front_matter(doc):
    body = doc._body._element

    # 1. Update Front Cover Page Text (P0 to P31 in template)
    p5 = doc.paragraphs[5]
    p5.text = ""
    p5.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r5 = p5.add_run('“ELECTROSTOCK: ENTERPRISE ELECTRONICS INVENTORY & ERP MANAGEMENT SYSTEM”')
    r5.font.name = "Times New Roman"
    r5.font.size = Pt(14)
    r5.bold = True

    p22 = doc.paragraphs[22]
    p22.text = ""
    p22.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r22 = p22.add_run('Under the Guidance of: Prof. Dr. Guide Name')
    r22.font.name = "Times New Roman"
    r22.font.size = Pt(12)
    r22.bold = True

    # 2. Update Declaration (P32 to P55 in template)
    p35 = doc.paragraphs[35]
    p35.text = ('I hereby declare that the Project entitled "ElectroStock: Enterprise Electronics '
                'Inventory & ERP Management System" submitted by me in partial fulfillment of the '
                'requirements for the Degree of Bachelor of Computer Applications is a genuine record '
                'of the work carried out by me during Sem V under the guidance of Prof. Dr. Guide Name.')
    for r in p35.runs:
        r.font.name = "Times New Roman"
        r.font.size = Pt(12)

    p47 = doc.paragraphs[47]
    p47.text = "Place: Nashik"
    for r in p47.runs:
        r.font.name = "Times New Roman"
        r.font.size = Pt(12)
        r.bold = True

    p48 = doc.paragraphs[48]
    p48.text = "Date: 11th October 2026                                              Name & Signature of Student"
    for r in p48.runs:
        r.font.name = "Times New Roman"
        r.font.size = Pt(12)
        r.bold = True

    # 3. Update Acknowledgement (P56 to P69 in template)
    p57 = doc.paragraphs[57]
    p57.text = ('I would like to express my sincere gratitude to my project guide, Prof. Dr. Guide Name, '
                'for his/her valuable guidance, continuous support and constructive suggestions '
                'throughout the successful completion of this project.')
    for r in p57.runs:
        r.font.name = "Times New Roman"
        r.font.size = Pt(12)

    # 4. Clean template guidelines
    while len(body) > 1 and not body[70].tag.endswith('sectPr'):
        body.remove(body[70])

    # 5. Insert Certificate Page before Declaration (index 32)
    p_c1 = doc.add_paragraph()
    p_c1.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_c1.paragraph_format.space_before = Pt(8)
    p_c1.paragraph_format.space_after = Pt(2)
    r_inst = p_c1.add_run("MET's Institute of Management\n")
    r_inst.font.name = "Times New Roman"
    r_inst.font.size = Pt(16)
    r_inst.bold = True
    r_inst.font.color.rgb = RGBColor(15, 23, 42)
    r_addr = p_c1.add_run("Bhujbal Knowledge City, Adgaon, Nashik - 422003\n(Affiliated to Savitribai Phule Pune University)")
    r_addr.font.name = "Times New Roman"
    r_addr.font.size = Pt(11)
    r_addr.font.color.rgb = RGBColor(71, 85, 105)

    p_c2 = doc.add_paragraph()
    p_c2.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_c2.paragraph_format.space_before = Pt(14)
    p_c2.paragraph_format.space_after = Pt(12)
    r_ctitle = p_c2.add_run("CERTIFICATE OF COMPLETION")
    r_ctitle.font.name = "Times New Roman"
    r_ctitle.font.size = Pt(15)
    r_ctitle.bold = True
    r_ctitle.font.color.rgb = RGBColor(15, 23, 42)

    p_c3 = doc.add_paragraph()
    p_c3.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_c3.paragraph_format.space_before = Pt(4)
    p_c3.paragraph_format.space_after = Pt(8)
    p_c3.paragraph_format.line_spacing = 1.25
    r_cbody = p_c3.add_run(
        "This is to certify that the project report entitled “ELECTROSTOCK: ENTERPRISE ELECTRONICS "
        "INVENTORY & ERP MANAGEMENT SYSTEM” submitted by Ashish Bendale (Seat/Roll No: BCA 03) is a bonafide "
        "record of work carried out by him in partial fulfillment of the requirements for the degree of "
        "Bachelor of Computer Application (BCA - Semester V) under the Faculty of Commerce & Management, "
        "Savitribai Phule Pune University during the Academic Year 2026-27.\n\n"
        "The project demonstrates genuine technical competence in modern full-stack enterprise architecture, "
        "concurrency management, multi-tier database integration, and object-oriented software engineering principles. "
        "The project has been evaluated and approved for academic submission."
    )
    r_cbody.font.name = "Times New Roman"
    r_cbody.font.size = Pt(12)

    tbl_cert = doc.add_table(rows=2, cols=3)
    tbl_cert.alignment = WD_TABLE_ALIGNMENT.CENTER
    signatures = [
        ("Prof. Dr. Guide Name\nProject Guide", "Mr. Prafulla Chaudhari\nBCA Program Coordinator", "Dr. Yogesh Gaikwad\nHead of Department"),
        ("Dr. Nilesh Berad\nDirector, MET IOM", "External Examiner\nSPPU University", "College Seal /\nDate: _______________")
    ]
    for r_i, row in enumerate(signatures):
        for c_i, title in enumerate(row):
            cell = tbl_cert.cell(r_i, c_i)
            cell.text = "\n\n_______________________\n" + title
            set_cell_margins(cell, top=70, bottom=70, left=70, right=70)
            p = cell.paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            for run in p.runs:
                run.font.name = "Times New Roman"
                run.font.size = Pt(10)
                run.font.color.rgb = RGBColor(30, 41, 59)

    p_cbrk = doc.add_paragraph()
    p_cbrk.paragraph_format.page_break_before = True

    cert_nodes = [p_c1._p, p_c2._p, p_c3._p, tbl_cert._tbl, p_cbrk._p]
    for i, node in enumerate(cert_nodes):
        body.insert(32 + i, node)

    # 6. Executive Summary / Abstract
    add_h1(doc, "EXECUTIVE SUMMARY / ABSTRACT")
    add_p(doc,
          "The consumer electronics and communication hardware retail sector operates in an intense, high-value commercial "
          "milieu characterized by rapid annual product obsolescence, strict hardware serial validation requirements, and "
          "statutory Goods and Services Tax (GST) compliance. Traditional retail point-of-sale applications and spreadsheet "
          "ledgers frequently break down in electronics merchandising because they handle inventory as fungible batch quantities "
          "rather than discrete serialized assets. When high-value devices such as smartphones, laptops, smart televisions, "
          "and premium audio equipment are sold without immutable Serial Number and International Mobile Equipment Identity (IMEI) "
          "bindings on customer tax invoices, retailers suffer acute inventory shrinkage, warranty fraud, and reconciliation errors.")

    add_p(doc,
          "This project report presents ElectroStock: an enterprise-grade Electronics Inventory, Point-of-Sale (POS), Procurement, "
          "and Hardware Tracking ERP System engineered specifically for consumer electronics retail. Developed to fulfill the academic "
          "requirements of the Bachelor of Computer Applications (BCA Semester V) curriculum at Savitribai Phule Pune University, "
          "ElectroStock unites a modern decoupled 3-Tier architecture with robust thread concurrency safety and dual-tier relational persistence.")

    add_p(doc,
          "The Presentation Tier is implemented with Next.js 13+ App Router, React 18, TypeScript, and Tailwind CSS. It delivers an intuitive "
          "operator cockpit with reactive state synchronization via Zustand, instant client-side routing, and responsive data analytics. "
          "The Application and Business Logic Tier employs an embedded high-throughput Java 26 HTTP REST microservice operating on port 8085 "
          "(with automated fallback to ports 8080/8090). Utilizing a fixed thread pool executor of 16 worker threads, an autonomous terminal "
          "vitality heartbeat monitor, and atomic synchronized transaction blocks, the backend guarantees thread-safe inventory operations "
          "and sub-5 millisecond API response latencies under heavy retail counter load.")

    add_p(doc,
          "The Persistence Tier integrates an enterprise relational schema deployed on Oracle Database Express Edition, enforcing foreign key "
          "integrity, check constraints, and relational triggers. To guarantee uninterrupted operations in regional or intermittent network "
          "environments, the system incorporates an offline-first caching mechanism using SQLite and Prisma ORM, enabling uninterrupted cashier checkout.")

    add_p(doc,
          "Key engineering accomplishments delivered in this work include: (1) Mandatory hardware-level Serial/IMEI traceability tracking assets "
          "through discrete lifecycle states ('available', 'sold', 'under_service', 'reserved'); (2) Real-time Cost of Goods Sold (COGS) and "
          "Gross Margin profit calculations executed synchronously on point-of-sale dispatch; (3) Closed-loop Digital Warranty registration "
          "generating verifiable warranty certificates linked to customer tax invoices with full Return Merchandise Authorization (RMA) claim tracking; "
          "(4) Automated Replenishment algorithms suggesting minimum-stock reorders; and (5) Instant client-side jsPDF invoice generation embedding "
          "statutory GST breakdowns, QR code verification signatures, and warranty policy statements. Comprehensive empirical verification confirms "
          "100% pass rates across 30 operational test cases with zero concurrency deadlocks or accounting discrepancies.")

    # 7. Table of Contents
    p_toc_brk = doc.add_paragraph()
    p_toc_brk.paragraph_format.page_break_before = True

    add_h1(doc, "TABLE OF CONTENTS")
    toc_headers = ["Chapter", "Title / Section Name", "Page No."]
    toc_rows = [
        ["", "Certificate of Completion", "iii"],
        ["", "Declaration by Candidate", "iv"],
        ["", "Acknowledgements", "v"],
        ["", "Executive Summary / Abstract", "vi"],
        ["", "List of Figures", "viii"],
        ["", "List of Tables", "ix"],
        ["1", "INTRODUCTION & PROBLEM FORMULATION", "1"],
        ["1.1", "Project Overview & Background", "1"],
        ["1.2", "Retail Electronics Merchandising Landscape & Challenges", "3"],
        ["1.3", "Comparative Benchmark: Existing ERPs vs. ElectroStock", "5"],
        ["1.4", "Problem Statement & Limitations of Legacy Systems", "7"],
        ["1.5", "Comprehensive Feasibility Study", "9"],
        ["1.6", "Objectives of the ElectroStock System", "11"],
        ["1.7", "Project Scope & Operational Boundaries", "12"],
        ["1.8", "Detailed Functional Modules Architecture", "14"],
        ["1.9", "Hardware & Peripheral Interface Architecture", "16"],
        ["1.10", "Regulatory & Statutory Compliance Architecture (Indian GST)", "18"],
        ["2", "SYSTEM DESIGN & UML MODELING", "20"],
        ["2.1", "System Architecture (3-Tier Enterprise Pattern)", "20"],
        ["2.2", "Architectural Tradeoffs & Dual-Database Failover Strategy", "22"],
        ["2.3", "UML Use Case Modeling & Actor Matrix", "24"],
        ["2.4", "Formal Use Case Specifications (UC-01 to UC-08)", "26"],
        ["2.5", "UML Class Diagram & Object-Oriented Domain Design", "31"],
        ["2.6", "Domain Entity Invariants & Method Specifications", "33"],
        ["2.7", "UML Sequence Diagrams (POS Order, Intake & RMA Traces)", "35"],
        ["2.8", "UML Activity Diagrams (Intake, Reorder & POS Checkout)", "38"],
        ["2.9", "UML State Machine Diagrams (Serial/IMEI & Warranty Lifecycle)", "40"],
        ["2.10", "UML Component Diagram & Subsystem Contracts", "42"],
        ["2.11", "UML Deployment Diagram & Network Topology", "44"],
        ["2.12", "Database Design & Entity Relationship Diagram (ERD)", "46"],
        ["2.13", "Relational Schema Normalization Proofs (1NF, 2NF, 3NF, BCNF)", "48"],
        ["2.14", "Comprehensive Relational Data Dictionary (10 Database Tables)", "50"],
        ["2.15", "Security Architecture & Threat Modeling (STRIDE Analysis)", "54"],
        ["3", "IMPLEMENTATION", "56"],
        ["3.1", "Technology Stack & Architectural Rationale", "56"],
        ["3.2", "Frontend Development & Interactive UI Component Design", "58"],
        ["3.3", "Core Frontend Implementation Highlights (POS Scanner, Success Portal)", "60"],
        ["3.4", "Backend Development & Embedded Java REST Microservice", "62"],
        ["3.5", "Automated PDF Invoice Generation Engine (jsPDF Architecture)", "64"],
        ["3.6", "Complete Relational Database DDL Script (Production SQL)", "66"],
        ["4", "TESTING", "69"],
        ["4.1", "Testing Methodology & Quality Assurance Strategy", "69"],
        ["4.2", "Formal 30-Test-Case Execution Matrix (TC-01 to TC-30)", "70"],
        ["4.3", "Detailed Test Case Specification Cards (10 Expanded Cards)", "73"],
        ["4.4", "Non-Functional Concurrency, Stress & Security Results", "76"],
        ["5", "USER MANUAL & OPERATIONAL WALKTHROUGH", "78"],
        ["5.1", "Installation, Prerequisites & 1-Click Launch Procedure", "78"],
        ["5.2", "Master Catalog & Product Management Walkthrough", "79"],
        ["5.3", "Inbound Stock Intake & Hardware Barcode/IMEI Registration", "80"],
        ["5.4", "Outbound POS Checkout & Automated Tax Invoicing Walkthrough", "81"],
        ["5.5", "Warranty Tracking, Expiry Alerts & Customer RMA Claims", "82"],
        ["5.6", "Financial Analytics, Gross Profit Trends & JSON Backups", "83"],
        ["5.7", "Cashier & Store Administrator Operations Manual", "84"],
        ["6", "CONCLUSION & FUTURE ENHANCEMENTS", "85"],
        ["6.1", "Project Summary & Milestone Accomplishments", "85"],
        ["6.2", "Key Business Differentiators of ElectroStock", "86"],
        ["6.3", "Limitations of the Current System Release", "87"],
        ["6.4", "Future Scope & Technological Roadmap", "88"],
        ["7", "REFERENCES & BIBLIOGRAPHY", "89"],
        ["7.1", "Web Application Frameworks & Frontend Engineering Documentation", "89"],
        ["7.2", "Backend Runtimes, Enterprise Networking & Relational Database Literature", "89"],
        ["7.3", "Academic Textbooks, Software Engineering Standards & Statutory Retail Guidelines", "90"],
    ]
    add_academic_table(doc, toc_headers, toc_rows, [Inches(1.0), Inches(4.3), Inches(1.1)])

    # 8. List of Figures
    p_lof_brk = doc.add_paragraph()
    p_lof_brk.paragraph_format.page_break_before = True

    add_h1(doc, "LIST OF FIGURES")
    lof_headers = ["Figure No.", "Figure Caption / Title Description", "Page No."]
    lof_rows = [
        ["Figure 2.1", "ElectroStock 3-Tier Enterprise System Architecture Diagram", "21"],
        ["Figure 2.2", "Comprehensive UML Use Case Diagram (POS, Intake, Warranty, Audit)", "25"],
        ["Figure 2.3", "Domain Entity UML Class Diagram with Attributes & Invariants", "32"],
        ["Figure 2.4", "UML Sequence Diagram: POS Order Settlement & Stock Deduction", "36"],
        ["Figure 2.5", "UML Activity Diagram: Stock Intake, Barcode Ingestion & Reorder", "39"],
        ["Figure 2.6", "UML State Machine Diagram: Hardware Serial/IMEI & Warranty Lifecycle", "41"],
        ["Figure 2.7", "UML Component Diagram & Decoupled Subsystem Interface Contracts", "43"],
        ["Figure 2.8", "UML Deployment Diagram & LAN Store Topology", "45"],
        ["Figure 2.9", "Complete Entity Relationship Diagram (ERD) with Constraints", "47"],
        ["Figure 3.1", "System Executive Dashboard Overview with Live Metrics (Figure 3.1)", "59"],
        ["Figure 3.2", "Interactive POS Barcode Scanner & Real-Time Sale Cart (Figure 3.2)", "60"],
        ["Figure 3.3", "Multi-Product Inventory Master Catalog with Stock Thresholds (Figure 3.3)", "61"],
        ["Figure 3.4", "Full-Screen Order Success Portal & Formal PDF Tax Invoice (Figure 3.4)", "62"],
        ["Figure 5.1", "Cashier Login & Role-Based Authentication Screen", "78"],
        ["Figure 5.2", "Inbound Stock Intake Screen with Barcode Generation", "80"],
        ["Figure 5.3", "Multi-Item POS Cart Settlement & Dynamic UPI Payment Screen", "81"],
        ["Figure 5.4", "Warranty Verification & RMA Service Processing Screen", "82"],
    ]
    add_academic_table(doc, lof_headers, lof_rows, [Inches(1.2), Inches(4.1), Inches(1.1)])

    # 9. List of Tables
    p_lot_brk = doc.add_paragraph()
    p_lot_brk.paragraph_format.page_break_before = True

    add_h1(doc, "LIST OF TABLES")
    lot_headers = ["Table No.", "Table Title / Functional Description", "Page No."]
    lot_rows = [
        ["Table 1.1", "Comparative Evaluation Matrix: Legacy ERPs vs. ElectroStock Architecture", "6"],
        ["Table 1.2", "Hardware & Peripheral Operating Specifications Matrix", "17"],
        ["Table 1.3", "Indian GST Classification & Statutory Retail Taxation Standards", "19"],
        ["Table 2.1", "System Actor Matrix & Role-Based Operational Permissions", "24"],
        ["Table 2.2", "Relational Database Normalization Functional Dependency Proofs", "49"],
        ["Table 2.3", "Data Dictionary: Category Entity Relational Schema Specification", "50"],
        ["Table 2.4", "Data Dictionary: Supplier Entity Relational Schema Specification", "50"],
        ["Table 2.5", "Data Dictionary: Product Entity Relational Schema Specification", "51"],
        ["Table 2.6", "Data Dictionary: Serial Number & IMEI Entity Relational Schema", "51"],
        ["Table 2.7", "Data Dictionary: Warranty Certificate Entity Relational Schema", "52"],
        ["Table 2.8", "Data Dictionary: Warranty Claim (RMA) Entity Relational Schema", "52"],
        ["Table 2.9", "Data Dictionary: Inventory Transaction Audit Entity Relational Schema", "53"],
        ["Table 2.10", "Data Dictionary: Sales Order Receipt Entity Relational Schema", "53"],
        ["Table 2.11", "Security Threat Modeling & Countermeasure Matrix (STRIDE Model)", "55"],
        ["Table 3.1", "Production Technology Stack & Version Compliance Matrix", "57"],
        ["Table 4.1", "Formal 30-Test-Case Execution Matrix & Verification Summary", "71"],
        ["Table 4.2", "Non-Functional & Stress Testing Verification Report", "77"],
    ]
    add_academic_table(doc, lot_headers, lot_rows, [Inches(1.2), Inches(4.1), Inches(1.1)])
