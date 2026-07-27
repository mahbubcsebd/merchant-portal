---
name: merchant-portal-api-integration
description: Standard practices and guidelines for adding, consuming, and formatting API data in the merchant-portal project using React Query.
---

# API Integration Guidelines

When working on the **merchant-portal** project, adhere to the following standards for integrating and consuming APIs. This ensures consistent data fetching, caching, and state management.

## 1. Defining Endpoints
All API endpoints must be centrally defined in `src/lib/api/endpoints.js`.
- Do not make inline `fetch` or `axios` calls within components.
- Import the base `post` or `get` utility from `src/lib/api/api.js`.
- Create an exported async function for each endpoint that takes a `payload` object.

```javascript
// src/lib/api/endpoints.js
import { post } from "./api";

export async function getDashboardInfo(payload = {}) {
  return post("/getDashboardInfo", payload);
}
```

## 2. Consuming APIs with React Query
Data fetching should exclusively use `@tanstack/react-query`. Avoid using raw `useEffect` to fetch and store data in `useState`.

- **Query Keys**: Always include dependency variables (like filters or IDs) in the `queryKey` array so React Query automatically refetches when they change.
- **Enabled Flag**: Use the `enabled` property to prevent queries from firing before their required parameters (like an `accountId`) are loaded.
- **Stale Time**: For dashboard and profile data, configure a `staleTime` (e.g., `5 * 60 * 1000` for 5 minutes) to prevent aggressive refetching when navigating between pages.

```javascript
import { useQuery } from "@tanstack/react-query";
import { getDashboardInfo } from "@/lib/api/endpoints";

const { data, isLoading } = useQuery({
  queryKey: ["dashboardInfo", activeAccountId, period],
  queryFn: () => getDashboardInfo({ period, accountId: activeAccountId }),
  enabled: !!activeAccountId,
  staleTime: 5 * 60 * 1000, 
});
```

## 3. Data Formatting & Number Parsing (CRITICAL)
- **Currency Values**: The API returns exact decimal amounts as strings (e.g., `"2000.00"`). **DO NOT divide monetary values by 100.** Simply parse them directly using `parseFloat(val)`.
- **Commas**: Use standard JavaScript `Intl.NumberFormat` to format large numbers with commas. Do not write manual regex formatters.
- **Currency Names**: The API returns both `CURCODE` and `CURSHRTNAME`. `CURCODE` is usually a numeric ID (e.g., `"0"`). **Always use `CURSHRTNAME`** (e.g., `"XCG"`, `"JMD"`) when displaying currency symbols in the UI.

```javascript
// Correct Formatting
const rawBal = parseFloat(account.AVBALANCE || 0);
const formattedBal = new Intl.NumberFormat('en-US', { 
  minimumFractionDigits: 2, 
  maximumFractionDigits: 2 
}).format(rawBal);

const displayString = `${formattedBal} ${account.CURSHRTNAME}`; 
// Example: "2,000.00 XCG"
```

## 4. State Hoisting (Context)
When multiple child components on a page need the same API data, hoist the `useQuery` calls up to the Layout or Page level and pass the result down via React Context (e.g., `DashboardContext`). 
This prevents component waterfalls, deduplicates network requests, and creates a central source of truth for loading states.
