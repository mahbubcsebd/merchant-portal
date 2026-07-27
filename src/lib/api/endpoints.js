import { post, get } from "./api";

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

// Get Document Content
export async function getDocumentContent(payload = {}) {
  return post("/getDocumentContent", payload);
}

// Logout
export async function logout(payload = {}) {
  return post("/logout", payload);
}
