import { useState, useEffect } from "react";
import {
  Search,
  ArrowLeftRight,
  Loader2,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Coins,
  Filter
} from "lucide-react";
import { adminApi } from "../../api/apiClient";

function AdminRequests() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await adminApi.getRequests({
        status: statusFilter,
        q: search
      });
      setRequests(data);
    } catch (err) {
      console.error("Failed to load requests:", err);
      setError(err.message || "Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchRequests();
  };

  return (
    <div className="min-h-screen bg-[#06194F] text-white px-8 py-7">
      {/* Header */}
      <div className="flex items-start justify-between mb-7">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ArrowLeftRight size={24} className="text-blue-400" />
            Global Trade Requests & Sessions
          </h1>
          <p className="text-blue-100 text-xs mt-1">
            Complete transaction oversight of peer exchanges, escrow commitments, and agreements
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#1A2E68] border border-[#2D458B] px-3.5 py-1.5 rounded-lg text-xs">
          <span className="text-blue-200">Total Requests:</span>
          <span className="font-bold text-white text-sm">{requests.length}</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8EA1D0]" />
          <input
            type="text"
            placeholder="Search by participant name or skill..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#1A2E68] border border-[#2D458B] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-[#8EA1D0] outline-none focus:border-blue-400 transition"
          />
        </form>

        <div className="flex items-center gap-2 bg-[#1A2E68] border border-[#2D458B] p-1 rounded-xl">
          {["all", "pending", "accepted", "completed", "cancelled"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium capitalize transition ${
                statusFilter === s
                  ? "bg-[#1463E8] text-white font-bold"
                  : "text-[#8EA1D0] hover:text-white"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/20 border border-rose-500/30 rounded-xl text-rose-200 text-xs mb-6">
          {error}
        </div>
      )}

      {/* Requests Table */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-blue-200">
          <Loader2 size={32} className="animate-spin mb-3 text-blue-400" />
          <p className="text-sm">Loading trade sessions...</p>
        </div>
      ) : (
        <div className="bg-[#1A2E68] border border-[#2D458B] rounded-xl overflow-hidden shadow-lg">
          <div className="grid grid-cols-12 px-5 py-3 border-b border-[#2D458B] text-[10px] text-[#8EA1D0] uppercase font-bold tracking-wider">
            <span className="col-span-1">ID</span>
            <span className="col-span-3">Requester (Student)</span>
            <span className="col-span-3">Provider (Teacher)</span>
            <span className="col-span-2">Skill / Escrow</span>
            <span className="col-span-2">Date Created</span>
            <span className="col-span-1 text-right">Status</span>
          </div>

          {requests.length === 0 ? (
            <div className="py-12 text-center text-[#8EA1D0] text-xs">
              No trade sessions found for the chosen filters.
            </div>
          ) : (
            requests.map((r) => (
              <div
                key={r.session_id}
                className="grid grid-cols-12 items-center px-5 py-4 border-b border-[#2D458B]/50 last:border-b-0 text-xs hover:bg-[#203679]/40 transition"
              >
                {/* ID */}
                <span className="col-span-1 font-mono text-[#8EA1D0]">
                  #{r.session_id}
                </span>

                {/* Requester */}
                <div className="col-span-3">
                  <span className="font-semibold text-white block">{r.requester_name}</span>
                  <span className="text-[10px] text-[#8EA1D0]">{r.requester_email}</span>
                </div>

                {/* Provider */}
                <div className="col-span-3">
                  <span className="font-semibold text-white block">{r.provider_name}</span>
                  <span className="text-[10px] text-[#8EA1D0]">{r.provider_email}</span>
                </div>

                {/* Skill & Escrow */}
                <div className="col-span-2">
                  <span className="font-medium text-blue-200 block">{r.skill_name}</span>
                  <span className="text-[10px] text-amber-300 font-semibold flex items-center gap-1 mt-0.5">
                    <Coins size={11} /> {parseFloat(r.duration_hours).toFixed(2)} hrs
                  </span>
                </div>

                {/* Date */}
                <div className="col-span-2 text-[11px] text-[#8EA1D0]">
                  {new Date(r.created_at).toLocaleDateString()} {new Date(r.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>

                {/* Status */}
                <div className="col-span-1 text-right">
                  {r.status === "completed" && (
                    <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full text-[10px] font-bold">
                      Completed
                    </span>
                  )}
                  {r.status === "accepted" && (
                    <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full text-[10px] font-bold">
                      Accepted
                    </span>
                  )}
                  {r.status === "pending" && (
                    <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full text-[10px] font-bold">
                      Pending
                    </span>
                  )}
                  {(r.status === "cancelled" || r.status === "rejected") && (
                    <span className="bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-full text-[10px] font-bold">
                      {r.status}
                    </span>
                  )}
                  {r.disputes_count > 0 && (
                    <span className="block mt-1 text-[9px] text-rose-400 font-bold">
                      ⚠️ Disputed
                    </span>
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

export default AdminRequests;