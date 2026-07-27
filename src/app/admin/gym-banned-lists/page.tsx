'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '../../../utils/supabase'; 
import { FaBan, FaUnlock, FaPlus, FaSearch, FaClock } from 'react-icons/fa';

// Create a type so TypeScript knows we have two kinds of bans now
type BannedStudent = {
  studentId: string;
  type: 'Manual' | 'Auto';
  expiresAt?: string | null;
};

export default function GymBannedListsPage() {
  const [bannedList, setBannedList] = useState<BannedStudent[]>([]);
  const [newStudentId, setNewStudentId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchBannedList = async () => {
    setIsLoading(true);
    
    // 1. Fetch Manual Bans (From Settings)
    const { data: settings } = await supabase
      .from('settings')
      .select('banned_gym_students')
      .eq('id', 1) 
      .single();

    const manualBans: BannedStudent[] = (settings?.banned_gym_students || []).map((id: string) => ({
      studentId: id,
      type: 'Manual'
    }));

    // 2. Fetch Auto Bans (From Students - ONLY active ones!)
    const now = new Date().toISOString();
    const { data: students } = await supabase
      .from('students')
      .select('student_id, banned_until')
      .gt('banned_until', now); // This automatically ignores bans that have expired!

    const autoBans: BannedStudent[] = (students || []).map((s) => ({
      studentId: s.student_id,
      type: 'Auto',
      expiresAt: s.banned_until
    }));

    // Combine them into one master list
    setBannedList([...manualBans, ...autoBans]);
    setIsLoading(false);
  };

  useEffect(() => {
      fetchBannedList();
    }, []);

  const handleAddBan = async (e?: React.FormEvent) => {
    if (e) e.preventDefault(); 

    const idToAdd = newStudentId.trim();
    if (!idToAdd) return;

    if (bannedList.some(b => b.studentId === idToAdd)) {
      alert("This student is already on the banned list!");
      return;
    }

    // Always add manual bans to the settings table
    const { data: settings } = await supabase.from('settings').select('banned_gym_students').eq('id', 1).single();
    const currentManuals = settings?.banned_gym_students || [];
    const updatedList = [...currentManuals, idToAdd];
    
    const { error } = await supabase.from('settings').update({ banned_gym_students: updatedList }).eq('id', 1);

    if (!error) {
      setNewStudentId(''); 
      fetchBannedList(); // Refresh the list
    } else {
      alert("Failed to update database.");
      console.error(error);
    }
  };

  const handleUnban = async (student: BannedStudent) => {
    if (!confirm(`Are you sure you want to unban Student ID: ${student.studentId}?`)) return;

    if (student.type === 'Manual') {
      // Remove from settings table
      const { data: settings } = await supabase.from('settings').select('banned_gym_students').eq('id', 1).single();
      const updatedList = (settings?.banned_gym_students || []).filter((id: string) => id !== student.studentId);
      await supabase.from('settings').update({ banned_gym_students: updatedList }).eq('id', 1);
      
    } else if (student.type === 'Auto') {
      // Remove from students table by setting banned_until to null
      await supabase.from('students').update({ banned_until: null }).eq('student_id', student.studentId);
    }

    // Refresh the UI
    fetchBannedList();
  };

  const filteredList = bannedList.filter(b => 
    b.studentId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      
      {/* HEADER */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center gap-4">
        <div className="p-4 bg-red-100 text-red-600 rounded-full">
          <FaBan className="text-2xl" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Ban List</h1>
          <p className="text-gray-500">Manage bans manually and track temporary or automatic absent bans.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: ADD NEW BAN */}
        <div className="md:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 sticky top-8">
            <h2 className="font-bold text-gray-800 mb-4 text-lg">Manually Ban Gym Users</h2>
            <form onSubmit={handleAddBan} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">
                  School ID
                </label>
                <input
                  type="text"
                  placeholder="e.g. 201-XXXXX"
                  value={newStudentId}
                  onChange={(e) => setNewStudentId(e.target.value)}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition"
                />
              </div>
              <button 
                type="submit"
                disabled={!newStudentId.trim()}
                className="w-full flex items-center justify-center gap-2 bg-red-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                <FaPlus /> Apply Permanent Ban
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: THE BANNED LIST */}
        <div className="md:col-span-2 space-y-4">
          
          {/* Search & Counter */}
          <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 flex-1">
              <FaSearch className="text-gray-400" />
              <input 
                type="text" 
                placeholder="Search banned IDs..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-none outline-none text-sm w-full font-medium text-gray-700"
              />
            </div>
            <span className="bg-red-100 text-red-800 text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
              {bannedList.length} Banned
            </span>
          </div>

          {/* The List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {isLoading ? (
              <div className="p-8 text-center text-gray-500">Loading list...</div>
            ) : filteredList.length === 0 ? (
              <div className="p-12 text-center text-gray-500 flex flex-col items-center">
                <FaUnlock className="text-4xl text-gray-300 mb-3" />
                <p className="font-medium text-lg text-gray-600">No students are currently banned.</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {filteredList.map((student) => (
                  <li key={`${student.type}-${student.studentId}`} className="p-4 flex items-center justify-between hover:bg-gray-800 transition group">
                    <div className="flex items-center gap-4">
                      
                      {/* Icon changes based on Manual vs Auto */}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${student.type === 'Manual' ? 'bg-red-50 text-red-500' : 'bg-orange-50 text-orange-500'}`}>
                        {student.type === 'Manual' ? <FaBan /> : <FaClock />}
                      </div>
                      
                      <div>
                        <p className="font-bold text-black tracking-wide">{student.studentId}</p>
                        
                        {/* Status changes based on Manual vs Auto */}
                        {student.type === 'Manual' ? (
                          <p className="text-xs text-red-500 font-bold uppercase tracking-wider">Permanent Ban</p>
                        ) : (
                          <p className="text-xs text-orange-500 font-bold uppercase tracking-wider">
                            Expires: {new Date(student.expiresAt!).toLocaleDateString()}
                          </p>
                        )}
                      </div>

                    </div>
                    
                    <button 
                      onClick={() => handleUnban(student)}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-500 border border-gray-300 rounded hover:bg-gray-500 hover:bg-gray-500 hover:bg-gray-500 transition"
                      title="Remove ban"
                    >
                      <FaUnlock /> Unban
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}