import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import usersService from "../services/usersService";
import { canManageUsers } from "../utils/permissions";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ErrorMessage from "../components/common/ErrorMessage";
import SearchBar from "../components/common/SearchBar";
import Pagination from "../components/common/Pagination";

const roleBadge = {
  admin: "bg-purple-100 text-purple-800",
  manager: "bg-blue-100 text-blue-800",
  developer: "bg-green-100 text-green-800",
};

export default function Users() {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  if (!canManageUsers(user)) {
    navigate("/access-denied", { replace: true });
    return null;
  }

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await usersService.getUsers({ page, search, role: roleFilter, status: statusFilter });
    if (result.success) {
      setUsersList(result.data);
      setPagination(result.pagination);
    } else {
      setError(result.message);
    }
    setLoading(false);
  }, [page, search, roleFilter, statusFilter]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleToggleActive = async (id) => {
    const result = await usersService.toggleUserActive(id);
    if (result.success) {
      loadUsers();
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    const result = await usersService.deleteUser(id);
    if (result.success) {
      loadUsers();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-500 text-sm mt-1">Manage system users and roles</p>
        </div>
        <Link
          to="/users/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add User
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search users..." />
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="manager">Manager</option>
          <option value="developer">Developer</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {error && <ErrorMessage message={error} onRetry={loadUsers} />}

      {loading ? (
        <LoadingSpinner />
      ) : usersList.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>No users found</p>
        </div>
      ) : (
        <>
          {/* Mobile card view */}
          <div className="sm:hidden space-y-3">
            {usersList.map((u) => (
              <div key={u.id} className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center">
                      <span className="text-xs font-medium text-indigo-700">
                        {u.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{u.name}</p>
                      <p className="text-xs text-gray-500 truncate max-w-[160px]">{u.email}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${roleBadge[u.role]}`}>
                    {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${u.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                    {u.isActive ? "Active" : "Inactive"}
                  </span>
                  <span className="text-xs text-gray-400">Created {new Date(u.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-3 pt-1 border-t border-gray-100">
                  <Link to={`/users/${u.id}/edit`} className="text-sm text-indigo-600 hover:text-indigo-800 font-medium min-h-[44px] flex items-center px-2">
                    Edit
                  </Link>
                  <button onClick={() => handleToggleActive(u.id)} className={`text-sm font-medium min-h-[44px] px-2 ${u.isActive ? "text-yellow-600 hover:text-yellow-800" : "text-green-600 hover:text-green-800"}`}>
                    {u.isActive ? "Deactivate" : "Activate"}
                  </button>
                  <button onClick={() => handleDelete(u.id)} className="text-sm text-red-600 hover:text-red-800 font-medium min-h-[44px] px-2">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
          {/* Desktop table view */}
          <div className="hidden sm:block bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {usersList.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                            <span className="text-xs font-medium text-indigo-700">
                              {u.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-gray-900 whitespace-nowrap">{u.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 max-w-[200px] truncate">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${roleBadge[u.role]}`}>
                          {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${u.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                          {u.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Link to={`/users/${u.id}/edit`} className="px-2.5 py-1.5 text-sm text-indigo-600 hover:text-indigo-800 font-medium rounded hover:bg-indigo-50 min-h-[36px] flex items-center">
                            Edit
                          </Link>
                          <button onClick={() => handleToggleActive(u.id)} className={`px-2.5 py-1.5 text-sm font-medium rounded min-h-[36px] ${u.isActive ? "text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50" : "text-green-600 hover:text-green-800 hover:bg-green-50"}`}>
                            {u.isActive ? "Deactivate" : "Activate"}
                          </button>
                          <button onClick={() => handleDelete(u.id)} className="px-2.5 py-1.5 text-sm text-red-600 hover:text-red-800 font-medium rounded hover:bg-red-50 min-h-[36px]">
                            Delete
                          </button>
                        </div>
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
