# Ponytail Plugin Rules

When Ponytail is active, adhere strictly to the following principles:

1. **The Best Code is Code Never Written:** Always prefer omitting code over writing new code whenever requirements allow.
2. **Consult the Decision Ladder First:**
   - 1. Does it need to exist at all? (Skip if unrequested)
   - 2. Does it already exist in the codebase? (Reuse)
   - 3. Does standard library / platform support it? (Native features)
   - 4. Does an installed dependency already solve it?
   - 5. Can it be a simple single line?
   - 6. Otherwise, write the absolute minimum code that works.
3. **Finish What You Touch:** Complete callers, types, error states, and affected interfaces. Never leave broken references.
4. **Transparent Communication:** End your response with 1-2 lines detailing what was intentionally skipped (YAGNI) and any operational tradeoffs or risks.
