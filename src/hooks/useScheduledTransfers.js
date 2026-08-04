import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  scheduledTxn,
  updateScheduledTxn,
  deleteScheduledTxn,
} from "@/lib/api/endpoints";

export function useScheduledTransfers() {
  const queryClient = useQueryClient();

  // 1. Query for Scheduled Transfers
  const transfersQuery = useQuery({
    queryKey: ["scheduledTransfers"],
    queryFn: async () => {
      // old-portal payload: { txnCode: "PAYTOBANK" } 
      // Assuming PAYTOBANK for now; we may need to make it dynamic later if PAYBILL is also needed here
      const res = await scheduledTxn({ txnCode: "PAYTOBANK" });
      
      if (res.statusCode !== 0 || res.status !== "success") {
        throw new Error(res.statusDesc || "Failed to load scheduled transfers");
      }
      return res.scheduledTxns || [];
    },
    staleTime: 0, // No aggressive caching (Banking rules)
  });

  // 2. Mutation for Updating a Scheduled Transfer
  const updateTransferMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await updateScheduledTxn(payload);
      if (res.statusCode !== 0 || res.status !== "success") {
        throw new Error(res.statusDesc || "Failed to update scheduled transfer");
      }
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scheduledTransfers"] });
    },
  });

  // 3. Mutation for Deleting a Scheduled Transfer
  const deleteTransferMutation = useMutation({
    mutationFn: async (scheduledTxnId) => {
      const res = await deleteScheduledTxn({ scheduledTxnId });
      if (res.statusCode !== 0 || res.status !== "success") {
        throw new Error(res.statusDesc || "Failed to delete scheduled transfer");
      }
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scheduledTransfers"] });
    },
  });

  return {
    transfersQuery,
    updateTransferMutation,
    deleteTransferMutation,
  };
}
