import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  scheduledTxn,
  updateScheduledTxn,
  deleteScheduledTxn,
  scheduledTxnHistory,
} from "@/lib/api/endpoints";

export function useScheduledTransfers() {
  const queryClient = useQueryClient();

  // Query for Scheduled Transfers
  const transfersQuery = useQuery({
    queryKey: ["scheduledTransfers"],
    queryFn: async () => {
      const res = await scheduledTxn({ txnCode: "PAYTOBANK" });
      
      if (res.statusCode !== 0 || res.status !== "success") {
        throw new Error(res.statusDesc || "Failed to load scheduled transfers");
      }
      return res.scheduledTxns || [];
    },
    staleTime: 0,
  });

  // Mutation for Updating a Scheduled Transfer
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

  // Mutation for Deleting a Scheduled Transfer
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

export function useScheduledTxnHistory(scheduledTxnId) {
  return useQuery({
    queryKey: ["scheduledTxnHistory", scheduledTxnId],
    queryFn: async () => {
      const res = await scheduledTxnHistory({ scheduledTxnId });
      if (res.statusCode !== 0 || res.status !== "success") {
        throw new Error(
          res.message || res.statusDesc || "Failed to load scheduled transfer history",
        );
      }
      return {
        history: res.scheduledTxnHistory || [],
        message: res.message || "",
      };
    },
    enabled: Boolean(scheduledTxnId),
    staleTime: 0,
  });
}

