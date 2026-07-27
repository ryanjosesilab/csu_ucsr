"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "../../../utils/supabase"; 
import { FaLock, FaUserCircle, FaIdCard } from "react-icons/fa";

export default function ChangePasswordPage() {
  const [userEmail, setUserEmail] = useState<string | null>("Loading...");
  const [displayName, setDisplayName] = useState(""); // New state for the name
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Fetch the currently logged-in admin's email and metadata on load
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email ?? "Unknown Email");
        // Pre-fill the name if they already have one saved in their metadata
        setDisplayName(user.user_metadata?.full_name || ""); 
      }
    };
    fetchUser();
  }, []);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    // Prepare the update payload. We always update the name.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updatePayload: any = {
      data: { full_name: displayName }
    };

    // If the user typed something into the password fields, validate and add it to the payload
    if (newPassword || confirmPassword) {
      if (newPassword !== confirmPassword) {
        setMessage({ type: "error", text: "Passwords do not match." });
        return;
      }
      if (newPassword.length < 6) {
        setMessage({ type: "error", text: "Password must be at least 6 characters." });
        return;
      }
      updatePayload.password = newPassword;
    }

    setIsLoading(true);

    // Update the user's password (if provided) and their metadata (name)
    const { error } = await supabase.auth.updateUser(updatePayload);

    if (error) {
      setMessage({ type: "error", text: error.message });
    } else {
      setMessage({ type: "success", text: "Account profile updated successfully!" });
      setNewPassword("");
      setConfirmPassword("");
    }

    setIsLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Account Settings</h1>

      <div className="bg-white shadow rounded-lg p-6 border border-gray-200">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
          <FaUserCircle className="text-4xl text-gray-400" />
          <div>
            <p className="text-sm text-gray-500 font-medium">Logged in as (Fixed)</p>
            <p className="text-lg font-bold text-gray-800">{userEmail}</p>
          </div>
        </div>

        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <FaLock className="text-gray-500 text-sm" /> Update Profile & Password
        </h2>

        {message.text && (
          <div className={`p-3 mb-4 rounded text-sm font-medium ${message.type === 'error' ? 'bg-red-50 text-red-700 border-l-4 border-red-500' : 'bg-green-50 text-green-700 border-l-4 border-green-500'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleProfileUpdate} className="space-y-5">
          
          {/* Display Name Field */}
          <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
            <label className="block text-sm font-bold text-gray-700 mb-1 flex items-center gap-2">
              <FaIdCard className="text-blue-500" /> Display Name (For Printed Forms)
            </label>
            <p className="text-xs text-gray-500 mb-2">This name will appear on official printouts and tables linked to your account.</p>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
              placeholder="e.g. John Doe"
              required
            />
          </div>

          <hr className="border-gray-100" />

          {/* Password Fields (Now Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password (Leave blank to keep current)</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
              placeholder="Enter new password"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
              placeholder="Re-type new password"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded transition-colors disabled:opacity-50 mt-4"
          >
            {isLoading ? "Saving Changes..." : "Save Profile Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}