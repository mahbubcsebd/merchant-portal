import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getUserBiller,
  getBillerByBillId,
  payBills,
} from "@/lib/api/endpoints";

export function usePayBills() {
  const queryClient = useQueryClient();

  // 1. Fetch User Billers
  const userBillersQuery = useQuery({
    queryKey: ["userBillers"],
    queryFn: async () => {
      const response = await getUserBiller();
      if (response.status !== "success") {
        throw new Error(response.message || "Failed to fetch user billers");
      }
      return response.userBillers || [];
    },
  });

  // 2. Fetch Biller Details dynamically
  const getBillerDetailsMutation = useMutation({
    mutationFn: async (billId) => {
      const response = await getBillerByBillId({ billId });
      if (response.status !== "success") {
        throw new Error(response.message || "Failed to fetch biller details");
      }
      return response.userBiller;
    },
  });

  // 3. Pay Bills
  const payBillsMutation = useMutation({
    mutationFn: async (payload) => {
      const response = await payBills(payload);
      if (
        response.status !== "success" ||
        (response.statusCode !== "0" && response.statusCode !== 0)
      ) {
        throw new Error(response.message || "Failed to pay bill");
      }
      return response;
    },
  });

  return {
    userBillersQuery,
    getBillerDetailsMutation,
    payBillsMutation,
  };
}
