import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Search, CheckCircle2, ArrowLeftRight, Sparkles } from "lucide-react";

function HeroSection() {
  const navigate = useNavigate();
  const [quickQuery, setQuickQuery] = useState("");

  const handleQuickSearch = (e) => {
    e.preventDefault();
    if (quickQuery.trim()) {
      navigate(`/discover`);
    } else {
      navigate(`/discover`);
    }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-50/80 via-white to-white border-b border-slate-100/80">
      <div className="container-page py-14 sm:py-20 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          
          {/* Left Column: Messaging */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold mb-6 shadow-xs">
              <Sparkles size={13} className="text-blue-600" />
              <span>Student Peer Learning Platform</span>
              <span className="w-1 h-1 rounded-full bg-blue-300" />
              <span className="text-blue-800 font-medium">Zero Money Required</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.12] mb-6">
              Trade your skills.{" "}
              <br className="hidden sm:inline" />
              <span className="text-blue-600">Keep your cash.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed mb-8">
              SkillSwap lets students exchange knowledge directly. Teach an hour of Python,
              earn one Time Credit, and spend it learning French conversation, guitar, or calculus tutoring.
            </p>

            {/* Quick Skill Search */}
            <form
              onSubmit={handleQuickSearch}
              className="w-full max-w-md bg-white border border-slate-200/90 rounded-2xl p-1.5 shadow-sm flex items-center mb-6 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all"
            >
              <div className="pl-3 text-slate-400">
                <Search size={18} />
              </div>
              <input
                type="text"
                value={quickQuery}
                onChange={(e) => setQuickQuery(e.target.value)}
                placeholder="Try 'Python', 'Guitar', 'Spanish'..."
                className="w-full bg-transparent px-3 py-2 text-sm text-slate-800 placeholder-slate-400 outline-none"
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors shrink-0"
              >
                Search
              </button>
            </form>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 mb-8">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm px-5 py-3 rounded-xl shadow-sm transition-all"
              >
                <span>Get Started Free</span>
                <ArrowRight size={16} />
              </Link>
              
              <Link
                to="/discover"
                className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-medium text-sm px-5 py-3 rounded-xl transition-all"
              >
                Browse All Skills
              </Link>
            </div>

            {/* Micro Trust Points */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-emerald-600" />
                1 hour taught = 1 credit earned
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-emerald-600" />
                Verified student ratings
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-emerald-600" />
                Zero monetary fees
              </span>
            </div>

          </div>

          {/* Right Column: Visual Minimalist Swap Showcase */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-md bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-lg shadow-slate-100 relative">
              
              {/* Card Header */}
              <div className="flex items-center justify-between pb-5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Live Swap Example
                  </span>
                </div>
                <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                  1-for-1 Trade
                </span>
              </div>

              {/* Swap Flow Details */}
              <div className="py-6 space-y-4">
                
                {/* Person A */}
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center shrink-0">
                      A
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 leading-tight">Aisha K.</h4>
                      <p className="text-xs text-slate-500">Computer Science • Year 2</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-block text-xs font-semibold text-blue-700 bg-blue-100/60 px-2 py-0.5 rounded-md">
                      Teaches Python
                    </span>
                    <p className="text-[11px] text-slate-400 mt-0.5">1 hr = +1 credit</p>
                  </div>
                </div>

                {/* Swap Icon Divider */}
                <div className="flex items-center justify-center relative my-1">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-dashed border-slate-200" />
                  </div>
                  <div className="relative w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-blue-600 shadow-xs">
                    <ArrowLeftRight size={15} />
                  </div>
                </div>

                {/* Person B */}
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold text-sm flex items-center justify-center shrink-0">
                      M
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 leading-tight">Marco S.</h4>
                      <p className="text-xs text-slate-500">Fine Arts • Year 3</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-block text-xs font-semibold text-indigo-700 bg-indigo-100/60 px-2 py-0.5 rounded-md">
                      Teaches Guitar
                    </span>
                    <p className="text-[11px] text-slate-400 mt-0.5">1 hr = -1 credit</p>
                  </div>
                </div>

              </div>

              {/* Card Footer Metric */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1 font-medium text-slate-700">
                  ★ 4.9 Average Session Rating
                </span>
                <span className="font-semibold text-emerald-600">
                  98% Reliability
                </span>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

export default HeroSection;