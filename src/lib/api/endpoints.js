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
