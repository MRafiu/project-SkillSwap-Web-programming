import { Star } from "lucide-react";

function SkillCard({ icon: Icon, name, teacher, rating, credits, category }) {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 hover:border-slate-300 hover:shadow-sm transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between mb-4">
          {Icon && (
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Icon size={20} />
            </div>
          )}
          <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
            {category}
          </span>
        </div>

        <h3 className="font-bold text-slate-900 text-base mb-1">
          {name}
        </h3>

        <p className="text-xs text-slate-500 mb-4">
          Taught by {teacher}
        </p>
      </div>

      <div>
        <div className="flex items-center gap-1 mb-4">
          <Star
            className="text-amber-400 fill-amber-400"
            size={14}
          />
          <span className="text-xs font-semibold text-slate-800">
            {rating}
          </span>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
            {credits} credits/hr
          </span>
        </div>
      </div>
    </div>
  );
}

export default SkillCard;