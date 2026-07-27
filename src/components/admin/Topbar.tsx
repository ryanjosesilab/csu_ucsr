"use client";
import { useRouter } from "next/navigation";
import { supabase } from "../../utils/supabase";
import { FaSignOutAlt, FaSun, FaMoon } from "react-icons/fa";
import { useAdminTheme } from "./ThemeContext";

export default function Topbar() {
  const router = useRouter();
  const { isDarkMode, toggleTheme } = useAdminTheme();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      router.push("/");
    } else {
      console.error("Error logging out:", error.message);
    }
  };

  return (
    <nav
      className="h-16 shadow-md flex items-center justify-end px-6 sticky top-0 z-10 border-b border-white/10 transition-colors duration-200"
      style={{ backgroundColor: isDarkMode ? "#0f172a" : "#0F4E15" }}
    >
      <ul className="flex items-center gap-4 ml-auto">
        <li>
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-white hover:bg-white/20 transition-all focus:outline-none"
            title="Toggle theme"
          >
            {isDarkMode ? (
              <FaMoon className="text-sm" />
            ) : (
              <FaSun className="text-sm" />
            )}
            <span className="text-sm font-semibold tracking-wide hidden md:block">
              {isDarkMode ? "DARK" : "LIGHT"}
            </span>
          </button>
        </li>

        <div className="h-8 w-px bg-white/20 mx-2"></div>

        <li>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-300 hover:text-red-400 hover:bg-white/5 px-3 py-2 rounded-lg transition-all focus:outline-none"
            title="Sign Out"
          >
            <span className="text-sm font-semibold tracking-wide hidden md:block">
              LOGOUT
            </span>
            <FaSignOutAlt className="text-xl" />
          </button>
        </li>
      </ul>
    </nav>
  );
}
