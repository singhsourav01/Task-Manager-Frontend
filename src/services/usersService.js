import { apiRequest } from "../api/client";
import {
  successResponse,
  errorResponse,
  paginationMeta,
} from "../utils/responseHelper";
import { PAGINATION } from "../utils/constants";
import { mapUser, toApiRole } from "../utils/mappers";

const usersService = {
  async getUsers({
    page = PAGINATION.DEFAULT_PAGE,
    limit = PAGINATION.DEFAULT_LIMIT,
    search = "",
    role = "",
    status = "",
  } = {}) {
    const { ok, data } = await apiRequest(`/users?page=${page}&limit=${limit}`);
    if (!ok) return errorResponse(data.message || "Failed to fetch users");

    let users = (data.data || []).map(mapUser);

    if (search) {
      const s = search.toLowerCase();
      users = users.filter(
        (u) =>
          u.name.toLowerCase().includes(s) || u.email.toLowerCase().includes(s),
      );
    }
    if (role) {
      users = users.filter((u) => u.role === role);
    }
    if (status === "active") {
      users = users.filter((u) => u.isActive);
    } else if (status === "inactive") {
      users = users.filter((u) => !u.isActive);
    }

    const pagination =
      data.pagination || paginationMeta(page, limit, users.length);

    return successResponse(users, "Users fetched successfully", {
      page: pagination.page ?? page,
      limit: pagination.limit ?? limit,
      total: pagination.total ?? users.length,
      totalPages: pagination.totalPages ?? 1,
    });
  },
  async getActiveUsers({
    page = PAGINATION.DEFAULT_PAGE,
    limit = PAGINATION.DEFAULT_LIMIT,
    search = "",
    role = "",
    status = "",
  } = {}) {
    const { ok, data } = await apiRequest(
      `/active-users?page=${page}&limit=${limit}`,
    );
    if (!ok) return errorResponse(data.message || "Failed to fetch users");

    let users = (data.data || []).map(mapUser);

    if (search) {
      const s = search.toLowerCase();
      users = users.filter(
        (u) =>
          u.name.toLowerCase().includes(s) || u.email.toLowerCase().includes(s),
      );
    }
    if (role) {
      users = users.filter((u) => u.role === role);
    }
    if (status === "active") {
      users = users.filter((u) => u.isActive);
    } else if (status === "inactive") {
      users = users.filter((u) => !u.isActive);
    }

    const pagination =
      data.pagination || paginationMeta(page, limit, users.length);

    return successResponse(users, "Users fetched successfully", {
      page: pagination.page ?? page,
      limit: pagination.limit ?? limit,
      total: pagination.total ?? users.length,
      totalPages: pagination.totalPages ?? 1,
    });
  },
  async getUserById(id) {
    const { ok, data } = await apiRequest(`/user/${id}`);
    if (!ok) return errorResponse(data.message || "User not found", 404);
    return successResponse(mapUser(data.data), "User fetched successfully");
  },

  async createUser(userData) {
    const { ok, data } = await apiRequest("/user", {
      method: "POST",
      body: {
        name: userData.name,
        email: userData.email,
        password: userData.password || "Temp@123",
        role: toApiRole(userData.role),
      },
    });
    if (!ok) return errorResponse(data.message || "Failed to create user");
    return successResponse(
      mapUser(data.data),
      data.message || "User created successfully",
    );
  },

  async updateUser(id, userData) {
    if (userData.role) {
      const roleRes = await apiRequest(`/user/${id}/role`, {
        method: "PUT",
        body: { role: toApiRole(userData.role) },
      });
      if (!roleRes.ok) {
        return errorResponse(roleRes.data.message || "Failed to update role");
      }
    }

    if (userData.isActive !== undefined) {
      const statusRes = await apiRequest(`/user/${id}/status`, {
        method: "PUT",
        body: { isActive: userData.isActive },
      });
      if (!statusRes.ok) {
        return errorResponse(
          statusRes.data.message || "Failed to update status",
        );
      }
    }

    if (userData.password) {
      const pwdRes = await apiRequest(`/user/${id}/reset-password`, {
        method: "PUT",
        body: { newPassword: userData.password },
      });
      if (!pwdRes.ok) {
        return errorResponse(pwdRes.data.message || "Failed to reset password");
      }
    }

    return this.getUserById(id);
  },

  async toggleUserActive(id) {
    const current = await this.getUserById(id);
    if (!current.success) return current;

    const { ok, data } = await apiRequest(`/user/${id}/status`, {
      method: "PUT",
      body: { isActive: !current.data.isActive },
    });
    if (!ok)
      return errorResponse(data.message || "Failed to toggle user status");
    return successResponse(
      mapUser(data.data),
      current.data.isActive
        ? "User deactivated successfully"
        : "User activated successfully",
    );
  },

  async deleteUser(id) {
    const { ok, data } = await apiRequest(`/user/${id}`, { method: "DELETE" });
    if (!ok) return errorResponse(data.message || "Failed to delete user");
    return successResponse(null, data.message || "User deleted successfully");
  },
};

export default usersService;
