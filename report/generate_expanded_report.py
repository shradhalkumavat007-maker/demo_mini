# -*- coding: utf-8 -*-
"""
ElectroStock Major Project Report Master Orchestrator:
Generates the complete 70-80 page enterprise academic report with:
- Natural, human engineering prose (domain-specific to retail electronics, zero AI cliches)
- Perfect standard word spacing across all pages (no stretched word gaps, split newlines, left-aligned bullets & lists)
- Perfectly centered dynamic page numbers in the footer across all body pages
- Comprehensive technical depth: Architecture, UML Diagrams, Normalization proofs, 10 Data Dictionary tables,
  Full SQL DDL script, Code Listings, 30-Test-Case Matrix, 10 Test Execution Cards, Non-Functional Benchmarks,
  UI Walkthrough with Screenshots, Business ROI, and 25+ Academic References.
"""

import os
import sys
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import parse_xml
from docx.oxml.ns import nsdecls

from report_helpers import BASE_DIR, TEMPLATE_PATH, OUTPUT_PATH, setup_headers_and_footers
from sections_front import build_front_matter
from sections_ch1 import build_chapter_1
from sections_ch2 import build_chapter_2
from sections_ch3 import build_chapter_3
from sections_ch4 import build_chapter_4
from sections_ch5_6_7 import build_chapters_5_6_7

def generate_report():
    print(f"Loading template: {TEMPLATE_PATH}")
    if not os.path.exists(TEMPLATE_PATH):
        raise FileNotFoundError(f"Template not found at {TEMPLATE_PATH}")

    doc = docx.Document(TEMPLATE_PATH)

    print("Configuring headers, footers, and margins...")
    setup_headers_and_footers(doc)

    print("Building Front Matter (Cover, Certificate, Declaration, TOC, Lists)...")
    build_front_matter(doc)

    print("Building Chapter 1: Introduction & Problem Formulation...")
    build_chapter_1(doc)

    print("Building Chapter 2: System Design & UML Modeling...")
    build_chapter_2(doc)

    print("Building Chapter 3: System Implementation & Technical Architecture...")
    build_chapter_3(doc)

    print("Building Chapter 4: Software Testing & Quality Assurance...")
    build_chapter_4(doc)

    print("Building Chapters 5, 6, 7: Walkthrough, Conclusion, ROI & Bibliography...")
    build_chapters_5_6_7(doc)

    # Ensure final footer setup on all sections
    setup_headers_and_footers(doc)

    print(f"Saving generated document to: {OUTPUT_PATH}")
    doc.save(OUTPUT_PATH)
    print("Document saved successfully!")

    # Verify exact page count using Word COM
    try:
        import win32com.client
        print("Launching Word COM for exact page count verification...")
        word = win32com.client.Dispatch("Word.Application")
        word.Visible = False
        w_doc = word.Documents.Open(OUTPUT_PATH)
        page_count = w_doc.ComputeStatistics(2) # 2 = wdStatisticPages
        word_count = w_doc.ComputeStatistics(0) # 0 = wdStatisticWords
        w_doc.Close(False)
        word.Quit()
        print(f"==================================================")
        print(f"VERIFIED WORD COM METRICS:")
        print(f"  Exact Page Count: {page_count} pages (Target: 70-80 pages)")
        print(f"  Total Word Count: {word_count} words")
        print(f"==================================================")
        return page_count
    except Exception as e:
        print(f"Note: Could not run Word COM statistics directly: {e}")
        return None

if __name__ == "__main__":
    generate_report()
