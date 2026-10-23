import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSubsidiaries, createSubsidiary, deleteSubsidiary, modifySubsidiary } from "@/lib/api/endpoints";

export function useBranches() {
  const queryClient = useQueryClient();
  const isDemo =
    typeof window !== "undefined" &&
    localStorage.getItem("is_demo") === "true";

  const demoBranches = [
    {
      CORPCUSTSUBID: "SUB-001",
      subId: "SUB-001",
      SUBNAME: "Main Downtown Branch",
      EMAILADDR: "downtown@demo.com",
      MOBILEPHONE: "+1 (555) 234-5678",
      SUBSTATUS: "A",
      subCategory: "Retail",
    },
    {
      CORPCUSTSUBID: "SUB-002",
      subId: "SUB-002",
      SUBNAME: "Northside Shopping Outlet",
      EMAILADDR: "northside@demo.com",
      MOBILEPHONE: "+1 (555) 345-6789",
      SUBSTATUS: "A",
      subCategory: "Supermarket",
    },
    {
      CORPCUSTSUBID: "SUB-003",
      subId: "SUB-003",
      SUBNAME: "West End Plaza Counter",
      EMAILADDR: "westend@demo.com",
      MOBILEPHONE: "+1 (555) 456-7890",
      SUBSTATUS: "A",
      subCategory: "Pharmacy",
    },
  ];

  // 1. Fetch Branches
  const { data: subsidiariesRes, isLoading } = useQuery({
    queryKey: ["subsidiaries"],
    queryFn: () => getSubsidiaries({}),
    enabled: !isDemo,
  });

  const branches = isDemo ? demoBranches : (subsidiariesRes?.data || []);

  // 2. Add Branch Mutation
  const addMutation = useMutation({
    mutationFn: (values) => createSubsidiary(values),
  });

  // 3. Delete Branch Mutation
  const deleteMutation = useMutation({
    mutationFn: (values) => deleteSubsidiary(values),
  });

  // 4. Edit Branch Mutation
  const editMutation = useMutation({
    mutationFn: (values) => modifySubsidiary(values),
  });

  return {
    branches,
    isLoading,
    addMutation,
    deleteMutation,
    editMutation,
    queryClient,
  };
}
