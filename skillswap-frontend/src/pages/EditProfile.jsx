import {
  LayoutGrid,
  UserRound,
  BookOpen,
  Search,
  MessageSquare,
  ArrowLeftRight,
  LogOut,
  Save,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Trophy,
  Video
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { userApi } from "../api/apiClient";

function EditProfile() {
  const navigate = useNavigate();
  const { user, logoutUser, refreshUser } = useAuth();

  const [name, setName] = useState("");
  const [university, setUniversity] = useState("");
  const [location, setLocation] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [meetLink, setMeetLink] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

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
    const fetchCurrentProfile = async () => {
      try {
        setLoading(true);
        const data = await userApi.getProfile();
        setName(data.full_name || "");
        setEmail(data.email || "");
        setUniversity(data.institution || "");
        setLocation(data.location || "");
        setBio(data.bio || "");
        setMeetLink(data.meet_link || "");
      } catch (err) {
        console.error("Failed to load user profile:", err);
        // Fallback to auth context
        if (user) {
          setName(user.full_name || "");
          setEmail(user.email || "");
          setMeetLink(user.meet_link || "");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentProfile();
  }, [user]);

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!name.trim()) {
      setErrorMsg("Full Name is required.");
      return;
    }

    try {
      setSaving(true);
      await userApi.updateProfile({
        full_name: name.trim(),
        bio: bio.trim(),
        institution: university.trim(),
        location: location.trim(),
        meet_link: meetLink.trim()
      });

      await refreshUser();
      setSuccessMsg("Profile updated successfully!");

      setTimeout(() => {
        navigate("/profile");
      }, 1000);
    } catch (err) {
      setErrorMsg(err.message || "Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
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
          {/* Logo */}
          <div className="px-7 pt-7 pb-8">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-[#2864E8] flex items-center justify-center">
                <span className="text-white font-bold text-lg">↕</span>
              </div>
              <span className="text-[#06194F] text-[22px] font-extrabold">SkillSwap</span>
            </div>
          </div>

          {/* Navigation */}
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

          {/* Bottom */}
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
          <div className="max-w-[900px] mx-auto px-5 md:px-8 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-7">
              <div>
                <button
                  onClick={() => navigate("/profile")}
                  className="flex items-center gap-2 text-[#9DAACB] hover:text-white text-sm mb-4 transition"
                >
                  <ArrowLeft size={16} />
                  Back to Profile
                </button>
                <h1 className="text-3xl font-extrabold">Edit Profile</h1>
                <p className="text-[#9DAACB] text-sm mt-1">
                  Update your public profile, university affiliation, and bio.
                </p>
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                className="hidden sm:flex items-center gap-2 bg-[#2864E8] hover:bg-[#1D55CC] px-5 py-2.5 rounded-xl font-semibold text-sm transition shadow-md disabled:opacity-50"
              >
                <Save size={16} />
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>

            {/* Alerts */}
            {errorMsg && (
              <div className="mb-5 bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                <AlertCircle size={18} />
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="mb-5 bg-emerald-500/20 border border-emerald-500/50 text-emerald-200 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                <CheckCircle2 size={18} />
                {successMsg}
              </div>
            )}

            {loading ? (
              <div className="py-12 text-center text-[#9DAACB]">Loading profile details...</div>
            ) : (
              <form onSubmit={handleSave} className="space-y-6">
                {/* Avatar Preview */}
                <section className="bg-[#0F2154] border border-[#2D458B] rounded-2xl p-6">
                  <h2 className="text-lg font-bold mb-4">Profile Avatar</h2>
                  <div className="flex items-center gap-5">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold shadow-md">
                      {name ? name.charAt(0).toUpperCase() : "U"}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{name || "User"}</p>
                      <p className="text-[#9DAACB] text-xs mt-0.5">{email}</p>
                      <span className="inline-block mt-2 text-[11px] bg-blue-500/20 text-blue-300 px-2.5 py-0.5 rounded-md font-medium">
                        Initials-based automatic badge avatar
                      </span>
                    </div>
                  </div>
                </section>

                {/* Personal Information */}
                <section className="bg-[#0F2154] border border-[#2D458B] rounded-2xl p-6">
                  <h2 className="text-lg font-bold">Personal & Community Details</h2>
                  <p className="text-[#9DAACB] text-xs mt-1 mb-6">
                    This information appears on your Public Profile and helps peer traders discover you.
                  </p>

                  <div className="grid md:grid-cols-2 gap-5">
                    {/* Full Name */}
                    <div>
                      <label className="block text-xs font-semibold text-[#C9D3E8] mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Alex Student"
                        className="w-full h-11 bg-[#1A2E68] border border-[#2D458B] rounded-xl px-4 text-sm text-white outline-none focus:border-[#2864E8]"
                        required
                      />
                    </div>

                    {/* Email (read-only) */}
                    <div>
                      <label className="block text-xs font-semibold text-[#C9D3E8] mb-2">
                        Email Address (Account Identifier)
                      </label>
                      <input
                        type="email"
                        value={email}
                        disabled
                        className="w-full h-11 bg-[#142654] border border-[#2D458B]/50 rounded-xl px-4 text-sm text-[#8EA1D0] cursor-not-allowed outline-none"
                      />
                    </div>

                    {/* Institution */}
                    <div>
                      <label className="block text-xs font-semibold text-[#C9D3E8] mb-2">
                        University / Institution
                      </label>
                      <input
                        type="text"
                        value={university}
                        onChange={(e) => setUniversity(e.target.value)}
                        placeholder="e.g. BRAC University, BUET, Dhaka University"
                        className="w-full h-11 bg-[#1A2E68] border border-[#2D458B] rounded-xl px-4 text-sm text-white outline-none focus:border-[#2864E8]"
                      />
                    </div>

                    {/* Location */}
                    <div>
                      <label className="block text-xs font-semibold text-[#C9D3E8] mb-2">
                        City / Location
                      </label>
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g. Dhaka, Bangladesh"
                        className="w-full h-11 bg-[#1A2E68] border border-[#2D458B] rounded-xl px-4 text-sm text-white outline-none focus:border-[#2864E8]"
                      />
                    </div>
                  </div>

                  {/* Bio */}
                  <div className="mt-5">
                    <label className="block text-xs font-semibold text-[#C9D3E8] mb-2">
                      Bio / Teaching Statement
                    </label>
                    <textarea
                      rows={4}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Introduce your background, the skills you love teaching, and what you are eager to learn in exchange..."
                      className="w-full bg-[#1A2E68] border border-[#2D458B] rounded-xl p-4 text-sm text-white outline-none focus:border-[#2864E8]"
                    />
                  </div>
                </section>

                {/* Google Meet Link Section */}
                <section className="bg-[#0F2154] border border-[#2D458B] rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Video className="text-emerald-400" size={18} />
                    <h2 className="text-lg font-bold">1-on-1 Session Meeting Link (Google Meet)</h2>
                  </div>
                  <p className="text-[#9DAACB] text-xs mb-4">
                    Your unique personal meeting room. <span className="text-emerald-300 font-semibold">Privacy Guaranteed:</span> Only students who book a session with you will receive this link.
                  </p>

                  <div>
                    <label className="block text-xs font-semibold text-[#C9D3E8] mb-2">
                      Google Meet URL
                    </label>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                      <input
                        type="url"
                        value={meetLink}
                        onChange={(e) => setMeetLink(e.target.value)}
                        placeholder="https://meet.google.com/xxx-yyyy-zzz"
                        className="flex-1 h-11 bg-[#1A2E68] border border-[#2D458B] rounded-xl px-4 text-sm text-white outline-none focus:border-[#2864E8]"
                      />
                      {meetLink && (
                        <a
                          href={meetLink}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="px-4 h-11 bg-[#1A2E68] hover:bg-[#203679] border border-emerald-500/40 text-emerald-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shrink-0 transition"
                          title="Test your meeting link in a new tab"
                        >
                          <Video size={14} /> Test Link
                        </a>
                      )}
                    </div>
                    <p className="text-[11px] text-[#8EA1D0] mt-2">
                      Accepted format: <code className="bg-[#142654] px-1.5 py-0.5 rounded text-blue-300 font-mono text-[10px]">https://meet.google.com/xxx-yyyy-zzz</code>
                    </p>
                  </div>
                </section>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => navigate("/profile")}
                    className="px-6 py-2.5 bg-[#1A2E68] hover:bg-[#203679] text-[#9DAACB] rounded-xl text-sm font-semibold transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 bg-[#2864E8] hover:bg-[#1D55CC] text-white rounded-xl text-sm font-semibold transition shadow-md disabled:opacity-50"
                  >
                    {saving ? "Saving Changes..." : "Save Profile"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default EditProfile;