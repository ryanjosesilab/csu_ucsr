"use client";
import { useState, useEffect, useCallback } from 'react';
import { supabase } from "../../utils/supabase";
import { useRouter } from 'next/navigation';
import {
  FaExclamationCircle,
  FaUsers,
  FaClock,
  FaBan,
  FaDumbbell,
  FaBasketballBall,
  FaDrum,
  FaRunning,
  FaChevronRight
} from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
  const router = useRouter();

  const [stats, setStats] = useState({
    pendingTotal: 0,
    gymCurrent: 0,
    gymCapacity: 30,
    overdueEquipment: 0,
    activeBans: 0,
    pendingGym: 0,
    pendingEquipment: 0,
    pendingDlc: 0,
    pendingTryouts: 0
  });

 const [monthlyTrafficData, setMonthlyTrafficData] = useState<{day: string, users: number}[]>([]);
 const today = new Date().toISOString().split('T')[0];

  // 1. Wrap the fetch function in useCallback so it doesn't break the useEffect
  const fetchDashboardStats = useCallback(async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const currentTimestamp = new Date().toISOString(); 
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth();
      const startOfMonth = new Date(year, month, 1).toISOString();
      const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999).toISOString();
      const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();

      const [
        gymTrafficRes, pendingGymRes, pendingEqRes, pendingDlcRes,
        pendingTryoutsRes, autoBansRes, manualBansRes, overdueEqRes,
        monthlyBookingsRes
      ] = await Promise.all([
        supabase.from('gym_bookings').select('*', { count: 'exact', head: true }).eq('status', 'active').gte('schedule', `${today}T00:00:00.000Z`).lte('schedule', `${today}T23:59:59.999Z`),
        supabase.from('gym_bookings').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('equipment_borrowings').select('*', { count: 'exact', head: true }).ilike('status', 'pending'),
        supabase.from('dlc_request').select('*', { count: 'exact', head: true }).eq('status', 'pending').eq('is_archived', false).is('request_number', null),
        supabase.from('tryout_submissions').select('*', { count: 'exact', head: true }).eq('status', 'pending').eq('is_archived', false),
        supabase.from('students').select('*', { count: 'exact', head: true }).gt('banned_until', currentTimestamp),
        supabase.from('settings').select('banned_gym_students').eq('id', 1).single(),
        supabase.from('equipment_borrowings').select('*', { count: 'exact', head: true }).eq('status', 'Approved').lt('date_return', today),
        supabase.from('gym_bookings').select('schedule').gte('schedule', startOfMonth).lte('schedule', endOfMonth).in('status', ['accepted', 'active']) 
      ]);

      let manualBansCount = 0;
      if (manualBansRes.data?.banned_gym_students) {
        const bans = typeof manualBansRes.data.banned_gym_students === 'string' ? JSON.parse(manualBansRes.data.banned_gym_students) : manualBansRes.data.banned_gym_students;
        manualBansCount = Array.isArray(bans) ? bans.length : 0;
      }

      setStats({
        pendingTotal: (pendingGymRes.count || 0) + (pendingEqRes.count || 0) + (pendingDlcRes.count || 0) + (pendingTryoutsRes.count || 0),
        gymCurrent: gymTrafficRes.count || 0,
        gymCapacity: 30,
        overdueEquipment: overdueEqRes.count || 0,
        activeBans: (autoBansRes.count || 0) + manualBansCount, 
        pendingGym: pendingGymRes.count || 0,
        pendingEquipment: pendingEqRes.count || 0,
        pendingDlc: pendingDlcRes.count || 0,
        pendingTryouts: pendingTryoutsRes.count || 0
      });

      const trafficMap = Array.from({ length: daysInCurrentMonth }, (_, i) => ({ day: `${i + 1}`, users: 0 }));
      if (monthlyBookingsRes.data) {
        monthlyBookingsRes.data.forEach(booking => {
          const dayOfMonth = new Date(booking.schedule).getDate();
          trafficMap[dayOfMonth - 1].users += 1;
        });
      }
      setMonthlyTrafficData(trafficMap);

    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  }, []);

  useEffect(() => {
    fetchDashboardStats();

    // 2. Set up the Realtime Subscription listening to multiple tables
    const channel = supabase
      .channel('dashboard-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'gym_bookings' }, fetchDashboardStats)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'equipment_borrowings' }, fetchDashboardStats)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'dlc_request' }, fetchDashboardStats)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tryout_submissions' }, fetchDashboardStats)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'students' }, fetchDashboardStats)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchDashboardStats]);
 

  return (
    <div className="pb-10">
      <div className="flex items-center justify-between mb-6">
       <h1 className="text-2xl font-bold text-gray-900 dark:!text-white">UCSR Dashboard</h1>
        
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        <div className="bg-white rounded-lg shadow-sm border-l-4 border-red-500 p-5 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-red-500 uppercase mb-1">Requires Action</div>
            <div className="text-2xl font-bold text-gray-800">{stats.pendingTotal} Pending</div>
          </div>
          <FaExclamationCircle className="text-4xl text-gray-300" />
        </div>

        <div 
          onClick={() => router.push('/admin/gym-management')} 
          className="bg-white rounded-lg shadow-sm border-l-4 border-blue-500 p-5 flex items-center justify-between cursor-pointer hover:bg-blue-50 transition-colors"
        >
          <div>
            <div className="text-xs font-bold text-blue-500 uppercase mb-1">Gym Traffic Today</div>
            <div className="text-2xl font-bold text-gray-800">{stats.gymCurrent} / {stats.gymCapacity}</div>
            <div className="text-xs text-gray-500 mt-1">Currently Inside</div>
          </div>
          <FaUsers className="text-4xl text-gray-300" />
        </div>

        <div 
          onClick={() => router.push('/admin/borrowers')} 
          className="bg-white rounded-lg shadow-sm border-l-4 border-orange-500 p-5 flex items-center justify-between cursor-pointer hover:bg-orange-50 transition-colors"
        >
          <div>
            <div className="text-xs font-bold text-orange-500 uppercase mb-1">Overdue Equipment</div>
            <div className="text-2xl font-bold text-gray-800">{stats.overdueEquipment} Items</div>
            <div className="text-xs text-red-500 mt-1 font-medium">Needs return</div>
          </div>
          <FaClock className="text-4xl text-gray-300" />
        </div>

        <div 
          onClick={() => router.push('/admin/gym-banned-lists')} 
          className="bg-white rounded-lg shadow-sm border-l-4 border-gray-800 p-5 flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-colors"
        >
          <div>
            <div className="text-xs font-bold text-gray-800 uppercase mb-1">Active Bans</div>
            <div className="text-2xl font-bold text-gray-800">{stats.activeBans} Students</div>
            <div className="text-xs text-gray-500 mt-1">Currently suspended</div>
          </div>
          <FaBan className="text-4xl text-gray-300" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="bg-white shadow rounded-lg p-6 lg:col-span-2 border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Peak Gym Days (This Month)</h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTrafficData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="day" tick={{fontSize: 12, fill: '#6B7280'}} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                <YAxis tick={{fontSize: 12, fill: '#6B7280'}} axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: '#F3F4F6'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                <Bar dataKey="users" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6 border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Pending Approvals</h2>
          <p className="text-sm text-gray-500 mb-4">Click a category to review requests.</p>
          
          <div className="space-y-3">
            
            <div onClick={() => router.push('/admin/gym-management')} className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:border-teal-500 hover:shadow-sm transition-all group">
              <div className="flex items-center gap-3">
                <div className="bg-teal-100 p-2 rounded-md"><FaDumbbell className="text-teal-600" /></div>
                <span className="font-medium text-gray-700 group-hover:text-teal-600">Gym Bookings</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="bg-red-100 text-red-600 font-bold px-2 py-0.5 rounded-full text-xs">{stats.pendingGym}</span>
                <FaChevronRight className="text-gray-400 group-hover:text-teal-500 text-sm" />
              </div>
            </div>

            <div onClick={() => router.push('/admin/borrowers')} className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:border-blue-500 hover:shadow-sm transition-all group">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-md"><FaBasketballBall className="text-blue-600" /></div>
                <span className="font-medium text-gray-700 group-hover:text-blue-600">Equipment</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="bg-red-100 text-red-600 font-bold px-2 py-0.5 rounded-full text-xs">{stats.pendingEquipment}</span>
                <FaChevronRight className="text-gray-400 group-hover:text-blue-500 text-sm" />
              </div>
            </div>

            <div onClick={() => router.push('/admin/dlc')} className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:border-green-500 hover:shadow-sm transition-all group">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-md"><FaDrum className="text-green-600" /></div>
                <span className="font-medium text-gray-700 group-hover:text-green-600">DLC Requests</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="bg-red-100 text-red-600 font-bold px-2 py-0.5 rounded-full text-xs">{stats.pendingDlc}</span>
                <FaChevronRight className="text-gray-400 group-hover:text-green-500 text-sm" />
              </div>
            </div>

            <div onClick={() => router.push('/admin/tryouts')} className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:border-yellow-500 hover:shadow-sm transition-all group">
              <div className="flex items-center gap-3">
                <div className="bg-yellow-100 p-2 rounded-md"><FaRunning className="text-yellow-600" /></div>
                <span className="font-medium text-gray-700 group-hover:text-yellow-600">Tryouts</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="bg-red-100 text-red-600 font-bold px-2 py-0.5 rounded-full text-xs">{stats.pendingTryouts}</span>
                <FaChevronRight className="text-gray-400 group-hover:text-yellow-500 text-sm" />
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}