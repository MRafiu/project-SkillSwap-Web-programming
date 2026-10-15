import {
  LayoutGrid,
  UserRound,
  BookOpen,
  Search,
  MessageSquare,
  ArrowLeftRight,
  LogOut,
  Trophy,
  Star,
  ShieldCheck,
  Award,
  Crown,
  Medal,
  School,
  MapPin,
  Send,
  Sparkles
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { leaderboardApi } from "../api/apiClient";

function Leaderboard() {
  const navigate = useNavigate();
  const { user, logoutUser } = useAuth();

  const [activeTab, setActiveTab] = useState("teachers"); // "teachers" | "traders" | "reliable"
  const [leaderboardData, setLeaderboardData] = useState({
    top_teachers: [],
    most_active_traders: [],
    top_reliable_members: []
  });
  const [loading, setLoading] = useState(true);

  const menuItems = [
    { name: "Dashboard", icon: LayoutGrid, path: "/dashboard" },
    { name: "Leaderboard", icon: Trophy, path: "/leaderboard" },
    { name: "My Profile", icon: UserRound, path: "/profile" },
    { name: "Skills", icon: BookOpen, path: "/discover" },
    { name: "Search", icon: Search, path: "/discover" },
    { name: "Messages", icon: MessageSquare, path: "/messages" },
    { name: "Requests", icon: ArrowLeftRight, path: "/requests" },
  ];

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const data = await leaderboardApi.getLeaderboard();
        setLeaderboardData(data);
      } catch (err) {
        console.error("Failed to load leaderboard:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  const currentList =
    activeTab === "teachers"
      ? leaderboardData.top_teachers
      : activeTab === "traders"
      ? leaderboardData.most_active_traders
      : leaderboardData.top_reliable_members;

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
              const active = item.path === "/leaderboard";
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
          <div className="max-w-[1150px] mx-auto space-y-8">
            {/* Header Banner */}
            <div className="text-center max-w-[650px] mx-auto pt-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold mb-3">
                <Crown size={14} className="text-amber-400" /> Community Hall of Fame
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white">Monthly Leaderboard</h1>
              <p className="text-[#9DAACB] text-sm mt-2">
                Recognizing top-rated peer teachers, most active exchange partners, and the most reliable members in our community.
              </p>
            </div>

            {/* Category Tabs */}
            <div className="flex justify-center">
              <div className="bg-[#1A2E68] p-1.5 rounded-2xl border border-[#2D458B] flex flex-wrap gap-1">
                <button
                  onClick={() => setActiveTab("teachers")}
                  className={`px-5 py-2.5 rounded-xl text-xs md:text-sm font-bold flex items-center gap-2 transition ${
                    activeTab === "teachers"
                      ? "bg-[#2864E8] text-white shadow-md"
                      : "text-[#9DAACB] hover:text-white"
                  }`}
                >
                  <Star size={16} className={activeTab === "teachers" ? "fill-white" : "text-amber-400"} />
                  Top Rated Teachers
                </button>
                <button
                  onClick={() => setActiveTab("traders")}
                  className={`px-5 py-2.5 rounded-xl text-xs md:text-sm font-bold flex items-center gap-2 transition ${
                    activeTab === "traders"
                      ? "bg-[#2864E8] text-white shadow-md"
                      : "text-[#9DAACB] hover:text-white"
                  }`}
                >
                  <Award size={16} className={activeTab === "traders" ? "text-white" : "text-blue-400"} />
                  Most Active Traders
                </button>
                <button
                  onClick={() => setActiveTab("reliable")}
                  className={`px-5 py-2.5 rounded-xl text-xs md:text-sm font-bold flex items-center gap-2 transition ${
                    activeTab === "reliable"
                      ? "bg-[#2864E8] text-white shadow-md"
                      : "text-[#9DAACB] hover:text-white"
                  }`}
                >
                  <ShieldCheck size={16} className={activeTab === "reliable" ? "text-white" : "text-emerald-400"} />
                  100% Reliability Club
                </button>
              </div>
            </div>

            {loading ? (
              <div className="py-16 text-center text-[#9DAACB]">Loading leaderboard rankings...</div>
            ) : currentList.length === 0 ? (
              <div className="py-16 text-center bg-[#1A2E68] border border-[#2D458B] rounded-2xl text-[#9DAACB]">
                No rankings recorded in this category yet. Be the first to trade and claim the top spot!
              </div>
            ) : (
              <div className="space-y-6">
                {/* PODIUM TOP 3 */}
                {currentList.length >= 2 && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 items-end">
                    {/* #2 Silver */}
                    {currentList[1] && (
                      <div className="bg-[#1A2E68] border border-blue-400/40 rounded-2xl p-6 text-center shadow-lg relative order-2 md:order-1">
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-slate-300 to-slate-100 text-[#0F2154] font-black text-xs px-3 py-1 rounded-full shadow flex items-center gap-1">
                          <Medal size={13} /> #2 SILVER
                        </div>
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-slate-400 to-slate-200 text-[#0F2154] flex items-center justify-center font-black text-2xl mx-auto mb-3 shadow">
                          {currentList[1].full_name.charAt(0)}
                        </div>
                        <h3
                          onClick={() => navigate(`/profile/${currentList[1].user_id}`)}
                          className="font-bold text-white text-base hover:text-blue-400 cursor-pointer transition"
                        >
                          {currentList[1].full_name}
                        </h3>
                        <p className="text-xs text-[#8EA1D0] mt-0.5">{currentList[1].institution}</p>

                        <div className="mt-3 pt-3 border-t border-[#2D458B] flex items-center justify-center gap-3 text-xs">
                          {activeTab === "teachers" && (
                            <span className="text-amber-300 font-bold flex items-center gap-1">
                              <Star size={13} className="fill-amber-300" /> {currentList[1].avg_rating} ({currentList[1].total_reviews} reviews)
                            </span>
                          )}
                          {activeTab === "traders" && (
                            <span className="text-blue-300 font-bold">
                              {currentList[1].completed_trades} completed trades
                            </span>
                          )}
                          {activeTab === "reliable" && (
                            <span className="text-emerald-300 font-bold">
                              {currentList[1].reliability_score}% reliability
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* #1 Gold Champion */}
                    {currentList[0] && (
                      <div className="bg-[#1A2E68] border-2 border-amber-400 rounded-2xl p-7 text-center shadow-2xl relative order-1 md:order-2 md:-translate-y-3 bg-gradient-to-b from-[#1E367A] to-[#1A2E68]">
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 to-yellow-300 text-[#0F2154] font-black text-xs px-3.5 py-1 rounded-full shadow-lg flex items-center gap-1">
                          <Crown size={14} className="fill-[#0F2154]" /> #1 CHAMPION
                        </div>
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-300 text-[#0F2154] flex items-center justify-center font-black text-3xl mx-auto mb-3 shadow-xl">
                          {currentList[0].full_name.charAt(0)}
                        </div>
                        <h3
                          onClick={() => navigate(`/profile/${currentList[0].user_id}`)}
                          className="font-extrabold text-white text-lg hover:text-amber-300 cursor-pointer transition"
                        >
                          {currentList[0].full_name}
                        </h3>
                        <p className="text-xs text-[#9DAACB] mt-0.5">{currentList[0].institution}</p>

                        <div className="mt-4 pt-3 border-t border-[#2D458B] flex items-center justify-center gap-3 text-sm">
                          {activeTab === "teachers" && (
                            <span className="text-amber-300 font-extrabold flex items-center gap-1">
                              <Star size={15} className="fill-amber-300" /> {currentList[0].avg_rating} ({currentList[0].total_reviews} reviews)
                            </span>
                          )}
                          {activeTab === "traders" && (
                            <span className="text-emerald-300 font-extrabold">
                              {currentList[0].completed_trades} completed trades
                            </span>
                          )}
                          {activeTab === "reliable" && (
                            <span className="text-emerald-300 font-extrabold">
                              {currentList[0].reliability_score}% reliability
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* #3 Bronze */}
                    {currentList[2] && (
                      <div className="bg-[#1A2E68] border border-orange-400/40 rounded-2xl p-6 text-center shadow-lg relative order-3">
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-600 to-orange-400 text-white font-black text-xs px-3 py-1 rounded-full shadow flex items-center gap-1">
                          <Medal size={13} /> #3 BRONZE
                        </div>
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-600 to-orange-400 text-white flex items-center justify-center font-black text-2xl mx-auto mb-3 shadow">
                          {currentList[2].full_name.charAt(0)}
                        </div>
                        <h3
                          onClick={() => navigate(`/profile/${currentList[2].user_id}`)}
                          className="font-bold text-white text-base hover:text-orange-300 cursor-pointer transition"
                        >
                          {currentList[2].full_name}
                        </h3>
                        <p className="text-xs text-[#8EA1D0] mt-0.5">{currentList[2].institution}</p>

                        <div className="mt-3 pt-3 border-t border-[#2D458B] flex items-center justify-center gap-3 text-xs">
                          {activeTab === "teachers" && (
                            <span className="text-amber-300 font-bold flex items-center gap-1">
                              <Star size={13} className="fill-amber-300" /> {currentList[2].avg_rating} ({currentList[2].total_reviews} reviews)
                            </span>
                          )}
                          {activeTab === "traders" && (
                            <span className="text-blue-300 font-bold">
                              {currentList[2].completed_trades} completed trades
                            </span>
                          )}
                          {activeTab === "reliable" && (
                            <span className="text-emerald-300 font-bold">
                              {currentList[2].reliability_score}% reliability
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* FULL LEADERBOARD TABLE */}
                <div className="bg-[#1A2E68] border border-[#2D458B] rounded-2xl overflow-hidden shadow-xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-[#D9DEFA]">
                      <thead className="text-xs uppercase bg-[#0F2154] text-[#8EA1D0] border-b border-[#2D458B]">
                        <tr>
                          <th className="py-4 px-5">Rank</th>
                          <th className="py-4 px-5">Member</th>
                          <th className="py-4 px-5">University / Location</th>
                          {activeTab === "teachers" && <th className="py-4 px-5">Rating & Reviews</th>}
                          {activeTab === "traders" && <th className="py-4 px-5">Completed Swaps</th>}
                          <th className="py-4 px-5">Reliability Score</th>
                          <th className="py-4 px-5 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#2D458B]">
                        {currentList.map((row, idx) => (
                          <tr key={row.user_id} className="hover:bg-[#203679] transition">
                            <td className="py-4 px-5 font-bold text-white">
                              {idx === 0 ? "🥇 #1" : idx === 1 ? "🥈 #2" : idx === 2 ? "🥉 #3" : `#${idx + 1}`}
                            </td>
                            <td className="py-4 px-5">
                              <div
                                onClick={() => navigate(`/profile/${row.user_id}`)}
                                className="flex items-center gap-3 cursor-pointer group"
                              >
                                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-sm">
                                  {row.full_name.charAt(0)}
                                </div>
                                <div>
                                  <span className="font-bold text-white group-hover:text-blue-400 transition block">
                                    {row.full_name}
                                  </span>
                                  {row.skills && row.skills.length > 0 && (
                                    <span className="text-[11px] text-[#8EA1D0]">{row.skills.join(", ")}</span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-5 text-xs text-[#9DAACB]">
                              <div>{row.institution}</div>
                              <div className="text-[11px] text-[#8EA1D0]">{row.location}</div>
                            </td>

                            {activeTab === "teachers" && (
                              <td className="py-4 px-5">
                                <div className="flex items-center gap-1.5 text-amber-300 font-bold">
                                  <Star size={14} className="fill-amber-300 text-amber-300" />
                                  {row.avg_rating} <span className="text-xs text-[#8EA1D0]">({row.total_reviews})</span>
                                </div>
                              </td>
                            )}

                            {activeTab === "traders" && (
                              <td className="py-4 px-5 font-bold text-white">
                                {row.completed_trades} trades
                              </td>
                            )}

                            <td className="py-4 px-5">
                              <span className={`text-xs px-2.5 py-1 rounded-lg font-bold border ${
                                row.reliability_score >= 90
                                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                                  : row.reliability_score >= 75
                                  ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                                  : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                              }`}>
                                {row.reliability_score}%
                              </span>
                            </td>

                            <td className="py-4 px-5 text-right">
                              <button
                                onClick={() => navigate(`/profile/${row.user_id}`)}
                                className="px-3.5 py-1.5 bg-[#142654] hover:bg-[#203679] text-[#8EA1D0] hover:text-white border border-[#2D458B] rounded-xl text-xs font-semibold transition"
                              >
                                View Profile
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default Leaderboard;
