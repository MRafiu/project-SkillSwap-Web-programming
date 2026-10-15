import { useState, useEffect } from "react";
import {
  Users,
  ArrowLeftRight,
  Star,
  Clock,
  TrendingUp,
  Activity,
  Loader2,
  CheckCircle2,
  Coins
} from "lucide-react";
import { adminApi } from "../../api/apiClient";

function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await adminApi.getAnalytics();
        setData(res);
      } catch (err) {
        console.error("Failed to load analytics:", err);
        setError(err.message || "Failed to load platform analytics");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const stats = [
    {
      title: "Total Registered Users",
      value: data ? data.total_users : "...",
      change: "Active Community",
      icon: Users,
      color: "text-blue-400"
    },
    {
      title: "Total Trades Initiated",
      value: data ? data.total_exchanges : "...",
      change: `${data?.completed_exchanges || 0} completed`,
      icon: ArrowLeftRight,
      color: "text-amber-400"
    },
    {
      title: "Average Teaching Rating",
      value: data ? `${data.average_rating} ★` : "...",
      change: `${data?.total_reviews || 0} reviews`,
      icon: Star,
      color: "text-yellow-400"
    },
    {
      title: "Circulating Time Credits",
      value: data ? `${data.circulating_credits} hrs` : "...",
      change: "Community Currency",
      icon: Coins,
      color: "text-indigo-400"
    },
  ];

  return (
    <div className="min-h-screen bg-[#06194F] text-white px-8 py-7">
      {/* Header */}
      <div className="flex items-start justify-between mb-7">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Activity size={24} className="text-blue-400" />
            Platform Ecosystem Analytics
          </h1>
          <p className="text-blue-100 text-xs mt-1">
            Real-time metric telemetry on peer engagement, popular subjects, and session fulfillment
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/20 border border-rose-500/30 rounded-xl text-rose-200 text-xs mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-blue-200">
          <Loader2 size={32} className="animate-spin mb-3 text-blue-400" />
          <p className="text-sm">Loading analytics telemetry...</p>
        </div>
      ) : (
        <>
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            {stats.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="bg-[#1A2E68] border border-[#2D458B] rounded-xl p-5 shadow-lg"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] text-[#8EA1D0] font-semibold uppercase tracking-wider">
                      {item.title}
                    </span>
                    <div className={`p-2 rounded-lg bg-[#0E1E45] ${item.color}`}>
                      <Icon size={18} />
                    </div>
                  </div>

                  <h2 className="text-2xl font-extrabold text-white mb-1">
                    {item.value}
                  </h2>

                  <span className="text-[10px] text-blue-300 font-medium">
                    {item.change}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Detailed Analytics Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Top In-Demand Skills */}
            <div className="bg-[#1A2E68] border border-[#2D458B] rounded-xl p-6 shadow-lg">
              <h2 className="text-sm font-bold uppercase tracking-wider text-blue-200 mb-4 flex items-center gap-2">
                <TrendingUp size={16} className="text-emerald-400" />
                Most Popular Skills in Taxonomy
              </h2>

              {(!data?.popular_skills || data.popular_skills.length === 0) ? (
                <div className="py-8 text-center text-[#8EA1D0] text-xs">
                  No skills distribution data yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {data.popular_skills.map((skill, index) => {
                    const maxCount = Math.max(...data.popular_skills.map(s => s.users_count), 1);
                    const percent = Math.round((skill.users_count / maxCount) * 100);
                    return (
                      <div key={index}>
                        <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
                          <span className="text-white">{skill.name}</span>
                          <span className="text-blue-300 font-bold">{skill.users_count} participants</span>
                        </div>
                        <div className="w-full bg-[#0E1E45] h-2.5 rounded-full overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Trade Status Breakdown */}
            <div className="bg-[#1A2E68] border border-[#2D458B] rounded-xl p-6 shadow-lg">
              <h2 className="text-sm font-bold uppercase tracking-wider text-blue-200 mb-4 flex items-center gap-2">
                <ArrowLeftRight size={16} className="text-amber-400" />
                Trade Fulfillment Status Breakdown
              </h2>

              {(!data?.status_breakdown || data.status_breakdown.length === 0) ? (
                <div className="py-8 text-center text-[#8EA1D0] text-xs">
                  No session statuses recorded yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {data.status_breakdown.map((item, index) => {
                    const total = data.total_exchanges || 1;
                    const percent = Math.round((item.count / total) * 100);
                    return (
                      <div key={index} className="bg-[#0E1E45] p-3 rounded-xl border border-[#2D458B]/40">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-bold text-white capitalize">{item.status}</span>
                          <span className="text-blue-200 font-semibold">{item.count} sessions ({percent}%)</span>
                        </div>
                        <div className="w-full bg-[#1A2E68] h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              item.status === 'completed'
                                ? 'bg-emerald-500'
                                : item.status === 'accepted'
                                ? 'bg-blue-500'
                                : item.status === 'pending'
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                            }`}
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Analytics;
