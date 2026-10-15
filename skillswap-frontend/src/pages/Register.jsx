import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

function Register() {
  const navigate = useNavigate();
  const { registerUser } = useAuth();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (
      !username.trim() ||
      !email.trim() ||
      !password.trim() ||
      !confirmPassword.trim()
    ) {
      setError("Please fill in all fields.");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      await registerUser(username, email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Failed to register account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#06194F] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-[460px] bg-white rounded-2xl shadow-xl px-8 py-9">
        <div className="text-center mb-7">
          <h1 className="text-[#06194F] text-[30px] font-bold">Create Account</h1>
          <p className="text-gray-500 text-sm mt-2">
            Join SkillSwap and receive 4.00 free hours initial credit!
          </p>
        </div>

        {error && (
          <div className="mb-5 bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-[#06194F] text-[16px] font-semibold mb-2">Full Name</label>
          <input
            type="text"
            placeholder="Enter your name"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setError("");
            }}
            className="w-full h-[48px] border border-gray-200 rounded-lg px-4 text-[16px] outline-none focus:border-[#0757D5]"
          />
        </div>

        <div className="mb-4">
          <label className="block text-[#06194F] text-[16px] font-semibold mb-2">Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
            className="w-full h-[48px] border border-gray-200 rounded-lg px-4 text-[16px] outline-none focus:border-[#0757D5]"
          />
        </div>

        <div className="mb-4">
          <label className="block text-[#06194F] text-[16px] font-semibold mb-2">Password</label>
          <input
            type="password"
            placeholder="Create a password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
            }}
            className="w-full h-[48px] border border-gray-200 rounded-lg px-4 text-[16px] outline-none focus:border-[#0757D5]"
          />
        </div>

        <div className="mb-6">
          <label className="block text-[#06194F] text-[16px] font-semibold mb-2">Confirm Password</label>
          <input
            type="password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setError("");
            }}
            className="w-full h-[48px] border border-gray-200 rounded-lg px-4 text-[16px] outline-none focus:border-[#0757D5]"
          />
        </div>

        <button
          type="button"
          disabled={loading}
          onClick={handleSignup}
          className="w-full h-[48px] bg-[#0757D5] hover:bg-[#064dbb] text-white rounded-lg text-[17px] font-semibold transition disabled:opacity-50"
        >
          {loading ? "Registering..." : "→ Sign Up"}
        </button>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-[#0757D5] font-semibold hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;