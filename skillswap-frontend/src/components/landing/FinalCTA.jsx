import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

function FinalCTA() {
  return (
    <section className="py-20 sm:py-24 bg-white">
      <div className="container-page">
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 lg:p-16 text-center relative overflow-hidden">
          
          {/* Background subtle glow */}
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-300 bg-white/10 px-3 py-1 rounded-full inline-block mb-4">
              Start Today
            </span>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4 leading-tight">
              Ready to trade skills and learn something new?
            </h2>

            <p className="text-sm sm:text-base text-slate-300 mb-8 leading-relaxed">
              Join students across campus exchanging knowledge 1-on-1.
              No costly tutoring subscriptions, just fair peer-to-peer trades.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
              <Link
                to="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-100 text-slate-900 font-semibold text-sm px-6 py-3.5 rounded-xl transition-all shadow-sm"
              >
                <span>Create Free Account</span>
                <ArrowRight size={16} />
              </Link>
              
              <Link
                to="/discover"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 text-white border border-white/20 font-medium text-sm px-6 py-3.5 rounded-xl transition-all"
              >
                Explore Skills First
              </Link>
            </div>

            <p className="text-xs text-slate-400">
              100% free peer exchange • Powered by Time Credits
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}

export default FinalCTA;
