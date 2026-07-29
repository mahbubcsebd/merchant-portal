import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSubsidiaries, createSubsidiary, deleteSubsidiary } from "@/lib/api/endpoints";

export function useBranches() {
  const queryClient = useQueryClient();

  // 1. Fetch Branches
  const { data: subsidiariesRes, isLoading } = useQuery({
    queryKey: ["subsidiaries"],
    queryFn: () => getSubsidiaries({}),
  });

  const branches = subsidiariesRes?.data || [];

  // 2. Add Branch Mutation
  const addMutation = useMutation({
    mutationFn: (values) => createSubsidiary(values),
  });

  // 3. Delete Branch Mutation
  const deleteMutation = useMutation({
    mutationFn: (values) => deleteSubsidiary(values),
  });

  return {
    branches,
    isLoading,
    addMutation,
    deleteMutation,
    queryClient,
  };
}
