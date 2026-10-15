import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, Loader2 } from "lucide-react";
import { authApi, setAuthToken } from "../../api/apiClient";
import { useAuth } from "../../context/AuthContext";

function AdminLogin() {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAdminLogin = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password) {
      setError("Please enter your admin email and password.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await authApi.login(email.trim(), password);

      if (res.user?.role !== 'admin') {
        setAuthToken(null);
        localStorage.removeItem("isAdmin");
        setError("Access denied: This account does not possess administrator privileges.");
        return;
      }

      setAuthToken(res.token);
      localStorage.setItem("isAdmin", "true");
      await refreshUser();
      navigate("/admin");
    } catch (err) {
      console.error("Admin login error:", err);
      setError(err.message || "Invalid administrator credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#06194F] flex items-center justify-center px-4">
      <div className="w-full max-w-[440px] bg-white rounded-2xl shadow-xl p-8">

        {/* Header */}
        <div className="text-center mb-7">
          <div className="w-14 h-14 mx-auto rounded-xl bg-[#4F46E5] flex items-center justify-center mb-4">
            <ShieldCheck size={28} className="text-white" />
          </div>

          <h1 className="text-[#06194F] text-[28px] font-bold">
            Admin Login
          </h1>

          <p className="text-gray-500 text-sm mt-2">
            Sign in to access the SkillSwap admin panel
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleAdminLogin}>

          {/* Email */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Admin Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              placeholder="Enter admin email"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#4F46E5]"
            />
          </div>

          {/* Password */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              placeholder="Enter admin password"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#4F46E5]"
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-red-500 text-xs mb-4">
              {error}
            </p>
          )}

          {/* Login button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#4F46E5] hover:bg-[#4338CA] text-white py-3 rounded-lg font-semibold text-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : null}
            {loading ? "Authenticating..." : "Login as Admin"}
          </button>

        </form>

        {/* Back */}
        <button
          onClick={() => navigate("/login")}
          className="w-full mt-4 text-sm text-gray-500 hover:text-[#4F46E5]"
        >
          ← Back to User Login
        </button>

      </div>
    </div>
  );
}

export default AdminLogin;