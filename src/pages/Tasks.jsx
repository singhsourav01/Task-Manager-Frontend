import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import mockTasksService from "../services/mockTasksService";
import mockProjectsService from "../services/mockProjectsService";
import { canViewAllTasks } from "../utils/permissions";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ErrorMessage from "../components/common/ErrorMessage";
import SearchBar from "../components/common/SearchBar";
import Pagination from "../components/common/Pagination";

const statusBadge = {
  todo: "bg-gray-100 text-gray-800",
  "in-progress": "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  "on-hold": "bg-yellow-100 text-yellow-800",
};

const priorityIndicator = {
  high: "bg-red-500",
  medium: "bg-yellow-500",
  low: "bg-blue-500",
};

export default function Tasks() {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [tasksList, setTasksList] = useState([]);
  const [projectsMap, setProjectsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [projectFilter, setProjectFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [allProjects, setAllProjects] = useState([]);

  const canViewAll = canViewAllTasks(user);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    const params = { page, search, status: statusFilter, priority: priorityFilter, projectId: projectFilter };
    if (!canViewAll) {
      params.assignedTo = user.id;
    }
    const result = await mockTasksService.getTasks(params);
    if (result.success) {
      setTasksList(result.data);
      setPagination(result.pagination);
    } else {
      setError(result.message);
    }
    setLoading(false);
  }, [page, search, statusFilter, priorityFilter, projectFilter, canViewAll, user.id]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  useEffect(() => {
    const loadProjects = async () => {
      const result = await mockProjectsService.getProjects({ limit: 100 });
      if (result.success) {
        const map = {};
        result.data.forEach((p) => { map[p.id] = p; });
        setProjectsMap(map);
        setAllProjects(result.data);
      }
    };
    loadProjects();
  }, []);

  const handleStatusChange = async (taskId, newStatus) => {
    const result = await mockTasksService.updateTaskStatus(taskId, newStatus);
    if (result.success) {
      loadTasks();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
          <p className="text-gray-500 text-sm mt-1">
            {canViewAll ? "Manage all tasks" : "View your assigned tasks"}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search tasks..." />
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Status</option>
          <option value="todo">Todo</option>
          <option value="in-progress">In Progress</option>
          <option value="on-hold">On Hold</option>
          <option value="completed">Completed</option>
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Priority</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        {canViewAll && (
          <select
            value={projectFilter}
            onChange={(e) => { setProjectFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Projects</option>
            {allProjects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        )}
      </div>

      {error && <ErrorMessage message={error} onRetry={loadTasks} />}

      {loading ? (
        <LoadingSpinner />
      ) : tasksList.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>No tasks found</p>
        </div>
      ) : (
        <>
          {/* Mobile card view */}
          <div className="sm:hidden space-y-3">
            {tasksList.map((task) => (
              <Link key={task.id} to={`/tasks/${task.id}`} className="block bg-white rounded-xl border border-gray-200 p-4 space-y-3 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-gray-900 break-words min-w-0 flex-1">{task.title}</p>
                  <span className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${priorityIndicator[task.priority]}`} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">{projectsMap[task.projectId]?.name || "Unknown"}</span>
                  <span className="text-xs text-gray-400">Due {new Date(task.dueDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 capitalize">{task.priority}</span>
                  {(canViewAll || task.assignedTo === user.id) ? (
                    <select
                      value={task.status}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => handleStatusChange(task.id, e.target.value)}
                      className={`text-xs font-medium px-2.5 py-1 rounded-full border outline-none cursor-pointer ${statusBadge[task.status]} min-h-[32px]`}
                    >
                      <option value="todo">Todo</option>
                      <option value="in-progress">In Progress</option>
                      <option value="on-hold">On Hold</option>
                      <option value="completed">Completed</option>
                    </select>
                  ) : (
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusBadge[task.status]}`}>
                      {task.status.replace("-", " ")}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
          {/* Desktop table view */}
          <div className="hidden sm:block bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Task</th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {tasksList.map((task) => (
                    <tr key={task.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <Link to={`/tasks/${task.id}`} className="text-sm font-medium text-gray-900 hover:text-indigo-600 whitespace-nowrap">
                          {task.title}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                        {projectsMap[task.projectId]?.name || "Unknown"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${priorityIndicator[task.priority]}`} />
                          <span className="text-sm text-gray-600 capitalize">{task.priority}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {(canViewAll || task.assignedTo === user.id) ? (
                          <select
                            value={task.status}
                            onChange={(e) => handleStatusChange(task.id, e.target.value)}
                            className={`text-xs font-medium px-2 py-1 rounded-full border-0 outline-none cursor-pointer ${statusBadge[task.status]} min-h-[32px]`}
                          >
                            <option value="todo">Todo</option>
                            <option value="in-progress">In Progress</option>
                            <option value="on-hold">On Hold</option>
                            <option value="completed">Completed</option>
                          </select>
                        ) : (
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusBadge[task.status]}`}>
                            {task.status.replace("-", " ")}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                        {new Date(task.dueDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          to={`/tasks/${task.id}`}
                          className="text-sm text-indigo-600 hover:text-indigo-800 font-medium px-2.5 py-1.5 rounded hover:bg-indigo-50 min-h-[36px] inline-flex items-center"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {pagination && (
            <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={setPage} />
          )}
        </>
      )}
    </div>
  );
}
