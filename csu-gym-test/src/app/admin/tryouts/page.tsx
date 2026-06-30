'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { FaCheck, FaTimes, FaUserShield, FaBan, FaHourglassHalf, FaDownload, FaEdit } from 'react-icons/fa';
import { supabase } from '../../../utils/supabase';
import Link from 'next/link'; 
import { FaArchive } from 'react-icons/fa';


// 1. Updated Interface to match Supabase database columns
interface Student {
  id: string;
  student_id: string;
  name: string;
  degree: string;
  sport_event: string;
  position: string;
  experience: string;
  college: string;
  status: 'pending' | 'accepted' | 'rejected' | null; 
  assigned_to: string | null;
  contact_number?: string;
  archived?: boolean;
}

const ADMINS = [
  { id: 'admin_1', name: 'Coach Jopeter (Admin 1)' },
  { id: 'admin_2', name: 'Coach Johan (Admin 2)' },
  { id: 'admin_3', name: 'Coach Kim (Admin 3)' },
];

export default function TryoutsAdminPage() {
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [adminSelections, setAdminSelections] = useState<Record<string, string>>({});
  const [expandedExp, setExpandedExp] = useState<Record<string, boolean>>({});
  const [isTryoutActive, setIsTryoutActive] = useState(true);

  const handleToggleTryouts = async () => {
    const newState = !isTryoutActive; 
    
    const { error } = await supabase
      .from('settings')
      .update({ is_tryout_active: newState })
      .eq('id', 1); // Ensure you have a row with id: 1 in your settings table

    if (!error) {
      setIsTryoutActive(newState); 
      alert(`Tryouts are now ${newState ? 'OPEN' : 'CLOSED'}`);
    } else {
      alert("Failed to update tryout status.");
      console.error(error);
    }
  };
  
  // 1. Define fetchStudents FIRST using useCallback
  const fetchStudents = useCallback(async () => {
    const { data } = await supabase
      .from('tryout_submissions')
      .select('*')
      .eq('is_archived', false);


    
    if (data) setStudents(data);
  }, []);

  const fetchTryoutStatus = async () => {
  const { data } = await supabase
    .from('settings')
    .select('is_tryout_active')
    .single();
  
  if (data) setIsTryoutActive(data.is_tryout_active);
};

  // 2. Use it in useEffect
  useEffect(() => {
  fetchStudents();
  fetchTryoutStatus(); // <--- Add this line
  const interval = setInterval(fetchStudents, 15000); 
  return () => clearInterval(interval);
}, [fetchStudents]);

  // 3. Handlers
  const handleArchiveAll = async () => {
    if (confirm("Are you sure? This will archive ALL currently visible students.")) {
      const studentIds = students.map(s => s.id);
      const { error } = await supabase
        .from('tryout_submissions')
        .update({ is_archived: true })
        .in('id', studentIds);

      if (!error) {
        setStudents([]); 
        alert("All students have been archived!");
      }
    }
  };

  const handleArchive = async (id: string) => {
    const { error } = await supabase
      .from('tryout_submissions')
      .update({ is_archived: true })
      .eq('id', id);

    if (!error) {
      setStudents(students.filter(s => s.id !== id));
    }
  };

  const handleSaveEdit = async () => {
    if (!editingStudent) return;
    const { error } = await supabase
      .from('tryout_submissions')
      .update({
        name: editingStudent.name,
        sport_event: editingStudent.sport_event,
        position: editingStudent.position,
        contact_number: editingStudent.contact_number,
        college: editingStudent.college
      })
      .eq('id', editingStudent.id);

    if (!error) {
      setStudents(students.map(s => (s.id === editingStudent.id ? editingStudent : s)));
      setEditingStudent(null);
    }
  };

  // Add your other handlers (handleAccept, handleReject, etc.) here...
 const handleAccept = async (dbId: string) => {
    console.log("Accept button clicked for ID:", dbId);
    
    // Determine which admin is selected for this student
    const selectedAdminId = adminSelections[dbId] || ADMINS[0].id;

    // 1. Update Database
    const { error } = await supabase
      .from('tryout_submissions')
      .update({ status: 'accepted', assigned_to: selectedAdminId })
      .eq('id', dbId);

    if (error) {
      alert("Failed to update database.");
      console.error(error);
    } else {
      // 2. Update UI locally so it moves to the coach's roster immediately
      setStudents(students.map(student => 
        student.id === dbId 
          ? { ...student, status: 'accepted', assigned_to: selectedAdminId } 
          : student
      ));
    }
  };

  // 4. Updated Reject logic
  const handleReject = async (dbId: string) => {
    console.log("Reject button clicked for ID:", dbId);

    // 1. Update Database
    const { error } = await supabase
      .from('tryout_submissions')
      .update({ status: 'rejected', assigned_to: null }) // Clear admin assignment
      .eq('id', dbId);

    if (error) {
      alert("Failed to update database.");
      console.error(error);
    } else {
      // 2. Update UI locally so it moves to the Rejected table immediately
      setStudents(students.map(student => 
        student.id === dbId 
          ? { ...student, status: 'rejected', assigned_to: null } 
          : student
      ));
    }
  };

  const toggleTryouts = async (currentState: boolean) => {
  const { error } = await supabase
    .from('settings')
    .update({ is_tryout_active: !currentState })
    .eq('id', 'your_config_row_id'); // Just one row for your settings
    
  if (!error) {
    alert(`Tryouts are now ${!currentState ? 'ENABLED' : 'DISABLED'}`);
  }
};


  const toggleExperience = (id: string) => setExpandedExp(prev => ({ ...prev, [id]: !prev[id] }));
  const handleSelectAdmin = (dbId: string, adminId: string) => setAdminSelections({ ...adminSelections, [dbId]: adminId });

  // Filters
  const pendingStudents = students.filter(s => s.status === 'pending' || !s.status);
  const rejectedStudents = students.filter(s => s.status === 'rejected');
  const admin1Students = students.filter(s => s.status === 'accepted' && s.assigned_to === 'admin_1');
  const admin2Students = students.filter(s => s.status === 'accepted' && s.assigned_to === 'admin_2');
  const admin3Students = students.filter(s => s.status === 'accepted' && s.assigned_to === 'admin_3');

  return (

    
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
  <div>
    <h1 className="text-2xl font-bold text-gray-800">Tryout Applications</h1>
    <p className="text-gray-500 text-sm">Manage incoming student applications</p>
  </div>

  <div className="flex gap-3">
    {/* Refresh Button */}
    <button 
      onClick={fetchStudents} 
      className="bg-gray-100 text-gray-700 px-4 py-2 rounded font-bold hover:bg-gray-200 transition"
    >
      Refresh
    </button>

    {/* Archive All Button */}
    <button 
      onClick={handleArchiveAll}
      className="bg-red-600 text-white px-4 py-2 rounded font-bold hover:bg-red-700 transition"
    >
      Archive All
    </button>

    <button 
  onClick={handleToggleTryouts}
  className={`px-4 py-2 rounded font-bold transition text-white ${
    isTryoutActive 
      ? 'bg-red-600 hover:bg-red-700' 
      : 'bg-green-600 hover:bg-green-700'
  }`}
>
  {isTryoutActive ? 'Close Tryouts (Turn OFF)' : 'Open Tryouts (Turn ON)'}
</button>

    <Link href="/admin/archive">
  <button className="bg-purple-600 text-white px-4 py-2 rounded font-bold hover:bg-purple-700 transition">
    View Deleted Students
  </button>
</Link>
  </div>
</div>


      {/* TABLE 1: PENDING STUDENTS */}
      <div className="bg-white shadow rounded-lg border-l-4 border-yellow-500 overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center">
          <FaHourglassHalf className="text-yellow-500 mr-2" />
          <h2 className="text-lg font-bold text-gray-800">Pending Applications</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-600">
            <thead className="text-xs text-gray-700 uppercase bg-gray-100">
              <tr>
                <th className="px-6 py-3">Student Info</th>
                <th className="px-6 py-3">Sport / Position</th>
                <th className="px-6 py-3">Experience</th>
                <th className="px-6 py-3">College</th>
                <th className="px-6 py-3">Assign To Admin</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingStudents.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-4 text-center text-gray-500">No pending applications.</td></tr>
              )}
              {pendingStudents.map(student => (
                <tr key={student.id} className="border-b hover:bg-gray-50">
                  {/* ADDED STUDENT ID HERE */}
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {student.name}<br/>
                    <span className="text-xs text-blue-600 font-semibold">{student.student_id}</span><br/>
                    <span className="text-xs text-gray-400">{student.degree}</span>
                  </td>
                  <td className="px-6 py-4">{student.sport_event}<br/><span className="text-xs text-gray-400">{student.position}</span></td>
                  {/* Clickable Experience Data Cell */}
                  <td className="px-6 py-4 max-w-[250px] align-top">
                    {student.experience ? (
                      <div 
                        onClick={() => toggleExperience(student.id)} 
                        className="cursor-pointer group"
                      >
                        <p className={`text-xs text-gray-500 transition-all duration-200 ${expandedExp[student.id] ? 'whitespace-pre-wrap break-words' : 'truncate'}`}>
                          {student.experience}
                        </p>
                        <span className="text-[10px] text-blue-500 group-hover:underline mt-1 inline-block">
                          {expandedExp[student.id] ? 'Show less' : 'Read more'}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 italic">No experience listed</span>
                    )}
                  </td>
                  <td className="px-6 py-4">{student.college}</td>
                  <td className="px-6 py-4">
                    <select 
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
                      value={adminSelections[student.id] || ADMINS[0].id}
                      onChange={(e) => handleSelectAdmin(student.id, e.target.value)}
                    >
                      {ADMINS.map(admin => (
                        <option key={admin.id} value={admin.id}>{admin.name}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleAccept(student.id)} className="text-white bg-green-600 hover:bg-green-700 font-medium rounded-lg text-xs px-3 py-2 mr-2 transition-colors">
                      <FaCheck className="inline mr-1" /> Accept
                    </button>
                    <button onClick={() => handleReject(student.id)} className="text-white bg-red-600 hover:bg-red-700 font-medium rounded-lg text-xs px-3 py-2 transition-colors">
                      <FaTimes className="inline mr-1" /> Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* GRID FOR THE 3 ADMIN TABLES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* TABLE 3: ADMIN 1 ROSTER */}
        <div className="bg-white shadow rounded-lg border-t-4 border-blue-500 overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center">
              <FaUserShield className="text-blue-500 mr-2" />
              <h2 className="text-md font-bold text-gray-800">Coach Jopeter</h2>
            </div>
            <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-0.5 rounded-full">{admin1Students.length}</span>
          </div>
          {admin1Students.map(student => (
              <li key={student.id} className="p-3 hover:bg-gray-50 rounded-md transition-colors flex justify-between items-center group">
                <div className="flex-1 min-w-0 pr-4">
                  <p className="text-sm font-bold text-gray-900">{student.name} <span className="text-blue-600 text-xs ml-1">({student.student_id})</span></p>
                  <p className="text-xs text-gray-500 font-medium">{student.sport_event} - {student.position}</p>
                  <p className="text-[10px] text-gray-400 italic truncate mt-1" title={student.experience}>{student.experience}</p>
                </div>

                <button 
                    onClick={() => setEditingStudent(student)}
                    className="text-gray-400 hover:text-green-600 hover:bg-green-50 p-2 rounded-full transition-all duration-200"
                    title="Edit Student Info"
                  >
                    <FaEdit />
                  </button>

                  <button 
  onClick={() => handleArchive(student.id)}
  className="text-gray-400 hover:text-orange-600 p-2 rounded-full"
  title="Archive Student"
>
  <FaArchive />
</button>

                {/* NEW DOWNLOAD BUTTON */}
                <button 
                  onClick={() => window.open(`/print-tryout/${student.id}?t=${new Date().getTime()}`, '_blank')}
                  className="text-gray-300 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-full transition-all duration-200"
                  title="Print / Save as PDF"
                >
                  <FaDownload />
                </button>
              </li>
            ))}
        </div>

        {/* TABLE 4: ADMIN 2 ROSTER */}
        <div className="bg-white shadow rounded-lg border-t-4 border-teal-500 overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center">
              <FaUserShield className="text-teal-500 mr-2" />
              <h2 className="text-md font-bold text-gray-800">Coach Johan</h2>
            </div>
            <span className="bg-teal-100 text-teal-800 text-xs font-bold px-2.5 py-0.5 rounded-full">{admin2Students.length}</span>
          </div>
          <ul className="divide-y divide-gray-200 p-2">
            {admin2Students.length === 0 && <li className="p-4 text-center text-sm text-gray-500">No students assigned.</li>}
            {admin2Students.map(student => (
              <li key={student.id} className="p-3 hover:bg-gray-50 rounded-md transition-colors">
                <p className="text-sm font-bold text-gray-900">{student.name} <span className="text-teal-600 text-xs ml-1">({student.student_id})</span></p>
                <p className="text-xs text-gray-500">{student.sport_event} - {student.position}</p>
                <p className="text-[10px] text-gray-400 italic truncate mt-1" title={student.experience}>{student.experience}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* TABLE 5: ADMIN 3 ROSTER */}
        <div className="bg-white shadow rounded-lg border-t-4 border-indigo-500 overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center">
              <FaUserShield className="text-indigo-500 mr-2" />
              <h2 className="text-md font-bold text-gray-800">Coach Kim</h2>
            </div>
            <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-2.5 py-0.5 rounded-full">{admin3Students.length}</span>
          </div>
          <ul className="divide-y divide-gray-200 p-2">
            {admin3Students.length === 0 && <li className="p-4 text-center text-sm text-gray-500">No students assigned.</li>}
            {admin3Students.map(student => (
              <li key={student.id} className="p-3 hover:bg-gray-50 rounded-md transition-colors">
                <p className="text-sm font-bold text-gray-900">{student.name} <span className="text-indigo-600 text-xs ml-1">({student.student_id})</span></p>
                <p className="text-xs text-gray-500">{student.sport_event} - {student.position}</p>
                <p className="text-[10px] text-gray-400 italic truncate mt-1" title={student.experience}>{student.experience}</p>
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* TABLE 2: REJECTED STUDENTS */}
      <div className="bg-white shadow rounded-lg border-l-4 border-red-500 overflow-hidden mt-6">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center">
          <FaBan className="text-red-500 mr-2" />
          <h2 className="text-lg font-bold text-gray-800">Rejected Applications</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-600">
            <thead className="text-xs text-gray-700 uppercase bg-gray-100">
              <tr>
                <th className="px-6 py-3">Name & ID</th>
                <th className="px-6 py-3">Sport</th>
                <th className="px-6 py-3">Experience</th>
                <th className="px-6 py-3">College</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {rejectedStudents.length === 0 && (
                <tr><td colSpan={4} className="px-6 py-4 text-center text-gray-500">No rejected applications.</td></tr>
              )}
              {rejectedStudents.map(student => (
                <tr key={student.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {student.name} <br/>
                    <span className="text-xs text-gray-500">{student.student_id}</span>
                  </td>
                  <td className="px-6 py-4">{student.sport_event}</td>
                  <td className="px-6 py-4 max-w-[200px]">
                    <p className="truncate text-xs text-gray-500" title={student.experience}>
                      {student.experience || "No experience listed"}
                    </p>
                  </td>
                  <td className="px-6 py-4">{student.college}</td>
                  <td className="px-6 py-4">
                    <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">Rejected</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* TV DISPLAY BUTTON */}
      <div className="mt-12 flex justify-center pb-8">
        <Link 
          href="/tryouts-display" 
          target="_blank" 
          className="bg-gray-900 hover:bg-black text-white font-bold py-4 px-8 rounded-full shadow-lg transition-transform hover:scale-105 flex items-center gap-2"
        >
          📺 Tryouts Student View Page
        </Link>
      </div>

              {/* EDIT MODAL POPUP */}
      {editingStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold mb-4">Edit Student Details</h2>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Full Name</label>
                <input 
                  type="text" 
                  value={editingStudent.name} 
                  onChange={(e) => setEditingStudent({...editingStudent, name: e.target.value})}
                  className="w-full border rounded p-2 text-sm"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Sport / Event</label>
                  <input 
                    type="text" 
                    value={editingStudent.sport_event} 
                    onChange={(e) => setEditingStudent({...editingStudent, sport_event: e.target.value})}
                    className="w-full border rounded p-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Position</label>
                  <input 
                    type="text" 
                    value={editingStudent.position} 
                    onChange={(e) => setEditingStudent({...editingStudent, position: e.target.value})}
                    className="w-full border rounded p-2 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">College</label>
                  <input 
                    type="text" 
                    value={editingStudent.college} 
                    onChange={(e) => setEditingStudent({...editingStudent, college: e.target.value})}
                    className="w-full border rounded p-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Contact Number</label>
                  <input 
                    type="text" 
                    value={editingStudent.contact_number || ''} 
                    onChange={(e) => setEditingStudent({...editingStudent, contact_number: e.target.value})}
                    className="w-full border rounded p-2 text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button 
                onClick={() => setEditingStudent(null)}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveEdit}
                className="px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}