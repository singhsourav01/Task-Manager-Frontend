import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { taskSchema } from "../utils/validation";
import { canCreateTask, canEditTask } from "../utils/permissions";
import tasksService from "../services/tasksService";
import projectsService from "../services/projectsService";
import usersService from "../services/usersService";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ErrorMessage from "../components/common/ErrorMessage";

export default function TaskForm() {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isEdit = Boolean(id);
  const preselectedProjectId = searchParams.get("projectId");

  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [projects, setProjects] = useState([]);
  const [developers, setDevelopers] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      name: "",
      description: "",
      status: "todo",
      priority: "medium",
      projectId: preselectedProjectId || "",
      assignedTo: "",
      startDate: "",
      endDate: "",
    },
  });

  useEffect(() => {
    loadFormData();
  }, []);

  const loadFormData = async () => {
    const [projectsResult, usersResult] = await Promise.all([
      projectsService.getProjects({ limit: 100 }),
      usersService.getUsers({ limit: 100 }),
    ]);
    console.log(usersResult);
    if (projectsResult.success) {
      let filteredProjects = projectsResult.data;
      if (
        !canCreateTask(user, {
          id: "any",
          createdBy: user.id,
          members: [user.id],
        })
      ) {
        filteredProjects = filteredProjects.filter(
          (p) => p.createdBy === user.id || p.members.includes(user.id),
        );
      }
      setProjects(filteredProjects);
    }

    if (usersResult.success) {
      const filteredUsers = usersResult.data.filter((u) => u.isActive);

      console.log(filteredUsers);

      setDevelopers(filteredUsers);
    }

    if (isEdit) {
      const taskResult = await tasksService.getTaskById(id);
      if (taskResult.success) {
        if (!canEditTask(user, taskResult.data)) {
          navigate("/access-denied", { replace: true });
          return;
        }
        reset({
          name: taskResult.data.name,
          startDate: taskResult.data.startDate.split("T")[0],
          endDate: taskResult.data.endDate.split("T")[0],
          description: taskResult.data.description,
          status: taskResult.data.status,
          priority: taskResult.data.priority,
          projectId: taskResult.data.projectId,
          assignedTo: taskResult.data.assignedTo || "",
        });
      } else {
        setError(taskResult.message);
      }
      setLoading(false);
    }
    setLoading(false);
  };

  const watchedProjectId = watch("projectId");

  useEffect(() => {
    const loadProjectMembers = async () => {
      if (watchedProjectId) {
        const result = await projectsService.getProjectById(watchedProjectId);
        if (result.success) setSelectedProject(result.data);
      }
    };
    loadProjectMembers();
  }, [watchedProjectId]);

  const onSubmit = async (data) => {
    console.log("Form Data:", data);
    const project = await projectsService.getProjectById(data.projectId);
    if (!project.success) {
      setError("Selected project not found");
      return;
    }

    if (!canCreateTask(user, project.data)) {
      setError("You don't have permission to create tasks in this project");
      return;
    }

    setSubmitting(true);
    setError(null);

    const payload = {
      projectId: data.projectId,
      name: data.name,
      description: data.description,
      priority: data.priority.toUpperCase(),

      startDate: new Date(data.startDate).toISOString(),
      endDate: new Date(data.endDate).toISOString(),

      assignedTo: data.assignedTo || null,
    };

    console.log({
      start: data.startDate,
      end: data.endDate,
    });

    console.log(payload);
    console.log(payload);

    const result = isEdit
      ? await tasksService.updateTask(id, payload)
      : await tasksService.createTask(payload);

    if (result.success) {
      navigate("/tasks");
    } else {
      setError(result.message);
    }
    setSubmitting(false);
  };

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {isEdit ? "Edit Task" : "Create Task"}
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {isEdit ? "Update task details" : "Add a new task to a project"}
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {error && <ErrorMessage message={error} />}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              {...register("name")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              {...register("description")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
            {errors.description && (
              <p className="text-red-500 text-xs mt-1">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project
              </label>
              <select
                {...register("projectId")}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none min-h-[44px]"
              >
                <option value="">Select Project</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              {errors.projectId && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.projectId.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                {...register("priority")}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none min-h-[44px]"
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                {...register("status")}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none min-h-[44px]"
              >
                <option value="todo">Todo</option>
                <option value="in-progress">In Progress</option>
                <option value="on-hold">On Hold</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assign To
              </label>
              <select
                {...register("assignedTo")}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none min-h-[44px]"
              >
                <option value="">Unassigned</option>
                {developers.map((dev) => (
                  <option key={dev.id} value={dev.id}>
                    {dev.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>

            <input
              type="date"
              {...register("startDate")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />

            {errors.startDate && (
              <p className="text-red-500 text-xs mt-1">
                {errors.startDate.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Due Date
            </label>
            <input
              type="date"
              {...register("endDate")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
            {errors.endDate && (
              <p className="text-red-500 text-xs mt-1">
                {errors.endDate.message}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors min-h-[44px]"
            >
              {submitting
                ? "Saving..."
                : isEdit
                  ? "Update Task"
                  : "Create Task"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/tasks")}
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
