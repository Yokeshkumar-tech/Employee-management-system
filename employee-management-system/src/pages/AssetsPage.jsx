/* eslint-disable no-unused-vars, react-hooks/exhaustive-deps, react-hooks/set-state-in-effect */
import React, { useState, useEffect } from 'react';

export default function AssetsPage({ API_BASE, user, socket, employees = [] }) {
  const [assets, setAssets] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const isAdmin = ['admin', 'super_admin', 'hr'].includes(user?.role);
  const [activeTab, setActiveTab] = useState(isAdmin ? 'inventory' : 'my-assets');

  // Modals & Forms
  const [showAddForm, setShowAddForm] = useState(false);
  const [checkoutModalAsset, setCheckoutModalAsset] = useState(null);
  const [checkinModalAsset, setCheckinModalAsset] = useState(null);
  const [historyModalAsset, setHistoryModalAsset] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);

  // New Asset Form State
  const generateRandomTag = () => `AST-${Math.floor(1000 + Math.random() * 9000)}`;
  const [newAssetForm, setNewAssetForm] = useState(() => ({
    assetTag: `AST-${Math.floor(1000 + Math.random() * 9000)}`,
    name: '',
    category: 'Laptop',
    condition: 'Good',
    purchaseDate: '',
    purchaseCost: '',
    assignedTo: '',
    notes: ''
  }));

  // Check-out Form State
  const [checkoutForm, setCheckoutForm] = useState({
    employeeId: '',
    expectedReturnDate: '',
    condition: 'Good',
    notes: ''
  });

  // Check-in Form State
  const [checkinForm, setCheckinForm] = useState({
    condition: 'Good',
    notes: ''
  });

  // Request Form State
  const [newRequestForm, setNewRequestForm] = useState({
    category: 'Laptop',
    reason: '',
    urgency: 'Medium'
  });

  // Resolve current employee
  const currentEmployee = employees.find(emp => 
    emp._id === user?.employeeId ||
    emp._id === user?.id || 
    emp.userId === user?.id || 
    emp.userId === user?.userId ||
    (emp.name && user?.name && emp.name.toLowerCase() === user.name.toLowerCase())
  );

  const getAuthToken = () => {
    return user?.token || (typeof window !== 'undefined' ? (window.localStorage.getItem('ems-token') || '') : '') || '';
  };

  const showToast = (type, message) => {
    setFeedback({ type, message });
    setTimeout(() => {
      setFeedback({ type: '', message: '' });
    }, 4500);
  };

  const fetchAssets = () => {
    const token = getAuthToken();
    if (!token) return;
    setLoading(true);
    fetch(`${API_BASE}/api/assets`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (res.status === 401) {
          showToast('error', 'Authentication session expired. Please log out and sign in again.');
        }
        return res.json();
      })
      .then(data => {
        setAssets(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const fetchRequests = () => {
    const token = getAuthToken();
    if (!token) return;
    fetch(`${API_BASE}/api/asset-requests`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setRequests(Array.isArray(data) ? data : []))
      .catch(console.error);
  };

  useEffect(() => {
    fetchAssets();
    fetchRequests();
  }, [API_BASE, user]);

  useEffect(() => {
    if (!socket) return;
    socket.on('asset_updated', () => {
      fetchAssets();
      fetchRequests();
    });
    socket.on('asset_request_updated', () => {
      fetchRequests();
      fetchAssets();
    });
    return () => {
      socket.off('asset_updated');
      socket.off('asset_request_updated');
    };
  }, [socket, API_BASE, user]);

  // Handle Register Asset
  const handleAddAsset = async (e) => {
    e.preventDefault();
    if (!newAssetForm.assetTag.trim() || !newAssetForm.name.trim()) {
      showToast('error', 'Please fill in Asset Tag and Asset Name.');
      return;
    }

    const payload = {
      assetTag: newAssetForm.assetTag.trim(),
      name: newAssetForm.name.trim(),
      category: newAssetForm.category,
      condition: newAssetForm.condition,
      notes: newAssetForm.notes
    };

    if (newAssetForm.purchaseDate) payload.purchaseDate = newAssetForm.purchaseDate;
    if (newAssetForm.purchaseCost && !isNaN(newAssetForm.purchaseCost)) {
      payload.purchaseCost = parseFloat(newAssetForm.purchaseCost);
    }
    if (newAssetForm.assignedTo) {
      payload.assignedTo = newAssetForm.assignedTo;
      payload.status = 'Assigned';
    } else {
      payload.status = 'Available';
    }

    try {
      const res = await fetch(`${API_BASE}/api/assets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to register asset');
      }

      showToast('success', `Asset "${data.name}" (${data.assetTag}) registered successfully!`);
      setShowAddForm(false);
      setNewAssetForm({
        assetTag: generateRandomTag(),
        name: '',
        category: 'Laptop',
        condition: 'Good',
        purchaseDate: '',
        purchaseCost: '',
        assignedTo: '',
        notes: ''
      });
      fetchAssets();
    } catch (err) {
      showToast('error', err.message);
    }
  };

  // Open Checkout Modal
  const openCheckoutModal = (asset) => {
    setCheckoutModalAsset(asset);
    setCheckoutForm({
      employeeId: employees[0]?._id || '',
      expectedReturnDate: '',
      condition: asset.condition || 'Good',
      notes: ''
    });
  };

  // Submit Checkout Process
  const handleConfirmCheckout = async (e) => {
    e.preventDefault();
    if (!checkoutModalAsset) return;
    if (!checkoutForm.employeeId) {
      showToast('error', 'Please select an employee to check out this asset to.');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/assets/${checkoutModalAsset._id}/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify(checkoutForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Check-out failed');

      showToast('success', `Asset "${data.name}" successfully checked out!`);
      setCheckoutModalAsset(null);
      fetchAssets();
    } catch (err) {
      showToast('error', err.message);
    }
  };

  // Open Checkin Modal
  const openCheckinModal = (asset) => {
    setCheckinModalAsset(asset);
    setCheckinForm({
      condition: asset.condition || 'Good',
      notes: ''
    });
  };

  // Submit Checkin Process
  const handleConfirmCheckin = async (e) => {
    e.preventDefault();
    if (!checkinModalAsset) return;

    try {
      const res = await fetch(`${API_BASE}/api/assets/${checkinModalAsset._id}/checkin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify(checkinForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Check-in failed');

      showToast('success', `Asset "${data.name}" successfully returned and checked in!`);
      setCheckinModalAsset(null);
      fetchAssets();
    } catch (err) {
      showToast('error', err.message);
    }
  };

  // Delete Asset
  const handleDeleteAsset = async (id, name) => {
    if (!window.confirm(`Are you sure you want to permanently delete asset "${name}"?`)) return;
    try {
      const res = await fetch(`${API_BASE}/api/assets/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getAuthToken()}` }
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.message || 'Failed to delete asset');
      }
      showToast('success', `Asset "${name}" deleted.`);
      fetchAssets();
    } catch (err) {
      showToast('error', err.message);
    }
  };

  // Submit Equipment Request (Employee)
  const handleCreateRequest = async (e) => {
    e.preventDefault();
    if (!newRequestForm.reason.trim()) {
      showToast('error', 'Please provide a business justification/reason for the request.');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/asset-requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify({
          ...newRequestForm,
          employeeId: currentEmployee?._id,
          employeeName: currentEmployee?.name || user?.name
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to submit request');

      showToast('success', 'Asset request submitted successfully!');
      setShowRequestModal(false);
      setNewRequestForm({ category: 'Laptop', reason: '', urgency: 'Medium' });
      fetchRequests();
      setActiveTab('requests');
    } catch (err) {
      showToast('error', err.message);
    }
  };

  // Admin Request Update (Approve / Reject)
  const handleUpdateRequestStatus = async (requestId, status) => {
    try {
      const res = await fetch(`${API_BASE}/api/asset-requests/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify({ status })
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.message || 'Failed to update request');
      }
      showToast('success', `Request marked as ${status}`);
      fetchRequests();
    } catch (err) {
      showToast('error', err.message);
    }
  };

  // Metrics
  const totalAssets = assets.length;
  const availableAssets = assets.filter(a => a.status === 'Available').length;
  const assignedAssets = assets.filter(a => a.status === 'Assigned').length;
  const repairAssets = assets.filter(a => a.status === 'In Repair').length;

  // Filtered Assets
  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.assetTag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (asset.assignedTo?.name && asset.assignedTo.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = categoryFilter === 'All' || asset.category === categoryFilter;
    const matchesStatus = statusFilter === 'All' || asset.status === statusFilter;
    return matchesSearch && matchesCat && matchesStatus;
  });

  // User's Assigned Assets
  const myAssignedAssets = assets.filter(asset => {
    if (!asset.assignedTo) return false;
    const assignedId = asset.assignedTo._id || asset.assignedTo;
    const isCurrent = currentEmployee && (assignedId === currentEmployee._id || assignedId === currentEmployee.userId);
    const matchesName = user?.name && asset.assignedTo?.name && (asset.assignedTo.name.toLowerCase() === user.name.toLowerCase());
    return isCurrent || matchesName;
  });

  // Category counts
  const categories = ['All', 'Laptop', 'Monitor', 'Phone', 'Accessory', 'Other'];

  return (
    <div className="page-container p-6 animate-fade-in" style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Toast Banner */}
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
      <header className="page-header" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Asset Management</h1>
            <span style={{ fontSize: '0.8rem', background: '#eff6ff', color: '#2563eb', padding: '4px 10px', borderRadius: '12px', fontWeight: 600 }}>
              Hardware & Equipment
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginTop: '6px', fontSize: '0.95rem' }}>
            Track, check-out, and check-in company equipment, monitor maintenance, and manage hardware requests.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {!isAdmin && (
            <button
              onClick={() => setShowRequestModal(true)}
              style={{
                background: 'var(--grad-primary, linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%))',
                color: 'white',
                padding: '10px 18px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)'
              }}
            >
              <span>➕</span> Request Equipment
            </button>
          )}
          {isAdmin && (
            <button
              onClick={() => {
                setShowAddForm(!showAddForm);
                if (!showAddForm) {
                  setNewAssetForm(prev => ({ ...prev, assetTag: generateRandomTag() }));
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
                boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)'
              }}
            >
              <span>{showAddForm ? '✕ Cancel' : '➕ Register New Asset'}</span>
            </button>
          )}
        </div>
      </header>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        <div className="panel-card" style={{ padding: '20px', borderRadius: '12px', borderLeft: '4px solid #6366f1' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Assets</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>{totalAssets}</div>
          <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>Registered in company registry</div>
        </div>
        <div className="panel-card" style={{ padding: '20px', borderRadius: '12px', borderLeft: '4px solid #10b981' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Available For Check-Out</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#10b981', marginTop: '4px' }}>{availableAssets}</div>
          <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>Ready for employee assignment</div>
        </div>
        <div className="panel-card" style={{ padding: '20px', borderRadius: '12px', borderLeft: '4px solid #3b82f6' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Currently Checked Out</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#3b82f6', marginTop: '4px' }}>{assignedAssets}</div>
          <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>Active with employees</div>
        </div>
        <div className="panel-card" style={{ padding: '20px', borderRadius: '12px', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>In Repair / Maintenance</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f59e0b', marginTop: '4px' }}>{repairAssets}</div>
          <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>Temporarily unavailable</div>
        </div>
      </div>

      {/* Register Asset Form Panel (Admin) */}
      {isAdmin && showAddForm && (
        <form onSubmit={handleAddAsset} className="panel-card" style={{ marginBottom: '28px', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>Register New Asset</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>All required fields marked with *</span>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Asset Tag (Unique ID) *</label>
                <button
                  type="button"
                  onClick={() => setNewAssetForm(prev => ({ ...prev, assetTag: generateRandomTag() }))}
                  style={{ background: 'none', border: 'none', color: '#4f46e5', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600, padding: 0 }}
                >
                  ↺ Auto-Generate
                </button>
              </div>
              <input
                type="text"
                required
                placeholder="e.g. AST-1049"
                value={newAssetForm.assetTag}
                onChange={e => setNewAssetForm({ ...newAssetForm, assetTag: e.target.value })}
                style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', background: 'white' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Asset Name & Model *</label>
              <input
                type="text"
                required
                placeholder="e.g. MacBook Pro 16 M3 Max"
                value={newAssetForm.name}
                onChange={e => setNewAssetForm({ ...newAssetForm, name: e.target.value })}
                style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', background: 'white' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Category *</label>
              <select
                required
                value={newAssetForm.category}
                onChange={e => setNewAssetForm({ ...newAssetForm, category: e.target.value })}
                style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', background: 'white' }}
              >
                <option value="Laptop">Laptop</option>
                <option value="Monitor">Monitor</option>
                <option value="Phone">Phone / Tablet</option>
                <option value="Accessory">Accessory / Peripherals</option>
                <option value="Other">Other Equipment</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Initial Condition</label>
              <select
                value={newAssetForm.condition}
                onChange={e => setNewAssetForm({ ...newAssetForm, condition: e.target.value })}
                style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', background: 'white' }}
              >
                <option value="New">Brand New</option>
                <option value="Good">Good (Working)</option>
                <option value="Fair">Fair (Minor Wear)</option>
                <option value="Needs Repair">Needs Repair</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Purchase Date (Optional)</label>
              <input
                type="date"
                value={newAssetForm.purchaseDate}
                onChange={e => setNewAssetForm({ ...newAssetForm, purchaseDate: e.target.value })}
                style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', background: 'white' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Cost ($) (Optional)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g. 1999.00"
                value={newAssetForm.purchaseCost}
                onChange={e => setNewAssetForm({ ...newAssetForm, purchaseCost: e.target.value })}
                style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', background: 'white' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Direct Check-Out To (Optional)</label>
              <select
                value={newAssetForm.assignedTo}
                onChange={e => setNewAssetForm({ ...newAssetForm, assignedTo: e.target.value })}
                style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', background: 'white' }}
              >
                <option value="">Keep in inventory (Available)</option>
                {employees.map(emp => (
                  <option key={emp._id} value={emp._id}>{emp.name} ({emp.department || 'General'})</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Notes / Serial Number</label>
              <input
                type="text"
                placeholder="Serial number or hardware specs"
                value={newAssetForm.notes}
                onChange={e => setNewAssetForm({ ...newAssetForm, notes: e.target.value })}
                style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', background: 'white' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              style={{ background: '#e2e8f0', color: '#334155', padding: '9px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600 }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{ background: 'var(--grad-primary, linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%))', color: 'white', padding: '9px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600 }}
            >
              Confirm Registration
            </button>
          </div>
        </form>
      )}

      {/* Tabs Navigation */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #e2e8f0', marginBottom: '24px' }}>
        {isAdmin ? (
          <>
            <button
              onClick={() => setActiveTab('inventory')}
              style={{
                padding: '10px 18px',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === 'inventory' ? '3px solid #4f46e5' : '3px solid transparent',
                color: activeTab === 'inventory' ? '#4f46e5' : '#64748b',
                fontWeight: activeTab === 'inventory' ? 700 : 500,
                cursor: 'pointer',
                fontSize: '0.95rem'
              }}
            >
              📦 All Inventory ({assets.length})
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              style={{
                padding: '10px 18px',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === 'requests' ? '3px solid #4f46e5' : '3px solid transparent',
                color: activeTab === 'requests' ? '#4f46e5' : '#64748b',
                fontWeight: activeTab === 'requests' ? 700 : 500,
                cursor: 'pointer',
                fontSize: '0.95rem'
              }}
            >
              📋 Equipment Requests ({requests.filter(r => r.status === 'Pending').length} Pending)
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              style={{
                padding: '10px 18px',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === 'activity' ? '3px solid #4f46e5' : '3px solid transparent',
                color: activeTab === 'activity' ? '#4f46e5' : '#64748b',
                fontWeight: activeTab === 'activity' ? 700 : 500,
                cursor: 'pointer',
                fontSize: '0.95rem'
              }}
            >
              📜 Check-Out / Check-In Audit Log
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setActiveTab('my-assets')}
              style={{
                padding: '10px 18px',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === 'my-assets' ? '3px solid #4f46e5' : '3px solid transparent',
                color: activeTab === 'my-assets' ? '#4f46e5' : '#64748b',
                fontWeight: activeTab === 'my-assets' ? 700 : 500,
                cursor: 'pointer',
                fontSize: '0.95rem'
              }}
            >
              💻 My Checked Out Equipment ({myAssignedAssets.length})
            </button>
            <button
              onClick={() => setActiveTab('all-assets')}
              style={{
                padding: '10px 18px',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === 'all-assets' ? '3px solid #4f46e5' : '3px solid transparent',
                color: activeTab === 'all-assets' ? '#4f46e5' : '#64748b',
                fontWeight: activeTab === 'all-assets' ? 700 : 500,
                cursor: 'pointer',
                fontSize: '0.95rem'
              }}
            >
              📦 Available Company Assets ({availableAssets})
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              style={{
                padding: '10px 18px',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === 'requests' ? '3px solid #4f46e5' : '3px solid transparent',
                color: activeTab === 'requests' ? '#4f46e5' : '#64748b',
                fontWeight: activeTab === 'requests' ? 700 : 500,
                cursor: 'pointer',
                fontSize: '0.95rem'
              }}
            >
              📝 My Equipment Requests ({requests.length})
            </button>
          </>
        )}
      </div>

      {/* TAB 1: ALL INVENTORY (Admin or Employee Available view) */}
      {(activeTab === 'inventory' || activeTab === 'all-assets') && (
        <div>
          {/* Filters and Search Bar */}
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '24px' }}>
            <div style={{ flex: 1, minWidth: '240px' }}>
              <input
                type="text"
                placeholder="Search by Asset Tag, Name, or Employee..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: 'white',
                  outline: 'none',
                  fontSize: '0.9rem'
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Category:</span>
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white', outline: 'none' }}
              >
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Status:</span>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white', outline: 'none' }}
              >
                <option value="All">All Statuses</option>
                <option value="Available">Available</option>
                <option value="Assigned">Assigned / Checked Out</option>
                <option value="In Repair">In Repair</option>
                <option value="Retired">Retired</option>
              </select>
            </div>
          </div>

          {/* Asset Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
            {filteredAssets.length === 0 ? (
              <div className="panel-card" style={{ gridColumn: '1 / -1', padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>💻</div>
                <h3 style={{ margin: '0 0 8px 0', color: 'var(--text-primary)' }}>No matching assets found</h3>
                <p style={{ margin: 0, fontSize: '0.9rem' }}>
                  {searchQuery || categoryFilter !== 'All' || statusFilter !== 'All' 
                    ? 'Try adjusting your search query or filters.' 
                    : isAdmin ? 'Get started by clicking "Register New Asset" above.' : 'No available hardware currently listed.'}
                </p>
              </div>
            ) : (
              filteredAssets.map(asset => {
                const isAssigned = asset.status === 'Assigned';
                const isAvailable = asset.status === 'Available';
                const isInRepair = asset.status === 'In Repair';
                const assigneeName = asset.assignedTo?.name || 'None (Available)';

                return (
                  <div
                    key={asset._id}
                    className="panel-card"
                    style={{
                      padding: '20px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '14px',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                      position: 'relative'
                    }}
                  >
                    {/* Top Row: Tag & Status */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        background: '#f1f5f9',
                        color: '#475569',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        letterSpacing: '0.5px'
                      }}>
                        {asset.assetTag}
                      </span>
                      <span
                        className="pill"
                        style={{
                          background: isAvailable ? '#dcfce7' : isAssigned ? '#dbeafe' : isInRepair ? '#fef3c7' : '#fee2e2',
                          color: isAvailable ? '#15803d' : isAssigned ? '#1d4ed8' : isInRepair ? '#b45309' : '#b91c1c',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          padding: '4px 10px',
                          borderRadius: '12px'
                        }}
                      >
                        {asset.status === 'Assigned' ? 'Checked Out' : asset.status}
                      </span>
                    </div>

                    {/* Name & Category */}
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {asset.name}
                      </h3>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{asset.category}</span>
                        <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>•</span>
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Condition: <strong>{asset.condition || 'Good'}</strong></span>
                      </div>
                    </div>

                    {/* Assignee & Dates Details */}
                    <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', fontSize: '0.85rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ color: '#64748b' }}>Assigned To:</span>
                        <strong style={{ color: isAssigned ? '#1e293b' : '#10b981' }}>{assigneeName}</strong>
                      </div>
                      {isAssigned && asset.assignmentDate && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                          <span>Checked Out On:</span>
                          <span>{new Date(asset.assignmentDate).toLocaleDateString()}</span>
                        </div>
                      )}
                      {asset.notes && (
                        <div style={{ marginTop: '4px', fontSize: '0.8rem', color: '#64748b', fontStyle: 'italic' }}>
                          Note: {asset.notes}
                        </div>
                      )}
                    </div>

                    {/* Process Action Buttons */}
                    <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {/* Check-Out Button (Available -> Check Out) */}
                      {isAdmin && isAvailable && (
                        <button
                          onClick={() => openCheckoutModal(asset)}
                          style={{
                            flex: 1,
                            background: '#10b981',
                            color: 'white',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            border: 'none',
                            fontWeight: 600,
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px'
                          }}
                        >
                          <span>📤</span> Check Out
                        </button>
                      )}

                      {/* Check-In Button (Assigned -> Return) */}
                      {isAssigned && (isAdmin || asset.assignedTo?._id === currentEmployee?._id) && (
                        <button
                          onClick={() => openCheckinModal(asset)}
                          style={{
                            flex: 1,
                            background: '#3b82f6',
                            color: 'white',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            border: 'none',
                            fontWeight: 600,
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px'
                          }}
                        >
                          <span>📥</span> Check In / Return
                        </button>
                      )}

                      {/* In Repair status transition (Admin) */}
                      {isAdmin && isInRepair && (
                        <button
                          onClick={() => {
                            fetch(`${API_BASE}/api/assets/${asset._id}`, {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getAuthToken()}` },
                              body: JSON.stringify({ status: 'Available', condition: 'Good' })
                            }).then(() => {
                              showToast('success', `${asset.name} marked as Repaired & Available`);
                              fetchAssets();
                            });
                          }}
                          style={{
                            flex: 1,
                            background: '#f59e0b',
                            color: 'white',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            border: 'none',
                            fontWeight: 600,
                            fontSize: '0.85rem',
                            cursor: 'pointer'
                          }}
                        >
                          🔧 Mark Repaired
                        </button>
                      )}

                      {/* History & Admin Delete */}
                      <button
                        onClick={() => setHistoryModalAsset(asset)}
                        title="View Audit History"
                        style={{
                          background: '#f1f5f9',
                          color: '#475569',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          border: 'none',
                          fontWeight: 600,
                          fontSize: '0.85rem',
                          cursor: 'pointer'
                        }}
                      >
                        🕒 Logs
                      </button>

                      {isAdmin && (
                        <button
                          onClick={() => handleDeleteAsset(asset._id, asset.name)}
                          title="Delete Asset"
                          style={{
                            background: '#fee2e2',
                            color: '#b91c1c',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            border: 'none',
                            fontWeight: 600,
                            fontSize: '0.85rem',
                            cursor: 'pointer'
                          }}
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 2: MY CHECKED OUT ASSETS (Employee View) */}
      {activeTab === 'my-assets' && (
        <div>
          <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                Equipment Checked Out To You
              </h2>
              <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Hardware you are currently responsible for. You can initiate return / check-in whenever done.
              </p>
            </div>
            <button
              onClick={() => setShowRequestModal(true)}
              style={{
                background: 'var(--grad-primary)',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Request Additional Equipment
            </button>
          </div>

          {myAssignedAssets.length === 0 ? (
            <div className="panel-card" style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🎒</div>
              <h3 style={{ margin: '0 0 8px 0', color: 'var(--text-primary)' }}>No equipment currently assigned to you</h3>
              <p style={{ margin: '0 0 16px 0', fontSize: '0.9rem' }}>
                Need a company laptop, extra monitor, or mobile device? Submit a request to IT/Operations.
              </p>
              <button
                onClick={() => setShowRequestModal(true)}
                style={{
                  background: 'var(--grad-primary)',
                  color: 'white',
                  padding: '9px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Submit Equipment Request
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
              {myAssignedAssets.map(asset => (
                <div key={asset._id} className="panel-card" style={{ padding: '24px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, background: '#eff6ff', color: '#1d4ed8', padding: '4px 8px', borderRadius: '6px' }}>
                      {asset.assetTag}
                    </span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, background: '#dbeafe', color: '#1e40af', padding: '3px 8px', borderRadius: '10px' }}>
                      Active
                    </span>
                  </div>

                  <h3 style={{ margin: '0 0 4px 0', fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {asset.name}
                  </h3>
                  <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '16px' }}>
                    Category: {asset.category} • Condition: <strong>{asset.condition || 'Good'}</strong>
                  </div>

                  <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ color: '#64748b' }}>Checked Out Date:</span>
                      <strong>{asset.assignmentDate ? new Date(asset.assignmentDate).toLocaleDateString() : 'N/A'}</strong>
                    </div>
                    {asset.expectedReturnDate && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748b' }}>Expected Return:</span>
                        <strong>{new Date(asset.expectedReturnDate).toLocaleDateString()}</strong>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => openCheckinModal(asset)}
                    style={{
                      width: '100%',
                      background: '#3b82f6',
                      color: 'white',
                      padding: '10px',
                      borderRadius: '8px',
                      border: 'none',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    <span>📥</span> Return / Check In Asset
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: EQUIPMENT REQUESTS (Admin review or Employee view) */}
      {activeTab === 'requests' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                {isAdmin ? 'All Hardware & Equipment Requests' : 'Your Equipment Requests'}
              </h2>
              <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                {isAdmin ? 'Review employee hardware needs, approve requests, and allocate equipment.' : 'Track the approval and fulfillment status of your requested gear.'}
              </p>
            </div>
            {!isAdmin && (
              <button
                onClick={() => setShowRequestModal(true)}
                style={{ background: 'var(--grad-primary)', color: 'white', padding: '8px 16px', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: 'pointer' }}
              >
                ➕ New Request
              </button>
            )}
          </div>

          {requests.length === 0 ? (
            <div className="panel-card" style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>📋</div>
              <h3 style={{ margin: '0 0 8px 0', color: 'var(--text-primary)' }}>No requests found</h3>
              <p style={{ margin: 0, fontSize: '0.9rem' }}>No equipment requests have been logged yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {requests.map(req => {
                const isPending = req.status === 'Pending';
                const isApproved = req.status === 'Approved';
                const isRejected = req.status === 'Rejected';
                const isFulfilled = req.status === 'Fulfilled';

                return (
                  <div
                    key={req._id}
                    className="panel-card"
                    style={{
                      padding: '20px',
                      borderRadius: '10px',
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '16px'
                    }}
                  >
                    <div style={{ flex: 1, minWidth: '260px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '6px',
                          background: req.urgency === 'High' ? '#fee2e2' : req.urgency === 'Medium' ? '#fef3c7' : '#f1f5f9',
                          color: req.urgency === 'High' ? '#dc2626' : req.urgency === 'Medium' ? '#d97706' : '#475569'
                        }}>
                          {req.urgency} Priority
                        </span>
                        <strong style={{ fontSize: '1.05rem', color: 'var(--text-primary)' }}>{req.category}</strong>
                        <span style={{ fontSize: '0.85rem', color: '#64748b' }}>by {req.employeeName || req.employee?.name}</span>
                      </div>
                      <p style={{ margin: '0 0 6px 0', fontSize: '0.9rem', color: '#334155' }}>
                        {req.reason}
                      </p>
                      <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                        Requested on {new Date(req.requestedAt).toLocaleDateString()}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span
                        className="pill"
                        style={{
                          background: isPending ? '#fef3c7' : isApproved ? '#dbeafe' : isFulfilled ? '#dcfce7' : '#fee2e2',
                          color: isPending ? '#b45309' : isApproved ? '#1d4ed8' : isFulfilled ? '#15803d' : '#b91c1c',
                          fontWeight: 700,
                          padding: '6px 12px',
                          borderRadius: '12px',
                          fontSize: '0.8rem'
                        }}
                      >
                        {req.status}
                      </span>

                      {isAdmin && isPending && (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => handleUpdateRequestStatus(req._id, 'Approved')}
                            style={{ background: '#10b981', color: 'white', padding: '6px 14px', borderRadius: '6px', border: 'none', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleUpdateRequestStatus(req._id, 'Rejected')}
                            style={{ background: '#ef4444', color: 'white', padding: '6px 14px', borderRadius: '6px', border: 'none', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}
                          >
                            Reject
                          </button>
                        </div>
                      )}

                      {isAdmin && isApproved && (
                        <button
                          onClick={() => handleUpdateRequestStatus(req._id, 'Fulfilled')}
                          style={{ background: '#3b82f6', color: 'white', padding: '6px 14px', borderRadius: '6px', border: 'none', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}
                        >
                          Mark Fulfilled
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: AUDIT & ACTIVITY LOG (Admin View) */}
      {isAdmin && activeTab === 'activity' && (
        <div className="panel-card" style={{ padding: '24px', borderRadius: '12px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 16px 0', color: 'var(--text-primary)' }}>
            Complete Asset Check-Out & Check-In History
          </h2>
          {assets.every(a => !a.history || a.history.length === 0) ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              No check-out or check-in activity recorded yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {assets.flatMap(a => (a.history || []).map(h => ({ ...h, assetName: a.name, assetTag: a.assetTag })))
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .map((log, index) => (
                  <div
                    key={index}
                    style={{
                      padding: '12px 16px',
                      background: '#f8fafc',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '8px'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '4px',
                          background: log.action === 'Check-Out' ? '#dbeafe' : log.action === 'Check-In' ? '#dcfce7' : '#f1f5f9',
                          color: log.action === 'Check-Out' ? '#1d4ed8' : log.action === 'Check-In' ? '#15803d' : '#475569'
                        }}>
                          {log.action}
                        </span>
                        <strong>{log.assetName}</strong>
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>({log.assetTag})</span>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '4px' }}>
                        {log.employeeName ? `Employee: ${log.employeeName}` : ''} 
                        {log.notes ? ` • Note: ${log.notes}` : ''}
                        {log.condition ? ` • Condition: ${log.condition}` : ''}
                      </div>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                      {new Date(log.date).toLocaleString()}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: CHECK-OUT PROCESS MODAL */}
      {checkoutModalAsset && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="panel-card" style={{ width: '100%', maxWidth: '520px', padding: '24px', borderRadius: '12px', background: 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>
                📤 Check Out Asset
              </h3>
              <button
                onClick={() => setCheckoutModalAsset(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', marginBottom: '18px' }}>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{checkoutModalAsset.name}</div>
              <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                Tag: {checkoutModalAsset.assetTag} • Category: {checkoutModalAsset.category}
              </div>
            </div>

            <form onSubmit={handleConfirmCheckout} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Assign To Employee *
                </label>
                <select
                  required
                  value={checkoutForm.employeeId}
                  onChange={e => setCheckoutForm({ ...checkoutForm, employeeId: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
                >
                  <option value="">Select Employee...</option>
                  {employees.map(emp => (
                    <option key={emp._id} value={emp._id}>
                      {emp.name} — {emp.role || 'Staff'} ({emp.department || 'General'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Expected Return Date (Optional)
                </label>
                <input
                  type="date"
                  value={checkoutForm.expectedReturnDate}
                  onChange={e => setCheckoutForm({ ...checkoutForm, expectedReturnDate: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Equipment Condition at Handover
                </label>
                <select
                  value={checkoutForm.condition}
                  onChange={e => setCheckoutForm({ ...checkoutForm, condition: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
                >
                  <option value="New">Brand New</option>
                  <option value="Good">Good (Working)</option>
                  <option value="Fair">Fair (Minor Wear)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Check-Out Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Handed over with charger and laptop bag"
                  value={checkoutForm.notes}
                  onChange={e => setCheckoutForm({ ...checkoutForm, notes: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setCheckoutModalAsset(null)}
                  style={{ background: '#e2e8f0', color: '#334155', padding: '9px 18px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ background: '#10b981', color: 'white', padding: '9px 22px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                >
                  Confirm Check-Out
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CHECK-IN / RETURN PROCESS MODAL */}
      {checkinModalAsset && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="panel-card" style={{ width: '100%', maxWidth: '500px', padding: '24px', borderRadius: '12px', background: 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>
                📥 Process Equipment Return
              </h3>
              <button
                onClick={() => setCheckinModalAsset(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', marginBottom: '18px' }}>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{checkinModalAsset.name}</div>
              <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                Tag: {checkinModalAsset.assetTag} • Currently with: {checkinModalAsset.assignedTo?.name || 'Assigned'}
              </div>
            </div>

            <form onSubmit={handleConfirmCheckin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Returned Equipment Condition *
                </label>
                <select
                  value={checkinForm.condition}
                  onChange={e => setCheckinForm({ ...checkinForm, condition: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
                >
                  <option value="Good">Good (Working fine)</option>
                  <option value="Fair">Fair (Minor Scratches/Wear)</option>
                  <option value="Needs Repair">Needs Repair (Will mark as In Repair)</option>
                  <option value="Damaged">Damaged (Will mark as In Repair)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Return Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Returned with all cables and accessories in good shape"
                  value={checkinForm.notes}
                  onChange={e => setCheckinForm({ ...checkinForm, notes: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setCheckinModalAsset(null)}
                  style={{ background: '#e2e8f0', color: '#334155', padding: '9px 18px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ background: '#3b82f6', color: 'white', padding: '9px 22px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                >
                  Confirm Return & Check In
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: REQUEST EQUIPMENT MODAL (Employee) */}
      {showRequestModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="panel-card" style={{ width: '100%', maxWidth: '500px', padding: '24px', borderRadius: '12px', background: 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>
                ➕ Request Hardware Equipment
              </h3>
              <button
                onClick={() => setShowRequestModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRequest} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Equipment Category *
                </label>
                <select
                  value={newRequestForm.category}
                  onChange={e => setNewRequestForm({ ...newRequestForm, category: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
                >
                  <option value="Laptop">Laptop / Workstation</option>
                  <option value="Monitor">External Monitor</option>
                  <option value="Phone">Mobile Device / Tablet</option>
                  <option value="Accessory">Peripherals (Keyboard, Mouse, Headset)</option>
                  <option value="Other">Other Hardware</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Urgency / Priority
                </label>
                <select
                  value={newRequestForm.urgency}
                  onChange={e => setNewRequestForm({ ...newRequestForm, urgency: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
                >
                  <option value="Low">Low - Nice to have</option>
                  <option value="Medium">Medium - Standard requirement</option>
                  <option value="High">High - Blocking daily work</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Business Reason / Specifications *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Explain why you need this equipment and any specific configuration..."
                  value={newRequestForm.reason}
                  onChange={e => setNewRequestForm({ ...newRequestForm, reason: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  style={{ background: '#e2e8f0', color: '#334155', padding: '9px 18px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ background: 'var(--grad-primary)', color: 'white', padding: '9px 22px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: INDIVIDUAL ASSET AUDIT HISTORY MODAL */}
      {historyModalAsset && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="panel-card" style={{ width: '100%', maxWidth: '560px', maxHeight: '80vh', display: 'flex', flexDirection: 'column', padding: '24px', borderRadius: '12px', background: 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>
                  Audit History: {historyModalAsset.name}
                </h3>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Tag: {historyModalAsset.assetTag}</span>
              </div>
              <button
                onClick={() => setHistoryModalAsset(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            <div style={{ overflowY: 'auto', flex: 1, paddingRight: '4px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {!historyModalAsset.history || historyModalAsset.history.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                  No history recorded for this asset.
                </div>
              ) : (
                historyModalAsset.history.map((h, i) => (
                  <div key={i} style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <strong style={{ color: h.action === 'Check-Out' ? '#1d4ed8' : h.action === 'Check-In' ? '#15803d' : '#334155' }}>
                        {h.action}
                      </strong>
                      <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{new Date(h.date).toLocaleString()}</span>
                    </div>
                    {h.employeeName && <div style={{ color: '#475569' }}>Employee: {h.employeeName}</div>}
                    {h.condition && <div style={{ color: '#475569' }}>Condition: {h.condition}</div>}
                    {h.notes && <div style={{ color: '#64748b', fontStyle: 'italic', marginTop: '2px' }}>"{h.notes}"</div>}
                  </div>
                ))
              )}
            </div>

            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setHistoryModalAsset(null)}
                style={{ background: '#e2e8f0', color: '#334155', padding: '8px 18px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600 }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
