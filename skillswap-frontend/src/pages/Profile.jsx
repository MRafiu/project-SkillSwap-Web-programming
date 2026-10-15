import {
  LayoutGrid,
  UserRound,
  BookOpen,
  Search,
  MessageSquare,
  ArrowLeftRight,
  LogOut,
  Clock3,
  Mail,
  Plus,
  X,
  Sparkles,
  Star,
  Calendar,
  Trash2,
  Award,
  School,
  MapPin,
  Edit3,
  Eye,
  Compass,
  ShieldCheck,
  Trophy,
  Video,
  Copy,
  Check,
  GraduationCap,
  FileCheck
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { skillApi, availabilityApi, reviewApi, userApi, certificateApi } from "../api/apiClient";
import CertificateModal from "../components/CertificateModal";

function Profile() {
  const navigate = useNavigate();
  const { user, logoutUser, refreshUser } = useAuth();

  const [taxonomy, setTaxonomy] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [skillType, setSkillType] = useState('teach');
  const [certificates, setCertificates] = useState([]);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [selectedSkillId, setSelectedSkillId] = useState('');
  const [customSkillName, setCustomSkillName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loadingAction, setLoadingAction] = useState(false);

  // Availability state
  const [availabilitySlots, setAvailabilitySlots] = useState([]);
  const [showAvailModal, setShowAvailModal] = useState(false);
  const [newSlotDay, setNewSlotDay] = useState('Monday');
  const [newSlotTime, setNewSlotTime] = useState('10:00 AM - 12:00 PM');
  const [customSlotTime, setCustomSlotTime] = useState('');
  const [availError, setAvailError] = useState('');
  const [loadingAvail, setLoadingAvail] = useState(false);

  // Date Blackout Overrides State
  const [dateOverrides, setDateOverrides] = useState([]);
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [overrideDate, setOverrideDate] = useState('');
  const [overrideReason, setOverrideReason] = useState('');
  const [overrideError, setOverrideError] = useState('');
  const [loadingOverride, setLoadingOverride] = useState(false);

  // Reviews state
  const [reviewsData, setReviewsData] = useState({ average_rating: 0, total_reviews: 0, reviews: [] });
  // Profile details & badges
  const [profileDetails, setProfileDetails] = useState(null);
  const [copiedMeetLink, setCopiedMeetLink] = useState(false);

  const loadData = async () => {
    try {
      const [skills, avail, revs, prof, overrides, certs] = await Promise.all([
        skillApi.getTaxonomy().catch(() => []),
        availabilityApi.getMyAvailability().catch(() => []),
        user?.user_id
          ? reviewApi.getUserReviews(user.user_id).catch(() => ({ average_rating: 0, total_reviews: 0, reviews: [] }))
          : Promise.resolve({ average_rating: 0, total_reviews: 0, reviews: [] }),
        userApi.getProfile().catch(() => null),
        availabilityApi.getMyOverrides().catch(() => []),
        certificateApi.getMyCertificates().catch(() => [])
      ]);
      setTaxonomy(skills);
      setAvailabilitySlots(avail);
      setReviewsData(revs);
      setProfileDetails(prof);
      setDateOverrides(overrides);
      setCertificates(certs);
    } catch (err) {
      console.error("Failed to load profile data:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, [user?.user_id]);

  const handleAddSkill = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoadingAction(true);

    try {
      if (selectedSkillId === 'custom') {
        if (!customSkillName.trim()) {
          setErrorMsg('Please enter a custom skill name');
          setLoadingAction(false);
          return;
        }
        await skillApi.addUserSkill({ skill_name: customSkillName.trim(), type: skillType });
      } else {
        if (!selectedSkillId) {
          setErrorMsg('Please select a skill or choose Custom Skill');
          setLoadingAction(false);
          return;
        }
        await skillApi.addUserSkill({ skill_id: parseInt(selectedSkillId, 10), type: skillType });
      }

      await refreshUser();
      const updatedTax = await skillApi.getTaxonomy();
      setTaxonomy(updatedTax);

      setShowAddModal(false);
      setSelectedSkillId('');
      setCustomSkillName('');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to add skill');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleRemoveSkill = async (skill_id, type) => {
    try {
      await skillApi.removeUserSkill(skill_id, type);
      await refreshUser();
    } catch (err) {
      alert(err.message || 'Failed to remove skill');
    }
  };

  const handleAddAvailability = async (e) => {
    e.preventDefault();
    setAvailError('');
    setLoadingAvail(true);

    const slotTime = newSlotTime === 'custom' ? customSlotTime.trim() : newSlotTime;
    if (!slotTime) {
      setAvailError('Please provide a valid time slot');
      setLoadingAvail(false);
      return;
    }

    try {
      await availabilityApi.addSlot(newSlotDay, slotTime);
      const updated = await availabilityApi.getMyAvailability();
      setAvailabilitySlots(updated);
      setShowAvailModal(false);
      setCustomSlotTime('');
    } catch (err) {
      setAvailError(err.message || 'Failed to add availability slot');
    } finally {
      setLoadingAvail(false);
    }
  };

  const handleRemoveAvailability = async (slotId) => {
    try {
      await availabilityApi.deleteSlot(slotId);
      const updated = await availabilityApi.getMyAvailability();
      setAvailabilitySlots(updated);
    } catch (err) {
      alert(err.message || 'Failed to remove availability slot');
    }
  };

  const handleAddOverride = async (e) => {
    e.preventDefault();
    setOverrideError('');
    if (!overrideDate) {
      setOverrideError('Please choose a date to blackout');
      return;
    }
    setLoadingOverride(true);
    try {
      await availabilityApi.addDateOverride(overrideDate, overrideReason.trim());
      const updated = await availabilityApi.getMyOverrides();
      setDateOverrides(updated);
      setShowOverrideModal(false);
      setOverrideDate('');
      setOverrideReason('');
    } catch (err) {
      setOverrideError(err.message || 'Failed to add date blackout');
    } finally {
      setLoadingOverride(false);
    }
  };

  const handleRemoveOverride = async (overrideId) => {
    try {
      await availabilityApi.deleteDateOverride(overrideId);
      const updated = await availabilityApi.getMyOverrides();
      setDateOverrides(updated);
    } catch (err) {
      alert(err.message || 'Failed to remove date override');
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
              const active = item.name === "My Profile";
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
          <div className="max-w-[1000px] mx-auto space-y-6">
            {/* Header Card */}
            <div className="bg-[#1A2E68] border border-[#2D458B] rounded-2xl p-6 md:p-8">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-3xl font-extrabold text-white">{profileDetails?.full_name || user?.full_name || "User Profile"}</h1>
                    {reviewsData.average_rating > 0 && (
                      <span className="flex items-center gap-1 bg-amber-500/20 text-amber-300 text-sm px-3 py-1 rounded-xl font-bold border border-amber-500/30">
                        <Star size={15} className="fill-amber-300" />
                        {reviewsData.average_rating} ({reviewsData.total_reviews} reviews)
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2 text-sm text-[#9DAACB]">
                    <span className="flex items-center gap-1">
                      <Mail size={15} /> {user?.email}
                    </span>
                    {profileDetails?.institution && (
                      <span className="flex items-center gap-1 text-blue-300">
                        <School size={15} className="text-blue-400" /> {profileDetails.institution}
                      </span>
                    )}
                    {profileDetails?.location && (
                      <span className="flex items-center gap-1 text-rose-300">
                        <MapPin size={15} className="text-rose-400" /> {profileDetails.location}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-amber-300 font-bold">
                      <Clock3 size={15} /> Live Balance: {(user?.credit_balance || 4.0).toFixed(2)} hrs
                    </span>
                    <span className={`flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-lg border ${
                      parseFloat(profileDetails?.reliability_score ?? 100) >= 90
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                        : parseFloat(profileDetails?.reliability_score ?? 100) >= 60
                        ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                        : "bg-rose-500/20 text-rose-300 border-rose-500/30"
                    }`}>
                      <ShieldCheck size={13} />
                      {parseFloat(profileDetails?.reliability_score ?? 100).toFixed(0)}% Reliability
                    </span>
                  </div>

                  {profileDetails?.bio && (
                    <p className="mt-3 text-xs md:text-sm text-[#D9DEFA] leading-relaxed max-w-[700px]">
                      "{profileDetails.bio}"
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
                  <button
                    onClick={() => navigate(`/profile/${user?.user_id}`)}
                    className="bg-[#142654] hover:bg-[#203679] text-[#8EA1D0] hover:text-white border border-[#2D458B] px-4 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-1.5 transition"
                    title="Preview how other students see your profile"
                  >
                    <Eye size={14} className="text-blue-400" /> View Public Profile
                  </button>
                  <button
                    onClick={() => navigate("/edit-profile")}
                    className="bg-[#142654] hover:bg-[#203679] text-[#8EA1D0] hover:text-white border border-[#2D458B] px-4 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-1.5 transition"
                  >
                    <Edit3 size={14} className="text-blue-400" /> Edit Profile
                  </button>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-[#2864E8] hover:bg-[#1D55CC] text-white px-5 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-1.5 transition shadow-md"
                  >
                    <Plus size={15} /> Add Skill
                  </button>
                </div>
              </div>
            </div>

            {/* GOOGLE MEET ROOM (PRIVATE & SECURE) */}
            <div className="bg-[#1A2E68] border border-[#2D458B] rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                  <Video size={22} />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-bold text-white">My Google Meet Room</h3>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-semibold">
                      Private • Shared Only with Booked Students
                    </span>
                  </div>
                  <p className="text-xs text-[#8EA1D0] mt-1 font-mono truncate max-w-[340px] sm:max-w-[500px]">
                    {profileDetails?.meet_link || user?.meet_link || "No Google Meet link configured yet"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                {(profileDetails?.meet_link || user?.meet_link) && (
                  <>
                    <button
                      onClick={() => {
                        const link = profileDetails?.meet_link || user?.meet_link;
                        navigator.clipboard.writeText(link);
                        setCopiedMeetLink(true);
                        setTimeout(() => setCopiedMeetLink(false), 2000);
                      }}
                      className="px-3.5 py-2 bg-[#142654] hover:bg-[#203679] border border-[#2D458B] text-xs font-semibold text-[#8EA1D0] hover:text-white rounded-xl transition flex items-center gap-1.5"
                      title="Copy Meet link"
                    >
                      {copiedMeetLink ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                      {copiedMeetLink ? "Copied!" : "Copy Link"}
                    </button>
                    <a
                      href={profileDetails?.meet_link || user?.meet_link}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow"
                      title="Test your meeting room in new tab"
                    >
                      <Video size={14} /> Test Room
                    </a>
                  </>
                )}
                <button
                  onClick={() => navigate("/edit-profile")}
                  className="px-3.5 py-2 bg-[#142654] hover:bg-[#203679] border border-[#2D458B] text-xs font-semibold text-[#8EA1D0] hover:text-white rounded-xl transition flex items-center gap-1.5"
                >
                  <Edit3 size={14} className="text-blue-400" /> Edit
                </button>
              </div>
            </div>

            {/* ACHIEVEMENTS & MILESTONE BADGES */}
            {profileDetails?.badges && (
              <section className="bg-[#1A2E68] border border-[#2D458B] rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Award className="text-amber-400" size={20} />
                    <h2 className="text-xl font-bold text-white">Achievements & Milestone Badges</h2>
                  </div>
                  <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full font-bold">
                    {profileDetails.badges.filter(b => b.unlocked).length} of {profileDetails.badges.length} Unlocked
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {profileDetails.badges.map((badge) => (
                    <div
                      key={badge.id}
                      className={`p-4 rounded-xl border transition flex items-start gap-3 ${
                        badge.unlocked
                          ? "bg-[#0F2154] border-amber-500/40 shadow-sm"
                          : "bg-[#0A1840]/60 border-[#2D458B]/40 opacity-55"
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        badge.unlocked ? "bg-amber-500/20 shadow-inner" : "bg-gray-800/40"
                      }`}>
                        {badge.icon === 'Sparkles' && <Sparkles size={18} className={badge.unlocked ? "text-amber-400" : "text-gray-400"} />}
                        {badge.icon === 'Award' && <Award size={18} className={badge.unlocked ? "text-indigo-400" : "text-gray-400"} />}
                        {badge.icon === 'Star' && <Star size={18} className={badge.unlocked ? "text-amber-400 fill-amber-400" : "text-gray-400"} />}
                        {badge.icon === 'BookOpen' && <BookOpen size={18} className={badge.unlocked ? "text-blue-400" : "text-gray-400"} />}
                        {badge.icon === 'ShieldCheck' && <ShieldCheck size={18} className={badge.unlocked ? "text-emerald-400" : "text-gray-400"} />}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-bold text-white truncate">{badge.title}</h3>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                            badge.tier === 'gold' ? 'text-amber-300 bg-amber-500/20' : badge.tier === 'silver' ? 'text-blue-300 bg-blue-500/20' : 'text-orange-300 bg-orange-500/20'
                          }`}>
                            {badge.tier}
                          </span>
                        </div>
                        <p className="text-xs text-[#8EA1D0] mt-0.5 leading-snug">{badge.description}</p>
                        <div className="mt-2 flex items-center justify-between text-[11px]">
                          <span className={badge.unlocked ? "text-emerald-400 font-semibold" : "text-[#8EA1D0]"}>
                            {badge.unlocked ? "✓ Unlocked" : "Locked"}
                          </span>
                          <span className="text-[#8EA1D0] font-mono text-[10px]">
                            {badge.progress}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* My Earned Certifications */}
            <section className="bg-[#1A2E68] border border-[#2D458B] rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <GraduationCap className="text-amber-400" size={22} />
                  <div>
                    <h2 className="text-xl font-bold text-white">My Earned Certifications</h2>
                    <p className="text-xs text-[#8EA1D0]">Verified credentials awarded upon topic/course completion</p>
                  </div>
                </div>
                <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full font-bold">
                  {certificates.length} {certificates.length === 1 ? 'Certificate' : 'Certificates'}
                </span>
              </div>

              {certificates.length === 0 ? (
                <div className="text-center py-8 bg-[#0F2154]/50 border border-dashed border-[#2D458B] rounded-xl px-4">
                  <GraduationCap size={40} className="mx-auto text-[#8EA1D0]/60 mb-2" />
                  <p className="text-sm font-semibold text-white">No Certifications Earned Yet</p>
                  <p className="text-xs text-[#8EA1D0] mt-1 max-w-md mx-auto">
                    When a peer instructor marks your learning session as completed, you will receive an official verifiable Certificate of Completion here.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {certificates.map((cert) => (
                    <div
                      key={cert.certificate_id}
                      className="bg-[#0F2154] border border-[#2D458B] hover:border-amber-400/50 rounded-xl p-5 transition flex flex-col justify-between shadow-sm relative overflow-hidden group"
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-500/10 to-transparent rounded-bl-full pointer-events-none" />

                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <span className="px-2.5 py-1 bg-amber-400/10 text-amber-300 border border-amber-400/30 rounded-lg text-xs font-bold uppercase tracking-wider">
                            Verified Credential
                          </span>
                          <span className="text-[11px] text-[#8EA1D0] font-mono">
                            {cert.formatted_date}
                          </span>
                        </div>

                        <h3 className="text-lg font-extrabold text-white mt-3 group-hover:text-amber-300 transition">
                          {cert.skill_name}
                        </h3>

                        <p className="text-xs text-[#8EA1D0] mt-1 flex items-center gap-1.5">
                          <span>Instructor:</span>
                          <span className="text-white font-medium">{cert.teacher_name}</span>
                          <Check size={13} className="text-emerald-400" />
                        </p>

                        <div className="mt-3 flex items-center gap-4 text-xs text-[#8EA1D0]">
                          <span>Duration: <strong>{cert.duration_hours} hrs</strong></span>
                          <span>•</span>
                          <span className="font-mono text-[11px] text-amber-300/80">{cert.certificate_uuid}</span>
                        </div>
                      </div>

                      <div className="mt-5 pt-4 border-t border-[#2D458B]/60 flex items-center justify-between">
                        <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
                          <FileCheck size={14} /> Completed & Verified
                        </span>

                        <button
                          onClick={() => setSelectedCertificate(cert)}
                          className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-bold rounded-lg transition shadow flex items-center gap-1.5"
                        >
                          <Award size={14} /> View & Download
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Skills Offered (type = 'teach') */}
            <div className="bg-[#1A2E68] border border-[#2D458B] rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <BookOpen className="text-blue-400" size={20} />
                  <h2 className="text-xl font-bold text-white">Skills I Teach (Offers)</h2>
                </div>
                <span className="text-xs bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full font-semibold">
                  {user?.offers?.length || 0} skills
                </span>
              </div>

              {(!user?.offers || user.offers.length === 0) ? (
                <p className="text-sm text-[#9DAACB] py-4">No teaching skills added yet. Click 'Add Skill' to offer a skill!</p>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {user.offers.map((s) => (
                    <div
                      key={s.skill_id}
                      className="bg-[#203679] border border-[#3754A5] text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2"
                    >
                      <span>{s.name}</span>
                      <button
                        onClick={() => handleRemoveSkill(s.skill_id, 'teach')}
                        className="text-gray-400 hover:text-red-400 transition"
                        title="Remove skill"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Skills Wanted (type = 'learn') */}
            <div className="bg-[#1A2E68] border border-[#2D458B] rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="text-purple-400" size={20} />
                  <h2 className="text-xl font-bold text-white">Skills I Want to Learn (Wants)</h2>
                </div>
                <span className="text-xs bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full font-semibold">
                  {user?.wants?.length || 0} skills
                </span>
              </div>

              {(!user?.wants || user.wants.length === 0) ? (
                <p className="text-sm text-[#9DAACB] py-4">No learning skills added yet. Click 'Add Skill' to specify what you want to learn!</p>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {user.wants.map((s) => (
                    <div
                      key={s.skill_id}
                      className="bg-[#2D2A68] border border-[#48429B] text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2"
                    >
                      <span>{s.name}</span>
                      <button
                        onClick={() => handleRemoveSkill(s.skill_id, 'learn')}
                        className="text-gray-400 hover:text-red-400 transition"
                        title="Remove skill"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* FEATURE: Availability Schedule */}
            <div className="bg-[#1A2E68] border border-[#2D458B] rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="text-emerald-400" size={20} />
                  <h2 className="text-xl font-bold text-white">My Weekly Teaching Availability</h2>
                </div>
                <button
                  onClick={() => setShowAvailModal(true)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Plus size={15} /> Add Time Slot
                </button>
              </div>

              {availabilitySlots.length === 0 ? (
                <p className="text-sm text-[#9DAACB] py-3">
                  No availability set yet. Adding your available days and hours helps learners find and schedule sessions with you!
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
                  {availabilitySlots.map((slot) => (
                    <div
                      key={slot.availability_id}
                      className="bg-[#0F2154] border border-[#2D458B] rounded-xl p-3 flex items-center justify-between"
                    >
                      <div>
                        <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                          {slot.day_of_week}
                        </span>
                        <span className="text-sm text-white font-medium">
                          {slot.time_slot}
                        </span>
                      </div>
                      <button
                        onClick={() => handleRemoveAvailability(slot.availability_id)}
                        className="text-gray-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition"
                        title="Remove time slot"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Specific Date Blackouts / Overrides Section */}
              <div className="mt-6 pt-5 border-t border-[#2D458B]/60">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-amber-300 flex items-center gap-1.5">
                      <span>🚫</span> Date Blackouts & Exceptions (Holidays / Leave)
                    </h3>
                    <p className="text-[11px] text-[#8EA1D0]">
                      Block specific calendar dates when you are unavailable to teach.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowOverrideModal(true)}
                    className="bg-amber-600/80 hover:bg-amber-600 text-white px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition"
                  >
                    <Plus size={14} /> Add Blackout Date
                  </button>
                </div>

                {dateOverrides.length === 0 ? (
                  <p className="text-xs text-[#8EA1D0] italic py-2">
                    No date blackouts scheduled. Your standard weekly hours will apply across the calendar.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
                    {dateOverrides.map((ov) => (
                      <div
                        key={ov.override_id}
                        className="bg-[#0F2154] border border-amber-500/30 rounded-xl p-3 flex items-center justify-between"
                      >
                        <div>
                          <span className="text-xs font-bold text-amber-300 block">
                            {ov.override_date}
                          </span>
                          <span className="text-xs text-[#8EA1D0] truncate block max-w-[180px]">
                            {ov.reason || 'Personal Leave / Blackout'}
                          </span>
                        </div>
                        <button
                          onClick={() => handleRemoveOverride(ov.override_id)}
                          className="text-gray-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition"
                          title="Remove blackout date"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* FEATURE: Reviews & Ratings Section */}
            <div className="bg-[#1A2E68] border border-[#2D458B] rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Star className="text-amber-400 fill-amber-400" size={20} />
                  <h2 className="text-xl font-bold text-white">Student Reviews & Ratings</h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-extrabold text-amber-300">
                    {reviewsData.average_rating > 0 ? `${reviewsData.average_rating} / 5.0` : 'No rating yet'}
                  </span>
                  <span className="text-xs text-[#8EA1D0]">
                    ({reviewsData.total_reviews} {reviewsData.total_reviews === 1 ? 'review' : 'reviews'})
                  </span>
                </div>
              </div>

              {reviewsData.reviews.length === 0 ? (
                <p className="text-sm text-[#9DAACB] py-4">
                  No reviews received yet. Complete sessions to earn ratings and feedback from your peers!
                </p>
              ) : (
                <div className="space-y-3">
                  {reviewsData.reviews.map((rev) => (
                    <div
                      key={rev.review_id}
                      className="bg-[#0F2154] border border-[#2D458B] rounded-xl p-4 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-[#2864E8] text-white font-bold text-xs flex items-center justify-center">
                            {rev.reviewer_name?.charAt(0) || "S"}
                          </div>
                          <div>
                            <span className="text-sm font-semibold text-white block">{rev.reviewer_name}</span>
                            {rev.skill_name && (
                              <span className="text-[11px] text-blue-300 font-medium">Session: {rev.skill_name}</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              size={13}
                              className={s <= rev.rating ? "text-amber-400 fill-amber-400" : "text-gray-600"}
                            />
                          ))}
                          <span className="text-xs text-amber-300 font-bold ml-1">{rev.rating}.0</span>
                        </div>
                      </div>

                      {rev.comment && (
                        <p className="text-xs text-[#D9DEFA] italic bg-[#1A2E68]/60 p-2.5 rounded-lg">
                          "{rev.comment}"
                        </p>
                      )}

                      <span className="text-[10px] text-[#8EA1D0] block text-right">
                        {new Date(rev.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* AVAILABILITY MODAL */}
      {showAvailModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#0F2154] border border-[#2D458B] rounded-2xl p-6 w-full max-w-[460px] shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Calendar size={18} className="text-emerald-400" />
                Add Teaching Availability Slot
              </h3>
              <button onClick={() => setShowAvailModal(false)} className="text-gray-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            {availError && (
              <div className="mb-4 bg-red-500/20 border border-red-500/50 text-red-200 text-xs px-3.5 py-2.5 rounded-xl">
                {availError}
              </div>
            )}

            <form onSubmit={handleAddAvailability} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#8EA1D0] mb-1.5">
                  Day of the Week
                </label>
                <select
                  value={newSlotDay}
                  onChange={(e) => setNewSlotDay(e.target.value)}
                  className="w-full bg-[#1A2E68] border border-[#2D458B] rounded-xl px-4 py-2.5 text-white text-sm outline-none"
                >
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#8EA1D0] mb-1.5">
                  Time Slot
                </label>
                <select
                  value={newSlotTime}
                  onChange={(e) => setNewSlotTime(e.target.value)}
                  className="w-full bg-[#1A2E68] border border-[#2D458B] rounded-xl px-4 py-2.5 text-white text-sm outline-none mb-2"
                >
                  <option value="09:00 AM - 11:00 AM">09:00 AM - 11:00 AM (Morning)</option>
                  <option value="11:00 AM - 01:00 PM">11:00 AM - 01:00 PM (Midday)</option>
                  <option value="02:00 PM - 04:00 PM">02:00 PM - 04:00 PM (Afternoon)</option>
                  <option value="04:00 PM - 06:00 PM">04:00 PM - 06:00 PM (Late Afternoon)</option>
                  <option value="06:00 PM - 08:00 PM">06:00 PM - 08:00 PM (Evening)</option>
                  <option value="custom">+ Custom Time Slot</option>
                </select>

                {newSlotTime === 'custom' && (
                  <input
                    type="text"
                    placeholder="e.g. 10:30 AM - 12:30 PM"
                    value={customSlotTime}
                    onChange={(e) => setCustomSlotTime(e.target.value)}
                    className="w-full bg-[#1A2E68] border border-[#2D458B] rounded-xl px-4 py-2.5 text-white text-sm outline-none"
                  />
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAvailModal(false)}
                  className="w-1/2 py-2.5 bg-[#1A2E68] hover:bg-[#203679] text-[#8EA1D0] rounded-xl font-semibold text-sm transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loadingAvail}
                  className="w-1/2 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold text-sm transition disabled:opacity-50"
                >
                  {loadingAvail ? "Saving..." : "Save Time Slot"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL FOR ADDING DATE BLACKOUT / OVERRIDE */}
      {showOverrideModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#0F2154] border border-amber-500/40 rounded-2xl p-6 w-full max-w-[440px] shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>🚫</span> Add Date Blackout / Leave
              </h3>
              <button onClick={() => setShowOverrideModal(false)} className="text-gray-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            {overrideError && (
              <div className="mb-4 bg-red-500/20 border border-red-500/50 text-red-200 text-xs px-3.5 py-2.5 rounded-xl">
                {overrideError}
              </div>
            )}

            <form onSubmit={handleAddOverride} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#8EA1D0] mb-1.5">
                  Blackout Date
                </label>
                <input
                  type="date"
                  value={overrideDate}
                  min={(() => {
                    const d = new Date();
                    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                  })()}
                  onChange={(e) => setOverrideDate(e.target.value)}
                  className="w-full bg-[#1A2E68] border border-[#2D458B] rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#8EA1D0] mb-1.5">
                  Reason / Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. University Final Exams, Family Travel"
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  className="w-full bg-[#1A2E68] border border-[#2D458B] rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-amber-400"
                />
                <p className="text-[11px] text-[#8EA1D0] mt-1">
                  Students will see this date as unavailable with this reason on the booking calendar.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowOverrideModal(false)}
                  className="w-1/2 py-2.5 bg-[#1A2E68] hover:bg-[#203679] text-[#8EA1D0] rounded-xl font-semibold text-sm transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loadingOverride}
                  className="w-1/2 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-semibold text-sm transition disabled:opacity-50"
                >
                  {loadingOverride ? "Saving..." : "Save Blackout"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL FOR ADDING / CREATING CUSTOM SKILLS */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#0F2154] border border-[#2D458B] rounded-2xl p-6 w-full max-w-[480px] shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-bold text-white">Add Skill to Profile</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            {errorMsg && (
              <div className="mb-4 bg-red-500/20 border border-red-500/50 text-red-200 text-sm px-4 py-2.5 rounded-xl">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleAddSkill} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#8EA1D0] mb-1.5">Skill Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSkillType('teach')}
                    className={`py-2.5 rounded-xl font-semibold text-sm transition ${
                      skillType === 'teach'
                        ? 'bg-[#2864E8] text-white'
                        : 'bg-[#1A2E68] text-[#8EA1D0] hover:text-white'
                    }`}
                  >
                    I Teach This
                  </button>
                  <button
                    type="button"
                    onClick={() => setSkillType('learn')}
                    className={`py-2.5 rounded-xl font-semibold text-sm transition ${
                      skillType === 'learn'
                        ? 'bg-purple-600 text-white'
                        : 'bg-[#1A2E68] text-[#8EA1D0] hover:text-white'
                    }`}
                  >
                    I Want to Learn
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#8EA1D0] mb-1.5">Select Skill</label>
                <select
                  value={selectedSkillId}
                  onChange={(e) => setSelectedSkillId(e.target.value)}
                  className="w-full bg-[#1A2E68] border border-[#2D458B] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#2864E8]"
                >
                  <option value="">-- Choose from existing skills taxonomy --</option>
                  {taxonomy.map((s) => (
                    <option key={s.skill_id} value={s.skill_id}>
                      {s.name}
                    </option>
                  ))}
                  <option value="custom">+ Add Custom Skill (New Entry)</option>
                </select>
              </div>

              {selectedSkillId === 'custom' && (
                <div>
                  <label className="block text-sm font-semibold text-[#8EA1D0] mb-1.5">
                    Custom Skill Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Advanced Rust Programming"
                    value={customSkillName}
                    onChange={(e) => setCustomSkillName(e.target.value)}
                    className="w-full bg-[#1A2E68] border border-[#2D458B] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#2864E8]"
                  />
                  <p className="text-xs text-[#8EA1D0] mt-1">
                    This custom skill will be added to the taxonomy database instantly.
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-1/2 py-3 bg-[#1A2E68] hover:bg-[#203679] text-[#8EA1D0] rounded-xl font-semibold text-sm transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loadingAction}
                  className="w-1/2 py-3 bg-[#2864E8] hover:bg-[#1D55CC] text-white rounded-xl font-semibold text-sm transition disabled:opacity-50"
                >
                  {loadingAction ? "Adding..." : "Add Skill"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Certificate Modal */}
      {selectedCertificate && (
        <CertificateModal
          certificate={selectedCertificate}
          onClose={() => setSelectedCertificate(null)}
        />
      )}
    </div>
  );
}

export default Profile;