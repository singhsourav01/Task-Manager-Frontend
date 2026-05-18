import { Link } from "react-router-dom";

export default function AccessDenied() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="text-5xl sm:text-6xl font-bold text-red-400 mb-4 break-words">403</div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
        <p className="text-gray-500 mb-6">
          You do not have permission to access this page. Contact your administrator if you believe this is a mistake.
        </p>
        <Link
          to="/dashboard"
          className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
