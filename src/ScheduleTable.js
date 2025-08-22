import React, { useState } from "react";
import "./App.css";

const ScheduleTable = () => {
  const [scheduleData, setScheduleData] = useState([
    {
      date: "28-07-2023",
      staff: "Dr Ram",
      startTime: "10:00 AM",
      endTime: "11:00 AM",
      slotsMin: 10,
      timeSlots: [],
    },
    {
      date: "28-07-2023",
      staff: "Dr Ravindra",
      startTime: "03:00 PM",
      endTime: "05:00 PM",
      slotsMin: 15,
      timeSlots: [],
    },
  ]);

  const [editingRow, setEditingRow] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [showTimeSlots, setShowTimeSlots] = useState({}); // New state for toggling time slot visibility

  const handleEditClick = (rowIndex) => {
    setEditingRow(rowIndex);
    setEditFormData(scheduleData[rowIndex]);
  };

  const handleCancelClick = () => {
    setEditingRow(null);
    setEditFormData({});
  };

  const handleFormChange = (event) => {
    const fieldName = event.target.name;
    const fieldValue = event.target.value;
    setEditFormData({ ...editFormData, [fieldName]: fieldValue });
  };

  const handleSaveClick = (rowIndex) => {
    const { startTime, endTime, slotsMin } = editFormData;

    // Validate time inputs
    const parsedStartTime = parseTime(startTime);
    const parsedEndTime = parseTime(endTime);

    if (isNaN(parsedStartTime) || isNaN(parsedEndTime)) {
      alert("Invalid start or end time format. Please use a valid 12-hour format (e.g., 10:00 AM).");
      return;
    }

    if (parsedStartTime.getTime() >= parsedEndTime.getTime()) {
      alert("Start time must be before end time.");
      return;
    }

    // Validate slotsMin
    if (slotsMin <= 0) {
      alert("Slots min must be a positive number.");
      return;
    }

    const newScheduleData = [...scheduleData];
    newScheduleData[rowIndex] = editFormData;
    setScheduleData(newScheduleData);
    setEditingRow(null);
    setEditFormData({});
    // After saving, recalculate slots if slotsMin changed or times changed
    calculateTimeSlots(
      rowIndex,
      newScheduleData[rowIndex].startTime,
      newScheduleData[rowIndex].endTime,
      newScheduleData[rowIndex].slotsMin
    );
  };

  const handleDeleteClick = (rowIndex) => {
    const newScheduleData = scheduleData.filter((_, index) => index !== rowIndex);
    setScheduleData(newScheduleData);
    // If the deleted row was being edited, reset editing state
    if (editingRow === rowIndex) {
      setEditingRow(null);
      setEditFormData({});
    }
    // Also remove time slot visibility state for the deleted row
    const newShowTimeSlots = { ...showTimeSlots };
    delete newShowTimeSlots[rowIndex];
    setShowTimeSlots(newShowTimeSlots);
  };

  const handleAddClick = () => {
    const newEntry = {
      date: new Date().toLocaleDateString('en-GB'), // Current date in DD/MM/YYYY format
      staff: '',
      startTime: '09:00 AM',
      endTime: '05:00 PM',
      slotsMin: 30,
      timeSlots: [],
    };
    setScheduleData([...scheduleData, newEntry]);
    // Set the new row into editing mode immediately
    setEditingRow(scheduleData.length);
    setEditFormData(newEntry);
  };

  const toggleTimeSlots = (rowIndex, startTime, endTime, slotsMin) => {
    if (!showTimeSlots[rowIndex]) {
      calculateTimeSlots(rowIndex, startTime, endTime, slotsMin);
    }
    setShowTimeSlots(prev => ({ ...prev, [rowIndex]: !prev[rowIndex] }));
  };

  // Helper function to convert 12-hour time to 24-hour format (e.g., '01:00 PM' -> '13:00')
  const convertTo24Hour = (time12h) => {
    const [time, modifier] = time12h.split(" ");
    let [hours, minutes] = time.split(":");
    if (hours === "12") {
      hours = "00";
    }
    if (modifier === "PM") {
      hours = parseInt(hours, 10) + 12;
    }
    return `${hours}:${minutes}`;
  };

  // Helper function to convert 24-hour time to 12-hour format (e.g., '13:00' -> '01:00 PM')
  const convertTo12Hour = (time24h) => {
    let [hours, minutes] = time24h.split(':');
    const period = parseInt(hours, 10) >= 12 ? 'PM' : 'AM';
    hours = parseInt(hours, 10) % 12 || 12; // Convert '00' to '12' for AM, and '13' to '1' for PM
    return `${String(hours).padStart(2, '0')}:${minutes} ${period}`;
  };

  // Parse 12-hour time to a Date object reliably
  const parseTime = (time12h) => {
    const [time, modifier] = time12h.split(' ');
    let [hours, minutes] = time.split(':');
    hours = parseInt(hours, 10);
    minutes = parseInt(minutes, 10);

    if (modifier === 'PM' && hours < 12) {
      hours += 12;
    } else if (modifier === 'AM' && hours === 12) {
      hours = 0;
    }
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  const calculateTimeSlots = (rowIndex, startTime, endTime, slotsMin) => {
    if (!startTime || !endTime || !slotsMin || slotsMin <= 0) {
      console.warn("Invalid input for time slot calculation.");
      // Clear slots if input is invalid
      const newScheduleData = [...scheduleData];
      newScheduleData[rowIndex] = { ...newScheduleData[rowIndex], timeSlots: [] };
      setScheduleData(newScheduleData);
      return;
    }

    const start = parseTime(startTime);
    const end = parseTime(endTime);

    if (isNaN(start) || isNaN(end) || start.getTime() >= end.getTime()) {
      console.warn("Invalid time range for slot calculation.");
      // Clear slots if time range is invalid
      const newScheduleData = [...scheduleData];
      newScheduleData[rowIndex] = { ...newScheduleData[rowIndex], timeSlots: [] };
      setScheduleData(newScheduleData);
      return;
    }

    const slots = [];

    let currentTime = start;
    while (currentTime < end) {
      const nextTime = new Date(currentTime.getTime() + slotsMin * 60000);

      if (nextTime.getTime() > end.getTime()) {
        break; // Stop if the next slot goes beyond the end time
      }

      const currentSlotStart = convertTo12Hour(
        `${String(currentTime.getHours()).padStart(2, '0')}:${String(currentTime.getMinutes()).padStart(2, '0')}`
      );
      const currentSlotEnd = convertTo12Hour(
        `${String(nextTime.getHours()).padStart(2, '0')}:${String(nextTime.getMinutes()).padStart(2, '0')}`
      );
      slots.push(`${currentSlotStart} to ${currentSlotEnd}`);

      currentTime = nextTime;
    }

    const newScheduleData = [...scheduleData];
    newScheduleData[rowIndex] = {
      ...newScheduleData[rowIndex],
      timeSlots: slots,
    };
    setScheduleData(newScheduleData);
  };

  return (
    <main className="schedule-container">
      <h1>Schedule Creator</h1>
      <button onClick={handleAddClick} className="action-button add-button">
        Add New Schedule
      </button>
      <table className="schedule-table">
        <thead>
          <tr>
            <th className="table-header">Date</th>
            <th className="table-header">Staff</th>
            <th className="table-header">Schedule start time</th>
            <th className="table-header">Schedule End time</th>
            <th className="table-header">Slots min</th>
            <th className="table-header">Action</th>
          </tr>
        </thead>
        <tbody>
          {scheduleData.map((row, rowIndex) => (
            <React.Fragment key={rowIndex}>
              <tr>
                <td className="table-cell">{row.date}</td>
                <td className="table-cell">
                  {editingRow === rowIndex ? (
                    <input
                      type="text"
                      name="staff"
                      value={editFormData.staff}
                      onChange={handleFormChange}
                      className="text-input"
                    />
                  ) : (
                    row.staff
                  )}
                </td>
                <td className="table-cell">
                  {editingRow === rowIndex ? (
                    <input
                      type="time"
                      name="startTime"
                      value={convertTo24Hour(editFormData.startTime)}
                      onChange={handleFormChange}
                      className="time-input"
                    />
                  ) : (
                    row.startTime
                  )}
                </td>
                <td className="table-cell">
                  {editingRow === rowIndex ? (
                    <input
                      type="time"
                      name="endTime"
                      value={convertTo24Hour(editFormData.endTime)}
                      onChange={handleFormChange}
                      className="time-input"
                    />
                  ) : (
                    row.endTime
                  )}
                </td>
                <td className="table-cell">
                  {editingRow === rowIndex ? (
                    <input
                      type="number"
                      name="slotsMin"
                      value={editFormData.slotsMin}
                      onChange={handleFormChange}
                      className="slots-input"
                    />
                  ) : (
                    <>
                      {row.slotsMin}
                      <button
                        onClick={() =>
                          toggleTimeSlots(
                            rowIndex,
                            row.startTime,
                            row.endTime,
                            row.slotsMin
                          )
                        }
                        className="dropdown-button"
                      >
                        {showTimeSlots[rowIndex] ? '▲' : '▼'}
                      </button>
                    </>
                  )}
                </td>
                <td className="table-cell">
                  {editingRow === rowIndex ? (
                    <>
                      <button
                        onClick={() => handleSaveClick(rowIndex)}
                        className="action-button save-button"
                      >
                        Save
                      </button>
                      <button onClick={handleCancelClick} className="action-button cancel-button">Cancel</button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleEditClick(rowIndex)}
                        className="action-button edit-button"
                      >
                        Edit
                      </button>
                      <button onClick={() => handleDeleteClick(rowIndex)} className="action-button delete-button">Delete</button>
                    </>
                  )}
                </td>
              </tr>
              {row.timeSlots.length > 0 && showTimeSlots[rowIndex] && (
                <tr>
                  <td colSpan="6" className="time-slots-container">
                    <div className="time-slots-grid">
                      {row.timeSlots.map((slot, slotIndex) => (
                        <span key={slotIndex} className="time-slot-item">
                          {slot}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </main>
  );
};

const tableHeaderStyle = {
  border: "1px solid",
  padding: "8px",
  textAlign: "left",
  backgroundColor: "#f2f2f2",
};

const tableCellStyle = {
  border: "1px solid",
  padding: "8px",
};

const timeSlotStyle = {
  backgroundColor: "#ffffffff",
  padding: "5px 10px",
  borderRadius: "5px",
  whiteSpace: "nowrap",
  border: "1px solid",
  // boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px",
};

const inputStyle = {
  width: "100px",
  padding: "5px",
  boxSizing: "border-box",
};

export default ScheduleTable;
