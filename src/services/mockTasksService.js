import tasks from "../mocks/tasks";
import { successResponse, errorResponse, simulateDelay, paginationMeta } from "../utils/responseHelper";
import { MOCK_DELAYS, PAGINATION } from "../utils/constants";

let tasksData = [...tasks.map((t) => ({ ...t }))];
let nextId = "t" + (tasksData.length + 1);

const mockTasksService = {
  async getTasks({ page = PAGINATION.DEFAULT_PAGE, limit = PAGINATION.DEFAULT_LIMIT, search = "", status = "", priority = "", projectId = "", assignedTo = "", userId = "" } = {}) {
    await simulateDelay(MOCK_DELAYS.MEDIUM);

    let filtered = [...tasksData];

    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(
        (t) => t.title.toLowerCase().includes(s) || t.description.toLowerCase().includes(s)
      );
    }

    if (status) {
      filtered = filtered.filter((t) => t.status === status);
    }

    if (priority) {
      filtered = filtered.filter((t) => t.priority === priority);
    }

    if (projectId) {
      filtered = filtered.filter((t) => t.projectId === projectId);
    }

    if (assignedTo) {
      filtered = filtered.filter((t) => t.assignedTo === assignedTo);
    }

    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const total = filtered.length;
    const start = (page - 1) * limit;
    const paginated = filtered.slice(start, start + limit);

    return successResponse(paginated, "Tasks fetched successfully", paginationMeta(page, limit, total));
  },

  async getTaskById(id) {
    await simulateDelay(MOCK_DELAYS.SHORT);
    const task = tasksData.find((t) => t.id === id);
    if (!task) return errorResponse("Task not found", 404);
    return successResponse({ ...task }, "Task fetched successfully");
  },

  async createTask(taskData) {
    await simulateDelay(MOCK_DELAYS.MEDIUM);

    const newTask = {
      id: nextId,
      title: taskData.title,
      description: taskData.description,
      status: taskData.status || "todo",
      priority: taskData.priority || "medium",
      projectId: taskData.projectId,
      assignedTo: taskData.assignedTo || null,
      createdBy: taskData.createdBy,
      dueDate: taskData.dueDate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    nextId = "t" + (parseInt(nextId.slice(1)) + 1);
    tasksData.push(newTask);

    return successResponse(newTask, "Task created successfully");
  },

  async updateTask(id, taskData) {
    await simulateDelay(MOCK_DELAYS.MEDIUM);

    const index = tasksData.findIndex((t) => t.id === id);
    if (index === -1) return errorResponse("Task not found", 404);

    tasksData[index] = {
      ...tasksData[index],
      ...taskData,
      id,
      updatedAt: new Date().toISOString(),
    };

    return successResponse(tasksData[index], "Task updated successfully");
  },

  async deleteTask(id) {
    await simulateDelay(MOCK_DELAYS.SHORT);

    const index = tasksData.findIndex((t) => t.id === id);
    if (index === -1) return errorResponse("Task not found", 404);

    tasksData.splice(index, 1);
    return successResponse(null, "Task deleted successfully");
  },

  async updateTaskStatus(id, status) {
    await simulateDelay(MOCK_DELAYS.SHORT);

    const index = tasksData.findIndex((t) => t.id === id);
    if (index === -1) return errorResponse("Task not found", 404);

    tasksData[index].status = status;
    tasksData[index].updatedAt = new Date().toISOString();

    return successResponse(tasksData[index], "Task status updated successfully");
  },

  async getTasksByProject(projectId) {
    await simulateDelay(MOCK_DELAYS.SHORT);
    const projectTasks = tasksData.filter((t) => t.projectId === projectId);
    return successResponse(projectTasks, "Tasks fetched successfully");
  },

  async getTasksByUser(userId) {
    await simulateDelay(MOCK_DELAYS.SHORT);
    const userTasks = tasksData.filter((t) => t.assignedTo === userId);
    return successResponse(userTasks, "Tasks fetched successfully");
  },

  getTasksSync() {
    return [...tasksData];
  },
};

export default mockTasksService;
