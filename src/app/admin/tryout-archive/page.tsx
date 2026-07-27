'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../../utils/supabase';
import Link from 'next/dist/client/link';
import { FaArrowLeft } from 'react-icons/fa';

interface Student {
  id: string;
  name: string;
  sport_event: string;
  status: string;
  contact_number?: string;
  created_at: string;
  assigned_to?: string; 
}


export default function TryoutsArchivePage() {
  const [is_archived, setArchived] = useState<Student[]>([]);
  const [search, setSearch] = useState('');
  
  // States for Sorting and Filtering
  const [selectedDate, setSelectedDate] = useState('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');


  useEffect(() => {
    const interval = setInterval(fetchArchived, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchArchived = async () => {
    const { data } = await supabase
      .from('tryout_submissions')
      .select('*')
      .eq('is_archived', true); 
    setArchived(data || []);
  };

 const handleRetrieve = async (id: string) => {
    if (!confirm(`Are you sure you want to retrieve this request and move it to the Accepted roster?`)) return;

    const { error } = await supabase
      .from('tryout_submissions')
      .update({ 
        status: 'accepted', 
        is_archived: false,
        assigned_to: null   
      })
      .eq('id', id);

    if (!error) {
      setArchived(prev => prev.filter(student => student.id !== id));
      alert(`Tryout request successfully retrieved!`);
    } else {
      alert("Failed to retrieve the request.");
      console.error(error);
    }
  };

  const filtered = is_archived
    .filter(s => {
      const matchesSearch = (s.name || '').toLowerCase().includes(search.toLowerCase());
      const currentStatus = (s.status || '').replace(/['"]+/g, '').toLowerCase();
      const matchesStatus = statusFilter === 'all' ? true : currentStatus === statusFilter;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;

      if (selectedDate) {
        const targetTime = new Date(selectedDate).getTime();
        const diffA = Math.abs(dateA - targetTime);
        const diffB = Math.abs(dateB - targetTime);
        return diffA - diffB;
      }

      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

  const formatDate = (isoString: string) => {
    if (!isoString) return 'N/A';
    return new Date(isoString).toLocaleDateString();
  };

  return (
    <div className="p-8">
      <div className="flex items-center gap-4 mb-6">
          <Link href="/admin/tryouts" className="p-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full transition">
            <FaArrowLeft />
          </Link>
          
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Deleted Bin - Tryout Requests</h1>
            <p className="text-gray-500 dark:text-gray-400">Manage archived tryout requests and retrieve if needed.</p>
          </div>
        </div>
      
      <div className="flex flex-wrap gap-4 mb-6 items-center">
        <input 
          type="text"
          placeholder="Search student name..."
          className="border border-gray-300 dark:border-gray-600 p-2 w-full max-w-xs rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          onChange={(e) => setSearch(e.target.value)}
        />
        <input 
          type="date"
          className="border border-gray-300 dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-100"
          onChange={(e) => setSelectedDate(e.target.value)}
          title="Find requests close to this date"
        />
        <select 
          className="border border-gray-300 dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-100"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'all' | 'pending' | 'accepted' | 'rejected')}
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
        </select>
        <button 
          onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
          className="bg-gray-800 hover:bg-black dark:bg-gray-700 dark:hover:bg-gray-600 text-white px-4 py-2 rounded font-bold transition"
        >
          Sort: {sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-200 dark:border-gray-700">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 dark:bg-gray-900 border-b dark:border-gray-700">
            <tr>
              <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Name</th>
              <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Date Submitted</th>
              <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Sport</th>
              <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Status</th>
              <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Contact Info</th>
              <th className="p-4 font-semibold text-gray-600 dark:text-gray-300 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-500 dark:text-gray-400 italic">
                  No records match your filters.
                </td>
              </tr>
            )}
            {filtered.map((student, index) => (
              <tr key={student.id || `tryout-${index}`} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="p-4 font-medium text-gray-900 dark:text-gray-100">{student.name}</td>
                <td className="p-4 text-gray-600 dark:text-gray-400">{formatDate(student.created_at)}</td>
                <td className="p-4 text-gray-600 dark:text-gray-400">{student.sport_event}</td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                    (student.status || '').toLowerCase() === 'accepted' || (student.status || '').toLowerCase() === 'approved'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400'
                      : (student.status || '').toLowerCase() === 'rejected' || (student.status || '').toLowerCase() === 'denied'
                      ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400'
                      : (student.status || '').toLowerCase() === 'pending'
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-400'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {student.status}
                  </span>
                </td>
                <td className="p-4 text-gray-600 dark:text-gray-400">{student.contact_number}</td>
                
                {/* 4. FIX FOR THE BUTTON AND DROPDOWN */}
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