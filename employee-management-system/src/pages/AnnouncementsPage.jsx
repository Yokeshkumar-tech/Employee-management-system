/* eslint-disable no-unused-vars, react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';

export default function AnnouncementsPage({ API_BASE, user, socket }) {
  const [announcements, setAnnouncements] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAnnounceForm, setNewAnnounceForm] = useState({
    title: '',
    content: '',
    priority: 'Normal',
    targetAudience: 'All',
    validUntil: ''
  });

  const isAdmin = ['admin', 'super_admin', 'hr'].includes(user?.role);
  
  const fetchAnnouncements = () => {
    fetch(`${API_BASE}/api/announcements`, {
      headers: { Authorization: `Bearer ${user.token}` }
    })
    .then(res => res.json())
    .then(data => setAnnouncements(Array.isArray(data) ? data : []))
    .catch(console.error);
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [API_BASE, user]);

  useEffect(() => {
    if (!socket) return;
    socket.on('announcement_added', fetchAnnouncements);
    return () => socket.off('announcement_added', fetchAnnouncements);
  }, [socket, API_BASE, user]);

  const handleAddAnnouncement = (e) => {
    e.preventDefault();
    fetch(`${API_BASE}/api/announcements`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user.token}`
      },
      body: JSON.stringify({
        ...newAnnounceForm,
        authorId: user.id || user._id,
        validUntil: newAnnounceForm.validUntil ? new Date(newAnnounceForm.validUntil) : null
      })
    })
    .then(res => res.json())
    .then(() => {
      setShowAddForm(false);
      setNewAnnounceForm({ title: '', content: '', priority: 'Normal', targetAudience: 'All', validUntil: '' });
      fetchAnnouncements();
    })
    .catch(console.error);
  };

  const handleDeleteAnnouncement = (id) => {
    if(!window.confirm("Are you sure you want to delete this announcement?")) return;
    fetch(`${API_BASE}/api/announcements/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${user.token}`
      }
    })
    .then(res => res.json())
    .then(() => fetchAnnouncements())
    .catch(console.error);
  };

  return (
    <div className="page-container p-6 animate-fade-in max-w-4xl mx-auto">
      <header className="page-header" style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>Company Announcements</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>Latest news and updates from the team.</p>
        </div>
        {isAdmin && (
          <button onClick={() => setShowAddForm(!showAddForm)} style={{ background: 'var(--grad-primary)', color: 'white', padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
            {showAddForm ? 'Cancel' : 'Post News'}
          </button>
        )}
      </header>
      
      {isAdmin && showAddForm && (
        <form onSubmit={handleAddAnnouncement} className="panel-card" style={{ marginBottom: '24px', padding: '24px' }}>
          <div className="panel-header">
            <h3 style={{ margin: 0 }}>New Announcement</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Title</label>
              <input type="text" required placeholder="e.g. Q3 Townhall Meeting" value={newAnnounceForm.title} onChange={e => setNewAnnounceForm({...newAnnounceForm, title: e.target.value})} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Priority</label>
                <select required value={newAnnounceForm.priority} onChange={e => setNewAnnounceForm({...newAnnounceForm, priority: e.target.value})} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}>
                  <option value="Low">Low</option>
                  <option value="Normal">Normal</option>
                  <option value="High">High</option>
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Audience</label>
                <input type="text" placeholder="e.g. All, Engineering, Sales" value={newAnnounceForm.targetAudience} onChange={e => setNewAnnounceForm({...newAnnounceForm, targetAudience: e.target.value})} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Valid Until (Optional)</label>
                <input type="date" value={newAnnounceForm.validUntil} onChange={e => setNewAnnounceForm({...newAnnounceForm, validUntil: e.target.value})} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Content</label>
              <textarea required placeholder="Write your announcement here..." value={newAnnounceForm.content} onChange={e => setNewAnnounceForm({...newAnnounceForm, content: e.target.value})} rows="5" style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', resize: 'vertical' }} />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" style={{ background: 'var(--grad-primary)', color: 'white', padding: '8px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
              Post Announcement
            </button>
          </div>
        </form>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {announcements.length === 0 ? (
          <div className="panel-card" style={{ padding: '48px 0', textAlign: 'center', color: 'var(--text-muted)' }}>No announcements yet.</div>
        ) : (
          announcements.map(ann => (
            <div key={ann._id} className="panel-card" style={{ padding: '24px', borderLeft: ann.priority === 'High' ? '4px solid #ef4444' : ann.priority === 'Low' ? '4px solid #94a3b8' : '4px solid #2563eb' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>{ann.title}</h3>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <span>By: {ann.authorId?.name || 'Admin'}</span>
                    <span>•</span>
                    <span>{new Date(ann.createdAt).toLocaleDateString()}</span>
                    <span>•</span>
                    <span className="pill" style={{ background: '#f1f5f9', color: '#475569', fontSize: '0.75rem' }}>{ann.targetAudience}</span>
                  </div>
                </div>
                {isAdmin && (
                  <button onClick={() => handleDeleteAnnouncement(ann._id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', opacity: '0.6' }} title="Delete Announcement">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                  </button>
                )}
              </div>
              <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: '1.6', whiteSpace: 'pre-line' }}>{ann.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
