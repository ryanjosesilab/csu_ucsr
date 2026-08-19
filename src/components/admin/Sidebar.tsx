"use client";

import { useRouter } from "next/navigation";
import { supabase } from "../../utils/supabase";
import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  FaFileAlt,
  FaChevronDown,
  FaTachometerAlt,
  FaCog,
  FaUserCircle,
  FaSignOutAlt,
  FaSun,
  FaMoon,
} from "react-icons/fa";
import { useAdminTheme } from "./ThemeContext";

export default function Sidebar() {
  const [isFormsOpen, setIsFormsOpen] = useState(false);
  const [isComponentsOpen, setIsComponentsOpen] = useState(false);
  const { isDarkMode, toggleTheme } = useAdminTheme();

  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;
  const router = useRouter();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      router.push("/login");
    } else {
      console.error("Error logging out:", error.message);
    }
  };

  return (
    <ul
      className="w-64 text-white flex flex-col min-h-screen shadow-xl hidden md:flex m-0 p-0 transition-colors duration-200"
      style={{ backgroundColor: isDarkMode ? "#0f172a" : "#0F4E15" }}
    >
      <Link
        href="/admin"
        className="flex flex-col items-center justify-center py-8 border-b border-white/10 !no-underline hover:opacity-90 transition-opacity"
      >
        <div className="relative flex justify-center">
          <img
            src="/csu-logo-official.png"
            alt="UCSR Logo"
            className="h-48 w-auto object-contain animate-fire-flicker relative z-10"
          />

          <style
            dangerouslySetInnerHTML={{
              __html: `
                @keyframes fireFlicker {
                  0%, 100% { filter: drop-shadow(0 0 10px rgba(255, 165, 0, 0.4)) brightness(1); transform: scale(1); }
                  25% { filter: drop-shadow(0 0 15px rgba(255, 140, 0, 0.6)) brightness(1.05); }
                  50% { filter: drop-shadow(0 0 25px rgba(255, 69, 0, 0.8)) brightness(1.1); transform: scale(1.02); }
                  75% { filter: drop-shadow(0 0 12px rgba(255, 140, 0, 0.5)) brightness(1.02); }
                }
                .animate-fire-flicker {
                  animation: fireFlicker 3s infinite ease-in-out;
                }
              `,
            }}
          />
        </div>

        <span className="text-white text-3xl font-bold tracking-widest uppercase mt-4 drop-shadow-md font-['Cascadia_Code',_sans-serif]">
          UCSR
        </span>
      </Link>

      <div className="flex flex-col py-4 grow">
        <span className="px-4 py-2 text-xs font-bold text-white/50 uppercase tracking-wider">
          Core
        </span>

        <Link
          href="/admin"
          className="flex items-center px-4 py-3 hover:bg-white/10 transition-colors !no-underline border-none !text-white"
        >
          <FaTachometerAlt className="mr-3 !text-white/90" />
          <span className="!text-white text-sm font-semibold">Dashboard</span>
        </Link>

        <span className="px-4 py-2 text-xs font-bold text-white/50 uppercase tracking-wider mt-2">
          Interface
        </span>

        <button
          onClick={() => setIsFormsOpen(!isFormsOpen)}
          className="flex items-center justify-between w-full px-4 py-3 hover:bg-white/10 transition-colors text-white focus:outline-none border-none outline-none"
        >
          <div className="flex items-center">
            <FaFileAlt className="mr-3 text-white/90" />
            <span className="text-white text-sm font-semibold">Forms</span>
          </div>
          <FaChevronDown
            className={`text-xs transition-transform ${isFormsOpen ? "rotate-180" : ""}`}
          />
        </button>

        {isFormsOpen && (
          <div className="bg-black/10 py-2 transition-all duration-200 ease-in-out">
            <Link
              href="/admin/borrowers"
              className="block px-10 py-2 text-sm !text-white/90 hover:!text-white hover:bg-white/5 !no-underline border-none"
            >
              Equipment Borrowing
            </Link>
            <Link
              href="/admin/gym-management"
              className="block px-10 py-2 text-sm !text-white/90 hover:!text-white hover:bg-white/5 !no-underline border-none"
            >
              Fitness Gym
            </Link>
            <Link
              href="/admin/dlc"
              className={`block px-10 py-2 text-sm !no-underline border-none transition-colors ${
                isActive("/admin/dlc")
                  ? "bg-white/20 !text-white font-bold"
                  : "!text-white/90 hover:!text-white hover:bg-white/5"
              }`}
            >
              DLC Request
            </Link>
            <Link
              href="/admin/tryouts"
              className="block px-10 py-2 text-sm !text-white/90 hover:!text-white hover:bg-white/5 !no-underline border-none"
            >
              Sports Tryouts
            </Link>
          </div>
        )}

        <button
          onClick={() => setIsComponentsOpen(!isComponentsOpen)}
          className="flex items-center justify-between w-full px-4 py-3 hover:bg-white/10 transition-colors text-white focus:outline-none border-none outline-none"
        >
          <div className="flex items-center">
            <FaCog className="mr-3 text-white/90" />
            <span className="text-white text-sm font-semibold">Components</span>
          </div>
          <FaChevronDown
            className={`text-xs transition-transform ${isComponentsOpen ? "rotate-180" : ""}`}
          />
        </button>

        {isComponentsOpen && (
          <div className="bg-black/10 py-2 transition-all duration-200 ease-in-out">
            <Link
              href="/admin/gym-banned-lists"
              className="block px-10 py-2 text-sm !text-white/90 hover:!text-white hover:bg-white/5 !no-underline border-none"
            >
              Gym Ban List
            </Link>
            <Link
              href="/admin/settings"
              className="block px-10 py-2 text-sm !text-white/90 hover:!text-white hover:bg-white/5 !no-underline border-none"
            >
              System Settings
            </Link>
            <Link
              href="/admin/changepass-admin"
              className="block px-10 py-2 text-sm !text-white/90 hover:!text-white hover:bg-white/5 !no-underline border-none"
            >
              Change my Password
            </Link>
          </div>
        )}

        <div className="mt-4 border-t border-white/10 pt-2">
          <button
            onClick={toggleTheme}
            aria-pressed={isDarkMode}
            className="flex items-center justify-between w-full px-4 py-3 hover:bg-white/10 transition-colors text-white focus:outline-none border-none outline-none"
          >
            <div className="flex items-center">
              {isDarkMode ? (
                <FaMoon className="mr-3 text-white/90" />
              ) : (
                <FaSun className="mr-3 text-white/90" />
              )}
              <span className="text-white text-sm font-semibold">Theme</span>
            </div>
            <div
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${isDarkMode ? "bg-blue-500" : "bg-black/30"}`}
            >
              <span
                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${isDarkMode ? "translate-x-4" : "translate-x-1"}`}
              />
            </div>
          </button>
        </div>

        <div
          className="mt-2 p-4 border-t border-b border-white/10 flex items-center justify-between"
          style={{
            backgroundColor: isDarkMode
              ? "rgba(255,255,255,0.06)"
              : "rgba(0,0,0,0.1)",
          }}
        >
          <div className="flex items-center gap-3">
            <FaUserCircle className="text-3xl text-white/80" />
            <div>
              <p className="text-xs font-bold text-white uppercase tracking-wide">
                Admin UCSR
              </p>
              <p className="text-[10px] text-white/60">systemadmin@ucsr.edu.ph</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="text-white/60 hover:text-red-400 transition-colors p-2 hover:bg-white/5 rounded-full outline-none border-none cursor-pointer"
            title="Sign Out"
          >
            <FaSignOutAlt className="text-xl" />
          </button>
        </div>
      </div>
    </ul>
  );
}