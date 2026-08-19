'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '../../../utils/supabase'; 
import { FaBan, FaUnlock, FaPlus, FaSearch, FaClock } from 'react-icons/fa';

type BannedStudent = {
  studentId: string;
  type: 'Manual' | 'Auto';
  expiresAt?: string | null;
};

export default function GymBannedListsPage() {
  const [bannedList, setBannedList] = useState<BannedStudent[]>([]);
  const [newStudentId, setNewStudentId] = useState('');
  const [tempBanDays, setTempBanDays] = useState<number>(3); 
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchBannedList = async () => {
    setIsLoading(true);
    
    const { data: settings } = await supabase
      .from('settings')
      .select('banned_gym_students')
      .eq('id', 1) 
      .single();

    const manualBans: BannedStudent[] = (settings?.banned_gym_students || []).map((id: string) => ({
      studentId: id,
      type: 'Manual'
    }));

    const now = new Date().toISOString();
    const { data: students } = await supabase
      .from('students')
      .select('student_id, banned_until')
      .gt('banned_until', now); 

    const autoBans: BannedStudent[] = (students || []).map((s) => ({
      studentId: String(s.student_id), // Ensure it reads as string in our app
      type: 'Auto',
      expiresAt: s.banned_until
    }));

    setBannedList([...manualBans, ...autoBans]);
    setIsLoading(false);
  };

  useEffect(() => {
      fetchBannedList();
    }, []);

  // 🔴 PERMANENT BAN
  const handleAddBan = async (e?: React.FormEvent) => {
    if (e) e.preventDefault(); 

    // 🔥 SECRETLY STRIPS THE DASH SO THE DATABASE DOESN'T CRASH
    const idToAdd = newStudentId.trim().replace(/-/g, '');
    if (!idToAdd) return;

    if (bannedList.some(b => b.studentId === idToAdd)) {
      alert("This student is already on the banned list!");
      return;
    }

    const { data: settings } = await supabase.from('settings').select('banned_gym_students').eq('id', 1).single();
    const currentManuals = settings?.banned_gym_students || [];
    const updatedList = [...currentManuals, idToAdd];
    
    const { error } = await supabase.from('settings').update({ banned_gym_students: updatedList }).eq('id', 1);

    if (!error) {
      setNewStudentId(''); 
      fetchBannedList(); 
    } else {
      alert("Failed to update database.");
      console.error(error);
    }
  };

  // 🟠 TEMPORARY BAN
  const handleTempBan = async (e?: React.MouseEvent) => {
    if (e) e.preventDefault(); 

    // 🔥 SECRETLY STRIPS THE DASH SO THE DATABASE DOESN'T CRASH
    const idToAdd = newStudentId.trim().replace(/-/g, '');
    if (!idToAdd) return;

    if (bannedList.some(b => b.studentId === idToAdd)) {
      alert("This student is already on the banned list!");
      return;
    }

    const days = Number(tempBanDays);
    if (isNaN(days) || days < 1) {
      alert("Please enter a valid number of days.");
      return;
    }

    try {
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + days);
      const isoStringDate = expirationDate.toISOString();
      
      const { data, error } = await supabase
  .from('students')
  .upsert(
    { student_id: Number(idToAdd), banned_until: isoStringDate },
    { onConflict: 'student_id' }
  )
  .select();

      if (error) {
        console.error("Supabase Error details:", error);
        alert(`Database Error: ${error.message}`);
        return;
      }

      // Alerts you if that ID hasn't been registered in the database yet
      if (!data || data.length === 0) {
        alert(`Failed: Student ID "${idToAdd}" was not found in the students table.`);
        return;
      }

      setNewStudentId(''); 
      setTempBanDays(3);
      fetchBannedList(); 
      alert(`Successfully gave ${idToAdd} a temporary ban for ${days} days.`);
      
    } catch (err) {
      console.error("Crash intercepted in handleTempBan:", err);
      alert("An unexpected error occurred. Check the console.");
    }
  };

  const handleUnban = async (student: BannedStudent) => {
    if (!confirm(`Are you sure you want to unban Student ID: ${student.studentId}?`)) return;

    // 1. Save the old list in case we need to revert
    const previousList = [...bannedList];

    // 2. Optimistic Update (Instantly hide from screen)
    setBannedList((prevList) => 
      prevList.filter((b) => String(b.studentId) !== String(student.studentId))
    );

    try {
      if (student.type === 'Manual') {
        const { data: settings, error: fetchError } = await supabase
          .from('settings')
          .select('banned_gym_students')
          .eq('id', 1)
          .single();

        if (fetchError) throw fetchError;

        const updatedList = (settings?.banned_gym_students || []).filter(
          (id: string | number) => String(id).trim() !== String(student.studentId).trim()
        );

        // 🔥 ADDED .select() HERE: Forces DB to confirm the row was actually changed
        const { data: updateData, error: updateError } = await supabase
          .from('settings')
          .update({ banned_gym_students: updatedList })
          .eq('id', 1)
          .select();

        if (updateError) throw updateError;
        
        // If data comes back empty, the database rejected our update
        if (!updateData || updateData.length === 0) {
          throw new Error("Action blocked! Your Admin session may have expired. Please log out and log back in.");
        }

      } else if (student.type === 'Auto') {
        // 🔥 ADDED .select() HERE: Forces DB to confirm the row was actually changed
        const { data: updateData, error: updateError } = await supabase
          .from('students')
          .update({ banned_until: null })
          .eq('student_id', Number(student.studentId))
          .select();

        if (updateError) throw updateError;

        // If data comes back empty, the database rejected our update
        if (!updateData || updateData.length === 0) {
          throw new Error(`Student ${student.studentId} was not found, or the action was blocked by security policies.`);
        }
      }

      // 3. Fully sync with database to ensure perfection
      fetchBannedList();

    } catch (err: any) {
      console.error("Critical Unban Error:", err);
      // 🔥 This alert will now tell you exactly what is failing
      alert(`Database Error: ${err.message}`);
      
      // Revert the screen back to how it was since the database failed
      setBannedList(previousList);
    }
  };

  // 🔥 SMART SEARCH: Lets you search with OR without dashes!
  const filteredList = bannedList.filter(b => {
    const normalizedId = String(b.studentId).replace(/-/g, '').toLowerCase();
    const normalizedSearch = searchQuery.replace(/-/g, '').toLowerCase();
    return normalizedId.includes(normalizedSearch);
  });

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      
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
        
        <div className="md:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 sticky top-8">
            <h2 className="font-bold text-gray-800 mb-4 text-lg">Ban Gym Users</h2>
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
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition mb-4"
                />

                <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">
                  Temporary Ban Duration (Days)
                </label>
                <input
                  type="number"
                  min="1"
                  value={tempBanDays}
                  onChange={(e) => setTempBanDays(parseInt(e.target.value) || 1)}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition"
                />
              </div>

              <div className="flex items-center gap-2">
                <button 
                  type="submit"
                  disabled={!newStudentId.trim()}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white font-bold py-3 px-2 rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm text-sm"
                >
                  <FaPlus /> Permanent Ban
                </button>

                <button 
                  type="button" 
                  onClick={handleTempBan}
                  disabled={!newStudentId.trim() || tempBanDays < 1}
                  className="flex-1 flex items-center justify-center gap-2 bg-orange-500 text-white font-bold py-3 px-2 rounded-lg hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm text-sm"
                >
                  <FaClock /> Temp Ban
                </button>
              </div>

            </form>
          </div>
        </div>

        <div className="md:col-span-2 space-y-4">
          
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
                  <li key={`${student.type}-${student.studentId}`} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition group">
                    <div className="flex items-center gap-4">
                      
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${student.type === 'Manual' ? 'bg-red-50 text-red-500' : 'bg-orange-50 text-orange-500'}`}>
                        {student.type === 'Manual' ? <FaBan /> : <FaClock />}
                      </div>
                      
                      <div>
                        {/* Optionally you can add dashes back in visually here if you wanted, but raw is fine too! */}
                        <p className="font-bold text-gray-900 dark:!text-white tracking-wide">{String(student.studentId).replace(/-/g, '')}</p>
                        
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
                      className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-gray-200 transition"
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