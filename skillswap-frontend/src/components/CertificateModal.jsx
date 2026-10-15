import React, { useState } from 'react';
import { Award, X, Printer, Copy, Check, ShieldCheck } from 'lucide-react';

export default function CertificateModal({ certificate, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!certificate) return null;

  const handleCopyId = () => {
    navigator.clipboard.writeText(certificate.certificate_uuid);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 print:p-0 print:bg-white print:static print:inset-auto">
      
      {/* Container Card */}
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 print:border-none print:shadow-none print:w-full print:max-w-none print:bg-white">
        
        {/* Top Control Bar (Hidden when printing) */}
        <div className="px-6 py-4 bg-[#0B1739] border-b border-slate-800 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Award className="text-amber-400" size={22} />
            <h2 className="text-lg font-bold text-white">SkillSwap Verified Credential</h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold text-xs rounded-xl shadow transition"
              title="Download or print high-resolution PDF"
            >
              <Printer size={15} />
              <span>Download PDF / Print</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Certificate Display Frame */}
        <div className="p-4 sm:p-8 bg-slate-950 flex justify-center print:p-0 print:bg-white">
          <div
            id="skillswap-certificate"
            className="w-full max-w-[850px] bg-gradient-to-br from-[#FFFDF8] via-[#FFFFFF] to-[#FFF9ED] p-6 sm:p-10 rounded-2xl border-8 border-double border-amber-600/40 shadow-2xl text-slate-800 font-serif relative overflow-hidden print:p-8 print:border-4 print:border-amber-600 print:shadow-none print:w-full"
          >
            {/* Watermark Emblem Background */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.035] pointer-events-none print:opacity-[0.05]">
              <Award size={480} />
            </div>

            {/* Inner Gold Border Accent */}
            <div className="border border-amber-400/30 p-6 sm:p-8 rounded-xl relative z-10 print:border-amber-300">
              
              {/* Header Section */}
              <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-[10px] sm:text-xs font-sans font-bold tracking-widest uppercase shadow-sm">
                  ★ SkillSwap Learning Network ★
                </div>
                
                <h1 className="text-2xl sm:text-4xl font-extrabold text-[#06194F] tracking-wide uppercase font-serif mt-4">
                  Certificate of Completion
                </h1>
                
                <p className="text-[11px] sm:text-xs text-slate-500 font-sans tracking-widest uppercase">
                  Peer-to-Peer Skill Exchange & Practical Mastery
                </p>
              </div>

              {/* Recipient Section */}
              <div className="text-center my-6 sm:my-8">
                <p className="text-xs text-slate-500 font-sans italic mb-2">This is proudly awarded to</p>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#06194F] border-b-2 border-amber-500/50 inline-block px-8 pb-1 tracking-normal font-serif">
                  {certificate.student_name}
                </div>
                <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto mt-4 font-sans leading-relaxed">
                  for successfully completing all practical coursework, interactive collaborative sessions, and verified peer mentorship in:
                </p>
              </div>

              {/* Skill Title Highlight */}
              <div className="text-center my-5">
                <span className="text-xl sm:text-2xl font-black text-amber-800 bg-amber-100/70 px-6 py-2.5 rounded-xl border border-amber-300 inline-block shadow-sm">
                  ✦ {certificate.skill_name} ✦
                </span>
                <p className="text-xs text-slate-500 font-sans mt-2">
                  {parseFloat(certificate.duration_hours).toFixed(1)} Hours of Verified Hands-on Peer Instruction
                </p>
              </div>

              {/* Signatures & Verification Seal */}
              <div className="mt-8 sm:mt-12 pt-6 border-t border-slate-200 grid grid-cols-3 items-end text-center font-sans">
                
                {/* Instructor Signature */}
                <div className="space-y-1">
                  <div className="font-serif italic text-base sm:text-lg text-slate-900 font-bold border-b border-slate-400 pb-1 mx-2 sm:mx-4">
                    {certificate.teacher_name}
                  </div>
                  <p className="text-[11px] font-bold text-slate-700">Verified Peer Instructor</p>
                  <p className="text-[10px] text-slate-400">SkillSwap Instructor Network</p>
                </div>

                {/* Gold Official Seal */}
                <div className="flex flex-col items-center justify-center">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 border-4 border-amber-200 flex items-center justify-center shadow-lg relative">
                    <Award size={28} className="text-white" />
                  </div>
                  <span className="text-[9px] font-bold tracking-widest text-amber-800 uppercase mt-1">
                    Official Seal
                  </span>
                </div>

                {/* Academic Ledger Verification */}
                <div className="space-y-1 text-right pr-2">
                  <p className="text-[11px] font-bold text-slate-700">
                    Issued: <span className="font-normal text-slate-600">{certificate.formatted_date}</span>
                  </p>
                  <p className="text-[10px] text-slate-500">
                    ID: <code className="font-mono text-amber-700 font-semibold">{certificate.certificate_uuid}</code>
                  </p>
                  <span className="inline-block text-[9px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                    ✓ Cryptographically Verified
                  </span>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Bottom Helper Bar (Hidden when printing) */}
        <div className="px-6 py-4 bg-[#0B1739] border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 print:hidden">
          <div className="flex items-center gap-2">
            <span>Credential ID:</span>
            <code className="bg-slate-800 text-amber-400 px-2 py-1 rounded font-mono font-semibold">
              {certificate.certificate_uuid}
            </code>
            <button
              onClick={handleCopyId}
              className="p-1 hover:text-white transition flex items-center gap-1 text-[11px]"
              title="Copy Credential ID"
            >
              {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>

          <p className="text-[11px] text-slate-400">
            Tip: Click <strong>"Download PDF / Print"</strong> and select <em>"Save as PDF"</em> in your browser.
          </p>
        </div>

      </div>

      {/* Print-specific style sheet */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #skillswap-certificate, #skillswap-certificate * {
            visibility: visible;
          }
          #skillswap-certificate {
            position: fixed;
            left: 0;
            top: 0;
            width: 100vw !important;
            max-width: 100vw !important;
            margin: 0 !important;
            box-shadow: none !important;
          }
          @page {
            size: landscape;
            margin: 0.5cm;
          }
        }
      `}</style>

    </div>
  );
}
