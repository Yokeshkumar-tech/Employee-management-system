/* eslint-disable no-unused-vars, react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';

export default function AssetsPage({ API_BASE, user, socket, employees = [] }) {
  const [assets, setAssets] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAssetForm, setNewAssetForm] = useState({
    assetTag: '',
    name: '',
    category: '',
    purchaseDate: '',
    purchaseCost: '',
    status: 'Available',
    assignedTo: ''
  });

  const isAdmin = ['admin', 'super_admin', 'hr'].includes(user?.role);
  
  const fetchAssets = () => {
    fetch(`${API_BASE}/api/assets`, {
      headers: { Authorization: `Bearer ${user.token}` }
    })
    .then(res => res.json())
    .then(data => setAssets(Array.isArray(data) ? data : []))
    .catch(console.error);
  };

  useEffect(() => {
    fetchAssets();
  }, [API_BASE, user]);

  useEffect(() => {
    if (!socket) return;
    socket.on('asset_updated', fetchAssets);
    return () => socket.off('asset_updated', fetchAssets);
  }, [socket, API_BASE, user]);

  const handleAddAsset = (e) => {
    e.preventDefault();
    fetch(`${API_BASE}/api/assets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user.token}`
      },
      body: JSON.stringify({
        ...newAssetForm,
        assignedTo: newAssetForm.assignedTo || null
      })
    })
    .then(res => res.json())
    .then(() => {
      setShowAddForm(false);
      setNewAssetForm({ assetTag: '', name: '', category: '', purchaseDate: '', purchaseCost: '', status: 'Available', assignedTo: '' });
      fetchAssets();
    })
    .catch(console.error);
  };

  const handleUpdateAsset = (id, updates) => {
    fetch(`${API_BASE}/api/assets/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user.token}`
      },
      body: JSON.stringify(updates)
    })
    .then(res => res.json())
    .then(() => fetchAssets())
    .catch(console.error);
  };

  return (
    <div className="page-container p-6 animate-fade-in">
      <header className="page-header" style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>Asset Management</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>Track company laptops and equipment.</p>
        </div>
        {isAdmin && (
          <button onClick={() => setShowAddForm(!showAddForm)} style={{ background: 'var(--grad-primary)', color: 'white', padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
            {showAddForm ? 'Cancel' : 'Add Asset'}
          </button>
        )}
      </header>
      
      {isAdmin && showAddForm && (
        <form onSubmit={handleAddAsset} className="panel-card" style={{ marginBottom: '24px', padding: '24px' }}>
          <div className="panel-header">
            <h3 style={{ margin: 0 }}>Register New Asset</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Asset Tag (Unique ID)</label>
              <input type="text" required value={newAssetForm.assetTag} onChange={e => setNewAssetForm({...newAssetForm, assetTag: e.target.value})} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Name</label>
              <input type="text" required placeholder="e.g. MacBook Pro 16" value={newAssetForm.name} onChange={e => setNewAssetForm({...newAssetForm, name: e.target.value})} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Category</label>
              <select required value={newAssetForm.category} onChange={e => setNewAssetForm({...newAssetForm, category: e.target.value})} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}>
                <option value="">Select Category</option>
                <option value="Laptop">Laptop</option>
                <option value="Monitor">Monitor</option>
                <option value="Phone">Phone</option>
                <option value="Accessory">Accessory</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Purchase Date</label>
              <input type="date" value={newAssetForm.purchaseDate} onChange={e => setNewAssetForm({...newAssetForm, purchaseDate: e.target.value})} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Cost ($)</label>
              <input type="number" min="0" step="0.01" value={newAssetForm.purchaseCost} onChange={e => setNewAssetForm({...newAssetForm, purchaseCost: parseFloat(e.target.value)})} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Assign To (Optional)</label>
              <select value={newAssetForm.assignedTo} onChange={e => setNewAssetForm({...newAssetForm, assignedTo: e.target.value, status: e.target.value ? 'Assigned' : 'Available'})} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}>
                <option value="">None / Available</option>
                {employees.map(emp => (
                  <option key={emp._id} value={emp._id}>{emp.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" style={{ background: 'var(--grad-primary)', color: 'white', padding: '8px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
              Register Asset
            </button>
          </div>
        </form>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
        {assets.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', padding: '48px 0', textAlign: 'center', color: 'var(--text-muted)' }}>No assets registered.</div>
        ) : (
          assets.map(asset => (
            <div key={asset._id} className="panel-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{asset.name}</h3>
                <span style={{ fontSize: '0.75rem', background: '#f1f5f9', color: '#475569', padding: '4px 8px', borderRadius: '4px', fontWeight: 600 }}>
                  {asset.assetTag}
                </span>
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                <strong>Category:</strong> {asset.category}
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                <strong>Assigned To:</strong> {asset.assignedTo ? asset.assignedTo.name : 'Unassigned'}
              </div>
              <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="pill" style={{
                  background: asset.status === 'Available' ? '#dcfce7' : asset.status === 'Assigned' ? '#dbeafe' : asset.status === 'In Repair' ? '#fef3c7' : '#fee2e2',
                  color: asset.status === 'Available' ? '#16a34a' : asset.status === 'Assigned' ? '#2563eb' : asset.status === 'In Repair' ? '#d97706' : '#ef4444'
                }}>
                  {asset.status}
                </span>
                
                {isAdmin && (
                  <select 
                    value={asset.status} 
                    onChange={e => handleUpdateAsset(asset._id, { status: e.target.value })}
                    style={{ fontSize: '0.8rem', padding: '4px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', outline: 'none' }}
                  >
                    <option value="Available">Set Available</option>
                    <option value="Assigned">Set Assigned</option>
                    <option value="In Repair">Set In Repair</option>
                    <option value="Retired">Set Retired</option>
                  </select>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
