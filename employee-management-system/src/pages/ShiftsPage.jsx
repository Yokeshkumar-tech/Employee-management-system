/* eslint-disable no-unused-vars, react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';

export default function ShiftsPage({ API_BASE, user, socket, employees = [] }) {
  const [shifts, setShifts] = useState([]);
  const [editingShift, setEditingShift] = useState(null);
  const [editForm, setEditForm] = useState({ startTime: '', endTime: '', department: '', status: '' });
  const [showAddForm, setShowAddForm] = useState(false);
  const [newShiftForm, setNewShiftForm] = useState({ employeeId: '', date: '', startTime: '', endTime: '', department: '' });

  const isAdmin = ['admin', 'super_admin', 'hr'].includes(user?.role);
  
  const startEdit = (shift) => {
    setEditingShift(shift._id);
    setEditForm({
      startTime: shift.startTime,
      endTime: shift.endTime,
      department: shift.department,
      status: shift.status
    });
  };

  const cancelEdit = () => {
    setEditingShift(null);
  };

  const handleUpdateShift = (id) => {
    fetch(`${API_BASE}/api/shifts/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user.token}`
      },
      body: JSON.stringify(editForm)
    })
    .then(res => res.json())
    .then(() => {
      setEditingShift(null);
    })
    .catch(console.error);
  };
  
  const handleAddShift = (e) => {
    e.preventDefault();
    fetch(`${API_BASE}/api/shifts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user.token}`
      },
      body: JSON.stringify({ ...newShiftForm, status: 'Scheduled' })
    })
    .then(res => res.json())
    .then(() => {
      setShowAddForm(false);
      setNewShiftForm({ employeeId: '', date: '', startTime: '', endTime: '', department: '' });
      fetchShifts();
    })
    .catch(console.error);
  };

  const fetchShifts = () => {
    fetch(`${API_BASE}/api/shifts`, {
      headers: { Authorization: `Bearer ${user.token}` }
    })
    .then(res => res.json())
    .then(data => setShifts(Array.isArray(data) ? data : []))
    .catch(console.error);
  };

  useEffect(() => {
    fetchShifts();
  }, [API_BASE, user]);

  useEffect(() => {
    if (!socket) return;
    socket.on('shift_updated', fetchShifts);
    return () => socket.off('shift_updated', fetchShifts);
  }, [socket, API_BASE, user]);

  return (
    <div className="page-container p-6 animate-fade-in">
      <header className="page-header" style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>Shift Scheduling</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>Manage employee shifts and rosters.</p>
        </div>
        {isAdmin && (
          <button onClick={() => setShowAddForm(!showAddForm)} style={{ background: 'var(--grad-primary)', color: 'white', padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
            {showAddForm ? 'Cancel' : 'Add Shift'}
          </button>
        )}
      </header>
      
      {isAdmin && showAddForm && (
        <form onSubmit={handleAddShift} className="panel-card" style={{ marginBottom: '24px', padding: '24px' }}>
          <div className="panel-header">
            <h3 style={{ margin: 0 }}>Schedule New Shift</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Employee</label>
              <select required value={newShiftForm.employeeId} onChange={e => setNewShiftForm({...newShiftForm, employeeId: e.target.value})} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}>
                <option value="">Select Employee</option>
                {employees.map(emp => (
                  <option key={emp._id} value={emp._id}>{emp.name}</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Date</label>
              <input type="date" required value={newShiftForm.date} onChange={e => setNewShiftForm({...newShiftForm, date: e.target.value})} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Start Time</label>
              <input type="time" required value={newShiftForm.startTime} onChange={e => setNewShiftForm({...newShiftForm, startTime: e.target.value})} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>End Time</label>
              <input type="time" required value={newShiftForm.endTime} onChange={e => setNewShiftForm({...newShiftForm, endTime: e.target.value})} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Department</label>
              <input type="text" required placeholder="e.g. Engineering" value={newShiftForm.department} onChange={e => setNewShiftForm({...newShiftForm, department: e.target.value})} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" style={{ background: 'var(--grad-primary)', color: 'white', padding: '8px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
              Save Shift
            </button>
          </div>
        </form>
      )}

      <div className="panel-card" style={{ padding: '0' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr style={{ borderBottom: '1px solid #cbd5e1', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Employee</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Date</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Time</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Department</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {shifts.length === 0 ? (
                <tr><td colSpan="6" className="py-8 text-center text-slate-400">No shifts scheduled yet.</td></tr>
              ) : (
                shifts.map(shift => (
                  <tr key={shift._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    {editingShift === shift._id ? (
                      <>
                        <td style={{ padding: '12px 16px', fontWeight: 500 }}>{shift.employeeId?.name || 'Unknown'}</td>
                        <td style={{ padding: '12px 16px' }}>{new Date(shift.date).toLocaleDateString()}</td>
                        <td style={{ padding: '12px 16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <input type="time" value={editForm.startTime} onChange={e => setEditForm({...editForm, startTime: e.target.value})} style={{ padding: '4px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                          <span style={{ color: 'var(--text-muted)' }}>-</span>
                          <input type="time" value={editForm.endTime} onChange={e => setEditForm({...editForm, endTime: e.target.value})} style={{ padding: '4px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <input type="text" value={editForm.department} onChange={e => setEditForm({...editForm, department: e.target.value})} style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', width: '100%' }} />
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <select value={editForm.status} onChange={e => setEditForm({...editForm, status: e.target.value})} style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                            <option value="Scheduled">Scheduled</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                          <button onClick={() => handleUpdateShift(shift._id)} style={{ color: '#10b981', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, marginRight: '12px' }}>Save</button>
                          <button onClick={cancelEdit} style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td style={{ padding: '12px 16px', fontWeight: 500 }}>{shift.employeeId?.name || 'Unknown'}</td>
                        <td style={{ padding: '12px 16px' }}>{new Date(shift.date).toLocaleDateString()}</td>
                        <td style={{ padding: '12px 16px' }}>{shift.startTime} - {shift.endTime}</td>
                        <td style={{ padding: '12px 16px' }}>{shift.department}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span className="pill" style={{
                            background: shift.status === 'Scheduled' ? '#dbeafe' : shift.status === 'Cancelled' ? '#fee2e2' : '#dcfce7',
                            color: shift.status === 'Scheduled' ? '#2563eb' : shift.status === 'Cancelled' ? '#ef4444' : '#16a34a'
                          }}>
                            {shift.status}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                          {isAdmin && (
                            <button onClick={() => startEdit(shift)} style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }} title="Edit Shift">
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                              </svg>
                            </button>
                          )}
                        </td>
                      </>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
