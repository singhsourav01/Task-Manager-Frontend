import { apiRequest } from "../api/client";
import { successResponse, errorResponse, paginationMeta } from "../utils/responseHelper";
import { PAGINATION } from "../utils/constants";
import {
  mapProject,
  toApiProjectStatus,
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

const projectsService = {
  async getProjects({
    page = PAGINATION.DEFAULT_PAGE,
    limit = PAGINATION.DEFAULT_LIMIT,
    search = "",
    status = "",
    userId = null,
  } = {}) {
    const path = userId ? "/project/my-projects" : "/project";
    const query = buildQuery({
      page,
      limit,
      search,
      status: status ? toApiProjectStatus(status) : "",
      createdUserId: userId || undefined,
    });

    const { ok, data } = await apiRequest(`${path}${query}`);
    if (!ok) return errorResponse(data.message || "Failed to fetch projects");

    const projects = (data.data || []).map(mapProject);
    const pagination = data.pagination || paginationMeta(page, limit, projects.length);

    return successResponse(projects, "Projects fetched successfully", {
      page: pagination.page ?? page,
      limit: pagination.limit ?? limit,
      total: pagination.total ?? projects.length,
      totalPages: pagination.totalPages ?? 1,
    });
  },

  async getProjectById(id) {
    const { ok, data } = await apiRequest(`/project/${id}`);
    if (!ok) return errorResponse(data.message || "Project not found", 404);

    const project = mapProject(data.data);
    const membersRes = await apiRequest(`/project/${id}/members`);
    if (membersRes.ok && membersRes.data.data) {
      project.memberDetails = membersRes.data.data.map((m) => ({
        id: m.user?.id || m.userId,
        name: m.user?.name,
        email: m.user?.email,
        role: m.user?.role?.toLowerCase(),
      }));
      project.members = project.memberDetails.map((m) => m.id);
    }

    return successResponse(project, "Project fetched successfully");
  },

  async createProject(projectData) {
    const { ok, data } = await apiRequest("/project", {
      method: "POST",
      body: {
        name: projectData.name,
        description: projectData.description,
        startDate: projectData.startDate,
        endDate: projectData.endDate,
      },
    });

    if (!ok) return errorResponse(data.message || "Failed to create project");

    const project = mapProject(data.data);

    if (projectData.members?.length) {
      await apiRequest("/project/members", {
        method: "POST",
        body: { projectId: project.id, userIds: projectData.members },
      });
      return this.getProjectById(project.id);
    }

    return successResponse(project, data.message || "Project created successfully");
  },

  async updateProject(id, projectData) {
    const { ok, data } = await apiRequest(`/project/${id}`, {
      method: "PUT",
      body: {
        name: projectData.name,
        description: projectData.description,
        status: projectData.status ? toApiProjectStatus(projectData.status) : undefined,
        startDate: projectData.startDate,
        endDate: projectData.endDate,
      },
    });

    if (!ok) return errorResponse(data.message || "Failed to update project");

    if (projectData.members) {
      const current = await this.getProjectById(id);
      if (current.success) {
        const existing = new Set(current.data.members);
        const desired = new Set(projectData.members);
        const toAdd = [...desired].filter((uid) => !existing.has(uid));
        const toRemove = [...existing].filter((uid) => !desired.has(uid));

        if (toAdd.length) {
          await apiRequest("/project/members", {
            method: "POST",
            body: { projectId: id, userIds: toAdd },
          });
        }
        for (const uid of toRemove) {
          await apiRequest(`/project/${id}/members`, {
            method: "DELETE",
            body: { userId: uid },
          });
        }
      }
      return this.getProjectById(id);
    }

    return successResponse(mapProject(data.data), data.message || "Project updated successfully");
  },

  async deleteProject(id) {
    const { ok, data } = await apiRequest(`/project/${id}`, { method: "DELETE" });
    if (!ok) return errorResponse(data.message || "Failed to delete project");
    return successResponse(null, data.message || "Project deleted successfully");
  },

  async assignMembers(projectId, memberIds) {
    const { ok, data } = await apiRequest("/project/members", {
      method: "POST",
      body: { projectId, userIds: memberIds },
    });
    if (!ok) return errorResponse(data.message || "Failed to assign members");
    return this.getProjectById(projectId);
  },

  async removeMember(projectId, userId) {
    const { ok, data } = await apiRequest(`/project/${projectId}/members`, {
      method: "DELETE",
      body: { userId },
    });
    if (!ok) return errorResponse(data.message || "Failed to remove member");
    return this.getProjectById(projectId);
  },

  async getProjectsByUser(userId) {
    return this.getProjects({ userId, limit: 100 });
  },
};

export default projectsService;
