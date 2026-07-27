'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../../utils/supabase';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    director_name: '',
    director_title: '',
    property_custodian_name: '', // NEW
    dlc_band_master_name: '',    // NEW
    tryout_contact_name: '',     // NEW
    tryout_contact_title: '',    // NEW
    coaches_list: [] as string[]
  });
  
  const [newCoach, setNewCoach] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data } = await supabase.from('settings').select('*').single();
    if (data) {
      // We merge with default empty strings to prevent React "uncontrolled input" warnings if a field is null in the database
      setSettings({
        director_name: data.director_name || '',
        director_title: data.director_title || '',
        property_custodian_name: data.property_custodian_name || '',
        dlc_band_master_name: data.dlc_band_master_name || '',
        tryout_contact_name: data.tryout_contact_name || '',
        tryout_contact_title: data.tryout_contact_title || '',
        coaches_list: data.coaches_list || []
      });
    }
  };

  const saveSettings = async () => {
    const { error } = await supabase
      .from('settings')
      .update(settings)
      .eq('id', 1); // Assuming your settings table has ID 1

    if (error) {
      alert("Error saving settings. Did you add the new columns to Supabase?");
      console.error(error);
    } else {
      alert("Settings saved successfully!");
    }
  };

  const addCoach = () => {
    if (newCoach && !settings.coaches_list.includes(newCoach)) {
      setSettings({...settings, coaches_list: [...settings.coaches_list, newCoach]});
      setNewCoach('');
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto pb-20">
      <h1 className="text-2xl font-bold mb-6 text-black">System Settings</h1>
      
      {/* 1. Director Settings */}
      <div className="bg-white p-6 rounded shadow mb-6 border-t-4 border-blue-600">
        <h2 className="font-bold mb-4 text-gray-700">Director Information (Main Signatory)</h2>
        <input 
          className="border border-gray-300 rounded p-2 w-full mb-3 focus:ring-2 focus:ring-blue-500 outline-none" 
          placeholder="Name (e.g., Juan Dela Cruz)"
          value={settings.director_name} 
          onChange={(e) => setSettings({...settings, director_name: e.target.value})} 
        />
        <input 
          className="border border-gray-300 rounded p-2 w-full focus:ring-2 focus:ring-blue-500 outline-none" 
          placeholder="Title (e.g., Director, UCSR)"
          value={settings.director_title} 
          onChange={(e) => setSettings({...settings, director_title: e.target.value})} 
        />
      </div>

      {/* 2. Property Custodian Settings (NEW) */}
      <div className="bg-white p-6 rounded shadow mb-6 border-t-4 border-green-600">
        <h2 className="font-bold mb-4 text-gray-700">UCSR Property Custodian</h2>
        <p className="text-xs text-gray-500 mb-3">This name will appear on the Equipment Borrowing forms.</p>
        <input 
          className="border border-gray-300 rounded p-2 w-full focus:ring-2 focus:ring-green-500 outline-none" 
          placeholder="Name (e.g., Ryan Jose Silab)"
          value={settings.property_custodian_name} 
          onChange={(e) => setSettings({...settings, property_custodian_name: e.target.value})} 
        />
      </div>

      {/* 3. DLC Band Master Settings (NEW) */}
      <div className="bg-white p-6 rounded shadow mb-6 border-t-4 border-yellow-500">
        <h2 className="font-bold mb-4 text-gray-700">DLC Band Master</h2>
        <p className="text-xs text-gray-500 mb-3">This name will appear on the Drum & Lyre Corps request forms.</p>
        <input 
          className="border border-gray-300 rounded p-2 w-full focus:ring-2 focus:ring-yellow-500 outline-none" 
          placeholder="Name"
          value={settings.dlc_band_master_name} 
          onChange={(e) => setSettings({...settings, dlc_band_master_name: e.target.value})} 
        />
      </div>

      {/* 4. Tryouts Contact Person Settings (NEW) */}
      <div className="bg-white p-6 rounded shadow mb-6 border-t-4 border-purple-600">
        <h2 className="font-bold mb-4 text-gray-700">Tryouts Contact Person (For Accepted Students)</h2>
        <p className="text-xs text-gray-500 mb-3">This person will be listed on the printout to instruct accepted students on who to approach next.</p>
        <input 
          className="border border-gray-300 rounded p-2 w-full mb-3 focus:ring-2 focus:ring-purple-500 outline-none" 
          placeholder="Name (e.g., Coach Jopeter)"
          value={settings.tryout_contact_name} 
          onChange={(e) => setSettings({...settings, tryout_contact_name: e.target.value})} 
        />
        <input 
          className="border border-gray-300 rounded p-2 w-full focus:ring-2 focus:ring-purple-500 outline-none" 
          placeholder="Title / Role (e.g., Head Coach / Sports Coordinator)"
          value={settings.tryout_contact_title} 
          onChange={(e) => setSettings({...settings, tryout_contact_title: e.target.value})} 
        />
      </div>

      {/* Coaches List */}
      <div className="bg-white p-6 rounded shadow mb-6 border-t-4 border-gray-600">
        <h2 className="font-bold mb-4 text-gray-700">Manage Evaluator Coaches</h2>
        <div className="flex gap-2 mb-4">
          <input 
            className="border border-gray-300 rounded p-2 flex-1 outline-none focus:ring-2 focus:ring-gray-500" 
            value={newCoach} 
            onChange={(e) => setNewCoach(e.target.value)} 
            placeholder="Add new coach name" 
          />
          <button onClick={addCoach} className="bg-green-600 text-white px-5 py-2 rounded font-bold hover:bg-green-700 transition">+</button>
        </div>
        <ul className="list-disc pl-5">
          {settings.coaches_list.map((coach, i) => (
            <li key={i} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
              <span className="text-gray-800">{coach}</span>
              <button 
                className="text-red-500 text-sm font-semibold hover:text-red-700" 
                onClick={() => setSettings({...settings, coaches_list: settings.coaches_list.filter((_, idx) => idx !== i)})}
              >
                Remove
              </button>
            </li>
          ))}
          {settings.coaches_list.length === 0 && (
            <p className="text-sm text-gray-400 italic">No coaches added yet.</p>
          )}
        </ul>
      </div>

      {/* Save Button */}
      <button 
        onClick={saveSettings} 
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold w-full shadow-lg transition-colors text-lg"
      >
        Save All Settings
      </button>
    </div>
  );
}