import {
  Ban,
  GraduationCap,
  Award,
  Clock,
  ShieldCheck,
} from "lucide-react";

const reasons = [
  {
    icon: Ban,
    title: "No money required",
    desc: "Every exchange runs on time credits, not cash — accessible to every student.",
  },
  {
    icon: GraduationCap,
    title: "Learn from real students",
    desc: "Get taught by peers who recently learned the same skill you're after.",
  },
  {
    icon: Award,
    title: "Build your reputation",
    desc: "Earn ratings and badges as you teach, growing a trusted profile over time.",
  },
  {
    icon: Clock,
    title: "Earn time credits",
    desc: "Every hour you teach is banked as a credit you can spend anytime.",
  },
  {
    icon: ShieldCheck,
    title: "Safe skill exchange",
    desc: "Verified profiles, reviews, and dispute support keep every swap secure.",
  },
];

function WhySkillSwap() {
  return (
    <section className="bg-surface py-24">
      <div className="container-page">

        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-navy mb-4">
            Why SkillSwap
          </h2>

          <p className="text-gray-500 text-lg">
            Built for students who'd rather trade knowledge than spend money.
          </p>
        </div>

        {/* Reason Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {reasons.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="bg-white rounded-2xl p-6 shadow-soft hover:shadow-card transition-shadow duration-200"
              >
                {/* Icon */}
                <div className="w-11 h-11 rounded-xl bg-brand-purple/10 flex items-center justify-center mb-4">
                  <Icon
                    className="text-brand-purple"
                    size={20}
                  />
                </div>

                {/* Title */}
                <h3 className="font-bold text-navy mb-2 text-sm">
                  {item.title}
                </h3>

                {/* Description */}
                <p className="text-gray-500 text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

export default WhySkillSwap;