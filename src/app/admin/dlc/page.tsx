'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '../../../utils/supabase';
import { FaCheck, FaTimes, FaPrint, FaChevronDown, FaChevronUp, FaFileAlt, FaDownload, FaFolderOpen, FaBookmark, FaRegBookmark } from 'react-icons/fa';
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
  status: 'pending' | 'rejected' | string;
  is_bookmarked?: boolean;
  pdf_url?: string;
}

export default function DLCAdminPage() {
  const [requests, setRequests] = useState<DLCRequest[]>([]);
  const [expandedRows, setExpandedRows] = useState<Record<string | number, boolean>>({});

  const fetchRequests = async () => {
    const { data, error } = await supabase
      .from('dlc_request')
      .select('*')
      .eq('is_archived', false) 
      .is('request_number', null)
      .order('date_requested', { ascending: false });
      
    if (error) {
      console.error("DLC Admin Fetch Error:", error);
      return;
    }
    
    if (data) setRequests(data as DLCRequest[]);
  };

  const updateRequest = async (id: string | number, updates: any) => {
    const { error } = await supabase
      .from('dlc_request')
      .update(updates)
      .eq('id', id);

    if (!error) {
      if (updates.is_archived === true) {
        setRequests(prevRequests => prevRequests.filter(req => req.id !== id));
      } else {
        setRequests(prevRequests => 
          prevRequests.map(req => req.id === id ? { ...req, ...updates } : req)
        );
      }
    } else {
      alert("Error updating request.");
      console.error(error);
    }
  };

  const toggleExpand = (id: string | number) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Band Requests (All active, unprinted requests)
  const bandRequests = requests; 
  
  // Bookmarked Requests
  const bookmarkedRequests = requests.filter(r => r.is_bookmarked);

  useEffect(() => {
    fetchRequests();

    const dlcChannel = supabase
      .channel('realtime-dlc-requests')
      .on(
        'postgres_changes',
        {
          event: '*', 
          schema: 'public',
          table: 'dlc_request'
        },
        () => {
          console.log("Real-time update detected, refetching...");
          fetchRequests(); 
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(dlcChannel);
    };
  }, []);

  const handleArchiveAll = async () => {
    const dlcIds = requests.map(req => req.id);

    if (dlcIds.length === 0) {
      alert("No active requests to archive.");
      return;
    }

    if (confirm(`Are you sure? This will delete all ${dlcIds.length} current DLC requests.`)) {
      const { error } = await supabase
        .from('dlc_request')
        .update({ is_archived: true })
        .in('id', dlcIds);

      if (!error) {
        setRequests([]); 
        alert("All requests have been deleted.");
      } else {
        alert("Error archiving all requests.");
        console.error(error);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden flex justify-between items-center mb-8 bg-[#0F4E15] p-6 rounded-lg shadow-md border border-white/10">
        <div 
          className="absolute inset-y-0 right-0 w-1/2 lg:w-[60%] bg-cover bg-center z-0"
          style={{ backgroundImage: "url('/try-header.png')" }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#0F4E15] via-[#0F4E15]/80 to-transparent"></div>
        </div>

        <div className="relative z-10"> 
          <h1 className="text-3xl font-bold mb-2 text-white">DLC Request Management</h1>
          <p className="text-white/80">Review and manage Drum and Lyre Corps event requests.</p>
        </div>

        <div className="flex gap-3 relative z-10">
          <Link href="/admin/dlc-printhistory">
            <button 
              className="bg-blue-600 text-white p-3 rounded hover:bg-blue-700 transition shadow-sm flex items-center justify-center"
              title="View Printed Forms History"
            >
              <FaFileAlt className="text-lg" />
            </button>
          </Link>

          <button 
            onClick={handleArchiveAll}
            className="bg-red-600 text-white px-4 py-2 rounded font-bold hover:bg-red-700 transition shadow-sm"
          >
            Delete ALL
          </button>

          <Link href="/admin/dlc-archive">
            <button 
              className="bg-purple-600 text-white p-3 rounded hover:bg-purple-700 transition shadow-sm flex items-center justify-center"
              title="View DLC Archive"
            >
              <FaFolderOpen className="text-lg" />
            </button>
          </Link>
        </div>
      </div>

      {/* ================= BAND REQUESTS TABLE ================= */}
      <h2 className="text-xl font-bold mb-4 text-yellow-600 flex items-center gap-2">
        <FaFileAlt /> Band Requests ({bandRequests.length})
      </h2>
      <div className="bg-white shadow-md rounded-lg mb-10 overflow-x-auto border-l-4 border-yellow-500">
        <table className="w-full text-sm text-left text-gray-800">
          <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
            <tr>
              <th className="p-4">Name & Contact</th>
              <th className="p-4">Event Details</th>
              <th className="p-4">Location</th>
              <th className="p-4">Performers Needed</th>
              <th className="p-4">Requestor Info & Remarks</th>
              <th className="p-4 text-center">Bookmark</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {bandRequests.length === 0 && (
              <tr><td colSpan={7} className="p-6 text-center text-gray-500">No band requests at this time.</td></tr>
            )}
            {bandRequests.map(req => (
              <React.Fragment key={req.id}>
                <tr className="hover:bg-yellow-50 transition-colors text-gray-900">
                  <td className="p-4">
                    <p className="font-bold text-gray-900">{req.student_name}</p>
                    <p className="text-xs text-gray-600">{req.contact_number}</p>
                    <p className="text-xs text-blue-600 mt-1">Requested: {req.date_requested}</p>
                  </td>
                  
                  <td className="p-4">
                    <p className="font-semibold text-gray-950 dark:text-white">{new Date(req.event_data_time).toLocaleString()}</p>
                    <p className="text-xs text-gray-700 italic mt-1 line-clamp-2 max-w-[200px]" title={req.purpose}>
                      "{req.purpose}"
                    </p>
                  </td>

                  <td className="p-4">
                    <span className="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-2 py-1 rounded text-xs font-medium">
                      {req.location_type}
                    </span>
                    {req.location_others_specify && (
                      <p className="text-xs text-gray-700 mt-1">{req.location_others_specify}</p>
                    )}
                  </td>

                  <td className="p-4">
                    <p className="text-xs text-gray-900"><strong>Instrumentalists:</strong> {req.num_instrumentalists}</p>
                    <p className="text-xs text-gray-900"><strong>Dancers:</strong> {req.num_dancers}</p>
                  </td>

                  <td className="p-4 max-w-[200px]">
                    
                    <p className="text-[11px] text-gray-700 mt-1 truncate" title={req.other_requirements || 'None'}>
                      Other Requirements: {req.other_requirements || 'None'}
                    </p>
                  </td>

                  {/* Bookmark Toggle Action */}
                  <td className="p-4 text-center align-middle">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        updateRequest(req.id, { is_bookmarked: !req.is_bookmarked });
                      }}
                      className="text-amber-500 hover:text-amber-600 p-2 transition text-lg"
                      title={req.is_bookmarked ? "Remove Bookmark" : "Bookmark Request"}
                    >
                      {req.is_bookmarked ? <FaBookmark /> : <FaRegBookmark />}
                    </button>
                  </td>

                  <td className="p-4 align-middle text-center">
                    <button 
                      onClick={() => toggleExpand(req.id)}
                      className="bg-gray-100 text-gray-700 hover:bg-gray-200 px-3 py-1.5 rounded text-xs font-bold transition flex items-center gap-1 mx-auto"
                    >
                      {expandedRows[req.id] ? 'Hide Details' : 'View Details'} {expandedRows[req.id] ? <FaChevronUp /> : <FaChevronDown />}
                    </button>
                  </td>
                </tr>

                {/* EXPANDED ROW (Details & Preview) */}
                {expandedRows[req.id] && (
                  <tr className="bg-gray-50">
                    <td colSpan={7} className="p-0 border-b-2 border-yellow-200">
                      <div className="m-6 p-6 bg-white border border-gray-300 shadow-sm max-w-5xl mx-auto rounded-lg text-gray-900">
                        <h4 className="font-bold text-gray-800 mb-4 uppercase tracking-wider text-sm border-b pb-2">
                          Attached Document & Details
                        </h4>

                        {/* PDF / Document VIEWER */}
                        {req.pdf_url ? (
                          <div className="w-full h-[600px] bg-gray-200 rounded border border-gray-300 overflow-hidden mb-6">
                            <object 
                              data={`${req.pdf_url}#toolbar=0`} 
                              type="application/pdf" 
                              className="w-full h-full"
                            >
                              <div className="flex flex-col items-center justify-center h-full text-gray-700 bg-gray-50 p-6 text-center">
                                <p className="mb-2">Your browser cannot display this document directly.</p>
                                <a 
                                  href={req.pdf_url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-600 underline hover:text-blue-800"
                                >
                                  Click here to open the file in a new tab
                                </a>
                              </div>
                            </object>
                          </div>
                        ) : (
                          <div className="w-full h-32 bg-gray-50 flex items-center justify-center rounded border border-dashed border-gray-300 mb-6 text-gray-500 italic">
                            No document was attached to this request.
                          </div>
                        )}

                        <div className="flex justify-end gap-4">
                         <button 
  onClick={() => updateRequest(req.id, { is_archived: true })} 
  className="bg-red-100 dark:bg-red-700/90 text-red-700 dark:text-red-100 hover:bg-red-200 dark:hover:bg-red-600 px-4 py-2 rounded text-sm font-bold transition border border-red-200 dark:border-red-600 shadow-sm"
  title="Move to Archive"
>
  Delete
</button>
                      
                          {req.pdf_url && (
                            <a 
                              href={req.pdf_url}
                              download
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-center gap-2 bg-red-600 text-white font-sans px-6 py-2 rounded shadow hover:bg-red-700 transition text-sm font-bold"
                            >
                              <FaDownload /> Download Document
                            </a>
                          )}

                          <button 
                            onClick={(e) => {
                              e.stopPropagation(); 
                              window.open(`/print-dlc/${req.id}`, '_blank');
                              updateRequest(req.id, { is_archived: true });
                            }}
                            className="flex items-center gap-2 bg-gray-900 text-white font-sans px-6 py-2 rounded shadow hover:bg-gray-800 transition text-sm font-bold"
                          >
                            <FaPrint /> Print Official Form
                          </button>
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

      {/* ================= BOOKMARKS TABLE ================= */}
      <h2 className="text-xl font-bold mb-4 text-amber-600 flex items-center gap-2">
        <FaBookmark /> Bookmarked Requests ({bookmarkedRequests.length})
      </h2>
      <div className="bg-white shadow-md rounded-lg overflow-x-auto border-t-4 border-amber-500">
        <table className="w-full text-sm text-left text-gray-800">
          <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
            <tr>
              <th className="p-4">Name</th>
              <th className="p-4">Contact</th>
              <th className="p-4">Date Requested</th>
              <th className="p-4">Event Date & Time</th>
              <th className="p-4">Purpose</th>
              <th className="p-4">Location</th>
              <th className="p-4 text-center">Unbookmark</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {bookmarkedRequests.length === 0 && (
              <tr><td colSpan={8} className="p-6 text-center text-gray-500">No bookmarked requests.</td></tr>
            )}
            
            {bookmarkedRequests.map(req => (
              <React.Fragment key={req.id}>
                <tr className="hover:bg-amber-50 transition-colors text-gray-900">
                  <td className="p-4 font-bold text-gray-900">{req.student_name}</td>
                  <td className="p-4 text-gray-800">{req.contact_number}</td>
                  <td className="p-4 text-gray-800">{req.date_requested}</td>
                  <td className="p-4 font-semibold text-gray-950">{new Date(req.event_data_time).toLocaleString()}</td>
                  <td className="p-4 text-gray-800 truncate max-w-[150px]" title={req.purpose}>{req.purpose}</td>
                  <td className="p-4 text-gray-800">
                    {req.location_type === 'Outside Campus' || req.location_type === 'Others' 
                      ? req.location_others_specify 
                      : req.location_type}
                  </td>
                  <td className="p-4 text-center align-middle">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        updateRequest(req.id, { is_bookmarked: false });
                      }}
                      className="text-amber-500 hover:text-amber-600 p-2 transition text-lg"
                      title="Remove Bookmark"
                    >
                      <FaBookmark />
                    </button>
                  </td>
                  <td className="p-4 text-center align-middle">
                    <button 
                      onClick={() => toggleExpand(req.id)}
                      className="bg-gray-100 text-gray-700 hover:bg-gray-200 px-3 py-1.5 rounded text-xs font-bold transition flex items-center gap-1 mx-auto"
                    >
                      {expandedRows[req.id] ? 'Hide Details' : 'View Details'} {expandedRows[req.id] ? <FaChevronUp /> : <FaChevronDown />}
                    </button>
                  </td>
                </tr>

                {/* EXPANDED ROW (Bookmarks Details & Preview) */}
                {expandedRows[req.id] && (
                  <tr className="bg-gray-50">
                    <td colSpan={8} className="p-0 border-b-2 border-amber-200">
                      <div className="m-6 p-6 bg-white border border-gray-300 shadow-sm max-w-5xl mx-auto rounded-lg text-gray-900">
                        <h4 className="font-bold text-gray-800 mb-4 uppercase tracking-wider text-sm border-b pb-2">
                          Attached Document & Details
                        </h4>

                        {/* PDF / Document VIEWER */}
                        {req.pdf_url ? (
                          <div className="w-full h-[600px] bg-gray-200 rounded border border-gray-300 overflow-hidden mb-6">
                            <object 
                              data={`${req.pdf_url}#toolbar=0`} 
                              type="application/pdf" 
                              className="w-full h-full"
                            >
                              <div className="flex flex-col items-center justify-center h-full text-gray-700 bg-gray-50 p-6 text-center">
                                <p className="mb-2">Your browser cannot display this document directly.</p>
                                <a 
                                  href={req.pdf_url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-600 underline hover:text-blue-800"
                                >
                                  Click here to open the file in a new tab
                                </a>
                              </div>
                            </object>
                          </div>
                        ) : (
                          <div className="w-full h-32 bg-gray-50 flex items-center justify-center rounded border border-dashed border-gray-300 mb-6 text-gray-500 italic">
                            No document was attached to this request.
                          </div>
                        )}

                        <div className="flex justify-end gap-4">
                          <button 
                            onClick={() => updateRequest(req.id, { is_archived: true })} 
                            className="bg-red-100 text-red-700 px-4 py-2 rounded text-sm font-bold hover:bg-red-200 transition"
                            title="Move to Archive"
                          >
                            Delete
                          </button>
                      
                          {req.pdf_url && (
                            <a 
                              href={req.pdf_url}
                              download
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-center gap-2 bg-red-600 text-white font-sans px-6 py-2 rounded shadow hover:bg-red-700 transition text-sm font-bold"
                            >
                              <FaDownload /> Download Document
                            </a>
                          )}

                          <button 
                            onClick={(e) => {
                              e.stopPropagation(); 
                              window.open(`/print-dlc/${req.id}`, '_blank');
                              updateRequest(req.id, { is_archived: true });
                            }}
                            className="flex items-center gap-2 bg-gray-900 text-white font-sans px-6 py-2 rounded shadow hover:bg-gray-800 transition text-sm font-bold"
                          >
                            <FaPrint /> Print Official Form
                          </button>
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