import { useState } from "react";
import { Link } from "react-router-dom";
import { Star, ArrowRight } from "lucide-react";

const categories = ["All", "Tech", "Language", "Design", "Academics", "Music"];

const featuredSkills = [
  {
    id: 1,
    name: "Python & Algorithms",
    teacher: "Aisha K.",
    teacherDept: "Computer Science",
    avatar: "A",
    rating: 4.9,
    reviews: 32,
    category: "Tech",
  },
  {
    id: 2,
    name: "Acoustic Guitar Basics",
    teacher: "Marco S.",
    teacherDept: "Music & Performing Arts",
    avatar: "M",
    rating: 4.8,
    reviews: 19,
    category: "Music",
  },
  {
    id: 3,
    name: "UI/UX & Figma Design",
    teacher: "Elena V.",
    teacherDept: "Design Media",
    avatar: "E",
    rating: 5.0,
    reviews: 41,
    category: "Design",
  },
  {
    id: 4,
    name: "Conversational Spanish",
    teacher: "Carlos R.",
    teacherDept: "Linguistics",
    avatar: "C",
    rating: 4.9,
    reviews: 27,
    category: "Language",
  },
  {
    id: 5,
    name: "Calculus & Linear Algebra",
    teacher: "David L.",
    teacherDept: "Mathematics",
    avatar: "D",
    rating: 4.9,
    reviews: 38,
    category: "Academics",
  },
  {
    id: 6,
    name: "Full-Stack Web Dev (React)",
    teacher: "Siddharth P.",
    teacherDept: "Software Engineering",
    avatar: "S",
    rating: 4.8,
    reviews: 24,
    category: "Tech",
  },
  {
    id: 7,
    name: "Digital Photography",
    teacher: "Chloe B.",
    teacherDept: "Visual Arts",
    avatar: "C",
    rating: 4.7,
    reviews: 15,
    category: "Design",
  },
  {
    id: 8,
    name: "Japanese for Beginners",
    teacher: "Kenji T.",
    teacherDept: "Asian Studies",
    avatar: "K",
    rating: 4.9,
    reviews: 22,
    category: "Language",
  },
];

function FeaturedSkills() {
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filtered =
    selectedCategory === "All"
      ? featuredSkills
      : featuredSkills.filter((s) => s.category === selectedCategory);

  return (
    <section id="skills" className="py-20 sm:py-24 border-b border-slate-100 bg-slate-50/40">
      <div className="container-page">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full inline-block mb-3">
              Campus Catalog
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 mb-2">
              Popular Skills on Campus
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Browse what fellow students are actively teaching and learning this semester.
            </p>
          </div>

          <Link
            to="/discover"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline shrink-0"
          >
            <span>Explore all skills</span>
            <ArrowRight size={15} />
          </Link>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-8 no-scrollbar">
          {categories.map((cat) => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                  active
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-white text-slate-600 border border-slate-200/80 hover:border-slate-300 hover:text-slate-900"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Skills Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filtered.map((skill) => (
            <div
              key={skill.id}
              className="bg-white border border-slate-200/80 rounded-2xl p-5 hover:border-slate-300 hover:shadow-sm transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
                    {skill.category}
                  </span>
                  <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                    1 hr = 1 credit
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-base mb-3 leading-snug">
                  {skill.name}
                </h3>

                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 rounded-full bg-slate-800 text-white text-xs font-bold flex items-center justify-center shrink-0">
                    {skill.avatar}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-800 truncate">{skill.teacher}</p>
                    <p className="text-[11px] text-slate-400 truncate">{skill.teacherDept}</p>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs font-semibold text-slate-700">
                  <Star size={13} className="text-amber-400 fill-amber-400" />
                  <span>{skill.rating}</span>
                  <span className="text-slate-400 font-normal">({skill.reviews})</span>
                </div>

                <Link
                  to="/discover"
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                >
                  View Profile
                </Link>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

export default FeaturedSkills;