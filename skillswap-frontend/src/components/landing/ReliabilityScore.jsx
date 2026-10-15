import { ShieldCheck, Star, Clock, CheckCircle } from "lucide-react";

function ReliabilityScore() {
  return (
    <section id="trust" className="py-20 sm:py-24 border-b border-slate-100 bg-white">
      <div className="container-page">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Description */}
          <div className="lg:col-span-7">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full inline-block mb-3">
              Trust & Safety
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 mb-4">
              Fair trades backed by community reliability
            </h2>
            <p className="text-base text-slate-600 leading-relaxed mb-8">
              Trading skills requires confidence. SkillSwap’s automated reputation system ensures
              members show up on time, teach earnestly, and respect each other’s schedule.
            </p>

            <div className="space-y-6">
              
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Clock size={19} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-1">
                    Automated Reliability Tracking
                  </h4>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    Reliability scores reflect attendance and punctuality. If someone ghosts or misses a session, their score drops automatically.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Star size={19} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-1">
                    Verified Peer Reviews
                  </h4>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    Reviews can only be left by students who completed a verified 1-on-1 swap, keeping feedback honest and authentic.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck size={19} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-1">
                    Dispute Protection
                  </h4>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    If an issue arises regarding whether a trade took place, our campus dispute team reviews the logs and protects your credits.
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* Right Column: Sleek Trust Card Mockup */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-sm bg-slate-50/70 border border-slate-200/80 rounded-3xl p-7 text-center relative shadow-xs">
              
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-center text-blue-600 shadow-xs">
                <ShieldCheck size={32} />
              </div>

              <div className="mb-5">
                <span className="text-3xl font-extrabold text-slate-900">
                  98.5%
                </span>
                <p className="text-xs font-semibold text-emerald-600 mt-0.5 flex items-center justify-center gap-1">
                  <CheckCircle size={13} />
                  Top Community Reliability
                </p>
              </div>

              <div className="bg-white border border-slate-200/70 rounded-2xl p-4 text-left space-y-3 text-xs mb-5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Sessions Completed:</span>
                  <span className="font-semibold text-slate-800">42 / 42 on time</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Average Student Rating:</span>
                  <span className="font-semibold text-slate-800">4.9 / 5.0 (★)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Time Credits Banked:</span>
                  <span className="font-semibold text-blue-600">8.5 Credits</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 leading-normal">
                Reliability badges help students choose trustworthy learning partners with total peace of mind.
              </p>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

export default ReliabilityScore;