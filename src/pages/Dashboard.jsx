import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import dashboardService from "../services/dashboardService";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ErrorMessage from "../components/common/ErrorMessage";

const statusColors = {
  todo: "bg-gray-100 text-gray-800",
  "in-progress": "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  "on-hold": "bg-yellow-100 text-yellow-800",
};

const priorityColors = {
  high: "bg-red-100 text-red-800",
  medium: "bg-yellow-100 text-yellow-800",
  low: "bg-blue-100 text-blue-800",
};

export default function Dashboard() {
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    setError(null);
    const result = await dashboardService.getStats();
    if (result.success) {
      setStats(result.data);
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  if (loading) return <LoadingSpinner fullPage message="Loading dashboard..." />;
  if (error) return <ErrorMessage message={error} onRetry={loadStats} />;
  if (!stats) return null;

  const StatCard = ({ label, value, color }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back, {user?.name}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Projects" value={stats.totalProjects} color="text-indigo-600" />
        <StatCard label="Active Projects" value={stats.activeProjects} color="text-blue-600" />
        <StatCard label="Total Tasks" value={stats.totalTasks} color="text-green-600" />
        <StatCard label="Active Users" value={stats.activeUsers} color="text-purple-600" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white rounded-xl border border-gray-200 p-4 sm:p-5">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Task Completion Trend</h2>
          <div className="h-56 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.taskCompletionTrend} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="created" fill="#6366f1" name="Created" radius={[4, 4, 0, 0]} />
                <Bar dataKey="completed" fill="#22c55e" name="Completed" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Project Status</h2>
          <div className="h-56 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.projectStatusDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={60}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {stats.projectStatusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Tasks by Status</h2>
          <div className="space-y-3">
            {Object.entries(stats.tasksByStatus).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <span className={`text-sm font-medium px-2.5 py-0.5 rounded-full ${statusColors[status] || "bg-gray-100"}`}>
                  {status.charAt(0).toUpperCase() + status.slice(1).replace("-", " ")}
                </span>
                <span className="text-sm font-semibold text-gray-700">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Tasks by Priority</h2>
          <div className="space-y-3">
            {Object.entries(stats.tasksByPriority).map(([priority, count]) => (
              <div key={priority} className="flex items-center justify-between">
                <span className={`text-sm font-medium px-2.5 py-0.5 rounded-full ${priorityColors[priority] || "bg-gray-100"}`}>
                  {priority.charAt(0).toUpperCase() + priority.slice(1)}
                </span>
                <span className="text-sm font-semibold text-gray-700">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-3">
          {stats.recentActivities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3 py-2 border-b border-gray-100 last:border-0">
              <div className="h-2 w-2 mt-2 rounded-full bg-indigo-400 shrink-0" />
              <div>
                <p className="text-sm text-gray-700">{activity.message}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(activity.timestamp).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
