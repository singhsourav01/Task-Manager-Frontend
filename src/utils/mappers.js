import { ROLES, PROJECT_STATUS, TASK_STATUS, TASK_PRIORITY } from "./constants";

const ROLE_TO_API = {
  [ROLES.ADMIN]: "ADMIN",
  [ROLES.MANAGER]: "MANAGER",
  [ROLES.DEVELOPER]: "DEVELOPER",
};

const ROLE_FROM_API = {
  ADMIN: ROLES.ADMIN,
  MANAGER: ROLES.MANAGER,
  DEVELOPER: ROLES.DEVELOPER,
};

const PROJECT_STATUS_TO_API = {
  [PROJECT_STATUS.PLANNING]: "PLANNED",
  [PROJECT_STATUS.ACTIVE]: "ACTIVE",
  [PROJECT_STATUS.ON_HOLD]: "ON_HOLD",
  [PROJECT_STATUS.COMPLETED]: "COMPLETED",
};

const PROJECT_STATUS_FROM_API = {
  PLANNED: PROJECT_STATUS.PLANNING,
  ACTIVE: PROJECT_STATUS.ACTIVE,
  ON_HOLD: PROJECT_STATUS.ON_HOLD,
  COMPLETED: PROJECT_STATUS.COMPLETED,
};

const TASK_STATUS_TO_API = {
  [TASK_STATUS.TODO]: "TODO",
  [TASK_STATUS.IN_PROGRESS]: "IN_PROGRESS",
  [TASK_STATUS.ON_HOLD]: "REVIEW",
  [TASK_STATUS.COMPLETED]: "COMPLETED",
};

const TASK_STATUS_FROM_API = {
  TODO: TASK_STATUS.TODO,
  IN_PROGRESS: TASK_STATUS.IN_PROGRESS,
  REVIEW: TASK_STATUS.ON_HOLD,
  COMPLETED: TASK_STATUS.COMPLETED,
};

const PRIORITY_TO_API = {
  [TASK_PRIORITY.HIGH]: "HIGH",
  [TASK_PRIORITY.MEDIUM]: "MEDIUM",
  [TASK_PRIORITY.LOW]: "LOW",
};

const PRIORITY_FROM_API = {
  HIGH: TASK_PRIORITY.HIGH,
  MEDIUM: TASK_PRIORITY.MEDIUM,
  LOW: TASK_PRIORITY.LOW,
};

export function toApiRole(role) {
  return ROLE_TO_API[role] || role?.toUpperCase();
}

export function fromApiRole(role) {
  return ROLE_FROM_API[role] || role?.toLowerCase();
}

export function toApiProjectStatus(status) {
  return PROJECT_STATUS_TO_API[status] || status?.toUpperCase();
}

export function fromApiProjectStatus(status) {
  return PROJECT_STATUS_FROM_API[status] || status?.toLowerCase();
}

export function toApiTaskStatus(status) {
  return TASK_STATUS_TO_API[status] || status?.toUpperCase();
}

export function fromApiTaskStatus(status) {
  return TASK_STATUS_FROM_API[status] || status?.toLowerCase();
}

export function toApiPriority(priority) {
  return PRIORITY_TO_API[priority] || priority?.toUpperCase();
}

export function fromApiPriority(priority) {
  return PRIORITY_FROM_API[priority] || priority?.toLowerCase();
}

export function mapUser(user) {
  if (!user) return null;
  return {
    ...user,
    role: fromApiRole(user.role),
  };
}

export function mapProject(project) {
  if (!project) return null;
  const memberIds =
    project.members?.map((m) => (typeof m === "string" ? m : m.userId || m.user?.id)) || [];
  return {
    id: project.id,
    name: project.name,
    description: project.description || "",
    status: fromApiProjectStatus(project.status),
    startDate: project.startDate,
    endDate: project.endDate,
    createdBy: project.createdUserId || project.createdBy?.id,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    members: memberIds,
    memberDetails:
      project.members?.map((m) => (m.user ? mapUser(m.user) : mapUser(m)))?.filter(Boolean) || [],
    tasks: project.tasks,
    _count: project._count,
  };
}

export function mapTask(task) {
  if (!task) return null;
  return {
    id: task.id,
    title: task.name,
    name: task.name,
    description: task.description || "",
    status: fromApiTaskStatus(task.status),
    priority: fromApiPriority(task.priority),
    projectId: task.projectId,
    assignedTo: task.assignedTo,
    assignee: task.assignee ? mapUser(task.assignee) : null,
    startDate: task.startDate,
    endDate: task.endDate,
    dueDate: task.endDate,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
    project: task.project,
  };
}

export function mapComment(comment) {
  if (!comment) return null;
  return {
    id: comment.id,
    taskId: comment.taskId,
    userId: comment.userId,
    content: comment.description,
    description: comment.description,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
    userName: comment.user?.name || comment.userName || "Unknown User",
    userRole: comment.user?.role
      ? fromApiRole(comment.user.role)
      : comment.userRole || "unknown",
  };
}
