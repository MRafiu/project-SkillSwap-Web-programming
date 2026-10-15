import {
  LayoutGrid,
  UserRound,
  BookOpen,
  Search,
  MessageSquare,
  ArrowLeftRight,
  LogOut,
  Clock3,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Star,
  X,
  Trophy,
  ShieldAlert,
  AlertTriangle,
  Calendar,
  Video,
  Copy,
  Check,
  Award
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { sessionApi, reviewApi, disputeApi, certificateApi } from "../api/apiClient";
import CertificateModal from "../components/CertificateModal";
import { useAuth } from "../context/AuthContext";

function Requests() {
  const navigate = useNavigate();
  const { user, logoutUser, refreshUser } = useAuth();

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");
  const [copiedSessionId, setCopiedSessionId] = useState(null);

  // Reviews state
  const [reviewsMap, setReviewsMap] = useState({});
  const [reviewModalSession, setReviewModalSession] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState("");

  // Dispute state
  const [disputesMap, setDisputesMap] = useState({});
  const [disputeModalSession, setDisputeModalSession] = useState(null);
  const [disputeReason, setDisputeReason] = useState("");
  const [disputeSubmitting, setDisputeSubmitting] = useState(false);
  const [disputeError, setDisputeError] = useState("");
  const [selectedCertificate, setSelectedCertificate] = useState(null);

  const handleViewCertificate = async (sess) => {
    try {
      if (sess.certificate_uuid) {
        const cert = await certificateApi.getCertificate(sess.certificate_uuid);
        setSelectedCertificate(cert);
      }
    } catch (err) {
      console.error("Failed to load certificate:", err);
    }
  };

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const data = await sessionApi.getSessions();
      setSessions(data);
      await fetchReviewsForCompletedSessions(data);
      await fetchMyDisputes();
    } catch (err) {
      console.error("Error fetching sessions:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyDisputes = async () => {
    try {
      const disputes = await disputeApi.getMyDisputes();
      const map = {};
      for (const d of disputes) {
        map[d.session_id] = d;
      }
      setDisputesMap(map);
    } catch (e) {
      // ignore
    }
  };

  const fetchReviewsForCompletedSessions = async (sessionList) => {
    const completed = sessionList.filter(s => s.status === 'completed');
    const newMap = {};
    for (const s of completed) {
      try {
        const revs = await reviewApi.getSessionReviews(s.session_id);
        const myRev = revs.find(r => parseInt(r.reviewer_id, 10) === parseInt(user?.user_id, 10));
        if (myRev) {
          newMap[s.session_id] = myRev;
        }
      } catch (e) {
        // ignore
      }
    }
    setReviewsMap(newMap);
  };

  useEffect(() => {
    fetchSessions();
  }, [user?.user_id]);

  const handleOpenDisputeModal = (session) => {
    setDisputeModalSession(session);
    setDisputeReason("");
    setDisputeError("");
  };

  const handleSubmitDispute = async (e) => {
    e.preventDefault();
    if (!disputeReason.trim()) {
      setDisputeError("Please detail the issue you experienced.");
      return;
    }

    try {
      setDisputeSubmitting(true);
      setDisputeError("");
      await disputeApi.fileDispute(disputeModalSession.session_id, disputeReason.trim());
      setActionSuccess("Dispute filed successfully. Platform administrators will investigate.");
      setDisputeModalSession(null);
      await fetchSessions();
    } catch (err) {
      setDisputeError(err.message || "Failed to file dispute.");
    } finally {
      setDisputeSubmitting(false);
    }
  };

  const handleStatusChange = async (sessionId, status) => {
    setActionError("");
    setActionSuccess("");

    try {
      const res = await sessionApi.updateStatus(sessionId, status);
      setActionSuccess(res.message || `Session status updated to ${status}`);
      await fetchSessions();
      await refreshUser();
    } catch (err) {
      setActionError(err.message || `Failed to update status to ${status}`);
    }
  };

  const handleOpenReviewModal = (session) => {
    setReviewModalSession(session);
    setReviewRating(5);
    setHoverRating(0);
    setReviewComment("");
    setReviewError("");
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewModalSession) return;
    setReviewSubmitting(true);
    setReviewError("");

    try {
      await reviewApi.submitReview(reviewModalSession.session_id, reviewRating, reviewComment);
      setActionSuccess(`Review submitted for Session #${reviewModalSession.session_id}!`);
      setReviewModalSession(null);
      await fetchSessions();
    } catch (err) {
      setReviewError(err.message || "Failed to submit review");
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  const menuItems = [
    { name: "Dashboard", icon: LayoutGrid, path: "/dashboard" },
    { name: "Leaderboard", icon: Trophy, path: "/leaderboard" },
    { name: "My Profile", icon: UserRound, path: "/profile" },
    { name: "Skills", icon: BookOpen, path: "/discover" },
    { name: "Search", icon: Search, path: "/discover" },
    { name: "Messages", icon: MessageSquare, path: "/messages" },
    { name: "Requests", icon: ArrowLeftRight, path: "/requests" },
  ];

  return (
    <div className="min-h-screen bg-[#06194F] text-white">
      <div className="min-h-screen flex">
        {/* SIDEBAR */}
        <aside className="hidden md:flex w-[280px] bg-[#F2F3FF] text-[#26365D] flex-col shrink-0 border-r border-[#D9DEFA]">
          <div className="px-7 pt-7 pb-8">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-[#2864E8] flex items-center justify-center">
                <span className="text-white font-bold text-lg">↕</span>
              </div>
              <span className="text-[#06194F] text-[22px] font-extrabold">SkillSwap</span>
            </div>
          </div>

          <nav className="px-3 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = item.name === "Requests";
              return (
                <button
                  key={item.name}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${
                    active
                      ? "bg-[#2864E8] text-white shadow-sm"
                      : "text-[#3F465F] hover:bg-[#E3E7FF]"
                  }`}
                >
                  <Icon size={17} />
                  {item.name}
                </button>
              );
            })}
          </nav>

          <div className="mt-auto px-3 pb-6">
            <button
              onClick={() => navigate("/post-skill")}
              className="w-full bg-[#2864E8] text-white py-3 rounded-lg font-semibold text-sm hover:bg-[#1D55CC] transition"
            >
              + Post a Skill
            </button>

            <div className="mt-6 space-y-1">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[#3F465F] hover:bg-[#E3E7FF] rounded-lg"
              >
                <LogOut size={17} />
                Log out
              </button>
            </div>
          </div>
        </aside>

        {/* MAIN */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-[1100px] mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-extrabold text-white">Session Requests & Lifecycle</h1>
                <p className="text-[#9DAACB] text-sm mt-1">
                  Manage requests and trigger atomic credit transfers on session completion.
                </p>
              </div>
              <button
                onClick={() => navigate("/discover")}
                className="bg-[#2864E8] hover:bg-[#1D55CC] text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition"
              >
                + Request New Session
              </button>
            </div>

            {actionError && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                <AlertCircle size={18} />
                {actionError}
              </div>
            )}

            {actionSuccess && (
              <div className="bg-emerald-500/20 border border-emerald-500/50 text-emerald-200 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                <CheckCircle2 size={18} />
                {actionSuccess}
              </div>
            )}

            {loading ? (
              <div className="py-12 text-center text-[#9DAACB]">Loading session requests...</div>
            ) : sessions.length === 0 ? (
              <div className="py-12 text-center bg-[#1A2E68] border border-[#2D458B] rounded-2xl text-[#9DAACB]">
                No session requests found. Explore teachers in 'Search' to start a swap!
              </div>
            ) : (
              <div className="space-y-4">
                {sessions.map((sess) => {
                  const isRequester = parseInt(sess.requester_id, 10) === parseInt(user?.user_id, 10);
                  const isProvider = parseInt(sess.provider_id, 10) === parseInt(user?.user_id, 10);

                  return (
                    <div
                      key={sess.session_id}
                      className="bg-[#1A2E68] border border-[#2D458B] rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                            sess.status === 'completed'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : sess.status === 'accepted'
                              ? 'bg-blue-500/20 text-blue-300'
                              : sess.status === 'pending'
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'bg-rose-500/20 text-rose-300'
                          }`}>
                            {sess.status}
                          </span>
                          <span className="text-xs text-[#8EA1D0]">Session #{sess.session_id}</span>
                        </div>

                        <h3 className="text-lg font-bold text-white pt-1">
                          Skill: <span className="text-[#4D91FF]">{sess.skill_name}</span>
                        </h3>

                        <div className="text-sm text-[#D9DEFA] space-y-0.5">
                          <p>
                            <strong>Role:</strong> {isRequester ? "Learner (Requester)" : "Teacher (Provider)"}
                          </p>
                          <p>
                            <strong>Counterpart:</strong>{" "}
                            <button
                              onClick={() => navigate(`/profile/${isRequester ? sess.provider_id : sess.requester_id}`)}
                              className="text-[#4D91FF] hover:underline font-semibold"
                              title="View partner profile"
                            >
                              {isRequester ? sess.provider_name : sess.requester_name}
                            </button>{" "}
                            <span className="text-xs text-[#8EA1D0]">({isRequester ? sess.provider_email : sess.requester_email})</span>
                          </p>
                          <p className="flex items-center gap-1.5 text-amber-300 font-medium pt-0.5">
                            <Clock3 size={15} /> Duration: {sess.duration_hours.toFixed(2)} hours credit
                          </p>
                          {sess.session_date && (
                            <p className="flex items-center gap-1.5 text-blue-300 font-medium pt-0.5 text-xs">
                              <Calendar size={14} className="text-blue-400" />
                              Scheduled: <span className="font-semibold text-white">{sess.session_date}</span> {sess.session_time ? `• ${sess.session_time}` : ''}
                            </p>
                          )}

                          {/* Google Meet Link for Booked Session */}
                          {sess.provider_meet_link ? (
                            <div className="mt-3 p-3 bg-[#0F2154] border border-emerald-500/30 rounded-xl flex flex-wrap items-center justify-between gap-3">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                                  <Video size={16} />
                                </div>
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-bold text-white">
                                      {isProvider ? "Your Google Meet Room" : "Teacher's Google Meet Room"}
                                    </span>
                                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-semibold">
                                      Session Link
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-[#8EA1D0] font-mono truncate max-w-[240px] sm:max-w-[340px]">
                                    {sess.provider_meet_link}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText(sess.provider_meet_link);
                                    setCopiedSessionId(sess.session_id);
                                    setTimeout(() => setCopiedSessionId(null), 2000);
                                  }}
                                  className="px-2.5 py-1.5 bg-[#1A2E68] hover:bg-[#203679] border border-[#2D458B] text-xs font-semibold text-[#8EA1D0] hover:text-white rounded-lg transition flex items-center gap-1"
                                  title="Copy Meet link"
                                >
                                  {copiedSessionId === sess.session_id ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                                  {copiedSessionId === sess.session_id ? "Copied" : "Copy"}
                                </button>
                                <a
                                  href={sess.provider_meet_link}
                                  target="_blank"
                                  rel="noreferrer noopener"
                                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition shadow"
                                  title="Join Google Meet session in new tab"
                                >
                                  <Video size={13} /> Join Meet
                                </a>
                              </div>
                            </div>
                          ) : (
                            <div className="mt-2 text-xs text-[#8EA1D0] italic flex items-center gap-1.5">
                              <Video size={13} className="text-gray-500" /> Teacher has not set their Google Meet link yet.
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons based on Status & Role */}
                      <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
                        <button
                          onClick={() => navigate(`/messages?user=${isRequester ? sess.provider_id : sess.requester_id}`)}
                          className="px-3.5 py-2 bg-[#142654] hover:bg-[#203679] text-[#9DAACB] hover:text-white border border-[#2D458B] text-xs font-semibold rounded-xl transition flex items-center gap-1.5"
                          title="Chat with partner"
                        >
                          <MessageSquare size={14} className="text-blue-400" /> Chat
                        </button>

                        {sess.status === 'pending' && isProvider && (
                          <>
                            <button
                              onClick={() => handleStatusChange(sess.session_id, 'accepted')}
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition"
                            >
                              Accept Request
                            </button>
                            <button
                              onClick={() => handleStatusChange(sess.session_id, 'rejected')}
                              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold rounded-xl transition"
                            >
                              Reject Request
                            </button>
                          </>
                        )}

                        {(sess.status === 'pending' || sess.status === 'accepted') && (
                          <button
                            onClick={() => handleStatusChange(sess.session_id, 'completed')}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition flex items-center gap-1.5"
                          >
                            <CheckCircle2 size={16} /> Mark Completed & Transfer Credits
                          </button>
                        )}

                        {sess.status === 'pending' && isRequester && (
                          <button
                            onClick={() => handleStatusChange(sess.session_id, 'cancelled')}
                            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-semibold rounded-xl transition"
                          >
                            Cancel Request
                          </button>
                        )}

                        {sess.status === 'completed' && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-emerald-300 bg-emerald-500/20 px-3 py-1.5 rounded-xl font-semibold">
                              ✓ Credits Transferred
                            </span>

                            {sess.certificate_uuid && (
                              <button
                                onClick={() => handleViewCertificate(sess)}
                                className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow"
                                title="View & Download Verified Certificate"
                              >
                                <Award size={14} /> Certificate
                              </button>
                            )}

                            {reviewsMap[sess.session_id] ? (
                              <span className="text-xs text-amber-300 bg-amber-500/20 border border-amber-500/30 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1">
                                <Star size={13} className="fill-amber-300" />
                                Reviewed ({reviewsMap[sess.session_id].rating}/5)
                              </span>
                            ) : (
                              <button
                                onClick={() => handleOpenReviewModal(sess)}
                                className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-[#06194F] text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow"
                              >
                                <Star size={14} className="fill-[#06194F]" /> Leave Review
                              </button>
                            )}
                          </div>
                        )}

                        {/* Dispute Option for Accepted and Completed Sessions */}
                        {(sess.status === 'accepted' || sess.status === 'completed') && (
                          <div className="flex items-center">
                            {disputesMap[sess.session_id] ? (
                              <span className="text-xs text-rose-300 bg-rose-500/20 border border-rose-500/30 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5">
                                <ShieldAlert size={14} className="text-rose-400" />
                                Disputed ({disputesMap[sess.session_id].status})
                              </span>
                            ) : (
                              <button
                                onClick={() => handleOpenDisputeModal(sess)}
                                className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold rounded-xl transition flex items-center gap-1.5"
                                title="Report an issue or breach of agreement"
                              >
                                <ShieldAlert size={14} /> Report Issue
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* REVIEW MODAL */}
      {reviewModalSession && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#0F2154] border border-[#2D458B] rounded-2xl p-6 w-full max-w-[460px] shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Star className="text-amber-400 fill-amber-400" size={20} />
                Review Session #{reviewModalSession.session_id}
              </h3>
              <button
                onClick={() => setReviewModalSession(null)}
                className="text-gray-400 hover:text-white transition"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-[#8EA1D0] mb-5">
              How was your skill exchange for <strong>{reviewModalSession.skill_name}</strong>? Your feedback helps build trust in the community.
            </p>

            {reviewError && (
              <div className="mb-4 bg-red-500/20 border border-red-500/50 text-red-200 text-xs px-3.5 py-2.5 rounded-xl">
                {reviewError}
              </div>
            )}

            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#8EA1D0] mb-2">
                  Rating (1 to 5 Stars)
                </label>
                <div className="flex items-center gap-2 py-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 focus:outline-none transition transform hover:scale-110"
                    >
                      <Star
                        size={28}
                        className={`${
                          (hoverRating || reviewRating) >= star
                            ? "text-amber-400 fill-amber-400"
                            : "text-gray-600 hover:text-amber-300"
                        } transition`}
                      />
                    </button>
                  ))}
                  <span className="text-sm font-bold text-amber-300 ml-2">
                    {reviewRating} of 5 Stars
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#8EA1D0] mb-1.5">
                  Your Review / Comment
                </label>
                <textarea
                  rows={3}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share details about punctuality, clarity, and overall experience..."
                  className="w-full bg-[#1A2E68] border border-[#2D458B] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#2864E8] resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewModalSession(null)}
                  className="w-1/2 py-2.5 bg-[#1A2E68] hover:bg-[#203679] text-[#8EA1D0] rounded-xl font-semibold text-sm transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reviewSubmitting}
                  className="w-1/2 py-2.5 bg-[#2864E8] hover:bg-[#1D55CC] text-white rounded-xl font-semibold text-sm transition disabled:opacity-50"
                >
                  {reviewSubmitting ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DISPUTE MODAL */}
      {disputeModalSession && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#0F2154] border border-[#2D458B] rounded-2xl p-6 w-full max-w-[460px] shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <ShieldAlert className="text-rose-400" size={20} />
                Report Issue (Session #{disputeModalSession.session_id})
              </h3>
              <button
                onClick={() => setDisputeModalSession(null)}
                className="text-gray-400 hover:text-white transition"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-[#8EA1D0] mb-4">
              Experiencing an issue with <strong>{disputeModalSession.skill_name}</strong>? Please provide details so administrators can investigate and resolve escrow/credit claims.
            </p>

            {disputeError && (
              <div className="mb-4 bg-red-500/20 border border-red-500/50 text-red-200 text-xs px-3.5 py-2.5 rounded-xl">
                {disputeError}
              </div>
            )}

            <form onSubmit={handleSubmitDispute} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#8EA1D0] mb-1.5">
                  Reason / Problem Details
                </label>
                <textarea
                  rows={4}
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  placeholder="Describe what went wrong (e.g. counterpart didn't show up, stopped midway, inappropriate conduct, unfulfilled trade)..."
                  className="w-full bg-[#1A2E68] border border-[#2D458B] rounded-xl px-4 py-3 text-white text-xs outline-none focus:border-rose-400 resize-none leading-relaxed"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDisputeModalSession(null)}
                  className="w-1/2 py-2.5 bg-[#1A2E68] hover:bg-[#203679] text-[#8EA1D0] rounded-xl font-semibold text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={disputeSubmitting}
                  className="w-1/2 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold text-xs transition disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {disputeSubmitting ? "Submitting..." : "Submit to Admin"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CERTIFICATE MODAL */}
      {selectedCertificate && (
        <CertificateModal
          certificate={selectedCertificate}
          onClose={() => setSelectedCertificate(null)}
        />
      )}
    </div>
  );
}

export default Requests;
