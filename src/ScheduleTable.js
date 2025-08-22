import React, { useState } from "react";

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

  const calculateTimeSlots = (rowIndex, startTime, endTime, slotsMin) => {
    if (!startTime || !endTime || !slotsMin) return;

    const start = new Date(`2000/01/01 ${startTime}`);
    const end = new Date(`2000/01/01 ${endTime}`);
    const slots = [];

    let currentTime = start;
    while (currentTime < end) {
      const nextTime = new Date(currentTime.getTime() + slotsMin * 60000);
      if (nextTime <= end) {
        slots.push(
          `${currentTime.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          })} to ${nextTime.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          })}`
        );
      }
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
    <div style={{ padding: "20px", margin: "20px", border: "1px solid" }}>
      <table
        style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}
      >
        <thead>
          <tr>
            <th style={tableHeaderStyle}>Date</th>
            <th style={tableHeaderStyle}>Staff</th>
            <th style={tableHeaderStyle}>Schedule start time</th>
            <th style={tableHeaderStyle}>Schedule End time</th>
            <th style={tableHeaderStyle}>Slots min</th>
            <th style={tableHeaderStyle}>Action</th>
          </tr>
        </thead>
        <tbody>
          {scheduleData.map((row, rowIndex) => (
            <React.Fragment key={rowIndex}>
              <tr>
                <td style={tableCellStyle}>{row.date}</td>
                <td style={tableCellStyle}>{row.staff}</td>
                <td style={tableCellStyle}>
                  {editingRow === rowIndex ? (
                    <input
                      type="time"
                      name="startTime"
                      value={convertTo24Hour(editFormData.startTime)}
                      onChange={handleFormChange}
                      style={inputStyle}
                    />
                  ) : (
                    row.startTime
                  )}
                </td>
                <td style={tableCellStyle}>
                  {editingRow === rowIndex ? (
                    <input
                      type="time"
                      name="endTime"
                      value={convertTo24Hour(editFormData.endTime)}
                      onChange={handleFormChange}
                      style={inputStyle}
                    />
                  ) : (
                    row.endTime
                  )}
                </td>
                <td style={tableCellStyle}>
                  {editingRow === rowIndex ? (
                    <input
                      type="number"
                      name="slotsMin"
                      value={editFormData.slotsMin}
                      onChange={handleFormChange}
                      style={inputStyle}
                    />
                  ) : (
                    <>
                      {row.slotsMin}
                      <button
                        onClick={() =>
                          calculateTimeSlots(
                            rowIndex,
                            row.startTime,
                            row.endTime,
                            row.slotsMin
                          )
                        }
                        style={{
                          marginLeft: "5px",
                          padding: "2px 5px",
                          cursor: "pointer",
                        }}
                      >
                        ▼
                      </button>
                    </>
                  )}
                </td>
                <td style={tableCellStyle}>
                  {editingRow === rowIndex ? (
                    <>
                      <button
                        onClick={() => handleSaveClick(rowIndex)}
                        style={{ marginRight: "5px" }}
                      >
                        Save
                      </button>
                      <button onClick={handleCancelClick}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleEditClick(rowIndex)}
                        style={{ marginRight: "5px" }}
                      >
                        Edit
                      </button>
                      <button>Delete</button>
                    </>
                  )}
                </td>
              </tr>
              {row.timeSlots.length > 0 && (
                <tr>
                  <td
                    colSpan="6"
                    style={{ padding: "10px", border: "1px solid" }}
                  >
                    <div
                      style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}
                    >
                      {row.timeSlots.map((slot, slotIndex) => (
                        <span key={slotIndex} style={timeSlotStyle}>
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
    </div>
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
