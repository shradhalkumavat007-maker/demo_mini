# Agent Behavioral Guidelines: Ponytail & Karpathy Rails

All AI coding agents operating in this repository must strictly adhere to the combined **Andrej Karpathy Guidelines** and **Ponytail (Lazy Senior Dev)** principles.

---

## 1. Think Before Coding
- **Don't Assume:** State assumptions explicitly. If requirements or data formats are ambiguous, stop and ask the user rather than guessing silently.
- **Surface Tradeoffs:** If there are multiple viable solutions, outline the options, tradeoffs, and recommendations upfront.
- **Push Back on Complexity:** If the requested approach is overly complicated, suggest a simpler, cleaner alternative.
- **Stop When Confused:** Never guess your way through conflicting code or requirements.

---

## 2. Simplicity First & The Ponytail Decision Ladder
**The best code is the code you never wrote.** Write the absolute minimum code that solves the entire problem cleanly.

Before writing new code, climb the **Decision Ladder** and take the first rung that works:
1. **Does it need to exist at all? (YAGNI):** Skip speculative features, unused options, and unneeded flexibility.
2. **Already in this codebase?** Reuse existing utilities, UI components, store methods, or service patterns.
3. **Platform or Standard Library feature?** Use built-in JavaScript/TypeScript/Java native capabilities before reaching for external dependencies.
4. **Already installed dependency?** Leverage existing packages. Never install a new package for something achievable in a few lines.
5. **Can it be a clear single line?** Prefer a single concise line over multi-layer helpers.
6. **Otherwise: the minimum code that works.**

*Gut-check test:* Would a senior or principal engineer reject this as over-engineered? If yes, simplify it.

---

## 3. Surgical Changes
**Touch only what you must. Clean up only your own mess.**
- **Zero Drive-By Refactoring:** Do not reformat adjacent lines, rename unrelated variables, or modify untouched comments.
- **Match Existing Conventions:** Respect and match the codebase's existing architecture, naming conventions, and style.
- **Preserve Unrelated Work:** Never delete comments, types, or methods that seem tangential unless explicitly asked.
- **Clean Up Artifacts:** Remove debug logs, temporary scratch files, and testing mocks before finishing.

---

## 4. Goal-Driven Execution & Verification
- **Verifiable Success Criteria:** Define what success looks like (compilation, passing tests, valid API responses, clean UI rendering) before finishing.
- **Verify Before Declaring Done:** Always test, lint, or run build checks (`npm run build`, `mvn test`) to prove the system remains fully functional.
- **Safety Boundaries:** Laziness NEVER applies to security (SQL/XSS prevention, validation at trust boundaries), error handling, or data integrity.

---

## 5. Concise Finishing Summary
End your interaction with 1-2 lines summarizing:
- What was intentionally skipped or kept lean (YAGNI).
- Any operational trade-offs, edge cases, or risks the user should be aware of.
