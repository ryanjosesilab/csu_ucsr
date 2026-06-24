import { FaBasketballBall, FaDrum, FaDumbbell, FaRunning } from 'react-icons/fa';

export default function AdminDashboard() {
  return (
    <>
      {/* Page Heading */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow text-sm font-medium transition-colors">
          Generate Report
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        {/* Sports Equipment */}
        <div className="bg-white rounded-lg shadow-sm border-l-4 border-blue-500 p-5 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-blue-500 uppercase mb-1">Sports Equipment (Approved)</div>
            <div className="text-2xl font-bold text-gray-800">12</div>
          </div>
          <FaBasketballBall className="text-4xl text-gray-300" />
        </div>

        {/* DLC Request */}
        <div className="bg-white rounded-lg shadow-sm border-l-4 border-green-500 p-5 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-green-500 uppercase mb-1">DLC Request (Approved)</div>
            <div className="text-2xl font-bold text-gray-800">5</div>
          </div>
          <FaDrum className="text-4xl text-gray-300" />
        </div>

        {/* Fitness Gym */}
        <div className="bg-white rounded-lg shadow-sm border-l-4 border-teal-500 p-5 flex items-center justify-between">
          <div className="w-full">
            <div className="text-xs font-bold text-teal-500 uppercase mb-1">Fitness Gym Vacancy</div>
            <div className="flex items-center justify-between mt-2">
              <div className="text-2xl font-bold text-gray-800">50%</div>
              <div className="w-1/2 bg-gray-200 rounded-full h-2">
                <div className="bg-teal-500 h-2 rounded-full" style={{ width: '50%' }}></div>
              </div>
            </div>
          </div>
          <FaDumbbell className="text-4xl text-gray-300 ml-4" />
        </div>

        {/* Tryout Application */}
        <div className="bg-white rounded-lg shadow-sm border-l-4 border-yellow-500 p-5 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-yellow-500 uppercase mb-1">Tryout Application</div>
            <div className="text-2xl font-bold text-gray-800">18</div>
          </div>
          <FaRunning className="text-4xl text-gray-300" />
        </div>

      </div>

      {/* Data Tables */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Pending Approvals</h2>
        <p className="text-gray-500 text-sm">Table will go here...</p>
      </div>
    </>
  );
}