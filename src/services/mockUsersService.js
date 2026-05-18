import users from "../mocks/users";
import { successResponse, errorResponse, simulateDelay, paginationMeta } from "../utils/responseHelper";
import { MOCK_DELAYS, PAGINATION } from "../utils/constants";

let usersData = [...users.map((u) => ({ ...u }))];
let nextId = "u" + (usersData.length + 1);

const mockUsersService = {
  async getUsers({ page = PAGINATION.DEFAULT_PAGE, limit = PAGINATION.DEFAULT_LIMIT, search = "", role = "", status = "" } = {}) {
    await simulateDelay(MOCK_DELAYS.MEDIUM);

    let filtered = [...usersData];

    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(
        (u) => u.name.toLowerCase().includes(s) || u.email.toLowerCase().includes(s)
      );
    }

    if (role) {
      filtered = filtered.filter((u) => u.role === role);
    }

    if (status === "active") {
      filtered = filtered.filter((u) => u.isActive);
    } else if (status === "inactive") {
      filtered = filtered.filter((u) => !u.isActive);
    }

    const total = filtered.length;
    const start = (page - 1) * limit;
    const paginated = filtered.slice(start, start + limit);

    const sanitized = paginated.map(({ password, ...rest }) => rest);

    return successResponse(sanitized, "Users fetched successfully", paginationMeta(page, limit, total));
  },

  async getUserById(id) {
    await simulateDelay(MOCK_DELAYS.SHORT);
    const user = usersData.find((u) => u.id === id);
    if (!user) return errorResponse("User not found", 404);
    const { password, ...safeUser } = user;
    return successResponse(safeUser, "User fetched successfully");
  },

  async createUser(userData) {
    await simulateDelay(MOCK_DELAYS.MEDIUM);

    const exists = usersData.find((u) => u.email === userData.email);
    if (exists) {
      return errorResponse("A user with this email already exists", 409);
    }

    const newUser = {
      id: nextId,
      name: userData.name,
      email: userData.email,
      password: userData.password || "Temp@123",
      role: userData.role || "developer",
      isActive: userData.isActive !== undefined ? userData.isActive : true,
      avatar: "/avatars/default.png",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    nextId = "u" + (parseInt(nextId.slice(1)) + 1);
    usersData.push(newUser);

    const { password, ...safeUser } = newUser;
    return successResponse(safeUser, "User created successfully");
  },

  async updateUser(id, userData) {
    await simulateDelay(MOCK_DELAYS.MEDIUM);

    const index = usersData.findIndex((u) => u.id === id);
    if (index === -1) return errorResponse("User not found", 404);

    if (userData.email && userData.email !== usersData[index].email) {
      const exists = usersData.find((u) => u.email === userData.email && u.id !== id);
      if (exists) {
        return errorResponse("A user with this email already exists", 409);
      }
    }

    usersData[index] = {
      ...usersData[index],
      ...userData,
      id,
      updatedAt: new Date().toISOString(),
    };

    if (userData.password === "" || !userData.password) {
      delete usersData[index].password;
      usersData[index].password = usersData[index].password;
    }

    const { password, ...safeUser } = usersData[index];
    return successResponse(safeUser, "User updated successfully");
  },

  async toggleUserActive(id) {
    await simulateDelay(MOCK_DELAYS.SHORT);

    const index = usersData.findIndex((u) => u.id === id);
    if (index === -1) return errorResponse("User not found", 404);

    usersData[index].isActive = !usersData[index].isActive;
    usersData[index].updatedAt = new Date().toISOString();

    const { password, ...safeUser } = usersData[index];
    return successResponse(safeUser, `User ${usersData[index].isActive ? "activated" : "deactivated"} successfully`);
  },

  async deleteUser(id) {
    await simulateDelay(MOCK_DELAYS.SHORT);

    const index = usersData.findIndex((u) => u.id === id);
    if (index === -1) return errorResponse("User not found", 404);

    usersData.splice(index, 1);
    return successResponse(null, "User deleted successfully");
  },

  getUsersSync() {
    return usersData.map(({ password, ...rest }) => rest);
  },
};

export default mockUsersService;
