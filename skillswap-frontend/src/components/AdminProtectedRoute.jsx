import { Navigate } from "react-router-dom";
import { getAuthToken } from "../api/apiClient";
import { useAuth } from "../context/AuthContext";

function AdminProtectedRoute({ children }) {
  const token = getAuthToken();
  const isAdmin = localStorage.getItem("isAdmin") === "true";
  const { user, loading } = useAuth();

  if (!token || !isAdmin) {
    return <Navigate to="/admin-login" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#06194F] flex items-center justify-center text-white text-sm">
        Verifying administrative authorization...
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to="/admin-login" replace />;
  }

  return children;
}

export default AdminProtectedRoute;