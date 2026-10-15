import {
  LayoutGrid,
  UserRound,
  BookOpen,
  Search,
  MessageSquare,
  ArrowLeftRight,
  LogOut,
  ArrowLeft,
  Trophy
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { skillApi } from "../api/apiClient";
import { useAuth } from "../context/AuthContext";

function PostSkill() {
  const navigate = useNavigate();
  const { logoutUser, refreshUser } = useAuth();

  const [skillName, setSkillName] = useState("");
  const [skillType, setSkillType] = useState("teach");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const menuItems = [
    { name: "Dashboard", icon: LayoutGrid, path: "/dashboard" },
    { name: "Leaderboard", icon: Trophy, path: "/leaderboard" },
    { name: "My Profile", icon: UserRound, path: "/profile" },
    { name: "Skills", icon: BookOpen, path: "/discover" },
    { name: "Search", icon: Search, path: "/discover" },
    { name: "Messages", icon: MessageSquare, path: "/messages" },
    { name: "Requests", icon: ArrowLeftRight, path: "/requests" },
  ];

  const handlePublish = async (e) => {
    e.preventDefault();
    if (!skillName.trim()) {
      setError("Please enter a skill name.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      await skillApi.addUserSkill({ skill_name: skillName.trim(), type: skillType });
      await refreshUser();
      setSuccess(true);

      setTimeout(() => {
        navigate("/profile");
      }, 1200);
    } catch (err) {
      setError(err.message || "Failed to post skill");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

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
              return (
                <button
                  key={item.name}
                  onClick={() => navigate(item.path)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-[#3F465F] hover:bg-[#E3E7FF] transition"
                >
                  <Icon size={17} />
                  {item.name}
                </button>
              );
            })}
          </nav>

          <div className="mt-auto px-3 pb-6">
            <div className="space-y-1">
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
          <div className="max-w-[650px] mx-auto bg-[#1A2E68] border border-[#2D458B] rounded-2xl p-6 md:p-8 shadow-xl">
            <button
              onClick={() => navigate("/profile")}
              className="flex items-center gap-2 text-[#8EA1D0] hover:text-white text-sm mb-6 font-semibold"
            >
              <ArrowLeft size={16} /> Back to Profile
            </button>

            <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-2">Post a Skill</h1>
            <p className="text-[#8EA1D0] text-sm mb-6">
              Add a new skill to teach or specify a skill you want to learn.
            </p>

            {error && (
              <div className="mb-5 bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-5 bg-emerald-500/20 border border-emerald-500/50 text-emerald-200 px-4 py-3 rounded-xl text-sm">
                ✓ Skill successfully added to taxonomy and attached to your profile! Redirecting...
              </div>
            )}

            <form onSubmit={handlePublish} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-[#8EA1D0] mb-2">Skill Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSkillType("teach")}
                    className={`py-3 rounded-xl font-semibold text-sm transition ${
                      skillType === "teach"
                        ? "bg-[#2864E8] text-white"
                        : "bg-[#0F2154] text-[#8EA1D0] hover:text-white"
                    }`}
                  >
                    I Want to Teach (Offer)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSkillType("learn")}
                    className={`py-3 rounded-xl font-semibold text-sm transition ${
                      skillType === "learn"
                        ? "bg-purple-600 text-white"
                        : "bg-[#0F2154] text-[#8EA1D0] hover:text-white"
                    }`}
                  >
                    I Want to Learn (Want)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#8EA1D0] mb-2">Skill Name</label>
                <input
                  type="text"
                  placeholder="e.g. Next.js, Python, Digital Illustration"
                  value={skillName}
                  onChange={(e) => {
                    setSkillName(e.target.value);
                    setError("");
                  }}
                  className="w-full bg-[#0F2154] border border-[#2D458B] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#2864E8]"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-[#2864E8] hover:bg-[#1D55CC] text-white font-semibold rounded-xl text-base transition disabled:opacity-50 mt-4"
              >
                {loading ? "Publishing Skill..." : "Publish Skill"}
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}

export default PostSkill;