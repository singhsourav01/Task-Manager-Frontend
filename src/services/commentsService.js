import { apiRequest } from "../api/client";
import { successResponse, errorResponse } from "../utils/responseHelper";
import { mapComment } from "../utils/mappers";

const commentsService = {
  async getCommentsByTask(taskId) {
    const { ok, data } = await apiRequest(`/comment/task/${taskId}?limit=100&sortOrder=asc`);
    if (!ok) return errorResponse(data.message || "Failed to fetch comments");

    const comments = (data.data || []).map(mapComment);
    return successResponse(comments, "Comments fetched successfully");
  },

  async addComment(taskId, userId, content) {
    if (!content || content.trim().length === 0) {
      return errorResponse("Comment cannot be empty", 400);
    }

    const { ok, data } = await apiRequest("/comment", {
      method: "POST",
      body: { taskId, description: content.trim() },
    });
    if (!ok) return errorResponse(data.message || "Failed to add comment");
    return successResponse(mapComment(data.data), data.message || "Comment added successfully");
  },

  async deleteComment(commentId) {
    const { ok, data } = await apiRequest(`/comment/${commentId}`, { method: "DELETE" });
    if (!ok) return errorResponse(data.message || "Failed to delete comment");
    return successResponse(null, data.message || "Comment deleted successfully");
  },
};

export default commentsService;
