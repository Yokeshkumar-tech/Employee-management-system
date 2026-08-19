/* eslint-disable no-unused-vars, react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';

export default function ExpensesPage({ API_BASE, user, socket, employees = [] }) {
  const [expenses, setExpenses] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newExpenseForm, setNewExpenseForm] = useState({
    employeeId: user.id || user._id || '',
    category: '',
    amount: '',
    description: ''
  });

  const isAdmin = ['admin', 'super_admin', 'hr'].includes(user?.role);
  
  const fetchExpenses = () => {
    fetch(`${API_BASE}/api/expenses`, {
      headers: { Authorization: `Bearer ${user.token}` }
    })
    .then(res => res.json())
    .then(data => setExpenses(Array.isArray(data) ? data : []))
    .catch(console.error);
  };

  useEffect(() => {
    fetchExpenses();
  }, [API_BASE, user]);

  useEffect(() => {
    if (!socket) return;
    socket.on('expense_updated', fetchExpenses);
    return () => socket.off('expense_updated', fetchExpenses);
  }, [socket, API_BASE, user]);

  const handleAddExpense = (e) => {
    e.preventDefault();
    fetch(`${API_BASE}/api/expenses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user.token}`
      },
      body: JSON.stringify({
        ...newExpenseForm,
        employeeId: isAdmin ? newExpenseForm.employeeId : (user.id || user._id)
      })
    })
    .then(res => res.json())
    .then(() => {
      setShowAddForm(false);
      setNewExpenseForm({ employeeId: user.id || user._id || '', category: '', amount: '', description: '' });
      fetchExpenses();
    })
    .catch(console.error);
  };

  const handleUpdateStatus = (id, newStatus) => {
    fetch(`${API_BASE}/api/expenses/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user.token}`
      },
      body: JSON.stringify({ status: newStatus, approvedBy: user.id || user._id })
    })
    .then(res => res.json())
    .then(() => fetchExpenses())
    .catch(console.error);
  };

  return (
    <div className="page-container p-6 animate-fade-in">
      <header className="page-header" style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>Expense Claims</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>Submit and manage reimbursements.</p>
        </div>
        <button onClick={() => setShowAddForm(!showAddForm)} style={{ background: 'var(--grad-primary)', color: 'white', padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
          {showAddForm ? 'Cancel' : 'Submit Claim'}
        </button>
      </header>
      
      {showAddForm && (
        <form onSubmit={handleAddExpense} className="panel-card" style={{ marginBottom: '24px', padding: '24px' }}>
          <div className="panel-header">
            <h3 style={{ margin: 0 }}>New Expense Claim</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
            {isAdmin && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Employee</label>
                <select required value={newExpenseForm.employeeId} onChange={e => setNewExpenseForm({...newExpenseForm, employeeId: e.target.value})} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}>
                  <option value="">Select Employee</option>
                  {employees.map(emp => (
                    <option key={emp._id} value={emp._id}>{emp.name}</option>
                  ))}
                </select>
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Category</label>
              <select required value={newExpenseForm.category} onChange={e => setNewExpenseForm({...newExpenseForm, category: e.target.value})} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}>
                <option value="">Select Category</option>
                <option value="Travel">Travel</option>
                <option value="Meals">Meals</option>
                <option value="Supplies">Supplies</option>
                <option value="Training">Training</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Amount ($)</label>
              <input type="number" required min="0.01" step="0.01" value={newExpenseForm.amount} onChange={e => setNewExpenseForm({...newExpenseForm, amount: parseFloat(e.target.value)})} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Description</label>
              <textarea required placeholder="What was this expense for?" value={newExpenseForm.description} onChange={e => setNewExpenseForm({...newExpenseForm, description: e.target.value})} rows="2" style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', resize: 'vertical' }} />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" style={{ background: 'var(--grad-primary)', color: 'white', padding: '8px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
              Submit Expense
            </button>
          </div>
        </form>
      )}

      <div className="panel-card" style={{ padding: '0' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr style={{ borderBottom: '1px solid #cbd5e1', color: 'var(--text-secondary)' }}>
                {isAdmin && <th style={{ padding: '12px 16px', fontWeight: 600 }}>Employee</th>}
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Date</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Category</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Description</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Amount</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Status</th>
                {isAdmin && <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'right' }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {expenses.length === 0 ? (
                <tr><td colSpan={isAdmin ? 7 : 5} className="py-8 text-center text-slate-400">No expense claims submitted.</td></tr>
              ) : (
                expenses.map(expense => (
                  <tr key={expense._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    {isAdmin && <td style={{ padding: '12px 16px', fontWeight: 500 }}>{expense.employeeId?.name || 'Unknown'}</td>}
                    <td style={{ padding: '12px 16px' }}>{new Date(expense.date).toLocaleDateString()}</td>
                    <td style={{ padding: '12px 16px' }}>{expense.category}</td>
                    <td style={{ padding: '12px 16px', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{expense.description}</td>
                    <td style={{ padding: '12px 16px', fontWeight: 600 }}>${expense.amount}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span className="pill" style={{
                        background: expense.status === 'Pending' ? '#fef3c7' : expense.status === 'Approved' ? '#dcfce7' : expense.status === 'Rejected' ? '#fee2e2' : '#dbeafe',
                        color: expense.status === 'Pending' ? '#d97706' : expense.status === 'Approved' ? '#16a34a' : expense.status === 'Rejected' ? '#ef4444' : '#2563eb'
                      }}>
                        {expense.status}
                      </span>
                    </td>
                    {isAdmin && (
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        {expense.status === 'Pending' && (
                          <>
                            <button onClick={() => handleUpdateStatus(expense._id, 'Approved')} style={{ color: '#10b981', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, marginRight: '12px' }}>Approve</button>
                            <button onClick={() => handleUpdateStatus(expense._id, 'Rejected')} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Reject</button>
                          </>
                        )}
                        {expense.status === 'Approved' && (
                          <button onClick={() => handleUpdateStatus(expense._id, 'Paid')} style={{ color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Mark Paid</button>
                        )}
                      </td>
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
