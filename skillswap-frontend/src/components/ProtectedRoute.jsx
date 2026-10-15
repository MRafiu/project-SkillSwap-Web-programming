import { Navigate } from "react-router-dom";
import { getAuthToken } from "../api/apiClient";

function ProtectedRoute({ children }) {
  const token = getAuthToken();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;