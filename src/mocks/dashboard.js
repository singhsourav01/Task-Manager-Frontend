const dashboardStats = {
  totalProjects: 6,
  activeProjects: 3,
  totalTasks: 12,
  tasksByStatus: {
    todo: 3,
    "in-progress": 3,
    completed: 4,
    "on-hold": 1,
  },
  tasksByPriority: {
    high: 6,
    medium: 4,
    low: 1,
  },
  totalUsers: 8,
  activeUsers: 7,
  recentActivities: [
    {
      id: "a1",
      type: "task_update",
      message: "Developer One updated task 'Implement responsive navbar' to in-progress",
      timestamp: "2025-03-20T10:00:00.000Z",
      userId: "u3",
    },
    {
      id: "a2",
      type: "task_complete",
      message: "Alice Johnson completed task 'Design landing page mockups'",
      timestamp: "2025-03-14T16:00:00.000Z",
      userId: "u4",
    },
    {
      id: "a3",
      type: "project_create",
      message: "Manager One created project 'Mobile App Development'",
      timestamp: "2025-03-20T09:00:00.000Z",
      userId: "u2",
    },
    {
      id: "a4",
      type: "user_join",
      message: "Eve Davis joined project 'Internal Dashboard'",
      timestamp: "2025-02-01T08:00:00.000Z",
      userId: "u8",
    },
    {
      id: "a5",
      type: "task_create",
      message: "Admin User created task 'Database migration scripts'",
      timestamp: "2025-05-01T10:00:00.000Z",
      userId: "u1",
    },
    {
      id: "a6",
      type: "project_create",
      message: "Admin User created project 'Legacy System Migration'",
      timestamp: "2025-05-01T09:00:00.000Z",
      userId: "u1",
    },
  ],
  taskCompletionTrend: [
    { month: "Jan", completed: 2, created: 3 },
    { month: "Feb", completed: 1, created: 2 },
    { month: "Mar", completed: 3, created: 2 },
    { month: "Apr", completed: 1, created: 3 },
    { month: "May", completed: 0, created: 2 },
  ],
  projectStatusDistribution: [
    { name: "Active", value: 3, color: "#22c55e" },
    { name: "On Hold", value: 1, color: "#eab308" },
    { name: "Planning", value: 1, color: "#3b82f6" },
    { name: "Completed", value: 1, color: "#6b7280" },
  ],
};

export default dashboardStats;
