'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../../utils/supabase';
import { FaCheck, FaTimes, FaCalendarAlt, FaUserCheck, FaBan, FaFileAlt, FaClock } from 'react-icons/fa';
import Link from 'next/dist/client/link';

interface GymBooking {
  id: number;
  student_id: string;
  name: string;
  schedule: string; 
  is_event_training: boolean;
  status: string;
  feedback?: string;
}

const REJECT_REASONS = [
  "Gym is full",
  "Gym Unavailable",
  "Gym utilized by Athletes",
  "Conflict Schedule, select different time slot"
];

export default function GymManagementPage() {
  const [pendingSearchQuery, setPendingSearchQuery] = useState("");
  const [requests, setRequests] = useState<GymBooking[]>([]);
  const [rejectFeedback, setRejectFeedback] = useState<Record<number, string>>({});
  const [activePanelTab, setActivePanelTab] = useState<'timeline' | 'attendance'>('timeline');
  
  const getLocalToday = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [selectedDate, setSelectedDate] = useState<string>(getLocalToday());

  // --- NEW: FULL CALENDAR STATES & LOGIC ---
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [calYear, setCalYear] = useState(new Date().getFullYear());

  const nextMonth = () => {
    if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); } 
    else { setCalMonth(m => m + 1); }
  };

  const prevMonth = () => {
    if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); } 
    else { setCalMonth(m => m - 1); }
  };

  // Calculate grid padding and days for the month
  const firstDayOfMonth = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const blankDays = Array.from({ length: firstDayOfMonth }, (_, i) => i);
  const monthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  // -----------------------------------------

  useEffect(() => {
    // 1. Fetch initially when the page loads
    fetchRequests();

    // 2. Set up the Realtime Subscription listener
    const gymChannel = supabase
      .channel('realtime-gym-bookings')
      .on(
        'postgres_changes',
        {
          event: '*', // Listens for INSERT, UPDATE, and DELETE
          schema: 'public',
          table: 'gym_bookings'
        },
        () => {
          // Refetch the data so the UI stays perfectly in sync
          fetchRequests(); 
        }
      )
      .subscribe();

    // 3. Cleanup the subscription when the admin leaves the page
    return () => {
      supabase.removeChannel(gymChannel);
    };
  }, []);

  const fetchRequests = async () => {
    const { data } = await supabase
      .from('gym_bookings')
      .select('*')
      .order('schedule', { ascending: true });
      
    if (data) {
      const cleanedData = data.map(req => ({
        ...req,
        status: (req.status || '').replace(/['"]+/g, '').toLowerCase()
      }));
      setRequests(cleanedData as GymBooking[]);
    }
  };

  // Safe Date Extractor (Guarantees YYYY-MM-DD match)
  const getDateStr = (isoString: string) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch {
      // Fallback if the database string is weird
      return isoString.split('T')[0];
    }
  };

  const getTimeStr = (isoString: string) => {
    if (!isoString) return '';
    try {
      return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return "Invalid Time";
    }
  };

  const handleAccept = async (id: number) => {
    const { error } = await supabase
      .from('gym_bookings')
      .update({ status: 'accepted', feedback: null })
      .eq('id', id);

    if (!error) {
      setRequests(prev => prev.map(req => req.id === id ? { ...req, status: 'accepted' } : req));
    }
  };

  const handleReject = async (id: number) => {
    const feedback = rejectFeedback[id];
    if (!feedback) {
      alert("Please select a feedback reason before rejecting.");
      return;
    }

    const { error } = await supabase
      .from('gym_bookings')
      .update({ status: 'rejected', feedback: feedback })
      .eq('id', id);

    if (!error) {
      setRequests(prev => prev.map(req => req.id === id ? { ...req, status: 'rejected', feedback } : req));
    } else {
      console.error(error);
      alert("Error rejecting request. Check the console.");
    }
  };

  const handleAttendance = async (req: GymBooking, didAttend: boolean) => {
    if (didAttend) {
      // (Keep your existing "true" logic here - marking them as active)
      const { error } = await supabase
        .from('gym_bookings')
        .update({ status: 'active' })
        .eq('id', req.id);
        
      if (!error) {
        setRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: 'active' } : r));
      }
    } else {
      // --- UPGRADED "TWO STRIKES" BAN LOGIC ---
      if (!confirm(`Mark ${req.name} as a No-Show?`)) return;

      // 1. Mark THIS current booking as 'missed'
      await supabase.from('gym_bookings').update({ status: 'missed' }).eq('id', req.id);

      // 2. Immediately update the UI so it disappears from the Awaiting list
      setRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: 'missed' } : r));

      // 3. Count how many total 'missed' sessions this student now has
      const { data: missedBookings, error: countError } = await supabase
        .from('gym_bookings')
        .select('id')
        .eq('student_id', req.student_id)
        .eq('status', 'missed');

      if (countError) {
        console.error("Error counting missed bookings:", countError);
        return;
      }

      const totalMisses = missedBookings ? missedBookings.length : 0;

      // 4. If they have hit the threshold (2 or more misses), ban them!
      if (totalMisses >= 2) {
        // Calculate the unban date (7 days from right now)
        const banUntilDate = new Date();
        banUntilDate.setDate(banUntilDate.getDate() + 7);

        // Update the 'students' table with this unban date
        const { error: banError } = await supabase
          .from('students')
          .update({ banned_until: banUntilDate.toISOString() })
          .eq('student_id', req.student_id);

        if (banError) {
           console.error("Error applying automatic ban:", banError);
        } else {
           alert(`${req.name} has missed ${totalMisses} sessions and is now automatically banned until ${banUntilDate.toLocaleDateString()}.`);
        }
      } else {
        alert(`${req.name} marked as No-Show. This is Strike ${totalMisses}. Next strike will result in a 7-day ban.`);
      }
    }
  };

  // --- FILTERING ---
  const pendingRequests = requests.filter(r => r.status === 'pending');
  
  const todaysSchedule = requests.filter(r => 
    getDateStr(r.schedule) === selectedDate && 
    (r.status === 'accepted' || r.status === 'active')
  );

  const awaitingConfirmation = requests.filter(r => 
    getDateStr(r.schedule) === selectedDate && 
    r.status === 'accepted'
  );

 // NEW: Smart Hint Counter
  const acceptedOtherDays = requests.filter(r => 
    getDateStr(r.schedule) !== selectedDate && 
    (r.status === 'accepted' || r.status === 'active')
  );

 // --- NEW: HOURLY TIMELINE LOGIC WITH REAL-TIME FILTERING ---
  // Groups today's accepted/active students by their hour block
  const hourlySlots: Record<number, GymBooking[]> = {};
  todaysSchedule.forEach(req => {
    const hour = new Date(req.schedule).getHours(); // Gets the hour (e.g., 9 for 9:00 AM)
    if (!hourlySlots[hour]) hourlySlots[hour] = [];
    hourlySlots[hour].push(req);
  });
  
  // Gets the current date and the actual current hour (e.g., 10 for 10:01 AM)
  const todayStr = getLocalToday();
  const currentHour = new Date().getHours();

  // Sort and filter the hours
  const sortedHours = Object.keys(hourlySlots)
    .map(Number)
    .filter(hour => {
      // 1. If the selected date is in the past, hide all hourly slots entirely
      if (selectedDate < todayStr) return false;
      
      // 2. If the selected date is in the future, show all scheduled slots
      if (selectedDate > todayStr) return true;
      
      // 3. If it is TODAY, only show the slot if the current hour hasn't passed the end time.
      // Example: For 9:00 AM slot (hour = 9), it ends at 10. 
      // If current time is 10:01 AM (currentHour = 10), then 10 < 10 is false -> It gets hidden!
      return currentHour < hour + 1;
    })
    .sort((a, b) => a - b);

const filteredPendingRequests = pendingRequests.filter(req => 
  req.student_id?.toLowerCase().includes(pendingSearchQuery.toLowerCase())
);


  return (
    <div className="p-8 space-y-12">
      <div className="relative overflow-hidden flex justify-between items-center mb-8 bg-[#0F4E15] p-6 rounded-lg shadow-md border border-white/10">
      
      {/* Absolute Background Image pinned to the right */}
      <div 
        className="absolute inset-y-0 right-0 w-1/2 lg:w-[60%] bg-cover bg-center z-0"
        style={{ backgroundImage: "url('/try-header.png')" }}
      >
        {/* Gradient overlay to smoothly blend the green into the image */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0F4E15] via-[#0F4E15]/80 to-transparent"></div>
      </div>

      {/* Left Content (Text) */}
      <div className="relative z-10">
        <h1 className="text-3xl font-bold text-white">Gym Session Management</h1>
        <p className="text-white/80 mt-1">Manage requests, view the calendar, and track attendance.</p>
      </div>

      {/* Right Content (Button) */}
      <div className="relative z-10">
        <Link href="/admin/gym-management-history">
          <button 
            className="bg-blue-600 text-white p-3 rounded hover:bg-blue-700 transition shadow-sm flex items-center justify-center"
            title="View Gym History"
          >
            <FaFileAlt className="text-lg" />
          </button>
        </Link>
      </div>
      
    </div>

      <section className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
  {/* Changed bg-blue-50 and border-blue-100 to standard gray classes */}
  <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
    {/* Changed text-blue-800 to text-gray-800 */}
    <h2 className="text-lg font-bold text-gray-800">1. Pending Gym Requests</h2>
    
    <input
      type="text"
      placeholder="Search ID Number..."
      className="border border-gray-300 rounded px-3 py-1.5 text-sm w-64 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
      value={pendingSearchQuery}
      onChange={(e) => setPendingSearchQuery(e.target.value)}
    />
  </div>
  <table className="w-full text-sm text-left">
    <thead className="bg-gray-50 border-b">
      <tr>
        <th className="p-4">Name (ID)</th>
        <th className="p-4">Requested Date</th>
        <th className="p-4">Time Slot</th>
        <th className="p-4">Reject Feedback</th>
        <th className="p-4 text-center">Actions</th>
      </tr>
    </thead>
    <tbody>
      {/* UPDATED: Uses filtered array for empty state */}
      {filteredPendingRequests.length === 0 && (
        <tr>
          <td colSpan={5} className="p-6 text-center text-gray-500">
            {pendingSearchQuery ? "No matching ID found." : "No pending requests."}
          </td>
        </tr>
      )}
      
      {/* UPDATED: Maps over the filtered array */}
      {filteredPendingRequests.map(req => (
        <tr key={req.id} className="border-b hover:bg-gray-50">
          <td className="p-4 font-bold">
            {req.name} 
            <span className="text-gray-400 font-normal ml-1">({req.student_id})</span>
            {req.is_event_training && <span className="ml-2 bg-purple-100 text-purple-800 text-[10px] px-2 py-0.5 rounded font-bold uppercase">Employee</span>}
          </td>
          <td className="p-4">{getDateStr(req.schedule)}</td>
          <td className="p-4 font-medium">{getTimeStr(req.schedule)}</td>
          <td className="p-4">
            <select 
              className="border p-2 rounded text-xs w-full max-w-xs"
              value={rejectFeedback[req.id] || ""}
              onChange={(e) => setRejectFeedback({...rejectFeedback, [req.id]: e.target.value})}
            >
              <option value="" disabled>Select reason...</option>
              {REJECT_REASONS.map((reason, i) => <option key={i} value={reason}>{reason}</option>)}
            </select>
          </td>
          <td className="p-4 flex justify-center gap-2">
            <button onClick={() => handleAccept(req.id)} className="bg-[#0F4E15] hover:bg-green-700 text-white px-3 py-1.5 rounded flex items-center text-xs font-bold">
              <FaCheck className="mr-1" /> Accept
            </button>
            <button onClick={() => handleReject(req.id)} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded flex items-center text-xs font-bold">
              <FaTimes className="mr-1" /> Reject
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</section>

      
     {/* ================= SECTIONS 2 & 3: CALENDAR & INTERACTIVE SIDE PANEL ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        
       
        <section className="lg:col-span-2 bg-white rounded-lg shadow border border-gray-200 overflow-hidden flex flex-col h-full">
          {/* Calendar Header */}
          <div className="bg-gray-800 px-6 py-4 flex justify-between items-center text-white">
            <h2 className="text-lg font-bold flex items-center">
              <FaCalendarAlt className="mr-2"/> Monthly Overview
            </h2>
            <div className="flex items-center gap-4">
              <button onClick={prevMonth} className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded font-bold transition">&lt;</button>
              <span className="text-lg font-bold w-40 text-center">{monthNames[calMonth]} {calYear}</span>
              <button onClick={nextMonth} className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded font-bold transition">&gt;</button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="p-6 bg-gray-50 flex-1">
            <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-bold text-gray-500 uppercase">
              <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
            </div>

            <div className="grid grid-cols-7 gap-2">
              {blankDays.map(step => (
                <div key={`blank-${step}`} className="h-24 bg-transparent border border-transparent"></div>
              ))}

              {monthDays.map(day => {
                const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const isPastDate = dateStr < getLocalToday();
                const dayRequests = requests.filter(r => getDateStr(r.schedule) === dateStr);
               const hasPending = !isPastDate && dayRequests.some(r => r.status === 'pending');
                const hasAccepted = !isPastDate && dayRequests.some(r => r.status === 'accepted' || r.status === 'active');
                const isSelected = selectedDate === dateStr;

                return (
                  <div 
                    key={day} 
                    onClick={() => setSelectedDate(dateStr)}
                    className={`h-24 border rounded-lg p-2 flex flex-col justify-between cursor-pointer transition-all ${
                      isSelected ? 'border-blue-500 bg-blue-50 shadow-md ring-2 ring-blue-200' : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    <span className={`text-sm font-bold ${isSelected ? 'text-blue-700' : 'text-gray-700'}`}>{day}</span>
                    <div className="flex gap-1 justify-end">
                      {hasPending && <div className="w-3 h-3 rounded-full bg-gray-400 shadow-sm" title="Pending requests"></div>}
                      {hasAccepted && <div className="w-3 h-3 rounded-full bg-green-500 shadow-sm" title="Accepted students"></div>}
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-6 flex gap-4 text-xs font-semibold text-gray-500 justify-end">
              <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-gray-400"></div> Pending Requests</div>
              <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-green-500"></div> Accepted / Active</div>
            </div>
          </div>
        </section>

        {/* RIGHT SIDE (1 Column): COMBINED TABBED PANEL */}
        <section className="lg:col-span-1 bg-white rounded-lg shadow border border-gray-200 flex flex-col h-[600px]">
          
  {/* TAB BUTTONS HEADER - Using standard gray/white so globals.css inverts them automatically */}
  <div className="flex border-b border-gray-200 bg-gray-50">
    <button 
      onClick={() => setActivePanelTab('timeline')}
      className={`flex-1 py-4 text-sm font-bold flex justify-center items-center gap-2 transition-all ${
        activePanelTab === 'timeline' 
          ? 'bg-white border-b-2 border-blue-600' // bg-white will turn dark automatically
          : 'bg-gray-50 text-gray-500 hover:bg-gray-200' // bg-gray-50 will turn dark automatically
      }`}
    >
      <FaClock /> Hourly Timeline
    </button>
    
    <button 
      onClick={() => setActivePanelTab('attendance')}
      className={`flex-1 py-4 text-sm font-bold flex justify-center items-center gap-2 transition-all ${
        activePanelTab === 'attendance' 
          ? 'bg-white border-b-2 border-blue-600'
          : 'bg-gray-50 text-gray-500 hover:bg-gray-200'
      }`}
    >
      <FaUserCheck /> Attendance
      
      {/* Show a red dot if there are students waiting! */}
      {awaitingConfirmation.length > 0 && (
        <span className="bg-red-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
          {awaitingConfirmation.length}
        </span>
      )}
    </button>
  </div>

  {/* TAB CONTENT AREA - Using bg-gray-50 so it turns dark automatically */}
  <div className="p-4 flex-1 overflow-y-auto bg-gray-50">
    
    {/* --- TAB 1: TIMELINE CONTENT --- */}
    {activePanelTab === 'timeline' && (
      <div className="animate-in fade-in duration-300">
        <h3 className="font-bold mb-4 border-b pb-2">Timeline for {selectedDate}</h3>
        {sortedHours.length === 0 ? (
          <p className="italic text-sm text-center mt-10">No students scheduled for this date.</p>
        ) : (
          <div className="space-y-4">
            {sortedHours.map(hour => {
              const students = hourlySlots[hour];
              const nextHour = hour + 1;
              const formatTime = (h: number) => {
                const ampm = h >= 12 ? 'PM' : 'AM';
                const displayH = h % 12 || 12;
                return `${displayH}:00 ${ampm}`;
              };
              const timeString = `${formatTime(hour)} - ${formatTime(nextHour)}`;
              const isFull = students.length >= 4;

              return (
                <div key={hour} className={`border rounded-lg p-3 bg-white shadow-sm ${isFull ? 'border-red-400' : 'border-gray-300'}`}>
                  <div className="flex justify-between items-center mb-3 border-b pb-2">
                    <span className={`font-bold text-sm ${isFull ? 'text-red-500' : 'text-blue-500'}`}>{timeString}</span>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${isFull ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}`}>
                      {students.length} / 4 Slots
                    </span>
                  </div>
                  <ul className="space-y-2">
                    {students.map(s => (
                      <li key={s.id} className="text-xs flex items-center justify-between bg-gray-50 p-2 rounded border border-gray-100">
                        <span className="font-medium">{s.name}</span>
                        <span className={`flex items-center gap-1 ${s.status === 'active' ? 'text-green-500 font-bold' : ''}`}>
                          {s.status === 'active' && <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>}
                          {s.status === 'active' ? 'In Gym' : 'Scheduled'}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
      </div>
    )}

    {/* --- TAB 2: ATTENDANCE CONTENT --- */}
    {activePanelTab === 'attendance' && (
      <div className="animate-in fade-in duration-300">
        <h3 className="font-bold mb-4 border-b pb-2">Awaiting Entry for {selectedDate}</h3>
        <p className="text-xs mb-4">Select Present to grant entry, or Absent to apply a ban strike.</p>
        
        {awaitingConfirmation.length === 0 ? (
          <p className="italic text-sm text-center mt-10">All scheduled students for this date have been processed.</p>
        ) : (
          <ul className="space-y-3">
            {awaitingConfirmation.map(req => {
              const reqHour = new Date(req.schedule).getHours();
              const isLate = selectedDate === getLocalToday() && new Date().getHours() >= reqHour + 1;

              return (
                <li key={req.id} className={`p-4 bg-white border rounded-lg shadow-sm ${isLate ? 'border-orange-400' : 'border-gray-200'}`}>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-bold">{req.name}</p>
                      <p className={`text-xs font-medium ${isLate ? 'text-orange-500' : 'text-blue-500'}`}>
                        {getTimeStr(req.schedule)}
                      </p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded ${isLate ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                      {isLate ? 'Overdue / Late' : 'Awaiting Entry'}
                    </span>
                  </div>
                  
                  <div className="flex gap-2">
                    {/* FIXED: Changed to solid green background so it's visible in both modes */}
                    <button 
                      onClick={() => handleAttendance(req, true)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded text-sm font-bold transition flex justify-center items-center"
                    >
                      <FaCheck className="mr-2" /> Present
                    </button>
                    {/* FIXED: Changed to solid red background so it's visible in both modes */}
                    <button 
                      onClick={() => handleAttendance(req, false)}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded text-sm font-bold transition flex justify-center items-center"
                    >
                      <FaBan className="mr-2" /> Absent
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    )}
    
  </div>
</section>

      </div>
    </div>
  );
}