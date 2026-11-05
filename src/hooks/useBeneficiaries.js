import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getBeneficiaries, createBeneficiary, updateBeneficiary, deleteBeneficiary } from "@/lib/api/endpoints";

export function useBeneficiaries() {
  const queryClient = useQueryClient();

  const beneficiariesQuery = useQuery({
    queryKey: ["beneficiaries"],
    queryFn: async () => {
      const response = await getBeneficiaries();

      const isSuccess =
        response?.status === "success" &&
        (response?.statusCode === "0" ||
          response?.statusCode === 0 ||
          response?.statusCode === undefined);

      const msg = (response?.message || "").toLowerCase();
      const isEmpty =
        (!isSuccess ||
          (Array.isArray(response?.records) && response.records.length === 0) ||
          (Array.isArray(response?.payees) && response.payees.length === 0)) &&
        (msg.includes("no beneficiary") ||
          msg.includes("no payees") ||
          msg.includes("add beneficiary") ||
          msg.includes("no record") ||
          msg.includes("empty") ||
          (Array.isArray(response?.records) && response.records.length === 0) ||
          (Array.isArray(response?.payees) && response.payees.length === 0));

      if (isSuccess || isEmpty) {
        const list =
          response?.records ||
          response?.payees ||
          response?.data ||
          [];
        list.emptyMessage = response?.message || "";
        return list;
      }

      throw new Error(response?.message || "Failed to fetch beneficiaries");
    },
    staleTime: 0,
  });

  const createBeneficiaryMutation = useMutation({
    mutationFn: async (payload) => {
      const response = await createBeneficiary(payload);
      if (
        response.status !== "success" ||
        (response.statusCode !== "0" && response.statusCode !== 0)
      ) {
        throw new Error(response.message || "Failed to create beneficiary");
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["beneficiaries"] });
    },
  });

  const updateBeneficiaryMutation = useMutation({
    mutationFn: updateBeneficiary,
    onSuccess: (data) => {
      if (data.status === "error") {
        throw new Error(data.message || "Failed to update beneficiary");
      }
      queryClient.invalidateQueries(["beneficiaries"]);
    },
  });

  const deleteBeneficiaryMutation = useMutation({
    mutationFn: deleteBeneficiary,
    onSuccess: (data) => {
      if (data.status === "error") {
        throw new Error(data.message || "Failed to delete beneficiary");
      }
      queryClient.invalidateQueries(["beneficiaries"]);
    },
  });

  return {
    beneficiariesQuery,
    createBeneficiaryMutation,
    updateBeneficiaryMutation,
    deleteBeneficiaryMutation,
    emptyMessage: beneficiariesQuery.data?.emptyMessage || "",
  };
}
