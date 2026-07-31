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

  const {
    branches,
    isLoading,
    addMutation,
    deleteMutation,
    editMutation,
    queryClient,
  } = useBranches();
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
      (item) => String(item.id) === String(value),
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
            "Branch Category": values.subCategoryLabel || values.subCategory,
            "Business ID Type":
              values.businessIdTypeLabel || values.businessIdType,
            "Business ID Number": values.businessIdNum,
            Website: values.website,
            Status: values.subStatusLabel || values.subStatus,
          },
          onChange: () => {
            handleAddClick(values);
          },
          onSubmit: () => {
            // Transform payload to exactly match old portal requirements
            const payload = {
              businessCategory: values.subCategory,
              businessIdImg: values.businessIdImg || "",
              businessIdImg_: "assets/take_photo.svg",
              businessIdNum: values.businessIdNum,
              businessIdType: values.businessIdType,
              businessPhone: values.businessPhone,
              businessTaxId: values.businessIdNum,
              coordLat: "1.1",
              coordLong: "1.1",
              countryCode: values.mobileDial || "",
              countryCodeB: values.businessDial || "",
              custType: "C",
              emailAddr: values.emailAddr,
              mobilePhone: values.mobilePhone,
              proImgId: values.proImgId || "",
              proImgId_: "assets/take_photo.svg",
              streetName: values.streetName,
              streetNum: values.streetNum,
              subCategory: values.subCategory,
              subCity: values.subCity,
              subCountry: values.subCountry,
              subName: values.subName,
              subState: values.subState,
              subStatus: values.subStatus || "A",
              subZip: values.subZip,
              unitName: values.unitName,
              website: values.website,
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
                      "Branch Name": values.subName,
                      "Email Address": values.emailAddr,
                      "Mobile Phone":
                        (values.mobileDial || "") + values.mobilePhone,
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

        return false;
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
        {
          label: "Country",
          value: getLabel("COUNTRYCODE", branch.SUBCOUNTRY) || "N/A",
        },
        { label: "State", value: branch.SUBSTATE || "N/A" },
        { label: "City", value: branch.SUBCITY || branch.CITY || "N/A" },
        { label: "Street Name", value: branch.STREETNAME || "N/A" },
        { label: "Street No", value: branch.STREETNUM || "N/A" },
        { label: "Unit Name", value: branch.UNITNAME || "N/A" },
        { label: "Zip Code", value: branch.SUBZIP || "N/A" },
        {
          label: "Branch Category",
          value: getLabel("SUBCATEGORY", branch.SUBCATEGORY) || "N/A",
        },
        {
          label: "Business ID Type",
          value: getLabel("BUSINESSIDTYPE", branch.BUSINESSIDTYPE) || "N/A",
        },
        { label: "Business ID Number", value: branch.BUSINESSIDNUM || "N/A" },
        { label: "Website", value: branch.WEBSITE || "N/A" },
        {
          label: "Status",
          value: branch.SUBSTATUS === "A" ? "Active" : "Inactive",
        },
      ],
      doneText: "Close",
    });
  };

  const handleEditClick = (branch) => {
    // Map uppercase API fields back to camelCase form fields
    const initialValues = {
      subId: branch.subId || branch.CORPCUSTSUBID,
      subName: branch.subName || branch.SUBNAME,
      emailAddr: branch.emailAddr || branch.EMAILADDR,
      mobileDial: branch.mobileDial || branch.PHCOUNTRYCODE,
      mobilePhone: branch.mobilePhone || branch.MOBILEPHONE,
      businessDial: branch.businessDial || branch.PHCOUNTRYCODEBUSINESS,
      businessPhone: branch.businessPhone || branch.BUSINESSPHONE,
      subCountry: branch.subCountry || branch.SUBCOUNTRY,
      subState: branch.subState || branch.SUBSTATE,
      subCity: branch.subCity || branch.SUBCITY || branch.CITY,
      streetName: branch.streetName || branch.STREETNAME,
      streetNum: branch.streetNum || branch.STREETNUMB,
      unitName: branch.unitName || branch.UNITNAME,
      subZip: branch.subZip || branch.SUBZIP,
      subCategory: branch.subCategory || branch.SUBCATEGORY,
      businessIdType: branch.businessIdType || branch.BUSINESSIDTYPE,
      businessIdNum: branch.businessIdNum || branch.BUSSINESSIDNUMB,
      website: branch.website || branch.WEBSITE,
      proImgId: branch.proImgId || branch.PROFIMGID,
      businessIdImg: branch.businessIdImg || branch.BUSINESSIDIMAGE,
      subStatus: branch.subStatus || branch.SUBSTATUS || "A",
    };
    openFormDialog({
      title: "Edit Branch",
      isView: false,
      submitText: "Save",
      size: "sm:max-w-4xl",
      content: <BranchFormFields data={initialValues} isView={false} />,
      onSave: (values) => {
        // Show preconfirm screen
        openPreconfirmDialog({
          title: "Confirm Updated Branch Details",
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
            "Branch Category": values.subCategoryLabel || values.subCategory,
            "Business ID Type":
              values.businessIdTypeLabel || values.businessIdType,
            "Business ID Number": values.businessIdNum,
            Website: values.website,
            Status: values.subStatusLabel || values.subStatus,
          },
          onChange: () => {
            // Re-open edit form with the updated values
            const updatedBranch = { ...branch, ...values };
            handleEditClick(updatedBranch);
          },
          onSubmit: () => {
            const payload = {
              businessCategory: values.subCategory,
              businessIdImg: values.businessIdImg || "",
              businessIdImg_: "assets/take_photo.svg",
              businessIdNum: values.businessIdNum,
              businessIdType: values.businessIdType,
              businessPhone: values.businessPhone,
              businessTaxId: values.businessIdNum,
              coordLat: "1.1",
              coordLong: "1.1",
              countryCode: values.mobileDial || "",
              countryCodeB: values.businessDial || "",
              custType: "C",
              emailAddr: values.emailAddr,
              mobilePhone: values.mobilePhone,
              proImgId: values.proImgId || "",
              proImgId_: "assets/take_photo.svg",
              streetName: values.streetName,
              streetNum: values.streetNum,
              subCategory: values.subCategory,
              subCity: values.subCity,
              subCountry: values.subCountry,
              subId: initialValues.subId,
              subName: values.subName,
              subState: values.subState,
              subStatus: values.subStatus || "A",
              subZip: values.subZip,
              unitName: values.unitName,
              website: values.website,
            };

            editMutation.mutate(payload, {
              onSuccess: (res, variables) => {
                if (
                  res.status === "success" &&
                  (res.statusCode === "0" || res.statusCode === 0)
                ) {
                  queryClient.invalidateQueries({ queryKey: ["subsidiaries"] });
                  openSuccessDialog({
                    title: "Branch Updated",
                    message: "The branch has been successfully updated.",
                    details: {
                      "Branch Name": values.subName,
                      "Email Address": values.emailAddr,
                      "Mobile Phone":
                        (values.mobileDial || "") + values.mobilePhone,
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
                  });
                } else {
                  openGlobalPopup({
                    title: "Error",
                    description: res.message || "Failed to update branch",
                    type: "error",
                    onClose: () => {
                      const updatedBranch = { ...branch, ...values };
                      handleEditClick(updatedBranch);
                    },
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
            });
          },
        });

        return false;
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
                  description:
                    res.message ||
                    `The branch ${branch.SUBNAME} has been successfully deleted.`,
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
          },
        );
        return false;
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
