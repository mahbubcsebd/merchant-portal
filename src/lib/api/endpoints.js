import { post, get } from "./api";

// Fetch User Profile
export async function getProfile(payload = {}) {
  return post("/getProfile", payload);
}

// Fetch Portal Notifications
export async function getPortalNotifications(payload = {}) {
  return post("/getPortalNotifications", payload);
}

// Fetch Account/Dashboard Info
export async function getDashboardInfo(payload = {}) {
  return post("/getDashboardInfo", payload);
}

// Fetch Transaction History
export async function transactionHistory(payload = {}) {
  return post("/transactionHistory", payload);
}

// User Authentication / Login
export async function loginWithPin(payload = {}) {
  return post("/loginWithPin", payload);
}

// Verify OTP
export async function verifyOTP(payload = {}) {
  return post("/verifyOTP", payload);
}

// Logout
export async function logout(payload = {}) {
  return post("/logout", payload);
}

// Welcome API
export async function welcomeApi(payload = {}) {
  return post("/welcome", payload);
}

// Branch Management APIs
export async function listBranches(payload = {}) {
  return post("/listBranches", payload);
}

export async function createBranch(payload = {}) {
  return post("/createBranch", payload);
}

export async function updateBranch(payload = {}) {
  return post("/updateBranch", payload);
}

export async function deleteBranch(payload = {}) {
  return post("/deleteBranch", payload);
}

// Profile & Settlement Accounts APIs
export async function updateProfile(payload = {}) {
  return post("/updateProfile", payload);
}

export async function getBanks(payload = {}) {
  return post("/getBanks", payload);
}

export async function getAccountTitle(payload = {}) {
  return post("/getAccountTitle", payload);
}

export async function createUserSetAccount(payload = {}) {
  return post("/createUserSetAccount", payload);
}

export async function updateUserSetAccount(payload = {}) {
  return post("/updateUserSetAccount", payload);
}

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

// Forgot Wallet PIN
export async function forgotPin(payload = {}) {
  return post("/forgotPin", payload);
}

// Register Merchant (Enroll Step 1 / Submit)
export async function registerMerchant(payload = {}) {
  return post("/register", payload);
}

// Verify Merchant OTP (Enroll Step 2)
export async function verifyMerchantOTP(payload = {}) {
  return post("/verifyMerchantOTP", payload);
}

// Resend OTP
export async function resendOTP(payload = {}) {
  return post("/resendOTP", payload);
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

export async function updateUserBiller(payload = {}) {
  return post("/updateUserBiller", payload);
}

export async function deleteUserBiller(payload = {}) {
  return post("/deleteUserBiller", payload);
}

// -------------------------------------------------------
// Cashier APIs
// -------------------------------------------------------
export async function createCashier(payload = {}) {
  return post("/createCashier", payload);
}

export async function getCashierPermssionList(payload = {}) {
  return post("/getCashierPermssionList", payload);
}

export async function saveMerchantCashierPermission(payload = {}) {
  return post("/saveMerchantCashierPermission", payload);
}

export async function unenrollCashier(payload = {}) {
  return post("/unenrollCashier", payload);
}
