'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { FaCheck, FaTimes, FaUserShield, FaBan, FaHourglassHalf, FaDownload, FaEdit, FaFolderOpen, FaArchive } from 'react-icons/fa';
import { supabase } from '../../../utils/supabase';
import Link from 'next/link'; 

interface Student {
  id: string;
  student_id: string;
  name: string;
  degree: string;
  sport_event: string;
  position: string;
  experience: string;
  college: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired_rejection' | null; 
  assigned_to: string | null;
  evaluator_name?: string | null;
  contact_number?: string;
  archived?: boolean;
}

export default function TryoutsAdminPage() {
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [expandedExp, setExpandedExp] = useState<Record<string, boolean>>({});
  const [isTryoutActive, setIsTryoutActive] = useState(true);
  const [coaches, setCoaches] = useState<string[]>([]);

  const handleToggleTryouts = async () => {
    const newState = !isTryoutActive; 
    
    const { error } = await supabase
      .from('settings')
      .update({ is_tryout_active: newState })
      .eq('id', 1); 

    if (!error) {
      setIsTryoutActive(newState); 
      
      if (newState === true) {
        await supabase
          .from('tryout_submissions')
          .update({ status: 'expired_rejection' })
          .eq('status', 'rejected');
      }
      
      alert(`Tryouts are now ${newState ? 'OPEN' : 'CLOSED'}`);
    } else {
      alert("Failed to update tryout status.");
      console.error(error);
    }
  };
  
  const fetchStudents = useCallback(async () => {
    const { data } = await supabase
      .from('tryout_submissions')
      .select('*')
      .eq('is_archived', false);
    
    if (data) setStudents(data);
  }, []);

  const fetchSettings = useCallback(async () => {
    const { data } = await supabase.from('settings').select('*').single();
    if (data) {
      setIsTryoutActive(data.is_tryout_active);
      setCoaches(data.coaches_list || []);
    }
  }, []); 

  useEffect(() => {
    fetchStudents();
    fetchSettings();

    const tryoutsChannel = supabase
      .channel('realtime-tryouts')
      .on(
        'postgres_changes',
        {
          event: '*', 
          schema: 'public',
          table: 'tryout_submissions'
        },
        () => {
          console.log("Real-time update detected, refetching...");
          fetchStudents(); 
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(tryoutsChannel);
    };
  }, [fetchStudents, fetchSettings]);

  // Handlers
  const handleArchiveAll = async () => {
    if (confirm("Are you sure? This will Delete ALL students who applied.")) {
      const studentIds = students.map(s => s.id);
      const { error } = await supabase
        .from('tryout_submissions')
        .update({ is_archived: true })
        .in('id', studentIds);

      if (!error) {
        setStudents([]); 
        alert("All students have been deleted!");
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
        college: editingStudent.college,
        evaluator_name: editingStudent.evaluator_name
      })
      .eq('id', editingStudent.id);

    if (!error) {
      setStudents(students.map(s => (s.id === editingStudent.id ? editingStudent : s)));
      setEditingStudent(null);
    }
  };

  const handleAccept = async (dbId: string) => {
    const { error } = await supabase
      .from('tryout_submissions')
      .update({ status: 'accepted' })
      .eq('id', dbId);

    if (error) {
      alert("Failed to update database.");
      console.error(error);
    } else {
      setStudents(students.map(student => 
        student.id === dbId 
          ? { ...student, status: 'accepted' } 
          : student
      ));
    }
  };

  const handleReject = async (dbId: string) => {
    const { error } = await supabase
      .from('tryout_submissions')
      .update({ status: 'rejected' }) 
      .eq('id', dbId);

    if (error) {
      alert("Failed to update database.");
      console.error(error);
    } else {
      setStudents(students.map(student => 
        student.id === dbId 
          ? { ...student, status: 'rejected' } 
          : student
      ));
    }
  };

  const toggleExperience = (id: string) => setExpandedExp(prev => ({ ...prev, [id]: !prev[id] }));

  // Filters
  const pendingStudents = students.filter(s => s.status === 'pending' || !s.status);
  const rejectedStudents = students.filter(s => s.status === 'rejected' || s.status === 'expired_rejection');
  const acceptedStudents = students.filter(s => s.status === 'accepted');

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
        <h1 className="text-2xl font-bold text-white">Tryout Applications</h1>
        <p className="text-white/80 text-sm">Manage incoming student applications</p>
      </div>

      <div className="flex gap-3 relative z-10">
        <button 
          onClick={handleArchiveAll}
          className="bg-red-600 text-white px-4 py-2 rounded font-bold hover:bg-red-700 transition shadow-sm"
        >
          Delete All
        </button>

        <button 
          onClick={handleToggleTryouts}
          className={`px-4 py-2 rounded font-bold transition text-white shadow-sm ${
            isTryoutActive 
              ? 'bg-red-600 hover:bg-red-700' 
              : 'bg-green-500 hover:bg-green-400'
          }`}
        >
          {isTryoutActive ? 'Close Tryouts (Turn OFF)' : 'Open Tryouts (Turn ON)'}
        </button>

        <Link href="/admin/tryout-archive">
          <button 
            className="bg-purple-600 text-white p-3 rounded hover:bg-purple-700 transition shadow-sm flex items-center justify-center"
            title="View Tryout Archive"
          >
            <FaFolderOpen className="text-lg" />
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
                <th className="px-6 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingStudents.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-4 text-center text-gray-500">No pending applications.</td></tr>
              )}
              {pendingStudents.map(student => (
                <tr key={student.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {student.name}<br/>
                    <span className="text-xs text-blue-600 font-semibold">{student.student_id}</span><br/>
                    <span className="text-xs text-gray-400">{student.degree}</span>
                  </td>
                  <td className="px-6 py-4">{student.sport_event}<br/><span className="text-xs text-gray-400">{student.position}</span></td>
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
                  <td className="p-4 flex justify-center gap-2">
                    <button onClick={() => handleAccept(student.id)} className="bg-[#0F4E15] hover:bg-green-700 text-white px-3 py-1.5 rounded flex items-center text-xs font-bold">
                      <FaCheck className="inline mr-1" /> Accept
                    </button>
                    <button onClick={() => handleReject(student.id)} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded flex items-center text-xs font-bold">
                      <FaTimes className="inline mr-1" /> Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SINGLE UNIFIED ACCEPTED STUDENTS TABLE */}
      <div className="bg-white shadow rounded-lg border-t-4 border-green-600 overflow-hidden mt-6">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center">
            <FaUserShield className="text-green-600 mr-2 text-lg" />
            <h2 className="text-lg font-bold text-gray-800">Accepted Students Roster</h2>
          </div>
          <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full">{acceptedStudents.length} Accepted</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-600">
            <thead className="text-xs text-gray-700 uppercase bg-gray-100">
              <tr>
                <th className="px-6 py-3">Student Info</th>
                <th className="px-6 py-3">Sport / Position</th>
                <th className="px-6 py-3">Experience</th>
                <th className="px-6 py-3">College</th>
                <th className="px-6 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {acceptedStudents.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-6 text-center text-gray-500 italic">No accepted students recorded yet.</td></tr>
              )}
              {acceptedStudents.map(student => (
                <tr key={student.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {student.name}<br/>
                    <span className="text-xs text-green-600 font-semibold">{student.student_id}</span><br/>
                    <span className="text-xs text-gray-400">{student.degree}</span>
                  </td>
                  <td className="px-6 py-4">
                    {student.sport_event}<br/>
                    <span className="text-xs text-gray-400">{student.position}</span>
                  </td>
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
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button 
                        onClick={() => setEditingStudent(student)}
                        className="text-gray-400 hover:text-green-600 hover:bg-green-50 p-2 rounded-full transition-all duration-200"
                        title="Edit Student Info"
                      >
                        <FaEdit />
                      </button>

                      <button 
                        onClick={() => handleArchive(student.id)}
                        className="text-gray-400 hover:text-orange-600 hover:bg-orange-50 p-2 rounded-full transition-all duration-200"
                        title="Archive Student"
                      >
                        <FaArchive />
                      </button>

                      <button 
                        onClick={() => window.open(`/print-tryout/${student.id}?t=${new Date().getTime()}`, '_blank')}
                        className="text-gray-400 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-full transition-all duration-200"
                        title="Print / Save as PDF"
                      >
                        <FaDownload />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
                <tr><td colSpan={5} className="px-6 py-4 text-center text-gray-500">No rejected applications.</td></tr>
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
                    <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      {student.status === 'expired_rejection' ? 'Rejected (Previous Tryout)' : 'Rejected'}
                    </span>
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

                <div className="mt-4 pt-4 border-t border-gray-100 col-span-2">
                  <label className="block text-xs font-bold text-blue-700 mb-1">Assign Coach for Print Form</label>
                  
                  <select 
                    value={editingStudent.evaluator_name || ''} 
                    onChange={(e) => setEditingStudent({...editingStudent, evaluator_name: e.target.value})} 
                    className="w-full border border-blue-300 bg-blue-50 focus:bg-white rounded p-2 text-sm cursor-pointer" 
                  >
                    <option value="" disabled>Click to select a coach...</option>
                    {coaches.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>

                  <p className="text-[10px] text-gray-500 mt-1">
                    This name will appear on the student's physical Tryout Form. (List managed in Settings)
                  </p>
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