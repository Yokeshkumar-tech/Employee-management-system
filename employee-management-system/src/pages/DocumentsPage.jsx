/* eslint-disable no-unused-vars, react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';

export default function DocumentsPage({ API_BASE, user, socket, employees = [] }) {
  const [documents, setDocuments] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDocForm, setNewDocForm] = useState({
    title: '',
    description: '',
    category: 'Policy',
    fileUrl: '',
    employeeId: '',
    isCompanyWide: true
  });

  const isAdmin = ['admin', 'super_admin', 'hr'].includes(user?.role);
  
  const fetchDocuments = () => {
    fetch(`${API_BASE}/api/documents`, {
      headers: { Authorization: `Bearer ${user.token}` }
    })
    .then(res => res.json())
    .then(data => setDocuments(Array.isArray(data) ? data : []))
    .catch(console.error);
  };

  useEffect(() => {
    fetchDocuments();
  }, [API_BASE, user]);

  useEffect(() => {
    if (!socket) return;
    socket.on('document_added', fetchDocuments);
    return () => socket.off('document_added', fetchDocuments);
  }, [socket, API_BASE, user]);

  const handleAddDocument = (e) => {
    e.preventDefault();
    fetch(`${API_BASE}/api/documents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user.token}`
      },
      body: JSON.stringify({
        ...newDocForm,
        uploadedBy: user.id || user._id,
        employeeId: isAdmin ? (newDocForm.isCompanyWide ? null : newDocForm.employeeId) : (user.id || user._id),
        isCompanyWide: isAdmin ? newDocForm.isCompanyWide : false
      })
    })
    .then(res => res.json())
    .then(() => {
      setShowAddForm(false);
      setNewDocForm({ title: '', description: '', category: 'Policy', fileUrl: '', employeeId: '', isCompanyWide: true });
      fetchDocuments();
    })
    .catch(console.error);
  };

  const handleDeleteDocument = (id) => {
    if(!window.confirm("Are you sure you want to delete this document?")) return;
    fetch(`${API_BASE}/api/documents/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${user.token}`
      }
    })
    .then(res => res.json())
    .then(() => fetchDocuments())
    .catch(console.error);
  };

  return (
    <div className="page-container p-6 animate-fade-in">
      <header className="page-header" style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>Document Management</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>Policies, payslips, and company files.</p>
        </div>
        <button onClick={() => setShowAddForm(!showAddForm)} style={{ background: 'var(--grad-primary)', color: 'white', padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
          {showAddForm ? 'Cancel' : 'Upload Document'}
        </button>
      </header>
      
      {showAddForm && (
        <form onSubmit={handleAddDocument} className="panel-card" style={{ marginBottom: '24px', padding: '24px' }}>
          <div className="panel-header">
            <h3 style={{ margin: 0 }}>Upload New Document</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Title</label>
              <input type="text" required placeholder="e.g. Employee Handbook 2026" value={newDocForm.title} onChange={e => setNewDocForm({...newDocForm, title: e.target.value})} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Category</label>
              <select required value={newDocForm.category} onChange={e => setNewDocForm({...newDocForm, category: e.target.value})} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}>
                <option value="Policy">Policy</option>
                <option value="Payslip">Payslip</option>
                <option value="Contract">Contract</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>File URL / Path</label>
              <input type="text" required placeholder="https://example.com/file.pdf" value={newDocForm.fileUrl} onChange={e => setNewDocForm({...newDocForm, fileUrl: e.target.value})} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} />
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Description</label>
              <textarea placeholder="Briefly describe the contents..." value={newDocForm.description} onChange={e => setNewDocForm({...newDocForm, description: e.target.value})} rows="2" style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', resize: 'vertical' }} />
            </div>
          </div>

          {isAdmin && (
            <div style={{ display: 'flex', gap: '24px', alignItems: 'center', marginBottom: '24px', padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600, color: 'var(--text-primary)' }}>
                <input type="checkbox" checked={newDocForm.isCompanyWide} onChange={e => setNewDocForm({...newDocForm, isCompanyWide: e.target.checked})} style={{ width: '18px', height: '18px' }} />
                Company-wide Document
              </label>
              {!newDocForm.isCompanyWide && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>Assign to:</label>
                  <select required value={newDocForm.employeeId} onChange={e => setNewDocForm({...newDocForm, employeeId: e.target.value})} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', flex: 1, maxWidth: '300px' }}>
                    <option value="">Select Employee...</option>
                    {employees.map(emp => (
                      <option key={emp._id} value={emp._id}>{emp.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" style={{ background: 'var(--grad-primary)', color: 'white', padding: '8px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
              Save Document
            </button>
          </div>
        </form>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
        {documents.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', padding: '48px 0', textAlign: 'center', color: 'var(--text-muted)' }}>No documents uploaded.</div>
        ) : (
          documents.map(doc => (
            <div key={doc._id} className="panel-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', transition: 'all 0.2s ease', position: 'relative' }}>
              {isAdmin && (
                <button onClick={() => handleDeleteDocument(doc._id)} style={{ position: 'absolute', top: '16px', right: '16px', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', opacity: '0.6' }} title="Delete">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
              )}
              <div style={{ height: '48px', width: '48px', background: '#e0e7ff', color: '#4f46e5', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
              </div>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={doc.title}>
                {doc.title}
              </h3>
              <p style={{ margin: '0 0 16px 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {doc.category}
              </p>
              
              <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                <span className="pill" style={{ background: doc.isCompanyWide ? '#dbeafe' : '#fef3c7', color: doc.isCompanyWide ? '#2563eb' : '#d97706' }}>
                  {doc.isCompanyWide ? 'Company-wide' : 'Personal'}
                </span>
                <a href={doc.fileUrl} target="_blank" rel="noreferrer" style={{ color: '#4f46e5', fontWeight: 600, textDecoration: 'none' }}>
                  View File &rarr;
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
