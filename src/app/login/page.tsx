"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../utils/supabase"; 
import { FaUser, FaLock, FaEye, FaEyeSlash } from "react-icons/fa"; 

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(""); 
  
  const [showPassword, setShowPassword] = useState(false); 
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      setErrorMsg(error.message); 
      setIsLoading(false);
    } else {
      router.push("/admin"); 
    }
  };

  return (
    <div className="flex flex-col items-center w-full">
      
      <div className="mb-12 flex justify-center relative">
        <img 
          src="/csu-logo-official.png" 
          alt="UCSR Logo" 
          className="h-62 w-auto object-contain z-10 animate-fire-flicker"
        />
        
        {/* Hidden CSS just for the logo flicker */}
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes fireFlicker {
            0%, 100% { 
              filter: drop-shadow(0 0 15px rgba(255, 165, 0, 0.4)) brightness(1); 
              transform: scale(1); 
            }
            25% { 
              filter: drop-shadow(0 0 20px rgba(255, 140, 0, 0.7)) brightness(1.05); 
            }
            50% { 
              filter: drop-shadow(0 0 30px rgba(255, 69, 0, 0.9)) brightness(1.1); 
              transform: scale(1.02); 
            }
            75% { 
              filter: drop-shadow(0 0 18px rgba(255, 140, 0, 0.6)) brightness(1.02); 
            }
          }
          
          .animate-fire-flicker {
            animation: fireFlicker 3s infinite ease-in-out;
          }
        `}} />
      </div>

      <form className="w-full space-y-5" onSubmit={handleSubmit}>
        
        {/* Error Message */}
        {errorMsg && (
          <div className="bg-red-500/80 backdrop-blur-md p-3 mb-4 !rounded-full text-center shadow-lg">
            <p className="text-sm text-white font-medium">{errorMsg}</p>
          </div>
        )}

        {/* --- EMAIL FIELD --- */}
        <div className="relative">
          {/* ADDED z-10: Forces the icon to sit in front of the frosted glass background */}
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none z-10">
            <FaUser className="text-white/70 text-lg" />
          </div>
          
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="block w-full pl-12 pr-6 py-4 bg-white/10 border border-white/20 !rounded-full text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-md transition-all sm:text-base relative z-0"
            placeholder="ucsr email..."
          />
        </div>

        {/* --- PASSWORD FIELD --- */}
        <div className="relative">
          {/* ADDED z-10: Forces the icon to sit in front of the frosted glass background */}
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none z-10">
            <FaLock className="text-white/70 text-lg" />
          </div>
          
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"} 
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="block w-full pl-12 pr-12 py-4 bg-white/10 border border-white/20 !rounded-full text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-md transition-all sm:text-base relative z-0"
            placeholder="password..."
          />
          
          {/* Eye Icon (Already worked because it is a button with an active z-index) */}
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-5 flex items-center text-white/70 hover:text-white transition-colors focus:outline-none z-10"
          >
            {showPassword ? (
              <FaEyeSlash className="text-xl" title="Hide password" />
            ) : (
              <FaEye className="text-xl" title="Show password" />
            )}
          </button>
        </div>

        {/* --- SUBMIT BUTTON --- */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-4 px-4 border-none !rounded-full shadow-lg text-lg font-semibold text-white bg-green-600 hover:bg-green-500  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-[#FB6E3B] disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02]"
          >
            {isLoading ? "Authenticating..." : "Sign in"}
          </button>
        </div>
        
      </form>
    </div>
  );
}