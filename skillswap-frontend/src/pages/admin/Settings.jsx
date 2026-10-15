
import { useState } from "react";
import {
  Settings as SettingsIcon,
  Bell,
  Shield,
  Globe,
  Save,
} from "lucide-react";

function Settings() {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem("skillswap_admin_settings");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to load admin settings:", e);
    }
    return {
      siteName: "SkillSwap",
      emailNotifications: true,
      disputeNotifications: true,
      maintenanceMode: false,
      allowRegistration: true,
    };
  });

  const [saved, setSaved] = useState(false);

  const handleChange = (field) => {
    setSettings((current) => ({
      ...current,
      [field]: !current[field],
    }));
  };

  const handleSave = () => {
    try {
      localStorage.setItem("skillswap_admin_settings", JSON.stringify(settings));
    } catch (e) {
      console.error("Failed to save admin settings:", e);
    }
    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#06194F] text-white px-8 py-7">

      {/* Header */}
      <div className="flex items-start justify-between mb-7">

        <div>
          <h1 className="text-2xl font-bold">
            Settings
          </h1>

          <p className="text-blue-100 text-xs mt-1">
            Manage SkillSwap platform settings
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#243F78] border border-[#3A558D] rounded-lg px-4 py-2">

          <SettingsIcon
            size={16}
            className="text-blue-300"
          />

          <span className="text-sm font-semibold">
            Admin Settings
          </span>

        </div>

      </div>

      <div className="max-w-4xl space-y-5">

        {/* General Settings */}
        <div className="bg-[#243F78] border border-[#3A558D] rounded-lg p-6">

          <div className="flex items-center gap-3 mb-5">

            <div className="p-2 rounded-lg bg-[#1B356B]">

              <Globe
                size={18}
                className="text-blue-300"
              />

            </div>

            <div>

              <h2 className="text-base font-semibold">
                General Settings
              </h2>

              <p className="text-[10px] text-blue-200">
                Basic platform configuration
              </p>

            </div>

          </div>

          <label className="block">

            <span className="text-xs text-blue-100">
              Platform Name
            </span>

            <input
              type="text"
              value={settings.siteName}
              onChange={(e) =>
                setSettings((current) => ({
                  ...current,
                  siteName: e.target.value,
                }))
              }
              className="mt-2 w-full bg-[#1B356B] border border-[#3A558D] rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-[#6D4AFF]"
            />

          </label>

        </div>

        {/* Notifications */}
        <div className="bg-[#243F78] border border-[#3A558D] rounded-lg p-6">

          <div className="flex items-center gap-3 mb-5">

            <div className="p-2 rounded-lg bg-[#1B356B]">

              <Bell
                size={18}
                className="text-blue-300"
              />

            </div>

            <div>

              <h2 className="text-base font-semibold">
                Notifications
              </h2>

              <p className="text-[10px] text-blue-200">
                Control admin notifications
              </p>

            </div>

          </div>

          {/* Email Notifications */}
          <div className="flex items-center justify-between py-3 border-b border-[#3A558D]">

            <div>

              <p className="text-sm">
                Email Notifications
              </p>

              <p className="text-[10px] text-blue-200 mt-1">
                Receive important platform notifications
              </p>

            </div>

            <button
              onClick={() => handleChange("emailNotifications")}
              className={`w-11 h-6 rounded-full p-1 transition ${
                settings.emailNotifications
                  ? "bg-[#6D4AFF]"
                  : "bg-[#1B356B]"
              }`}
            >

              <div
                className={`w-4 h-4 rounded-full bg-white transition ${
                  settings.emailNotifications
                    ? "translate-x-5"
                    : "translate-x-0"
                }`}
              />

            </button>

          </div>

          {/* Dispute Notifications */}
          <div className="flex items-center justify-between py-3">

            <div>

              <p className="text-sm">
                Dispute Notifications
              </p>

              <p className="text-[10px] text-blue-200 mt-1">
                Get notified when a new dispute is created
              </p>

            </div>

            <button
              onClick={() => handleChange("disputeNotifications")}
              className={`w-11 h-6 rounded-full p-1 transition ${
                settings.disputeNotifications
                  ? "bg-[#6D4AFF]"
                  : "bg-[#1B356B]"
              }`}
            >

              <div
                className={`w-4 h-4 rounded-full bg-white transition ${
                  settings.disputeNotifications
                    ? "translate-x-5"
                    : "translate-x-0"
                }`}
              />

            </button>

          </div>

        </div>

        {/* Security */}
        <div className="bg-[#243F78] border border-[#3A558D] rounded-lg p-6">

          <div className="flex items-center gap-3 mb-5">

            <div className="p-2 rounded-lg bg-[#1B356B]">

              <Shield
                size={18}
                className="text-blue-300"
              />

            </div>

            <div>

              <h2 className="text-base font-semibold">
                Security & Access
              </h2>

              <p className="text-[10px] text-blue-200">
                Control user access to the platform
              </p>

            </div>

          </div>

          {/* Registration */}
          <div className="flex items-center justify-between py-3 border-b border-[#3A558D]">

            <div>

              <p className="text-sm">
                Allow New Registration
              </p>

              <p className="text-[10px] text-blue-200 mt-1">
                Allow new users to create accounts
              </p>

            </div>

            <button
              onClick={() => handleChange("allowRegistration")}
              className={`w-11 h-6 rounded-full p-1 transition ${
                settings.allowRegistration
                  ? "bg-[#6D4AFF]"
                  : "bg-[#1B356B]"
              }`}
            >

              <div
                className={`w-4 h-4 rounded-full bg-white transition ${
                  settings.allowRegistration
                    ? "translate-x-5"
                    : "translate-x-0"
                }`}
              />

            </button>

          </div>

          {/* Maintenance */}
          <div className="flex items-center justify-between py-3">

            <div>

              <p className="text-sm">
                Maintenance Mode
              </p>

              <p className="text-[10px] text-blue-200 mt-1">
                Temporarily disable platform access
              </p>

            </div>

            <button
              onClick={() => handleChange("maintenanceMode")}
              className={`w-11 h-6 rounded-full p-1 transition ${
                settings.maintenanceMode
                  ? "bg-red-500"
                  : "bg-[#1B356B]"
              }`}
            >

              <div
                className={`w-4 h-4 rounded-full bg-white transition ${
                  settings.maintenanceMode
                    ? "translate-x-5"
                    : "translate-x-0"
                }`}
              />

            </button>

          </div>

        </div>

        {/* Save */}
        <div className="flex justify-end items-center gap-4">

          {saved && (
            <span className="text-xs text-green-300">
              Settings saved successfully!
            </span>
          )}

          <button
            onClick={handleSave}
            className="flex items-center gap-2 bg-[#6D4AFF] hover:bg-[#7C5CFF] px-5 py-2.5 rounded-lg text-sm font-semibold transition"
          >

            <Save size={16} />

            Save Changes

          </button>

        </div>

      </div>

    </div>
  );
}

export default Settings;

