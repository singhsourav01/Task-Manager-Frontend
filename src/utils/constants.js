export const ROLES = {
  ADMIN: "admin",
  MANAGER: "manager",
  DEVELOPER: "developer",
};

export const ROLES_HIERARCHY = {
  [ROLES.ADMIN]: 3,
  [ROLES.MANAGER]: 2,
  [ROLES.DEVELOPER]: 1,
};

export const TASK_STATUS = {
  TODO: "todo",
  IN_PROGRESS: "in-progress",
  ON_HOLD: "on-hold",
  COMPLETED: "completed",
};

export const TASK_PRIORITY = {
  HIGH: "high",
  MEDIUM: "medium",
  LOW: "low",
};

export const PROJECT_STATUS = {
  PLANNING: "planning",
  ACTIVE: "active",
  ON_HOLD: "on-hold",
  COMPLETED: "completed",
};

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
};

export const STORAGE_KEYS = {
  TOKEN: "taskmanager_token",
  REFRESH_TOKEN: "taskmanager_refresh_token",
  USER: "taskmanager_user",
};

export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/auth";

export const MOCK_DELAYS = {
  SHORT: 300,
  MEDIUM: 600,
  LONG: 1000,
};

export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
