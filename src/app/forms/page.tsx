"use client";
import Navbar from '@/components/Navbar';
import { supabase } from '../../utils/supabase';

import React, { useEffect, useState } from 'react';

export default function FormsPage() {
  // State to handle active tab switching
  const [activeTab, setActiveTab] = useState<'equipment' | 'gym' | 'dlc' | 'general'>('equipment');

  const [isTryoutActive, setIsTryoutActive] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  const [equipmentForm, setEquipmentForm] = useState({
    borrowerName: '',
    contactNumber: '',
    purpose: '',
    dateBorrowed: '',
    dateReturn: '',
    borrowerType: 'Student', 
    typeOthersSpecify: '',
    itemsList: [{ equipmentName: '', quantity: 1, unit: 'piece' }] 
  });

  useEffect(() => {
    const checkTryoutStatus = async () => {
      const { data, error } = await supabase
        .from('settings')
        .select('is_tryout_active')
        .single();

      console.log("Settings Data:", data);
      console.log("Settings Error:", error);
      
      if (data) {
        setIsTryoutActive(data.is_tryout_active);
      }
      setLoading(false);
    };
    checkTryoutStatus();
  }, []);

  //Fitness Gym Session Form
  const [gymForm, setGymForm] = useState({ 
    name: '', 
    studentId: '', 
    schedule: '', 
    isEventTraining: 'No' 
  });

  const [gymBookings, setGymBookings] = useState<any[]>([]);

  const fetchGymBookings = async () => {
    const { data } = await supabase
      .from('gym_bookings')
      .select('student_id, schedule, status')
      .order('schedule', { ascending: true });
    
    if (data) setGymBookings(data);
  };

  const [statusSearchId, setStatusSearchId] = useState('');

  const handleCheckStatus = async () => {
    if (!statusSearchId) {
      alert("Please enter your Student ID to check your status.");
      return;
    }

    // 1. Get today's local date at midnight to filter out past days
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const startOfToday = `${year}-${month}-${day}T00:00:00`;

    // 2. Fetch data matching Student ID AND scheduled from today onwards
    const { data, error } = await supabase
      .from('gym_bookings')
      .select('student_id, schedule, status, feedback')
      .eq('student_id', statusSearchId)
      .gte('schedule', startOfToday) // Filters out everything before today
      .order('schedule', { ascending: true }); // Changed to 'true' so today/tomorrow show at the top

    if (error) {
      console.error(error);
      alert("Error fetching status.");
    } else {
      setGymBookings(data || []);
      if (data?.length === 0) alert("No upcoming requests found for this ID. Past requests are hidden.");
    }
  };

  const [dlcFile, setDlcFile] = useState<File | null>(null);
  
  //Drum and Lyre Corps form
  const [dlcForm, setDlcForm] = useState({
    studentName: '',
    contactNumber: '',
    purpose: '',
    eventDateTime: '',
    dateRequested: new Date().toISOString().split('T')[0], // Sets today's date automatically
    locationType: 'Inside Campus', // Default selection
    locationOthersSpecify: '',
    numInstrumentalists: 0,
    numDancers: 0,
    otherRequirements: '',
    requestorName: ''
  });
  
  //Sports tryout form
  const [generalForm, setGeneralForm] = useState({ name: '', studentId: '', degree: '', sport: '', position: '', experience: '', college: '', contact_number: '' });

  const handleSubmit = async (e: React.FormEvent, formType: string, formData: any) => {
    e.preventDefault();

    try {
      let response; 

      if (formType === 'Equipment Borrowing') {
        response = await supabase.from('equipment_borrowings').insert([{
          borrower_name: formData.borrowerName,
          contact_number: formData.contactNumber,
          purpose: formData.purpose,
          date_borrowed: formData.dateBorrowed,
          date_return: formData.dateReturn,
          borrower_type: formData.borrowerType,
          type_others_specify: formData.typeOthersSpecify,
          items_list: formData.itemsList 
        }]);
      } else if (formType === 'Gym Session') {
        
        // --- PHASE 2 SECURITY CHECKS ---
        
        // 1. Check Manual Permanent Ban (Settings Table)
        const { data: settingsData } = await supabase
          .from('settings')
          .select('banned_gym_students')
          .eq('id', 1)
          .single();
          
        if (settingsData?.banned_gym_students?.includes(formData.studentId)) {
           alert("BOOKING DENIED.\n\nStatus: BANNED\nReason: Admin restriction.\n\nPlease contact the UCSR office.");
           return; // Stop form submission
        }

        // 2. Check Automatic 7-Day Ban (Students Table)
        const { data: banData } = await supabase
          .from('students')
          .select('banned_until')
          .eq('student_id', formData.studentId)
          .single();
          
        if (banData?.banned_until && new Date(banData.banned_until) > new Date()) {
          const unbanDateStr = new Date(banData.banned_until).toLocaleDateString();
          alert(`BOOKING DENIED.\n\nStatus: TEMPORARILY BANNED\nReason: You missed multiple scheduled sessions.\n\nYour ban will automatically expire on ${unbanDateStr}.`);
          return; // Stop form submission
        }

        // 3. Check if they already have a request FOR THIS SPECIFIC DAY (Spam Prevention)
        const requestedDate = formData.schedule.split('T')[0]; 
        const startOfDay = new Date(`${requestedDate}T00:00:00`).toISOString();
        const endOfDay = new Date(`${requestedDate}T23:59:59`).toISOString();

        const { data: existingDayRequest } = await supabase
          .from('gym_bookings')
          .select('id, status')
          .eq('student_id', formData.studentId)
          .gte('schedule', startOfDay) 
          .lte('schedule', endOfDay)   
          .in('status', ['pending', 'accepted', 'active']) 
          .limit(1);

        if (existingDayRequest && existingDayRequest.length > 0) {
          const currentStatus = existingDayRequest[0].status;
          alert(`You already have a ${currentStatus} gym request on ${requestedDate}! You can only book one session per day.`);
          return; 
        }
        // --- END SECURITY CHECKS ---

        response = await supabase.from('gym_bookings').insert([{
          name: formData.name,
          student_id: formData.studentId,
          // FIX: Wrap the schedule in new Date().toISOString()
          schedule: new Date(formData.schedule).toISOString(), 
          is_event_training: formData.isEventTraining === 'Yes',
          status: 'pending' 
        }]);

      } else if (formType === 'DLC Booking') {
        let pdfUrl = null;

        if (dlcFile) {
          // Create a unique file name to prevent overwriting
          const fileExt = dlcFile.name.split('.').pop();
          const fileName = `dlc_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('dlc-documents') // We will create this bucket in the next step
            .upload(fileName, dlcFile);

          if (uploadError) {
            console.error("Upload error:", uploadError);
            alert(`Failed to upload file: ${uploadError.message}`);
            return; // Stop the form submission if the upload fails
          }

          // 2. Get the Public URL of the uploaded file
          const { data: publicUrlData } = supabase.storage
            .from('dlc-documents')
            .getPublicUrl(fileName);

          pdfUrl = publicUrlData.publicUrl;
        }

        // 3. Insert the text data AND the new pdfUrl into the database
        response = await supabase.from('dlc_request').insert([{
          student_name: formData.studentName,
          contact_number: formData.contactNumber,
          purpose: formData.purpose,
          event_data_time: formData.eventDateTime, // Left exactly as your original code
          date_requested: formData.dateRequested,
          location_type: formData.locationType,
          location_others_specify: formData.locationOthersSpecify,
          num_instrumentalists: formData.numInstrumentalists,
          num_dancers: formData.numDancers,
          other_requirements: formData.otherRequirements,
          requestor_name: formData.requestorName,
          status: 'pending', // Explicitly setting pending!
          pdf_url: pdfUrl    // Saving the link we just generated!
        }]);
      } 
      
      else if (formType === 'Sports Tryouts') {
        
        // --- NEW TRYOUT SEASON LOGIC ---
        // 1. Before submitting, we verify if the student is already in the database
        const { data: existingApp, error: checkError } = await supabase
          .from('tryout_submissions')
          .select('id')
          .eq('student_id', formData.studentId)
          // Look here: We do NOT include 'expired_rejection' in this block list!
          .in('status', ['pending', 'accepted', 'rejected']) 
          .eq('is_archived', false);

        if (checkError) {
          console.error("Error checking existing application:", checkError);
          alert("Error verifying application status. Please try again.");
          return;
        }

        // 2. If they have an active pending, accepted, or recently rejected form, block them.
        if (existingApp && existingApp.length > 0) {
          alert("You have already applied for this tryout season and cannot submit another request at this time.");
          return; // Stop form submission
        }
        // --- END NEW LOGIC ---

        response = await supabase.from('tryout_submissions').insert([{
          name: formData.name,
          student_id: formData.studentId, 
          degree: formData.degree,
          sport_event: formData.sport,
          position: formData.position,
          experience: formData.experience,
          college: formData.college,
          contact_number: formData.contact_number,
        }]);
      }

      // CRITICAL: Check if response exists and if there was an error
      if (response?.error) {
        console.error("Supabase Error:", response.error);
        alert(`Submission failed: ${response.error.message}`);
        return; // Stop here so the page doesn't refresh
      }

      // Success logic
      let customMessage = "Request submitted successfully! Proceed to the sports office for consultation.";
      if (formType === 'Gym Session') customMessage = "Gym session requested! Wait for approval.";
      else if (formType === 'Equipment Borrowing') customMessage = "Equipment request sent! Proceed to the office and present your ID for pickup.";
      else if (formType === 'DLC Booking') customMessage = "DLC request sent! Please proceed to the office.";
      else if (formType === 'Sports Tryouts') customMessage = "Tryout submission received! Good luck.";

      alert(customMessage);

      window.location.reload();

    } catch (err: any) {
      console.error("Runtime error:", err);
      alert("An unexpected error occurred.");
    }
  };

  return (
    <>
    <Navbar/>

    <div className="container py-5 my-5">
      
      {/* Page Header */}
      <div className="text-center mb-5" data-aos="fade-up">
        <h1 className="fw-bold" style={{ fontFamily: 'Georgia, serif', color: '#212529' }}>
          UCSR Request Forms Portal
        </h1>
        <p className="text-muted mx-auto" style={{ maxWidth: '600px' }}>
          Select a tab below to fill out and submit your official request to the University Center for Sports and Recreation.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="d-flex flex-wrap justify-content-center gap-2 mb-5" data-aos="fade-up" data-aos-delay="100">
        <button 
          className={`btn px-4 py-2 fw-semibold ${activeTab === 'equipment' ? 'btn-primary shadow-sm' : 'btn-outline-primary'}`} 
          onClick={() => setActiveTab('equipment')}
        >
          Sports Equipment Borrowing
        </button>
        <button 
          className={`btn px-4 py-2 fw-semibold ${activeTab === 'gym' ? 'btn-primary shadow-sm' : 'btn-outline-primary'}`} 
          onClick={() => setActiveTab('gym')}
        >
          Fitness Gym Session Request
        </button>
        <button 
          className={`btn px-4 py-2 fw-semibold ${activeTab === 'dlc' ? 'btn-primary shadow-sm' : 'btn-outline-primary'}`} 
          onClick={() => setActiveTab('dlc')}
        >
          Drum & Lyre Corps Request
        </button>
        <button 
    className={`btn px-4 py-2 fw-semibold ${activeTab === 'general' ? 'btn-primary shadow-sm' : 'btn-outline-primary'}`} 
    onClick={() => {
      if (isTryoutActive === false) {
        alert("Tryouts are currently unavailable.");
      } else {
        setActiveTab('general');
      }
    }}
  >
    {isTryoutActive === false ? "Tryouts (Closed)" : "Sports Tryouts form"}
  </button>
      </div>

      {/* Dynamic Form Display Container */}
      <div className="card shadow border-0 p-4 p-md-5 mx-auto bg-white" style={{ maxWidth: '650px', borderRadius: '12px', backgroundColor: '#ffffff' }} data-aos="fade-up" data-aos-delay="200">
        
        {/* FORM 1: SPORTS EQUIPMENT BORROWING */}
    {activeTab === 'equipment' && (
    <form onSubmit={(e) => handleSubmit(e, 'Equipment Borrowing', equipmentForm)}>
    <h3 className="mb-4 h5 fw-bold text-primary" style={{ fontFamily: 'Georgia, serif' }}>1. UCSR Borrower's Form</h3>
    
    <div className="mb-3">
      <label className="form-label fw-medium">Borrower Name</label>
      <input 
        type="text" 
        className="form-control text-dark bg-light" 
        value={equipmentForm.borrowerName} 
        maxLength={50} // Limits input to 50 characters
        onChange={(e) => {
          // This Regex ONLY allows Letters (a-z, A-Z), spaces (\s), hyphens (\-), and apostrophes (')
          // It instantly deletes anything else (like <, >, =, ;, or numbers)
          const sanitizedValue = e.target.value.replace(/[^a-zA-Z\s\-']/g, '');
          setEquipmentForm({...equipmentForm, borrowerName: sanitizedValue});
        }} 
        required 
      />
    </div>

    <div className="mb-3">
      <label className="form-label fw-medium">Contact Number</label>
      <input 
        type="text" // Using text (or "tel") keeps the starting 0 safe!
        className="form-control text-dark bg-light" 
        placeholder="09XXXXXXXXX" 
        value={equipmentForm.contactNumber} 
        maxLength={11} // Physically stops them at 11 characters
        onChange={(e) => {
          // \D is a regex shortcut that means "anything that is NOT a digit".
          // This instantly deletes letters, spaces, and special characters.
          const onlyNumbers = e.target.value.replace(/\D/g, '');
          setEquipmentForm({...equipmentForm, contactNumber: onlyNumbers});
        }} 
        required 
      />
    </div>

    {/* Borrower Classification Checkbox/Radio options */}
    <div className="mb-3">
      <label className="form-label fw-medium d-block">Borrower Classification</label>
      
      {/* Radio Buttons */}
      <div className="form-check form-check-inline">
        <input className="form-check-input" type="radio" name="borrowerType" id="type-student" value="Student" checked={equipmentForm.borrowerType === 'Student'} onChange={(e) => setEquipmentForm({...equipmentForm, borrowerType: e.target.value, typeOthersSpecify: ''})} />
        <label className="form-check-label text-dark" htmlFor="type-student">Student</label>
      </div>
      <div className="form-check form-check-inline">
        <input className="form-check-input" type="radio" name="borrowerType" id="type-employee" value="Employee" checked={equipmentForm.borrowerType === 'Employee'} onChange={(e) => setEquipmentForm({...equipmentForm, borrowerType: e.target.value, typeOthersSpecify: ''})} />
        <label className="form-check-label text-dark" htmlFor="type-employee">Employee</label>
      </div>
      <div className="form-check form-check-inline">
        <input className="form-check-input" type="radio" name="borrowerType" id="type-others" value="Others" checked={equipmentForm.borrowerType === 'Others'} onChange={(e) => setEquipmentForm({...equipmentForm, borrowerType: e.target.value})} />
        <label className="form-check-label text-dark" htmlFor="type-others">Others</label>
      </div>

      {/* Conditional Text Input (Shows only if 'Others' is selected) */}
      {equipmentForm.borrowerType === 'Others' && (
        <div className="mt-2">
          <input 
            type="text" 
            className="form-control text-dark bg-light" 
            placeholder="Please specify (e.g. Guest)" 
            value={equipmentForm.typeOthersSpecify || ''} 
            maxLength={30} // Limits to 30 characters
            onChange={(e) => {
              // Instantly deletes numbers and special characters (allows only letters and spaces)
              const sanitizedValue = e.target.value.replace(/[^a-zA-Z\s]/g, '');
              setEquipmentForm({...equipmentForm, typeOthersSpecify: sanitizedValue});
            }} 
            required 
          />
        </div>
      )}
    </div>

   <div className="mb-3">
      <label className="form-label fw-medium">Purpose</label>
      <textarea 
        className="form-control text-dark bg-light" 
        rows={2} 
        placeholder="Purpose of borrowing..." 
        value={equipmentForm.purpose} 
        maxLength={30} 
        onChange={(e) => {
          const sanitizedValue = e.target.value.replace(/[^a-zA-Z0-9\s]/g, '');
          setEquipmentForm({...equipmentForm, purpose: sanitizedValue});
        }} 
        required 
      />
    </div>

    <div className="row mb-4">
      <div className="col-md-6">
        <label className="form-label fw-medium">Date Borrowed</label>
        <input type="date" className="form-control text-dark bg-light" value={equipmentForm.dateBorrowed} onChange={(e) => setEquipmentForm({...equipmentForm, dateBorrowed: e.target.value})} required />
      </div>
      <div className="col-md-6 mt-3 mt-md-0">
        <label className="form-label fw-medium">Date to Return</label>
        <input type="date" className="form-control text-dark bg-light" value={equipmentForm.dateReturn} onChange={(e) => setEquipmentForm({...equipmentForm, dateReturn: e.target.value})} required />
      </div>
    </div>

    <hr className="text-muted" />

    <div className="mb-4">
    <label className="form-label fw-bold text-secondary d-flex justify-content-between align-items-center">
    <span>Borrowed Equipments List</span>
    <button 
      type="button" 
      className="btn btn-sm btn-outline-success"
      onClick={() => setEquipmentForm({
        ...equipmentForm, 
        itemsList: [...equipmentForm.itemsList, { equipmentName: '', quantity: 1, unit: 'piece' }]
      })}
    >
      + Add Item
    </button>
    </label>

    <p className="form-label fw-bold text-secondary d-flex justify-content-between align-items-center">Note: You can only Request 10 items per Submission</p>

     {equipmentForm.itemsList.map((item, index) => (
    <div className="row g-2 mb-2 align-items-end" key={index}>
      {/* Equipment Name (col-5) */}
      <div className="col-5">
        {index === 0 && <label className="form-label small text-muted mb-1">Equipment</label>}
        <input 
  type="text" 
  className="form-control form-control-sm text-dark bg-light" 
  placeholder="e.g., Basketball"
  value={item.equipmentName} 
  maxLength={35}
  onChange={(e) => {
    const sanitizedValue = e.target.value.replace(/[^a-zA-Z\s]/g, '');
    
    const updatedList = [...equipmentForm.itemsList];
    updatedList[index].equipmentName = sanitizedValue;
    setEquipmentForm({ ...equipmentForm, itemsList: updatedList });
  }}
  required 
/>
      </div>

      <div className="col-2">
        {index === 0 && <label className="form-label small text-muted mb-1">Qty</label>}
        <input 
          type="number" 
          className="form-control form-control-sm text-dark bg-light" 
          min="1" 
          value={item.quantity} 
          onChange={(e) => {
            const updatedList = [...equipmentForm.itemsList];
            updatedList[index].quantity = parseInt(e.target.value) || 1;
            setEquipmentForm({ ...equipmentForm, itemsList: updatedList });
          }}
          required 
        />
      </div>

      <div className="col-3">
        {index === 0 && <label className="form-label small text-muted mb-1">Unit</label>}
        <select 
          className="form-select form-select-sm text-dark bg-light"
          value={item.unit}
          onChange={(e) => {
            const updatedList = [...equipmentForm.itemsList];
            updatedList[index].unit = e.target.value;
            setEquipmentForm({ ...equipmentForm, itemsList: updatedList });
          }}
        >
          <option value="piece">Piece</option>
          <option value="packs">Packs</option>
          <option value="pairs">Pairs</option>
          <option value="set">Set</option>
        </select>
      </div>

   
      <div className="col-2 text-end">
        <button 
          type="button" 
          className="btn btn-sm btn-outline-danger w-100"
          disabled={equipmentForm.itemsList.length === 1}
          onClick={() => {
            const updatedList = equipmentForm.itemsList.filter((_, i) => i !== index);
            setEquipmentForm({ ...equipmentForm, itemsList: updatedList });
          }}
        >
          ✕
        </button>
      </div>
    </div>
  ))}
      </div>

    <button type="submit" className="btn btn-primary w-100 py-2 fw-bold">Submit Request</button>
  </form>
)}

        {/* FORM 2: FITNESS GYM BOOKING */}
{activeTab === 'gym' && (
  <form onSubmit={(e) => handleSubmit(e, 'Gym Session', gymForm)}>
    <h3 className="mb-4 h5 fw-bold text-primary" style={{ fontFamily: 'Georgia, serif' }}>2. Fitness Gym Session Slot Booking</h3>
    
    <div className="mb-3">
  <label className="form-label fw-medium">Full Name</label>
  <input 
    type="text" 
    className="form-control text-dark bg-light" 
    value={gymForm.name} 
    maxLength={30} 
    onChange={(e) => {
     
      const sanitizedValue = e.target.value.replace(/[^a-zA-Z\s\-']/g, '');
      setGymForm({...gymForm, name: sanitizedValue});
    }} 
    required 
  />
</div>
    
    <div className="mb-3">
  <label className="form-label fw-medium">ID Number</label>
  <input 
    type="text" 
    className="form-control text-dark bg-light" 
    placeholder="201-XXXXX" 
    value={gymForm.studentId} 
    maxLength={9} 
    onChange={(e) => {
      const sanitizedValue = e.target.value.replace(/[^0-9\-]/g, '');
      setGymForm({...gymForm, studentId: sanitizedValue});
    }} 
    required 
  />
</div>
    
    <div className="mb-3">
      <label className="form-label fw-medium">Preferred Training Schedule</label>
      <input type="datetime-local" className="form-control text-dark bg-light" value={gymForm.schedule} onChange={(e) => setGymForm({...gymForm, schedule: e.target.value})} required />
    </div>
    
    {/* Explicit Yes/No Radio options acting as strict clean selections */}
    <div className="mb-4">
      <label className="form-label fw-medium d-block">Are you an employee of CSU?</label>
      <div className="form-check form-check-inline">
        <input 
          className="form-check-input" 
          type="radio" 
          name="eventTraining" 
          id="gym-yes" 
          value="Yes" 
          checked={gymForm.isEventTraining === 'Yes'} 
          onChange={(e) => setGymForm({...gymForm, isEventTraining: e.target.value})} 
        />
        <label className="form-check-label text-dark" htmlFor="gym-yes">Yes</label>
      </div>
      <div className="form-check form-check-inline">
        <input 
          className="form-check-input" 
          type="radio" 
          name="eventTraining" 
          id="gym-no" 
          value="No" 
          checked={gymForm.isEventTraining === 'No'} 
          onChange={(e) => setGymForm({...gymForm, isEventTraining: e.target.value})} 
        />
        <label className="form-check-label text-dark" htmlFor="gym-no">No</label>
      </div>
    </div>
    
    <button type="submit" className="btn btn-primary w-100 py-2 fw-bold">Submit Request</button>
    
    <div className="mt-5 p-4 bg-white border rounded shadow-sm">
      <h4 className="fw-bold mb-3 text-secondary">Check Gym Booking Status</h4>
      
      {/* NEW: Search Bar for Privacy */}
      <div className="input-group mb-4">
  <input 
    type="text" 
    className="form-control bg-light text-dark" 
    placeholder="Enter your Student ID (e.g., 201-XXXXX)" 
    value={statusSearchId}
    maxLength={9} // Limits to 9 characters
    onChange={(e) => {
      // Allows only numbers (0-9) and the dash (-)
      const sanitizedValue = e.target.value.replace(/[^0-9\-]/g, '');
      setStatusSearchId(sanitizedValue);
    }}
  />
  <button 
    className="btn btn-secondary fw-bold" 
    type="button"
    onClick={handleCheckStatus}
  >
    Check Status
  </button>
</div>

      {gymBookings.length > 0 && (
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Schedule</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {gymBookings.map((booking, index) => (
                <tr key={index}>
                  <td>{new Date(booking.schedule).toLocaleString()}</td>
                  <td>
                    {/* Status Badge */}
                    <span className={`badge ${
                      booking.status === 'accepted' || booking.status === 'active' ? 'bg-success' : 
                      booking.status === 'rejected' || booking.status === 'missed' ? 'bg-danger' : 'bg-warning text-dark'
                    }`}>
                      {booking.status || 'pending'}
                    </span>

                    {/* NEW: Admin Feedback Display */}
                    {booking.status === 'rejected' && booking.feedback && (
                      <div className="mt-2 p-2 bg-danger bg-opacity-10 border border-danger rounded text-danger small">
                        <strong>Admin Note:</strong> {booking.feedback}
                      </div>
                    )}
                    
                    {/* Missed Penalty Notification */}
                    {booking.status === 'missed' && (
                      <div className="mt-2 text-danger small">
                        <strong>Note:</strong> You missed this schedule and incurred a 3-day penalty.
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>


  </form>





)}

        {/* FORM 3: DRUM AND LYRE CORPS REQUEST */}
{activeTab === 'dlc' && (
  <form onSubmit={(e) => handleSubmit(e, 'DLC Booking', dlcForm)}>
    <h3 className="mb-4 h5 fw-bold text-primary" style={{ fontFamily: 'Georgia, serif' }}>3. Drum and Lyre Corps (DLC) Event Request</h3>
    
    <div className="mb-3">
  <label className="form-label fw-medium">Full Name</label>
  <input 
    type="text" 
    className="form-control text-dark bg-light" 
    value={dlcForm.studentName} 
    maxLength={30} 
    onChange={(e) => {

      const sanitizedValue = e.target.value.replace(/[^a-zA-Z\s\-']/g, '');
      setDlcForm({...dlcForm, studentName: sanitizedValue});
    }} 
    required 
  />
</div>

    <div className="row mb-3">
      <div className="col-md-6">
        <label className="form-label fw-medium">Contact Number</label>
        <input 
          type="text" 
          className="form-control text-dark bg-light" 
          placeholder="09XXXXXXXXX" 
          value={dlcForm.contactNumber} 
          maxLength={11} 
          onChange={(e) => {
    
            const sanitizedValue = e.target.value.replace(/[^0-9]/g, '');
            setDlcForm({...dlcForm, contactNumber: sanitizedValue});
          }} 
          required 
        />
      </div>
      <div className="col-md-6 mt-3 mt-md-0">
        <label className="form-label fw-medium">Date Requested</label>
        <input type="date" className="form-control text-dark bg-light" value={dlcForm.dateRequested} onChange={(e) => setDlcForm({...dlcForm, dateRequested: e.target.value})} required />
      </div>
    </div>

    <div className="mb-3">
      <label className="form-label fw-medium">Event Date and Time</label>
      <input type="datetime-local" className="form-control text-dark bg-light" value={dlcForm.eventDateTime} onChange={(e) => setDlcForm({...dlcForm, eventDateTime: e.target.value})} required />
    </div>

    <div className="mb-3">
  <label className="form-label fw-medium">Purpose</label>
  <textarea 
    className="form-control text-dark bg-light" 
    rows={2} 
    placeholder="State the purpose of the event..." 
    value={dlcForm.purpose} 
    maxLength={50} 
    onChange={(e) => {
      
      const sanitizedValue = e.target.value.replace(/[^a-zA-Z\s]/g, '');
      setDlcForm({...dlcForm, purpose: sanitizedValue});
    }} 
    required 
  />
</div>

    {/* Location Settings (Radio buttons that look/act like specific checkboxes) */}
    <div className="mb-3">
      <label className="form-label fw-medium d-block">Event Location Classification</label>
      <div className="form-check form-check-inline">
        <input className="form-check-input" type="radio" name="locationType" id="loc-inside" value="Inside Campus" checked={dlcForm.locationType === 'Inside Campus'} onChange={(e) => setDlcForm({...dlcForm, locationType: e.target.value, locationOthersSpecify: ''})} />
        <label className="form-check-label text-dark" htmlFor="loc-inside">College/Unit (Inside Campus)</label>
      </div>
      
      <div className="form-check form-check-inline">
        <input className="form-check-input" type="radio" name="locationType" id="loc-outside-campus" value="Outside Campus" checked={dlcForm.locationType === 'Outside Campus'} onChange={(e) => setDlcForm({...dlcForm, locationType: e.target.value})} />
        <label className="form-check-label text-dark" htmlFor="loc-outside-campus">Outside Campus</label>
      </div>
    </div>

    {dlcForm.locationType === 'Inside Campus' && (
  <div className="mb-3 bg-white p-2 border rounded" data-aos="fade-down" data-aos-duration="300">
    <label className="form-label fw-medium small text-danger">Specify the college and Unit:</label>
    <input 
      type="text" 
      className="form-control text-dark bg-light" 
      placeholder="Type details..." 
      value={dlcForm.locationOthersSpecify} 
      maxLength={30} // 1. Limit to 30 characters
      onChange={(e) => {
        // 2. This regex allows: Letters (a-z, A-Z), Numbers (0-9), and Spaces (\s).
        // Anything else is instantly deleted.
        const sanitizedValue = e.target.value.replace(/[^a-zA-Z0-9\s]/g, '');
        setDlcForm({...dlcForm, locationOthersSpecify: sanitizedValue});
      }} 
      required 
    />
  </div>
)}

    
    {dlcForm.locationType === 'Outside Campus' && (
      <div className="mb-3 bg-white p-2 border rounded" data-aos="fade-down" data-aos-duration="300">
        <label className="form-label fw-medium small text-danger">Please Specify Location:</label>
        <input 
          type="text" 
          className="form-control text-dark bg-light" 
          placeholder="Type location details..." 
          value={dlcForm.locationOthersSpecify} 
          maxLength={30} 
          onChange={(e) => {
            const sanitizedValue = e.target.value.replace(/[^a-zA-Z0-9\s]/g, '');
            setDlcForm({...dlcForm, locationOthersSpecify: sanitizedValue});
          }} 
          required 
        />
      </div>
    )}

    <hr className="my-4 text-muted" />

    {/* Personnel Metrics */}
    <div className="row mb-3">
      <div className="col-md-6">
        <label className="form-label fw-medium">No. of Instrumentalists</label>
        <input type="number" className="form-control text-dark bg-light" min="0" value={dlcForm.numInstrumentalists} onChange={(e) => setDlcForm({...dlcForm, numInstrumentalists: parseInt(e.target.value) || 0})} required />
      </div>
      <div className="col-md-6 mt-3 mt-md-0">
        <label className="form-label fw-medium">No. of Dancers</label>
        <input type="number" className="form-control text-dark bg-light" min="0" value={dlcForm.numDancers} onChange={(e) => setDlcForm({...dlcForm, numDancers: parseInt(e.target.value) || 0})} required />
      </div>
    </div>

    <div className="mb-3">
  <label className="form-label fw-medium">Others, please specify requirements</label>
  <textarea 
    className="form-control text-dark bg-light" 
    rows={2} 
    placeholder="Specify other performance gear or request notes..." 
    value={dlcForm.otherRequirements} 
    maxLength={100} 
    onChange={(e) => {
     
      const sanitizedValue = e.target.value.replace(/[^a-zA-Z0-9\s,.]/g, '');
      setDlcForm({...dlcForm, otherRequirements: sanitizedValue});
    }} 
  />
</div>

    <div className="mb-4">
  <label className="form-label fw-medium">Name of the Requestor</label>
  <input 
    type="text" 
    className="form-control text-dark bg-light" 
    placeholder="Dean, Instructor, or Organization Head" 
    value={dlcForm.requestorName} 
    maxLength={30}
    onChange={(e) => {

      const sanitizedValue = e.target.value.replace(/[^a-zA-Z\s\-']/g, '');
      setDlcForm({...dlcForm, requestorName: sanitizedValue});
    }} 
    required 
  />
</div>

    {/* PDF Upload Field */}
    <div className="mb-4 p-4 border border-gray-300 rounded bg-gray-50">
  <label className="form-label fw-medium d-block mb-2">
    Attach Supporting Document (Optional)
  </label>
  <input 
    type="file" 
    className="form-control text-dark bg-white" 
    // Added image/png and image/jpeg to the accept filter
    accept="application/pdf,image/png,image/jpeg" 
    onChange={(e) => {
      if (e.target.files && e.target.files.length > 0) {
        setDlcFile(e.target.files[0]);
      } else {
        setDlcFile(null);
      }
    }} 
  />
  <small className="text-muted mt-1 d-block">
    Please upload your formal request letter as a PDF or a clear photo (JPG/PNG).
  </small>
</div>

    <button type="submit" className="btn btn-primary w-100 py-2 fw-bold">Request</button>
  </form>
)}

       {/* FORM 4: SPORTS TRYOUTS FORM */}
{activeTab === 'general' && (
  <>
    {isTryoutActive === false ? (
      <div className="text-center py-5">
        <h3 className="text-danger">Tryouts are currently unavailable.</h3>
        <p>Please check back later during the tryout season.</p>
      </div>
    ) : (
      <form onSubmit={(e) => handleSubmit(e, 'Sports Tryouts', generalForm)}>
    <h3 className="mb-4 h5 fw-bold text-primary" style={{ fontFamily: 'Georgia, serif' }}>4. Sports Tryouts Application Form</h3>
    
    <div className="mb-3">
  <label className="form-label fw-medium">Full Name</label>
  <input 
    type="text" 
    className="form-control text-dark bg-light" 
    value={generalForm.name || ''} 
    maxLength={30} // 1. Limit to 30 characters
    onChange={(e) => {
      const sanitizedValue = e.target.value.replace(/[^a-zA-Z\s\-']/g, '');
      setGeneralForm({...generalForm, name: sanitizedValue});
    }} 
    required 
  />
</div>

    <div className="mb-3">
  <label className="form-label fw-medium">Program / Course</label>
  <input 
    type="text" 
    className="form-control text-dark bg-light" 
    placeholder="e.g., BS Information Technology" 
    value={generalForm.degree || ''} 
    maxLength={70} 
    onChange={(e) => {
    
      const sanitizedValue = e.target.value.replace(/[^a-zA-Z0-9\s\-]/g, '');
      setGeneralForm({...generalForm, degree: sanitizedValue});
    }} 
    required 
  />
</div>

  <div className="mb-3">
  <label className="form-label fw-medium">Student ID Number</label>
  <input 
    type="text" 
    className="form-control text-dark bg-light" 
    placeholder="e.g., 201-XXXXX" 
    value={generalForm.studentId || ''} 
    maxLength={9}
    onChange={(e) => {
      const sanitizedValue = e.target.value.replace(/[^0-9\-]/g, '');
      setGeneralForm({...generalForm, studentId: sanitizedValue});
    }} 
    required 
  />
</div>

<div className="mb-3">
  <label className="form-label fw-medium">Contact Number</label>
  <input 
    type="text" 
    className="form-control text-dark bg-light" 
    placeholder="e.g., 09XXXXXXXXX" 
    value={generalForm.contact_number || ''} 
    maxLength={11}
    onChange={(e) => {
      const sanitizedValue = e.target.value.replace(/[^0-9]/g, '');
      setGeneralForm({...generalForm, contact_number: sanitizedValue});
    }} 
    required 
  />
</div>

   <div className="row mb-3">
  {/* EVENT / SPORT INPUT */}
  <div className="col-md-6">
    <label className="form-label fw-medium">Event / Sport</label>
    <input 
      type="text" 
      className="form-control text-dark bg-light" 
      placeholder="e.g., Basketball" 
      value={generalForm.sport || ''} 
      maxLength={30} 
      onChange={(e) => {
        const val = e.target.value;
        if (/^[A-Za-z\s0-9,]*$/.test(val)) {
          setGeneralForm({...generalForm, sport: val});
        }
      }} 
      required 
    />
  </div>

  {/* POSITION INPUT */}
  <div className="col-md-6 mt-3 mt-md-0">
    <label className="form-label fw-medium">Position</label>
    <input 
      type="text" 
      className="form-control text-dark bg-light" 
      placeholder="e.g., Point Guard" 
      value={generalForm.position || ''} 
      maxLength={30} 
      onChange={(e) => {
        const val = e.target.value;
        if (/^[A-Za-z\s0-9,]*$/.test(val)) {
          setGeneralForm({...generalForm, position: val});
        }
      }} 
      required 
    />
  </div>
</div>

    <div className="mb-3">
  <label className="form-label fw-medium">Playing Experience / Achievements</label>
  <textarea 
    className="form-control text-dark bg-light" 
    rows={3} 
    placeholder="Tell us about your previous team or experience..." 
    value={generalForm.experience || ''} 
    onChange={(e) => {
      const val = e.target.value;
      if (/^[A-Za-z\s0-9,]*$/.test(val)) {
        setGeneralForm({...generalForm, experience: val});
      }
    }} 
    required
  ></textarea>
</div>

    {/* College Selection (Radio buttons act like mutually exclusive checkboxes) */}
    <div className="mb-4">
      <label className="form-label fw-medium d-block">College Affiliation</label>
      {['CAA', 'CHASS', 'CCIS', 'CED', 'COFES', 'CMNS', 'CEGS', 'OTHERS'].map((college) => (
        <div className="form-check form-check-inline" key={college}>
          <input 
            className="form-check-input" 
            type="radio" 
            name="collegeOptions" 
            id={`college-${college}`} 
            value={college} 
            checked={generalForm.college === college}
            onChange={(e) => setGeneralForm({...generalForm, college: e.target.value})}
            required
          />
          <label className="form-check-label text-dark" htmlFor={`college-${college}`}>{college}</label>
        </div>
      ))}
    </div>

    <button type="submit" className="btn btn-primary w-100 py-2 fw-bold">Submit Tryout</button>
  </form>
  )}
  </>
)}


      </div>
      
      <div className="text-center mt-5 px-3" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h6 className="fw-bold text-secondary">UCSR Privacy Notice</h6>
          <p className="text-muted small" style={{ fontStyle: 'italic' }}>
            "All personal information contained in any document received or transmitted here in shall be used solely for documentation and processing purposes within the UCSR and shall not be shared with any outside parties, unless with your written consent. Personal information shall be retained and stored by the UCSR within a time period."
          </p>
        </div>
    </div>
    
    </>
  );
}