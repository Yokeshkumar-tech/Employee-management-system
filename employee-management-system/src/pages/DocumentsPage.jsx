/* eslint-disable no-unused-vars, react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';

export default function DocumentsPage({ API_BASE, user, socket, employees = [] }) {
  const [documents, setDocuments] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [uploading, setUploading] = useState(false);
  const [uploadMode, setUploadMode] = useState('file'); // 'file' or 'url'

  // Form state
  const [newDocForm, setNewDocForm] = useState({
    title: '',
    description: '',
    category: 'Policy',
    fileUrl: '',
    employeeId: '',
    isCompanyWide: true
  });
  const [selectedFile, setSelectedFile] = useState(null);

  const isAdmin = ['admin', 'super_admin', 'hr'].includes(user?.role);

  const getAuthToken = () => {
    return user?.token || (typeof window !== 'undefined' ? (window.localStorage.getItem('ems-token') || '') : '') || '';
  };

  const showToast = (type, message) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback({ type: '', message: '' }), 4500);
  };

  const fetchDocuments = () => {
    const token = getAuthToken();
    if (!token) return;
    fetch(`${API_BASE}/api/documents`, {
      headers: { Authorization: `Bearer ${token}` }
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

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileViewUrl = (doc) => {
    if (!doc.fileUrl) return '#';
    // If it's a server-stored file (starts with /uploads/), serve from API_BASE
    if (doc.fileUrl.startsWith('/uploads/')) {
      return `${API_BASE}${doc.fileUrl}`;
    }
    // If it's already a full URL
    if (doc.fileUrl.startsWith('http://') || doc.fileUrl.startsWith('https://')) {
      return doc.fileUrl;
    }
    // Otherwise construct full URL
    return `${API_BASE}${doc.fileUrl.startsWith('/') ? '' : '/'}${doc.fileUrl}`;
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      // Auto-fill title from file name if empty
      if (!newDocForm.title) {
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        setNewDocForm(prev => ({ ...prev, title: nameWithoutExt }));
      }
    }
  };

  // Handle Document Upload / Create
  const handleAddDocument = async (e) => {
    e.preventDefault();

    if (uploadMode === 'file' && !selectedFile) {
      showToast('error', 'Please select a file to upload.');
      return;
    }
    if (uploadMode === 'url' && !newDocForm.fileUrl.trim()) {
      showToast('error', 'Please enter a valid file URL.');
      return;
    }
    if (!newDocForm.title.trim()) {
      showToast('error', 'Please enter a document title.');
      return;
    }

    setUploading(true);
    const token = getAuthToken();

    try {
      let res;

      if (uploadMode === 'file') {
        // Upload with FormData (multipart)
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('title', newDocForm.title.trim());
        formData.append('description', newDocForm.description);
        formData.append('category', newDocForm.category);
        formData.append('isCompanyWide', isAdmin ? newDocForm.isCompanyWide : false);
        if (!newDocForm.isCompanyWide && newDocForm.employeeId) {
          formData.append('employeeId', newDocForm.employeeId);
        }

        res = await fetch(`${API_BASE}/api/documents/upload`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData
        });
      } else {
        // URL-based document
        res = await fetch(`${API_BASE}/api/documents`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            ...newDocForm,
            uploadedBy: user.id || user._id,
            employeeId: isAdmin ? (newDocForm.isCompanyWide ? null : newDocForm.employeeId) : (user.id || user._id),
            isCompanyWide: isAdmin ? newDocForm.isCompanyWide : false
          })
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Upload failed');

      showToast('success', `Document "${data.title}" uploaded successfully!`);
      setShowAddForm(false);
      setSelectedFile(null);
      setNewDocForm({ title: '', description: '', category: 'Policy', fileUrl: '', employeeId: '', isCompanyWide: true });
      fetchDocuments();
    } catch (err) {
      showToast('error', err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    const token = getAuthToken();
    try {
      const res = await fetch(`${API_BASE}/api/documents/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.message || 'Delete failed');
      }
      showToast('success', `Document "${title}" deleted.`);
      fetchDocuments();
    } catch (err) {
      showToast('error', err.message);
    }
  };

  // File extension icon helper
  const getFileIcon = (doc) => {
    const url = doc.fileUrl || doc.originalName || '';
    const ext = url.split('.').pop().toLowerCase();
    if (['pdf'].includes(ext)) return '📄';
    if (['doc', 'docx'].includes(ext)) return '📝';
    if (['xls', 'xlsx', 'csv'].includes(ext)) return '📊';
    if (['ppt', 'pptx'].includes(ext)) return '📽️';
    if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext)) return '🖼️';
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return '📦';
    if (['mp4', 'avi', 'mov', 'mkv'].includes(ext)) return '🎬';
    return '📎';
  };

  const categoryColors = {
    Policy: { bg: '#dbeafe', text: '#1d4ed8' },
    Payslip: { bg: '#dcfce7', text: '#15803d' },
    Contract: { bg: '#fef3c7', text: '#b45309' },
    Other: { bg: '#f1f5f9', text: '#475569' }
  };

  return (
    <div className="page-container p-6 animate-fade-in" style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Toast Notification */}
      {feedback.message && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          zIndex: 9999,
          padding: '12px 20px',
          borderRadius: '8px',
          fontWeight: 600,
          boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
          background: feedback.type === 'error' ? '#fee2e2' : '#dcfce7',
          color: feedback.type === 'error' ? '#b91c1c' : '#15803d',
          border: `1px solid ${feedback.type === 'error' ? '#fca5a5' : '#86efac'}`,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          animation: 'fadeIn 0.2s ease-in-out'
        }}>
          <span>{feedback.type === 'error' ? '⚠️' : '✅'}</span>
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Header */}
      <header className="page-header" style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Document Management</h1>
            <span style={{ fontSize: '0.8rem', background: '#eff6ff', color: '#2563eb', padding: '4px 10px', borderRadius: '12px', fontWeight: 600 }}>
              {documents.length} files
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginTop: '6px', fontSize: '0.95rem' }}>
            Upload, view, and manage company policies, payslips, contracts, and other documents.
          </p>
        </div>
        <button
          onClick={() => {
            setShowAddForm(!showAddForm);
            if (!showAddForm) {
              setSelectedFile(null);
              setUploadMode('file');
            }
          }}
          style={{
            background: showAddForm ? '#64748b' : 'var(--grad-primary, linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%))',
            color: 'white',
            padding: '10px 18px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 12px rgba(79,70,229,0.25)'
          }}
        >
          {showAddForm ? '✕ Cancel' : '📤 Upload Document'}
        </button>
      </header>

      {/* Upload Form */}
      {showAddForm && (
        <form onSubmit={handleAddDocument} className="panel-card" style={{ marginBottom: '28px', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>Upload New Document</h3>
            
            {/* Toggle Upload Mode */}
            <div style={{ display: 'flex', gap: '4px', background: '#e2e8f0', borderRadius: '8px', padding: '3px' }}>
              <button
                type="button"
                onClick={() => setUploadMode('file')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  background: uploadMode === 'file' ? '#4f46e5' : 'transparent',
                  color: uploadMode === 'file' ? 'white' : '#64748b'
                }}
              >
                📁 Upload File
              </button>
              <button
                type="button"
                onClick={() => setUploadMode('url')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  background: uploadMode === 'url' ? '#4f46e5' : 'transparent',
                  color: uploadMode === 'url' ? 'white' : '#64748b'
                }}
              >
                🔗 External URL
              </button>
            </div>
          </div>

          {/* File Upload Area */}
          {uploadMode === 'file' && (
            <div style={{ marginBottom: '16px' }}>
              <label
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: selectedFile ? '16px' : '32px',
                  border: `2px dashed ${selectedFile ? '#10b981' : '#cbd5e1'}`,
                  borderRadius: '12px',
                  background: selectedFile ? '#f0fdf4' : 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {selectedFile ? (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '8px' }}>{getFileIcon({ originalName: selectedFile.name })}</div>
                    <div style={{ fontWeight: 700, color: '#15803d', fontSize: '1rem' }}>{selectedFile.name}</div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>
                      {formatFileSize(selectedFile.size)} • Click to change file
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>📂</div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                      Click to select a file or drag & drop
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                      PDF, DOC, XLS, PPT, Images, ZIP — up to 50MB
                    </div>
                  </div>
                )}
                <input
                  type="file"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.ppt,.pptx,.png,.jpg,.jpeg,.gif,.webp,.svg,.zip,.rar,.7z,.tar,.gz,.mp4,.avi,.mov,.mkv,.txt,.md"
                />
              </label>
            </div>
          )}

          {/* URL Input */}
          {uploadMode === 'url' && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>File URL *</label>
              <input
                type="url"
                required
                placeholder="https://drive.google.com/file/d/... or any publicly accessible link"
                value={newDocForm.fileUrl}
                onChange={e => setNewDocForm({ ...newDocForm, fileUrl: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', background: 'white' }}
              />
            </div>
          )}

          {/* Document Details */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Document Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Employee Handbook 2026"
                value={newDocForm.title}
                onChange={e => setNewDocForm({ ...newDocForm, title: e.target.value })}
                style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', background: 'white' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Category *</label>
              <select
                required
                value={newDocForm.category}
                onChange={e => setNewDocForm({ ...newDocForm, category: e.target.value })}
                style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', background: 'white' }}
              >
                <option value="Policy">Policy</option>
                <option value="Payslip">Payslip</option>
                <option value="Contract">Contract</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', gridColumn: '1 / -1' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Description (Optional)</label>
              <textarea
                placeholder="Briefly describe the document contents..."
                value={newDocForm.description}
                onChange={e => setNewDocForm({ ...newDocForm, description: e.target.value })}
                rows="2"
                style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', resize: 'vertical', background: 'white' }}
              />
            </div>
          </div>

          {/* Admin: Company-wide toggle + Employee Selector */}
          {isAdmin && (
            <div style={{ display: 'flex', gap: '24px', alignItems: 'center', marginBottom: '20px', padding: '14px 16px', background: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                <input
                  type="checkbox"
                  checked={newDocForm.isCompanyWide}
                  onChange={e => setNewDocForm({ ...newDocForm, isCompanyWide: e.target.checked })}
                  style={{ width: '18px', height: '18px', accentColor: '#4f46e5' }}
                />
                Company-wide Document
              </label>
              {!newDocForm.isCompanyWide && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>Assign to:</label>
                  <select
                    value={newDocForm.employeeId}
                    onChange={e => setNewDocForm({ ...newDocForm, employeeId: e.target.value })}
                    style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', flex: 1, maxWidth: '300px' }}
                  >
                    <option value="">Select Employee...</option>
                    {employees.map(emp => (
                      <option key={emp._id} value={emp._id}>{emp.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {/* Submit Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button
              type="button"
              onClick={() => { setShowAddForm(false); setSelectedFile(null); }}
              style={{ background: '#e2e8f0', color: '#334155', padding: '9px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600 }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              style={{
                background: uploading ? '#94a3b8' : 'var(--grad-primary, linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%))',
                color: 'white',
                padding: '9px 24px',
                borderRadius: '8px',
                border: 'none',
                cursor: uploading ? 'not-allowed' : 'pointer',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {uploading ? '⏳ Uploading...' : `📤 ${uploadMode === 'file' ? 'Upload File' : 'Save Document'}`}
            </button>
          </div>
        </form>
      )}

      {/* Documents Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {documents.length === 0 ? (
          <div className="panel-card" style={{ gridColumn: '1 / -1', padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📁</div>
            <h3 style={{ margin: '0 0 8px 0', color: 'var(--text-primary)' }}>No documents uploaded</h3>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>
              Get started by clicking "Upload Document" to add your first file.
            </p>
          </div>
        ) : (
          documents.map(doc => {
            const catColor = categoryColors[doc.category] || categoryColors.Other;
            const viewUrl = getFileViewUrl(doc);
            const isLocalFile = doc.fileUrl && doc.fileUrl.startsWith('/uploads/');

            return (
              <div
                key={doc._id}
                className="panel-card"
                style={{
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0'
                }}
              >
                {/* Delete button (Admin) */}
                {isAdmin && (
                  <button
                    onClick={() => handleDeleteDocument(doc._id, doc.title)}
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      color: '#ef4444',
                      background: '#fee2e2',
                      border: 'none',
                      cursor: 'pointer',
                      borderRadius: '6px',
                      width: '30px',
                      height: '30px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.9rem',
                      opacity: 0.7,
                      transition: 'opacity 0.15s'
                    }}
                    title="Delete Document"
                  >
                    🗑️
                  </button>
                )}

                {/* File Icon */}
                <div style={{
                  height: '52px',
                  width: '52px',
                  background: catColor.bg,
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '14px',
                  fontSize: '1.5rem'
                }}>
                  {getFileIcon(doc)}
                </div>

                {/* Title & Category */}
                <h3
                  style={{
                    margin: '0 0 4px 0',
                    fontSize: '1.05rem',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    paddingRight: '30px'
                  }}
                  title={doc.title}
                >
                  {doc.title}
                </h3>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  {doc.description || doc.category}
                </div>

                {/* File metadata */}
                {(doc.originalName || doc.fileSize > 0) && (
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '8px' }}>
                    {doc.originalName && <span>{doc.originalName}</span>}
                    {doc.fileSize > 0 && <span> • {formatFileSize(doc.fileSize)}</span>}
                  </div>
                )}

                {/* Footer */}
                <div style={{
                  marginTop: 'auto',
                  paddingTop: '14px',
                  borderTop: '1px solid #f1f5f9',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.8rem'
                }}>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <span
                      className="pill"
                      style={{
                        background: doc.isCompanyWide ? '#dbeafe' : '#fef3c7',
                        color: doc.isCompanyWide ? '#2563eb' : '#d97706',
                        padding: '3px 8px',
                        borderRadius: '8px',
                        fontWeight: 600,
                        fontSize: '0.75rem'
                      }}
                    >
                      {doc.isCompanyWide ? 'Company-wide' : 'Personal'}
                    </span>
                    <span
                      className="pill"
                      style={{
                        background: catColor.bg,
                        color: catColor.text,
                        padding: '3px 8px',
                        borderRadius: '8px',
                        fontWeight: 600,
                        fontSize: '0.75rem'
                      }}
                    >
                      {doc.category}
                    </span>
                  </div>

                  <a
                    href={viewUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      color: '#4f46e5',
                      fontWeight: 700,
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      background: '#eff6ff',
                      fontSize: '0.8rem',
                      transition: 'background 0.15s'
                    }}
                  >
                    {isLocalFile ? '📥 Download' : '🔗 Open'} →
                  </a>
                </div>

                {/* Upload date */}
                {doc.createdAt && (
                  <div style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: '8px', textAlign: 'right' }}>
                    Uploaded {new Date(doc.createdAt).toLocaleDateString()}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
