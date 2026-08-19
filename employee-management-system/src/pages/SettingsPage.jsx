/* eslint-disable no-unused-vars, react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';

// Helper function to get avatar color
const getAvatarColor = (name) => {
  const colors = ['#f43f5e', '#8b5cf6', '#0ea5e9', '#10b981', '#f59e0b', '#6366f1'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

export default function SettingsPage({ user, setUser, API_BASE }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user.name || '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [empProfile, setEmpProfile] = useState(null);

  // Local state for toggles (mocked for now, but UI reflects instant changes)
  const [controls, setControls] = useState({
    twoFactor: true,
    deviceManagement: true,
    auditLogs: true
  });

  useEffect(() => {
    if (user.role === 'employee') {
      const fetchProfile = async () => {
        try {
          const token = window.localStorage.getItem('ems-token');
          const response = await fetch(`${API_BASE}/api/employees`, {
            headers: {
              ...(token ? { Authorization: `Bearer ${token}` } : {})
            }
          });
          if (response.ok) {
            const list = await response.json();
            if (list.length > 0) {
              setEmpProfile(list[0]);
            }
          }
        } catch (err) {
          console.error('Failed to fetch employee details', err);
        }
      };
      fetchProfile();
    }
  }, [user.role, API_BASE]);

  const handleToggle = (key) => {
    setControls(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) return;
    if (editName === user.name) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      const token = window.localStorage.getItem('ems-token');
      const response = await fetch(`${API_BASE}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ name: editName })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to update profile');

      setUser(prev => ({ ...prev, name: data.user.name }));
      setIsEditing(false);
    } catch (err) {
      setError(err.message === 'Failed to fetch' ? 'Backend unavailable.' : err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="page-container p-6 animate-fade-in max-w-4xl mx-auto">
      <header className="page-header" style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>Settings</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>Manage your personal profile and security preferences.</p>
        </div>
      </header>

      {error && <div className="feather-badge danger" style={{ marginBottom: '24px' }}>{error}</div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <article className="panel-card" style={{ padding: '32px' }}>
          <div className="panel-header" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>Profile Information</h3>
            <span className="pill" style={{ background: '#e0e7ff', color: '#4338ca', fontSize: '0.8rem', fontWeight: 600 }}>{user.role}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: getAvatarColor(user.name), color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold' }}>
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div style={{ flexGrow: 1 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 600 }}>Display Name</label>
                {isEditing ? (
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <input
                      type="text"
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', flexGrow: 1, outline: 'none' }}
                      autoFocus
                    />
                    <button onClick={handleSaveProfile} disabled={isSaving} style={{ background: 'var(--grad-primary)', color: 'white', padding: '10px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                      {isSaving ? 'Saving...' : 'Save'}
                    </button>
                    <button onClick={() => { setIsEditing(false); setEditName(user.name); }} style={{ background: '#f1f5f9', color: '#475569', padding: '10px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '1.2rem', color: 'var(--text-primary)', fontWeight: 600 }}>{user.name}</span>
                    <button
                      onClick={() => setIsEditing(true)}
                      style={{ background: 'none', border: 'none', color: '#6366f1', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px' }}
                      title="Edit Name"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div style={{ height: '1px', background: '#f1f5f9', margin: '4px 0' }}></div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 600 }}>Email Address</label>
                <div style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>
                  {user.role === 'super_admin' ? '••••••••@ems.com' : user.email}
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 600 }}>Authentication Method</label>
                <div style={{ fontSize: '1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {user.isGoogle ? (
                    <><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ea4335" strokeWidth="2"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg> Connected via Google</>
                  ) : (
                    <><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg> Email & Password</>
                  )}
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 600 }}>Timezone</label>
                <div style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>UTC+5:30 (IST)</div>
              </div>

              {empProfile && (
                <>
                  <div style={{ height: '1px', background: '#f1f5f9', margin: '4px 0', gridColumn: '1 / -1' }}></div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', gridColumn: '1 / -1' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 600 }}>Department</label>
                      <div style={{ fontSize: '1rem', color: 'var(--text-primary)', fontWeight: 500 }}>{empProfile.department || 'General'}</div>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 600 }}>Designation / Role Title</label>
                      <div style={{ fontSize: '1rem', color: 'var(--text-primary)', fontWeight: 500 }}>{empProfile.role || 'Employee'}</div>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 600 }}>Leave Balance</label>
                      <div style={{ fontSize: '1rem', color: 'var(--text-primary)', fontWeight: 500 }}>{empProfile.leaveBalance || 14} days</div>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 600 }}>Employment Status</label>
                      <div style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ width: 10, height: 10, background: empProfile.status === 'Active' ? '#10b981' : '#f59e0b', borderRadius: '50%' }} />
                        <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{empProfile.status || 'Active'}</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </article>

        <article className="panel-card" style={{ padding: '32px' }}>
          <div className="panel-header" style={{ marginBottom: '24px' }}>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>Security Controls</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { key: 'twoFactor', title: 'Two-Factor Authentication (2FA)', desc: 'Require a security code in addition to your password.' },
              { key: 'deviceManagement', title: 'Device Management', desc: 'Monitor and manage devices logged into your account.' },
              { key: 'auditLogs', title: 'Activity Audit Logs', desc: 'Keep a record of all sensitive actions performed on this account.' }
            ].map(setting => (
              <div key={setting.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div>
                  <h4 style={{ margin: '0 0 6px 0', color: 'var(--text-primary)', fontSize: '1.05rem', fontWeight: 600 }}>{setting.title}</h4>
                  <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{setting.desc}</p>
                </div>

                {/* Toggle Switch */}
                <button
                  onClick={() => handleToggle(setting.key)}
                  style={{
                    position: 'relative', width: '48px', height: '26px', borderRadius: '13px',
                    background: controls[setting.key] ? '#10b981' : '#cbd5e1',
                    border: 'none', cursor: 'pointer', transition: 'background 0.3s'
                  }}
                >
                  <div style={{
                    position: 'absolute', top: '3px', left: controls[setting.key] ? '25px' : '3px',
                    width: '20px', height: '20px', background: 'white', borderRadius: '50%',
                    transition: 'left 0.3s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                  }} />
                </button>
              </div>
            ))}
          </div>
        </article>
      </div>
    </div>
  );
}
