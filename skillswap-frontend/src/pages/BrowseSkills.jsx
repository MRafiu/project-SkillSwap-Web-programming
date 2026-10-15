import {
  Search,
  LayoutGrid,
  UserRound,
  MessageSquare,
  ArrowLeftRight,
  LogOut,
  BookOpen,
  Mail,
  Coins,
  Send,
  Star,
  Calendar,
  Clock,
  Trophy
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { skillApi, sessionApi } from "../api/apiClient";
import { useAuth } from "../context/AuthContext";

function BrowseSkills() {
  const navigate = useNavigate();
  const { user, logoutUser } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [minRating, setMinRating] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [selectedSlotPeriod, setSelectedSlotPeriod] = useState("");
  const [availableTopics, setAvailableTopics] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load available skill topics for filter dropdown
  useEffect(() => {
    skillApi.getTaxonomy()
      .then(tax => {
        if (Array.isArray(tax)) {
          const names = Array.from(new Set(tax.map(s => s.name).filter(Boolean))).sort();
          setAvailableTopics(names);
        }
      })
      .catch(err => console.error("Error loading taxonomy topics:", err));
  }, []);

  // Request Modal State
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [requestSkillName, setRequestSkillName] = useState("");
  const [durationHours, setDurationHours] = useState("1.00");
  const [modalTimeSlot, setModalTimeSlot] = useState("");
  const [requestError, setRequestError] = useState("");
  const [requestSuccess, setRequestSuccess] = useState("");
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    let ignore = false;
    skillApi.searchTeachers({
      q: searchQuery || undefined,
      min_rating: minRating || undefined,
      topic: selectedTopic || undefined,
      date: selectedDate || undefined,
      slot_period: selectedDate ? (selectedSlotPeriod || undefined) : undefined
    })
      .then(data => {
        if (!ignore) {
          const filtered = data.filter(t => parseInt(t.user_id, 10) !== parseInt(user?.user_id, 10));
          setTeachers(filtered);
          setLoading(false);
        }
      })
      .catch(err => {
        console.error("Search teachers error:", err);
        if (!ignore) {
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [user?.user_id, searchQuery, minRating, selectedTopic, selectedDate, selectedSlotPeriod]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    skillApi.searchTeachers({
      q: searchQuery || undefined,
      min_rating: minRating || undefined,
      topic: selectedTopic || undefined,
      date: selectedDate || undefined,
      slot_period: selectedDate ? (selectedSlotPeriod || undefined) : undefined
    })
      .then(data => {
        const filtered = data.filter(t => parseInt(t.user_id, 10) !== parseInt(user?.user_id, 10));
        setTeachers(filtered);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const handleOpenRequestModal = (teacher) => {
    setSelectedTeacher(teacher);
    setRequestSkillName(teacher.offers[0] || "");
    setDurationHours("1.00");
    setModalTimeSlot(teacher.open_date_slots && teacher.open_date_slots.length > 0 ? teacher.open_date_slots[0] : "");
    setRequestError("");
    setRequestSuccess("");
  };

  const handleSendSessionRequest = async (e) => {
    e.preventDefault();
    if (!selectedTeacher || !requestSkillName || !durationHours) {
      setRequestError("Please complete all request details.");
      return;
    }

    const userCredits = parseFloat(user?.credit_balance ?? user?.credits ?? 0);
    const duration = parseFloat(durationHours);
    if (userCredits < duration) {
      setRequestError(`Insufficient credits (${userCredits.toFixed(1)} available, ${duration.toFixed(1)} required). Complete sessions as a teacher to earn credits!`);
      return;
    }

    try {
      setRequesting(true);
      setRequestError("");

      // Find skill ID for requestSkillName from taxonomy
      const taxonomy = await skillApi.getTaxonomy();
      const matchedSkill = taxonomy.find(
        s => s.name.toLowerCase() === requestSkillName.toLowerCase()
      );

      if (!matchedSkill) {
        setRequestError(`Skill "${requestSkillName}" not found in system taxonomy.`);
        setRequesting(false);
        return;
      }

      await sessionApi.createSession(
        selectedTeacher.user_id,
        matchedSkill.skill_id,
        duration,
        selectedDate || null,
        modalTimeSlot || null
      );

      setRequestSuccess(`Request successfully sent to ${selectedTeacher.full_name}!`);
      setTimeout(() => {
        setSelectedTeacher(null);
        navigate("/requests");
      }, 1500);
    } catch (err) {
      setRequestError(err.message || "Failed to create session request");
    } finally {
      setRequesting(false);
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
              const active = item.name === "Search" || item.name === "Skills";
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
          <div className="max-w-[1250px] mx-auto space-y-6">
            {/* Search Header */}
            <div className="text-center max-w-[700px] mx-auto py-4">
              <h1 className="text-3xl md:text-4xl font-extrabold text-white">Find Teachers & Skills</h1>
              <p className="text-[#9DAACB] text-sm mt-2">
                Discover peer teachers offering the skills you want to learn.
              </p>

              <form onSubmit={handleSearchSubmit} className="mt-6 flex items-center bg-[#1A2E68] border border-[#2D458B] rounded-2xl px-4 py-2 shadow-lg">
                <Search className="text-[#8EA1D0] shrink-0" size={20} />
                <input
                  type="text"
                  placeholder="Search by skill name (e.g. React JS, Python, UI Design)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent border-none outline-none text-white px-3 py-2 text-sm placeholder-[#8EA1D0]"
                />
                <button
                  type="submit"
                  className="bg-[#2864E8] hover:bg-[#1D55CC] text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition shrink-0"
                >
                  Search
                </button>
              </form>

              {/* Filter Controls for Rating & Availability */}
              <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                <div className="flex items-center gap-2 bg-[#1A2E68] border border-[#2D458B] rounded-xl px-3 py-2 text-xs text-[#8EA1D0]">
                  <Star size={14} className="text-amber-400 fill-amber-400" />
                  <label className="font-semibold text-white">Rating:</label>
                  <select
                    value={minRating}
                    onChange={(e) => setMinRating(e.target.value)}
                    className="bg-transparent border-none outline-none text-white text-xs font-medium cursor-pointer"
                  >
                    <option value="" className="bg-[#0F2154] text-white">All Ratings</option>
                    <option value="4.0" className="bg-[#0F2154] text-white">★ 4.0 & above</option>
                    <option value="4.5" className="bg-[#0F2154] text-white">★ 4.5 & above</option>
                    <option value="5.0" className="bg-[#0F2154] text-white">★ 5.0 only</option>
                  </select>
                </div>

                {/* Calendar Availability Filter */}
                <div className="flex items-center gap-2 bg-[#1A2E68] border border-[#2D458B] rounded-xl px-3 py-2 text-xs text-[#8EA1D0]">
                  <Calendar size={14} className="text-blue-400" />
                  <label className="font-semibold text-white">Available Date:</label>
                  <input
                    type="date"
                    value={selectedDate}
                    min={(() => {
                      const d = new Date();
                      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                    })()}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      if (!e.target.value) setSelectedSlotPeriod("");
                    }}
                    className="bg-transparent border-none outline-none text-white text-xs font-medium cursor-pointer [color-scheme:dark]"
                    title="Filter teachers by available calendar date"
                  />
                  {selectedDate && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDate("");
                        setSelectedSlotPeriod("");
                      }}
                      className="text-[#8EA1D0] hover:text-white transition ml-1 text-sm leading-none font-bold"
                      title="Clear date filter"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Topic / Subject Filter */}
                <div className="flex items-center gap-2 bg-[#1A2E68] border border-[#2D458B] rounded-xl px-3 py-2 text-xs text-[#8EA1D0]">
                  <BookOpen size={14} className="text-indigo-400" />
                  <label className="font-semibold text-white">Topic / Subject:</label>
                  <select
                    value={selectedTopic}
                    onChange={(e) => setSelectedTopic(e.target.value)}
                    className="bg-transparent border-none outline-none text-white text-xs font-medium cursor-pointer max-w-[140px] truncate"
                  >
                    <option value="" className="bg-[#0F2154] text-white">All Topics</option>
                    {availableTopics.map(topic => (
                      <option key={topic} value={topic} className="bg-[#0F2154] text-white">{topic}</option>
                    ))}
                  </select>
                  {selectedTopic && (
                    <button
                      type="button"
                      onClick={() => setSelectedTopic("")}
                      className="text-[#8EA1D0] hover:text-white transition ml-1 text-sm leading-none font-bold"
                      title="Clear topic filter"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Conditional Between Filter (appears after picking a date from the calendar) */}
                {selectedDate && (
                  <div className="flex items-center gap-2 bg-[#1A2E68] border border-blue-500/50 rounded-xl px-3 py-2 text-xs text-[#8EA1D0]">
                    <Clock size={14} className="text-emerald-400" />
                    <label className="font-semibold text-white">Between:</label>
                    <select
                      value={selectedSlotPeriod}
                      onChange={(e) => setSelectedSlotPeriod(e.target.value)}
                      className="bg-transparent border-none outline-none text-white text-xs font-medium cursor-pointer"
                      title="Filter by daytime slot window"
                    >
                      <option value="" className="bg-[#0F2154] text-white">All Day (Any Slot)</option>
                      <option value="morning" className="bg-[#0F2154] text-white">Slot 1: Morning (08:00 AM - 12:00 PM)</option>
                      <option value="afternoon" className="bg-[#0F2154] text-white">Slot 2: Afternoon (12:00 PM - 05:00 PM)</option>
                      <option value="evening" className="bg-[#0F2154] text-white">Slot 3: Evening / Night (05:00 PM - 11:30 PM)</option>
                    </select>
                    {selectedSlotPeriod && (
                      <button
                        type="button"
                        onClick={() => setSelectedSlotPeriod("")}
                        className="text-[#8EA1D0] hover:text-white transition ml-1 text-sm leading-none font-bold"
                        title="Clear slot filter"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                )}

                {(minRating || selectedDate || selectedTopic || selectedSlotPeriod || searchQuery) && (
                  <button
                    onClick={() => {
                      setMinRating("");
                      setSelectedDate("");
                      setSelectedTopic("");
                      setSelectedSlotPeriod("");
                      setSearchQuery("");
                    }}
                    className="text-xs text-[#8EA1D0] hover:text-white underline py-1 px-2"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>

            {/* Results Grid */}
            {loading ? (
              <div className="py-12 text-center text-[#9DAACB]">Searching teacher directory...</div>
            ) : teachers.length === 0 ? (
              <div className="py-12 text-center bg-[#1A2E68] border border-[#2D458B] rounded-2xl text-[#9DAACB]">
                No teachers found matching your criteria. Try adjusting your filters!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {teachers.map((t) => (
                  <div key={t.user_id} className="bg-[#1A2E68] border border-[#2D458B] rounded-2xl p-6 flex flex-col justify-between hover:border-[#2864E8] transition shadow-lg">
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-4">
                        <div
                          onClick={() => navigate(`/profile/${t.user_id}`)}
                          className="flex items-center gap-3 cursor-pointer group"
                          title="View public profile"
                        >
                          <div className="w-12 h-12 rounded-full bg-[#2864E8] text-white font-extrabold text-lg flex items-center justify-center shrink-0 group-hover:ring-2 group-hover:ring-blue-400 transition">
                            {t.full_name.charAt(0)}
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-white leading-snug group-hover:text-blue-400 transition">{t.full_name}</h3>
                            <p className="text-xs text-[#8EA1D0] flex items-center gap-1 mt-0.5">
                              <Mail size={12} /> {t.email}
                            </p>
                          </div>
                        </div>

                        {/* Rating & Reliability Badges */}
                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                          {t.average_rating ? (
                            <span className="flex items-center gap-1 bg-amber-500/20 text-amber-300 text-xs px-2.5 py-1 rounded-lg font-bold border border-amber-500/30">
                              <Star size={13} className="fill-amber-300 text-amber-300" />
                              {t.average_rating} ({t.total_reviews})
                            </span>
                          ) : (
                            <span className="text-[11px] text-[#8EA1D0] bg-[#203679] px-2 py-0.5 rounded-lg font-medium">
                              New
                            </span>
                          )}
                          {t.reliability_score !== undefined && t.reliability_score !== null && (
                            <span
                              className={`text-[11px] px-2 py-0.5 rounded-md font-semibold border ${
                                Number(t.reliability_score) >= 90
                                  ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                                  : Number(t.reliability_score) >= 70
                                  ? "bg-blue-500/15 text-blue-300 border-blue-500/30"
                                  : "bg-amber-500/15 text-amber-300 border-amber-500/30"
                              }`}
                              title="Community reliability commitment score"
                            >
                              {Number(t.reliability_score).toFixed(0)}% Trust
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Skills Taught */}
                      <div className="mb-3">
                        <span className="text-xs text-[#8EA1D0] uppercase font-semibold block mb-1.5">Teaches:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {t.offers.map((sk, idx) => (
                            <span key={idx} className="bg-blue-500/20 text-blue-300 text-xs px-2.5 py-1 rounded-lg font-medium">
                              {sk}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Skills Wants */}
                      {t.wants && t.wants.length > 0 && (
                        <div className="mb-3">
                          <span className="text-xs text-[#8EA1D0] uppercase font-semibold block mb-1.5">Wants to Learn:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {t.wants.map((sk, idx) => (
                              <span key={idx} className="bg-purple-500/20 text-purple-300 text-xs px-2.5 py-1 rounded-lg font-medium">
                                {sk}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Availability Days & Hours */}
                      <div className="mb-2 pt-1 border-t border-[#2D458B]/50">
                        <span className="text-[11px] text-[#8EA1D0] uppercase font-semibold flex items-center justify-between gap-1 mb-1.5">
                          <span className="flex items-center gap-1">
                            <Calendar size={12} className="text-emerald-400" />
                            {selectedDate && t.open_date_slots ? `Open on ${selectedDate} (${t.date_day}):` : "Available Days & Hours:"}
                          </span>
                          {selectedDate && t.open_date_slots && (
                            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                              Date Matched
                            </span>
                          )}
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedDate && t.open_date_slots ? (
                            t.open_date_slots.map((slot, idx) => (
                              <span
                                key={idx}
                                className="bg-emerald-500/20 text-emerald-200 border border-emerald-500/30 text-[11px] px-2 py-0.5 rounded-md font-semibold inline-flex items-center gap-1"
                              >
                                <span>{slot}</span>
                              </span>
                            ))
                          ) : t.availability && t.availability.length > 0 ? (
                            t.availability.map((slot, idx) => (
                              <span
                                key={idx}
                                className="bg-emerald-500/15 text-emerald-300 text-[11px] px-2 py-0.5 rounded-md font-medium inline-flex items-center gap-1"
                              >
                                <span>{slot.day_of_week}:</span>
                                <span className="text-emerald-200">{slot.time_slot}</span>
                              </span>
                            ))
                          ) : t.available_days && t.available_days.length > 0 ? (
                            t.available_days.map((day, idx) => (
                              <span key={idx} className="bg-emerald-500/15 text-emerald-300 text-[11px] px-2 py-0.5 rounded-md font-medium">
                                {day}
                              </span>
                            ))
                          ) : (
                            <span className="text-[11px] text-[#8EA1D0] italic">Flexible / By message</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => navigate(`/messages?user=${t.user_id}`)}
                        className="flex-1 bg-[#1A2E68] hover:bg-[#233D83] text-white border border-[#2D458B] py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-1.5 transition shadow-sm"
                        title="Direct chat with teacher"
                      >
                        <MessageSquare size={15} className="text-blue-400" /> Message
                      </button>
                      <button
                        onClick={() => handleOpenRequestModal(t)}
                        className="flex-[1.4] bg-[#2864E8] hover:bg-[#1D55CC] text-white py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-1.5 transition shadow-sm"
                      >
                        <Send size={15} /> Request Session
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* REQUEST SESSION MODAL */}
      {selectedTeacher && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#0F2154] border border-[#2D458B] rounded-2xl p-6 w-full max-w-[480px] shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-2">Request Session with {selectedTeacher.full_name}</h3>
            <p className="text-xs text-[#8EA1D0] mb-5">
              Specify the skill you want to learn and the duration in hours.
            </p>

            {requestError && (
              <div className="mb-4 bg-red-500/20 border border-red-500/50 text-red-200 text-sm px-4 py-2.5 rounded-xl">
                {requestError}
              </div>
            )}

            {requestSuccess && (
              <div className="mb-4 bg-emerald-500/20 border border-emerald-500/50 text-emerald-200 text-sm px-4 py-2.5 rounded-xl">
                {requestSuccess}
              </div>
            )}

            <form onSubmit={handleSendSessionRequest} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#8EA1D0] mb-1.5">Select Skill</label>
                <select
                  value={requestSkillName}
                  onChange={(e) => setRequestSkillName(e.target.value)}
                  className="w-full bg-[#1A2E68] border border-[#2D458B] rounded-xl px-4 py-3 text-white text-sm outline-none"
                >
                  {selectedTeacher.offers.map((sk, idx) => (
                    <option key={idx} value={sk}>{sk}</option>
                  ))}
                </select>
              </div>

              {selectedDate && (
                <div className="bg-[#1A2E68] border border-blue-500/30 rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white font-semibold flex items-center gap-1.5">
                      <Calendar size={13} className="text-blue-400" /> Date: {selectedDate}
                    </span>
                    <span className="text-[11px] text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded font-semibold border border-emerald-500/30">
                      Date Matched
                    </span>
                  </div>
                  {selectedTeacher.open_date_slots && selectedTeacher.open_date_slots.length > 0 && (
                    <div>
                      <label className="block text-[11px] font-semibold text-[#8EA1D0] mb-1">
                        Select Available Time Slot
                      </label>
                      <select
                        value={modalTimeSlot}
                        onChange={(e) => setModalTimeSlot(e.target.value)}
                        className="w-full bg-[#0F2154] border border-[#2D458B] rounded-xl px-3 py-2 text-white text-xs outline-none"
                      >
                        {selectedTeacher.open_date_slots.map((slot, idx) => (
                          <option key={idx} value={slot}>{slot}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-[#8EA1D0] mb-1.5">Duration (Hours)</label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="10"
                  value={durationHours}
                  onChange={(e) => setDurationHours(e.target.value)}
                  className="w-full bg-[#1A2E68] border border-[#2D458B] rounded-xl px-4 py-3 text-white text-sm outline-none"
                />
                <p className="text-xs text-[#8EA1D0] mt-1 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Coins size={12} className="text-amber-300" />
                    Cost: {parseFloat(durationHours || 0).toFixed(2)} hours credit.
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const t = selectedTeacher;
                      const s = requestSkillName;
                      setSelectedTeacher(null);
                      navigate("/schedule", { state: { teacher: t, skill: s, initialDate: selectedDate || undefined } });
                    }}
                    className="text-blue-400 hover:text-blue-300 underline text-xs"
                  >
                    Pick specific date & time &rarr;
                  </button>
                </p>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setSelectedTeacher(null)}
                  className="w-1/2 py-3 bg-[#1A2E68] hover:bg-[#203679] text-[#8EA1D0] rounded-xl font-semibold text-sm transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={requesting}
                  className="w-1/2 py-3 bg-[#2864E8] hover:bg-[#1D55CC] text-white rounded-xl font-semibold text-sm transition disabled:opacity-50"
                >
                  {requesting ? "Sending..." : "Submit Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default BrowseSkills;