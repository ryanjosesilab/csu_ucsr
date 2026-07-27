import React from 'react';
import Sidebar from './Sidebar';
import { AdminThemeProvider } from './ThemeContext';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminThemeProvider>
      {/* 1. Added bg-gray-50 and dark:bg-[#0f172a] to the main wrapper to handle the overall background */}
      <div className="flex min-h-screen font-sans text-gray-900 transition-colors duration-200 bg-gray-50 dark:bg-[#0f172a] dark:text-white">
        
        <Sidebar />
        
        <div className="flex flex-col grow w-full overflow-hidden">
          
          {/* 2. REMOVED dark:bg-white and dark:text-black from main */}
          <main className="grow p-4 md:p-6 overflow-y-auto transition-colors duration-200 bg-transparent">
            {children}
          </main>
          
          {/* 3. REMOVED dark:bg-white from footer */}
          <footer className="p-4 text-center text-sm text-gray-500 shadow-inner mt-auto transition-colors duration-200 dark:text-gray-400 bg-transparent">
            <span>Copyright &copy; UCSR Admin 2026</span>
          </footer>
          
        </div>
      </div>
    </AdminThemeProvider>
  );
}