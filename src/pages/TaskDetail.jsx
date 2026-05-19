import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { commentSchema } from "../utils/validation";
import {
  canEditTask,
  canUpdateTaskStatus,
  canCommentOnTask,
  canViewTask,
} from "../utils/permissions";
import tasksService from "../services/tasksService";
import commentsService from "../services/commentsService";
import projectsService from "../services/projectsService";
import usersService from "../services/usersService";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ErrorMessage from "../components/common/ErrorMessage";

const statusBadge = {
  todo: "bg-gray-100 text-gray-800",
  "in-progress": "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  "on-hold": "bg-yellow-100 text-yellow-800",
};

const priorityBadge = {
  high: "bg-red-100 text-red-800",
  medium: "bg-yellow-100 text-yellow-800",
  low: "bg-blue-100 text-blue-800",
};

export default function TaskDetail() {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const { id } = useParams();

  const [task, setTask] = useState(null);
  const [project, setProject] = useState(null);
  const [assignedUser, setAssignedUser] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(commentSchema),
  });

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    const taskResult = await tasksService.getTaskById(id);
    if (!taskResult.success) {
      setError(taskResult.message);
      setLoading(false);
      return;
    }

    if (!canViewTask(user, taskResult.data)) {
      navigate("/access-denied", { replace: true });
      return;
    }

    setTask(taskResult.data);

    const [projResult, commentsResult] = await Promise.all([
      projectsService.getProjectById(taskResult.data.projectId),
      commentsService.getCommentsByTask(id),
    ]);

    if (projResult.success) setProject(projResult.data);
    if (commentsResult.success) setComments(commentsResult.data);

    if (taskResult.data.assignedTo) {
      const userResult = await usersService.getUserById(taskResult.data.assignedTo);
      if (userResult.success) setAssignedUser(userResult.data);
    }

    setLoading(false);
  };

  const handleStatusChange = async (newStatus) => {
    const result = await tasksService.updateTaskStatus(id, newStatus);
    if (result.success) {
      setTask(result.data);
    }
  };

  const onAddComment = async (data) => {
    const result = await commentsService.addComment(id, user.id, data.content);
    if (result.success) {
      setComments([...comments, result.data]);
      reset();
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Delete this comment?")) return;
    await commentsService.deleteComment(commentId, user.id);
    setComments(comments.filter((c) => c.id !== commentId));
  };

  if (loading) return <LoadingSpinner fullPage />;
  if (error) return <ErrorMessage message={error} onRetry={loadData} />;
  if (!task) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <Link to="/tasks" className="text-sm text-indigo-600 hover:text-indigo-800 mb-2 inline-block">
          &larr; Back to Tasks
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 break-words">{task.title}</h1>
            {project && (
              <Link to={`/projects/${project.id}`} className="text-sm text-indigo-600 hover:text-indigo-800 mt-1 inline-block">
                Project: {project.name}
              </Link>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${priorityBadge[task.priority]}`}>
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
            </span>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusBadge[task.status]}`}>
              {task.status.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider">Assigned To</p>
            <p className="text-sm font-medium text-gray-900 mt-0.5">
              {assignedUser ? assignedUser.name : "Unassigned"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider">Due Date</p>
            <p className="text-sm font-medium text-gray-900 mt-0.5">
              {new Date(task.dueDate).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider">Created By</p>
            <p className="text-sm font-medium text-gray-900 mt-0.5 capitalize">{task.createdBy}</p>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
          <p className="text-sm text-gray-600">{task.description}</p>
        </div>

        {canUpdateTaskStatus(user, task) && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <label className="text-sm font-medium text-gray-700">Update Status:</label>
            <select
              value={task.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 min-h-[40px]"
            >
              <option value="todo">Todo</option>
              <option value="in-progress">In Progress</option>
              <option value="on-hold">On Hold</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        )}

        {canEditTask(user, task) && (
          <div className="mt-4">
            <Link
              to={`/tasks/${task.id}/edit`}
              className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
            >
              Edit Task
            </Link>
          </div>
        )}
      </div>

      {canCommentOnTask(user, task) && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Comments</h2>

          <form onSubmit={handleSubmit(onAddComment)} className="mb-6">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <textarea
                rows={2}
                {...register("content")}
                className="w-full sm:flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                placeholder="Add a comment..."
              />
              <button
                type="submit"
                className="w-full sm:w-auto px-4 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors min-h-[44px]"
              >
                Post
              </button>
            </div>
            {errors.content && <p className="text-red-500 text-xs mt-1">{errors.content.message}</p>}
          </form>

          <div className="space-y-4">
            {comments.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No comments yet</p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                    <span className="text-xs font-medium text-indigo-700">
                      {comment.userName?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">{comment.userName}</span>
                      <span className="text-xs text-gray-400">
                        {new Date(comment.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {comment.userId === user.id && (
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-xs text-red-500 hover:text-red-700 ml-auto"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{comment.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
