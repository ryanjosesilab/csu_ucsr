'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '../../../utils/supabase';
import { FaCheck, FaTimes, FaPrint, FaChevronDown, FaChevronUp, FaFileAlt, FaDownload } from 'react-icons/fa';
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
}

export default function DLCAdminPage() {
  const [requests, setRequests] = useState<DLCRequest[]>([]);
  const [expandedRows, setExpandedRows] = useState<Record<string | number, boolean>>({});

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
  const { data, error } = await supabase
    .from('dlc_request')
    .select('*')
    // Filter to ONLY show requests that are NOT archived
    .eq('is_archived', false) 
    .order('date_requested', { ascending: false });
    
  if (error) {
    console.error("DLC Admin Fetch Error:", error);
    return;
  }
  
  console.log("Active DLC Admin Data:", data);
  if (data) setRequests(data);
};


const archiveRequest = async (id: string) => {
  const { error } = await supabase
    .from('dlc_request')
    .update({ is_archived: true })
    .eq('id', id);

  if (error) {
    alert("Failed to archive request.");
  } else {
    // Refresh the list after successful archive
    fetchRequests();
  }
};

 const updateRequest = async (id: string | number, updates: any) => {
  const { error } = await supabase
    .from('dlc_request')
    .update(updates)
    .eq('id', id);

  if (!error) {
    // If we just archived it, remove it from the local list immediately
    if (updates.is_archived === true) {
      setRequests(prevRequests => prevRequests.filter(req => req.id !== id));
    } else {
      // Otherwise, just update the status (for Approve/Reject)
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

  const pendingRequests = requests.filter(r => 
    !r.status || r.status.toLowerCase().includes('pending')
  );
  const acceptedRequests = requests.filter(r => r.status === 'accepted');

  useEffect(() => {
  // 1. Fetch immediately when the page loads
  fetchRequests();


  const interval = setInterval(() => {
    console.log("Checking for new requests...");
    fetchRequests(); 
  }, 2000);

  // 3. Clear the interval when the component unmounts to prevent memory leaks
  return () => clearInterval(interval);
}, []);


const handleArchiveAll = async () => {
  // 1. Get the list of all currently visible IDs
  const dlcIds = requests.map(req => req.id);

  if (dlcIds.length === 0) {
    alert("No active requests to archive.");
    return;
  }

  if (confirm(`Are you sure? This will delete all ${dlcIds.length} current DLC requests.`)) {
    // 2. Perform the update on the dlc_request table
    const { error } = await supabase
      .from('dlc_request')
      .update({ is_archived: true })
      .in('id', dlcIds);

    if (!error) {
      // 3. Update the UI: clear the list of requests immediately
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
      <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        
        <div> <h1 className="text-3xl font-bold mb-2 text-gray-800">DLC Request Management </h1>
      <p className="text-gray-500 mb-8">Review and manage Drum and Lyre Corps event requests.</p></div>


        <div className="flex gap-3">
        <button 
      onClick={handleArchiveAll}
      className="bg-red-600 text-white px-4 py-2 rounded font-bold hover:bg-red-700 transition"
    >
      Delete all Requests
    </button>

    <Link href="/admin/dlc-archive">
  <button className="bg-purple-600 text-white px-4 py-2 rounded font-bold hover:bg-purple-700 transition">
    View Deleted Students
  </button>
</Link>
    </div>
       
      
      
      
      
      
      </div>


      
       

    

      
      

      {/* ================= PENDING TABLE ================= */}
      <h2 className="text-xl font-bold mb-4 text-yellow-600 flex items-center gap-2">
        <FaFileAlt /> Pending Requests ({pendingRequests.length})
      </h2>
      <div className="bg-white shadow-md rounded-lg mb-10 overflow-x-auto border-l-4 border-yellow-500">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
            <tr>
              <th className="p-4">Student & Contact</th>
              <th className="p-4">Event Details</th>
              <th className="p-4">Location</th>
              <th className="p-4">Performers Needed</th>
              <th className="p-4">Requestor Info & Remarks</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {pendingRequests.length === 0 && (
              <tr><td colSpan={6} className="p-6 text-center text-gray-500">No pending requests at this time.</td></tr>
            )}
            {pendingRequests.map(req => (
              <tr key={req.id} className="hover:bg-yellow-50 transition-colors">
                {/* 1. Student Info */}
                <td className="p-4">
                  <p className="font-bold text-gray-900">{req.student_name}</p>
                  <p className="text-xs text-gray-500">{req.contact_number}</p>
                  <p className="text-xs text-blue-600 mt-1">Requested: {req.date_requested}</p>
                </td>
                
                {/* 2. Event Info */}
                <td className="p-4">
                  <p className="font-semibold text-gray-800">{new Date(req.event_data_time).toLocaleString()}</p>
                  <p className="text-xs text-gray-600 italic mt-1 line-clamp-2 max-w-[200px]" title={req.purpose}>
                    "{req.purpose}"
                  </p>
                </td>

                {/* 3. Location */}
                <td className="p-4">
                  <span className="bg-gray-200 text-gray-800 px-2 py-1 rounded text-xs font-medium">
                    {req.location_type}
                  </span>
                  {req.location_others_specify && (
                    <p className="text-xs text-gray-500 mt-1">{req.location_others_specify}</p>
                  )}
                </td>

                {/* 4. Performers */}
                <td className="p-4">
                  <p className="text-xs text-gray-700"><strong>Instrumentalists:</strong> {req.num_instrumentalists}</p>
                  <p className="text-xs text-gray-700"><strong>Dancers:</strong> {req.num_dancers}</p>
                </td>

                {/* 5. Remarks */}
                <td className="p-4 max-w-[200px]">
                  <p className="text-xs font-semibold text-gray-800">Req. by: {req.requestor_name}</p>
                  <p className="text-[11px] text-gray-500 mt-1 truncate" title={req.other_requirements || 'None'}>
                    Other Requirements: {req.other_requirements || 'None'}
                  </p>
                </td>

                {/* 6. Actions */}
                <td className="p-4 align-middle">
                  <div className="flex justify-center gap-2">
                    <button 
                      onClick={() => updateRequest(req.id, { status: 'accepted' })} 
                      className="bg-green-100 text-green-700 p-2 rounded hover:bg-green-200 hover:text-green-800 transition"
                      title="Accept"
                    >
                      <FaCheck />
                    </button>
                    <button 
                      onClick={() => updateRequest(req.id, { status: 'rejected' })} 
                      className="bg-red-100 text-red-700 p-2 rounded hover:bg-red-200 hover:text-red-800 transition"
                      title="Reject"
                    >
                      <FaTimes />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>


      {/* ================= ACCEPTED TABLE ================= */}
      <h2 className="text-xl font-bold mb-4 text-green-600 flex items-center gap-2">
        <FaCheck /> Accepted Requests ({acceptedRequests.length})
      </h2>
      <div className="bg-white shadow-md rounded-lg overflow-hidden border-t-4 border-green-500">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
            <tr>
              <th className="p-4">Name</th>
              <th className="p-4">Contact</th>
              <th className="p-4">Date Requested</th>
              <th className="p-4">Event Date & Time</th>
              <th className="p-4">Purpose</th>
              <th className="p-4">Location</th>
              <th className="p-4 text-center">Form</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {acceptedRequests.length === 0 && (
              <tr><td colSpan={7} className="p-6 text-center text-gray-500">No accepted requests.</td></tr>
            )}
            
            {acceptedRequests.map(req => (
                                <React.Fragment key={req.id}>
                                  {/* SUMMARY ROW (Clickable) */}
                                  <tr 
                                    className={`cursor-pointer transition-colors ${expandedRows[req.id] ? 'bg-green-50' : 'hover:bg-gray-50'}`} 
                                    onClick={() => toggleExpand(req.id)}
                                  >
                                    <td className="p-4 font-bold text-gray-900">{req.student_name}</td>
                                    <td className="p-4 text-gray-600">{req.contact_number}</td>
                                    <td className="p-4 text-gray-600">{req.date_requested}</td>
                                    <td className="p-4 font-semibold text-gray-800">{new Date(req.event_data_time).toLocaleString()}</td>
                                    <td className="p-4 text-gray-600 truncate max-w-[150px]" title={req.purpose}>{req.purpose}</td>
                                    <td className="p-4 text-gray-600">
                    {req.location_type === 'Outside Campus' || req.location_type === 'Others' 
                      ? req.location_others_specify 
                      : req.location_type}
                  </td>
                  <td className="p-4 text-center text-gray-400">
                    {expandedRows[req.id] ? <FaChevronUp className="inline" /> : <FaChevronDown className="inline" />}
                  </td>
                </tr>

                {/* EXPANDED ROW (School Form Format) */}
                {/* EXPANDED ROW (PDF View) */}
                {expandedRows[req.id] && (
                  <tr className="bg-gray-50">
                    <td colSpan={7} className="p-0 border-b-2 border-green-200">
                      
                      <div className="m-6 p-6 bg-white border border-gray-300 shadow-sm max-w-5xl mx-auto rounded-lg">
                        
                        <h4 className="font-bold text-gray-700 mb-4 uppercase tracking-wider text-sm border-b pb-2">
                          Attached Document
                        </h4>

                        {/* PDF VIEWER */}
                        {/* PDF VIEWER */}
{req.pdf_url ? (
  <div className="w-full h-[600px] bg-gray-200 rounded border border-gray-300 overflow-hidden mb-6">
    <object 
      data={`${req.pdf_url}#toolbar=0`} 
      type="application/pdf" 
      className="w-full h-full"
    >
      {/* This message only shows if the browser completely blocks the PDF viewer */}
      <div className="flex flex-col items-center justify-center h-full text-gray-500 bg-gray-50 p-6 text-center">
        <p className="mb-2">Your browser cannot display this PDF directly.</p>
        <a 
          href={req.pdf_url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 underline hover:text-blue-800"
        >
          Click here to open the PDF in a new tab
        </a>
      </div>
    </object>
  </div>
) : (
  <div className="w-full h-32 bg-gray-50 flex items-center justify-center rounded border border-dashed border-gray-300 mb-6 text-gray-500 italic">
    No PDF document was attached to this request.
  </div>
)}

                        {/* ACTIONS FOOTER */}
                        <div className="flex justify-end gap-4">


                           {req.status === 'pending' && (
                                <>
                                  <button onClick={() => updateRequest(req.id, { status: 'Approved' })} className="btn btn-sm btn-success">Approve</button>
                                  <button onClick={() => updateRequest(req.id, { status: 'Rejected' })} className="btn btn-sm btn-danger">Reject</button>
                                </>
                              )}

                              
                              <button 
                                onClick={() => updateRequest(req.id, { is_archived: true })} 
                                className="btn btn-sm btn-outline-secondary"
                                title="Move to Archive"
                              >
                                Delete
                              </button>
                          
                          {/* Only show Download button if a PDF actually exists */}
                          {req.pdf_url && (
                            <a 
                              href={req.pdf_url}
                              download
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()} // Prevents row from collapsing
                              className="flex items-center gap-2 bg-red-600 text-white font-sans px-6 py-2 rounded shadow hover:bg-red-700 transition"
                            >
                              <FaDownload /> Download PDF
                            </a>
                          )}

                         

                             
                                                      

                          <button 
                            onClick={(e) => {
                              e.stopPropagation(); 
                              window.open(`/print-dlc/${req.id}`, '_blank');
                            }}
                            className="flex items-center gap-2 bg-gray-900 text-white font-sans px-6 py-2 rounded shadow hover:bg-gray-800 transition"
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