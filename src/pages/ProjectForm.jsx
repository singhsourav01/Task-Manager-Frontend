import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { projectSchema } from "../utils/validation";
import { canCreateProject, canEditProject } from "../utils/permissions";
import mockProjectsService from "../services/mockProjectsService";
import mockUsersService from "../services/mockUsersService";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ErrorMessage from "../components/common/ErrorMessage";

export default function ProjectForm() {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [allUsers, setAllUsers] = useState([]);

  if (!canCreateProject(user)) {
    navigate("/access-denied", { replace: true });
    return null;
  }

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: "",
      description: "",
      status: "planning",
      startDate: "",
      endDate: "",
      members: [],
    },
  });

  useEffect(() => {
    loadUsers();
    if (isEdit) {
      loadProject();
    }
  }, [id]);

  const loadUsers = async () => {
    const result = await mockUsersService.getUsers({ limit: 100 });
    if (result.success) {
      setAllUsers(result.data);
    }
  };

  const loadProject = async () => {
    setLoading(true);
    const result = await mockProjectsService.getProjectById(id);
    if (result.success) {
      reset({
        name: result.data.name,
        description: result.data.description,
        status: result.data.status,
        startDate: result.data.startDate.split("T")[0],
        endDate: result.data.endDate.split("T")[0],
        members: result.data.members,
      });
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  const onSubmit = async (data) => {
    if (isEdit) {
      const proj = (await mockProjectsService.getProjectById(id)).data;
      if (!canEditProject(user, proj)) {
        setError("You don't have permission to edit this project");
        return;
      }
    }

    setSubmitting(true);
    setError(null);

    const payload = {
      ...data,
      startDate: new Date(data.startDate).toISOString(),
      endDate: new Date(data.endDate).toISOString(),
      createdBy: isEdit ? undefined : user.id,
    };

    const result = isEdit
      ? await mockProjectsService.updateProject(id, payload)
      : await mockProjectsService.createProject(payload);

    if (result.success) {
      navigate("/projects");
    } else {
      setError(result.message);
    }
    setSubmitting(false);
  };

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{isEdit ? "Edit Project" : "New Project"}</h1>
        <p className="text-gray-500 text-sm mt-1">
          {isEdit ? "Update project details" : "Create a new project"}
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {error && <ErrorMessage message={error} />}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
            <input
              type="text"
              {...register("name")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              rows={3}
              {...register("description")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              {...register("status")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            >
              <option value="planning">Planning</option>
              <option value="active">Active</option>
              <option value="on-hold">On Hold</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                {...register("startDate")}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none min-h-[44px]"
              />
              {errors.startDate && <p className="text-red-500 text-xs mt-1">{errors.startDate.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                {...register("endDate")}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none min-h-[44px]"
              />
              {errors.endDate && <p className="text-red-500 text-xs mt-1">{errors.endDate.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Team Members</label>
            <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-2 space-y-1">
              {allUsers.map((u) => {
                const members = watch("members") || [];
                const checked = members.includes(u.id);
                return (
                  <label key={u.id} className="flex items-center gap-2 px-2 py-1 hover:bg-gray-50 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      value={u.id}
                      {...register("members")}
                      defaultChecked={checked}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-700">{u.name}</span>
                    <span className="text-xs text-gray-400">({u.role})</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors min-h-[44px]"
            >
              {submitting ? "Saving..." : isEdit ? "Update Project" : "Create Project"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/projects")}
              className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors min-h-[44px]"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
