'use client';
import React, { useEffect, useState } from 'react';
import { supabase } from '../../../../../utils/supabase'; // Make sure this path matches your folder structure
import { useParams } from 'next/navigation';

export default function PrintStudentForm() {
  const params = useParams();
  const [student, setStudent] = useState<any>(null);

  useEffect(() => {
    const fetchStudent = async () => {
      // Fetching '*' ensures we grab the contact_number
      const { data } = await supabase
        .from('tryout_submissions')
        .select('*')
        .eq('id', params.id)
        .single();

      if (data) {
        setStudent(data);
        // Tiny delay ensures data paints on screen before the print dialog opens
        setTimeout(() => { window.print(); }, 800);
      }
    };
    if (params.id) fetchStudent();
  }, [params.id]);

  if (!student) return <div className="p-10 text-center font-sans">Loading official record...</div>;

  const collegesList = ['CAA', 'CHaSS', 'CCIS', 'CED', 'CoFES', 'CMNS', 'CEGS', 'Others'];

  return (
    // Fixed dimensions ensure it behaves like a standard piece of paper
    <div className="bg-white text-black h-[1050px] w-[816px] mx-auto pt-4 px-10 pb-6 border border-gray-200 flex flex-col relative" style={{ fontFamily: 'Arial, sans-serif' }}>
      
      {/* 1. HEADER SECTION */}
      <div className="flex justify-between items-center mb-3">
        <div className="w-[380px] h-[80px]">
          <img src="/UCSR_HEADER.png" alt="CSU Header" className="w-full h-full object-contain object-left" />
        </div>
        <div className="w-[200px] h-[60px]">
          <img src="/csu-logbook.jpg" alt="Right Logos" className="w-full h-full object-contain object-right" />
        </div>
      </div>

      <h2 className="text-center font-bold text-sm mb-3 uppercase tracking-wide">Try-Out Form</h2>

      {/* 2. PERSONAL INFO SECTION */}
      <div className="text-xs space-y-2 mb-3">
        <div className="flex items-end gap-2">
          <span className="font-bold whitespace-nowrap">Name:</span>
          <span className="border-b-[1px] border-black flex-1 pb-0.5 px-2">{student.name}</span>
          <span className="font-bold whitespace-nowrap">Event/Sports:</span>
          <span className="border-b-[1px] border-black w-48 pb-0.5 px-2">{student.sport_event}</span>
          <span className="font-bold whitespace-nowrap">Position:</span>
          <span className="border-b-[1px] border-black w-20 pb-0.5 px-2 text-center">{student.position}</span>
        </div>
        
        <div className="flex items-end gap-2">
          <span className="font-bold whitespace-nowrap">Degree Program:</span>
          <span className="border-b-[1px] border-black flex-1 pb-0.5 px-2">{student.degree}</span>
          <span className="font-bold whitespace-nowrap">Contact Number:</span>
          <span className="border-b-[1px] border-black w-48 pb-0.5 px-2">{student.contact_number || '____________________'}</span>
        </div>

        <div className="flex items-end gap-2">
          <span className="font-bold whitespace-nowrap">Experience:</span>
          <span className="border-b-[1px] border-black flex-1 pb-0.5 px-2 truncate">{student.experience || 'N/A'}</span>
        </div>
      </div>

      {/* DIVIDER ABOVE COLLEGE */}
      <div className="border-b-[1px] border-black mb-3"></div>

      {/* 3. COLLEGE CHECKBOXES */}
      <div className="text-xs mb-3">
        <p className="font-bold mb-2">College (check the box below)</p>
        <div className="grid grid-cols-4 gap-4 px-8">
          {['CAA', 'CHaSS', 'CCIS', 'CED', 'CoFES', 'CMNS', 'CEGS', 'Others'].map((college) => {
            
            // Helper variables to make the logic clean
            const mainColleges = ['CAA', 'CHASS', 'CCIS', 'CED', 'COFES', 'CMNS', 'CEGS'];
            const studentCol = student.college?.toUpperCase() || '';
            const isCustomCollege = student.college && !mainColleges.includes(studentCol);
            const isThisBoxChecked = (studentCol === college.toUpperCase()) || (college === 'Others' && isCustomCollege);

            return (
              <div key={college} className="flex items-center gap-2">
                {/* The Checkbox */}
                <div className="w-4 h-4 border-[1px] border-black flex items-center justify-center text-[10px] font-bold">
                  {isThisBoxChecked ? '✓' : ''}
                </div>
                
                {/* The Label & Line */}
                {college === 'Others' ? (
                  <div className="flex items-end gap-1">
                    <span>Others:</span>
                    {/* If it's a custom college, print it on the line. Otherwise, leave it blank. */}
                    <span className="border-b-[1px] border-black w-24 pb-0 text-center px-1 truncate">
                      {isCustomCollege ? student.college : ''}
                    </span>
                  </div>
                ) : (
                  <span>{college}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* DIVIDER BELOW COLLEGE */}
      <div className="border-b-[1px] border-black mb-3"></div>

      {/* 4. SCREENING SECTION */}
      <div className="text-xs mb-3">
        <p className="font-bold mb-1">Screening</p>
        <p className="font-semibold mb-2">Physical Attributes: (9 points-highest and 1 point-lowest)</p>
        
        <div className="flex justify-between px-12 mb-2">
          <div className="space-y-1.5 w-1/2">
            {['Balance', 'Muscular Strength', 'Muscular Endurance', 'Cardiovascular Endu.', 'Flexibility', 'Body Composition'].map(attr => (
              <div key={attr} className="flex justify-between items-end pr-8">
                <span>{attr}</span>
                <span className="border-b-[1px] border-black w-16 inline-block"></span>
              </div>
            ))}
            <div className="flex justify-between items-end pr-8 pt-2">
              <span className="font-bold">TOTAL SCORE</span>
              <span className="border-b-[1px] border-black w-16 inline-block text-center text-[10px]">/99</span>
            </div>
          </div>

          <div className="space-y-1.5 w-1/2 pl-8">
            {['Agility', 'Balance', 'Power', 'Speed', 'Reaction Time'].map(attr => (
              <div key={attr} className="flex justify-between items-end">
                <span>{attr}</span>
                <span className="border-b-[1px] border-black w-16 inline-block"></span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. SKILLS & ATTITUDE SECTION */}
      <div className="flex text-xs px-4 mb-4">
        <div className="w-1/2">
          <p className="font-bold mb-2">Skills</p>
          <div className="space-y-1 ml-4">
            {['Very Good', 'Good', 'Average', 'Poor', 'Very Poor'].map(skill => (
              <div key={skill} className="flex items-center gap-4">
                <span className="w-20">{skill}</span>
                <div className="w-4 h-4 border-[1px] border-black"></div>
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
                <div className="w-4 h-4 border-[1px] border-black"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 6. FOOTER REMARKS & SIGNATURES */}
      <div className="text-xs space-y-3">
        <div className="flex items-end gap-2">
          <span className="font-bold">Remarks:</span>
          <span className="border-b-[1px] border-black flex-1"></span>
        </div>
        <div className="border-b-[1px] border-black w-full mt-2"></div>

        <div className="flex items-end gap-2 mt-3">
          <span className="font-bold">Recommendation:</span>
          <span className="border-b-[1px] border-black flex-1"></span>
        </div>
        <div className="border-b-[1px] border-black w-full mt-2"></div>

        <div className="flex items-end gap-2 mt-3">
          <span className="font-bold">Evaluator:</span>
          <span className="border-b-[1px] border-black w-64"></span>
        </div>

        <div className="flex justify-between mt-8">
          <div className="text-center">
            <p className="border-b-[1px] border-black font-bold min-w-[200px]"></p>
            <p className="mt-1">Coach</p>
          </div>
          <div className="text-center">
            <p className="border-b-[1px] border-black font-bold min-w-[200px] uppercase">RISSA L. MERCADO, PhD</p>
            <p className="mt-1">Director, UCSR</p>
          </div>
        </div>
      </div>

      {/* 7. DOCUMENT CODE - Forced to absolute bottom by mt-auto */}
      <div className="mt-auto text-[9px] text-gray-800 border-t-[1px] border-black pt-1">
        <p>F-CSU-SPR-RF002, Rev.2, 12/12/2023</p>
      </div>

      {/* 8. PRINT CSS FIXES */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          /* Forces backgrounds, lines, and checkboxes to print */
          * { 
            -webkit-print-color-adjust: exact !important; 
            print-color-adjust: exact !important; 
          }
          /* Removes browser headers/footers */
          @page { size: letter; margin: 0; }
          /* Hides the DevTools UI */
          nextjs-portal { display: none; }
          /* Forces Tailwind borders to remain solid black */
          .border-black { border-color: black !important; }
        }
      `}} />
    </div>
  );
}