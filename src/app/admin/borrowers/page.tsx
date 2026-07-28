"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "../../../utils/supabase";
import { FaCalendarAlt, FaCheck, FaTimes, FaUndo, FaPrint, FaFileAlt } from "react-icons/fa";
import Link from "next/link";

type InventoryLog = {
  id: string;
  borrowerName: string;
  contact_number: string; 
  borrowerType: string;
  purpose: string;
  dateBorrowed: string;
  dateReturned: string | null;
  items: string[];
  status: string; 
  createdAt: string;
};

type BorrowingRow = {
  id?: number | string;
  created_at?: string | null;
  borrower_name?: string | null;
  contact_number?: string | null;
  borrower_type?: string | null;
  purpose?: string | null;
  date_borrowed?: string | null;
  date_return?: string | null;
  unit_type?: string | null;
  items_list?: Array<string | { equipmentName?: string; name?: string }> | string | null;
  status?: string | null;
};

export default function InventoryManagerPage() {
  const [logs, setLogs] = useState<InventoryLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // --- CALENDAR STATES ---
  const getLocalToday = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const [selectedDate, setSelectedDate] = useState<string>(getLocalToday());
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [calYear, setCalYear] = useState(new Date().getFullYear());

  const nextMonth = () => {
    if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); } 
    else { setCalMonth(m => m + 1); }
  };

  const prevMonth = () => {
    if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); } 
    else { setCalMonth(m => m - 1); }
  };

  const firstDayOfMonth = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const blankDays = Array.from({ length: firstDayOfMonth }, (_, i) => i);
  const monthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  // -----------------------

  const fetchLogs = async () => {
    setLoading(true);
    setFetchError(null);

    const { data, error } = await supabase
      .from("equipment_borrowings")
      .select("*")
      .order('created_at', { ascending: false }); 

    if (error) {
      console.error("SUPABASE FETCH ERROR:", error.message);
      setFetchError(error.message);
      setLogs([]);
      setLoading(false);
      return;
    }

    const mappedLogs: InventoryLog[] = (data || []).map((entry: BorrowingRow) => {
      
      const items = Array.isArray(entry.items_list)
        ? entry.items_list.map((rawItem) => {
            if (typeof rawItem === "string") return rawItem;
            
            const item = rawItem as { 
              equipmentName?: string; 
              name?: string; 
              quantity?: number | string; 
              qty?: number | string; 
              unit?: string; 
              unit_type?: string 
            };
            
            const name = item?.equipmentName || item?.name || "Item";
            const qty = item?.quantity || item?.qty;
            const unit = item?.unit || item?.unit_type || entry.unit_type || ""; 
            
            if (qty) {
              return `${qty} ${unit} ${name}`.trim().replace(/\s+/g, ' '); 
            }
            return name;
          })
        : typeof entry.items_list === "string" ? [entry.items_list] : [];

      const status = entry.status || "Pending";

      return {
        id: String(entry.id),
        borrowerName: entry.borrower_name || "Unknown",
        contact_number: entry.contact_number || "",
        borrowerType: entry.borrower_type || "Student", 
        purpose: entry.purpose || "",
        dateBorrowed: entry.date_borrowed || "",
        dateReturned: entry.date_return || null,
        items,
        status: status.replace(/['"]+/g, '').trim(),
        createdAt: entry.created_at || new Date().toISOString(), 
      };
    });

    setLogs(mappedLogs);
    setLoading(false);
  };


  
  useEffect(() => {
    fetchLogs();

    const borrowingChannel = supabase
      .channel('realtime-borrowings')
      .on(
        'postgres_changes',
        {
          event: '*', 
          schema: 'public',
          table: 'equipment_borrowings'
        },
        (payload) => {
          console.log('Real-time update received!', payload);
          fetchLogs(); 
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(borrowingChannel);
    };
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    
    if (newStatus === "Approved") {
      
      window.open(`/print-borrowers/${id}`, '_blank');
    }

    const { error } = await supabase
      .from("equipment_borrowings")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) {
      console.error("Failed to update status:", error);
      alert("Failed to update status.");
      return;
    }

    setLogs((prevLogs) => prevLogs.map((log) => log.id === id ? { ...log, status: newStatus } : log));
    
    if (newStatus === "Returned") {
      alert("Equipment marked as returned. The record has been moved to the History log.");
    }
  };

  // --- FILTERING FOR UI ---
  const pendingLogs = logs.filter(log => log.status.toLowerCase() === 'pending');
  const activeLogs = logs.filter(log => log.status.toLowerCase() === 'approved');

  const todayStr = getLocalToday();

  const todaysActiveBorrowers = activeLogs.filter(log => {
    const isBorrowedToday = log.dateBorrowed === selectedDate;
    const isExactDueDay = log.dateReturned === selectedDate;
    
    const isOverdueAndLookingAtToday = log.dateReturned && log.dateReturned < todayStr && selectedDate === todayStr;

    return isBorrowedToday || isExactDueDay || isOverdueAndLookingAtToday;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-10">
      
      <div className="relative overflow-hidden flex justify-between items-center bg-[#0F4E15] p-6 rounded-lg shadow-md border border-white/10 mb-8">
      
      <div 
        className="absolute inset-y-0 right-0 w-1/2 lg:w-[60%] bg-cover bg-center z-0"
        style={{ backgroundImage: "url('/try-header.png')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#0F4E15] via-[#0F4E15]/80 to-transparent"></div>
      </div>

      <div className="relative z-10">
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Sports Equipment Management
        </h1>
        <p className="text-sm text-white/80 mt-1">
          Review checkout requests, print forms, and track returns.
        </p>
      </div>
      
      <div className="relative z-10">
        <Link href="/admin/borrowers-printhistory">
          <button 
            className="bg-blue-600 text-white p-3 rounded hover:bg-blue-700 transition shadow-sm flex items-center justify-center"
            title="View Equipment Borrowing Log"
          >
            <FaFileAlt className="text-lg" />
          </button>
        </Link>
      </div>

    </div>

      {/* ================= SECTION 1: PENDING REQUESTS ================= */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center">
            <h2 className="text-lg font-bold text-gray-800">Pending Equipment Requests</h2>
          </div>
        
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-6 text-sm text-gray-500 text-center">Loading requests...</div>
          ) : pendingLogs.length === 0 ? (
            <div className="p-8 text-sm text-center text-gray-500 font-medium">No pending requests found.</div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase">
                <tr>
                  <th className="px-6 py-4">Borrower</th>
                  <th className="px-6 py-4">Purpose</th>
                  <th className="px-6 py-4">Dates</th>
                  <th className="px-6 py-4">Equipment</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {pendingLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{log.borrowerName}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{log.contact_number}</div> {/* <-- CHANGED FROM log.phone */}
                      <div className="mt-1.5 inline-block px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded uppercase tracking-wider border border-indigo-100">
                        {log.borrowerType}
                      </div>
                    </td>
                    <td className="px-6 py-4">{log.purpose}</td>
                    <td className="px-6 py-4 text-xs font-medium">
                      <div className="text-[10px] text-blue-600 font-bold mb-1.5 uppercase tracking-wider">
                        Requested: {new Date(log.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                      
                      <div className="text-gray-500 flex gap-1">
                        <span>Borrow:</span> 
                        <span className="text-gray-900 font-bold">{log.dateBorrowed || 'Not set'}</span>
                      </div>
                      <div className="text-emerald-600 mt-1 flex gap-1">
                        <span>Return:</span> 
                        <span className="font-bold">{log.dateReturned ? log.dateReturned : 'TBD'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {log.items.map((item, idx) => (
                          <span key={idx} className="bg-emerald-50 text-emerald-900 text-[10px] px-2 py-0.5 rounded border border-emerald-200 font-bold">{item}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center flex justify-center gap-2">
                      <button onClick={() => handleStatusChange(log.id, "Approved")} className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded shadow-sm transition">
                        <FaPrint /> Approve & Print
                      </button>
                      <button onClick={() => handleStatusChange(log.id, "Denied")} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded flex items-center text-xs font-bold">
                        <FaTimes /> Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* ================= SECTION 2 & 3: CALENDAR & ACTIVE LIST ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* CALENDAR */}
        <section className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-full overflow-hidden">
          <div className="bg-gray-800 px-6 py-4 flex justify-between items-center text-white">
            <h2 className="text-lg font-bold flex items-center"><FaCalendarAlt className="mr-2"/> Equipment Calendar</h2>
            <div className="flex items-center gap-4">
              <button onClick={prevMonth} className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded font-bold transition">&lt;</button>
              <span className="text-lg font-bold w-40 text-center">{monthNames[calMonth]} {calYear}</span>
              <button onClick={nextMonth} className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded font-bold transition">&gt;</button>
            </div>
          </div>

          <div className="p-6 bg-gray-50 flex-1">
            <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-bold text-gray-500 uppercase">
              <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
            </div>

            <div className="grid grid-cols-7 gap-2">
              {blankDays.map(step => (
                <div key={`blank-${step}`} className="h-24 bg-transparent border border-transparent"></div>
              ))}

              {monthDays.map(day => {
                const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                
                const hasBorrowedToday = activeLogs.some(r => r.dateBorrowed === dateStr);
                
              
                const hasReturnTodayOrOverdue = activeLogs.some(r => {
                  if (!r.dateReturned) return false;
                  
                  const isExactReturnDate = r.dateReturned === dateStr;
                  const isOverdueAndToday = r.dateReturned < todayStr && dateStr === todayStr;
                  
                  return isExactReturnDate || isOverdueAndToday;
                });
                
                const isSelected = selectedDate === dateStr;

                return (
                  <div 
                    key={day} 
                    onClick={() => setSelectedDate(dateStr)}
                    className={`h-24 border rounded-lg p-2 flex flex-col justify-between cursor-pointer transition-all ${
                      isSelected ? 'border-blue-500 bg-blue-50 shadow-md ring-2 ring-blue-200' : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    <span className={`text-sm font-bold ${isSelected ? 'text-blue-700' : 'text-gray-700'}`}>{day}</span>
                    <div className="flex gap-1 justify-end">
                      {hasBorrowedToday && <div className="w-3 h-3 rounded-full bg-gray-400 shadow-sm" title="Equipment Borrowed"></div>}
                      {hasReturnTodayOrOverdue && <div className="w-3 h-3 rounded-full bg-green-500 shadow-sm" title="Equipment Return Due"></div>}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex gap-4 text-xs font-semibold text-gray-500 justify-end">
              <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-gray-400"></div> Date Borrowed</div>
              <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-green-500"></div> Expected Return</div>
            </div>
          </div>
        </section>

<section className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-full overflow-hidden">
  {/* Changed from emerald to gray */}
  <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
     <h2 className="text-lg font-bold text-gray-800">Selected Day Status</h2>
  </div>
          
          <div className="p-4 flex-1 overflow-y-auto bg-gray-50">
            <h3 className="font-bold text-gray-700 mb-4 border-b pb-2">Activity for {selectedDate}</h3>
            
            {todaysActiveBorrowers.length === 0 ? (
              <p className="text-gray-500 italic text-sm text-center mt-10">No equipment activity for this date.</p>
            ) : (
              <div className="space-y-4">
                {todaysActiveBorrowers.map(log => {
                  const isBorrowToday = log.dateBorrowed === selectedDate;
                  const isDueToday = log.dateReturned === selectedDate;
                  const isOverdue = log.dateReturned && log.dateReturned < selectedDate;

                  return (
                    <div key={log.id} className={`bg-white border p-4 rounded-lg shadow-sm ${isOverdue ? 'border-red-300 ring-1 ring-red-50' : 'border-gray-200'}`}>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="flex items-baseline gap-2">
                            <p className="font-bold text-gray-900 dark:!text-white text-sm m-0">
                              {log.borrowerName}
                            </p>
                            
                            {log.contact_number && (
                              <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                                {log.contact_number}
                              </span>
                            )}
                          </div>

                          <div className="flex gap-1 mt-1 flex-wrap">
                            {isBorrowToday && <span className="text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold px-2 py-0.5 rounded uppercase">Borrowed Today</span>}
                            {isDueToday && <span className="text-[10px] bg-green-100 dark:bg-green-900/60 text-green-700 dark:text-green-200 font-bold px-2 py-0.5 rounded uppercase animate-pulse">Return Due Today</span>}
                            {isOverdue && <span className="text-[10px] bg-red-100 dark:bg-red-900/60 text-red-700 dark:text-red-200 font-bold px-2 py-0.5 rounded uppercase animate-pulse">Overdue</span>}
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-xs text-gray-500 mb-3 line-clamp-2">{log.items.join(', ')}</p>

                      <button 
                        onClick={() => handleStatusChange(log.id, "Returned")}
                        className="w-full flex justify-center items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded text-sm font-bold transition shadow-sm"
                      >
                        <FaUndo /> Mark as Returned
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

      </div>
    </div>
  );
}