'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '../../../utils/supabase'; // Adjust path if needed
import { FaCheck, FaChevronDown, FaChevronUp, FaDownload, FaSearch, FaArchive, FaArrowLeft } from 'react-icons/fa';
import Link from 'next/dist/client/link';

interface DLCRequest {
  id: string | number;
  student_name: string;
  contact_number: string;
  purpose: string;
  event_data_time: string;
  date_requested: string;
  location_type: string;
  location_others_specify: string | null;
  num_instrumentalists: number;
  num_dancers: number;
  other_requirements: string | null;
  requestor_name: string;
  status: 'pending' | 'accepted' | 'rejected';
  pdf_url?: string;
  is_archived: boolean;
  request_number: number | null;
  created_at: string;
}

export default function PrintedHistoryPage() {
  const [requests, setRequests] = useState<DLCRequest[]>([]);
  const [expandedRows, setExpandedRows] = useState<Record<string | number, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 5000); // Auto-refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchRequests = async () => {
    const { data, error } = await supabase
      .from('dlc_request')
      .select('*')
      .eq('is_archived', false)
      .not('request_number', 'is', null)
      .order('request_number', { ascending: false }); 
      
    if (error) {
      console.error("DLC Admin Fetch Error:", error);
      return;
    }
    
    // FIX: Add 'as DLCRequest[]' to satisfy TypeScript
    if (data) setRequests(data as DLCRequest[]);
  };

  const updateRequest = async (id: string | number, updates: any) => {
    const { error } = await supabase
      .from('dlc_request')
      .update(updates)
      .eq('id', id);

    if (!error) {
      if (updates.is_archived === true) {
        setRequests(prev => prev.filter(req => req.id !== id));
      } else {
        setRequests(prev => prev.map(req => req.id === id ? { ...req, ...updates } : req));
      }
    } else {
      alert("Error updating request.");
      console.error(error);
    }
  };

  const toggleExpand = (id: string | number) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleArchiveAll = async () => {
    const dlcIds = requests.map(req => req.id);

    if (dlcIds.length === 0) {
      alert("No printed requests to archive.");
      return;
    }

    if (confirm(`Are you sure? This will move all ${dlcIds.length} printed forms into the Archive Bin.`)) {
      const { error } = await supabase
        .from('dlc_request')
        .update({ is_archived: true })
        .in('id', dlcIds);

      if (!error) {
        setRequests([]); 
        alert("All printed forms have been moved to the archive.");
      } else {
        alert("Error archiving requests.");
        console.error(error);
      }
    }
  };

  // Helper function to format the Request Number exactly like the printed form (e.g., "2026 - 04")
  const formatRequestNo = (req: DLCRequest) => {
    if (!req.request_number) return 'N/A';
    const year = new Date(req.created_at).getFullYear();
    const paddedNumber = String(req.request_number).padStart(2, '0');
    return `${year} - ${paddedNumber}`;
  };

  // Filter requests based on the search query (searching by Request No. or Student Name)
  const filteredRequests = requests.filter(req => {
    const requestNoString = formatRequestNo(req).toLowerCase();
    const nameString = req.student_name?.toLowerCase() || '';
    const query = searchQuery.toLowerCase();
    
    return requestNoString.includes(query) || nameString.includes(query);
  });

  return (
    <div className="space-y-6">
      
      {/* HEADER */}
      <div className="flex justify-between items-center bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <Link href="/admin/dlc" className="p-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full transition">
            <FaArrowLeft />
          </Link>
          
          <div> 
            <h1 className="text-3xl font-bold mb-1 text-gray-800">History of Printed Forms</h1>
            <p className="text-gray-500 text-sm">View and manage DLC requests that have been officially printed.</p>
          </div>
        </div>
        
        {/* NEW: Buttons Container */}
        <div className="flex gap-3">
          <button 
            onClick={handleArchiveAll}
            className="flex items-center gap-2 bg-red-600 text-white font-bold px-4 py-2 rounded hover:bg-red-700 transition shadow-sm"
          >
            <FaArchive /> Delete ALL
          </button>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center gap-4">
        <FaSearch className="text-gray-400 text-lg ml-2" />
        <input 
          type="text" 
          placeholder="Search by Request No. (e.g., 2026 - 01) or Name..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 p-2 border-none outline-none text-gray-700 bg-transparent font-medium"
        />
        {searchQuery && (
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
            Found {filteredRequests.length} results
          </span>
        )}
      </div>

      {/* TABLE */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden border-t-4 border-blue-500">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
            <tr>
              <th className="p-4">Request No.</th>
              <th className="p-4">Requestor Name</th>
              <th className="p-4">Event Date & Time</th>
              <th className="p-4">Purpose</th>
              <th className="p-4 text-center">Form Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredRequests.length === 0 && (
              <tr><td colSpan={5} className="p-8 text-center text-gray-500 font-medium">No printed forms match your search.</td></tr>
            )}
            
            {filteredRequests.map(req => (
              <React.Fragment key={req.id}>
                
                {/* SUMMARY ROW */}
                <tr 
                  className={`cursor-pointer transition-colors ${expandedRows[req.id] ? 'bg-blue-50' : 'hover:bg-gray-50'}`} 
                  onClick={() => toggleExpand(req.id)}
                >
                  <td className="p-4 font-bold text-blue-700 text-base">{formatRequestNo(req)}</td>
                  <td className="p-4 font-semibold text-gray-900">{req.student_name}</td>
                  <td className="p-4 font-medium text-gray-800">{new Date(req.event_data_time).toLocaleString()}</td>
                  <td className="p-4 text-gray-600 truncate max-w-[200px]" title={req.purpose}>{req.purpose}</td>
                  <td className="p-4 text-center text-gray-400">
                    {expandedRows[req.id] ? <FaChevronUp className="inline" /> : <FaChevronDown className="inline" />}
                  </td>
                </tr>

                {/* EXPANDED ROW (PDF & Actions) */}
                {expandedRows[req.id] && (
                  <tr className="bg-gray-50">
                    <td colSpan={5} className="p-0 border-b-2 border-blue-200">
                      <div className="m-6 p-6 bg-white border border-gray-300 shadow-sm max-w-5xl mx-auto rounded-lg">
                        
                        <h4 className="font-bold text-gray-700 mb-4 uppercase tracking-wider text-sm border-b pb-2">
                          Attached Document
                        </h4>

                        {/* PDF VIEWER */}
                        {req.pdf_url ? (
                          <div className="w-full h-[600px] bg-gray-200 rounded border border-gray-300 overflow-hidden mb-6">
                            <object data={`${req.pdf_url}#toolbar=0`} type="application/pdf" className="w-full h-full">
                              <div className="flex flex-col items-center justify-center h-full text-gray-500 bg-gray-50 p-6 text-center">
                                <p className="mb-2">Your browser cannot display this PDF directly.</p>
                                <a href={req.pdf_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800">
                                  Click here to open the PDF in a new tab
                                </a>
                              </div>
                            </object>
                          </div>
                        ) : (
                          <div className="w-full h-32 bg-gray-50 flex items-center justify-center rounded border border-dashed border-gray-300 mb-6 text-gray-500 italic">
                            No PDF document was attached by the student.
                          </div>
                        )}

                        {/* ACTIONS FOOTER */}
                        <div className="flex justify-end gap-4 border-t pt-4">
                          
                          <button 
                            onClick={(e) => {
                              e.stopPropagation(); 
                              window.open(`/print-dlc/${req.id}`, '_blank');
                            }}
                            className="flex items-center gap-2 bg-gray-900 text-white font-semibold px-5 py-2 rounded shadow hover:bg-gray-800 transition"
                          >
                            Reprint Official Form
                          </button>

                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm('Are you sure you want to move this printed record to the archive?')) {
                                updateRequest(req.id, { is_archived: true });
                              }
                            }} 
                            className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 font-semibold px-5 py-2 rounded shadow-sm hover:bg-gray-100 transition"
                            title="Move to Archive"
                          >
                            <FaArchive className="text-gray-400" /> Move to Archive
                          </button>
                        
                          {req.pdf_url && (
                            <a 
                              href={req.pdf_url} download target="_blank" rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()} 
                              className="flex items-center gap-2 bg-red-600 text-white font-semibold px-5 py-2 rounded shadow hover:bg-red-700 transition"
                            >
                              <FaDownload /> Download Attachment
                            </a>
                          )}

                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}