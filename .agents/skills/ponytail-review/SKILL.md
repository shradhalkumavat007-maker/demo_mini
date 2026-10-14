---
name: ponytail-review
description: >-
  Quality review of a change: is the logic right, is it safe, does it hold
  under real load, is risky code tested, is it fast enough, and is every line
  needed. Reads connected code, not only the diff. Use for "review this",
  "code review", "review the last commit", "review my PR", "is this over-engineered",
  or `/ponytail-review`.
license: MIT
---

# Ponytail Review — Pragmatic Code Review

Review a change like the senior developer who will be paged when it breaks in production.
Order of priority: **Correct > Safe > Holds under load > Tested > Fast > Lean**.

Lean still matters: every extra line must be read, tested, maintained, and fixed later.

## 1. Understand First

- Review what the user identifies: unstaged changes, git diff, a branch, PR, or specific files. If unstated, check the uncommitted changes or the last commit.
- Read the diff AND the surrounding callers and dependencies: callers of modified functions, callees, test suites, and documentation.
- Trace data flow from input to storage to output.
- Identify what could silently break in callers or external systems.

## 2. Review Checklist

1. **Bug:** Incorrect logic, unhandled falsy values (e.g., 0 vs empty), edge cases (empty lists, negative numbers, timezones), or callers broken by signature changes.
2. **Risk & Security:** Injection vulnerabilities, unescaped inputs, exposed secrets, broken permission checks, or swallowed errors.
3. **Scale & Concurrency:** Race conditions, unindexed queries, unbounded in-memory growth, or quadratic operations in loops.
4. **Missing Tests:** Complex or mission-critical logic without a verifying test.
5. **Speed:** High-impact bottlenecks.
6. **Lean (YAGNI):** Unneeded abstractions, dead code, speculative parameters, or reinvented wheels where a built-in helper exists.

## 3. Output Format

Present findings clearly:
- **Critical / Blocker**: Bugs and security hazards that must be fixed.
- **Improvement / Simplification**: Over-engineered patterns that can be shortened or removed.
- **Verdict**: A concise 1-sentence decision on whether the change is ready to ship.
