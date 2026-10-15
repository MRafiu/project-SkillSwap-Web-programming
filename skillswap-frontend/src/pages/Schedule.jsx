import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  UserRound,
  CheckCircle,
  AlertCircle,
  Coins,
  MessageSquare,
  Sparkles
} from "lucide-react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { availabilityApi, sessionApi, skillApi, userApi } from "../api/apiClient";
import CalendarAvailabilityPicker from "../components/common/CalendarAvailabilityPicker";

function Schedule() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { user, refreshUser } = useAuth();

  // Teacher & skill from navigation state or params
  const passedTeacher = location.state?.teacher || location.state?.user;
  const teacherId = passedTeacher?.user_id || passedTeacher?.id || searchParams.get("teacher_id");

  const [teacherProfile, setTeacherProfile] = useState(passedTeacher || null);
  const initialSkill = location.state?.skill || (passedTeacher?.offers && passedTeacher.offers[0]) || "";
  const initialDateStr = location.state?.initialDate || "";
  const initialDateParts = initialDateStr && /^\d{4}-\d{2}-\d{2}$/.test(initialDateStr)
    ? initialDateStr.split('-').map(Number)
    : null;

  const [selectedSkill, setSelectedSkill] = useState(initialSkill);
  const [selectedDate, setSelectedDate] = useState(initialDateStr);
  const [selectedTime, setSelectedTime] = useState("");
  const [durationHours, setDurationHours] = useState("1.00");

  // Load teacher profile if not passed in navigation state
  useEffect(() => {
    if (teacherId && (!teacherProfile || !teacherProfile.full_name)) {
      userApi.getPublicProfile(teacherId)
        .then((profile) => {
          if (profile) {
            setTeacherProfile(profile);
            if (!selectedSkill && profile.offers && profile.offers.length > 0) {
              const firstOffer = typeof profile.offers[0] === 'string' ? profile.offers[0] : profile.offers[0].name;
              setSelectedSkill(firstOffer);
            }
          }
        })
        .catch((err) => console.error("Failed to load teacher public profile:", err));
    }
  }, [teacherId, teacherProfile, selectedSkill]);

  const activeTeacher = teacherProfile || passedTeacher;
  const teacherName = activeTeacher?.full_name || activeTeacher?.name || "Teacher";
  const teacherEmail = activeTeacher?.email || "";
  const teacherOffers = activeTeacher?.offers || [];

  // Pre-select first skill offer if available
  useEffect(() => {
    if (!selectedSkill && teacherOffers.length > 0) {
      const first = typeof teacherOffers[0] === 'string' ? teacherOffers[0] : teacherOffers[0].name;
      setSelectedSkill(first);
    }
  }, [teacherOffers, selectedSkill]);

  // Calendar Availability state
  const now = new Date();
  const [currentYear, setCurrentYear] = useState(initialDateParts ? initialDateParts[0] : now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(initialDateParts ? initialDateParts[1] : now.getMonth() + 1);
  const [calendarDays, setCalendarDays] = useState({});
  const [loadingCalendar, setLoadingCalendar] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Load calendar availability for month
  const loadCalendar = useCallback(async (year, month) => {
    if (!teacherId) return;

    try {
      setLoadingCalendar(true);
      const monthStr = `${year}-${String(month).padStart(2, "0")}`;
      const res = await availabilityApi.getCalendarAvailability(teacherId, monthStr);
      if (res && res.calendar_days) {
        setCalendarDays(res.calendar_days);
      }
    } catch (err) {
      console.error("Failed to load calendar availability:", err);
    } finally {
      setLoadingCalendar(false);
    }
  }, [teacherId]);

  useEffect(() => {
    if (teacherId) {
      loadCalendar(currentYear, currentMonth);
    }
  }, [teacherId, currentYear, currentMonth, loadCalendar]);

  const handleMonthChange = (newYear, newMonth) => {
    setCurrentYear(newYear);
    setCurrentMonth(newMonth);
  };

  // Handle request submission
  const handleRequest = async () => {
    setErrorMessage("");
    setSuccessMessage("");

    if (parseInt(teacherId, 10) === parseInt(user?.user_id, 10)) {
      setErrorMessage("You cannot request a session with yourself. Please choose another teacher.");
      return;
    }

    if (!selectedDate) {
      setErrorMessage("Please select a date on the calendar.");
      return;
    }

    const dayInfo = calendarDays[selectedDate];
    if (dayInfo?.is_blackout) {
      setErrorMessage("Teacher is not available on this date. Please choose another date.");
      return;
    }

    if (dayInfo?.slots?.length > 0 && !selectedTime) {
      setErrorMessage("Please select an available time slot for your chosen date.");
      return;
    }

    const duration = parseFloat(durationHours);
    if (isNaN(duration) || duration <= 0) {
      setErrorMessage("Please enter a valid session duration in hours.");
      return;
    }

    // Accurate credit balance check
    const userCredits = parseFloat(user?.credit_balance ?? user?.credits ?? 0);
    if (userCredits < duration) {
      setErrorMessage(
        `Insufficient credits (${userCredits.toFixed(1)} available, ${duration.toFixed(1)} required). Complete sessions as a teacher to earn credits!`
      );
      return;
    }

    if (!selectedSkill) {
      setErrorMessage("Please specify the skill you want to learn.");
      return;
    }

    if (!selectedDate) {
      setErrorMessage("Please select an available date on the calendar.");
      return;
    }

    if (!selectedTime) {
      setErrorMessage("Please select an available time slot for the selected date.");
      return;
    }

    try {
      setSubmitting(true);

      // Find skill ID from taxonomy
      const taxonomy = await skillApi.getTaxonomy();
      let matchedSkill = taxonomy.find(
        (s) => s.name.toLowerCase().trim() === selectedSkill.toLowerCase().trim()
      );

      // If not in taxonomy, create or find first taxonomy item as fallback
      if (!matchedSkill) {
        if (taxonomy.length > 0) {
          matchedSkill = taxonomy[0];
        } else {
          setErrorMessage(`Skill "${selectedSkill}" was not found in system skills taxonomy.`);
          setSubmitting(false);
          return;
        }
      }

      await sessionApi.createSession(
        teacherId,
        matchedSkill.skill_id,
        duration,
        selectedDate,
        selectedTime || null
      );
      await refreshUser();
      await loadCalendar(currentYear, currentMonth);

      setSuccessMessage("Session requested successfully! Check 'Requests' to monitor acceptance.");
      setTimeout(() => {
        navigate("/requests");
      }, 1500);
    } catch (err) {
      setErrorMessage(err.message || "Failed to schedule session. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // If no teacher selected, render helpful empty state
  if (!teacherId) {
    return (
      <div className="min-h-screen bg-[#06194F] text-white flex flex-col justify-center items-center px-4">
        <div className="bg-[#0F2154] border border-[#2D458B] rounded-2xl p-8 max-w-[500px] text-center shadow-2xl space-y-4">
          <CalendarDays size={48} className="mx-auto text-blue-400" />
          <h2 className="text-2xl font-bold">Schedule a Session</h2>
          <p className="text-sm text-[#9DAACB]">
            To schedule a session, please first select a teacher from the Find Teachers page.
          </p>
          <button
            onClick={() => navigate("/discover")}
            className="w-full bg-[#2864E8] hover:bg-[#1D55CC] text-white py-3 rounded-xl font-semibold transition"
          >
            Find Teachers & Skills
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#06194F] text-white pb-12">
      <div className="max-w-[850px] mx-auto px-5 md:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[#9DAACB] hover:text-white text-sm mb-6 transition"
        >
          <ArrowLeft size={17} />
          Back
        </button>

        {/* Header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold">Schedule a Session</h1>
            <p className="text-[#9DAACB] text-sm mt-1">
              Pick a date, align available slots, and request your 1-on-1 swap.
            </p>
          </div>
          <button
            onClick={() => navigate(`/messages?user=${teacherId}`)}
            className="self-start md:self-auto bg-[#1A2E68] hover:bg-[#253D84] text-white border border-[#2D458B] px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition shadow-sm"
          >
            <MessageSquare size={16} className="text-blue-400" /> Message Teacher
          </button>
        </div>

        {/* Status Alerts */}
        {errorMessage && (
          <div className="mb-5 bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
            <AlertCircle size={18} />
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="mb-5 bg-emerald-500/20 border border-emerald-500/50 text-emerald-200 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
            <CheckCircle size={18} />
            {successMessage}
          </div>
        )}

        {/* Teacher & Credit Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="md:col-span-2 bg-[#0F2154] border border-[#2D458B] rounded-2xl p-5 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-xl font-bold shrink-0 shadow-md">
              {teacherName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <UserRound size={15} className="text-blue-400 shrink-0" />
                <h2 className="font-bold text-lg truncate">{teacherName}</h2>
              </div>
              {teacherEmail && <p className="text-xs text-[#8EA1D0] truncate mt-0.5">{teacherEmail}</p>}
              <div className="mt-2 flex items-center gap-2 text-xs">
                <span className="text-[#8EA1D0]">Skill:</span>
                <span className="bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-md font-semibold">
                  {selectedSkill || "Any Offered"}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-[#0F2154] border border-[#2D458B] rounded-2xl p-5 flex flex-col justify-between">
            <div>
              <span className="text-xs text-[#8EA1D0] uppercase font-semibold">Your Balance</span>
              <div className="flex items-center gap-2 text-amber-300 font-bold text-2xl mt-1">
                <Coins size={22} className="text-amber-400" />
                {parseFloat(user?.credit_balance ?? user?.credits ?? 0).toFixed(1)}
              </div>
            </div>
            <p className="text-[11px] text-[#8EA1D0] mt-2">
              Credits transfer automatically upon session completion.
            </p>
          </div>
        </div>

        {/* Booking Form */}
        <div className="bg-[#0F2154] border border-[#2D458B] rounded-2xl p-6 space-y-6">
          {/* Skill Selector */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-[#D9DEFA]">
              Skill to Learn
            </label>
            {teacherOffers.length > 0 ? (
              <select
                value={selectedSkill}
                onChange={(e) => setSelectedSkill(e.target.value)}
                className="w-full bg-[#1A2E68] border border-[#2D458B] rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#2864E8]"
              >
                {teacherOffers.map((s, idx) => {
                  const sName = typeof s === 'string' ? s : s.name;
                  return (
                    <option key={idx} value={sName} className="bg-[#0F2154]">
                      {sName}
                    </option>
                  );
                })}
              </select>
            ) : (
              <input
                type="text"
                value={selectedSkill}
                onChange={(e) => setSelectedSkill(e.target.value)}
                placeholder="e.g. React JS, Python, UI Design"
                className="w-full bg-[#1A2E68] border border-[#2D458B] rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#2864E8]"
              />
            )}
          </div>

          {/* Calendar-Wise Availability & Time Slot Picker */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-[#D9DEFA]">
              Select Date & Available Time Slot
            </label>
            <CalendarAvailabilityPicker
              calendarDays={calendarDays}
              currentYear={currentYear}
              currentMonth={currentMonth}
              onMonthChange={handleMonthChange}
              selectedDate={selectedDate}
              onSelectDate={(date) => {
                setSelectedDate(date);
                setSelectedTime("");
              }}
              selectedTime={selectedTime}
              onSelectTime={(time) => setSelectedTime(time)}
              loading={loadingCalendar}
            />
          </div>

          {/* Duration Selector */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-[#D9DEFA]">
              Session Duration (Hours)
            </label>
            <div className="flex items-center gap-3">
              {["0.50", "1.00", "1.50", "2.00"].map((hrs) => (
                <button
                  type="button"
                  key={hrs}
                  onClick={() => setDurationHours(hrs)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold border transition ${
                    durationHours === hrs
                      ? "bg-[#2864E8] border-[#2864E8] text-white"
                      : "bg-[#1A2E68] border-[#2D458B] text-[#D9DEFA] hover:bg-[#253D84]"
                  }`}
                >
                  {parseFloat(hrs)} hr{parseFloat(hrs) > 1 ? "s" : ""}
                </button>
              ))}
            </div>
          </div>

          {/* Summary Box */}
          <div className="bg-[#142654] border border-[#2D458B] rounded-xl p-4 flex items-center justify-between">
            <div className="text-xs text-[#8EA1D0]">
              <span>Credit Cost:</span>
              <span className="text-white font-bold ml-1">
                {parseFloat(durationHours || 0).toFixed(1)} Credits
              </span>
              {selectedDate && (
                <div className="text-emerald-300 mt-0.5">
                  {selectedDate} {selectedTime ? `• ${selectedTime}` : ""}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleRequest}
              disabled={submitting || !selectedDate}
              className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition shadow-md ${
                submitting || !selectedDate
                  ? "bg-gray-600 text-gray-300 cursor-not-allowed"
                  : "bg-[#2864E8] hover:bg-[#1D55CC] text-white"
              }`}
            >
              {submitting ? "Submitting..." : "Confirm & Send Request"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Schedule;
