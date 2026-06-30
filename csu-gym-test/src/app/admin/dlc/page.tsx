'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '../../../utils/supabase';
import { FaCheck, FaTimes, FaPrint, FaChevronDown, FaChevronUp, FaFileAlt } from 'react-icons/fa';

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
}

export default function DLCAdminPage() {
  const [requests, setRequests] = useState<DLCRequest[]>([]);
  const [expandedRows, setExpandedRows] = useState<Record<string | number, boolean>>({});

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    const { data, error } = await supabase.from('dlc_request').select('*').order('date_requested', { ascending: false });
    
    console.log("DLC Admin Data:", data);
    console.log("DLC Admin Error:", error);
    
    if (data) setRequests(data);
  };

  const handleStatusChange = async (id: string | number, status: 'accepted' | 'rejected') => {
    const { error } = await supabase.from('dlc_request').update({ status }).eq('id', id);
    if (!error) {
      // Optimistic UI update
      setRequests(requests.map(req => req.id === id ? { ...req, status } : req));
    } else {
      alert("Error updating status.");
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

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-2 text-gray-800">DLC Request Management</h1>
      <p className="text-gray-500 mb-8">Review and manage Drum and Lyre Corps event requests.</p>

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
                    Reqs: {req.other_requirements || 'None'}
                  </p>
                </td>

                {/* 6. Actions */}
                <td className="p-4 align-middle">
                  <div className="flex justify-center gap-2">
                    <button 
                      onClick={() => handleStatusChange(req.id, 'accepted')} 
                      className="bg-green-100 text-green-700 p-2 rounded hover:bg-green-200 hover:text-green-800 transition"
                      title="Accept"
                    >
                      <FaCheck />
                    </button>
                    <button 
                      onClick={() => handleStatusChange(req.id, 'rejected')} 
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
                    {req.location_type === 'Others' ? req.location_others_specify : req.location_type}
                  </td>
                  <td className="p-4 text-center text-gray-400">
                    {expandedRows[req.id] ? <FaChevronUp className="inline" /> : <FaChevronDown className="inline" />}
                  </td>
                </tr>

                {/* EXPANDED ROW (School Form Format) */}
                {expandedRows[req.id] && (
                  <tr className="bg-gray-50">
                    <td colSpan={7} className="p-0 border-b-2 border-green-200">
                      
                      {/* FORM PREVIEW CONTAINER */}
                      <div className="m-6 p-8 bg-white border-2 border-gray-800 shadow-sm max-w-4xl mx-auto relative font-serif text-gray-900">
                        
                        {/* Header */}
                        <div className="text-center mb-8 border-b-2 border-gray-800 pb-4">
                          <h3 className="font-bold text-xl uppercase tracking-wider">University Center for Sports and Recreation</h3>
                          <h4 className="font-semibold text-lg mt-1">Drum and Lyre Corps Request Form</h4>
                          <span className="absolute top-8 right-8 bg-green-100 text-green-800 text-xs font-bold px-3 py-1 border border-green-800 uppercase tracking-widest">
                            Approved
                          </span>
                        </div>

                        {/* Form Body - Grid Layout */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                          
                          {/* Left Column */}
                          <div className="space-y-4">
                            <div>
                              <span className="text-xs font-bold text-gray-500 uppercase block mb-1">Name of Student</span>
                              <div className="border-b border-gray-400 pb-1 font-semibold">{req.student_name}</div>
                            </div>
                            <div>
                              <span className="text-xs font-bold text-gray-500 uppercase block mb-1">Contact Number</span>
                              <div className="border-b border-gray-400 pb-1">{req.contact_number}</div>
                            </div>
                            <div>
                              <span className="text-xs font-bold text-gray-500 uppercase block mb-1">Date Requested</span>
                              <div className="border-b border-gray-400 pb-1">{req.date_requested}</div>
                            </div>
                            <div>
                              <span className="text-xs font-bold text-gray-500 uppercase block mb-1">Name of Requestor</span>
                              <div className="border-b border-gray-400 pb-1 font-semibold">{req.requestor_name}</div>
                            </div>
                          </div>

                          {/* Right Column */}
                          <div className="space-y-4">
                            <div>
                              <span className="text-xs font-bold text-gray-500 uppercase block mb-1">Event Date & Time</span>
                              <div className="border-b border-gray-400 pb-1 font-semibold">{new Date(req.event_data_time).toLocaleString()}</div>
                            </div>
                            <div>
                              <span className="text-xs font-bold text-gray-500 uppercase block mb-1">Event Location</span>
                              <div className="border-b border-gray-400 pb-1">
                                {req.location_type} {req.location_others_specify ? `(${req.location_others_specify})` : ''}
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <span className="text-xs font-bold text-gray-500 uppercase block mb-1">Instrumentalists</span>
                                <div className="border-b border-gray-400 pb-1">{req.num_instrumentalists}</div>
                              </div>
                              <div>
                                <span className="text-xs font-bold text-gray-500 uppercase block mb-1">Dancers</span>
                                <div className="border-b border-gray-400 pb-1">{req.num_dancers}</div>
                              </div>
                            </div>
                          </div>

                          {/* Full Width Row */}
                          <div className="col-span-1 md:col-span-2 space-y-4 mt-2">
                            <div>
                              <span className="text-xs font-bold text-gray-500 uppercase block mb-1">Purpose of Event</span>
                              <div className="border-b border-gray-400 pb-1 italic">{req.purpose}</div>
                            </div>
                            <div>
                              <span className="text-xs font-bold text-gray-500 uppercase block mb-1">Other Requirements / Remarks</span>
                              <div className="border-b border-gray-400 pb-1 italic">{req.other_requirements || 'N/A'}</div>
                            </div>
                          </div>

                        </div>

                        {/* Actions Footer inside the form */}
                        <div className="mt-10 flex justify-end">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation(); // Prevents the row from collapsing when clicking print
                              window.open(`/print-dlc/${req.id}`, '_blank');
                            }}
                            className="flex items-center gap-2 bg-gray-900 text-white font-sans px-6 py-3 rounded shadow hover:bg-gray-800 transition"
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