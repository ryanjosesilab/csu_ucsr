"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "../../../utils/supabase"; 
import { FaLock, FaUserCircle } from "react-icons/fa";

export default function ChangePasswordPage() {
  const [userEmail, setUserEmail] = useState<string | null>("Loading...");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email ?? "Unknown Email");
      }
    };
    fetchUser();
  }, []);

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    // Validate that they actually entered a password
    if (!newPassword) {
      setMessage({ type: "error", text: "Please enter a new password." });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match." });
      return;
    }
    
    if (newPassword.length < 6) {
      setMessage({ type: "error", text: "Password must be at least 6 characters." });
      return;
    }

    setIsLoading(true);

    // Only update the password now
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      setMessage({ type: "error", text: error.message });
    } else {
      setMessage({ type: "success", text: "Password updated successfully!" });
      setNewPassword("");
      setConfirmPassword("");
    }

    setIsLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Account Settings</h1>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 border border-gray-200 dark:border-gray-700 transition-colors">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100 dark:border-gray-700">
          <FaUserCircle className="text-4xl text-gray-400 dark:text-gray-500" />
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Logged in as</p>
            <p className="text-lg font-bold text-gray-800 dark:text-gray-100">{userEmail}</p>
          </div>
        </div>

        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
          <FaLock className="text-gray-500 dark:text-gray-400 text-sm" /> Update Password
        </h2>

        {message.text && (
          <div className={`p-3 mb-4 rounded text-sm font-medium ${message.type === 'error' ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-l-4 border-red-500' : 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-l-4 border-green-500'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handlePasswordUpdate} className="space-y-5">
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors"
              placeholder="Enter new password"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors"
              placeholder="Re-type new password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded transition-colors disabled:opacity-50 mt-4"
          >
            {isLoading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}