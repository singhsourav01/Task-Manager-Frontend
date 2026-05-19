import { apiRequest } from "../api/client";
import { successResponse, errorResponse } from "../utils/responseHelper";
import { fromApiProjectStatus, fromApiTaskStatus, fromApiPriority } from "../utils/mappers";

const STATUS_COLORS = {
  planning: "#3b82f6",
  active: "#22c55e",
  "on-hold": "#eab308",
  completed: "#6b7280",
};

const dashboardService = {
  async getStats() {
    const [projectRes, taskRes, usersRes] = await Promise.all([
      apiRequest("/project/stats"),
      apiRequest("/task/stats"),
      apiRequest("/users?limit=100"),
    ]);

    if (!projectRes.ok || !taskRes.ok) {
      return errorResponse("Failed to load dashboard stats");
    }

    const projectStats = projectRes.data.data;
    const taskStats = taskRes.data.data;
    const users = usersRes.ok ? usersRes.data.data || [] : [];

    const statusCounts = projectStats.statusCounts || [];
    const activeProjects =
      statusCounts.find((s) => s.status === "ACTIVE")?.count || 0;

    const tasksByStatus = {};
    (taskStats.statusCounts || []).forEach((item) => {
      const key = fromApiTaskStatus(item.status);
      tasksByStatus[key] = (tasksByStatus[key] || 0) + item.count;
    });

    const tasksByPriority = {};
    (taskStats.priorityCounts || []).forEach((item) => {
      const key = fromApiPriority(item.priority);
      tasksByPriority[key] = (tasksByPriority[key] || 0) + item.count;
    });

    const projectStatusDistribution = statusCounts.map((item) => ({
      name: fromApiProjectStatus(item.status)
        .replace("-", " ")
        .replace(/\b\w/g, (c) => c.toUpperCase()),
      value: item.count,
      color: STATUS_COLORS[fromApiProjectStatus(item.status)] || "#6366f1",
    }));

    const stats = {
      totalProjects: projectStats.total || 0,
      activeProjects,
      totalTasks: taskStats.total || 0,
      activeUsers: users.filter((u) => u.isActive).length,
      tasksByStatus,
      tasksByPriority,
      projectStatusDistribution,
      taskCompletionTrend: [
        { month: "Jan", created: 0, completed: 0 },
        { month: "Feb", created: 0, completed: 0 },
        { month: "Mar", created: 0, completed: 0 },
        { month: "Apr", created: taskStats.total || 0, completed: tasksByStatus.completed || 0 },
        { month: "May", created: taskStats.total || 0, completed: tasksByStatus.completed || 0 },
      ],
      recentActivities: [],
    };

    return successResponse(stats, "Dashboard stats fetched successfully");
  },
};

export default dashboardService;
