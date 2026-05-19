import { apiRequest } from "../api/client";
import { successResponse, errorResponse, paginationMeta } from "../utils/responseHelper";
import { PAGINATION } from "../utils/constants";
import {
  mapTask,
  toApiTaskStatus,
  toApiPriority,
} from "../utils/mappers";

function buildQuery(params) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, String(value));
    }
  });
  const qs = query.toString();
  return qs ? `?${qs}` : "";
}

function taskPayload(taskData, isCreate = false) {
  const startDate = taskData.startDate || taskData.dueDate;
  const endDate = taskData.endDate || taskData.dueDate;
  const payload = {
    projectId: taskData.projectId,
    name: taskData.title || taskData.name,
    description: taskData.description,
    priority: taskData.priority ? toApiPriority(taskData.priority) : undefined,
    startDate,
    endDate,
    assignedTo: taskData.assignedTo || undefined,
  };
  if (!isCreate && taskData.status) {
    payload.status = toApiTaskStatus(taskData.status);
  }
  return payload;
}

const tasksService = {
  async getTasks({
    page = PAGINATION.DEFAULT_PAGE,
    limit = PAGINATION.DEFAULT_LIMIT,
    search = "",
    status = "",
    priority = "",
    projectId = "",
    assignedTo = "",
    userId = "",
  } = {}) {
    const path = userId && !assignedTo ? "/task/my-tasks" : "/task";
    const query = buildQuery({
      page,
      limit,
      search,
      status: status ? toApiTaskStatus(status) : "",
      priority: priority ? toApiPriority(priority) : "",
      projectId,
      assignedTo: assignedTo || undefined,
    });

    const { ok, data } = await apiRequest(`${path}${query}`);
    if (!ok) return errorResponse(data.message || "Failed to fetch tasks");

    const tasks = (data.data || []).map(mapTask);
    const pagination = data.pagination || paginationMeta(page, limit, tasks.length);

    return successResponse(tasks, "Tasks fetched successfully", {
      page: pagination.page ?? page,
      limit: pagination.limit ?? limit,
      total: pagination.total ?? tasks.length,
      totalPages: pagination.totalPages ?? 1,
    });
  },

  async getTaskById(id) {
    const { ok, data } = await apiRequest(`/task/${id}`);
    if (!ok) return errorResponse(data.message || "Task not found", 404);
    return successResponse(mapTask(data.data), "Task fetched successfully");
  },

  async createTask(taskData) {
    const { ok, data } = await apiRequest("/task", {
      method: "POST",
      body: taskPayload(taskData, true),
    });
    if (!ok) return errorResponse(data.message || "Failed to create task");
    return successResponse(mapTask(data.data), data.message || "Task created successfully");
  },

  async updateTask(id, taskData) {
    const { ok, data } = await apiRequest(`/task/${id}`, {
      method: "PUT",
      body: taskPayload(taskData),
    });
    if (!ok) return errorResponse(data.message || "Failed to update task");
    return successResponse(mapTask(data.data), data.message || "Task updated successfully");
  },

  async deleteTask(id) {
    const { ok, data } = await apiRequest(`/task/${id}`, { method: "DELETE" });
    if (!ok) return errorResponse(data.message || "Failed to delete task");
    return successResponse(null, data.message || "Task deleted successfully");
  },

  async updateTaskStatus(id, status) {
    const { ok, data } = await apiRequest(`/task/${id}/status`, {
      method: "PATCH",
      body: { status: toApiTaskStatus(status) },
    });
    if (!ok) return errorResponse(data.message || "Failed to update status");
    return successResponse(mapTask(data.data), data.message || "Task status updated successfully");
  },

  async getTasksByProject(projectId) {
    const result = await this.getTasks({ projectId, limit: 100 });
    return result;
  },

  async getTasksByUser(userId) {
    return this.getTasks({ userId, limit: 100 });
  },
};

export default tasksService;
