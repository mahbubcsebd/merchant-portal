import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getBeneficiaries, createBeneficiary, updateBeneficiary, deleteBeneficiary } from "@/lib/api/endpoints";

export function useBeneficiaries() {
  const queryClient = useQueryClient();

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
  };
}
