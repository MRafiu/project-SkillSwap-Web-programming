import {
  ArrowLeft,
  Mail,
  School,
  MapPin,
  Star,
  Calendar,
  Clock3,
  BookOpen,
  Sparkles,
  Award,
  ShieldCheck,
  Compass,
  MessageSquare,
  Send,
  AlertCircle,
  GraduationCap
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { userApi, certificateApi } from "../api/apiClient";
import CertificateModal from "../components/CertificateModal";
import { useAuth } from "../context/AuthContext";

function PublicProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [profileData, setProfileData] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPublicProfile = async () => {
      try {
        setLoading(true);
        setError("");
        const [res, certs] = await Promise.all([
          userApi.getPublicProfile(userId),
          certificateApi.getUserCertificates(userId).catch(() => [])
        ]);
        setProfileData(res.user);
        setReviews(res.reviews || []);
        setCertificates(certs || []);
      } catch (err) {
        console.error("Failed to load public profile:", err);
        setError(err.message || "Failed to load user profile");
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchPublicProfile();
    }
  }, [userId]);

  const isSelf = currentUser && parseInt(currentUser.user_id, 10) === parseInt(userId, 10);

  const getBadgeIcon = (iconName) => {
    switch (iconName) {
      case "Sparkles": return <Sparkles size={16} className="text-amber-400" />;
      case "Award": return <Award size={16} className="text-indigo-400" />;
      case "Star": return <Star size={16} className="text-amber-400 fill-amber-400" />;
      case "BookOpen": return <BookOpen size={16} className="text-blue-400" />;
      case "ShieldCheck": return <ShieldCheck size={16} className="text-emerald-400" />;
      case "Compass": return <Compass size={16} className="text-purple-400" />;
      default: return <Sparkles size={16} className="text-amber-400" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#06194F] text-white flex items-center justify-center">
        <div className="text-[#9DAACB]">Loading public profile...</div>
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="min-h-screen bg-[#06194F] text-white flex flex-col items-center justify-center px-4">
        <div className="bg-[#0F2154] border border-[#2D458B] rounded-2xl p-8 max-w-[460px] text-center space-y-4 shadow-2xl">
          <AlertCircle size={44} className="mx-auto text-rose-400" />
          <h2 className="text-2xl font-bold">Profile Not Found</h2>
          <p className="text-sm text-[#9DAACB]">
            The requested member profile could not be found or has been removed.
          </p>
          <button
            onClick={() => navigate("/discover")}
            className="w-full bg-[#2864E8] hover:bg-[#1D55CC] text-white py-3 rounded-xl font-semibold transition"
          >
            Explore Teachers & Skills
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#06194F] text-white pb-16">
      <div className="max-w-[1000px] mx-auto px-5 md:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[#9DAACB] hover:text-white text-sm mb-6 transition"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        {/* HERO / PROFILE HEADER */}
        <div className="bg-[#0F2154] border border-[#2D458B] rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-xl mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-3xl md:text-4xl font-extrabold shadow-lg shrink-0">
                {profileData.full_name?.charAt(0).toUpperCase() || "U"}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl md:text-3xl font-extrabold text-white">
                    {profileData.full_name}
                  </h1>
                  {profileData.average_rating ? (
                    <span className="flex items-center gap-1 bg-amber-500/20 text-amber-300 text-xs px-2.5 py-1 rounded-lg font-bold border border-amber-500/30">
                      <Star size={13} className="fill-amber-300 text-amber-300" />
                      {profileData.average_rating} ({profileData.total_reviews} reviews)
                    </span>
                  ) : (
                    <span className="text-xs text-[#8EA1D0] bg-[#1A2E68] px-2.5 py-1 rounded-lg font-medium">
                      New Member
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2 text-xs text-[#8EA1D0]">
                  {profileData.institution && (
                    <span className="flex items-center gap-1">
                      <School size={13} className="text-blue-400" /> {profileData.institution}
                    </span>
                  )}
                  {profileData.location && (
                    <span className="flex items-center gap-1">
                      <MapPin size={13} className="text-rose-400" /> {profileData.location}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar size={13} className="text-emerald-400" /> Joined {new Date(profileData.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                  </span>
                  <span className={`flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-lg border ${
                    parseFloat(profileData.reliability_score ?? 100) >= 90
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                      : parseFloat(profileData.reliability_score ?? 100) >= 60
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                      : "bg-rose-500/20 text-rose-300 border-rose-500/30"
                  }`}>
                    <ShieldCheck size={12} />
                    {parseFloat(profileData.reliability_score ?? 100).toFixed(0)}% Reliability
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {!isSelf && (
              <div className="flex items-center gap-2.5 w-full md:w-auto">
                <button
                  onClick={() => navigate(`/messages?user=${profileData.user_id}`)}
                  className="flex-1 md:flex-initial bg-[#1A2E68] hover:bg-[#253D84] text-white border border-[#2D458B] px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 transition shadow-sm"
                >
                  <MessageSquare size={16} className="text-blue-400" /> Message
                </button>
                <button
                  onClick={() => navigate("/schedule", { state: { teacher: profileData } })}
                  className="flex-1 md:flex-initial bg-[#2864E8] hover:bg-[#1D55CC] text-white px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 transition shadow-sm"
                >
                  <Send size={16} /> Request Session
                </button>
              </div>
            )}
            {isSelf && (
              <button
                onClick={() => navigate("/edit-profile")}
                className="bg-[#1A2E68] hover:bg-[#253D84] text-white border border-[#2D458B] px-5 py-2.5 rounded-xl text-sm font-semibold transition"
              >
                Edit My Profile
              </button>
            )}
          </div>

          {/* Bio */}
          {profileData.bio && (
            <div className="mt-6 pt-5 border-t border-[#2D458B]/50">
              <p className="text-sm text-[#D9DEFA] leading-relaxed">
                {profileData.bio}
              </p>
            </div>
          )}
        </div>

        {/* MILESTONE BADGES SHOWCASE */}
        <section className="bg-[#0F2154] border border-[#2D458B] rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Award className="text-amber-400" size={20} />
              Achievements & Milestone Badges
            </h2>
            <span className="text-xs text-[#8EA1D0]">
              {profileData.badges?.filter(b => b.unlocked).length || 0} of {profileData.badges?.length || 5} Unlocked
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {profileData.badges?.map((b) => (
              <div
                key={b.id}
                className={`p-4 rounded-xl border transition flex items-start gap-3 ${
                  b.unlocked
                    ? "bg-[#1A2E68] border-[#2D458B]"
                    : "bg-[#0A1A40]/60 border-[#1C2C5E]/50 opacity-50"
                }`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  b.unlocked ? "bg-amber-500/20" : "bg-gray-700/20"
                }`}>
                  {getBadgeIcon(b.icon)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-bold text-white truncate">{b.title}</h3>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded uppercase font-bold ${
                      b.tier === 'gold' ? 'text-amber-300 bg-amber-500/20' : b.tier === 'silver' ? 'text-blue-300 bg-blue-500/20' : 'text-orange-300 bg-orange-500/20'
                    }`}>
                      {b.tier}
                    </span>
                  </div>
                  <p className="text-xs text-[#8EA1D0] mt-0.5 leading-snug">{b.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* EARNED CERTIFICATIONS */}
        {certificates.length > 0 && (
          <section className="bg-[#0F2154] border border-[#2D458B] rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <GraduationCap className="text-amber-400" size={20} />
                <h2 className="text-lg font-bold">Earned Course Certifications</h2>
              </div>
              <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full font-bold">
                {certificates.length} Verified
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {certificates.map((cert) => (
                <div
                  key={cert.certificate_id}
                  className="bg-[#1A2E68] border border-[#2D458B] rounded-xl p-4 flex items-center justify-between hover:border-amber-400/50 transition cursor-pointer"
                  onClick={() => setSelectedCertificate(cert)}
                >
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                      <Award size={15} className="text-amber-400" />
                      {cert.skill_name}
                    </h3>
                    <p className="text-[11px] text-[#8EA1D0] mt-1">
                      Instructor: <span className="text-white">{cert.teacher_name}</span> • {cert.duration_hours} hrs
                    </p>
                    <p className="text-[10px] text-[#8EA1D0] font-mono mt-0.5">{cert.formatted_date}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedCertificate(cert);
                    }}
                    className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-lg transition"
                  >
                    View
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* SKILLS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Skills Offered */}
          <div className="bg-[#0F2154] border border-[#2D458B] rounded-2xl p-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <BookOpen className="text-blue-400" size={18} />
              Skills Offered (Teaches)
            </h2>
            {profileData.offers?.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profileData.offers.map((s, idx) => (
                  <span key={idx} className="bg-blue-500/20 text-blue-300 px-3 py-1.5 rounded-xl text-xs font-semibold border border-blue-500/30">
                    {s}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#8EA1D0] italic">No teaching skills listed yet.</p>
            )}
          </div>

          {/* Skills Wanted */}
          <div className="bg-[#0F2154] border border-[#2D458B] rounded-2xl p-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Sparkles className="text-purple-400" size={18} />
              Skills Wanted (Learning Wishlist)
            </h2>
            {profileData.wants?.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profileData.wants.map((s, idx) => (
                  <span key={idx} className="bg-purple-500/20 text-purple-300 px-3 py-1.5 rounded-xl text-xs font-semibold border border-purple-500/30">
                    {s}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#8EA1D0] italic">No learning wishlist items added yet.</p>
            )}
          </div>
        </div>

        {/* WEEKLY AVAILABILITY */}
        <section className="bg-[#0F2154] border border-[#2D458B] rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Clock3 className="text-emerald-400" size={18} />
              Weekly Teaching Availability
            </h2>
            {parseInt(userId, 10) !== parseInt(currentUser?.user_id, 10) && (
              <button
                onClick={() => navigate(`/schedule?teacher_id=${profileData.user_id}`, { state: { teacher: profileData } })}
                className="bg-[#2864E8] hover:bg-[#1D55CC] text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow"
              >
                <Calendar size={14} /> Open Booking Calendar
              </button>
            )}
          </div>

          {profileData.availability_slots?.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {profileData.availability_slots.map((slot) => (
                <div key={slot.availability_id} className="bg-[#1A2E68] border border-[#2D458B] rounded-xl p-3 flex items-center justify-between">
                  <div className="text-xs">
                    <span className="font-bold text-white block">{slot.day_of_week}</span>
                    <span className="text-[#8EA1D0]">{slot.time_slot}</span>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#8EA1D0] italic">
              Flexible / Coordinates session scheduling directly via chat.
            </p>
          )}
        </section>

        {/* REVIEWS & RATINGS */}
        <section className="bg-[#0F2154] border border-[#2D458B] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Star className="text-amber-400 fill-amber-400" size={18} />
              Student Reviews & Feedback
            </h2>
            {profileData.average_rating && (
              <span className="text-xs text-amber-300 font-bold">
                Average {profileData.average_rating} / 5.0
              </span>
            )}
          </div>

          {reviews.length === 0 ? (
            <p className="text-xs text-[#8EA1D0] italic py-4 text-center">
              No reviews received yet. Be the first to trade and leave feedback!
            </p>
          ) : (
            <div className="space-y-3">
              {reviews.map((rev) => (
                <div key={rev.review_id} className="bg-[#1A2E68] border border-[#2D458B] rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-white">{rev.reviewer_name}</span>
                      <span className="text-xs text-[#8EA1D0]">for {rev.skill_name}</span>
                    </div>
                    <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                      <Star size={13} className="fill-amber-400" />
                      {rev.rating}.0
                    </div>
                  </div>
                  {rev.comment && (
                    <p className="text-xs text-[#D9DEFA] leading-relaxed">
                      "{rev.comment}"
                    </p>
                  )}
                  <p className="text-[10px] text-[#8EA1D0] mt-2">
                    {new Date(rev.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

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

export default PublicProfile;
