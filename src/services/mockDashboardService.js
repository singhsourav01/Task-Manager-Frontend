import dashboardStats from "../mocks/dashboard";
import { successResponse, simulateDelay } from "../utils/responseHelper";
import { MOCK_DELAYS } from "../utils/constants";

const mockDashboardService = {
  async getStats() {
    await simulateDelay(MOCK_DELAYS.MEDIUM);
    return successResponse({ ...dashboardStats }, "Dashboard stats fetched successfully");
  },

  async getRecentActivities() {
    await simulateDelay(MOCK_DELAYS.SHORT);
    return successResponse([...dashboardStats.recentActivities], "Activities fetched successfully");
  },

  async getTaskCompletionTrend() {
    await simulateDelay(MOCK_DELAYS.SHORT);
    return successResponse([...dashboardStats.taskCompletionTrend], "Trend data fetched successfully");
  },

  async getProjectStatusDistribution() {
    await simulateDelay(MOCK_DELAYS.SHORT);
    return successResponse([...dashboardStats.projectStatusDistribution], "Distribution data fetched successfully");
  },
};

export default mockDashboardService;
