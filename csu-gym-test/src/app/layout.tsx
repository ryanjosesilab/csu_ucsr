import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Navbar from '../components/Navbar';
import 'bootstrap/dist/css/bootstrap.min.css';
import "./globals.css";
import AOSInit from '../components/AOSInit'; // Make sure this file exists

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CSU Gym Logbook",
  description: "Gym Logbook Generator for CSU",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <head>
        {/* Load AOS CSS via CDN to avoid build-time import errors */}
        <link href="https://unpkg.com/aos@2.3.1/dist/aos.css" rel="stylesheet" />
      </head>
      <body className="min-h-full flex flex-col">
        <AOSInit /> 
        <Navbar />
        {children}
        <script 
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/js/bootstrap.bundle.min.js" 
          async 
        />
      </body>
    </html>
  );
}