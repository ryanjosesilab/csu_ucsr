import { NextResponse } from 'next/server';
import ExcelJS from 'exceljs';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const mockStudents = Array.from({ length: 55 }).map((_, i) => ({
    name: `Student ${i + 1}`,
    office: 'CAS',
    address: 'Ampayon',
    timeStart: '1:00 PM',
    purpose: 'GYM',
    date: '06/08/24'
  }));

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Gym Logbook');

  // 1. Define column keys and widths FIRST (Notice: No 'header' property used here!)
 worksheet.columns = [
    { key: 'no', width: 5 },
    { key: 'name', width: 25 },
    { key: 'office', width: 15 },
    { key: 'address', width: 20 },
    { key: 'contact', width: 15 },
    { key: 'timeStart', width: 15 },
    { key: 'timeEnd', width: 15 },
    { key: 'purpose', width: 30 },
    { key: 'date', width: 15 },
  ];

  // 2. Create the Caraga State University Header
  worksheet.mergeCells('A1:I3'); 
  const mainHeader = worksheet.getCell('A1');
  mainHeader.value = "Republic of the Philippines\nCARAGA STATE UNIVERSITY\nAmpayon, Butuan City 8600, Philippines\nCompetence Service Uprightness\nUNIVERSITY CENTER FOR SPORTS AND RECREATION\n\n";
  mainHeader.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true , indent: 7};
  mainHeader.font = { bold: true, size: 12 };

  worksheet.getRow(1).height = 28;
  worksheet.getRow(2).height = 28;
  worksheet.getRow(3).height = 28;
  worksheet.getRow(4).height = 28;
 
worksheet.mergeCells('A4:I4'); 
  const logbookTitle = worksheet.getCell('A4');
  logbookTitle.value = "CLIENT'S LOGBOOK";
  logbookTitle.alignment = { horizontal: 'center', vertical: 'middle' };
  logbookTitle.font = { bold: true, size: 16 }; // Larger, bolder font
  worksheet.getRow(4).height = 35; // Taller row to fit the big text

  
  // 3. Add both logos
  try {
    // Logo 1: CSU Main Logo (Now on the FAR RIGHT)
    const logo1Path = path.join(process.cwd(), 'public', 'csu-logbook.jpg');
    const logo1Buffer = fs.readFileSync(logo1Path) as any; 
    const logo1Id = workbook.addImage({ buffer: logo1Buffer, extension: 'jpeg' });
    worksheet.addImage(logo1Id, {
      tl: { col: 7.5, row: 0.2 }, // Changed to 9.5 to move to the right
      ext: { width: 190, height: 90 }
    });

    // Logo 2: Department/Sports Icon (Now on the FAR LEFT)
    const logo2Path = path.join(process.cwd(), 'public', 'csu-logo.png');
    const logo2Buffer = fs.readFileSync(logo2Path) as any;
    const logo2Id = workbook.addImage({ buffer: logo2Buffer, extension: 'png' });
    worksheet.addImage(logo2Id, {
      tl: { col: 0.2, row: 0.2 }, // Changed to 0.2 to move to the left
      ext: { width: 80, height: 80 }
    });
    
  } catch (error) {
    console.log("One or both logos not found.");
  }

  // 4. MANUALLY SET THE HEADERS ON ROW 5
  // This prevents the bug where ExcelJS overwrites Row 1
  const headerRow = worksheet.getRow(5);
  headerRow.values = [
    'NO', 'NAME', 'OFFICE /AGENCY', 'HOME ADDRESS', 'CONTACT NO.', 
    'Time Started', 'Time Ended', 'PURPOSE/SERVICES AVAILED', 'DATE & TIME'
  ];
  
  headerRow.font = { bold: true };
  headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
  
  // Apply borders to the headers
  headerRow.eachCell((cell) => {
    cell.border = {
      top: { style: 'thin' }, left: { style: 'thin' },
      bottom: { style: 'thin' }, right: { style: 'thin' }
    };
  });

  // 5. Loop through data and add rows
  mockStudents.forEach((student, index) => {
    const row = worksheet.addRow({
      no: (index % 50) + 1,
      name: student.name,
      office: student.office,
      address: student.address,
      contact: '',
      timeStart: student.timeStart,
      timeEnd: '',
      purpose: student.purpose,
      date: student.date
    });

    // Apply borders to the data
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin' }, left: { style: 'thin' },
        bottom: { style: 'thin' }, right: { style: 'thin' }
      };
      cell.alignment = { vertical: 'middle' }; 
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  
  return new NextResponse(buffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="CSU_Gym_Logbook.xlsx"',
    },
  });
}