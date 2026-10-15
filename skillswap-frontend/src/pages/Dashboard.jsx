import {
  LayoutGrid,
  UserRound,
  BookOpen,
  Search,
  MessageSquare,
  ArrowLeftRight,
  HelpCircle,
  LogOut,
  Plus,
  CheckCircle2,
  Sparkles,
  Coins,
  History,
  Award,
  Star,
  Send,
  ArrowRight,
  Calendar,
  Trophy,
  AlertTriangle,
  ShieldCheck
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { creditApi, sessionApi, skillApi, userApi } from "../api/apiClient";

function Dashboard() {
  const navigate = useNavigate();
  const { user, logoutUser, refreshUser } = useAuth();

  const [balance, setBalance] = useState(user?.credit_balance ?? 4.0);
  const [transactions, setTransactions] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [wishlistData, setWishlistData] = useState({ has_wishlist: false, wishes: [], matches: [] });
  const [profileData, setProfileData] = useState(null);
  const [loadingLedger, setLoadingLedger] = useState(true);
  const [loadingMatches, setLoadingMatches] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoadingLedger(true);
        setLoadingMatches(true);
        const [balRes, txRes, sessRes, wishRes, profRes] = await Promise.all([
          creditApi.getBalance().catch(() => ({ credit_balance: user?.credit_balance || 4.0 })),
          creditApi.getTransactions().catch(() => []),
          sessionApi.getSessions().catch(() => []),
          skillApi.getWishlistMatches().catch(() => ({ has_wishlist: false, wishes: [], matches: [] })),
          userApi.getProfile().catch(() => null)
        ]);
        setBalance(balRes.credit_balance);
        setTransactions(txRes);
        setSessions(sessRes);
        setWishlistData(wishRes);
        setProfileData(profRes);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoadingLedger(false);
        setLoadingMatches(false);
      }
    }
    loadData();
  }, [user?.user_id]);

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

  const activeRequestsCount = sessions.filter(s => s.status === 'pending' || s.status === 'accepted').length;
  const completedSwapsCount = sessions.filter(s => s.status === 'completed').length;

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
              const active = item.name === "Dashboard";
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
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[1250px] mx-auto px-6 md:px-8 py-8">
            {/* Welcome */}
            <div className="text-center mb-8">
              <h1 className="text-white text-3xl md:text-[34px] font-bold">
                Welcome Back, {user?.full_name || "Student"}!
              </h1>
              <p className="text-[#9DAACB] text-sm mt-1">
                Exchange skills using time as currency. Your live balance is available below.
              </p>
            </div>

            {/* TRADING RESTRICTION BANNER IF LOW RELIABILITY */}
            {(profileData?.is_blocked_from_trading || (parseFloat(profileData?.reliability_score ?? 100) < 60)) && (
              <div className="mb-6 bg-rose-500/20 border-2 border-rose-500/50 rounded-2xl p-5 flex items-start gap-4 text-rose-200 shadow-lg">
                <AlertTriangle className="text-rose-400 shrink-0 mt-0.5" size={24} />
                <div>
                  <h3 className="font-bold text-base text-white">Trading Privileges Temporarily Restricted</h3>
                  <p className="text-xs text-rose-200 mt-1 leading-relaxed">
                    Your community reliability score is currently <strong>{parseFloat(profileData?.reliability_score ?? 0).toFixed(1)}%</strong> (minimum 60% required to request new trades).
                    To restore your trading standing, honor and fulfill your accepted commitments (+2% trust earned per completed session).
                  </p>
                </div>
              </div>
            )}

            {/* STATS INCLUDING LIVE CREDIT BALANCE & RELIABILITY SCORE */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              <div className="bg-[#1A2E68] border border-[#2D458B] rounded-xl p-5 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-[#9DAACB] text-xs font-semibold uppercase">Credit Balance</span>
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <Coins size={19} />
                  </div>
                </div>
                <div className="mt-3 text-3xl font-extrabold text-amber-300">
                  {balance.toFixed(2)} <span className="text-sm font-normal text-amber-200">hrs</span>
                </div>
                <p className="text-[11px] text-[#8EA1D0] mt-2">
                  1 hour taught = 1 hour earned
                </p>
              </div>

              {/* RELIABILITY SCORE CARD */}
              <div className="bg-[#1A2E68] border border-[#2D458B] rounded-xl p-5 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-[#9DAACB] text-xs font-semibold uppercase">Reliability Score</span>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    parseFloat(profileData?.reliability_score ?? 100) >= 90
                      ? "bg-emerald-500/20 text-emerald-400"
                      : parseFloat(profileData?.reliability_score ?? 100) >= 60
                      ? "bg-amber-500/20 text-amber-400"
                      : "bg-rose-500/20 text-rose-400"
                  }`}>
                    <ShieldCheck size={19} />
                  </div>
                </div>
                <div className={`mt-3 text-3xl font-extrabold ${
                  parseFloat(profileData?.reliability_score ?? 100) >= 90
                    ? "text-emerald-300"
                    : parseFloat(profileData?.reliability_score ?? 100) >= 60
                    ? "text-amber-300"
                    : "text-rose-400"
                }`}>
                  {parseFloat(profileData?.reliability_score ?? 100).toFixed(0)}%
                </div>
                <p className="text-[11px] text-[#8EA1D0] mt-2">
                  {parseFloat(profileData?.reliability_score ?? 100) >= 90
                    ? "✓ Excellent Community Trust"
                    : parseFloat(profileData?.reliability_score ?? 100) >= 60
                    ? "Good Standing (60%+ required)"
                    : "⚠ Blocked (Below 60%)"}
                </p>
              </div>

              <StatCard
                icon={<BookOpen size={19} />}
                title="Skills Offered"
                value={user?.offers?.length || 0}
                color="blue"
                tags={user?.offers?.slice(0, 2).map(s => s.name) || ["None"]}
              />

              <StatCard
                icon={<ArrowLeftRight size={19} />}
                title="Active Requests"
                value={activeRequestsCount}
                color="dark"
              />

              <StatCard
                icon={<CheckCircle2 size={19} />}
                title="Completed Swaps"
                value={completedSwapsCount}
                color="purple"
              />
            </div>

            {/* QUICK ACTIONS */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-5">
              <QuickAction icon={<Plus size={20} />} title="Add Skill" onClick={() => navigate("/profile")} />
              <QuickAction icon={<Search size={20} />} title="Search" onClick={() => navigate("/discover")} />
              <QuickAction icon={<Trophy size={20} className="text-amber-400" />} title="Leaderboard" onClick={() => navigate("/leaderboard")} />
              <QuickAction icon={<ArrowLeftRight size={20} />} title="Requests" onClick={() => navigate("/requests")} />
              <QuickAction icon={<MessageSquare size={20} />} title="Messages" onClick={() => navigate("/messages")} />
            </div>

            {/* MILESTONE BADGES STRIP */}
            {profileData?.badges && (
              <section className="bg-[#1A2E68] border border-[#2D458B] rounded-xl p-5 mt-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Award className="text-amber-400" size={18} />
                    <h2 className="text-white text-base font-bold">Your Achievements & Milestone Badges</h2>
                  </div>
                  <button onClick={() => navigate("/profile")} className="text-xs text-[#4D91FF] hover:underline font-semibold flex items-center gap-1">
                    View All Badges <ArrowRight size={13} />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {profileData.badges.map((b) => (
                    <div
                      key={b.id}
                      className={`p-3 rounded-xl border text-center transition flex flex-col items-center justify-center ${
                        b.unlocked
                          ? "bg-[#0F2154] border-amber-500/40"
                          : "bg-[#0A1840]/60 border-[#2D458B]/40 opacity-40"
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-1.5 ${
                        b.unlocked ? "bg-amber-500/20 text-amber-300" : "bg-gray-800 text-gray-500"
                      }`}>
                        <Award size={16} />
                      </div>
                      <span className="text-xs font-bold text-white truncate w-full">{b.title}</span>
                      <span className={`text-[10px] mt-0.5 ${b.unlocked ? "text-emerald-400 font-semibold" : "text-[#8EA1D0]"}`}>
                        {b.unlocked ? "✓ Unlocked" : "Locked"}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* FEATURE: AUTOMATIC WISHLIST SKILL MATCHING */}
            <section className="bg-[#1A2E68] border border-[#2D458B] rounded-xl p-6 mt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="text-blue-400" size={20} />
                  <div>
                    <h2 className="text-white text-lg font-bold">Recommended Teachers for Your Wishlist</h2>
                    <p className="text-xs text-[#8EA1D0]">
                      Automated peer matching based on the skills you want to learn.
                    </p>
                  </div>
                </div>
                {wishlistData.has_wishlist && (
                  <span className="text-xs bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full font-semibold">
                    {wishlistData.matches.length} matches found
                  </span>
                )}
              </div>

              {loadingMatches ? (
                <div className="py-8 text-center text-[#9DAACB] text-sm">Matching teachers for your learning wishlist...</div>
              ) : !wishlistData.has_wishlist ? (
                <div className="bg-[#0F2154] border border-[#2D458B] rounded-xl p-5 text-center space-y-3">
                  <BookOpen size={32} className="mx-auto text-blue-400" />
                  <h3 className="font-bold text-white text-sm">You haven't added any skills to your learning wishlist yet!</h3>
                  <p className="text-xs text-[#9DAACB] max-w-[500px] mx-auto">
                    Add skills you want to learn to your profile so the system can automatically match you with peer teachers.
                  </p>
                  <button
                    onClick={() => navigate("/profile")}
                    className="bg-[#2864E8] hover:bg-[#1D55CC] text-white px-5 py-2 rounded-xl text-xs font-semibold transition"
                  >
                    + Add Skills to Wishlist
                  </button>
                </div>
              ) : wishlistData.matches.length === 0 ? (
                <div className="bg-[#0F2154] border border-[#2D458B] rounded-xl p-5 text-center text-xs text-[#9DAACB]">
                  You want to learn: <span className="text-purple-300 font-semibold">{wishlistData.wishes.join(", ")}</span>. No peers are offering these skills currently. Try browsing all teachers in Discover!
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {wishlistData.matches.map((m) => (
                    <div
                      key={m.user_id}
                      className="bg-[#0F2154] border border-[#2D458B] hover:border-blue-500/50 rounded-xl p-4 transition shadow-sm flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div
                            onClick={() => navigate(`/profile/${m.user_id}`)}
                            className="flex items-center gap-3 cursor-pointer group"
                          >
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                              {m.full_name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h3 className="font-bold text-white text-sm group-hover:text-blue-400 transition flex items-center gap-1.5">
                                {m.full_name}
                              </h3>
                              <p className="text-[11px] text-[#8EA1D0]">{m.institution}</p>
                            </div>
                          </div>

                          {m.average_rating ? (
                            <span className="flex items-center gap-1 bg-amber-500/20 text-amber-300 text-xs px-2 py-0.5 rounded-lg font-bold">
                              <Star size={12} className="fill-amber-300" /> {m.average_rating} ({m.total_reviews})
                            </span>
                          ) : (
                            <span className="text-[10px] text-[#8EA1D0] bg-[#1A2E68] px-2 py-0.5 rounded-md">New</span>
                          )}
                        </div>

                        {/* Matched Wishlist Skills */}
                        <div className="mt-2.5 mb-2">
                          <span className="text-[11px] text-emerald-400 font-semibold block mb-1">
                            Teaches your wishlist skill:
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {m.matched_skills.map((sk, idx) => (
                              <span key={idx} className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs px-2.5 py-0.5 rounded-lg font-semibold">
                                ✓ {sk}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Available days */}
                        {m.available_days && m.available_days.length > 0 && (
                          <p className="text-[11px] text-[#8EA1D0] flex items-center gap-1 mt-2">
                            <Calendar size={12} className="text-blue-400" />
                            Days: {m.available_days.slice(0, 3).join(", ")}
                          </p>
                        )}
                      </div>

                      <div className="mt-4 pt-3 border-t border-[#2D458B]/50 flex gap-2">
                        <button
                          onClick={() => navigate(`/messages?user=${m.user_id}`)}
                          className="flex-1 bg-[#1A2E68] hover:bg-[#253D84] text-white py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition"
                        >
                          <MessageSquare size={13} className="text-blue-400" /> Message
                        </button>
                        <button
                          onClick={() => navigate("/schedule", { state: { teacher: m, skill: m.matched_skills[0] } })}
                          className="flex-[1.3] bg-[#2864E8] hover:bg-[#1D55CC] text-white py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition shadow-sm"
                        >
                          <Send size={13} /> Request Swap
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* FEATURE 4: CREDIT BALANCE LEDGER AUDIT LOG */}
            <section className="bg-[#1A2E68] border border-[#2D458B] rounded-xl p-6 mt-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <History size={20} className="text-amber-400" />
                  <h2 className="text-white text-lg font-bold">Credit Ledger Audit Log</h2>
                </div>
                <button onClick={refreshUser} className="text-[#4D91FF] text-xs font-semibold hover:underline">
                  Refresh Ledger
                </button>
              </div>

              {loadingLedger ? (
                <div className="py-8 text-center text-[#9DAACB] text-sm">Loading credit audit log...</div>
              ) : transactions.length === 0 ? (
                <div className="py-8 text-center text-[#9DAACB] text-sm">No credit transactions recorded yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-[#D9DEFA]">
                    <thead className="text-xs uppercase bg-[#0F2154] text-[#8EA1D0] border-b border-[#2D458B]">
                      <tr>
                        <th className="py-3 px-4">Transaction ID</th>
                        <th className="py-3 px-4">Type</th>
                        <th className="py-3 px-4">Counterpart / Details</th>
                        <th className="py-3 px-4">Skill</th>
                        <th className="py-3 px-4">Amount</th>
                        <th className="py-3 px-4">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2D458B]">
                      {transactions.map((tx) => (
                        <tr key={tx.transaction_id} className="hover:bg-[#203679] transition">
                          <td className="py-3 px-4 font-mono text-xs text-[#9DAACB]">#{tx.transaction_id}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                              tx.direction === 'grant'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : tx.direction === 'earned'
                                ? 'bg-blue-500/20 text-blue-300'
                                : 'bg-rose-500/20 text-rose-300'
                            }`}>
                              {tx.direction === 'grant' ? 'Welcome Grant' : tx.direction === 'earned' ? 'Earned' : 'Spent'}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-medium">{tx.counterpart_name}</td>
                          <td className="py-3 px-4 text-[#9DAACB]">{tx.skill_name}</td>
                          <td className="py-3 px-4 font-bold">
                            <span className={tx.direction === 'spent' ? 'text-rose-400' : 'text-emerald-400'}>
                              {tx.direction === 'spent' ? '-' : '+'}{tx.amount.toFixed(2)} hrs
                            </span>
                          </td>
                          <td className="py-3 px-4 text-xs text-[#8EA1D0]">
                            {new Date(tx.created_at).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, color, tags }) {
  return (
    <div className="bg-[#1A2E68] border border-[#2D458B] rounded-xl p-5">
      <div className="flex items-center justify-between">
        <span className="text-[#9DAACB] text-xs font-semibold uppercase">{title}</span>
        <div className="w-8 h-8 rounded-lg bg-[#2864E8]/20 text-[#4D91FF] flex items-center justify-center">
          {icon}
        </div>
      </div>
      <div className="mt-3 text-3xl font-extrabold text-white">{value}</div>
      {tags && (
        <div className="flex gap-1.5 mt-2 overflow-x-auto">
          {tags.map((t, idx) => (
            <span key={idx} className="bg-[#2D458B] text-xs px-2 py-0.5 rounded text-white font-medium">
              {t}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function QuickAction({ icon, title, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center gap-2 bg-[#1A2E68] hover:bg-[#203679] border border-[#2D458B] text-white py-3 px-4 rounded-xl font-semibold text-sm transition shadow-sm"
    >
      {icon}
      {title}
    </button>
  );
}

export default Dashboard;