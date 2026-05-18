import users from "../mocks/users";
import { successResponse, errorResponse, simulateDelay } from "../utils/responseHelper";
import { STORAGE_KEYS, MOCK_DELAYS } from "../utils/constants";

const STORAGE_TOKEN_KEY = STORAGE_KEYS.TOKEN;
const STORAGE_USER_KEY = STORAGE_KEYS.USER;

function generateFakeToken(user) {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = btoa(
    JSON.stringify({
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 86400,
    })
  );
  const signature = btoa("mock-signature-" + Date.now());
  return `${header}.${payload}.${signature}`;
}

function isTokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp < Math.floor(Date.now() / 1000);
  } catch {
    return true;
  }
}

const mockAuthService = {
  async login(email, password) {
    await simulateDelay(MOCK_DELAYS.MEDIUM);

    const user = users.find((u) => u.email === email);
    if (!user) {
      return errorResponse("Invalid email or password", 401);
    }
    if (user.password !== password) {
      return errorResponse("Invalid email or password", 401);
    }
    if (!user.isActive) {
      return errorResponse("Your account has been deactivated. Contact an administrator.", 403);
    }

    const token = generateFakeToken(user);

    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    };

    // BACKEND TODO: Replace with httpOnly cookie or real JWT stored in memory.
    // localStorage is used here only for mock/demo mode to persist session across refresh.
    localStorage.setItem(STORAGE_TOKEN_KEY, token);
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(userData));

    return successResponse({ user: userData, token }, "Login successful");
  },

  async logout() {
    await simulateDelay(MOCK_DELAYS.SHORT);
    // BACKEND TODO: Call logout endpoint to invalidate token on server side.
    localStorage.removeItem(STORAGE_TOKEN_KEY);
    localStorage.removeItem(STORAGE_USER_KEY);
    return successResponse(null, "Logged out successfully");
  },

  async getCurrentUser() {
    await simulateDelay(MOCK_DELAYS.SHORT);

    const token = localStorage.getItem(STORAGE_TOKEN_KEY);
    if (!token) {
      return errorResponse("No session found", 401);
    }

    if (isTokenExpired(token)) {
      localStorage.removeItem(STORAGE_TOKEN_KEY);
      localStorage.removeItem(STORAGE_USER_KEY);
      return errorResponse("Session expired. Please log in again.", 401);
    }

    const storedUser = localStorage.getItem(STORAGE_USER_KEY);
    if (!storedUser) {
      return errorResponse("No session found", 401);
    }

    return successResponse(JSON.parse(storedUser), "Session valid");
  },

  async refreshSession() {
    // BACKEND TODO: Implement real token refresh with refresh tokens.
    const result = await this.getCurrentUser();
    if (result.success) {
      const user = users.find((u) => u.id === result.data.id);
      if (user) {
        const newToken = generateFakeToken(user);
        localStorage.setItem(STORAGE_TOKEN_KEY, newToken);
      }
    }
    return result;
  },

  getStoredToken() {
    return localStorage.getItem(STORAGE_TOKEN_KEY);
  },

  isAuthenticated() {
    const token = localStorage.getItem(STORAGE_TOKEN_KEY);
    if (!token) return false;
    return !isTokenExpired(token);
  },
};

export default mockAuthService;
