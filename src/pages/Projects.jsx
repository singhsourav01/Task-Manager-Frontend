import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import mockProjectsService from "../services/mockProjectsService";
import { canCreateProject, canViewAllProjects } from "../utils/permissions";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ErrorMessage from "../components/common/ErrorMessage";
import SearchBar from "../components/common/SearchBar";
import Pagination from "../components/common/Pagination";

const statusBadge = {
  planning: "bg-blue-100 text-blue-800",
  active: "bg-green-100 text-green-800",
  "on-hold": "bg-yellow-100 text-yellow-800",
  completed: "bg-gray-100 text-gray-800",
};

export default function Projects() {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [projectsList, setProjectsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  const canViewAll = canViewAllProjects(user);

  const loadProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    const params = { page, search, status: statusFilter };
    if (!canViewAll) {
      params.userId = user.id;
    }
    const result = await mockProjectsService.getProjects(params);
    if (result.success) {
      setProjectsList(result.data);
      setPagination(result.pagination);
    } else {
      setError(result.message);
    }
    setLoading(false);
  }, [page, search, statusFilter, canViewAll, user.id]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;
    const result = await mockProjectsService.deleteProject(id);
    if (result.success) {
      loadProjects();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-500 text-sm mt-1">Manage projects and team assignments</p>
        </div>
        {canCreateProject(user) && (
          <Link
            to="/projects/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Project
          </Link>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search projects..." />
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Status</option>
          <option value="planning">Planning</option>
          <option value="active">Active</option>
          <option value="on-hold">On Hold</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {error && <ErrorMessage message={error} onRetry={loadProjects} />}

      {loading ? (
        <LoadingSpinner />
      ) : projectsList.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>No projects found</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {projectsList.map((project) => (
              <div key={project.id} className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <Link to={`/projects/${project.id}`} className="text-base sm:text-lg font-semibold text-gray-900 hover:text-indigo-600 break-words min-w-0">
                    {project.name}
                  </Link>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${statusBadge[project.status]}`}>
                    {project.status.charAt(0).toUpperCase() + project.status.slice(1).replace("-", " ")}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">{project.description}</p>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>{project.members.length} member{project.members.length !== 1 ? "s" : ""}</span>
                  <span>Due {new Date(project.endDate).toLocaleDateString()}</span>
                </div>
                <div className="flex flex-wrap items-center gap-1 mt-4 pt-3 border-t border-gray-100">
                  <Link
                    to={`/projects/${project.id}`}
                    className="text-sm text-indigo-600 hover:text-indigo-800 font-medium px-2.5 py-1.5 rounded hover:bg-indigo-50 min-h-[36px] flex items-center"
                  >
                    View Details
                  </Link>
                  {canCreateProject(user) && (
                    <>
                      <Link
                        to={`/projects/${project.id}/edit`}
                        className="text-sm text-gray-600 hover:text-gray-800 font-medium px-2.5 py-1.5 rounded hover:bg-gray-100 min-h-[36px] flex items-center"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(project.id)}
                        className="text-sm text-red-600 hover:text-red-800 font-medium px-2.5 py-1.5 rounded hover:bg-red-50 min-h-[36px]"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
          {pagination && (
            <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={setPage} />
          )}
        </>
      )}
    </div>
  );
}
