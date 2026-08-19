/* eslint-disable no-unused-vars, react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';

export default function PerformancePage({ API_BASE, user, socket, employees = [] }) {
  const [reviews, setReviews] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newReviewForm, setNewReviewForm] = useState({
    employeeId: '',
    reviewPeriod: '',
    rating: 3,
    comments: '',
    goalsAchieved: '',
    areasForImprovement: ''
  });

  const isAdmin = ['admin', 'super_admin', 'hr'].includes(user?.role);
  
  const fetchReviews = () => {
    fetch(`${API_BASE}/api/reviews`, {
      headers: { Authorization: `Bearer ${user.token}` }
    })
    .then(res => res.json())
    .then(data => setReviews(Array.isArray(data) ? data : []))
    .catch(console.error);
  };

  useEffect(() => {
    fetchReviews();
  }, [API_BASE, user]);

  useEffect(() => {
    if (!socket) return;
    socket.on('review_updated', fetchReviews);
    return () => socket.off('review_updated', fetchReviews);
  }, [socket, API_BASE, user]);

  const handleAddReview = (e) => {
    e.preventDefault();
    fetch(`${API_BASE}/api/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user.token}`
      },
      body: JSON.stringify({ 
        ...newReviewForm, 
        reviewerId: user.id || user._id,
        status: 'Submitted'
      })
    })
    .then(res => res.json())
    .then(() => {
      setShowAddForm(false);
      setNewReviewForm({ employeeId: '', reviewPeriod: '', rating: 3, comments: '', goalsAchieved: '', areasForImprovement: '' });
      fetchReviews();
    })
    .catch(console.error);
  };

  return (
    <div className="page-container p-6 animate-fade-in">
      <header className="page-header" style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>Performance Reviews</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>Track appraisals and feedback.</p>
        </div>
        {isAdmin && (
          <button onClick={() => setShowAddForm(!showAddForm)} style={{ background: 'var(--grad-primary)', color: 'white', padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
            {showAddForm ? 'Cancel' : 'Add Review'}
          </button>
        )}
      </header>
      
      {isAdmin && showAddForm && (
        <form onSubmit={handleAddReview} className="panel-card" style={{ marginBottom: '24px', padding: '24px' }}>
          <div className="panel-header">
            <h3 style={{ margin: 0 }}>Create Performance Review</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Employee</label>
              <select required value={newReviewForm.employeeId} onChange={e => setNewReviewForm({...newReviewForm, employeeId: e.target.value})} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}>
                <option value="">Select Employee</option>
                {employees.map(emp => (
                  <option key={emp._id} value={emp._id}>{emp.name}</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Review Period</label>
              <input type="text" required placeholder="e.g. Q1 2026" value={newReviewForm.reviewPeriod} onChange={e => setNewReviewForm({...newReviewForm, reviewPeriod: e.target.value})} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Rating (1-5)</label>
              <input type="number" required min="1" max="5" value={newReviewForm.rating} onChange={e => setNewReviewForm({...newReviewForm, rating: parseInt(e.target.value)})} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Goals Achieved</label>
              <textarea placeholder="List major goals achieved..." value={newReviewForm.goalsAchieved} onChange={e => setNewReviewForm({...newReviewForm, goalsAchieved: e.target.value})} rows="2" style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', resize: 'vertical' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Areas for Improvement</label>
              <textarea placeholder="List areas for improvement..." value={newReviewForm.areasForImprovement} onChange={e => setNewReviewForm({...newReviewForm, areasForImprovement: e.target.value})} rows="2" style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', resize: 'vertical' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>General Comments</label>
              <textarea placeholder="Additional notes..." value={newReviewForm.comments} onChange={e => setNewReviewForm({...newReviewForm, comments: e.target.value})} rows="3" style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', resize: 'vertical' }} />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" style={{ background: 'var(--grad-primary)', color: 'white', padding: '8px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
              Submit Review
            </button>
          </div>
        </form>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
        {reviews.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', padding: '48px 0', textAlign: 'center', color: 'var(--text-muted)' }}>No reviews found.</div>
        ) : (
          reviews.map(review => (
            <div key={review._id} className="panel-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{review.employeeId?.name || 'Unknown Employee'}</h3>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>{review.reviewPeriod}</div>
                </div>
                <div style={{ background: '#fef3c7', color: '#d97706', padding: '4px 12px', borderRadius: '20px', fontWeight: 700, fontSize: '0.9rem' }}>
                  {review.rating} / 5
                </div>
              </div>
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Goals Achieved</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{review.goalsAchieved || 'N/A'}</div>
              </div>
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Areas for Improvement</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{review.areasForImprovement || 'N/A'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Comments</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{review.comments || 'N/A'}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
