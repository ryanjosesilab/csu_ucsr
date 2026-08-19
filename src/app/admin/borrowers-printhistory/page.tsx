"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "../../../utils/supabase";
import { FaHistory, FaSearch, FaUndo, FaDownload, FaArrowLeft, FaFilter } from "react-icons/fa"; // Swapped FaTrash for FaUndo
import Link from "next/dist/client/link";

type InventoryLog = {
  id: string;
  borrowerName: string;
  phone: string;
  purpose: string;
  dateBorrowed: string;
  dateReturned: string | null;
  items: string[];
  status: string; 
};

type BorrowingRow = {
  id?: number | string;
  borrower_name?: string | null;
  contact_number?: string | null;
  purpose?: string | null;
  date_borrowed?: string | null;
  date_return?: string | null;
  items_list?: Array<string | { equipmentName?: string; name?: string }> | string | null;
  status?: string | null;
};

export default function EquipmentHistoryPage() {
  const [logs, setLogs] = useState<InventoryLog[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtering States
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [yearFilter, setYearFilter] = useState("All");

  const fetchHistoryLogs = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("equipment_borrowings")
      .select("*")
      .in('status', ['Returned', 'Denied', 'Approved', 'returned', 'denied', 'approved'])
      .order('date_borrowed', { ascending: false }); // Newest history first

    if (error) {
      console.error("SUPABASE FETCH ERROR:", error.message);
      alert(`Database Error: ${error?.message}`);
      setLoading(false);
      return;
    }

    const mappedLogs: InventoryLog[] = (data || []).map((entry: BorrowingRow) => {
      const items = Array.isArray(entry.items_list)
        ? entry.items_list.map((item) => typeof item === "string" ? item : item?.equipmentName || item?.name || "Item")
        : typeof entry.items_list === "string" ? [entry.items_list] : [];

      return {
        id: String(entry.id),
        borrowerName: entry.borrower_name || "Unknown",
        phone: entry.contact_number || "",
        purpose: entry.purpose || "",
        dateBorrowed: entry.date_borrowed || "",
        dateReturned: entry.date_return || "N/A",
        items,
        status: (entry.status || "").replace(/['"]+/g, '').trim(),
      };
    });

    setLogs(mappedLogs);
    setLoading(false);
  };

  useEffect(() => {
    fetchHistoryLogs();
  }, []);

  // NEW: handleRetrieve function
  const handleRetrieve = async (id: string) => {
    if (!confirm("Are you sure you want to move this record back to Pending Requests?")) return;

    const { error } = await supabase
      .from("equipment_borrowings")
      .update({ status: 'Pending' }) // Changes status back to Pending
      .eq("id", id);

    if (error) {
      console.error("Error retrieving record:", error);
      alert("Failed to retrieve record.");
    } else {
      // Remove it from the history list since it is now Pending again
      setLogs(prev => prev.filter(log => log.id !== id));
    }
  };

  
  const availableYears = Array.from(new Set(logs.map(log => {
    if (!log.dateBorrowed) return "";
    return log.dateBorrowed.split("-")[0]; 
  }))).filter(Boolean).sort((a, b) => Number(b) - Number(a));

  const filteredLogs = logs.filter(log => {
    // 1. Search Query
    const matchesSearch = log.borrowerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          log.purpose.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          log.dateBorrowed.includes(searchQuery);

    const matchesStatus = statusFilter === "All" || log.status.toLowerCase() === statusFilter.toLowerCase();
    
    const logYear = log.dateBorrowed ? log.dateBorrowed.split("-")[0] : "";
    const matchesYear = yearFilter === "All" || logYear === yearFilter;

    return matchesSearch && matchesStatus && matchesYear;
  });

  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'returned') return "bg-emerald-100 text-emerald-800";
    if (s === 'approved') return "bg-blue-100 text-blue-800";
    return "bg-rose-100 text-rose-800"; // Denied
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* HEADER */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/borrowers" className="p-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full transition">
            <FaArrowLeft />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Equipment History Log</h1>
            <p className="text-sm text-gray-500 mt-1">Archive of all equipment requests.</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex flex-col lg:flex-row items-center gap-3">
          
          <div className="flex items-center gap-3 flex-1 w-full bg-white px-3 py-2.5 border border-gray-200 rounded-lg focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition shadow-sm">
            <FaSearch className="text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by borrower name, purpose, or date..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-none outline-none text-sm text-gray-700 placeholder-gray-400"
            />
          </div>

          <div className="flex items-center gap-2 w-full lg:w-auto">
            <FaFilter className="text-gray-400 ml-1 hidden lg:block" />
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 outline-none cursor-pointer shadow-sm flex-1 lg:flex-none lg:w-40"
            >
              <option value="All">All Statuses</option>
              <option value="Approved">Approved</option>
              <option value="Returned">Returned</option>
              <option value="Denied">Denied</option>
            </select>

            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="bg-white border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 outline-none cursor-pointer shadow-sm flex-1 lg:flex-none lg:w-32"
            >
              <option value="All">All Years</option>
              {availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-gray-500 font-medium">Loading history...</div>
          ) : filteredLogs.length === 0 ? (
            <div className="p-12 text-center text-gray-500 font-medium flex flex-col items-center">
              <FaHistory className="text-4xl text-gray-300 mb-3" />
              <p>No history records match your filters.</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Borrower Details</th>
                  <th className="px-6 py-4">Event / Purpose</th>
                  <th className="px-6 py-4">Timeline</th>
                  <th className="px-6 py-4">Equipment</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition">
                    
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{log.borrowerName}</div>
                      <div className="text-xs text-gray-500">{log.phone}</div>
                    </td>
                    
                    <td className="px-6 py-4 max-w-[200px] truncate" title={log.purpose}>
                      {log.purpose}
                    </td>
                    
                    <td className="px-6 py-4 text-xs">
                      <div className="text-gray-500 font-medium">Out: <span className="text-gray-900">{log.dateBorrowed}</span></div>
                      {log.status.toLowerCase() === "returned" && (
                        <div className="text-emerald-600 font-medium mt-1">In: {log.dateReturned}</div>
                      )}
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 max-w-[250px]">
                        {log.items.map((item, idx) => (
                          <span key={idx} className="bg-gray-100 text-gray-700 text-[10px] px-2 py-0.5 rounded border border-gray-200 font-bold">
                            {item}
                          </span>
                        ))}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2.5 py-1 inline-flex text-[11px] leading-5 font-bold rounded-full capitalize ${getStatusColor(log.status)}`}>
                        {log.status}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 text-center">
                     <button 
  onClick={() => handleRetrieve(log.id)}
  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-700 dark:hover:text-blue-400 rounded transition mx-auto block"
  title="Retrieve to Pending"
>
  <FaUndo />
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