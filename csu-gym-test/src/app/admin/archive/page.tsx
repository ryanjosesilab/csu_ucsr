'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../../utils/supabase';


interface Student {
  id: string;
  name: string;
  sport_event: string;
  status: string;
  contact_number?: string;
  // Add other fields if you use them, like degree or college
}

export default function ArchivePage() {
  const [is_archived, setArchived] = useState<Student[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchArchived();
  }, []);

  const fetchArchived = async () => {
    const { data } = await supabase
      .from('tryout_submissions')
      .select('*')
      .eq('is_archived', true); // Only pull the ones marked as archive
    setArchived(data || []);
  };

  // Simple filter for the search bar
  const filtered = is_archived.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Archive Vault</h1>
      
      {/* Search Bar */}
      <input 
        type="text"
        placeholder="Search student name..."
        className="border p-2 w-full max-w-md mb-6 rounded"
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Results Table */}
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left">
            <th className="p-2">Name</th>
            <th className="p-2">Sport</th>
            <th className="p-2">Status</th>
            <th className="p-2">Student Contact info</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(student => (
            <tr key={student.id} className="border-b">
              <td className="p-2">{student.name}</td>
              <td className="p-2">{student.sport_event}</td>
              <td className="p-2">{student.status}</td>
              <td className="p-2">{student.contact_number}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}