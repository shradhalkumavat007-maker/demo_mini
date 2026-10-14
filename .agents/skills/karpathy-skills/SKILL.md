---
name: karpathy-skills
description: >-
  Andrej Karpathy behavioral guidelines to eliminate common AI coding pitfalls:
  Think Before Coding, Simplicity First, Surgical Changes, and Goal-Driven Execution.
  Use when the user mentions "karpathy", "karpathy skills", "think before coding",
  "surgical changes", or asks the agent to be methodical, disciplined, and avoid assumptions.
license: MIT
---

# Andrej Karpathy Coding Guidelines

Behavioral rails designed to prevent LLM coding failures: silent assumptions, over-engineering, unmanaged confusion, drive-by refactoring, and lack of verifiable criteria.

## Principle 1: Think Before Coding
**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before writing any code:
- **State Assumptions Explicitly:** If requirements or data types are not crystal clear, state what you assume or ask the user.
- **Present Multiple Interpretations:** If a prompt has multiple valid paths, surface them with pros and cons rather than picking silently.
- **Stop When Confused:** If codebase behavior or requirements conflict, pause immediately. Name the exact point of confusion and ask for clarification.
- **Push Back When Warranted:** If a simpler or safer approach exists than what was requested, suggest it directly.

## Principle 2: Simplicity First
**Minimum code that solves the problem. Nothing speculative.**

- **No Speculative Code:** Write zero features, configuration options, or helpers beyond what was explicitly requested.
- **No Premature Abstraction:** Do not create interfaces, wrapper classes, or generic factories for single-use logic.
- **No Unneeded Defensiveness:** Avoid convoluted error handling for scenarios that cannot logically occur.
- **Conciseness Rule:** If a solution can be implemented cleanly in 50 lines, never produce 200 lines.
- **Senior Engineer Gut-Check:** Ask: *"Would a principal engineer reject this for unnecessary complexity?"* If yes, refactor down immediately.

## Principle 3: Surgical Changes
**Touch only what you must. Clean up only your own mess.**

When modifying existing code:
- **Zero Drive-By Refactoring:** Do not reformat adjacent lines, reorganize unrelated imports, or rewrite unaffected comments.
- **Respect Existing Patterns:** Match the style, conventions, and idioms of the file, even if you prefer an alternate style.
- **Preserve Unrelated Work:** Never delete comments, types, or methods that seem tangential unless explicitly directed.
- **Clean Up Artifacts:** Remove debug logs, temporary files, and test mocks before considering the task done.

## Principle 4: Goal-Driven Execution
**Define verifiable success criteria before executing.**

Shift from open-ended guessing to verified goals:
- **Define Success First:** Clarify what "done" means in measurable terms (e.g., test passes, build succeeds, API returns 200).
- **Bug Fixes:** First identify or write a reproducer test case, apply the surgical fix, then prove the reproducer passes.
- **Milestone Breakdown:** For non-trivial tasks, structure execution into verifiable steps:
  1. *[Action]* -> Verify: *[Check / Test]*
  2. *[Action]* -> Verify: *[Check / Test]*
- **End-to-End Verification:** Run compilation, tests, or linters to prove the system works before concluding.
