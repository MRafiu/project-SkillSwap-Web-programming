import { Star } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "Sarah Chen",
    role: "Computer Science • 3rd Year",
    trade: "Taught Python ↔ Learned Acoustic Guitar",
    avatarInitial: "S",
    avatarBg: "bg-blue-600",
    rating: 5,
    quote:
      "I taught Python basics to two peers and used those credits to learn guitar from an arts major. It felt completely natural—no money involved, just genuine peer tutoring.",
  },
  {
    id: 2,
    name: "Marcus Johnson",
    role: "Product Design • 2nd Year",
    trade: "Taught Figma UI ↔ Learned Calculus",
    avatarInitial: "M",
    avatarBg: "bg-indigo-600",
    rating: 5,
    quote:
      "I was struggling with Calculus II before midterms. Found a math student who needed help preparing a design portfolio. We swapped two hours each and both aced our goals.",
  },
  {
    id: 3,
    name: "Layla Ahmed",
    role: "International Studies • 4th Year",
    trade: "Taught Arabic ↔ Learned Web Development",
    avatarInitial: "L",
    avatarBg: "bg-emerald-600",
    rating: 5,
    quote:
      "The reliability score made me feel safe booking sessions with people I had never met on campus. You know everyone is committed and respectful of your time.",
  },
];

function Testimonials() {
  return (
    <section className="py-20 sm:py-24 border-b border-slate-100 bg-slate-50/40">
      <div className="container-page">
        
        {/* Section Header */}
        <div className="max-w-2xl mx-auto text-center mb-14 sm:mb-16">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full inline-block mb-3">
            Student Stories
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 mb-3">
            Built by students, loved by campus
          </h2>
          <p className="text-base text-slate-600">
            Real peer learning trades happening across faculties every week.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="bg-white border border-slate-200/80 rounded-2xl p-7 flex flex-col justify-between hover:border-slate-300 hover:shadow-sm transition-all"
            >
              <div>
                {/* Star rating */}
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className="text-amber-400 fill-amber-400"
                    />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-sm text-slate-700 leading-relaxed mb-6">
                  "{t.quote}"
                </p>
              </div>

              <div>
                {/* Trade Badge */}
                <div className="mb-4">
                  <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md inline-block">
                    {t.trade}
                  </span>
                </div>

                {/* Author Info */}
                <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                  <div
                    className={`w-9 h-9 rounded-full ${t.avatarBg} text-white font-bold text-xs flex items-center justify-center shrink-0`}
                  >
                    {t.avatarInitial}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {t.name}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">
                      {t.role}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

export default Testimonials;