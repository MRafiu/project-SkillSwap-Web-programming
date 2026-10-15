import { Routes, Route, Navigate } from "react-router-dom";

import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import BrowseSkills from "./pages/BrowseSkills.jsx";
import Profile from "./pages/Profile.jsx";
import Messages from "./pages/Messages.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Requests from "./pages/Requests.jsx";
import PostSkill from "./pages/PostSkill.jsx";
import EditProfile from "./pages/EditProfile.jsx";
import Schedule from "./pages/Schedule";
import PublicProfile from "./pages/PublicProfile.jsx";
import Leaderboard from "./pages/Leaderboard.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AdminProtectedRoute from "./components/AdminProtectedRoute.jsx";
import AdminLayout from "./pages/admin/AdminLayout.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import AdminLogin from "./pages/admin/AdminLogin.jsx";
import Users from "./pages/admin/Users.jsx";
import Skills from "./pages/admin/Skills.jsx";
import AdminRequests from "./pages/admin/Requests.jsx";
import Disputes from "./pages/admin/Disputes.jsx";
import Analytics from "./pages/admin/Analytics.jsx";
import Settings from "./pages/admin/Settings.jsx";
function App() {
  return (
    <Routes>

      {/* Public Pages */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/admin-login" element={<AdminLogin />} />

      {/* Protected Pages */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/leaderboard"
        element={
          <ProtectedRoute>
            <Leaderboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/discover"
        element={
          <ProtectedRoute>
            <BrowseSkills />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile/:userId"
        element={
          <ProtectedRoute>
            <PublicProfile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/messages"
        element={
          <ProtectedRoute>
            <Messages />
          </ProtectedRoute>
        }
      />

      <Route
        path="/requests"
        element={
          <ProtectedRoute>
            <Requests />
          </ProtectedRoute>
        }
      />

      <Route
        path="/post-skill"
        element={
          <ProtectedRoute>
            <PostSkill />
          </ProtectedRoute>
        }
      />

      <Route
        path="/edit-profile"
        element={
          <ProtectedRoute>
            <EditProfile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/schedule"
        element={
          <ProtectedRoute>
            <Schedule />
          </ProtectedRoute>
        }
      />
      <Route
  path="/admin"
  element={
    <AdminProtectedRoute>
      <AdminLayout>
        <AdminDashboard />
      </AdminLayout>
    </AdminProtectedRoute>
  }
/>

<Route
  path="/admin/users"
  element={
    <AdminProtectedRoute>
      <AdminLayout>
        <Users />
      </AdminLayout>
    </AdminProtectedRoute>
  }
/>

<Route
  path="/admin/skills"
  element={
    <AdminProtectedRoute>
      <AdminLayout>
        <Skills />
      </AdminLayout>
    </AdminProtectedRoute>
  }
/>

<Route
  path="/admin/requests"
  element={
    <AdminProtectedRoute>
      <AdminLayout>
        <AdminRequests />
      </AdminLayout>
    </AdminProtectedRoute>
  }
/>

<Route
  path="/admin/disputes"
  element={
    <AdminProtectedRoute>
      <AdminLayout>
        <Disputes />
      </AdminLayout>
    </AdminProtectedRoute>
  }
/>

<Route
  path="/admin/analytics"
  element={
    <AdminProtectedRoute>
      <AdminLayout>
        <Analytics />
      </AdminLayout>
    </AdminProtectedRoute>
  }
/>

<Route
  path="/admin/settings"
  element={
    <AdminProtectedRoute>
      <AdminLayout>
        <Settings />
      </AdminLayout>
    </AdminProtectedRoute>
  }
/>

      {/* Catch-all route to prevent 404 blank screens */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;