import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { loginUser } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      await loginUser(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Failed to log in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#06194F] flex items-center justify-center px-4">
      <div className="w-full max-w-[460px] bg-white rounded-2xl shadow-xl px-8 py-9">
        <div className="text-center mb-7">
          <h1 className="text-[#06194F] text-[30px] font-bold">Login</h1>
          <p className="text-gray-500 text-sm mt-2">Welcome back to SkillSwap</p>
        </div>

        {error && (
          <div className="mb-5 bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-[#06194F] text-[16px] font-semibold mb-2">Email</label>
          <input
            type="email"
            placeholder="Enter your Email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
            className="w-full h-[48px] border border-gray-200 rounded-lg px-4 text-[16px] outline-none focus:border-[#0757D5]"
          />
        </div>

        <div className="mb-6">
          <label className="block text-[#06194F] text-[16px] font-semibold mb-2">Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
            }}
            className="w-full h-[48px] border border-gray-200 rounded-lg px-4 text-[16px] outline-none focus:border-[#0757D5]"
          />
        </div>

        <button
          type="button"
          disabled={loading}
          onClick={handleLogin}
          className="w-full h-[48px] bg-[#0757D5] hover:bg-[#064dbb] text-white rounded-lg text-[17px] font-semibold transition disabled:opacity-50"
        >
          {loading ? "Logging in..." : "→ Login"}
        </button>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account?{" "}
          <span
            onClick={() => navigate("/register")}
            className="text-[#0757D5] font-semibold cursor-pointer hover:underline"
          >
            Sign Up
          </span>
        </p>
      </div>
    </div>
  );
}

export default Login;