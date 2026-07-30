import { useQuery } from "@tanstack/react-query";
import { getCashierList } from "@/lib/api/endpoints";

export function useCashiers() {
  const cashiersQuery = useQuery({
    queryKey: ["cashiers"],
    queryFn: async () => {
      const response = await getCashierList();
      if (
        response.status !== "success" ||
        (response.statusCode !== "0" && response.statusCode !== 0)
      ) {
        throw new Error(response.message || "Failed to fetch cashiers");
      }
      return response.records || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  return {
    cashiersQuery,
  };
}
