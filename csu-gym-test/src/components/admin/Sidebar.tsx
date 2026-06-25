'use client';
import { useState } from 'react';
import Link from 'next/link';
// I added the missing icons here:
import { 
  FaFileAlt, 
  FaChevronDown, 
  FaGraduationCap, 
  FaTachometerAlt, 
  FaWarehouse, 
  FaCog 
} from 'react-icons/fa';

export default function Sidebar() {
  const [isFormsOpen, setIsFormsOpen] = useState(false);

  return (
    <ul className="w-64 bg-gradient-to-b from-green-500 to-green-700 text-white flex flex-col min-h-screen shadow-lg hidden md:flex">
      {/* Brand */}
      <Link href="/admin" className="flex items-center justify-center h-20 border-b border-white/20 hover:text-gray-200">
        <FaGraduationCap className="text-3xl mr-3" />
        <span className="text-xl font-bold tracking-wider uppercase">UCSR</span>
      </Link>

      {/* Navigation Links Container */}
      <div className="flex flex-col py-4">
        <span className="px-4 py-2 text-xs font-bold text-white/60 uppercase tracking-wider">Core</span>
        
        <Link href="/admin" className="flex items-center px-4 py-3 hover:bg-white/10 transition-colors">
          <FaTachometerAlt className="mr-3 opacity-75" />
          <span className="text-sm font-semibold">Dashboard</span>
        </Link>

        <Link href="/admin/fitness-gym" className="flex items-center px-4 py-3 hover:bg-white/10 transition-colors">
          <FaWarehouse className="mr-3 opacity-75" />
          <span className="text-sm font-semibold">Fitness Gym</span>
        </Link>

        <hr className="border-white/20 my-2 mx-4" />

        <span className="px-4 py-2 text-xs font-bold text-white/60 uppercase tracking-wider">Interface</span>

        {/* Forms Dropdown Trigger */}
        <button 
          onClick={() => setIsFormsOpen(!isFormsOpen)}
          className="flex items-center justify-between w-full px-4 py-3 hover:bg-white/10 transition-colors text-white"
        >
          <div className="flex items-center">
            <FaFileAlt className="mr-3 opacity-75" />
            <span className="text-sm font-semibold">Forms</span>
          </div>
          <FaChevronDown className={`text-xs transition-transform ${isFormsOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown Items (Visible only when isFormsOpen is true) */}
        {isFormsOpen && (
          <div className="bg-green-800 py-2 animate-in slide-in-from-top-2">
            <Link href="/admin/forms/equipment" className="block px-10 py-2 text-sm text-white/80 hover:text-white">
              Equipment Borrowing
            </Link>
            <Link href="/admin/forms/gym" className="block px-10 py-2 text-sm text-white/80 hover:text-white">
              Fitness Gym
            </Link>
            <Link href="/admin/forms/dlc" className="block px-10 py-2 text-sm text-white/80 hover:text-white">
              DLC Request
            </Link>
            <Link href="/admin/tryouts" className="block px-10 py-2 text-sm text-white/80 hover:text-white">
              Sports Tryouts
            </Link>
          </div>
        )} 
        {/* ^^^ I added the missing closing brackets for the condition right here ^^^ */}

        <Link href="/admin/components" className="flex items-center px-4 py-3 hover:bg-white/10 transition-colors">
          <FaCog className="mr-3 opacity-75" />
          <span className="text-sm font-semibold">Components</span>
        </Link>

      </div> 
      {/* ^^^ I added the missing closing div for the main container right here ^^^ */}
    </ul>
  );
}