"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "../../../utils/supabase";
import { FaHistory, FaSearch, FaTrash, FaDownload, FaArrowLeft, FaSort, FaCalendarAlt } from "react-icons/fa";
import Link from "next/link";

interface GymBooking {
  id: number;
  student_id: string;
  name: string;
  schedule: string; 
  is_event_training: boolean;
  status: string;
  feedback?: string;
}

export default function GymHistoryPage() {
  const [logs, setLogs] = useState<GymBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc'); 
  
  // NEW: State for the Year Filter
  const [selectedYear, setSelectedYear] = useState<string>("All");

  // NEW: Magically extract all unique years from your data, sorted newest to oldest
  const availableYears = ["All", ...Array.from(new Set(logs.map(log => {
    if (!log.schedule) return "";
    return new Date(log.schedule).getFullYear().toString();
  })))].filter(Boolean).sort((a, b) => a === "All" ? -1 : Number(b) - Number(a));

  const fetchHistoryLogs = async () => {
    setLoading(true);

    // Fetch all records that are NO LONGER Pending
    const { data, error } = await supabase
      .from("gym_bookings")
      .select("*")
      .in('status', ['accepted', 'active', 'rejected', 'missed'])
      .order('schedule', { ascending: false }); // Newest dates at the top

    if (error) {
      console.error("SUPABASE FETCH ERROR:", error.message);
      alert(`Database Error: ${error?.message}`);
    } else {
      setLogs(data as GymBooking[]);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    fetchHistoryLogs();
  }, []);

  // --- DELETE FUNCTION ---
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to permanently delete this gym record?")) return;

    const { error } = await supabase.from("gym_bookings").delete().eq("id", id);

    if (error) {
      console.error("Error deleting record:", error);
      alert("Failed to delete record.");
    } else {
      setLogs(prev => prev.filter(log => log.id !== id));
    }
  };

  // --- TIME SLOT FORMATTER (e.g., 8:00 AM - 9:00 AM) ---
  const getHourlySlot = (isoString: string) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      const startHour = d.getHours();
      const endHour = startHour + 1;
      
      const formatTime = (h: number) => {
        const ampm = h >= 12 ? 'PM' : 'AM';
        const displayH = h % 12 || 12;
        return `${displayH}:00 ${ampm}`;
      };
      
      return `${formatTime(startHour)} - ${formatTime(endHour)}`;
    } catch {
      return "Invalid Time";
    }
  };

  const getDateStr = (isoString: string) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    return d.toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
  };



  // Filter by Search, Filter by Year, AND Sort the logs!
  const filteredLogs = logs
    .filter(log => {
      // 1. Does it match the Search Bar?
      const matchesSearch = log.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            log.student_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            log.status.toLowerCase().includes(searchQuery.toLowerCase());
      
      // 2. Does it match the Year Dropdown?
      const logYear = log.schedule ? new Date(log.schedule).getFullYear().toString() : "";
      const matchesYear = selectedYear === "All" || logYear === selectedYear;

      // Only show if it passes BOTH tests
      return matchesSearch && matchesYear;
    })
    .sort((a, b) => {
      const dateA = new Date(a.schedule).getTime();
      const dateB = new Date(b.schedule).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB; 
    });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      
      {/* HEADER */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/gym-management" className="p-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full transition">
            <FaArrowLeft />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Gym History Log</h1>
            <p className="text-sm text-gray-500 mt-1">Archive of all processed gym sessions, no-shows, and rejections.</p>
          </div>
        </div>
        
        
      </div>

      {/* SEARCH AND TABLE */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        
        {/* Search & Filter Bar */}
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Left: Search */}
          <div className="flex items-center gap-3 w-full sm:max-w-md bg-white px-3 py-2 rounded-lg border border-gray-200 focus-within:ring-2 focus-within:ring-blue-500 transition shadow-sm">
            <FaSearch className="text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by student name, ID, or status..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-none outline-none text-sm text-gray-700 placeholder-gray-400"
            />
          </div>

         {/* Search & Filter Bar */}
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4">


          <div className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-2 rounded-lg shadow-sm w-full sm:w-auto transition hover:border-gray-300 focus-within:ring-2 focus-within:ring-blue-500">
              <FaCalendarAlt className="text-gray-400" />
              <span className="text-sm font-bold text-gray-600 hidden sm:inline">Year:</span>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="bg-transparent border-none outline-none text-sm text-gray-700 font-bold cursor-pointer w-full pr-2"
              >
                {availableYears.map(year => (
                  <option key={year} value={year}>{year === "All" ? "All Years" : year}</option>
                ))}
              </select>
            </div>
          
          

          {/* Right: Sort Toggle Button */}
          <button 
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="flex items-center justify-center gap-2 bg-gray-800 hover:bg-black text-white px-4 py-2 rounded font-bold transition"
          >
           
            Sort: {sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}
          </button>

        </div>

        </div>

        

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-gray-500 font-medium">Loading history...</div>
          ) : filteredLogs.length === 0 ? (
            <div className="p-12 text-center text-gray-500 font-medium flex flex-col items-center">
              <FaHistory className="text-4xl text-gray-300 mb-3" />
              <p>No history records found.</p>
            </div>
          ) : (
             <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Student Name (ID)</th>
                  <th className="px-6 py-4">Schedule Date</th>
                  <th className="px-6 py-4">Time Slot</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition">
                    
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{log.name}</div>
                      <div className="text-xs text-gray-500">{log.student_id}</div>
                      {log.is_event_training && (
                        <div className="mt-1.5 inline-block px-2 py-0.5 bg-purple-50 text-purple-700 text-[10px] font-bold rounded uppercase tracking-wider border border-purple-100">
                          Employee
                        </div>
                      )}
                    </td>
                    
                    <td className="px-6 py-4 text-gray-800 font-medium">
                      {getDateStr(log.schedule)}
                    </td>
                    
                    <td className="px-6 py-4 font-bold text-indigo-700">
                      {getHourlySlot(log.schedule)}
                    </td>
                    
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <span className={`px-2.5 py-1 inline-flex text-[11px] leading-5 font-bold rounded-full capitalize ${
                          log.status === "active" || log.status === "accepted" ? "bg-emerald-100 text-emerald-800" : 
                          log.status === "missed" ? "bg-orange-100 text-orange-800" :
                          "bg-rose-100 text-rose-800"
                        }`}>
                          {log.status === 'active' ? 'Attended' : log.status}
                        </span>
                        {/* Show rejection/ban reason if it exists */}
                        {log.feedback && <span className="text-[10px] text-gray-500 mt-1 max-w-[150px] truncate" title={log.feedback}>{log.feedback}</span>}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 text-center">
                      <button onClick={() => handleDelete(log.id)} className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded transition" title="Delete Record">
                        <FaTrash />
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}