"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../utils/supabase";

export default function PrintDLCForm() {
  const params = useParams();
  const [dlcData, setDlcData] = useState<any>(null);
  
  const [directorName, setDirectorName] = useState('Loading...');
  const [directorTitle, setDirectorTitle] = useState('Director, UCSR');
  const [bandMasterName, setBandMasterName] = useState('Loading...');

  useEffect(() => {
    const fetchData = async () => {
      if (!params.id) return;

      const { data: requestData } = await supabase
        .from('dlc_request')
        .select('*')
        .eq('id', params.id)
        .single();

      const { data: settingsData } = await supabase
        .from('settings')
        .select('director_name, director_title, dlc_band_master_name')
        .single();

      if (settingsData) {
        setDirectorName(settingsData.director_name || 'RISSA L. MERCADO, PhD');
        setDirectorTitle(settingsData.director_title || 'Director, UCSR');
        setBandMasterName(settingsData.dlc_band_master_name || 'JOHANN VIC G. VELASQUEZ');
      }

      if (requestData) {
        let currentNumber = requestData.request_number;
        
        const requestYear = new Date(requestData.created_at).getFullYear();

        if (!currentNumber) {
          const startOfYear = `${requestYear}-01-01T00:00:00Z`;
          const endOfYear = `${requestYear}-12-31T23:59:59Z`;

          const { data: highestReq, error: fetchError } = await supabase
            .from('dlc_request')
            .select('request_number')
            .gte('created_at', startOfYear)
            .lte('created_at', endOfYear)
            .not('request_number', 'is', null) 
            .order('request_number', { ascending: false })
            .limit(1);
            
          if (fetchError) console.error("Fetch Error:", fetchError);

          currentNumber = (highestReq && highestReq.length > 0) ? highestReq[0].request_number + 1 : 1;

          await supabase
            .from('dlc_request')
            .update({ request_number: currentNumber })
            .eq('id', params.id);
            
          await new Promise(resolve => setTimeout(resolve, 500));

          const { error: updateError } = await supabase
            .from('dlc_request')
            .update({ request_number: currentNumber })
            .eq('id', params.id);
            
          if (updateError) console.error("Update Error:", updateError);
        }

        const paddedNumber = String(currentNumber).padStart(2, '0');
        
        requestData.formatted_request_no = `${requestYear} - ${paddedNumber}`;

        setDlcData(requestData);
        
        setTimeout(() => {
          window.print();
        }, 1000);
      }
    };

    fetchData();
  }, [params.id]);

  if (!dlcData) {
    return <div className="p-10 text-center font-sans text-gray-500">Loading official DLC record...</div>;
  }

  const formatDateTime = (isoString: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleString('en-US', { 
      year: 'numeric', month: 'long', day: 'numeric', 
      hour: '2-digit', minute: '2-digit' 
    });
  };

  const locType = (dlcData.locationType || dlcData.location_type || '').toLowerCase();
  const isCollege = locType.includes('inside') || locType.includes('college');
  const isOutside = locType.includes('outside');
  const isOthers = !isCollege && !isOutside && locType !== '';

  return (
    <div className="bg-white text-black min-h-screen pt-4 px-12 pb-2 max-w-4xl mx-auto" style={{ fontFamily: 'Arial, sans-serif' }}>
      
      <div className="flex justify-between items-center mb-2">
        <div className="w-[400px] h-[80px]">
          <img src="/UCSR_HEADER.png" alt="CSU Header" className="w-full h-full object-contain object-left" />
        </div>
        <div className="w-[200px] h-[65px]">
          <img src="/csu-logbook.jpg" alt="Right Logos" className="w-full h-full object-contain object-right" />
        </div>
      </div>
      
      <div className="border-b-2 border-black w-full my-3"></div>

      <div className="flex justify-between items-end mb-4 font-bold">
        <h3 className="text-center text-lg underline ml-32 flex-1 tracking-wide">CSU-DLC Request Form</h3>
        <div className="text-sm">
          Request no: <span className="inline-block w-24 border-b-2 border-black text-center font-bold tracking-widest">
            {dlcData.formatted_request_no}
          </span>
        </div>
      </div>

      <div className="text-[15px] space-y-1 mb-4 font-semibold">
        <div className="flex items-end gap-2">
          <span className="w-36">Name:</span>
          <span className="border-b border-black flex-1 pb-0.5 px-2 font-normal">
            {dlcData.studentName || dlcData.student_name || dlcData.studentName || dlcData.student_name}
          </span>
          <span className="ml-4 w-32">Date Requested:</span>
          <span className="border-b border-black w-48 pb-0.5 px-2 font-normal text-center">
            {new Date(dlcData.dateRequested || dlcData.date_requested).toLocaleDateString()}
          </span>
        </div>
        
        <div className="flex items-end gap-2">
          <span className="w-36">Contact number:</span>
          <span className="border-b border-black w-64 pb-0.5 px-2 font-normal">
            {dlcData.contactNumber || dlcData.contact_number}
          </span>
        </div>

        <div className="flex items-end gap-2">
          <span className="w-36">Purpose:</span>
          <span className="border-b border-black flex-1 pb-0.5 px-2 font-normal">
            {dlcData.purpose}
          </span>
        </div>

        <div className="flex items-end gap-2">
          <span className="w-36">Event Date/Time:</span>
          <span className="border-b border-black flex-1 pb-0.5 px-2 font-normal">
            {formatDateTime(dlcData.eventDateTime || dlcData.event_data_time)}
          </span>
        </div>
      </div>

      <div className="space-y-2 mb-6 text-[15px] font-semibold">
        
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-[1.5px] border-black flex items-center justify-center text-sm font-bold">
            {isCollege ? '✓' : ''}
          </div>
          <span>College/Unit: </span>
          <span className="border-b border-black flex-1 pb-0.5 px-2 font-normal">
            {isCollege ? (dlcData.locationOthersSpecify || dlcData.location_others_specify) : ''}
          </span>
        </div>
        
        <div className="flex items-center gap-3 mb-2">
          <div className="w-5 h-5 border-[1.5px] border-black flex items-center justify-center text-sm font-bold">
            {isOutside ? '✓' : ''}
          </div>
          <span>Outside of University:</span>
          <span className="border-b border-black flex-1 pb-0.5 px-2 font-normal">
            {isOutside ? (dlcData.locationOthersSpecify || dlcData.location_others_specify) : ''}
          </span>
        </div>

      </div>

      <div className="mb-8 text-[15px] font-semibold">
        <h5 className="mt-2 font-extrabold">Request of the Performers:</h5>
        
        <div className="space-y-2 pl-4">
          <div className="flex items-end gap-2">
            <span className="w-48">No. of Instrumentalists:</span>
            <span className="border-b border-black w-24 pb-0.5 px-2 font-normal text-center">
              {dlcData.numInstrumentalists || dlcData.num_instrumentalists || 0}
            </span>
          </div>

          <div className="flex items-end gap-2">
            <span className="w-48">No. of Dancers:</span>
            <span className="border-b border-black w-24 pb-0.5 px-2 font-normal text-center">
              {dlcData.numDancers || dlcData.num_dancers || 0}
            </span>
          </div>

          <div className="flex items-end gap-2 mt-2">
            <span className="whitespace-nowrap">Others, please specify:</span>
            <span className="border-b border-black flex-1 pb-0.5 px-2 font-normal min-h-[1.5rem]">
              {dlcData.otherRequirements || dlcData.other_requirements}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6 text-[14px]">
        
        <div className="mb-6">
          <p className="border-b border-black font-bold uppercase h-6 w-[350px] px-2 text-center">
            {dlcData.studentName || dlcData.student_name}
          </p>
          <p className="mt-1 ml-5">Requestor Signature Over Printed Name</p>
        </div>

        <div className="flex justify-between items-end mt-8 font-semibold">
          
          <div className="w-[300px]">
            <p className="mb-6">Released by:</p>
            <p className="border-b border-black font-bold uppercase h-5 text-center flex items-center justify-center">
              {bandMasterName}
            </p>
            <p className="mt-1 font-normal text-center">DLC Band Master, UCSR</p>
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

      <div className="text-[11px] text-black font-medium mt-8 pb-2">
        <p>F-CSU-DLC-RF001, Rev.2, 12/12/2023</p>
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