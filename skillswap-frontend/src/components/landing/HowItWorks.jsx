import { UserCheck, CalendarCheck, Repeat } from "lucide-react";

const steps = [
  {
    step: "01",
    icon: UserCheck,
    title: "List your skills",
    desc: "Create your free profile. Add subjects you can teach and skills you're eager to learn.",
  },
  {
    step: "02",
    icon: CalendarCheck,
    title: "Connect & schedule",
    desc: "Browse student teachers, message them directly, and book a convenient 1-on-1 session.",
  },
  {
    step: "03",
    icon: Repeat,
    title: "Trade 1-for-1",
    desc: "Teach 1 hour to earn 1 Time Credit. Use your credits anytime to learn any other skill on campus.",
  },
];

function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 sm:py-24 border-b border-slate-100 bg-white">
      <div className="container-page">
        
        {/* Section Header */}
        <div className="max-w-2xl mx-auto text-center mb-14 sm:mb-16">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full inline-block mb-3">
            Frictionless Process
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 mb-4">
            How SkillSwap Works
          </h2>
          <p className="text-base text-slate-600 leading-relaxed">
            Three simple steps to trade knowledge with classmates without exchanging a single penny.
          </p>
        </div>

        {/* 3 Step Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {steps.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="bg-white border border-slate-200/80 rounded-2xl p-7 sm:p-8 hover:border-slate-300 hover:shadow-sm transition-all relative flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                      <Icon size={20} strokeWidth={2} />
                    </div>
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
                      Step {item.step}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    {item.title}
                  </h3>

                  <p className="text-sm text-slate-600 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

export default HowItWorks;