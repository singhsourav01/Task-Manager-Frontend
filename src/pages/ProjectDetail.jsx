import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  canCreateProject,
  canEditProject,
  canDeleteProject,
  canAssignProjectMembers,
  canCreateTask,
} from "../utils/permissions";
import projectsService from "../services/projectsService";
import tasksService from "../services/tasksService";
import usersService from "../services/usersService";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ErrorMessage from "../components/common/ErrorMessage";

const statusBadge = {
  planning: "bg-blue-100 text-blue-800",
  active: "bg-green-100 text-green-800",
  "on-hold": "bg-yellow-100 text-yellow-800",
  completed: "bg-gray-100 text-gray-800",
};

const taskStatusBadge = {
  todo: "bg-gray-100 text-gray-800",
  "in-progress": "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  "on-hold": "bg-yellow-100 text-yellow-800",
};

export default function ProjectDetail() {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const { id } = useParams();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMemberSelect, setShowMemberSelect] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    const projectResult = await projectsService.getProjectById(id);
    if (!projectResult.success) {
      setError(projectResult.message);
      setLoading(false);
      return;
    }
    setProject(projectResult.data);

    const tasksResult = await tasksService.getTasksByProject(id);
    if (tasksResult.success) setTasks(tasksResult.data);

    const usersResult = await usersService.getUsers({ limit: 100 });
    if (usersResult.success) {
      setAllUsers(usersResult.data);
      const projectMembers = usersResult.data.filter((u) =>
        projectResult.data.members.includes(u.id)
      );
      setMembers(projectMembers);
    }

    setLoading(false);
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;
    const result = await projectsService.deleteProject(id);
    if (result.success) {
      navigate("/projects");
    }
  };

  const handleAssignMembers = async () => {
    if (selectedMembers.length === 0) return;
    const result = await projectsService.assignMembers(id, selectedMembers);
    if (result.success) {
      setShowMemberSelect(false);
      setSelectedMembers([]);
      loadData();
    }
  };

  const handleRemoveMember = async (userId) => {
    const result = await projectsService.removeMember(id, userId);
    if (result.success) loadData();
  };

  if (loading) return <LoadingSpinner fullPage />;
  if (error) return <ErrorMessage message={error} onRetry={loadData} />;
  if (!project) return null;

  const availableUsers = allUsers.filter(
    (u) => !project.members.includes(u.id) && u.isActive
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <Link to="/projects" className="text-sm text-indigo-600 hover:text-indigo-800 mb-2 inline-block">
            &larr; Back to Projects
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 break-words">{project.name}</h1>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">{project.description}</p>
        </div>
        <span className={`text-xs sm:text-sm font-medium px-2.5 sm:px-3 py-1 rounded-full shrink-0 ${statusBadge[project.status]}`}>
          {project.status.charAt(0).toUpperCase() + project.status.slice(1).replace("-", " ")}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Tasks</h2>
              {canCreateTask(user, project) && (
                <Link
                  to={`/tasks/new?projectId=${project.id}`}
                  className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  + Add Task
                </Link>
              )}
            </div>
            {tasks.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">No tasks yet</p>
            ) : (
              <div className="space-y-2">
                {tasks.map((task) => (
                  <Link
                    key={task.id}
                    to={`/tasks/${task.id}`}
                    className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-2 h-2 rounded-full ${
                        task.priority === "high" ? "bg-red-500" : task.priority === "medium" ? "bg-yellow-500" : "bg-blue-500"
                      }`} />
                      <span className="text-sm font-medium text-gray-900">{task.title}</span>
                    </div>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${taskStatusBadge[task.status]}`}>
                      {task.status.replace("-", " ")}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Project Details</h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
              <div>
                <dt className="text-gray-500">Start Date</dt>
                <dd className="font-medium text-gray-900">{new Date(project.startDate).toLocaleDateString()}</dd>
              </div>
              <div>
                <dt className="text-gray-500">End Date</dt>
                <dd className="font-medium text-gray-900">{new Date(project.endDate).toLocaleDateString()}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Status</dt>
                <dd className="font-medium text-gray-900 capitalize">{project.status}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Total Tasks</dt>
                <dd className="font-medium text-gray-900">{tasks.length}</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Team ({members.length})</h2>
              {canAssignProjectMembers(user) && (
                <button
                  onClick={() => setShowMemberSelect(!showMemberSelect)}
                  className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  {showMemberSelect ? "Cancel" : "Add"}
                </button>
              )}
            </div>

            {showMemberSelect && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg space-y-2">
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {availableUsers.map((u) => (
                    <label key={u.id} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedMembers.includes(u.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedMembers([...selectedMembers, u.id]);
                          } else {
                            setSelectedMembers(selectedMembers.filter((mid) => mid !== u.id));
                          }
                        }}
                        className="rounded border-gray-300 text-indigo-600"
                      />
                      {u.name}
                    </label>
                  ))}
                  {availableUsers.length === 0 && (
                    <p className="text-xs text-gray-400">No available users</p>
                  )}
                </div>
                <button
                  onClick={handleAssignMembers}
                  disabled={selectedMembers.length === 0}
                  className="w-full py-1.5 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
                >
                  Assign Selected
                </button>
              </div>
            )}

            <div className="space-y-3">
              {members.map((m) => (
                <div key={m.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full bg-indigo-100 flex items-center justify-center">
                      <span className="text-xs font-medium text-indigo-700">
                        {m.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{m.name}</p>
                      <p className="text-xs text-gray-400 capitalize">{m.role}</p>
                    </div>
                  </div>
                  {canAssignProjectMembers(user) && (
                    <button
                      onClick={() => handleRemoveMember(m.id)}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {canEditProject(user, project) && (
            <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-2">
              <Link
                to={`/projects/${project.id}/edit`}
                className="block w-full text-center py-2 border border-indigo-300 text-indigo-700 rounded-lg text-sm font-medium hover:bg-indigo-50 transition-colors"
              >
                Edit Project
              </Link>
              {canDeleteProject(user, project) && (
                <button
                  onClick={handleDelete}
                  className="block w-full text-center py-2 border border-red-300 text-red-700 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
                >
                  Delete Project
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
