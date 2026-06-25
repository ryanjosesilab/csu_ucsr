import React from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-100 font-sans text-gray-800">
      <Sidebar />
      <div className="flex flex-col flex-grow w-full overflow-hidden">
        <Topbar />
        <main className="flex-grow p-4 md:p-6 overflow-y-auto">
          {children}
        </main>
        <footer className="bg-white p-4 text-center text-sm text-gray-500 shadow-inner mt-auto">
          <span>Copyright &copy; UCSR Admin 2026</span>
        </footer>
      </div>
    </div>
  );
}