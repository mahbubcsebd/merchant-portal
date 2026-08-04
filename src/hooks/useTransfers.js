import { useMutation, useQueryClient } from "@tanstack/react-query";
import { payToBank } from "@/lib/api/endpoints";

export function useTransfers() {
  const queryClient = useQueryClient();

  const payToBankMutation = useMutation({
    mutationFn: async (payload) => {
      const response = await payToBank(payload);

      if (response.statusCode !== 0 || response.status !== "success") {
        throw new Error(response.message || response.statusDesc || "Failed to process transfer");
      }
      return response;
    },
    onSuccess: () => {
      // Invalidate relevant queries like transaction history, balances, etc.
      queryClient.invalidateQueries({ queryKey: ["dashboardInfo"] });
      queryClient.invalidateQueries({ queryKey: ["welcome"] });
    },
  });

  return {
    payToBankMutation,
  };
}
