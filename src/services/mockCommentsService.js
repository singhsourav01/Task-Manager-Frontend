import comments from "../mocks/comments";
import users from "../mocks/users";
import { successResponse, errorResponse, simulateDelay } from "../utils/responseHelper";
import { MOCK_DELAYS } from "../utils/constants";

let commentsData = [...comments.map((c) => ({ ...c }))];
let nextId = "c" + (commentsData.length + 1);

const mockCommentsService = {
  async getCommentsByTask(taskId) {
    await simulateDelay(MOCK_DELAYS.SHORT);

    const taskComments = commentsData
      .filter((c) => c.taskId === taskId)
      .map((c) => {
        const user = users.find((u) => u.id === c.userId);
        return {
          ...c,
          userName: user ? user.name : "Unknown User",
          userRole: user ? user.role : "unknown",
        };
      })
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    return successResponse(taskComments, "Comments fetched successfully");
  },

  async addComment(taskId, userId, content) {
    await simulateDelay(MOCK_DELAYS.SHORT);

    if (!content || content.trim().length === 0) {
      return errorResponse("Comment cannot be empty", 400);
    }

    const newComment = {
      id: nextId,
      taskId,
      userId,
      content: content.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    nextId = "c" + (parseInt(nextId.slice(1)) + 1);
    commentsData.push(newComment);

    const user = users.find((u) => u.id === userId);
    return successResponse(
      {
        ...newComment,
        userName: user ? user.name : "Unknown User",
        userRole: user ? user.role : "unknown",
      },
      "Comment added successfully"
    );
  },

  async deleteComment(commentId, userId) {
    await simulateDelay(MOCK_DELAYS.SHORT);

    const index = commentsData.findIndex((c) => c.id === commentId);
    if (index === -1) return errorResponse("Comment not found", 404);

    if (commentsData[index].userId !== userId) {
      return errorResponse("You can only delete your own comments", 403);
    }

    commentsData.splice(index, 1);
    return successResponse(null, "Comment deleted successfully");
  },
};

export default mockCommentsService;
