
<!-- BEGIN:banking-app-rules -->
# Banking App Caching Rules
- **No Aggressive Caching:** This is a banking application where data updates frequently (e.g., balances, transactions, profile data). Avoid using aggressive caching strategies (like long `staleTime` in React Query or long-lived server caches).
- **Always Show Fresh Data:** Ensure data is invalidated immediately after mutations and favor fresh data fetches over cached states.
<!-- END:banking-app-rules -->

<!-- BEGIN:formatting-rules -->
# Code Formatting Rules
- **Prettier Defaults:** Always format code to match standard Prettier defaults to avoid massive diffs when the user saves manually.
- **Quotes:** Use double quotes (`"`) for strings and JSX attributes (unless escaping requires single quotes).
- **Indentation:** Use 2 spaces for indentation. Do not use tabs.
- **Semicolons:** Always include semicolons at the end of statements.
- **Trailing Commas:** Include trailing commas in objects, arrays, and function parameters where valid in ES5/ES6.
<!-- END:formatting-rules -->

