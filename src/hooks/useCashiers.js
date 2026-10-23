import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCashierList,
  createCashier,
  updateCashier,
  getCashierPermssionList,
  saveMerchantCashierPermission,
  unenrollCashier,
  updateStatusCashier,
  resetPinCashier,
} from "@/lib/api/endpoints";

export function useCashiers() {
  const queryClient = useQueryClient();

  const isDemo =
    typeof window !== "undefined" &&
    localStorage.getItem("is_demo") === "true";

  const demoCashiers = [
    {
      merCashierID: "CASHIER_01",
      cashierFName: "Sarah",
      cashierLName: "Jenkins",
      cashierEmail: "sarah.j@demo.com",
      cashierMobile: "5551234567",
      countryCode: "+1",
      merSubID: "SUB-001",
      cashierStatus: "A",
      cashierIDType: "National ID",
      cashierIDNum: "NID-99218",
    },
    {
      merCashierID: "CASHIER_02",
      cashierFName: "David",
      cashierLName: "Miller",
      cashierEmail: "david.m@demo.com",
      cashierMobile: "5552345678",
      countryCode: "+1",
      merSubID: "SUB-001",
      cashierStatus: "A",
      cashierIDType: "Passport",
      cashierIDNum: "P-882719",
    },
    {
      merCashierID: "CASHIER_03",
      cashierFName: "Emily",
      cashierLName: "Watson",
      cashierEmail: "emily.w@demo.com",
      cashierMobile: "5553456789",
      countryCode: "+1",
      merSubID: "SUB-002",
      cashierStatus: "A",
      cashierIDType: "Driver License",
      cashierIDNum: "DL-388127",
    },
  ];

  const demoPermissions = [
    { permissionId: "1", permissionName: "Process QR Payments", description: "Accept QR code transactions" },
    { permissionId: "2", permissionName: "Issue Refunds", description: "Process customer refund requests" },
    { permissionId: "3", permissionName: "View Daily Summary", description: "Access terminal end-of-day reports" },
  ];

  const cashiersQuery = useQuery({
    queryKey: ["cashiers"],
    queryFn: async () => {
      if (isDemo) return demoCashiers;
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
      if (isDemo) return demoPermissions;
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

  const resetPinMutation = useMutation({
    mutationFn: async (payload) => {
      const response = await resetPinCashier(payload);
      if (
        response.status !== "success" ||
        (response.statusCode !== "0" && response.statusCode !== 0)
      ) {
        throw new Error(response.message || "Failed to reset cashier PIN");
      }
      return response;
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
    resetPinMutation,
  };
}
