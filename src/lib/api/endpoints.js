import { post, get, postBlob } from "./api";

// -------------------------------------------------------
// API Endpoints
// -------------------------------------------------------

// Welcome (Boot up)
export async function welcomeApi(payload = {}) {
  return post("/welcome", payload);
}

// Authenticate / Login
export async function loginWithPin(payload = {}) {
  return post("/loginWithPin", payload);
}

// Verify OTP
export async function verifyOTP(payload = {}) {
  return post("/verifyOTP", payload);
}

// Get User Profile
export async function getUserProfile(payload = {}) {
  return post("/getUserProfile", payload);
}

// Get Accounts
export async function getAccounts(payload = {}) {
  return post("/getAccounts", payload);
}

// Get Dashboard Info
export async function getDashboardInfo(payload = {}) {
  return post("/getDashboardInfo", payload);
}

// Get Portal Notifications
export async function getPortalNotifications(payload = {}) {
  return post("/getPortalNotifications", payload);
}

// Get Transaction History
export async function transactionHistory(payload = {}) {
  return post("/transactionHistory", payload);
}

export async function getSubsidiaries(payload = {}) {
  return post("/getSubsidiaries", payload);
}

export async function createSubsidiary(payload = {}) {
  return post("/createSubsidiary", payload);
}

export async function deleteSubsidiary(payload = {}) {
  return post(`/deleteSubsidiary?subId=${payload.subId}`, payload);
}

export async function modifySubsidiary(payload = {}) {
  return post("/modifySubsidiary", payload);
}

export async function uploadDocument(payload = {}) {
  return post("/uploadDocument", payload);
}

export async function getCashierList(payload = {}) {
  return post("/getCashierList", payload);
}

export async function listOfTerminal(payload = {}) {
  return post("/listOfTerminal", payload);
}

export async function generateReportMerchantSettlement(payload = {}) {
  return postBlob("/generateReportMerchantSettlement", payload);
}

export async function generateReportMerchantRefund(payload = {}) {
  return postBlob("/generateReportMerchantRefund", payload);
}

export async function generateReportBalanceStatement(payload = {}) {
  return postBlob("/generateReportBalanceStatement", payload);
}

// Get Document Content
export async function getDocumentContent(payload = {}) {
  return post("/getDocumentContent", payload);
}

// Logout
export async function logout(payload = {}) {
  return post("/logout", payload);
}

// Update User Profile
export async function updateProfile(payload = {}) {
  return post("/updateProfile", payload);
}

// Load User Profile (Fresh Data)
export async function loadUserProfile(payload = {}) {
  return post("/loadUserProfile", payload);
}

// Get Beneficiaries
export async function getBeneficiaries(payload = {}) {
  return post("/getBeneficiaries", payload);
}

// Get Transaction Limits
export async function getTransactionLimits(payload = {}) {
  return post("/getTransactionLimits", payload);
}

// Get User Settlement Accounts
export async function getUserSetAccounts(payload = {}) {
  return post("/getUserSetAccounts", payload);
}

// Create User Settlement Account
export async function createUserSetAccount(payload = {}) {
  return post("/createUserSetAccount", payload);
}

// Update User Settlement Account
export async function updateUserSetAccount(payload = {}) {
  return post("/updateUserSetAccount", payload);
}

// Delete User Settlement Account
export async function deleteUserSetAccount(payload = {}) {
  return post("/deleteUserSetAccount", payload);
}

// Load Alert Notification Settings
export async function loadAlertNotificationSetting(payload = {}) {
  return post("/loadAlertNotificationSetting", payload);
}

// Update Alert Notification Settings
export async function updateAlertNotification(payload = {}) {
  return post("/updateAlertNotification", payload);
}

// Update User Preferred Language
export async function updateLanguage(payload = {}) {
  return post("/updateLanguage", payload);
}

// Get Translation Language Packs
export async function getLangPack(payload = {}) {
  return post("/getLangPack", payload);
}

// Change User Wallet PIN
export async function changePIN(payload = {}) {
  return post("/changePIN", payload);
}

// -------------------------------------------------------
// Pay Bills / Transfers APIs
// -------------------------------------------------------

export async function getUserBiller(payload = {}) {
  return post("/getUserBiller", payload);
}

export async function getBillerByBillId(payload = {}) {
  return post("/getBillerByBillId", payload);
}

export async function calculateFees(payload = {}) {
  return post("/calculateFees", payload);
}

export async function payBills(payload = {}) {
  return post("/payBills", payload);
}

export async function createUserBiller(payload = {}) {
  return post("/createUserBiller", payload);
}

export async function getBillers(payload = {}) {
  return post("/getBillers", payload);
}
