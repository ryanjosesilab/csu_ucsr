import React from 'react';

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-screen flex flex-col justify-center items-center py-12 sm:px-6 lg:px-8 relative overflow-hidden bg-gray-900">
      
      {/* Animated Background Image Wrapper */}
      {/* Removed "scale-105" from className since our CSS handles the scaling now */}
      <div 
        className="absolute inset-0 bg-[length:100%_auto] bg-center bg-no-repeat z-0"
        style={{ 
          backgroundImage: "url('/csu-employee.jpg')", 
          animation: "subtleMove 20s ease-in-out infinite alternate" 
        }} 
      />

      <div className="absolute inset-0 bg-black/40 z-0"></div>
      
      <div className="w-full max-w-sm z-10 relative px-4 sm:px-0">
        {children}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes subtleMove {
          0% {
            /* Starts almost completely zoomed out (2% zoom to hide edges) */
            transform: scale(1.02) translate(0px, 0px);
          }
          50% {
            /* Peaks at only a 5% zoom (much less than the old 12%) */
            transform: scale(1.05) translate(-6px, -3px);
          }
          100% {
            /* Returns to the nearly zoomed-out state */
            transform: scale(1.02) translate(0px, 0px);
          }
        }
      `}} />
    </div>
  );
}