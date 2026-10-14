---
name: ponytail-audit
description: >-
  Repository-wide bloat and YAGNI audit: identifies dead code, unneeded dependencies,
  speculative abstractions, redundant helper duplicates, and bloated files.
  Use for "audit codebase", "find bloat", "audit dependencies", "simplify repository",
  or `/ponytail-audit`.
license: MIT
---

# Ponytail Audit — Repository Bloat & YAGNI Audit

Identify waste, over-engineering, and dead code across the repository.

## Audit Targets

1. **Unused Dependencies:** Packages listed in `package.json` / `pom.xml` that are never imported or could be replaced by a simple standard library utility.
2. **Dead / Orphan Code:** Functions, classes, components, or files that have zero callers or references.
3. **Speculative Abstractions:** Interfaces with only one implementation, factories creating a single class, or complex generics for single-use functions.
4. **Duplicated Utilities:** Multiple helpers doing the exact same string, date, or formatting operations.
5. **Bloated Files:** Monolithic files that contain unnecessary wrapper layers or excessive boilerplate.

## Execution Steps

1. Inspect dependencies, lockfiles, and imports across the codebase.
2. Search for unreferenced exports or obsolete routes.
3. Group findings by impact:
   - **Safe to delete immediately** (e.g., zero references).
   - **Candidates for simplification** (e.g., collapsing over-engineered layers).
   - **Dependencies to remove** (e.g., replaced by native platform features).
4. Provide a step-by-step cleanup plan without executing destructive changes automatically.
