'use client';
import React, { useState } from 'react';
import { FaCheck, FaTimes, FaUserShield, FaBan, FaHourglassHalf } from 'react-icons/fa';

interface Student {
  id: string;
  name: string;
  degree: string;
  sport: string;
  position: string;
  college: string;
  status: 'pending' | 'accepted' | 'rejected'; // Tell TS these are the only 3 allowed statuses
  assignedTo: string | null;                   // Tell TS this can be a string OR null
}


// 1. Define our initial mock data with the Student[] type attached
const initialStudents: Student[] = [
  { id: '1', name: 'John Doe', degree: 'BSIT', sport: 'Basketball', position: 'Point Guard', college: 'CCIS', status: 'pending', assignedTo: null },
  { id: '2', name: 'Jane Smith', degree: 'BSN', sport: 'Volleyball', position: 'Spiker', college: 'CMNS', status: 'pending', assignedTo: null },
  { id: '3', name: 'Mike Johnson', degree: 'BSED', sport: 'Basketball', position: 'Center', college: 'CED', status: 'pending', assignedTo: null },
  { id: '4', name: 'Sarah Wilson', degree: 'BSCE', sport: 'Badminton', position: 'Singles', college: 'CEGS', status: 'pending', assignedTo: null },
  { id: '5', name: 'Chris Brown', degree: 'BSBA', sport: 'Football', position: 'Goalkeeper', college: 'CAA', status: 'pending', assignedTo: null },
];
//yeah

// Define your admins
const ADMINS = [
  { id: 'admin_1', name: 'Coach Davis (Admin 1)' },
  { id: 'admin_2', name: 'Coach Smith (Admin 2)' },
  { id: 'admin_3', name: 'Coach Johnson (Admin 3)' },
];

export default function TryoutsAdminPage() {
  // State to hold all students
  const [students, setStudents] = useState<Student[]>(initialStudents);
  
  // State to track which admin is selected in the dropdown for each row
  const [adminSelections, setAdminSelections] = useState<Record<string, string>>({});

  // Function to handle accepting a student
  const handleAccept = (studentId: string) => {
    const selectedAdminId = adminSelections[studentId] || ADMINS[0].id; // Default to Admin 1 if none selected
    setStudents(students.map(student => 
      student.id === studentId 
        ? { ...student, status: 'accepted', assignedTo: selectedAdminId } 
        : student
    ));
  };

  // Function to handle rejecting a student
  const handleReject = (studentId: string) => {
    setStudents(students.map(student => 
      student.id === studentId 
        ? { ...student, status: 'rejected', assignedTo: null } 
        : student
    ));
  };

  // Update dropdown selection state
  const handleSelectAdmin = (studentId: string, adminId: string) => {
    setAdminSelections({ ...adminSelections, [studentId]: adminId });
  };

  // Filter students into their respective tables
  const pendingStudents = students.filter(s => s.status === 'pending');
  const rejectedStudents = students.filter(s => s.status === 'rejected');
  const admin1Students = students.filter(s => s.status === 'accepted' && s.assignedTo === 'admin_1');
  const admin2Students = students.filter(s => s.status === 'accepted' && s.assignedTo === 'admin_2');
  const admin3Students = students.filter(s => s.status === 'accepted' && s.assignedTo === 'admin_3');

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
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Sport / Position</th>
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
                  <td className="px-6 py-4 font-medium text-gray-900">{student.name}<br/><span className="text-xs text-gray-400">{student.degree}</span></td>
                  <td className="px-6 py-4">{student.sport}<br/><span className="text-xs text-gray-400">{student.position}</span></td>
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
              <h2 className="text-md font-bold text-gray-800">Coach Davis</h2>
            </div>
            <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-0.5 rounded-full">{admin1Students.length}</span>
          </div>
          <ul className="divide-y divide-gray-200 p-2">
            {admin1Students.length === 0 && <li className="p-4 text-center text-sm text-gray-500">No students assigned.</li>}
            {admin1Students.map(student => (
              <li key={student.id} className="p-3 hover:bg-gray-50 rounded-md transition-colors">
                <p className="text-sm font-bold text-gray-900">{student.name}</p>
                <p className="text-xs text-gray-500">{student.sport} - {student.position}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* TABLE 4: ADMIN 2 ROSTER */}
        <div className="bg-white shadow rounded-lg border-t-4 border-teal-500 overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center">
              <FaUserShield className="text-teal-500 mr-2" />
              <h2 className="text-md font-bold text-gray-800">Coach Smith</h2>
            </div>
            <span className="bg-teal-100 text-teal-800 text-xs font-bold px-2.5 py-0.5 rounded-full">{admin2Students.length}</span>
          </div>
          <ul className="divide-y divide-gray-200 p-2">
            {admin2Students.length === 0 && <li className="p-4 text-center text-sm text-gray-500">No students assigned.</li>}
            {admin2Students.map(student => (
              <li key={student.id} className="p-3 hover:bg-gray-50 rounded-md transition-colors">
                <p className="text-sm font-bold text-gray-900">{student.name}</p>
                <p className="text-xs text-gray-500">{student.sport} - {student.position}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* TABLE 5: ADMIN 3 ROSTER */}
        <div className="bg-white shadow rounded-lg border-t-4 border-indigo-500 overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center">
              <FaUserShield className="text-indigo-500 mr-2" />
              <h2 className="text-md font-bold text-gray-800">Coach Johnson</h2>
            </div>
            <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-2.5 py-0.5 rounded-full">{admin3Students.length}</span>
          </div>
          <ul className="divide-y divide-gray-200 p-2">
            {admin3Students.length === 0 && <li className="p-4 text-center text-sm text-gray-500">No students assigned.</li>}
            {admin3Students.map(student => (
              <li key={student.id} className="p-3 hover:bg-gray-50 rounded-md transition-colors">
                <p className="text-sm font-bold text-gray-900">{student.name}</p>
                <p className="text-xs text-gray-500">{student.sport} - {student.position}</p>
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
                <th className="px-6 py-3">Name</th>
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
                  <td className="px-6 py-4 font-medium text-gray-900">{student.name}</td>
                  <td className="px-6 py-4">{student.sport}</td>
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