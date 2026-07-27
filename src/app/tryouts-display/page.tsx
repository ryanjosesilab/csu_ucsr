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
  const [contactName, setContactName] = useState('Loading...');
  const [contactTitle, setContactTitle] = useState('Loading...');

  useEffect(() => {
    const fetchData = async () => {
      // 1. Fetch active tryout submissions
      const { data: studentData, error: studentError } = await supabase
        .from('tryout_submissions')
        .select('*')
        .eq('is_archived', false);

      if (studentData) setStudents(studentData);
      if (studentError) console.error("Error fetching students:", studentError);

      // 2. Fetch Settings for Tryouts Contact Person
      const { data: settingsData, error: settingsError } = await supabase
        .from('settings')
        .select('tryout_contact_name, tryout_contact_title')
        .single();

      if (settingsData) {
        setContactName(settingsData.tryout_contact_name || 'Designated Contact Person');
        setContactTitle(settingsData.tryout_contact_title || 'Sports Coordinator');
      }
      if (settingsError) console.error("Error fetching settings:", settingsError);
    };

    // Fetch immediately on load
    fetchData();

    // Auto-refresh data every 10 seconds for the TV display!
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const pendingStudents = students.filter(s => s.status === 'pending' || !s.status);
  const rejectedStudents = students.filter(s => s.status === 'rejected');
  const acceptedStudents = students.filter(s => s.status === 'accepted');

  return (
    <div className="min-h-screen bg-[#0F4E15] p-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-extrabold text-white uppercase tracking-widest">Live Tryout Results</h1>
        <p className="text-white/80 mt-2">Updates automatically every 10 seconds</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
        {/* TABLE 1: PENDING (ID, Course) */}
        <div className="bg-white rounded-xl shadow-lg border-t-8 border-yellow-400 overflow-hidden">
          <div className="bg-yellow-50 p-4 border-b border-yellow-200">
            <h2 className="text-2xl font-bold text-yellow-800 text-center uppercase">Pending Evaluation</h2>
          </div>
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 uppercase text-sm">
              <tr><th className="p-4">ID Number</th><th className="p-4">Course</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-lg font-medium text-gray-800">
              {pendingStudents.map(s => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="p-4 text-blue-600">{s.student_id}</td><td className="p-4 text-gray-500">{s.degree}</td>
                </tr>
              ))}
              {pendingStudents.length === 0 && (
                <tr><td colSpan={2} className="p-4 text-center text-gray-400">No pending evaluations.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* TABLE 2: REJECTED (ID, Course) */}
        <div className="bg-white rounded-xl shadow-lg border-t-8 border-red-500 overflow-hidden">
          <div className="bg-red-50 p-4 border-b border-red-200">
            <h2 className="text-2xl font-bold text-red-800 text-center uppercase">Not Selected</h2>
          </div>
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 uppercase text-sm">
              <tr><th className="p-4">ID Number</th><th className="p-4">Course</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-lg font-medium text-gray-800">
              {rejectedStudents.map(s => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="p-4 text-red-600">{s.student_id}</td><td className="p-4 text-gray-500">{s.degree}</td>
                </tr>
              ))}
              {rejectedStudents.length === 0 && (
                <tr><td colSpan={2} className="p-4 text-center text-gray-400">No records found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION: ACCEPTED STUDENTS */}
      <div className="mt-12 bg-white rounded-xl shadow-lg border-t-8 border-green-600 overflow-hidden">
        <div className="bg-green-50 p-6 border-b border-green-200 text-center">
          <h2 className="text-3xl font-extrabold text-green-900 uppercase tracking-wider">Accepted Students</h2>
          <p className="text-sm font-semibold text-green-700 mt-2">
            Please proceed to <span className="uppercase">{contactName}</span> ({contactTitle}) for your next consultation and instructions.
          </p>
        </div>

        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              <th className="p-4">Name & ID Number</th>
              <th className="p-4">Course</th>
              <th className="p-4">Sport & Position</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-base font-medium text-gray-800">
            {acceptedStudents.map(s => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="p-4">
                  <span className="font-bold">{s.name}</span> <br/>
                  <span className="text-green-600 text-xs">{s.student_id}</span>
                </td>
                <td className="p-4 text-gray-600">{s.degree}</td>
                <td className="p-4 text-gray-600">
                  {s.sport_event} <br/>
                  <span className="text-xs text-gray-400">{s.position}</span>
                </td>
              </tr>
            ))}
            {acceptedStudents.length === 0 && (
              <tr><td colSpan={3} className="p-6 text-center text-gray-400">No accepted students recorded yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}