import { ROLES, ROLES_HIERARCHY } from "./constants";

export function hasRole(user, roles) {
  if (!user) return false;
  const roleList = Array.isArray(roles) ? roles : [roles];
  return roleList.includes(user.role);
}

export function hasMinRole(user, minRole) {
  if (!user) return false;
  return (ROLES_HIERARCHY[user.role] || 0) >= (ROLES_HIERARCHY[minRole] || 0);
}

export function canManageUsers(user) {
  return hasRole(user, ROLES.ADMIN);
}

export function canCreateProject(user) {
  return hasRole(user, [ROLES.ADMIN, ROLES.MANAGER]);
}

export function canEditProject(user, project) {
  if (!user || !project) return false;
  if (hasRole(user, ROLES.ADMIN)) return true;
  if (hasRole(user, ROLES.MANAGER) && project.createdBy === user.id) return true;
  return false;
}

export function canDeleteProject(user, project) {
  if (!user || !project) return false;
  if (hasRole(user, ROLES.ADMIN)) return true;
  if (hasRole(user, ROLES.MANAGER) && project.createdBy === user.id) return true;
  return false;
}

export function canAssignProjectMembers(user) {
  return hasRole(user, [ROLES.ADMIN, ROLES.MANAGER]);
}

export function canCreateTask(user, project) {
  if (!user || !project) return false;
  if (hasRole(user, ROLES.ADMIN)) return true;
  if (hasRole(user, ROLES.MANAGER)) {
    return project.createdBy === user.id || project.members?.includes(user.id);
  }
  return false;
}

export function canEditTask(user, task) {
  if (!user || !task) return false;
  if (hasRole(user, ROLES.ADMIN)) return true;
  if (hasRole(user, ROLES.MANAGER)) return true;
  return task.assignedTo === user.id;
}

export function canUpdateTaskStatus(user, task) {
  if (!user || !task) return false;
  if (hasRole(user, [ROLES.ADMIN, ROLES.MANAGER])) return true;
  return task.assignedTo === user.id;
}

export function canCommentOnTask(user, task) {
  if (!user || !task) return false;
  if (hasRole(user, [ROLES.ADMIN, ROLES.MANAGER])) return true;
  return task.assignedTo === user.id;
}

export function canViewTask(user, task) {
  if (!user || !task) return false;
  if (hasRole(user, ROLES.ADMIN)) return true;
  if (hasRole(user, ROLES.MANAGER)) return true;
  return task.assignedTo === user.id;
}

export function canViewAllTasks(user) {
  return hasRole(user, [ROLES.ADMIN, ROLES.MANAGER]);
}

export function canViewAllProjects(user) {
  return hasRole(user, [ROLES.ADMIN, ROLES.MANAGER]);
}
