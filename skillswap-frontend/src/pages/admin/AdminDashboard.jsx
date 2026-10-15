import {
  Users,
  ArrowLeftRight,
  AlertTriangle,
  Coins,
  Download,
  Plus,
  Loader2,
  Calendar,
  CheckCircle2,
  Clock3,
  XCircle
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { adminApi } from "../../api/apiClient";

function AdminDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOverview = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await adminApi.getOverview();
      setData(res);
    } catch (err) {
      console.error("Failed to load admin overview:", err);
      setError(err.message || "Failed to load admin overview data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOverview();
  }, []);

  const stats = [
    {
      title: "REGISTERED USERS",
      value: data ? data.stats.total_users : "...",
      change: "Active Members",
      icon: Users,
      color: "text-blue-400",
      path: "/admin/users"
    },
    {
      title: "ACTIVE TRADES",
      value: data ? data.stats.active_trades : "...",
      change: "Pending & Accepted",
      icon: ArrowLeftRight,
      color: "text-amber-400",
      path: "/admin/requests"
    },
    {
      title: "PENDING DISPUTES",
      value: data ? data.stats.pending_disputes : "...",
      change: data?.stats.pending_disputes > 0 ? "Action Required" : "All Clear",
      icon: AlertTriangle,
      color: data?.stats.pending_disputes > 0 ? "text-rose-400" : "text-emerald-400",
      path: "/admin/disputes"
    },
    {
      title: "CIRCULATING CREDITS",
      value: data ? `${data.stats.total_credits} hrs` : "...",
      change: "Community Ledger",
      icon: Coins,
      color: "text-indigo-400",
      path: "/admin/analytics"
    },
  ];

  return (
    <div className="min-h-screen bg-[#06194F] text-white px-8 py-7">

      {/* ================= HEADER ================= */}
      <div className="flex items-start justify-between mb-7">
        <div>
          <h1 className="text-2xl font-bold">
            Platform Overview
          </h1>
          <p className="text-blue-100 text-xs mt-1">
            Live administrative monitoring of your peer skill-sharing ecosystem
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => navigate("/admin/disputes")}
            className="flex items-center gap-2 bg-[#1463E8] text-white px-4 py-2 rounded-md text-xs font-medium hover:bg-[#0f56ca] transition"
          >
            <AlertTriangle size={14} />
            Review Disputes
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-blue-200">
          <Loader2 size={32} className="animate-spin mb-3 text-blue-400" />
          <p className="text-sm">Loading platform overview...</p>
        </div>
      ) : error ? (
        <div className="p-4 bg-rose-500/20 border border-rose-500/40 rounded-xl text-rose-200 text-sm mb-6">
          {error}
        </div>
      ) : (
        <>
          {/* ================= STAT CARDS ================= */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-7">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.title}
                  onClick={() => navigate(stat.path)}
                  className="bg-[#1A2E68] border border-[#2D458B] rounded-xl p-5 hover:border-blue-400 transition cursor-pointer shadow-lg"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-2 rounded-lg bg-[#0E1E45] ${stat.color}`}>
                      <Icon size={20} />
                    </div>
                    <span className="text-[10px] bg-[#0E1E45] text-blue-300 px-2 py-1 rounded-full font-medium">
                      {stat.change}
                    </span>
                  </div>

                  <p className="text-[10px] text-[#8EA1D0] uppercase tracking-wider font-semibold">
                    {stat.title}
                  </p>

                  <h2 className="text-2xl font-extrabold mt-1 text-white">
                    {stat.value}
                  </h2>
                </div>
              );
            })}
          </div>

          {/* ================= RECENT ACTIVITY ================= */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-blue-200">
                Recent Trade Requests & Sessions
              </h2>

              <button
                onClick={() => navigate("/admin/requests")}
                className="text-xs text-blue-400 hover:text-white transition underline"
              >
                View All Requests →
              </button>
            </div>

            <div className="bg-[#1A2E68] rounded-xl overflow-hidden border border-[#2D458B] shadow-lg">
              {/* Table Header */}
              <div className="grid grid-cols-5 px-5 py-3 border-b border-[#2D458B] text-[10px] text-[#8EA1D0] uppercase font-bold tracking-wider">
                <span>Requester (Student)</span>
                <span>Provider (Teacher)</span>
                <span>Skill Exchanged</span>
                <span>Duration</span>
                <span>Status</span>
              </div>

              {/* Table Rows */}
              {(!data?.recent_activity || data.recent_activity.length === 0) ? (
                <div className="py-8 text-center text-[#8EA1D0] text-xs">
                  No trade activity recorded yet.
                </div>
              ) : (
                data.recent_activity.map((activity) => (
                  <div
                    key={activity.session_id}
                    className="grid grid-cols-5 items-center px-5 py-3.5 border-b border-[#2D458B]/50 last:border-b-0 text-xs hover:bg-[#203679]/40 transition"
                  >
                    <span className="text-white font-medium">
                      {activity.requester_name}
                    </span>

                    <span className="text-blue-100">
                      {activity.provider_name}
                    </span>

                    <span className="text-blue-200 font-medium">
                      {activity.skill_name}
                    </span>

                    <span className="text-[#8EA1D0] text-[11px]">
                      {activity.duration_hours} hrs
                    </span>

                    <span>
                      {activity.status === "completed" && (
                        <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full text-[10px] font-semibold">
                          <CheckCircle2 size={11} /> Completed
                        </span>
                      )}
                      {activity.status === "accepted" && (
                        <span className="inline-flex items-center gap-1 bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full text-[10px] font-semibold">
                          <Clock3 size={11} /> Accepted
                        </span>
                      )}
                      {activity.status === "pending" && (
                        <span className="inline-flex items-center gap-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full text-[10px] font-semibold">
                          <Clock3 size={11} /> Pending
                        </span>
                      )}
                      {(activity.status === "cancelled" || activity.status === "rejected") && (
                        <span className="inline-flex items-center gap-1 bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-full text-[10px] font-semibold">
                          <XCircle size={11} /> {activity.status}
                        </span>
                      )}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default AdminDashboard;