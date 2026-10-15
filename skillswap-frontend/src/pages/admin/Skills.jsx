import { useState, useEffect } from "react";
import {
  Search,
  Trash2,
  Wrench,
  Plus,
  Loader2,
  X,
  CheckCircle2,
  BookOpen
} from "lucide-react";
import { adminApi } from "../../api/apiClient";

function Skills() {
  const [search, setSearch] = useState("");
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Add Skill Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSkillName, setNewSkillName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState("");

  const fetchSkills = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await adminApi.getSkills();
      setSkills(data);
    } catch (err) {
      console.error("Failed to load skills:", err);
      setError(err.message || "Failed to load skills taxonomy");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  const handleCreateSkill = async (e) => {
    e.preventDefault();
    if (!newSkillName.trim()) {
      setModalError("Please enter a skill name.");
      return;
    }

    try {
      setSubmitting(true);
      setModalError("");
      await adminApi.createSkill(newSkillName.trim());
      setNewSkillName("");
      setIsModalOpen(false);
      await fetchSkills();
    } catch (err) {
      setModalError(err.message || "Failed to add skill");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSkill = async (skillId, skillName) => {
    const confirm = window.confirm(`Are you sure you want to remove "${skillName}" from the taxonomy?`);
    if (!confirm) return;

    try {
      await adminApi.deleteSkill(skillId);
      await fetchSkills();
    } catch (err) {
      alert(err.message || "Failed to delete skill");
    }
  };

  const filteredSkills = skills.filter((s) => {
    const text = search.toLowerCase();
    return s.name.toLowerCase().includes(text);
  });

  return (
    <div className="min-h-screen bg-[#06194F] text-white px-8 py-7">
      {/* Header */}
      <div className="flex items-start justify-between mb-7">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Wrench size={24} className="text-blue-400" />
            Skill Taxonomy Management
          </h1>
          <p className="text-blue-100 text-xs mt-1">
            Curate and expand the global directory of exchangeable skills
          </p>
        </div>

        <button
          onClick={() => {
            setIsModalOpen(true);
            setModalError("");
            setNewSkillName("");
          }}
          className="flex items-center gap-2 bg-[#1463E8] hover:bg-[#0f56ca] text-white px-4 py-2 rounded-lg text-xs font-semibold transition shadow-lg"
        >
          <Plus size={15} />
          Add Taxonomy Skill
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8EA1D0]" />
          <input
            type="text"
            placeholder="Search taxonomy skills..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#1A2E68] border border-[#2D458B] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-[#8EA1D0] outline-none focus:border-blue-400 transition"
          />
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/20 border border-rose-500/30 rounded-xl text-rose-200 text-xs mb-6">
          {error}
        </div>
      )}

      {/* Skills Table */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-blue-200">
          <Loader2 size={32} className="animate-spin mb-3 text-blue-400" />
          <p className="text-sm">Loading skills taxonomy...</p>
        </div>
      ) : (
        <div className="bg-[#1A2E68] border border-[#2D458B] rounded-xl overflow-hidden shadow-lg">
          <div className="grid grid-cols-6 px-5 py-3 border-b border-[#2D458B] text-[10px] text-[#8EA1D0] uppercase font-bold tracking-wider">
            <span className="col-span-2">Skill Name</span>
            <span>Teachers Offering</span>
            <span>Learners Seeking</span>
            <span>Completed Sessions</span>
            <span className="text-right">Actions</span>
          </div>

          {filteredSkills.length === 0 ? (
            <div className="py-12 text-center text-[#8EA1D0] text-xs">
              No skills found matching "{search}".
            </div>
          ) : (
            filteredSkills.map((s) => (
              <div
                key={s.skill_id}
                className="grid grid-cols-6 items-center px-5 py-4 border-b border-[#2D458B]/50 last:border-b-0 text-xs hover:bg-[#203679]/40 transition"
              >
                {/* Skill Name */}
                <div className="col-span-2 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-300 flex items-center justify-center font-bold">
                    <BookOpen size={16} />
                  </div>
                  <div>
                    <span className="font-semibold text-white text-sm">{s.name}</span>
                    <span className="text-[10px] text-[#8EA1D0] block">ID: #{s.skill_id}</span>
                  </div>
                </div>

                {/* Teachers */}
                <div className="text-emerald-300 font-bold">
                  {s.teachers_count} teachers
                </div>

                {/* Learners */}
                <div className="text-blue-300 font-bold">
                  {s.learners_count} learners
                </div>

                {/* Sessions */}
                <div className="text-amber-300 font-bold">
                  {s.sessions_count} trades
                </div>

                {/* Actions */}
                <div className="text-right">
                  <button
                    onClick={() => handleDeleteSkill(s.skill_id, s.name)}
                    className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/20 p-2 rounded-lg transition"
                    title="Delete skill from taxonomy"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Add Skill Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1A2E68] border border-[#2D458B] rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#2D458B]">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus size={18} className="text-blue-400" />
                Add Taxonomy Skill
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateSkill} className="py-4 space-y-4">
              {modalError && (
                <div className="p-3 bg-rose-500/20 border border-rose-500/30 rounded-xl text-rose-200 text-xs">
                  {modalError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase text-blue-200 mb-1.5">
                  Skill Name:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Kotlin Android, Rust Programming..."
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  className="w-full bg-[#0E1E45] border border-[#2D458B] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#8EA1D0] outline-none focus:border-blue-400 transition"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#2D458B]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-[#8EA1D0] hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-lg text-xs font-bold bg-[#1463E8] hover:bg-[#0f56ca] text-white transition flex items-center gap-1.5 disabled:opacity-50"
                >
                  {submitting ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                  {submitting ? "Adding..." : "Add to Taxonomy"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Skills;