import { useQuery } from "@tanstack/react-query";
import { getBeneficiaries } from "@/lib/api/endpoints";

export function useBeneficiaries() {
  const beneficiariesQuery = useQuery({
    queryKey: ["beneficiaries"],
    queryFn: async () => {
      const response = await getBeneficiaries();
      if (
        response.status !== "success" ||
        (response.statusCode !== "0" && response.statusCode !== 0)
      ) {
        throw new Error(response.message || "Failed to fetch beneficiaries");
      }
      return response.records || response.payees || response.data || [];
    },
  });

  return {
    beneficiariesQuery,
  };
}
