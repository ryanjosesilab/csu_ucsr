'use client';
import React, { useEffect, useState } from 'react';
import { supabase } from '../../../utils/supabase';
import { useParams } from 'next/navigation';

export default function PrintStudentForm() {
  const params = useParams();
  const [student, setStudent] = useState<any>(null);

  useEffect(() => {
    const fetchStudent = async () => {
      const { data, error } = await supabase
        .from('tryout_submissions')
        .select('*')
        .eq('id', params.id)
        .single();

      if (data) {
        setStudent(data);
        // Trigger print dialog automatically after a brief delay to ensure rendering
        setTimeout(() => {
          window.print();
        }, 1000);
      }
    };

    if (params.id) fetchStudent();
  }, [params.id]);

  if (!student) return <div className="p-10 text-center font-sans">Loading official record...</div>;

  // List of colleges for the checkbox mapping
  const collegesList = ['CAA', 'CHaSS', 'CCIS', 'CED', 'CoFES', 'CMNS', 'CEGS', 'Others'];

  return (
    <div className="bg-white text-black h-full pt-2 px-8 pb-4 max-w-4xl mx-auto" style={{ fontFamily: 'Arial, sans-serif' }}>
      
      {/* HEADER SECTION - Reduced mb-6 to mb-4 */}
      <div className="flex justify-between items-center mb-4">
        {/* Left Logo & Text Image */}
        <div className="w-[400px] h-[100px]">
          <img src="/UCSR_HEADER.png" alt="CSU Header" className="w-full h-full object-contain object-left" />
        </div>
        
        {/* Right Logos */}
        <div className="w-[250px] h-[80px]">
          <img src="/csu-logbook.jpg" alt="Right Logos" className="w-full h-full object-contain object-right" />
        </div>
      </div>

      {/* Reduced mb-4 to mb-2 */}
      <h2 className="text-center font-bold text-sm mb-2">TRY-OUT FORM</h2>

      {/* PERSONAL INFO SECTION */}
      <div className="text-xs space-y-2 mb-3">
        <div className="flex items-end gap-2">
          <span className="font-semibold whitespace-nowrap">Name:</span>
          <span className="border-b border-black flex-1 pb-0.5 px-2">{student.name}</span>
          <span className="font-semibold whitespace-nowrap">Event/Sports:</span>
          <span className="border-b border-black w-48 pb-0.5 px-2">{student.sport_event}</span>
          <span className="font-semibold whitespace-nowrap">Position:</span>
          <span className="border-b border-black w-24 pb-0.5 px-2 text-center">{student.position}</span>
        </div>
        
        <div className="flex items-end gap-2">
          <span className="font-semibold whitespace-nowrap">Degree Program:</span>
          <span className="border-b border-black flex-1 pb-0.5 px-2">{student.degree}</span>
          <span className="font-semibold whitespace-nowrap">Contact Number:</span>
          <span className="border-b border-black w-64 pb-0.5 px-2">{student.contact_number || '____________________'}</span>
        </div>

        <div className="flex items-end gap-2">
          <span className="font-semibold whitespace-nowrap">Experience:</span>
          <span className="border-b border-black flex-1 pb-0.5 px-2 truncate">{student.experience || 'N/A'}</span>
        </div>
      </div>

      <span className="border-b-[1px] border-black w-full inline-block"></span>

      {/* COLLEGE CHECKBOXES - Reduced mb-6 to mb-4 */}
      <div className="text-xs mb-4">
        <p className="font-semibold mb-2">College (check the box below)</p>
        <div className="grid grid-cols-4 gap-4 px-8">
          {collegesList.map((college) => (
            <div key={college} className="flex items-center gap-2">
              <div className="w-4 h-4 border border-black flex items-center justify-center text-[10px] font-bold">
                {(student.college?.toUpperCase() === college.toUpperCase()) || 
                 (college === 'Others' && !collegesList.slice(0, 7).includes(student.college?.toUpperCase())) 
                 ? '✓' : ''}
              </div>
              <span>{college}</span>
            </div>
          ))}
        </div>
      </div>

      <span className="border-b-[1px] border-black w-full inline-block"></span>

      {/* SCREENING SECTION */}
      <div className="text-xs mb-4">
        <p className="font-bold mb-1">Screening</p>
        <p className="font-semibold mb-2">Physical Attributes: (9 points-highest and 1 point-lowest)</p>
        
        <div className="flex justify-between px-12 mb-2">
          {/* Left Column Attributes */}
          <div className="space-y-1.5 w-1/2">
            {['Balance', 'Muscular Strength', 'Muscular Endurance', 'Cardiovascular Endu.', 'Flexibility', 'Body Composition'].map(attr => (
              <div key={attr} className="flex justify-between items-end pr-8">
                <span>{attr}</span>
                <span className="border-b border-black w-16 inline-block"></span>
              </div>
            ))}
            <div className="flex justify-between items-end pr-8 pt-2">
              <span className="font-bold">TOTAL SCORE</span>
              <span className="border-b border-black w-16 inline-block text-center"></span>
            </div>
          </div>

          {/* Right Column Attributes */}
          <div className="space-y-1.5 w-1/2 pl-8">
            {['Agility', 'Balance', 'Power', 'Speed', 'Reaction Time'].map(attr => (
              <div key={attr} className="flex justify-between items-end">
                <span>{attr}</span>
                <span className="border-b border-black w-16 inline-block"></span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SKILLS & ATTITUDE SECTION */}
      <div className="flex text-xs px-4 mb-4">
        <div className="w-1/2">
          <p className="font-bold mb-2">Skills</p>
          <div className="space-y-1 ml-4">
            {['Very Good', 'Good', 'Average', 'Poor', 'Very Poor'].map(skill => (
              <div key={skill} className="flex items-center gap-4">
                <span className="w-20">{skill}</span>
                <div className="w-5 h-5 border border-black"></div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="w-1/2">
          <p className="font-bold mb-2">Attitude</p>
          <div className="space-y-1 ml-4">
            {[5, 4, 3, 2, 1].map(num => (
              <div key={num} className="flex items-center gap-4">
                <span className="w-4 text-right">{num}</span>
                <div className="w-5 h-5 border border-black"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* FOOTER REMARKS & SIGNATURES */}
      {/* FOOTER REMARKS & SIGNATURES */}
      <div className="text-xs space-y-3">
        <div className="flex items-end gap-2">
          <span className="font-semibold">Remarks:</span>
          <span className="border-b border-black flex-1"></span>
        </div>
        <div className="border-b border-black w-full"></div>

        <div className="flex items-end gap-2 mt-2">
          <span className="font-semibold">Recommendation:</span>
          <span className="border-b border-black flex-1"></span>
        </div>
        <div className="border-b border-black w-full"></div>

        <div className="flex items-end gap-2 mt-2">
          <span className="font-semibold">Evaluator:</span>
        </div>

        {/* SIGNATURES */}
        <div className="flex justify-between mt-6">
          <div className="text-center">
            <p className="border-b border-black font-bold min-w-[200px]"></p>
            <p>Coach</p>
          </div>
          <div className="text-center">
            <p className="border-b border-black font-bold min-w-[200px] uppercase">RISSA L. MERCADO, PhD</p>
            <p>Director, UCSR</p>
          </div>
        </div>
      </div>

      {/* DOCUMENT CODE - Fixed to the absolute bottom of the page */}
      <div className="text-[9px] text-gray-800 mt-auto">
        <p>F-CSU-SPR-RF002, Rev.2, 12/12/2023</p>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
  @media print {
    {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body { background-color: white; }
    
   
    .border-b {
      border-bottom: 1px solid #000000 !important;
    }
    
    @page { size: letter; margin: 0.5in; }
    nextjs-portal { display: none; }
  }
`}} />
    </div>
  );
}