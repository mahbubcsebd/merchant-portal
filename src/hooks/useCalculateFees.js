import { useMutation } from "@tanstack/react-query";
import { calculateFees } from "@/lib/api/endpoints";

export function useCalculateFees() {
  const calculateFeesMutation = useMutation({
    mutationFn: async (payload) => {
      const response = await calculateFees(payload);

      if (response.status === "error" || response.statusCode === "1") {
        throw new Error(response.message || "Failed to calculate fees");
      }
      return response;
    },
  });

  return {
    calculateFeesMutation,
  };
}
