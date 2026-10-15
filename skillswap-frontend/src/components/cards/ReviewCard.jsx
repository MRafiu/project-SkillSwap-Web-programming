import { Star, Quote } from "lucide-react";

function ReviewCard({ name, role, avatarInitial, rating, review }) {
  return (
    <div className="bg-white rounded-2xl shadow-soft hover:shadow-card p-8 transition-shadow duration-200">

      <Quote className="text-brand-blue/20 mb-4" size={36} />

      <div className="flex items-center gap-1 mb-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={16}
            className={
              i < rating
                ? "text-yellow-400 fill-yellow-400"
                : "text-gray-200 fill-gray-200"
            }
          />
        ))}
      </div>

      <p className="text-gray-600 mb-6 leading-relaxed">
        "{review}"
      </p>

      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-full bg-brand-purple flex items-center justify-center text-white font-bold">
          {avatarInitial}
        </div>

        <div>
          <p className="font-semibold text-navy text-sm">{name}</p>
          <p className="text-xs text-gray-500">{role}</p>
        </div>
      </div>

    </div>
  );
}

export default ReviewCard;