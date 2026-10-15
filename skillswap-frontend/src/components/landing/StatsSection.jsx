import { Users, TrendingUp, Clock, Star } from "lucide-react";
import StatCard from "../cards/StatCard.jsx";

const stats = [
  {
    icon: Users,
    value: "3,200+",
    label: "Active Students",
  },
  {
    icon: TrendingUp,
    value: "8,500+",
    label: "Skills Exchanged",
  },
  {
    icon: Clock,
    value: "15,000+",
    label: "Time Credits Traded",
  },
  {
    icon: Star,
    value: "4.8/5",
    label: "Average Session Rating",
  },
];

function StatsSection() {
  return (
    <section className="bg-navy py-20">
      <div className="container-page">

        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
            SkillSwap by the Numbers
          </h2>

          <p className="text-gray-300 text-lg">
            A growing community of students learning without spending money.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <StatCard
              key={stat.label}
              icon={stat.icon}
              value={stat.value}
              label={stat.label}
            />
          ))}
        </div>

      </div>
    </section>
  );
}

export default StatsSection;