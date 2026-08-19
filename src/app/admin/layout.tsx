"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../utils/supabase"; 
import Sidebar from "../../components/admin/Sidebar"; 

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        router.push("/login"); 
      } else {
        setIsAuthorized(true);
      }
    };

    checkUser();
  }, [router]);

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-white">
        Checking credentials...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 bg-gray-50">{children}</main>
    </div>
  );
}