import { Link } from "react-router-dom";
import { ArrowLeftRight } from "lucide-react";

function Footer() {
  return (
    <footer className="bg-slate-50 border-t border-slate-200/70 py-12 sm:py-16 text-slate-600">
      <div className="container-page">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-slate-200/60">
          
          {/* Brand Column */}
          <div className="md:col-span-6 space-y-3">
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <ArrowLeftRight size={14} strokeWidth={2.5} />
              </div>
              <span className="text-base font-bold text-slate-900 tracking-tight">
                SkillSwap
              </span>
            </Link>
            <p className="text-xs sm:text-sm text-slate-500 max-w-sm leading-relaxed">
              The student-led peer learning exchange. Trade an hour of your knowledge
              for an hour of learning without spending money.
            </p>
          </div>

          {/* Quick Links Column */}
          <div className="md:col-span-3 space-y-2.5">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Platform
            </p>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <a href="#how-it-works" className="hover:text-slate-900 transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#skills" className="hover:text-slate-900 transition-colors">
                  Popular Skills
                </a>
              </li>
              <li>
                <a href="#trust" className="hover:text-slate-900 transition-colors">
                  Trust & Reliability
                </a>
              </li>
              <li>
                <Link to="/discover" className="hover:text-slate-900 transition-colors">
                  Browse All Skills
                </Link>
              </li>
            </ul>
          </div>

          {/* Access & Admin Column */}
          <div className="md:col-span-3 space-y-2.5">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Account & Staff
            </p>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link to="/login" className="hover:text-slate-900 transition-colors">
                  Student Login
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-slate-900 transition-colors">
                  Create Account
                </Link>
              </li>
              <li>
                <Link to="/admin-login" className="text-slate-400 hover:text-slate-700 transition-colors inline-flex items-center gap-1">
                  <span>Admin Portal</span>
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© 2026 SkillSwap. Designed for student peer learning.</p>
          <p>Built with Time Credits • Zero transaction fees</p>
        </div>

      </div>
    </footer>
  );
}

export default Footer;
