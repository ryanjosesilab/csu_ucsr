'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase'; // Adjust path if necessary

interface Student {
  id: string;
  student_id: string;
  name: string;
  degree: string;
  sport_event: string;
  position: string;
  status: 'pending' | 'accepted' | 'rejected' | null; 
  assigned_to: string | null; 
}

export default function TryoutsDisplayPage() {
  const [students, setStudents] = useState<Student[]>([]);

  useEffect(() => {
    const fetchStudents = async () => {
      const { data, error } = await supabase
        .from('tryout_submissions')
        .select('*')
        
        .eq('is_archived', false);

      if (data) setStudents(data);
    };

    // Fetch immediately on load
    fetchStudents();

    // Auto-refresh data every 10 seconds for the TV display!
    const interval = setInterval(fetchStudents, 10000);
    return () => clearInterval(interval);
  }, []);

  const pendingStudents = students.filter(s => s.status === 'pending' || !s.status);
  const rejectedStudents = students.filter(s => s.status === 'rejected');
  const coach1Students = students.filter(s => s.status === 'accepted' && s.assigned_to === 'admin_1');
  const coach2Students = students.filter(s => s.status === 'accepted' && s.assigned_to === 'admin_2');
  const coach3Students = students.filter(s => s.status === 'accepted' && s.assigned_to === 'admin_3');

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-extrabold text-gray-900 uppercase tracking-widest">Live Tryout Results</h1>
        <p className="text-gray-500 mt-2">Updates automatically every 10 seconds</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
        {/* TABLE 1: PENDING (Name, ID, Course) */}
        <div className="bg-white rounded-xl shadow-lg border-t-8 border-yellow-400 overflow-hidden">
          <div className="bg-yellow-50 p-4 border-b border-yellow-200">
            <h2 className="text-2xl font-bold text-yellow-800 text-center uppercase">Pending Evaluation</h2>
          </div>
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 uppercase text-sm">
              <tr><th className="p-4">Name</th><th className="p-4">ID Number</th><th className="p-4">Course</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-lg font-medium text-gray-800">
              {pendingStudents.map(s => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="p-4">{s.name}</td><td className="p-4 text-blue-600">{s.student_id}</td><td className="p-4 text-gray-500">{s.degree}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* TABLE 5: REJECTED (Name, ID, Course) */}
        <div className="bg-white rounded-xl shadow-lg border-t-8 border-red-500 overflow-hidden">
          <div className="bg-red-50 p-4 border-b border-red-200">
            <h2 className="text-2xl font-bold text-red-800 text-center uppercase">Not Selected</h2>
          </div>
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 uppercase text-sm">
              <tr><th className="p-4">Name</th><th className="p-4">ID Number</th><th className="p-4">Course</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-lg font-medium text-gray-800">
              {rejectedStudents.map(s => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="p-4">{s.name}</td><td className="p-4 text-red-600">{s.student_id}</td><td className="p-4 text-gray-500">{s.degree}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* TABLES 2, 3, 4: COACH ROSTERS (Name, ID, Sport, Position) */}
      <h2 className="text-3xl font-extrabold text-gray-900 uppercase text-center mt-12 mb-6 tracking-wider">Drafted Rosters</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Coach 1 */}
        <div className="bg-white rounded-xl shadow-lg border-t-8 border-blue-500 overflow-hidden">
          <div className="bg-blue-50 p-3 border-b border-blue-200 text-center">
            <h3 className="text-xl font-bold text-blue-800 uppercase">Coach Jopeter</h3>
          </div>
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr><th className="p-3">Name & ID</th><th className="p-3">Sport & Position</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-800">
              {coach1Students.map(s => (
                <tr key={s.id}>
                  <td className="p-3">{s.name} <br/><span className="text-blue-600 text-xs">{s.student_id}</span></td>
                  <td className="p-3 text-gray-600">{s.sport_event} <br/><span className="text-xs text-gray-400">{s.position}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Coach 2 */}
        <div className="bg-white rounded-xl shadow-lg border-t-8 border-teal-500 overflow-hidden">
          <div className="bg-teal-50 p-3 border-b border-teal-200 text-center">
            <h3 className="text-xl font-bold text-teal-800 uppercase">Coach Johan</h3>
          </div>
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr><th className="p-3">Name & ID</th><th className="p-3">Sport & Position</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-800">
              {coach2Students.map(s => (
                <tr key={s.id}>
                  <td className="p-3">{s.name} <br/><span className="text-teal-600 text-xs">{s.student_id}</span></td>
                  <td className="p-3 text-gray-600">{s.sport_event} <br/><span className="text-xs text-gray-400">{s.position}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Coach 3 */}
        <div className="bg-white rounded-xl shadow-lg border-t-8 border-indigo-500 overflow-hidden">
          <div className="bg-indigo-50 p-3 border-b border-indigo-200 text-center">
            <h3 className="text-xl font-bold text-indigo-800 uppercase">Coach Kim</h3>
          </div>
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr><th className="p-3">Name & ID</th><th className="p-3">Sport & Position</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-800">
              {coach3Students.map(s => (
                <tr key={s.id}>
                  <td className="p-3">{s.name} <br/><span className="text-indigo-600 text-xs">{s.student_id}</span></td>
                  <td className="p-3 text-gray-600">{s.sport_event} <br/><span className="text-xs text-gray-400">{s.position}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}