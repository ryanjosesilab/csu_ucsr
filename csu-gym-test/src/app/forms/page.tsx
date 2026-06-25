"use client";
import Navbar from '@/components/Navbar';
import { supabase } from '../../utils/supabase';

import React, { useEffect, useState } from 'react';

export default function FormsPage() {
  // State to handle active tab switching
  const [activeTab, setActiveTab] = useState<'equipment' | 'gym' | 'dlc' | 'general'>('equipment');

  // Form states to track input values
  //Sports Equipment Borrowing form
  const [equipmentForm, setEquipmentForm] = useState({
  borrowerName: '',
  contactNumber: '',
  purpose: '',
  dateBorrowed: '',
  dateReturn: '',
  borrowerType: 'Student', // Default selection
  typeOthersSpecify: '',
  // This array will hold the dynamic list of items
  itemsList: [{ equipmentName: '', quantity: 1, unit: 'piece' }] 
});

  //Fitness Gym Session Form
  // 1. All your state declarations go here, one after another
const [gymForm, setGymForm] = useState({ 
  name: '', 
  studentId: '', 
  schedule: '', 
  isEventTraining: 'No' 
});

const [gymBookings, setGymBookings] = useState<any[]>([]);

// 2. Your helper functions come after the state
const fetchGymBookings = async () => {
  const { data } = await supabase
    .from('gym_bookings')
    .select('student_id, schedule, status')
    .order('schedule', { ascending: true });
  
  if (data) setGymBookings(data);
};

// 3. Your useEffect hooks come after the functions
useEffect(() => {
  fetchGymBookings();
}, []);

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
  const [generalForm, setGeneralForm] = useState({ name: '', studentId: '', degree: '', sport: '', position: '', experience: '', college: '' });

  const handleSubmit = async (e: React.FormEvent, formType: string, formData: any) => {
  e.preventDefault();

  try {
    let response; // To store the Supabase response

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
      response = await supabase.from('gym_bookings').insert([{
        name: formData.name,
        student_id: formData.studentId,
        schedule: formData.schedule,
        is_event_training: formData.isEventTraining === 'Yes'
      }]);
    } else if (formType === 'DLC Booking') {
      response = await supabase.from('dlc_request').insert([{
        student_name: formData.studentName,
        contact_number: formData.contactNumber,
        purpose: formData.purpose,
        event_data_time: formData.eventDateTime,
        date_requested: formData.dateRequested,
        location_type: formData.locationType,
        location_others_specify: formData.locationOthersSpecify,
        num_instrumentalists: formData.numInstrumentalists,
        num_dancers: formData.numDancers,
        other_requirements: formData.otherRequirements,
        requestor_name: formData.requestorName
      }]);
    } else if (formType === 'Sports Tryouts') {
  response = await supabase.from('tryout_submissions').insert([{
    name: formData.name,
    student_id: formData.studentId, // Add this line
    degree: formData.degree,
    sport_event: formData.sport,
    position: formData.position,
    experience: formData.experience,
    college: formData.college
  }
    
    
    ]);
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
    else if (formType === 'Tryout Submissions') customMessage = "Tryout submission received! Good luck.";

    alert(customMessage);
  

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
          onClick={() => setActiveTab('general')}
        >
          Sports Tryouts form
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
      <input type="text" className="form-control text-dark bg-light" value={equipmentForm.borrowerName} onChange={(e) => setEquipmentForm({...equipmentForm, borrowerName: e.target.value})} required />
    </div>

    <div className="mb-3">
      <label className="form-label fw-medium">Contact Number</label>
      <input type="text" className="form-control text-dark bg-light" placeholder="09XXXXXXXXX" value={equipmentForm.contactNumber} onChange={(e) => setEquipmentForm({...equipmentForm, contactNumber: e.target.value})} required />
    </div>

    {/* Borrower Classification Checkbox/Radio options */}
    <div className="mb-3">
      <label className="form-label fw-medium d-block">Borrower Classification</label>
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
    </div>

    {/* Conditional field if 'Others' classification is selected */}
    {equipmentForm.borrowerType === 'Others' && (
      <div className="mb-3 bg-white p-2 border rounded" data-aos="fade-down" data-aos-duration="200">
        <label className="form-label fw-medium small text-danger">Please Specify Classification:</label>
        <input type="text" className="form-control text-dark bg-light" placeholder="e.g., Alumnus, Outside Guest" value={equipmentForm.typeOthersSpecify} onChange={(e) => setEquipmentForm({...equipmentForm, typeOthersSpecify: e.target.value})} required />
      </div>
    )}

    <div className="mb-3">
      <label className="form-label fw-medium">Purpose</label>
      <textarea className="form-control text-dark bg-light" rows={2} placeholder="Purpose of borrowing..." value={equipmentForm.purpose} onChange={(e) => setEquipmentForm({...equipmentForm, purpose: e.target.value})} required />
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

    {/* DYNAMIC LIST OF EQUIPMENT ITEMS */}
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
          onChange={(e) => {
            const updatedList = [...equipmentForm.itemsList];
            updatedList[index].equipmentName = e.target.value;
            setEquipmentForm({ ...equipmentForm, itemsList: updatedList });
          }}
          required 
        />
      </div>

      {/* Quantity (col-2) */}
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

      {/* Unit Dropdown (col-3) */}
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

      {/* Delete Button (col-2) */}
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
      <input type="text" className="form-control text-dark bg-light" value={gymForm.name} onChange={(e) => setGymForm({...gymForm, name: e.target.value})} required />
    </div>
    
    <div className="mb-3">
      <label className="form-label fw-medium">Student ID Number</label>
      <input type="text" className="form-control text-dark bg-light" placeholder="201-XXXXX" value={gymForm.studentId} onChange={(e) => setGymForm({...gymForm, studentId: e.target.value})} required />
    </div>
    
    <div className="mb-3">
      <label className="form-label fw-medium">Preferred Training Schedule</label>
      <input type="datetime-local" className="form-control text-dark bg-light" value={gymForm.schedule} onChange={(e) => setGymForm({...gymForm, schedule: e.target.value})} required />
    </div>
    
    {/* Explicit Yes/No Radio options acting as strict clean selections */}
    <div className="mb-4">
      <label className="form-label fw-medium d-block">Are you training for an Event/Sport?</label>
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
  <h4 className="fw-bold mb-3 text-secondary">Gym Booking Status List</h4>
  <div className="table-responsive">
    <table className="table table-hover align-middle">
      <thead className="table-light">
        <tr>
          <th>Student ID</th>
          <th>Schedule</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {gymBookings.map((booking, index) => (
          <tr key={index}>
            <td>{booking.student_id}</td>
            <td>{new Date(booking.schedule).toLocaleString()}</td>
            <td>
              <span className={`badge ${
                booking.status === 'Approved' ? 'bg-success' : 
                booking.status === 'Denied' ? 'bg-danger' : 'bg-warning'
              }`}>
                {booking.status || 'Pending'}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>


  </form>





)}

        {/* FORM 3: DRUM AND LYRE CORPS REQUEST */}
{activeTab === 'dlc' && (
  <form onSubmit={(e) => handleSubmit(e, 'DLC Booking', dlcForm)}>
    <h3 className="mb-4 h5 fw-bold text-primary" style={{ fontFamily: 'Georgia, serif' }}>3. Drum and Lyre Corps (DLC) Event Request</h3>
    
    <div className="mb-3">
      <label className="form-label fw-medium">Name of Student</label>
      <input type="text" className="form-control text-dark bg-light" value={dlcForm.studentName} onChange={(e) => setDlcForm({...dlcForm, studentName: e.target.value})} required />
    </div>

    <div className="row mb-3">
      <div className="col-md-6">
        <label className="form-label fw-medium">Contact Number</label>
        <input type="text" className="form-control text-dark bg-light" placeholder="09XXXXXXXXX" value={dlcForm.contactNumber} onChange={(e) => setDlcForm({...dlcForm, contactNumber: e.target.value})} required />
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
      <textarea className="form-control text-dark bg-light" rows={2} placeholder="State the purpose of the event..." value={dlcForm.purpose} onChange={(e) => setDlcForm({...dlcForm, purpose: e.target.value})} required />
    </div>

    {/* Location Settings (Radio buttons that look/act like specific checkboxes) */}
    <div className="mb-3">
      <label className="form-label fw-medium d-block">Event Location Classification</label>
      <div className="form-check form-check-inline">
        <input className="form-check-input" type="radio" name="locationType" id="loc-inside" value="Inside Campus" checked={dlcForm.locationType === 'Inside Campus'} onChange={(e) => setDlcForm({...dlcForm, locationType: e.target.value, locationOthersSpecify: ''})} />
        <label className="form-check-label text-dark" htmlFor="loc-inside">College/Unit (Inside Campus)</label>
      </div>
      <div className="form-check form-check-inline">
        <input className="form-check-input" type="radio" name="locationType" id="loc-outside" value="Outside Campus" checked={dlcForm.locationType === 'Outside Campus'} onChange={(e) => setDlcForm({...dlcForm, locationType: e.target.value, locationOthersSpecify: ''})} />
        <label className="form-check-label text-dark" htmlFor="loc-outside">Outside Campus</label>
      </div>
      <div className="form-check form-check-inline">
        <input className="form-check-input" type="radio" name="locationType" id="loc-others" value="Others" checked={dlcForm.locationType === 'Others'} onChange={(e) => setDlcForm({...dlcForm, locationType: e.target.value})} />
        <label className="form-check-label text-dark" htmlFor="loc-others">Others</label>
      </div>
    </div>

    {/* Conditional field if 'Others' location is selected */}
    {dlcForm.locationType === 'Others' && (
      <div className="mb-3 bg-white p-2 border rounded" data-aos="fade-down" data-aos-duration="300">
        <label className="form-label fw-medium small text-danger">Please Specify Location:</label>
        <input type="text" className="form-control text-dark bg-light" placeholder="Type location details..." value={dlcForm.locationOthersSpecify} onChange={(e) => setDlcForm({...dlcForm, locationOthersSpecify: e.target.value})} required />
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
      <textarea className="form-control text-dark bg-light" rows={2} placeholder="Specify other performance gear or request notes..." value={dlcForm.otherRequirements} onChange={(e) => setDlcForm({...dlcForm, otherRequirements: e.target.value})} />
    </div>

    <div className="mb-4">
      <label className="form-label fw-medium">Name of the Requestor</label>
      <input type="text" className="form-control text-dark bg-light" placeholder="Dean, Instructor, or Organization Head" value={dlcForm.requestorName} onChange={(e) => setDlcForm({...dlcForm, requestorName: e.target.value})} required />
    </div>

    <button type="submit" className="btn btn-primary w-100 py-2 fw-bold">Request</button>
  </form>
)}

       {/* FORM 4: SPORTS TRYOUTS FORM */}
{activeTab === 'general' && (
  <form onSubmit={(e) => handleSubmit(e, 'Sports Tryouts', generalForm)}>
    <h3 className="mb-4 h5 fw-bold text-primary" style={{ fontFamily: 'Georgia, serif' }}>4. Sports Tryouts Application Form</h3>
    
    <div className="mb-3">
      <label className="form-label fw-medium">Full Name</label>
      <input type="text" className="form-control text-dark bg-light" value={generalForm.name || ''} onChange={(e) => setGeneralForm({...generalForm, name: e.target.value})} required />
    </div>

    <div className="mb-3">
      <label className="form-label fw-medium">Degree / Course</label>
      <input type="text" className="form-control text-dark bg-light" placeholder="e.g., BS Information Technology" value={generalForm.degree || ''} onChange={(e) => setGeneralForm({...generalForm, degree: e.target.value})} required />
    </div>

    <div className="mb-3">
  <label className="form-label fw-medium">Student ID Number</label>
  <input type="text" className="form-control text-dark bg-light" placeholder="e.g., 201-XXXXX" value={generalForm.studentId || ''} onChange={(e) => setGeneralForm({...generalForm, studentId: e.target.value})} required />
</div>

    <div className="row mb-3">
      <div className="col-md-6">
        <label className="form-label fw-medium">Event / Sport</label>
        <input type="text" className="form-control text-dark bg-light" placeholder="e.g., Basketball" value={generalForm.sport || ''} onChange={(e) => setGeneralForm({...generalForm, sport: e.target.value})} required />
      </div>
      <div className="col-md-6 mt-3 mt-md-0">
        <label className="form-label fw-medium">Position</label>
        <input type="text" className="form-control text-dark bg-light" placeholder="e.g., Point Guard" value={generalForm.position || ''} onChange={(e) => setGeneralForm({...generalForm, position: e.target.value})} required />
      </div>
    </div>

    <div className="mb-3">
      <label className="form-label fw-medium">Playing Experience / Achievements</label>
      <textarea className="form-control text-dark bg-light" rows={3} placeholder="Tell us about your previous team or experience..." value={generalForm.experience || ''} onChange={(e) => setGeneralForm({...generalForm, experience: e.target.value})} required></textarea>
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


      </div>
      
      <div className="text-center mt-5 px-3" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h6 className="fw-bold text-secondary">UCSR Privacy Notice</h6>
          <p className="text-muted small" style={{ fontStyle: 'italic' }}>
            "All personal information contained in any document received or transmitted herein shall be used solely for documentation and processing purposes within the UCSR and shall not be shared with any outside parties, unless with your written consent. Personal information shall be retained and stored by the UCSR within a time period."
          </p>
        </div>
    </div>
    
    </>
  );
}