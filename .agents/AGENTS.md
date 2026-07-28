
<!-- BEGIN:banking-app-rules -->
# Banking App Caching Rules
- **No Aggressive Caching:** This is a banking application where data updates frequently (e.g., balances, transactions, profile data). Avoid using aggressive caching strategies (like long `staleTime` in React Query or long-lived server caches).
- **Always Show Fresh Data:** Ensure data is invalidated immediately after mutations and favor fresh data fetches over cached states.
<!-- END:banking-app-rules -->

