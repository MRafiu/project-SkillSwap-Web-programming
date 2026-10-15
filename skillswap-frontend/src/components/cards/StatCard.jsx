function StatCard({ icon: Icon, value, label }) {
  return (
    <div className="bg-white rounded-2xl shadow-card p-6 flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl bg-brand-blue/10 flex items-center justify-center flex-shrink-0">
        <Icon className="text-brand-blue" size={24} />
      </div>

      <div>
        <p className="text-2xl font-bold text-navy">
          {value}
        </p>

        <p className="text-sm text-gray-500">
          {label}
        </p>
      </div>
    </div>
  );
}

export default StatCard;