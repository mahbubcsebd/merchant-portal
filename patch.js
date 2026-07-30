const fs = require('fs');
const file = 'src/pages/dashboard/manage-cashiers/page.jsx';
let content = fs.readFileSync(file, 'utf8');

// Update imports
content = content.replace(
  'const { cashiersQuery, createCashierMutation, savePermissionsMutation } = useCashiers();',
  'const { cashiersQuery, createCashierMutation, savePermissionsMutation, deleteCashierMutation } = useCashiers();'
);
content = content.replace(
  'const { validateForm } = useFormValidation();',
  'const { validate } = useFormValidation();'
);

// Update Add Cashier logic
const addCashierLogic = `const openAddForm = (initialData = null) => {
              openFormDialog({
                title: "Add Cashier",
                isView: false,
                submitText: "Submit",
                disableAutoValidation: true,
                content: <CashierFormFields data={initialData} isView={false} />,
                onSave: async (values, setFormErrors) => {
                  const fields = [
                    { name: 'merCashierID', value: values.merCashierID, label: 'Cashier User ID', required: true },
                    { name: 'cashierFName', value: values.cashierFName, label: 'First Name', required: true },
                    { name: 'cashierLName', value: values.cashierLName, label: 'Last Name', required: true },
                    { name: 'cashierEmail', value: values.cashierEmail, label: 'Email', required: true, type: 'email' },
                    { name: 'cashierMobile', value: values.cashierMobile, label: 'Mobile No.', required: true },
                    { name: 'merSubID', value: values.merSubID, label: 'Branch', required: true, type: 'select' },
                    { name: 'cashierIDType', value: values.cashierIDType, label: 'Cashier ID Type', required: true, type: 'select' },
                    { name: 'cashierIDNum', value: values.cashierIDNum, label: 'Cashier ID Number', required: true }
                  ];
                  
                  const validationResult = validate(fields);
                  if (!validationResult.isValid) {
                    setFormErrors(validationResult.errors);
                    return false;
                  }
                  
                  // Format mobile number
                  const countryCode = values.countryCode || "";
                  let rawMobile = values.cashierMobile || "";
                  if (rawMobile && !rawMobile.startsWith(countryCode)) {
                    rawMobile = countryCode + rawMobile;
                  }
                  
                  const payload = { ...values, cashierMobile: rawMobile };
                  
                  const openPermissionsDialog = () => {
                    openFormDialog({
                      title: "Cashier Permissions",
                      submitText: "Save",
                      content: <CashierPermissionsList />,
                      onSave: async (permValues, showPermError) => {
                        try {
                          const functionalityIDs = permValues.functionalityIDs ? JSON.parse(permValues.functionalityIDs) : [];
                          const permPayload = { merCashierID: values.merCashierID, functionalityIDs };
                          const res = await savePermissionsMutation.mutateAsync(permPayload);
                          openGlobalPopup({
                            title: "Success",
                            description: res.message || "Permissions saved successfully.",
                            type: "success"
                          });
                          return false;
                        } catch (err) {
                          openGlobalPopup({
                            title: "Error",
                            description: err.message || "Failed to save permissions.",
                            type: "error",
                            onClose: () => openPermissionsDialog()
                          });
                          return false;
                        }
                      }
                    });
                  };

                  try {
                    const res = await createCashierMutation.mutateAsync(payload);
                    openGlobalPopup({
                      title: "Success",
                      description: res.message || "Cashier created successfully.",
                      type: "success",
                      onClose: () => openPermissionsDialog()
                    });
                    return false; // Prevent auto-close
                  } catch (err) {
                    openGlobalPopup({
                      title: "Error",
                      description: err.message || "Failed to create cashier.",
                      type: "error",
                      onClose: () => openAddForm(values)
                    });
                    return false;
                  }
                },
              });
            };
            openAddForm();`;

content = content.replace(
  /openFormDialog\(\{\s*title: "Add Cashier",[\s\S]*?\}\);\s*\}\}/,
  addCashierLogic + '\n            }}'
);

// Update Desktop Delete logic
const deleteLogic = `openConfirmDialog({
                              title: "Delete Cashier?",
                              description: "Are you sure you want to delete this cashier?",
                              confirmText: "Delete",
                              iconType: "danger",
                              onConfirm: async () => {
                                try {
                                  const res = await deleteCashierMutation.mutateAsync({ merCashierID: cashier.id });
                                  openGlobalPopup({
                                    title: "Success",
                                    description: res.message || "Cashier deleted successfully.",
                                    type: "success"
                                  });
                                } catch (err) {
                                  openGlobalPopup({
                                    title: "Error",
                                    description: err.message || "Failed to delete cashier.",
                                    type: "error"
                                  });
                                }
                              }
                            });`;

content = content.replace(
  /onClick=\{\(\) => \{\s*\/\/\s*TODO:\s*delete logic\s*console\.log\("Delete", cashier\);\s*\}\}/g,
  'onClick={() => {\n                            ' + deleteLogic + '\n                          }}'
);

content = content.replace(
  /openConfirmDialog\(\{\s*title: "Delete Cashier\?",[\s\S]*?console\.log\("Delete cashier:", cashier\.id\);\s*\}\s*\},\s*\}\);/,
  deleteLogic
);

fs.writeFileSync(file, content);
