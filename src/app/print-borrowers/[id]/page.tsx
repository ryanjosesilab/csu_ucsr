"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../utils/supabase";

type ParsedItem = {
  name: string;
  quantity: string | number;
  unit: string;
};

export default function PrintBorrowFormPage() {
  const params = useParams();
  const id = params?.id as string;

  const [record, setRecord] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const [items, setItems] = useState<ParsedItem[]>([]);
  const [formattedRequestNo, setFormattedRequestNo] = useState("Loading...");
  
  // Dynamic settings states
  const [directorName, setDirectorName] = useState('Loading...');
  const [directorTitle, setDirectorTitle] = useState('Director, UCSR');
  const [custodianName, setCustodianName] = useState('Loading...');

  useEffect(() => {
    if (!id) return;

    const fetchPrintData = async () => {
      // 1. Fetch the specific borrowing record
      const { data: borrowData, error: borrowError } = await supabase
        .from("equipment_borrowings")
        .select("*")
        .eq("id", id)
        .single();

      if (borrowError) {
        console.error("Error fetching record:", borrowError);
        alert("Could not load the borrowing record.");
        return;
      }

      // 2. Fetch Admin Settings for the Signatures
      const { data: settingsData } = await supabase
        .from("settings") 
        .select("*")
        .single(); // Assuming row id 1

      if (settingsData) {
        setSettings(settingsData);
        setDirectorName(settingsData.director_name || 'RISSA L. MERCADO, PhD');
        setDirectorTitle(settingsData.director_title || 'Director, UCSR');
        
        // --- UPDATED LOGIC ---
        // Set Custodian Name directly from the settings table you just configured
        setCustodianName(settingsData.property_custodian_name || 'PROPERTY CUSTODIAN NAME');
      }

      if (borrowData) {
        // --- AUTO-INCREMENT LOGIC WITH YEARLY RESET ---
        let currentNumber = borrowData.request_number;
        
        // Use created_at to ensure a perfect timestamp match
        const requestYear = new Date(borrowData.created_at).getFullYear();

        if (!currentNumber) {
          // If no number exists, find the highest number used THIS YEAR in equipment_borrowings
          const startOfYear = `${requestYear}-01-01T00:00:00Z`;
          const endOfYear = `${requestYear}-12-31T23:59:59Z`;

          const { data: highestReq, error: fetchError } = await supabase
            .from('equipment_borrowings')
            .select('request_number')
            .gte('created_at', startOfYear)
            .lte('created_at', endOfYear)
            .not('request_number', 'is', null) 
            .order('request_number', { ascending: false })
            .limit(1);
            
          if (fetchError) console.error("Fetch Error:", fetchError);

          // If a previous request exists this year, add 1. Otherwise, start at 1.
          currentNumber = (highestReq && highestReq.length > 0) ? highestReq[0].request_number + 1 : 1;

          // Save the new number to the database
          await supabase
            .from('equipment_borrowings')
            .update({ request_number: currentNumber })
            .eq('id', id);
            
          await new Promise(resolve => setTimeout(resolve, 500));
        }

        // Format the number (e.g., 2026 - 01)
        const paddedNumber = String(currentNumber).padStart(2, '0');
        setFormattedRequestNo(`${requestYear} - ${paddedNumber}`);
        // --- END NEW LOGIC ---

        // Parse the JSON items list
        let parsedItems: ParsedItem[] = [];
        if (Array.isArray(borrowData.items_list)) {
          parsedItems = borrowData.items_list.map((rawItem: any) => {
            if (typeof rawItem === "string") return { name: rawItem, quantity: "", unit: "" };
            const item = rawItem as any;
            return {
              name: item?.equipmentName || item?.name || "Unknown Item",
              quantity: item?.quantity || item?.qty || "",
              unit: item?.unit || item?.unit_type || borrowData.unit_type || "",
            };
          });
        } else if (typeof borrowData.items_list === "string") {
          parsedItems = [{ name: borrowData.items_list, quantity: "", unit: "" }];
        }

        setRecord(borrowData);
        setItems(parsedItems);

        // Automatically trigger the print dialog after a brief pause
        setTimeout(() => {
          window.print();
        }, 1000);
      }
    };

    fetchPrintData();
  }, [id]);

  if (!record) {
    return <div className="p-10 text-center font-sans text-gray-500">Loading official Equipment record...</div>;
  }

  // To perfectly match the paper form, generate exactly 10 empty lines for the items table
  const maxTableRows = 10;
  const tableRows = Array.from({ length: maxTableRows });

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  };

  return (
    <div className="bg-white text-black min-h-screen pt-4 px-12 pb-2 max-w-4xl mx-auto" style={{ fontFamily: 'Arial, sans-serif' }}>
      
      {/* HEADER LOGOS (Matched to DLC) */}
      <div className="flex justify-between items-center mb-2">
        <div className="w-[400px] h-[80px]">
          <img src="/UCSR_HEADER.png" alt="CSU Header" className="w-full h-full object-contain object-left" />
        </div>
        <div className="w-[200px] h-[65px]">
          <img src="/csu-logbook.jpg" alt="Right Logos" className="w-full h-full object-contain object-right" />
        </div>
      </div>
      
      <div className="border-b-2 border-black w-full my-3"></div>

      {/* --- FORM TITLE & REQUEST NO --- */}
      <div className="flex justify-between items-end mb-4 font-bold">
        <h5 className="text-center text-lg underline ml-32 flex-1 tracking-wide uppercase">UCSR Borrowers Slip Form</h5>
        <div className="text-sm">
          Request no: <span className="inline-block w-24 border-b-2 border-black text-center font-bold tracking-widest">
            {formattedRequestNo}
          </span>
        </div>
      </div>

      {/* --- BORROWER INFO GRID --- */}
      <div className="grid grid-cols-2 gap-x-8 gap-y-1 mb-4 text-[15px] font-semibold">
        <div className="flex items-end">
          <span className="w-32">Name:</span>
          <span className="flex-1 border-b border-black font-normal uppercase px-2">{record.borrower_name}</span>
        </div>
        <div className="flex items-end">
          <span className="w-32">Date borrowed:</span>
          <span className="flex-1 border-b border-black font-normal px-2">{formatDate(record.date_borrowed)}</span>
        </div>
        <div className="flex items-end">
          <span className="w-32">Contact number:</span>
          <span className="flex-1 border-b border-black font-normal px-2">{record.contact_number}</span>
        </div>
        <div className="flex items-end">
          <span className="w-32">Date return:</span>
          <span className="flex-1 border-b border-black font-normal px-2">{formatDate(record.date_return)}</span>
        </div>
        <div className="col-span-2 flex items-end">
          <span className="w-32">Purpose:</span>
          <span className="flex-1 border-b border-black font-normal uppercase px-2">{record.purpose}</span>
        </div>
      </div>

      {/* --- CHECKBOXES --- */}
      <div className="flex items-center gap-8 mb-4 text-[15px] font-semibold">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 border-[1.5px] border-black flex items-center justify-center text-sm font-bold">
            {record.borrower_type?.toLowerCase() === 'student' ? '✓' : ''}
          </div>
          <span>Student</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 border-[1.5px] border-black flex items-center justify-center text-sm font-bold">
            {record.borrower_type?.toLowerCase() === 'employee' ? '✓' : ''}
          </div>
          <span>Employee</span>
        </div>
        <div className="flex items-center gap-2 flex-1">
          <div className="w-5 h-5 border-[1.5px] border-black flex items-center justify-center text-sm font-bold">
            {['student', 'employee'].includes(record.borrower_type?.toLowerCase() || '') === false ? '✓' : ''}
          </div>
          <span className="whitespace-nowrap">Others, please specify:</span>
          <span className="flex-1 border-b border-black font-normal px-2 uppercase">
            {/* Prioritize type_others_specify, but fallback to borrower_type for old records */}
            {['student', 'employee'].includes(record.borrower_type?.toLowerCase() || '') === false 
              ? (record.type_others_specify || record.borrower_type || '') 
              : ''}
          </span>
        </div>
      </div>

      {/* --- ITEMS TABLE (10 Lines) --- */}
      <div className="w-full flex mb-5 text-[15px] font-semibold text-center">
        <div className="w-1/2 pr-4">
          <div className="mb-2">Borrowed equipment/s</div>
          {tableRows.map((_, i) => (
            <div key={`item-${i}`} className="border-b border-black h-7 flex items-end text-left pb-1 uppercase overflow-hidden px-2 font-normal">
              {items[i]?.name || ""}
            </div>
          ))}
        </div>
        
        <div className="w-1/4 px-4 border-l border-r border-transparent">
          <div className="mb-2">No. of item/s</div>
          {tableRows.map((_, i) => (
            <div key={`qty-${i}`} className="border-b border-black h-7 flex items-end justify-center pb-1 font-normal">
              {items[i]?.quantity || ""}
            </div>
          ))}
        </div>

        <div className="w-1/4 pl-4">
          <div className="mb-2">Unit</div>
          {tableRows.map((_, i) => (
            <div key={`unit-${i}`} className="border-b border-black h-7 flex items-end justify-center pb-1 uppercase font-normal">
              {items[i]?.unit || ""}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 text-[14px]">
        
        <div className="mb-5">
          <p className="border-b border-black font-bold uppercase h-6 w-[350px] px-2 text-center">
            {record.borrower_name}
          </p>
          <p className="mt-1 ml-5">Borrower Signature Over Printed Name</p>
        </div>

        <div className="flex justify-between items-end mt-6 font-semibold">
          <div className="w-[300px]">
            <p className="mb-6">Released by:</p>
            <p className="border-b border-black font-bold uppercase h-5 text-center flex items-center justify-center">
              {custodianName}
            </p>
            <p className="mt-1 font-normal text-center">UCSR, Property Custodian</p>
          </div>

          <div className="w-[300px]">
            <p className="mb-6">Approved by:</p>
            <p className="border-b border-black font-bold uppercase h-5 text-center flex items-center justify-center">
              {directorName}
            </p>
            <p className="mt-1 font-normal text-center">{directorTitle}</p>
          </div>
        </div>
      </div>

      {/* --- FOOTER --- */}
      <div className="text-[11px] text-black font-medium mt-4 pb-2">
        <p>F-CSU-SPR-RF001, Rev.2, 12/12/2023</p>
      </div>

      <div className="absolute top-4 right-4 print:hidden">
         <button onClick={() => window.close()} className="bg-red-600 text-white px-4 py-2 rounded font-bold text-sm shadow hover:bg-red-700">
           Close Tab
         </button>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body { 
            background-color: white; 
            margin: 0;
            padding: 0;
          }
          .border-b {
            border-bottom: 1px solid #000000 !important;
          }
          .border-b-2 {
            border-bottom: 2px solid #000000 !important;
          }
          @page { size: letter; margin: 0.5in; }
          nextjs-portal { display: none; }
        }
      `}} />
    </div>
  );
}