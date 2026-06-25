'use client';
import { FaSearch, FaBell, FaEnvelope, FaUserCircle } from 'react-icons/fa';

export default function Topbar() {
  return (
    <nav className="h-16 bg-white shadow-sm flex items-center justify-between px-6 sticky top-0 z-10">
      {/* Search Bar */}
      <form className="hidden sm:flex items-center bg-gray-100 rounded-md px-3 py-2 w-72">
        <input 
          type="text" 
          placeholder="Search for..." 
          className="bg-transparent border-none outline-none w-full text-sm text-gray-600 placeholder-gray-400"
        />
        <button type="button" className="text-green-600 hover:text-green-800">
          <FaSearch />
        </button>
      </form>

      {/* Right Side Icons */}
      <ul className="flex items-center gap-6 ml-auto">
        <li className="relative text-gray-400 hover:text-gray-600 cursor-pointer">
          <FaBell className="text-xl" />
          <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">3+</span>
        </li>
        <li className="relative text-gray-400 hover:text-gray-600 cursor-pointer">
          <FaEnvelope className="text-xl" />
          <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">7</span>
        </li>
        <div className="h-8 w-px bg-gray-300 mx-2"></div>
        <li className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-md transition-colors">
          <span className="text-sm font-medium text-gray-600 hidden md:block">Admin User</span>
          <FaUserCircle className="text-3xl text-gray-400" />
        </li>
      </ul>
    </nav>
  );
}