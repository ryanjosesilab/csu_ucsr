'use client';
import React, { useState, useEffect } from 'react';
import { FaCheck, FaTimes, FaUserShield, FaBan, FaHourglassHalf } from 'react-icons/fa';
// Ensure this path matches where your supabase client is located
import { supabase } from '../../../utils/supabase'; 

// 1. Updated Interface to match Supabase database columns
interface Student {
  id: string; // The database row ID
  student_id: string; // The School ID number we just added
  name: string;
  degree: string;
  sport_event: string; // Matched to Supabase column
  position: string;
  experience: string;
  college: string;
  status: 'pending' | 'accepted' | 'rejected' | null; 
  assigned_to: string | null; // Matched to Supabase column
}

const ADMINS = [
  { id: 'admin_1', name: 'Coach Jopeter (Admin 1)' },
  { id: 'admin_2', name: 'Coach Johan (Admin 2)' },
  { id: 'admin_3', name: 'Coach Kim (Admin 3)' },
];

export default function TryoutsAdminPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [adminSelections, setAdminSelections] = useState<Record<string, string>>({});

  // 2. Fetch data from Supabase on page load
  useEffect(() => {
    const fetchStudents = async () => {
      const { data, error } = await supabase
        .from('tryout_submissions')
        .select('*')
        .order('id', { ascending: false }); // Show newest first

      if (error) {
        console.error("Error fetching tryouts:", error);
      } else if (data) {
        setStudents(data);
      }
    };

    fetchStudents();
  }, []);

  // 3. Update Accept logic to save to database
  const handleAccept = async (dbId: string) => {
    const selectedAdminId = adminSelections[dbId] || ADMINS[0].id;

    // Update UI immediately
    setStudents(students.map(student => 
      student.id === dbId ? { ...student, status: 'accepted', assigned_to: selectedAdminId } : student
    ));

    // Update Database
    const { error } = await supabase
      .from('tryout_submissions')
      .update({ status: 'accepted', assigned_to: selectedAdminId })
      .eq('id', dbId);

    if (error) alert("Failed to update database.");
  };

  // 4. Update Reject logic to save to database
  const handleReject = async (dbId: string) => {
    // Update UI immediately
    setStudents(students.map(student => 
      student.id === dbId ? { ...student, status: 'rejected', assigned_to: null } : student
    ));

    // Update Database
    const { error } = await supabase
      .from('tryout_submissions')
      .update({ status: 'rejected', assigned_to: null })
      .eq('id', dbId);

    if (error) alert("Failed to update database.");
  };

  const handleSelectAdmin = (dbId: string, adminId: string) => {
    setAdminSelections({ ...adminSelections, [dbId]: adminId });
  };

  // 5. Updated Filters (Note: comparing against 'pending' or null so new entries show up)
  const pendingStudents = students.filter(s => s.status === 'pending' || !s.status);
  const rejectedStudents = students.filter(s => s.status === 'rejected');
  const admin1Students = students.filter(s => s.status === 'accepted' && s.assigned_to === 'admin_1');
  const admin2Students = students.filter(s => s.status === 'accepted' && s.assigned_to === 'admin_2');
  const admin3Students = students.filter(s => s.status === 'accepted' && s.assigned_to === 'admin_3');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Sports Tryouts Management</h1>
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
                  <td className="px-6 py-4 max-w-[200px]">
                    <p className="truncate text-xs text-gray-500" title={student.experience}>
                      {student.experience || "No experience listed"}
                    </p>
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
          <ul className="divide-y divide-gray-200 p-2">
            {admin1Students.length === 0 && <li className="p-4 text-center text-sm text-gray-500">No students assigned.</li>}
            {admin1Students.map(student => (
              <li key={student.id} className="p-3 hover:bg-gray-50 rounded-md transition-colors">
                <p className="text-sm font-bold text-gray-900">{student.name} <span className="text-blue-600 text-xs ml-1">({student.student_id})</span></p>
                <p className="text-xs text-gray-500">{student.sport_event} - {student.position}</p>
              </li>
            ))}
          </ul>
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

    </div>
  );
}