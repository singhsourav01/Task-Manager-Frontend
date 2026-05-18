import projects from "../mocks/projects";
import { successResponse, errorResponse, simulateDelay, paginationMeta } from "../utils/responseHelper";
import { MOCK_DELAYS, PAGINATION } from "../utils/constants";

let projectsData = [...projects.map((p) => ({ ...p, members: [...p.members] }))];
let nextId = "p" + (projectsData.length + 1);

const mockProjectsService = {
  async getProjects({ page = PAGINATION.DEFAULT_PAGE, limit = PAGINATION.DEFAULT_LIMIT, search = "", status = "", userId = null } = {}) {
    await simulateDelay(MOCK_DELAYS.MEDIUM);

    let filtered = [...projectsData];

    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(
        (p) => p.name.toLowerCase().includes(s) || p.description.toLowerCase().includes(s)
      );
    }

    if (status) {
      filtered = filtered.filter((p) => p.status === status);
    }

    if (userId) {
      filtered = filtered.filter(
        (p) => p.createdBy === userId || p.members.includes(userId)
      );
    }

    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const total = filtered.length;
    const start = (page - 1) * limit;
    const paginated = filtered.slice(start, start + limit);

    return successResponse(paginated, "Projects fetched successfully", paginationMeta(page, limit, total));
  },

  async getProjectById(id) {
    await simulateDelay(MOCK_DELAYS.SHORT);
    const project = projectsData.find((p) => p.id === id);
    if (!project) return errorResponse("Project not found", 404);
    return successResponse({ ...project, members: [...project.members] }, "Project fetched successfully");
  },

  async createProject(projectData) {
    await simulateDelay(MOCK_DELAYS.MEDIUM);

    const newProject = {
      id: nextId,
      name: projectData.name,
      description: projectData.description,
      status: projectData.status || "planning",
      startDate: projectData.startDate,
      endDate: projectData.endDate,
      createdBy: projectData.createdBy,
      members: projectData.members || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    nextId = "p" + (parseInt(nextId.slice(1)) + 1);
    projectsData.push(newProject);

    return successResponse(newProject, "Project created successfully");
  },

  async updateProject(id, projectData) {
    await simulateDelay(MOCK_DELAYS.MEDIUM);

    const index = projectsData.findIndex((p) => p.id === id);
    if (index === -1) return errorResponse("Project not found", 404);

    projectsData[index] = {
      ...projectsData[index],
      ...projectData,
      id,
      members: projectData.members !== undefined ? projectData.members : projectsData[index].members,
      updatedAt: new Date().toISOString(),
    };

    return successResponse(projectsData[index], "Project updated successfully");
  },

  async deleteProject(id) {
    await simulateDelay(MOCK_DELAYS.SHORT);

    const index = projectsData.findIndex((p) => p.id === id);
    if (index === -1) return errorResponse("Project not found", 404);

    projectsData.splice(index, 1);
    return successResponse(null, "Project deleted successfully");
  },

  async assignMembers(projectId, memberIds) {
    await simulateDelay(MOCK_DELAYS.SHORT);

    const index = projectsData.findIndex((p) => p.id === projectId);
    if (index === -1) return errorResponse("Project not found", 404);

    const currentMembers = projectsData[index].members;
    const newMembers = [...new Set([...currentMembers, ...memberIds])];
    projectsData[index].members = newMembers;
    projectsData[index].updatedAt = new Date().toISOString();

    return successResponse(projectsData[index], "Members assigned successfully");
  },

  async removeMember(projectId, userId) {
    await simulateDelay(MOCK_DELAYS.SHORT);

    const index = projectsData.findIndex((p) => p.id === projectId);
    if (index === -1) return errorResponse("Project not found", 404);

    projectsData[index].members = projectsData[index].members.filter((m) => m !== userId);
    projectsData[index].updatedAt = new Date().toISOString();

    return successResponse(projectsData[index], "Member removed successfully");
  },

  async getProjectsByUser(userId) {
    await simulateDelay(MOCK_DELAYS.SHORT);
    const userProjects = projectsData.filter(
      (p) => p.createdBy === userId || p.members.includes(userId)
    );
    return successResponse(userProjects, "Projects fetched successfully");
  },

  getProjectsSync() {
    return [...projectsData];
  },
};

export default mockProjectsService;
