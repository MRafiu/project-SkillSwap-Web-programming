import { useState, useEffect } from "react";
import {
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  Coins,
  ShieldAlert,
  ArrowRight,
  Clock,
  X
} from "lucide-react";
import { adminApi } from "../../api/apiClient";

function Disputes() {
  const [search, setSearch] = useState("");
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Resolution Modal State
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [actionChoice, setActionChoice] = useState("refund_requester");
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [penaltyAgainst, setPenaltyAgainst] = useState(true);
  const [resolving, setResolving] = useState(false);

  const fetchDisputes = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await adminApi.getDisputes();
      setDisputes(data);
    } catch (err) {
      console.error("Failed to load disputes:", err);
      setError(err.message || "Failed to load disputes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisputes();
  }, []);

  const handleOpenResolve = (dispute) => {
    setSelectedDispute(dispute);
    setActionChoice("refund_requester");
    setResolutionNotes("");
    setPenaltyAgainst(true);
  };

  const handleConfirmResolve = async () => {
    if (!selectedDispute) return;
    try {
      setResolving(true);
      await adminApi.resolveDispute(selectedDispute.dispute_id, {
        status: "resolved",
        resolution_action: actionChoice,
        resolution_notes: resolutionNotes.trim() || `Resolved with action: ${actionChoice}`,
        penalty_against: penaltyAgainst
      });
      setSelectedDispute(null);
      await fetchDisputes();
    } catch (err) {
      alert(err.message || "Failed to resolve dispute");
    } finally {
      setResolving(false);
    }
  };

  const handleRejectDispute = async (disputeId) => {
    const confirm = window.confirm("Are you sure you want to dismiss and reject this dispute?");
    if (!confirm) return;

    try {
      await adminApi.resolveDispute(disputeId, {
        status: "rejected",
        resolution_action: "none",
        resolution_notes: "Dispute investigated and rejected by administrator."
      });
      await fetchDisputes();
    } catch (err) {
      alert(err.message || "Failed to reject dispute");
    }
  };

  const filteredDisputes = disputes.filter((d) => {
    const text = search.toLowerCase();
    return (
      d.raised_by_name?.toLowerCase().includes(text) ||
      d.against_name?.toLowerCase().includes(text) ||
      d.skill_name?.toLowerCase().includes(text) ||
      d.reason?.toLowerCase().includes(text) ||
      d.status?.toLowerCase().includes(text)
    );
  });

  return (
    <div className="min-h-screen bg-[#06194F] text-white px-8 py-7">
      {/* Header */}
      <div className="flex items-start justify-between mb-7">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <AlertTriangle size={24} className="text-rose-400" />
            Dispute Resolution Center
          </h1>
          <p className="text-blue-100 text-xs mt-1">
            Investigate trade disputes, trigger atomic credit rollbacks, and penalize anti-social behavior
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#1A2E68] border border-[#2D458B] px-3.5 py-1.5 rounded-lg text-xs">
          <span className="text-blue-200">Open Disputes:</span>
          <span className="font-bold text-rose-300 text-sm">
            {disputes.filter(d => d.status === "open" || d.status === "under_review").length}
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8EA1D0]" />
          <input
            type="text"
            placeholder="Search disputes by participant, skill, or reason..."
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

      {/* Disputes Table */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-blue-200">
          <Loader2 size={32} className="animate-spin mb-3 text-blue-400" />
          <p className="text-sm">Loading dispute records...</p>
        </div>
      ) : (
        <div className="bg-[#1A2E68] border border-[#2D458B] rounded-xl overflow-hidden shadow-lg">
          <div className="grid grid-cols-12 px-5 py-3 border-b border-[#2D458B] text-[10px] text-[#8EA1D0] uppercase font-bold tracking-wider">
            <span className="col-span-1">ID</span>
            <span className="col-span-3">Participants</span>
            <span className="col-span-2">Skill / Escrow</span>
            <span className="col-span-3">Reason / Details</span>
            <span className="col-span-1">Status</span>
            <span className="col-span-2 text-right">Actions</span>
          </div>

          {filteredDisputes.length === 0 ? (
            <div className="py-12 text-center text-[#8EA1D0] text-xs">
              No disputes found. All trades are peaceful!
            </div>
          ) : (
            filteredDisputes.map((d) => (
              <div
                key={d.dispute_id}
                className="grid grid-cols-12 items-center px-5 py-4 border-b border-[#2D458B]/50 last:border-b-0 text-xs hover:bg-[#203679]/40 transition"
              >
                {/* ID */}
                <span className="col-span-1 font-mono text-[#8EA1D0]">
                  #{d.dispute_id}
                </span>

                {/* Participants */}
                <div className="col-span-3">
                  <div className="font-semibold text-white flex items-center gap-1">
                    <span className="text-rose-300 font-bold">{d.raised_by_name}</span>
                    <span className="text-[#8EA1D0] text-[10px]">reported</span>
                    <span className="text-amber-300 font-bold">{d.against_name}</span>
                  </div>
                  <div className="text-[10px] text-[#8EA1D0] mt-0.5">
                    Session #{d.session_id} • Status: {d.session_status}
                  </div>
                </div>

                {/* Skill & Escrow */}
                <div className="col-span-2">
                  <div className="font-medium text-blue-200">{d.skill_name}</div>
                  <div className="text-[11px] text-amber-300 flex items-center gap-1 font-semibold mt-0.5">
                    <Coins size={12} /> {parseFloat(d.duration_hours).toFixed(2)} hrs escrow
                  </div>
                </div>

                {/* Reason & Resolution Notes */}
                <div className="col-span-3 pr-4">
                  <div className="text-white text-xs leading-relaxed italic bg-[#0E1E45] p-2 rounded-lg border border-[#2D458B]/40">
                    "{d.reason}"
                  </div>
                  {d.resolution_notes && (
                    <div className="text-[10px] text-emerald-300 mt-1">
                      Resolution: {d.resolution_notes}
                    </div>
                  )}
                </div>

                {/* Status */}
                <div className="col-span-1">
                  {d.status === "open" && (
                    <span className="bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-full text-[10px] font-bold">
                      Open
                    </span>
                  )}
                  {d.status === "under_review" && (
                    <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full text-[10px] font-bold">
                      Review
                    </span>
                  )}
                  {d.status === "resolved" && (
                    <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full text-[10px] font-bold">
                      Resolved
                    </span>
                  )}
                  {d.status === "rejected" && (
                    <span className="bg-gray-500/20 text-gray-400 border border-gray-500/30 px-2 py-0.5 rounded-full text-[10px] font-bold">
                      Rejected
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="col-span-2 flex items-center justify-end gap-2">
                  {d.status === "open" || d.status === "under_review" ? (
                    <>
                      <button
                        onClick={() => handleOpenResolve(d)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-3 py-1.5 rounded-lg font-semibold transition"
                      >
                        Resolve
                      </button>
                      <button
                        onClick={() => handleRejectDispute(d.dispute_id)}
                        className="bg-rose-600/30 hover:bg-rose-600 text-rose-200 text-xs px-2.5 py-1.5 rounded-lg font-medium transition"
                      >
                        Dismiss
                      </button>
                    </>
                  ) : (
                    <span className="text-[10px] text-[#8EA1D0] italic">
                      Closed {d.resolved_at ? new Date(d.resolved_at).toLocaleDateString() : ""}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Resolution Modal */}
      {selectedDispute && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1A2E68] border border-[#2D458B] rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#2D458B]">
              <div className="flex items-center gap-2">
                <ShieldAlert size={20} className="text-blue-400" />
                <h3 className="text-lg font-bold text-white">
                  Resolve Dispute #{selectedDispute.dispute_id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedDispute(null)}
                className="text-gray-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs">
              <div className="bg-[#0E1E45] p-3 rounded-xl border border-[#2D458B]/50 space-y-1">
                <div>
                  <span className="text-[#8EA1D0]">Filing Party: </span>
                  <span className="font-bold text-white">{selectedDispute.raised_by_name}</span>
                </div>
                <div>
                  <span className="text-[#8EA1D0]">Offending Party: </span>
                  <span className="font-bold text-amber-300">{selectedDispute.against_name}</span>
                </div>
                <div>
                  <span className="text-[#8EA1D0]">Disputed Reason: </span>
                  <span className="text-rose-200 italic">"{selectedDispute.reason}"</span>
                </div>
                <div>
                  <span className="text-[#8EA1D0]">Escrow Amount: </span>
                  <span className="text-amber-300 font-bold">{parseFloat(selectedDispute.duration_hours).toFixed(2)} Time Credits</span>
                </div>
              </div>

              {/* Action Selection */}
              <div>
                <label className="block text-xs font-semibold uppercase text-blue-200 mb-2">
                  Choose Financial Resolution Action:
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2.5 p-2.5 bg-[#0E1E45] border border-[#2D458B] rounded-xl cursor-pointer hover:border-blue-400 transition">
                    <input
                      type="radio"
                      name="actionChoice"
                      value="refund_requester"
                      checked={actionChoice === "refund_requester"}
                      onChange={(e) => setActionChoice(e.target.value)}
                    />
                    <div>
                      <div className="font-bold text-white">Refund Escrow to Requester (Student)</div>
                      <div className="text-[10px] text-[#8EA1D0]">Restores locked credit balance back to student.</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 p-2.5 bg-[#0E1E45] border border-[#2D458B] rounded-xl cursor-pointer hover:border-blue-400 transition">
                    <input
                      type="radio"
                      name="actionChoice"
                      value="compensate_provider"
                      checked={actionChoice === "compensate_provider"}
                      onChange={(e) => setActionChoice(e.target.value)}
                    />
                    <div>
                      <div className="font-bold text-white">Release Escrow to Provider (Teacher)</div>
                      <div className="text-[10px] text-[#8EA1D0]">Finalizes payment transfer to teacher for rendered instruction.</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 p-2.5 bg-[#0E1E45] border border-[#2D458B] rounded-xl cursor-pointer hover:border-blue-400 transition">
                    <input
                      type="radio"
                      name="actionChoice"
                      value="none"
                      checked={actionChoice === "none"}
                      onChange={(e) => setActionChoice(e.target.value)}
                    />
                    <div>
                      <div className="font-bold text-white">No Credit Transfer (Close without adjustment)</div>
                      <div className="text-[10px] text-[#8EA1D0]">Resolves dispute without executing any financial rollback.</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Penalty Toggle */}
              <div className="p-3 bg-[#0E1E45] border border-[#2D458B] rounded-xl flex items-center gap-3">
                <input
                  type="checkbox"
                  id="penaltyCheck"
                  checked={penaltyAgainst}
                  onChange={(e) => setPenaltyAgainst(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="penaltyCheck" className="text-xs text-white cursor-pointer">
                  Dock <span className="text-rose-400 font-bold">-15.00% Reliability Penalty</span> from {selectedDispute.against_name} for verified community violation.
                </label>
              </div>

              {/* Resolution Notes */}
              <div>
                <label className="block text-xs font-semibold uppercase text-blue-200 mb-1">
                  Investigation & Resolution Notes:
                </label>
                <textarea
                  rows={3}
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Explain why this decision was reached for official audit logs..."
                  className="w-full bg-[#0E1E45] border border-[#2D458B] rounded-xl p-3 text-xs text-white placeholder-[#8EA1D0] outline-none focus:border-blue-400 transition"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#2D458B]">
              <button
                disabled={resolving}
                onClick={() => setSelectedDispute(null)}
                className="px-4 py-2 rounded-lg text-xs font-medium text-[#8EA1D0] hover:text-white transition"
              >
                Cancel
              </button>
              <button
                disabled={resolving}
                onClick={handleConfirmResolve}
                className="px-5 py-2 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center gap-1.5 disabled:opacity-50"
              >
                {resolving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                {resolving ? "Executing Resolution..." : "Confirm & Execute Resolution"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Disputes;
