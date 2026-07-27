'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../../utils/supabase';
import Link from 'next/dist/client/link';
import { FaArrowLeft } from 'react-icons/fa';

interface Student {
  id: string;
  student_name: string;
  contact_number?: string;
  date_requested: string;
  location_type: string;
  status: string;
}

export default function ArchivePage() {
  const [is_archived, setArchived] = useState<Student[]>([]);
  const [search, setSearch] = useState('');
  
  const [selectedDate, setSelectedDate] = useState('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [statusFilter, setStatusFilter] = useState<'all' | 'accepted' | 'rejected' | 'pending'>('all');

  useEffect(() => {
      fetchArchived();
  
   
      const interval = setInterval(() => {
        fetchArchived();
      }, 3000); 
  
     
      return () => clearInterval(interval);
    }, []);

  const fetchArchived = async () => {
    const { data } = await supabase
      .from('dlc_request')
      .select('*')
      .eq('is_archived', true); 
    setArchived(data || []);
  };

  // --- NEW: Retrieve Function ---
  const handleRetrieve = async (id: string) => {
    if (!confirm(`Are you sure you want to retrieve this request and move it to the Accepted roster?`)) return;

    // Update the database to remove it from the archive and set status to 'accepted'
    const { error } = await supabase
      .from('tryout_submissions')
      .update({ 
        status: 'accepted', // This ensures it goes to the Accepted Students Roster
        is_archived: false,
        assigned_to: null   // Clears any previous assignment just in case
      })
      .eq('id', id);

    if (!error) {
      // Remove the student from the current screen
      setArchived(prev => prev.filter(student => student.id !== id));
      alert(`Tryout request successfully retrieved!`);
    } else {
      alert("Failed to retrieve the request.");
      console.error(error);
    }
  };

  const filtered = is_archived
    .filter(s => {
      // 1. Search and Status still act as strict filters
      const matchesSearch = (s.student_name || '').toLowerCase().includes(search.toLowerCase());
      const currentStatus = (s.status || '').replace(/['"]+/g, '').toLowerCase();
      const matchesStatus = statusFilter === 'all' ? true : currentStatus === statusFilter;

      // Notice we REMOVED the strict date filter here so data stops vanishing!
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const dateA = a.date_requested ? new Date(a.date_requested).getTime() : 0;
      const dateB = b.date_requested ? new Date(b.date_requested).getTime() : 0;

      // 2. NEW LOGIC: Proximity Sort
      // If the admin picked a date, sort the list by how close it is to that date
      if (selectedDate) {
        const targetTime = new Date(selectedDate).getTime();
        const diffA = Math.abs(dateA - targetTime);
        const diffB = Math.abs(dateB - targetTime);
        return diffA - diffB; // Smallest difference (closest dates) go to the top
      }

      // 3. Normal Sort: If no date is selected, use the Newest/Oldest button
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

  return (
    <div className="p-8">
      
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/dlc" className="p-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full transition">
            <FaArrowLeft />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Deleted Bin - DLC</h1>
            <p>You're Viewing the Deleted Bin of All DLC-related Requests.</p>
          </div>
        </div>
        
       
      </div>
      
      <div className="flex flex-wrap gap-4 mb-6 items-center">
        <input 
          type="text"
          placeholder="Search name..."
          className="border p-2 w-full max-w-xs rounded"
          onChange={(e) => setSearch(e.target.value)}
        />
        <input 
          type="date"
          className="border p-2 rounded text-gray-700"
          onChange={(e) => setSelectedDate(e.target.value)}
        />
        <select 
          className="border p-2 rounded text-gray-700 bg-white"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'all' | 'accepted' | 'rejected' | 'pending')}
        >
          <option value="all">All Statuses</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
          <option value="pending">Pending</option>
        </select>
        <button 
          onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
          className="bg-gray-800 hover:bg-black text-white px-4 py-2 rounded font-bold transition"
        >
          Sort: {sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-semibold text-gray-600">Name</th>
              <th className="p-4 font-semibold text-gray-600">Date Requested</th>
              <th className="p-4 font-semibold text-gray-600">Status</th>
              <th className="p-4 font-semibold text-gray-600">Location</th>
              <th className="p-4 font-semibold text-gray-600">Contact Info</th>
              <th className="p-4 font-semibold text-gray-600 text-center">Actions</th> 
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-500 italic"> {/* colSpan updated to 6 */}
                  No records match your filters.
                </td>
              </tr>
            )}
            {filtered.map((student, index) => (
              <tr key={student.id || `dlc-${index}`} className="border-b hover:bg-gray-50">
                <td className="p-4 font-medium text-gray-900">{student.student_name}</td>
                <td className="p-4 text-gray-600">{student.date_requested}</td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                    (student.status || '').toLowerCase() === 'accepted' || (student.status || '').toLowerCase() === 'approved'
                      ? 'bg-green-100 text-green-800'
                      : (student.status || '').toLowerCase() === 'rejected' || (student.status || '').toLowerCase() === 'denied'
                      ? 'bg-red-100 text-red-800'
                      : (student.status || '').toLowerCase() === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {student.status}
                  </span>
                </td>
                <td className="p-4 text-gray-600">{student.location_type}</td>
                <td className="p-4 text-gray-600">{student.contact_number}</td>
                
                {/* NEW ACTION COLUMN */}
                <td className="p-4 flex flex-col items-center justify-center gap-2 w-full">
  <button 
    onClick={() => handleRetrieve(student.id)}
    className="w-36 px-3 py-1.5 font-bold text-xs border rounded transition shadow-sm bg-blue-600 text-white border-blue-700 hover:bg-blue-700"
  >
    Retrieve
  </button>
</td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}