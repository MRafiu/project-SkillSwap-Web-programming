import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard,
  Users,
  Wrench,
  ArrowLeftRight,
  AlertTriangle,
  BarChart3,
  Settings,
  HelpCircle,
  LogOut,
  ShieldCheck,
} from "lucide-react";

function AdminLayout({ children }) {
  const location = useLocation();

  const menuItems = [
    {
      name: "Dashboard",
      path: "/admin",
      icon: LayoutDashboard,
    },
    {
      name: "Users",
      path: "/admin/users",
      icon: Users,
    },
    {
      name: "Skills",
      path: "/admin/skills",
      icon: Wrench,
    },
    {
      name: "Requests",
      path: "/admin/requests",
      icon: ArrowLeftRight,
    },
    {
      name: "Disputes",
      path: "/admin/disputes",
      icon: AlertTriangle,
    },
    {
      name: "Analytics",
      path: "/admin/analytics",
      icon: BarChart3,
    },
    {
      name: "Settings",
      path: "/admin/settings",
      icon: Settings,
    },
  ];

  const navigate = useNavigate();
  const { logoutUser, user } = useAuth();

  const handleLogout = () => {
    localStorage.removeItem("isAdmin");
    logoutUser();
    navigate("/admin-login");
  };

  return (
    <div className="min-h-screen bg-[#06194F] flex">

      {/* ================= SIDEBAR ================= */}
      <aside className="w-[230px] min-h-screen bg-[#F5F6FF] flex flex-col">

        {/* Logo */}
        <div className="px-6 py-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#4F46E5] flex items-center justify-center">
              <ShieldCheck size={18} className="text-white" />
            </div>

            <div>
              <h1 className="text-[#06194F] font-bold text-lg leading-none">
                SkillSwap
              </h1>

              <p className="text-gray-400 text-[10px] mt-1">
                ADMIN PANEL
              </p>
            </div>
          </div>
        </div>

        {/* Menu */}
        <nav className="px-4 space-y-1">

          {menuItems.map((item) => {
            const Icon = item.icon;

            const isActive =
              location.pathname === item.path;

            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
                  isActive
                    ? "bg-[#6D4AFF] text-white"
                    : "text-gray-600 hover:bg-[#E8E9FF]"
                }`}
              >
                <Icon size={16} />
                <span>{item.name}</span>
              </Link>
            );
          })}

        </nav>

        {/* Bottom section */}
        <div className="mt-auto">

          <div className="border-t border-gray-200 mx-4"></div>

          {/* Help */}
          <div className="px-4 pt-5 pb-3">
            <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-[#E8E9FF] rounded-lg">
              <HelpCircle size={16} />
              <span>Help Center</span>
            </button>
          </div>

          {/* Logout */}
          <div className="px-4 pb-6">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>

        </div>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <main className="flex-1 min-h-screen">
        {children}
      </main>

    </div>
  );
}

export default AdminLayout;