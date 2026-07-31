import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getUserBiller,
  getBillerByBillId,
  payBills,
  getBillers,
  createUserBiller,
  updateUserBiller,
  deleteUserBiller,
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
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
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

  // 4. Fetch All System Billers
  const allBillersQuery = useQuery({
    queryKey: ["allBillers"],
    queryFn: async () => {
      const response = await getBillers();
      if (response.status !== "success") {
        throw new Error(response.message || "Failed to fetch system billers");
      }
      return response.billers || [];
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // 5. Create Bill Template (User Biller)
  const createBillTemplateMutation = useMutation({
    mutationFn: async (payload) => {
      const response = await createUserBiller(payload);
      if (
        response.status !== "success" ||
        (response.statusCode !== "0" && response.statusCode !== 0)
      ) {
        throw new Error(response.message || "Failed to create bill template");
      }
      return response;
    },
    onSuccess: () => {
      // Invalidate to refetch the templates list
      queryClient.invalidateQueries({ queryKey: ["userBillers"] });
    },
  });

  // 6. Update Bill Template
  const updateBillTemplateMutation = useMutation({
    mutationFn: async (payload) => {
      const response = await updateUserBiller(payload);
      if (
        response.status !== "success" ||
        (response.statusCode !== "0" && response.statusCode !== 0)
      ) {
        throw new Error(response.message || "Failed to update bill template");
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userBillers"] });
    },
  });

  // 7. Delete Bill Template
  const deleteBillTemplateMutation = useMutation({
    mutationFn: async (payload) => {
      const response = await deleteUserBiller(payload);
      if (
        response.status !== "success" ||
        (response.statusCode !== "0" && response.statusCode !== 0)
      ) {
        throw new Error(response.message || "Failed to delete bill template");
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userBillers"] });
    },
  });

  return {
    userBillersQuery,
    getBillerDetailsMutation,
    payBillsMutation,
    allBillersQuery,
    createBillTemplateMutation,
    updateBillTemplateMutation,
    deleteBillTemplateMutation,
  };
}
