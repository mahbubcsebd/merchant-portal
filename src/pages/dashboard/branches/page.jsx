import { Search } from "lucide-react";
import { useState } from "react";
import { useDialog } from "@/components/globals/DialogProvider";
import GlobalInput from "@/components/globals/GlobalInput";
import GlobalButton from "@/components/globals/GlobalButton";
import BranchFormFields from "@/components/branches/BranchFormFields";
import BranchDesktopTable from "@/components/branches/BranchDesktopTable";
import BranchMobileList from "@/components/branches/BranchMobileList";
import { useBranches } from "@/hooks/useBranches";

export default function BranchesPage() {
  const {
    openFormDialog,
    openConfirmDialog,
    openDetailDialog,
    openPreconfirmDialog,
    openSuccessDialog,
    openGlobalPopup,
  } = useDialog();

  const { branches, isLoading, addMutation, deleteMutation, queryClient } = useBranches();
  const welcomeData = queryClient.getQueryData(["welcome"]);

  const [searchTerm, setSearchTerm] = useState("");

  const filteredBranches = branches.filter((branch) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (branch.SUBNAME || "").toLowerCase().includes(term) ||
      (branch.EMAILADDR || "").toLowerCase().includes(term) ||
      (branch.MOBILEPHONE || "").toLowerCase().includes(term) ||
      (branch.CITY || "").toLowerCase().includes(term)
    );
  });

  const getLabel = (type, value) => {
    if (!welcomeData?.metaData || !welcomeData.metaData[type]) return value;
    const option = welcomeData.metaData[type].find(
      (item) => String(item.id) === String(value)
    );
    return option ? option.title : value;
  };

  const handleAddClick = (initialValues = null) => {
    openFormDialog({
      title: "Add Branch",
      isView: false,
      submitText: "Create",
      size: "sm:max-w-4xl",
      content: <BranchFormFields data={initialValues} isView={false} />,
      onSave: (values) => {
        // Show preconfirm screen
        openPreconfirmDialog({
          title: "Confirm Branch Details",
          details: {
            "Branch Name": values.subName,
            "Email Address": values.emailAddr,
            "Mobile Phone": (values.mobileDial || "") + values.mobilePhone,
            "Business Phone":
              (values.businessDial || "") + values.businessPhone,
            Country: values.subCountryLabel || values.subCountry,
            State: values.subState,
            City: values.subCity,
            "Street Name": values.streetName,
            "Street No": values.streetNum,
            "Unit Name": values.unitName,
            "Zip Code": values.subZip,
            "Branch Category":
              values.subCategoryLabel || values.subCategory,
            "Business ID Type":
              values.businessIdTypeLabel || values.businessIdType,
            "Business ID Number": values.businessIdNum,
            Website: values.website,
            Status: values.subStatusLabel || values.subStatus,
          },
          onChange: () => {
            // Go back to form with filled values
            handleAddClick(values);
          },
          onSubmit: () => {
            // Transform payload to match API requirements
            const payload = {
              ...values,
              businessCategory: values.subCategory,
              businessTaxId: values.businessIdNum,
              countryCode: values.mobileDial || "",
              countryCodeB: values.businessDial || "",
            };

            addMutation.mutate(payload, {
              onSuccess: (res, variables) => {
                if (
                  res.status === "success" &&
                  (res.statusCode === "0" || res.statusCode === 0)
                ) {
                  queryClient.invalidateQueries({ queryKey: ["subsidiaries"] });
                  openSuccessDialog({
                    title: "Branch Created",
                    message: "The branch has been successfully created.",
                    details: {
                      "Branch Name": variables.subName,
                      "Email Address": variables.emailAddr,
                      "Mobile Phone":
                        (variables.mobileDial || "") + variables.mobilePhone,
                      "Business Phone":
                        (variables.businessDial || "") +
                        variables.businessPhone,
                      Country:
                        variables.subCountryLabel || variables.subCountry,
                      State: variables.subState,
                      City: variables.subCity,
                      "Street Name": variables.streetName,
                      "Street No": variables.streetNum,
                      "Unit Name": variables.unitName,
                      "Zip Code": variables.subZip,
                      "Branch Category":
                        variables.subCategoryLabel || variables.subCategory,
                      "Business ID Type":
                        variables.businessIdTypeLabel ||
                        variables.businessIdType,
                      "Business ID Number": variables.businessIdNum,
                      Website: variables.website,
                      Status: variables.subStatusLabel || variables.subStatus,
                    },
                  });
                } else {
                  openGlobalPopup({
                    title: "Error",
                    description: res.message || "Failed to create branch",
                    type: "error",
                    onClose: () => {
                      handleAddClick(variables);
                    },
                  });
                }
              },
              onError: (err) => {
                openGlobalPopup({
                  title: "Error",
                  description: err.message || "An unexpected error occurred",
                  type: "error",
                  onClose: () => {
                    handleAddClick(values);
                  },
                });
              },
            });
          },
        });
      },
    });
  };

  const handleViewClick = (branch) => {
    openDetailDialog({
      title: "View Branch",
      details: [
        { label: "Branch Name", value: branch.SUBNAME || "N/A" },
        { label: "Email Address", value: branch.EMAILADDR || "N/A" },
        { label: "Mobile Phone", value: branch.MOBILEPHONE || "N/A" },
        { label: "Business Phone", value: branch.BUSINESSPHONE || "N/A" },
        { label: "Country", value: getLabel("COUNTRYCODE", branch.SUBCOUNTRY) || "N/A" },
        { label: "State", value: branch.SUBSTATE || "N/A" },
        { label: "City", value: branch.SUBCITY || branch.CITY || "N/A" },
        { label: "Street Name", value: branch.STREETNAME || "N/A" },
        { label: "Street No", value: branch.STREETNUM || "N/A" },
        { label: "Unit Name", value: branch.UNITNAME || "N/A" },
        { label: "Zip Code", value: branch.SUBZIP || "N/A" },
        { label: "Branch Category", value: getLabel("SUBCATEGORY", branch.SUBCATEGORY) || "N/A" },
        { label: "Business ID Type", value: getLabel("BUSINESSIDTYPE", branch.BUSINESSIDTYPE) || "N/A" },
        { label: "Business ID Number", value: branch.BUSINESSIDNUM || "N/A" },
        { label: "Website", value: branch.WEBSITE || "N/A" },
        { label: "Status", value: branch.SUBSTATUS === "A" ? "Active" : "Inactive" },
      ],
      doneText: "Close"
    });
  };

  const handleEditClick = (branch) => {
    openFormDialog({
      title: "Edit Branch",
      isView: false,
      submitText: "Save",
      size: "sm:max-w-4xl",
      content: <BranchFormFields data={branch} isView={false} />,
      onSave: (values) => {
        console.log("Branch to update:", values);
      },
    });
  };

  const handleDeleteClick = (branch) => {
    openConfirmDialog({
      title: "Delete Branch?",
      description: `Are you sure you want to delete ${branch.SUBNAME}? This action cannot be undone.`,
      confirmText: deleteMutation.isPending ? "Deleting..." : "Delete",
      iconType: "danger",
      onConfirm: async () => {
        await deleteMutation.mutateAsync(
          { subId: branch.CORPCUSTSUBID },
          {
            onSuccess: (res) => {
              if (
                res.status === "success" &&
                (res.statusCode === "0" || res.statusCode === 0)
              ) {
                queryClient.invalidateQueries({ queryKey: ["subsidiaries"] });
                openGlobalPopup({
                  title: "Branch Deleted",
                  description: res.message || `The branch ${branch.SUBNAME} has been successfully deleted.`,
                  type: "success",
                });
              } else {
                openGlobalPopup({
                  title: "Error",
                  description: res.message || "Failed to delete branch",
                  type: "error",
                });
              }
            },
            onError: (err) => {
              openGlobalPopup({
                title: "Error",
                description: err.message || "An unexpected error occurred",
                type: "error",
              });
            },
          }
        );
      },
    });
  };

  return (
    <div className="w-full h-full flex flex-col p-4 sm:p-6 lg:p-8 bg-slate-50/50 dark:bg-[#0a0a0a]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white capitalize">
            Branches
          </h1>
          <p className="text-sm text-slate-500 dark:text-white/60 mt-1">
            Manage your branches
          </p>
        </div>
      </div>

      <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-white/8 bg-white dark:bg-white/[0.03] shadow-sm dark:shadow-none p-4 sm:p-6 min-h-[500px]">
        {/* Top Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <GlobalInput
            placeholder="Search Branches"
            leftIcon={<Search size={16} />}
            containerClassName="w-full sm:w-80"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <GlobalButton
            onClick={() => handleAddClick()}
            variant="primary"
            isLoading={addMutation.isPending}
            className="w-full sm:w-auto text-xs font-bold uppercase tracking-wider h-10 px-8"
          >
            Add Branch
          </GlobalButton>
        </div>

        {/* Data Table — Desktop View (Hidden on mobile) */}
        <BranchDesktopTable
          branches={filteredBranches}
          isLoading={isLoading}
          onView={handleViewClick}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
        />

        {/* Card Feed — Mobile View (Hidden on desktop) */}
        <BranchMobileList
          branches={filteredBranches}
          isLoading={isLoading}
          onView={handleViewClick}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
        />
      </div>
    </div>
  );
}
