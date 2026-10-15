import { useState, useEffect } from "react";
import {
  Search,
  UserCheck,
  UserX,
  Users as UsersIcon,
  Shield,
  Loader2,
  Coins,
  Award
} from "lucide-react";
import { adminApi } from "../../api/apiClient";

function Users() {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await adminApi.getUsers();
      setUsers(data);
    } catch (err) {
      console.error("Failed to load users:", err);
      setError(err.message || "Failed to load users directory");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleStatus = async (user) => {
    try {
      setUpdatingId(user.user_id);
      const newBlocked = !user.is_blocked_from_trading;
      const res = await adminApi.updateUserStatus(user.user_id, { is_blocked: newBlocked });
      setUsers(prev => prev.map(u => u.user_id === user.user_id ? { ...u, is_blocked_from_trading: newBlocked } : u));
    } catch (err) {
      alert(err.message || "Failed to update user status");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    const text = search.toLowerCase();
    return (
      u.full_name?.toLowerCase().includes(text) ||
      u.email?.toLowerCase().includes(text) ||
      u.teaching_skills?.toLowerCase().includes(text)
    );
  });

  return (
    <div className="min-h-screen bg-[#06194F] text-white px-8 py-7">
      {/* Header */}
      <div className="flex items-start justify-between mb-7">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <UsersIcon size={24} className="text-blue-400" />
            User Management Directory
          </h1>
          <p className="text-blue-100 text-xs mt-1">
            Inspect all platform users, enforce trading blocks, and monitor community credit health
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#1A2E68] border border-[#2D458B] px-3.5 py-1.5 rounded-lg text-xs">
          <span className="text-blue-200">Total Registered:</span>
          <span className="font-bold text-white text-sm">{users.length}</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8EA1D0]" />
          <input
            type="text"
            placeholder="Search by student/teacher name, email, or skill..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#1A2E68] border border-[#2D458B] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-[#8EA1D0] outline-none focus:border-blue-400 transition"
          />
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/20 border border-rose-500/30 rounded-xl text-rose-200 text-xs mb-6">
          {error}
        </div>
      )}

      {/* Users Table */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-blue-200">
          <Loader2 size={32} className="animate-spin mb-3 text-blue-400" />
          <p className="text-sm">Loading users directory...</p>
        </div>
      ) : (
        <div className="bg-[#1A2E68] border border-[#2D458B] rounded-xl overflow-hidden shadow-lg">
          <div className="grid grid-cols-6 px-5 py-3 border-b border-[#2D458B] text-[10px] text-[#8EA1D0] uppercase font-bold tracking-wider">
            <span className="col-span-2">User</span>
            <span>Credits</span>
            <span>Reliability</span>
            <span>Trading Status</span>
            <span className="text-right">Actions</span>
          </div>

          {filteredUsers.length === 0 ? (
            <div className="py-12 text-center text-[#8EA1D0] text-xs">
              No users found matching your search.
            </div>
          ) : (
            filteredUsers.map((u) => (
              <div
                key={u.user_id}
                className="grid grid-cols-6 items-center px-5 py-4 border-b border-[#2D458B]/50 last:border-b-0 text-xs hover:bg-[#203679]/40 transition"
              >
                {/* User Info */}
                <div className="col-span-2 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-600 font-bold flex items-center justify-center shrink-0">
                    {u.full_name?.charAt(0) || "U"}
                  </div>
                  <div>
                    <div className="font-semibold text-white flex items-center gap-1.5">
                      {u.full_name}
                      {u.role === "admin" && (
                        <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[9px] px-1.5 py-0.2 rounded font-bold">
                          ADMIN
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-[#8EA1D0]">{u.email}</div>
                    {u.teaching_skills && (
                      <div className="text-[10px] text-blue-300 mt-0.5 truncate max-w-[200px]">
                        Teaches: {u.teaching_skills}
                      </div>
                    )}
                  </div>
                </div>

                {/* Credits */}
                <div className="flex items-center gap-1 text-amber-300 font-bold">
                  <Coins size={14} />
                  <span>{u.credit_balance.toFixed(2)} hrs</span>
                </div>

                {/* Reliability */}
                <div>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-md font-semibold border ${
                      u.reliability_score >= 90
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                        : u.reliability_score >= 60
                        ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                        : "bg-rose-500/20 text-rose-300 border-rose-500/30"
                    }`}
                  >
                    {u.reliability_score.toFixed(0)}%
                  </span>
                </div>

                {/* Status */}
                <div>
                  {u.is_blocked_from_trading ? (
                    <span className="inline-flex items-center gap-1 bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-full text-[10px] font-bold">
                      <UserX size={12} /> Blocked
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full text-[10px] font-bold">
                      <UserCheck size={12} /> Active
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="text-right">
                  {u.role !== "admin" ? (
                    <button
                      disabled={updatingId === u.user_id}
                      onClick={() => toggleStatus(u)}
                      className={`text-xs px-3 py-1 rounded-md font-medium transition ${
                        u.is_blocked_from_trading
                          ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                          : "bg-rose-600 hover:bg-rose-500 text-white"
                      } disabled:opacity-50`}
                    >
                      {updatingId === u.user_id
                        ? "Saving..."
                        : u.is_blocked_from_trading
                        ? "Unblock Trading"
                        : "Block Trading"}
                    </button>
                  ) : (
                    <span className="text-[11px] text-[#8EA1D0] italic">Protected Admin</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default Users;