import { post, get } from "./api";

// -------------------------------------------------------
// API Endpoints
// -------------------------------------------------------

// Authenticate / Login
export async function authenticateUser(payload = {}) {
  return post("/authenticate", { custType: "1", ...payload });
}
