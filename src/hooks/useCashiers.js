import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCashierList,
  createCashier,
  updateCashier,
  getCashierPermssionList,
  saveMerchantCashierPermission,
  unenrollCashier,
  updateStatusCashier,
} from "@/lib/api/endpoints";

export function useCashiers() {
  const queryClient = useQueryClient();

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

  const permissionsQuery = useQuery({
    queryKey: ["cashierPermissions"],
    queryFn: async () => {
      const response = await getCashierPermssionList({});
      if (
        response.status !== "success" ||
        (response.statusCode !== "0" && response.statusCode !== 0)
      ) {
        throw new Error(response.message || "Failed to fetch permissions");
      }
      return response.records || [];
    },
    staleTime: Infinity, // Permissions are mostly static
  });

  const createCashierMutation = useMutation({
    mutationFn: async (payload) => {
      const response = await createCashier(payload);
      if (
        response.status !== "success" ||
        (response.statusCode !== "0" && response.statusCode !== 0)
      ) {
        throw new Error(response.message || "Failed to create cashier");
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cashiers"] });
    },
  });

  const updateCashierMutation = useMutation({
    mutationFn: async (payload) => {
      const response = await updateCashier(payload);
      if (
        response.status !== "success" ||
        (response.statusCode !== "0" && response.statusCode !== 0)
      ) {
        throw new Error(response.message || "Failed to update cashier");
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cashiers"] });
    },
  });

  const savePermissionsMutation = useMutation({
    mutationFn: async (payload) => {
      const response = await saveMerchantCashierPermission(payload);
      if (
        response.status !== "success" ||
        (response.statusCode !== "0" && response.statusCode !== 0)
      ) {
        throw new Error(response.message || "Failed to save permissions");
      }
      return response;
    },
  });

  const deleteCashierMutation = useMutation({
    mutationFn: async (payload) => {
      const response = await unenrollCashier(payload);
      if (
        response.status !== "success" ||
        (response.statusCode !== "0" && response.statusCode !== 0)
      ) {
        throw new Error(response.message || "Failed to delete cashier");
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cashiers"] });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (payload) => {
      const response = await updateStatusCashier(payload);
      if (
        response.status !== "success" ||
        (response.statusCode !== "0" && response.statusCode !== 0)
      ) {
        throw new Error(response.message || "Failed to update cashier status");
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cashiers"] });
    },
  });

  return {
    cashiersQuery,
    permissionsQuery,
    createCashierMutation,
    updateCashierMutation,
    updateStatusMutation,
    savePermissionsMutation,
    deleteCashierMutation,
  };
}
