import { useEffect, useState, useCallback, useRef } from 'react'
import { BrowserRouter, Link, Navigate, NavLink, Route, Routes } from 'react-router-dom'
import { io } from 'socket.io-client'
import './App.css'

/*  Feather nav icons map  */
const NAV_ICONS = {
  '/dashboard': (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  '/employees': (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  '/attendance': (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  '/leave': (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  '/payroll': (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  '/recruitment': (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  '/projects': (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  '/chat': (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  '/settings': (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  '/tasks': (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 11 12 14 22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  ),
  '/notifications': (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
  '/approvals': (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
}

/*  Floating Particles  */
function FloatingParticles() {
  const dots = [
    { left: '10%', size: 5, dur: 18, delay: 0, color: 'rgba(99,102,241,0.5)' },
    { left: '25%', size: 3, dur: 22, delay: 4, color: 'rgba(168,85,247,0.4)' },
    { left: '40%', size: 6, dur: 16, delay: 8, color: 'rgba(56,189,248,0.4)' },
    { left: '55%', size: 4, dur: 20, delay: 2, color: 'rgba(52,211,153,0.4)' },
    { left: '70%', size: 5, dur: 24, delay: 6, color: 'rgba(251,191,36,0.35)' },
    { left: '82%', size: 3, dur: 17, delay: 10, color: 'rgba(251,113,133,0.4)' },
    { left: '92%', size: 4, dur: 21, delay: 3, color: 'rgba(99,102,241,0.4)' },
    { left: '18%', size: 3, dur: 19, delay: 14, color: 'rgba(168,85,247,0.35)' },
    { left: '63%', size: 6, dur: 26, delay: 7, color: 'rgba(56,189,248,0.3)' },
  ]
  return (
    <div className="feather-particles" aria-hidden="true">
      {dots.map((d, i) => (
        <div
          key={i}
          className="feather-dot"
          style={{
            left: d.left,
            width: d.size,
            height: d.size,
            background: d.color,
            boxShadow: `0 0 ${d.size * 2}px ${d.color}`,
            animationDuration: `${d.dur}s`,
            animationDelay: `${d.delay}s`,
          }}
        />
      ))}
    </div>
  )
}

/*  Live clock  */
function LiveClock() {
  const [time, setTime] = useState(() => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
  useEffect(() => {
    const id = setInterval(() => setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })), 1000)
    return () => clearInterval(id)
  }, [])
  return <span className="topbar-clock">{time}</span>
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const demoUsers = [
  { id: 1, name: 'Ava Chen', email: 'admin@ems.com', password: 'password123', role: 'super_admin' },
  { id: 2, name: 'Mina Patel', email: 'hr@ems.com', password: 'password123', role: 'hr' },
  { id: 3, name: 'Leo Brooks', email: 'employee@ems.com', password: 'password123', role: 'employee' }
]

const fallbackEmployees = []

const fallbackAttendance = {
  summary: '0% presence',
  items: [
    { label: 'Check-ins', value: '0' },
    { label: 'Late entries', value: '0' },
    { label: 'OT approved', value: '0h' }
  ],
  schedule: []
}

const fallbackLeaveData = {
  balance: '0 days',
  items: [
    { label: 'Casual', value: '0 left' },
    { label: 'Sick', value: '0 left' },
    { label: 'Annual', value: '0 left' }
  ],
  requests: []
}

const fallbackPayroll = {
  status: 'Draft',
  items: [
    { label: 'Net salary', value: '$0' },
    { label: 'Bonus', value: '$0' },
    { label: 'Deductions', value: '$0' }
  ],
  payslips: []
}

const fallbackRecruitment = {
  openRoles: 0,
  positions: [],
  pipeline: [
    { label: 'Applicants', value: '0' },
    { label: 'Interviews', value: '0' },
    { label: 'Offers', value: '0' }
  ]
}

const fallbackProjects = []

const fallbackNotifications = []

const navByRole = {
  super_admin: [
    { to: '/dashboard', label: 'Overview' },
    { to: '/employees', label: 'Employees' },
    { to: '/approvals', label: 'Approvals' },
    { to: '/attendance', label: 'Attendance' },
    { to: '/leave', label: 'Leave' },
    { to: '/payroll', label: 'Payroll' },
    { to: '/recruitment', label: 'Recruitment' },
    { to: '/projects', label: 'Projects' },
    { to: '/chat', label: 'Chat' },
    { to: '/settings', label: 'Settings' }
  ],
  admin: [
    { to: '/dashboard', label: 'Overview' },
    { to: '/employees', label: 'Employees' },
    { to: '/approvals', label: 'Approvals' },
    { to: '/attendance', label: 'Attendance' },
    { to: '/leave', label: 'Leave' },
    { to: '/payroll', label: 'Payroll' },
    { to: '/recruitment', label: 'Recruitment' },
    { to: '/projects', label: 'Projects' },
    { to: '/chat', label: 'Chat' },
    { to: '/settings', label: 'Settings' }
  ],
  hr: [
    { to: '/dashboard', label: 'Overview' },
    { to: '/employees', label: 'Employees' },
    { to: '/approvals', label: 'Approvals' },
    { to: '/attendance', label: 'Attendance' },
    { to: '/leave', label: 'Leave' },
    { to: '/payroll', label: 'Payroll' },
    { to: '/recruitment', label: 'Recruitment' },
    { to: '/projects', label: 'Projects' },
    { to: '/chat', label: 'Chat' }
  ],
  employee: [
    { to: '/dashboard', label: 'Home' },
    { to: '/attendance', label: 'Attendance' },
    { to: '/leave', label: 'Leave' },
    { to: '/payroll', label: 'Payroll' },
    { to: '/projects', label: 'Projects' },
    { to: '/tasks', label: 'Tasks' },
    { to: '/notifications', label: 'Notifications' },
    { to: '/settings', label: 'My Profile' }
  ]
}

function getStoredUser() {
  if (typeof window === 'undefined') return null
  try {
    const u = JSON.parse(window.localStorage.getItem('ems-user'))
    // Validate the stored user has all required fields
    if (!u || !u.role || !u.name || !u.id) {
      window.localStorage.removeItem('ems-user')
      window.localStorage.removeItem('ems-token')
      return null
    }
    return u
  } catch {
    window.localStorage.removeItem('ems-user')
    window.localStorage.removeItem('ems-token')
    return null
  }
}

function getStoredToken() {
  if (typeof window === 'undefined') return ''
  return window.localStorage.getItem('ems-token') || ''
}

function authHeaders() {
  const token = getStoredToken()
  return token
    ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    : { 'Content-Type': 'application/json' }
}

function authDownloadHeaders() {
  const token = getStoredToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

function downloadBlob(blob, filename) {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}

function escapeCsvValue(value) {
  const text = value === null || value === undefined ? '' : String(value)
  return `"${text.replace(/"/g, '""')}"`
}

function downloadEmployeesCsv(employees, filename = 'employees.csv') {
  const headers = ['Name', 'Role', 'Department', 'Status']
  const rows = employees.map((employee) => [
    employee.name,
    employee.role,
    employee.department,
    employee.status
  ])
  const csv = [headers, ...rows]
    .map((row) => row.map(escapeCsvValue).join(','))
    .join('\n')
  downloadBlob(new Blob([csv], { type: 'text/csv;charset=utf-8;' }), filename)
}

function ProtectedRoute({ user, children }) {
  return user ? children : <Navigate to="/" replace />
}

function AppLayout({ user, onLogout, children }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="app-shell">
      <FloatingParticles />

      <header className="topbar">
        <div className="topbar-brand">
          <button 
            type="button" 
            className="mobile-menu-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMobileMenuOpen ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            )}
          </button>
          <div>
            <p className="eyebrow">Enterprise HRMS</p>
            <h1>Employee Management System</h1>
          </div>
        </div>
        <div className="topbar-actions">
          <LiveClock />
          {user.isGoogle && (
            <span className="google-signed-in-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.0 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Google Account
            </span>
          )}
          <span className="pill">{user.role.replace('_', ' ').toUpperCase()}</span>
          <button type="button" className="ghost-button" onClick={onLogout}>
            Logout
          </button>
        </div>
      </header>

      {/* Sidebar overlay — tapping closes the drawer on mobile */}
      {isMobileMenuOpen && (
        <div
          className="sidebar-overlay visible"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      <nav className={`sidebar-nav ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-label">Menu</div>
        {navByRole[user.role]?.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => setIsMobileMenuOpen(false)}
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          >
            <span className="nav-icon">{NAV_ICONS[item.to]}</span>
            {item.label}
          </NavLink>
        ))}
        <div className="sidebar-sep" style={{ marginTop: 'auto' }} />
        <div style={{ padding: '8px 12px 4px', fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>
          <span className="glow-dot" style={{ marginRight: 6 }} />
          System live
        </div>
      </nav>

      <main className="content-area">{children}</main>
    </div>
  )
}


function LandingPage() {
  return (
    <section className="landing-hero">
      <div className="hero-illustration">
        <svg viewBox="0 0 500 500" className="illustration-svg">
          {/* Background elements */}
          <circle cx="100" cy="80" r="40" fill="#a8e6cf" opacity="0.3" />
          <circle cx="420" cy="100" r="50" fill="#ffd89b" opacity="0.3" />

          {/* Chart/Graph */}
          <rect x="40" y="80" width="140" height="100" rx="15" fill="#7fd3c1" opacity="0.8" />
          <polyline points="60,150 90,100 130,120 160,80" stroke="white" strokeWidth="3" fill="none" />
          <circle cx="60" cy="150" r="4" fill="white" />
          <circle cx="90" cy="100" r="4" fill="white" />
          <circle cx="130" cy="120" r="4" fill="white" />
          <circle cx="160" cy="80" r="4" fill="white" />

          {/* Hanging lights */}
          <line x1="100" y1="0" x2="100" y2="50" stroke="#7fd3c1" strokeWidth="4" />
          <circle cx="100" cy="65" r="20" fill="#7fd3c1" />
          <line x1="340" y1="0" x2="340" y2="50" stroke="#7fd3c1" strokeWidth="4" />
          <circle cx="340" cy="65" r="20" fill="#7fd3c1" />

          {/* Clock */}
          <circle cx="400" cy="140" r="35" fill="none" stroke="#ffc107" strokeWidth="3" />
          <line x1="400" y1="140" x2="400" y2="115" stroke="#ffc107" strokeWidth="2" />
          <line x1="400" y1="140" x2="415" y2="140" stroke="#ffc107" strokeWidth="2" />
          <circle cx="400" cy="140" r="4" fill="#ffc107" />

          {/* Person 1 - Left (celebrating) */}
          <circle cx="120" cy="220" r="18" fill="#1e40af" />
          <path d="M 120 240 L 110 290 M 120 240 L 130 290" stroke="#1e40af" strokeWidth="8" strokeLinecap="round" />
          <rect x="100" y="240" width="40" height="40" fill="#f0f0f0" rx="4" />
          <circle cx="100" cy="258" r="6" fill="#1e40af" />
          <line x1="105" y1="253" x2="95" y2="240" stroke="#1e40af" strokeWidth="6" strokeLinecap="round" />

          {/* Person 2 - Middle (jumping) */}
          <circle cx="250" cy="200" r="20" fill="#f59e0b" />
          <rect x="230" y="225" width="40" height="50" fill="#fbbf24" rx="4" />
          <path d="M 230 275 L 225 320 M 270 275 L 275 320" stroke="#1e3a8a" strokeWidth="8" strokeLinecap="round" />
          <path d="M 210 240 L 180 220 M 290 240 L 320 220" stroke="#f59e0b" strokeWidth="8" strokeLinecap="round" />

          {/* Person 3 - Right (celebrating) */}
          <circle cx="360" cy="230" r="18" fill="#f59e0b" />
          <rect x="340" y="255" width="40" height="45" fill="#1e40af" rx="4" />
          <path d="M 340 300 L 335 345 M 380 300 L 385 345" stroke="#1e40af" strokeWidth="8" strokeLinecap="round" />
          <path d="M 320 270 L 290 250" stroke="#f59e0b" strokeWidth="8" strokeLinecap="round" />
          <path d="M 380 270 L 410 250" stroke="#f59e0b" strokeWidth="8" strokeLinecap="round" />

          {/* Yellow platform */}
          <ellipse cx="250" cy="380" rx="180" ry="40" fill="#fbbf24" />
          <path d="M 70 380 Q 100 360 250 360 Q 400 360 430 380" fill="#fcd34d" />

          {/* Background decorative elements */}
          <line x1="50" y1="350" x2="120" y2="320" stroke="#7fd3c1" strokeWidth="2" opacity="0.5" />
          <line x1="380" y1="360" x2="450" y2="330" stroke="#7fd3c1" strokeWidth="2" opacity="0.5" />
        </svg>
      </div>

      <div className="hero-content">
        <h1 className="hero-main-title">Employee <span>Management</span> System</h1>
        <div className="hero-tagline">Do You Need It?</div>

        <div className="feature-list">
          <div className="feature-item"> Live notifications</div>
          <div className="feature-item"> Workforce analytics</div>
          <div className="feature-item"> Secure role-based access</div>
          <div className="feature-item"> Leave & Attendance Tracking</div>
          <div className="feature-item"> Integrated Payroll System</div>
          <div className="feature-item"> Project Management</div>
          <div className="feature-item"> Recruitment Pipeline</div>
        </div>

        <p className="hero-description">
          Run payroll, hiring, attendance, projects, collaboration, and analytics in one command center.
        </p>

        <Link className="cta-button" to="/login">Login / Register</Link>
      </div>
    </section>
  )
}

function getAvatarColor(name) {
  const colors = ['#1a73e8', '#0f9d58', '#f4b400', '#db4437', '#ab47bc', '#00acc1']
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

function GoogleModal({ isOpen, onClose, onSelectAccount, demoUsers }) {
  const [view, setView] = useState('choose') // 'choose', 'custom', 'loading'
  const [customEmail, setCustomEmail] = useState('')
  const [customName, setCustomName] = useState('')
  const [customRole, setCustomRole] = useState('employee')
  const [selectedUser, setSelectedUser] = useState(null)

  if (!isOpen) return null

  const handleSelect = (user) => {
    setSelectedUser(user)
    setView('loading')
    setTimeout(() => {
      onSelectAccount(user)
    }, 200)
  }

  const handleCustomSubmit = (e) => {
    e.preventDefault()
    if (!customEmail) return
    const name = customName || customEmail.split('@')[0]
    const newUser = {
      id: Date.now(),
      name: name.split('.').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      email: customEmail,
      role: customRole
    }
    setView('loading')
    setTimeout(() => {
      onSelectAccount(newUser)
    }, 200)
  }

  return (
    <div className="google-modal-overlay">
      <div className="google-modal-container">
        {view === 'loading' ? (
          <div className="google-loading-view">
            <div className="google-spinner"></div>
            <p className="google-loading-title">Signing in with Google</p>
            <p className="google-loading-subtitle">
              {selectedUser
                ? (selectedUser.role === 'super_admin' ? '••••••••@ems.com' : selectedUser.email)
                : (customEmail === 'admin@ems.com' ? '••••••••@ems.com' : customEmail)}
            </p>
          </div>
        ) : view === 'custom' ? (
          <div className="google-custom-view">
            <div className="google-logo-header">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.0 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              <h2>Sign in with Google</h2>
              <p>Use your Google Account</p>
            </div>

            <form onSubmit={handleCustomSubmit} className="google-custom-form">
              <div className="google-input-group">
                <input
                  type="email"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  placeholder="Email or phone"
                  required
                  autoFocus
                />
              </div>

              <div className="google-input-group">
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="Full name (optional)"
                />
              </div>

              <div className="google-input-group">
                <select
                  value={customRole}
                  onChange={(e) => setCustomRole(e.target.value)}
                  className="google-select-role"
                >
                  <option value="employee">Employee</option>
                  <option value="hr">HR Partner</option>
                  <option value="super_admin">Admin</option>
                </select>
                <label className="google-select-label">Select Workspace Role</label>
              </div>

              <div className="google-actions-row">
                <button type="button" className="google-text-button" onClick={() => setView('choose')}>
                  Back
                </button>
                <button type="submit" className="google-primary-btn">
                  Next
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="google-account-chooser">
            <div className="google-logo-header">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.0 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              <h2>Choose an account</h2>
              <p>to continue to Enterprise HRMS</p>
            </div>

            <div className="google-accounts-list">
              {demoUsers.map((item) => (
                <button
                  key={item.email}
                  type="button"
                  className="google-account-item"
                  onClick={() => handleSelect(item)}
                >
                  <div className="google-avatar" style={{ backgroundColor: getAvatarColor(item.name) }}>
                    {item.name.charAt(0)}
                  </div>
                  <div className="google-account-details">
                    <span className="google-account-name">{item.name}</span>
                  </div>
                  <span className="google-role-badge">{item.role.replace('_', ' ')}</span>
                </button>
              ))}

              <button
                type="button"
                className="google-account-item google-use-other"
                onClick={() => setView('custom')}
              >
                <div className="google-avatar google-other-avatar">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </div>
                <div className="google-account-details">
                  <span className="google-account-name font-medium">Use another account</span>
                </div>
              </button>
            </div>

            <div className="google-footer-actions">
              <button type="button" className="google-text-button" onClick={onClose}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function LoginPage({ form, setForm, authMode, setAuthMode, onSubmit, onGoogleLogin, error, googleEmail, pendingMessage }) {
  return (
    <div className="login-container">
      <div className="auth-card-new">
        <div className="auth-tabs">
          <button
            type="button"
            className={`tab-button ${authMode === 'login' ? 'active' : ''}`}
            onClick={() => setAuthMode('login')}
          >
            Login
          </button>
          <button
            type="button"
            className={`tab-button ${authMode === 'register' ? 'active' : ''}`}
            onClick={() => {
              setAuthMode('register')
              if (form.role === 'super_admin') setForm({ ...form, role: 'employee' })
            }}
          >
            Register
          </button>
        </div>




        <form onSubmit={onSubmit} className="auth-form-new">
          {authMode === 'register' && (
            <div className="form-group">
              <input
                type="text"
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                placeholder="Full name"
                required
              />
            </div>
          )}

          <div className="form-group">
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              placeholder="Work email"
              required
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              placeholder="Password"
              required
            />
          </div>

          <div className="form-group">
            <select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })} required>
              <option value="">Select Role</option>
              {authMode === 'login' && <option value="super_admin">Admin</option>}
              <option value="hr">HR</option>
              <option value="employee">Employee</option>
            </select>
          </div>

          {error && <p className="error-text">{error}</p>}
          {pendingMessage && <p className="error-text" style={{ background: '#fef3c7', color: '#92400e', borderColor: '#fde68a' }}>{pendingMessage}</p>}

          <button type="submit" className="submit-button">
            {authMode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  )
}

function SectionHeading({ title, subtitle, action }) {
  return (
    <section className="page-heading">
      <div>
        <p className="eyebrow">Enterprise workspace</p>
        <h2>{title}</h2>
        {subtitle ? <p className="panel-copy">{subtitle}</p> : null}
      </div>
      {action ? <div className="pill">{action}</div> : null}
    </section>
  )
}

function DashboardPage({ user, dashboardData, liveActivity, socketConnected, employees, attendance, API_BASE, notifications, activeUsers }) {
  const isAdmin = user.role === 'super_admin' || user.role === 'admin'

  /*  Shared state  */
  const [hoveredBarIndex, setHoveredBarIndex] = useState(null)
  const [hoveredPoint, setHoveredPoint] = useState(null)

  /*  Admin-only state  */
  const [adminTab, setAdminTab] = useState('overview') // 'overview' | 'system' | 'audit'
  const [auditFilter, setAuditFilter] = useState('all')
  const [hoveredGauge, setHoveredGauge] = useState(null)

  // Real-time fluctuating metrics
  const [liveResources, setLiveResources] = useState([
    { label: 'CPU Usage', value: 38, color: '#6366f1' },
    { label: 'Memory', value: 61, color: '#8b5cf6' },
    { label: 'DB Connections', value: 24, color: '#10b981' },
    { label: 'Bandwidth', value: 45, color: '#f59e0b' },
  ]);

  useEffect(() => {
    if (adminTab !== 'system') return;
    const interval = setInterval(() => {
      setLiveResources(prev => prev.map(res => {
        const diff = Math.floor(Math.random() * 5) - 2; // -2 to +2
        const newVal = Math.max(10, Math.min(95, res.value + diff));
        return { ...res, value: newVal };
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, [adminTab]);

  // Simulation state
  const [simulating, setSimulating] = useState(''); // '', 'db', 'cache'
  const [simSuccess, setSimSuccess] = useState('');

  const handleSimulateAction = (type) => {
    setSimulating(type);
    setSimSuccess('');
    setTimeout(() => {
      setSimulating('');
      if (type === 'db') {
        setSimSuccess('✓ Database index optimization simulation complete (MongoDB query times reduced by 15%)');
      } else {
        setSimSuccess('✓ Redis session token temporary cache successfully pruned and compacted (0.4MB reclaimed)');
      }
      setTimeout(() => setSimSuccess(''), 5000);
    }, 2000);
  };

  // Broadcast state
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [broadcastLoading, setBroadcastLoading] = useState(false);
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);

  const handleBroadcastSubmit = async (e) => {
    e.preventDefault();
    if (!broadcastMsg.trim() || !API_BASE) return;
    setBroadcastLoading(true);
    setBroadcastSuccess(false);
    try {
      const response = await fetch(`${API_BASE}/api/admin/broadcast`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ message: broadcastMsg })
      });
      if (response.ok) {
        setBroadcastMsg('');
        setBroadcastSuccess(true);
        setTimeout(() => setBroadcastSuccess(false), 4000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setBroadcastLoading(false);
    }
  };

  // HR Scratchpad states
  const [hrMemo, setHrMemo] = useState(() => {
    return window.localStorage.getItem('ems-hr-memo') || '';
  });

  const [hrTasks, setHrTasks] = useState(() => {
    const saved = window.localStorage.getItem('ems-hr-tasks');
    return saved ? JSON.parse(saved) : [
      { id: 1, text: 'Review Leo Brooks regularization request', done: false },
      { id: 2, text: 'Confirm July payroll calculations', done: false },
      { id: 3, text: 'Post the new Lead Developer job role in Recruitment', done: false },
      { id: 4, text: 'Sync with Engineering leads on current projects', done: false },
    ];
  });

  const handleMemoChange = (e) => {
    setHrMemo(e.target.value);
    window.localStorage.setItem('ems-hr-memo', e.target.value);
  };

  const handleTaskToggle = (id) => {
    const updated = hrTasks.map(t => t.id === id ? { ...t, done: !t.done } : t);
    setHrTasks(updated);
    window.localStorage.setItem('ems-hr-tasks', JSON.stringify(updated));
  };

  /*  Stats cards  */
  const cards = isAdmin
    ? [
      { label: 'Total Employees', value: dashboardData.totalEmployees, detail: 'across all departments', icon: 'EMP', grad: 'linear-gradient(135deg,#6366f1,#8b5cf6)' },
      { label: 'Attendance Rate', value: dashboardData.attendance, detail: 'system-wide today', icon: 'ATT', grad: 'linear-gradient(135deg,#0ea5e9,#6366f1)' },
      { label: 'Pending Leave', value: dashboardData.pendingLeaves, detail: 'awaiting approval', icon: 'LV', grad: 'linear-gradient(135deg,#f59e0b,#ef4444)' },
      { label: 'Payroll Batches', value: dashboardData.payrollStatus, detail: 'ready for processing', icon: 'PAY', grad: 'linear-gradient(135deg,#10b981,#059669)' },
    ]
    : [
      { label: 'Employees', value: dashboardData.totalEmployees, detail: 'across 12 departments', icon: 'EMP', grad: 'linear-gradient(135deg,#6366f1,#8b5cf6)' },
      { label: 'Attendance', value: dashboardData.attendance, detail: 'today live rate', icon: 'ATT', grad: 'linear-gradient(135deg,#38bdf8,#6366f1)' },
      { label: 'Pending Leave', value: dashboardData.pendingLeaves, detail: 'awaiting approval', icon: 'LV', grad: 'linear-gradient(135deg,#fbbf24,#f59e0b)' },
      { label: 'Payroll', value: dashboardData.payrollStatus, detail: 'ready for release', icon: 'PAY', grad: 'linear-gradient(135deg,#34d399,#059669)' },
    ]

  /*  Admin: System Health Gauges  */
  const systemHealth = [
    { label: 'API Uptime', value: 99.7, color: '#10b981', icon: 'OK', detail: '99.7% over last 30 days' },
    { label: 'DB Health', value: 94, color: '#6366f1', icon: 'DB', detail: 'MongoDB response: 12ms avg' },
    { label: 'Socket Load', value: 62, color: '#f59e0b', icon: 'IO', detail: '62% capacity used' },
    { label: 'Error Rate', value: 2, color: '#ef4444', icon: 'ERR', detail: '2 errors in last 24h', invert: true },
  ]

  /*  Admin: Audit Log  */
  const auditLog = [
    { time: '14:32', action: 'Employee approved', actor: 'Ava Chen', target: 'Leo Brooks', type: 'approval', icon: '*' },
    { time: '14:15', action: 'Leave rejected', actor: 'Mina Patel', target: 'Tom Lewis', type: 'leave', icon: '*' },
    { time: '13:48', action: 'Payroll batch released', actor: 'Ava Chen', target: 'Finance Dept', type: 'payroll', icon: '*' },
    { time: '13:21', action: 'Employee moved dept', actor: 'Ava Chen', target: 'Daniel Kim  Engineering', type: 'move', icon: '*' },
    { time: '12:55', action: 'New user registered', actor: 'System', target: 'register@demo.com', type: 'auth', icon: '-' },
    { time: '12:30', action: 'Role changed', actor: 'Ava Chen', target: 'Nadia Flores  HR', type: 'auth', icon: '*' },
    { time: '11:47', action: 'Project created', actor: 'Mina Patel', target: 'EMS Revamp v2', type: 'project', icon: '*' },
    { time: '11:10', action: 'Payroll approved', actor: 'Ava Chen', target: 'July batch', type: 'payroll', icon: '*' },
  ]
  const filteredAudit = auditFilter === 'all' ? auditLog : auditLog.filter(e => e.type === auditFilter)

  /*  Admin: Quick Actions  */
  const adminActions = [
    { label: 'Add Employee', icon: '-', color: '#6366f1', bg: '#eef2ff', href: '/employees' },
    { label: 'Review Approvals', icon: '*', color: '#10b981', bg: '#ecfdf5', href: '/approvals' },
    { label: 'Release Payroll', icon: '*', color: '#f59e0b', bg: '#fef3c7', href: '/payroll' },
    { label: 'Manage Recruitment', icon: '*', color: '#8b5cf6', bg: '#f5f3ff', href: '/recruitment' },
    { label: 'View Reports', icon: '*', color: '#0ea5e9', bg: '#e0f2fe', href: '/dashboard' },
    { label: 'System Settings', icon: '*', color: '#64748b', bg: '#f8fafc', href: '/settings' },
  ]

  /*  Admin: Role Access Matrix  */
  const roleMatrix = [
    { feature: 'View Employees', admin: true, hr: true, employee: false },
    { feature: 'Approve Employees', admin: true, hr: true, employee: false },
    { feature: 'Release Payroll', admin: true, hr: false, employee: false },
    { feature: 'Approve Leave', admin: true, hr: true, employee: false },
    { feature: 'Manage Projects', admin: true, hr: false, employee: true },
    { feature: 'System Settings', admin: true, hr: false, employee: false },
    { feature: 'View Reports', admin: true, hr: true, employee: false },
  ]

  /*  HR/Shared: Performance Pulse (Dynamic fallback) */
  const pulseData = dashboardData?.pulseData && dashboardData.pulseData.length > 0
    ? dashboardData.pulseData
    : [
      { day: 'Mon', value: 78, desc: 'Normal workload, strong check-in consistency.' },
      { day: 'Tue', value: 84, desc: 'High collaboration peak during team sprint reviews.' },
      { day: 'Wed', value: 69, desc: 'Mid-week focus day with slightly lower check-ins.' },
      { day: 'Thu', value: 92, desc: 'Maximum activity and cross-department pull requests.' },
      { day: 'Fri', value: 76, desc: 'Consistent performance, steady weekend wind-down.' },
      { day: 'Sat', value: 34, desc: 'Weekend shift, voluntary coverage.' },
      { day: 'Sun', value: 42, desc: 'Support and maintenance shift updates.' },
    ]

  /*  HR/Shared: SLA SVG Trend (Dynamic fallback) */
  const trendData = dashboardData?.trendData && dashboardData.trendData.length > 0
    ? dashboardData.trendData
    : [
      { label: 'Jan', val: 65, projects: 12, SLA: '92%' },
      { label: 'Feb', val: 78, projects: 19, SLA: '95%' },
      { label: 'Mar', val: 72, projects: 15, SLA: '94%' },
      { label: 'Apr', val: 89, projects: 26, SLA: '97%' },
      { label: 'May', val: 85, projects: 22, SLA: '96%' },
      { label: 'Jun', val: 95, projects: 31, SLA: '98%' },
      { label: 'Jul', val: 90, projects: 28, SLA: '97%' },
    ]
  const svgW = 450, svgH = 110, padX = 40, padY = 20
  const points = trendData.map((d, i) => ({
    x: padX + (i * (svgW - 2 * padX)) / (trendData.length - 1),
    y: svgH - padY - (d.val / 100) * (svgH - 2 * padY),
    ...d
  }))
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${svgH - padY} L ${points[0].x} ${svgH - padY} Z`

  const departments = [
    { name: 'Engineering', count: 4, pct: 85, color: 'linear-gradient(90deg,#6366f1,#8b5cf6)' },
    { name: 'Human Resources', count: 1, pct: 100, color: 'linear-gradient(90deg,#10b981,#059669)' },
    { name: 'Product Management', count: 1, pct: 90, color: 'linear-gradient(90deg,#f59e0b,#d97706)' },
    { name: 'Design / UX', count: 1, pct: 75, color: 'linear-gradient(90deg,#ec4899,#db2777)' },
  ]

  /*  SVG Gauge helper  */
  const Gauge = ({ value, color, size = 70, invert = false }) => {
    const r = (size - 8) / 2
    const circ = 2 * Math.PI * r
    const display = invert ? 100 - value : value
    const dash = (display / 100) * circ
    return (
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e2e8f0" strokeWidth={7} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={7}
          strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.8s ease' }} />
      </svg>
    )
  }

  if (isAdmin) {
    return (
      <>
        {/* -- ADMIN HERO BANNER -- */}
        <div className="admin-hero" style={{
          background: 'linear-gradient(135deg,#0f172a 0%,#1e1b4b 50%,#312e81 100%)',
          borderRadius: '22px', padding: '28px 32px', position: 'relative',
          overflow: 'hidden', color: '#fff', marginBottom: '24px',
          display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: '24px',
        }}>
          {/* Decorative blobs */}
          <div style={{ position: 'absolute', top: -60, right: -60, width: 220, height: 220, background: 'rgba(99,102,241,0.15)', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', bottom: -50, right: 160, width: 140, height: 140, background: 'rgba(139,92,246,0.1)', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', top: '50%', left: '35%', transform: 'translateY(-50%)', width: 1, height: '60%', background: 'rgba(255,255,255,0.06)' }} />

          <div style={{ zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#a5b4fc', background: 'rgba(99,102,241,0.2)', padding: '3px 10px', borderRadius: '20px', border: '1px solid rgba(99,102,241,0.3)' }}>
                Super Admin Console
              </span>
              {socketConnected && (
                <span style={{ fontSize: '0.7rem', color: '#4ade80', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: 6, height: 6, background: '#4ade80', borderRadius: '50%', display: 'inline-block', animation: 'pulse 1.5s infinite' }} />
                  Live
                </span>
              )}
            </div>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 6px', letterSpacing: '-0.02em' }}>
              Welcome, {user.name}
            </h2>
            <p style={{ opacity: 0.72, fontSize: '0.92rem', margin: 0 }}>
              Full system control  Manage users, payroll, access controls, and enterprise operations.
            </p>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', zIndex: 1 }}>
            {['overview', 'system', 'audit'].map(tab => (
              <button
                key={tab}
                onClick={() => setAdminTab(tab)}
                style={{
                  padding: '8px 20px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                  fontWeight: 700, fontSize: '0.8rem', letterSpacing: '0.04em', textTransform: 'capitalize',
                  background: adminTab === tab ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)',
                  color: adminTab === tab ? '#fff' : 'rgba(255,255,255,0.55)',
                  backdropFilter: 'blur(8px)',
                  border: adminTab === tab ? '1px solid rgba(255,255,255,0.2)' : '1px solid transparent',
                  transition: 'all 0.2s',
                }}
              >
                {tab === 'overview' ? 'Overview' : tab === 'system' ? 'System' : 'Audit Log'}
              </button>
            ))}
          </div>
        </div>

        {/* -- STATS ROW -- */}
        <section className="stats-grid dashboard-stats" style={{ marginBottom: '24px' }}>
          {cards.map((card) => (
            <article key={card.label} className="stat-card">
              <div className="stat-icon" style={{ background: card.grad }}>{card.icon}</div>
              <p>{card.label}</p>
              <h3>{card.value}</h3>
              <span>{card.detail}</span>
            </article>
          ))}
        </section>

        {/* -- TAB: OVERVIEW -- */}
        {adminTab === 'overview' && (
          <>
            {/* Quick Actions */}
            <article className="panel-card admin-quick-actions" style={{ marginBottom: '24px' }}>
              <div className="panel-header">
                <h3>Admin Quick Actions</h3>
                <span className="pill" style={{ background: '#f1f5f9', color: '#6366f1' }}>Admin only</span>
              </div>
              <div className="admin-actions-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: '12px', marginTop: '4px' }}>
                {adminActions.map((action) => (
                  <a key={action.label} href={action.href} style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                    padding: '18px 10px', borderRadius: '14px', background: action.bg,
                    textDecoration: 'none', transition: 'transform 0.2s, box-shadow 0.2s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 10px 24px rgba(0,0,0,0.10)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
                    <span style={{ fontSize: '1.6rem' }}>{action.icon}</span>
                    <span style={{ fontSize: '0.73rem', fontWeight: 700, color: action.color, textAlign: 'center', lineHeight: 1.3 }}>{action.label}</span>
                  </a>
                ))}
              </div>
            </article>

            {/* System Health + Department Capacity */}
            <section className="content-grid" style={{ marginBottom: '24px' }}>
              {/* System Health Gauges */}
              <article className="panel-card">
                <div className="panel-header">
                  <h3>System Health</h3>
                  <span className="pill" style={{ background: '#ecfdf5', color: '#10b981' }}>All systems operational</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px', marginTop: '14px' }}>
                  {systemHealth.map((gauge, idx) => (
                    <div key={idx}
                      onMouseEnter={() => setHoveredGauge(idx)}
                      onMouseLeave={() => setHoveredGauge(null)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 14px',
                        borderRadius: '12px', background: hoveredGauge === idx ? '#f8fafc' : 'transparent',
                        border: hoveredGauge === idx ? '1px solid #e2e8f0' : '1px solid transparent',
                        cursor: 'default', transition: 'all 0.2s',
                      }}>
                      <div style={{ position: 'relative', flexShrink: 0 }}>
                        <Gauge value={gauge.value} color={gauge.color} invert={gauge.invert} />
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: gauge.color }}>
                            {gauge.value}%
                          </span>
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e293b' }}>{gauge.icon} {gauge.label}</div>
                        <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '3px' }}>{gauge.detail}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </article>

              {/* Department Capacity */}
              <article className="panel-card">
                <div className="panel-header">
                  <h3>Department Capacity</h3>
                  <span className="pill" style={{ background: '#ecfdf5', color: '#10b981' }}>{dashboardData.totalEmployees || 7} total</span>
                </div>
                <div className="dept-list">
                  {departments.map((dept, index) => (
                    <div key={index} className="dept-item">
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span className="dept-name">{dept.name}</span>
                          <span style={{ fontSize: '0.73rem', color: '#94a3b8', fontWeight: 600 }}>{dept.count} {dept.count === 1 ? 'member' : 'members'}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div className="dept-bar-container">
                            <div className="dept-bar-value" style={{ width: `${dept.pct}%`, background: dept.color }} />
                          </div>
                          <span className="dept-percent-text">{dept.pct}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            </section>

            {/* Role Access Matrix + Live Activity */}
            <section className="content-grid" style={{ marginBottom: '24px' }}>
              {/* Role Access Matrix */}
              <article className="panel-card">
                <div className="panel-header">
                  <h3>Role Access Matrix</h3>
                  <span className="pill" style={{ background: '#fef3c7', color: '#d97706' }}>Admin view</span>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '8px', fontSize: '0.82rem' }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left', padding: '8px 10px', color: '#94a3b8', fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.07em', textTransform: 'uppercase', borderBottom: '2px solid #f1f5f9' }}>Feature</th>
                      {['Admin', 'HR', 'Employee'].map(r => (
                        <th key={r} style={{ textAlign: 'center', padding: '8px 12px', color: '#94a3b8', fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.07em', textTransform: 'uppercase', borderBottom: '2px solid #f1f5f9' }}>{r}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {roleMatrix.map((row, i) => (
                      <tr key={i} style={{ background: i % 2 === 0 ? '#fafafe' : 'transparent' }}>
                        <td style={{ padding: '9px 10px', color: '#475569', fontWeight: 600 }}>{row.feature}</td>
                        {[row.admin, row.hr, row.employee].map((has, j) => (
                          <td key={j} style={{ textAlign: 'center', padding: '9px 12px' }}>
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                              width: 22, height: 22, borderRadius: '50%',
                              background: has ? '#dcfce7' : '#fee2e2',
                              color: has ? '#16a34a' : '#dc2626',
                              fontSize: '0.7rem', fontWeight: 900,
                            }}>
                              {has ? '✓' : '-'}
                            </span>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </article>

              {/* Live Activity */}
              <article className="panel-card">
                <div className="panel-header">
                  <h3>Live Activity</h3>
                  <span className="pill">Recent updates</span>
                </div>
                <ul className="list">
                  {liveActivity.map((item, index) => (
                    <li key={`${item}-${index}`} style={{ padding: '10px 12px', borderBottom: '1px solid #f1f5f9', display: 'flex', gap: '8px', fontSize: '0.85rem' }}>
                      <span style={{ color: '#6366f1', fontWeight: 'bold' }}>•</span>
                      <span style={{ color: '#475569' }}>{item}</span>
                    </li>
                  ))}
                </ul>
              </article>
            </section>
          </>
        )}

        {/* -- TAB: SYSTEM -- */}
        {adminTab === 'system' && (
          <>
            <section className="content-grid" style={{ marginBottom: '24px' }}>
              {/* Detailed System Health */}
              <article className="panel-card">
                <div className="panel-header">
                  <h3>Infrastructure Status</h3>
                  <span className="pill" style={{ background: '#ecfdf5', color: '#10b981' }}> All systems operational</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '14px' }}>
                  {[
                    { name: 'Express API Server', status: 'operational', uptime: '99.7%', resp: '42ms', color: '#10b981' },
                    { name: 'MongoDB Atlas', status: 'operational', uptime: '99.9%', resp: '12ms', color: '#10b981' },
                    { name: 'Socket.io Realtime', status: 'operational', uptime: '98.2%', resp: '8ms', color: '#10b981' },
                    { name: 'Auth Service (JWT)', status: 'operational', uptime: '100%', resp: '3ms', color: '#10b981' },
                    { name: 'File Storage', status: 'degraded', uptime: '94.1%', resp: '380ms', color: '#f59e0b' },
                    { name: 'Email Notifications', status: 'offline', uptime: '0%', resp: 'N/A', color: '#ef4444' },
                  ].map((svc, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 14px', borderRadius: '12px', background: '#f8fafc', border: '1px solid #f1f5f9' }}>
                      <span style={{ width: 10, height: 10, borderRadius: '50%', background: svc.color, boxShadow: `0 0 8px ${svc.color}`, flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>{svc.name}</div>
                        <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'capitalize' }}>{svc.status}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: svc.color }}>{svc.uptime}</div>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Resp: {svc.resp}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </article>

              {/* Active Users / Sessions */}
              <article className="panel-card">
                <div className="panel-header">
                  <h3>Active Sessions</h3>
                  <span className="pill" style={{ background: '#eef2ff', color: '#6366f1' }}>Live</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '14px' }}>
                  {(() => {
                    const activeCheckIns = Object.values(attendance?.checkIns || {}).filter(c => c.checkedIn);
                    const realSessions = activeCheckIns.map(c => ({
                      name: c.name || 'Leo Brooks',
                      role: 'Employee',
                      ip: '192.168.1.' + Math.floor(Math.random() * 200 + 2),
                      time: c.breakStartedAt ? 'On Break' : 'Active Now',
                      device: 'Chrome/Desktop',
                      color: c.breakStartedAt ? '#f59e0b' : '#10b981',
                      focus: c.currentFocus
                    }));

                    const defaultSessions = [
                      { name: 'Ava Chen', role: 'Super Admin', ip: '192.168.1.12', time: 'Just now', device: 'Chrome/Windows', color: '#6366f1' },
                      { name: 'Mina Patel', role: 'HR', ip: '192.168.1.23', time: '2m ago', device: 'Safari/Mac', color: '#8b5cf6' },
                    ];

                    const sessionsToRender = [...realSessions, ...defaultSessions].slice(0, 4);

                    return sessionsToRender.map((sess, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '12px', background: '#f8fafc', border: '1px solid #f1f5f9' }}>
                        <div style={{ width: 34, height: 34, borderRadius: '50%', background: `linear-gradient(135deg,${sess.color},${sess.color}88)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '0.8rem', flexShrink: 0 }}>
                          {sess.name[0]}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>{sess.name}</div>
                          <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                            {sess.device} • {sess.ip}
                            {sess.focus && (
                              <span style={{ display: 'block', fontStyle: 'italic', color: '#6366f1', marginTop: '2px', fontWeight: 500 }}>
                                💻 {sess.focus}
                              </span>
                            )}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: '6px', background: '#eef2ff', color: sess.color }}>{sess.role}</span>
                          <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '3px' }}>{sess.time}</div>
                        </div>
                      </div>
                    ));
                  })()}
                </div>

                <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Resource Usage</div>
                  {liveResources.map((res, i) => (
                    <div key={i} style={{ marginBottom: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontSize: '0.78rem', color: '#475569', fontWeight: 600 }}>{res.label}</span>
                        <span style={{ fontSize: '0.78rem', fontWeight: 800, color: res.color }}>{res.value}%</span>
                      </div>
                      <div style={{ height: 6, borderRadius: 99, background: '#f1f5f9', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${res.value}%`, borderRadius: 99, background: res.color, transition: 'width 0.8s ease' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            </section>

            {/* System Control Center (Full Width) */}
            <article className="panel-card" style={{ gridColumn: '1 / -1', marginTop: '12px', marginBottom: '24px' }}>
              <div className="panel-header">
                <h3>Super Admin System Control Panel</h3>
                <span className="pill" style={{ background: '#fbcfe8', color: '#be185d', fontWeight: 'bold' }}>Live Console</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', marginTop: '16px' }}>
                {/* Broadcast Announcement */}
                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '0.9rem', color: '#1e293b' }}>Broadcast Live System Announcement</h4>
                  <p style={{ margin: '0 0 12px 0', fontSize: '0.78rem', color: '#64748b' }}>
                    Sends a real-time notification alert instantly to all online employee dashboard headers.
                  </p>
                  <form onSubmit={handleBroadcastSubmit} style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      value={broadcastMsg}
                      onChange={(e) => setBroadcastMsg(e.target.value)}
                      placeholder="e.g. Server maintenance scheduled for 11:00 PM tonight..."
                      required
                      style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                    />
                    <button
                      type="submit"
                      className="primary-button"
                      disabled={broadcastLoading}
                      style={{ marginTop: 0, padding: '10px 16px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
                    >
                      {broadcastLoading ? 'Sending...' : 'Broadcast Alert'}
                    </button>
                  </form>
                  {broadcastSuccess && (
                    <span style={{ display: 'block', marginTop: '6px', fontSize: '0.75rem', color: '#16a34a', fontWeight: 'bold' }}>
                      ✓ Announcement broadcasted to all connected clients!
                    </span>
                  )}
                </div>

                {/* Simulated Cache / Database Controls */}
                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <h4 style={{ margin: '0', fontSize: '0.9rem', color: '#1e293b' }}>System Operations Simulation</h4>

                  {simSuccess && (
                    <div style={{ padding: '8px 12px', background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600 }}>
                      {simSuccess}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      className="submit-button"
                      disabled={simulating !== ''}
                      onClick={() => handleSimulateAction('db')}
                      style={{ flex: 1, marginTop: 0, padding: '10px', fontSize: '0.75rem', background: '#6366f1', border: 'none', color: '#fff', borderRadius: '8px', cursor: 'pointer' }}
                    >
                      {simulating === 'db' ? 'Optimizing DB Indexes...' : 'Optimize DB Indexes'}
                    </button>
                    <button
                      type="button"
                      className="submit-button"
                      disabled={simulating !== ''}
                      onClick={() => handleSimulateAction('cache')}
                      style={{ flex: 1, marginTop: 0, padding: '10px', fontSize: '0.75rem', background: '#f59e0b', border: 'none', color: '#fff', borderRadius: '8px', cursor: 'pointer' }}
                    >
                      {simulating === 'cache' ? 'Pruning Session Cache...' : 'Prune Session Cache'}
                    </button>
                  </div>
                </div>
              </div>
            </article>
          </>
        )}

        {/* -- TAB: AUDIT LOG -- */}
        {adminTab === 'audit' && (
          <article className="panel-card" style={{ marginBottom: '24px' }}>
            <div className="panel-header">
              <h3>Audit Log</h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['all', 'approval', 'leave', 'payroll', 'auth', 'project'].map(f => (
                  <button key={f} onClick={() => setAuditFilter(f)} style={{
                    padding: '4px 12px', borderRadius: '20px', border: 'none', cursor: 'pointer',
                    fontSize: '0.72rem', fontWeight: 700, textTransform: 'capitalize',
                    background: auditFilter === f ? '#6366f1' : '#f1f5f9',
                    color: auditFilter === f ? '#fff' : '#64748b',
                    transition: 'all 0.2s',
                  }}>{f}</button>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '14px' }}>
              {filteredAudit.map((entry, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 16px',
                  borderRadius: '12px', background: '#fafafe', border: '1px solid #f1f5f9',
                  transition: 'all 0.2s',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f0f4ff'}
                  onMouseLeave={e => e.currentTarget.style.background = '#fafafe'}
                >
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>
                    {entry.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>{entry.action}</div>
                    <div style={{ fontSize: '0.73rem', color: '#94a3b8', marginTop: '2px' }}>
                      By <strong style={{ color: '#475569' }}>{entry.actor}</strong>  Target: {entry.target}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: '6px', background: '#eef2ff', color: '#6366f1', textTransform: 'capitalize' }}>{entry.type}</span>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '3px' }}>{entry.time} today</div>
                  </div>
                </div>
              ))}
              {filteredAudit.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8', fontSize: '0.88rem' }}>
                  No audit entries for this filter.
                </div>
              )}
            </div>
          </article>
        )}
      </>
    )
  }

  /*  HR DASHBOARD (non-admin)  */
  return (
    <>
      <SectionHeading title={`Welcome back, ${user.name}`} subtitle="A unified view of growth, operations, and collaboration." action={socketConnected ? 'Live sync on' : 'Connecting...'} />

      {/* Broadcast Announcement Banner */}
      {(() => {
        const latestBroadcast = Array.isArray(notifications) ? (notifications.find(n => n.text?.startsWith('[Broadcast]') || n.title?.startsWith('[Broadcast]')) || notifications[0]) : null;
        if (!latestBroadcast) return null;

        return (
          <div style={{
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)',
            border: '1.5px solid rgba(99, 102, 241, 0.3)',
            borderRadius: '16px',
            padding: '16px 20px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            boxShadow: '0 8px 30px rgba(99, 102, 241, 0.08)'
          }}>
            <span style={{ fontSize: '1.4rem', flexShrink: 0 }}>📢</span>
            <div style={{ flex: 1 }}>
              <strong style={{ color: '#4338ca', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '2px' }}>
                System Broadcast Announcement
              </strong>
              <span style={{ fontSize: '0.9rem', color: '#1e293b', fontWeight: 600 }}>
                {latestBroadcast.text?.replace('[Broadcast] ', '') || latestBroadcast.text}
              </span>
            </div>
            <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 500, alignSelf: 'flex-start' }}>
              {latestBroadcast.time || 'Live'}
            </span>
          </div>
        );
      })()}

      <section className="stats-grid">
        {cards.map((card) => (
          <article key={card.label} className="stat-card">
            <div className="stat-icon" style={{ background: card.grad }}>{card.icon}</div>
            <p>{card.label}</p>
            <h3>{card.value}</h3>
            <span>{card.detail}</span>
          </article>
        ))}
      </section>

      {/* Row 2: Analytics & Trends Grid */}
      <section className="content-grid" style={{ marginBottom: '24px' }}>
        {/* Performance Pulse */}
        <article className="panel-card large" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div className="panel-header">
              <h3>Performance Pulse</h3>
              <span className="pill" style={{ background: '#eef2ff', color: '#6366f1' }}>Weekly activity</span>
            </div>
            <div className="bars">
              {pulseData.map((item, index) => (
                <div key={index} className={`bar-column ${hoveredBarIndex === index ? 'active' : ''}`}
                  onMouseEnter={() => setHoveredBarIndex(index)}
                  onMouseLeave={() => setHoveredBarIndex(null)}>
                  <div className="bar-fill" style={{ height: `${item.value}%` }} />
                  <span className="bar-label-text">{item.day}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            {hoveredBarIndex !== null ? (
              <div className="chart-info-box">
                <span className="chart-info-box-bullet" />
                <span><strong>{pulseData[hoveredBarIndex].day}: {pulseData[hoveredBarIndex].value}%</strong>  {pulseData[hoveredBarIndex].desc}</span>
              </div>
            ) : (
              <p className="panel-copy" style={{ margin: '15px 0 0' }}> Hover over any weekday bar to view real-time engagement and operational summaries.</p>
            )}
          </div>
        </article>

        {/* SLA & Productivity Trend */}
        <article className="panel-card large" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative' }}>
          <div>
            <div className="panel-header">
              <h3>SLA & Growth Trend</h3>
              <span className="pill" style={{ background: '#f5f3ff', color: '#8b5cf6' }}>Yearly metrics</span>
            </div>
            <div className="svg-chart-container">
              <svg width="100%" height="100%" viewBox={`0 0 ${svgW} ${svgH}`} preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chart-gradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="50%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#d946ef" />
                  </linearGradient>
                  <linearGradient id="area-gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0.00" />
                  </linearGradient>
                </defs>
                {[0, 25, 50, 75, 100].map((level, idx) => {
                  const y = svgH - padY - (level / 100) * (svgH - 2 * padY)
                  return <line key={idx} x1={padX} y1={y} x2={svgW - padX} y2={y} className="svg-chart-gridline" />
                })}
                <path d={areaPath} className="svg-chart-path-area" />
                <path d={linePath} className="svg-chart-path-line" />
                {points.map((p, idx) => (
                  <text key={idx} x={p.x} y={svgH - 4} textAnchor="middle" className="svg-chart-axis-text">{p.label}</text>
                ))}
                {points.map((p, idx) => (
                  <circle key={idx} cx={p.x} cy={p.y} r={hoveredPoint?.index === idx ? 6 : 4}
                    className="svg-chart-point"
                    onMouseEnter={() => setHoveredPoint({ index: idx, ...p })}
                    onMouseLeave={() => setHoveredPoint(null)} />
                ))}
              </svg>
              {hoveredPoint && (
                <div className="svg-chart-tooltip" style={{ left: `${(hoveredPoint.x / svgW) * 100}%`, top: `${(hoveredPoint.y / svgH) * 100}%` }}>
                  <strong>{hoveredPoint.label}: {hoveredPoint.val}% SLA</strong><br />
                  {hoveredPoint.projects} projects completed
                </div>
              )}
            </div>
          </div>
          <p className="panel-copy" style={{ margin: '15px 0 0' }}> Hover on data nodes to inspect project completions and SLA status.</p>
        </article>
      </section>

      {/* Row 3: Live Feed + Department breakdown */}
      <section className="content-grid">
        <article className="panel-card">
          <div className="panel-header">
            <h3>Live Activity</h3>
            <span className="pill">Recent updates</span>
          </div>
          <ul className="list">
            {liveActivity.map((item, index) => (
              <li key={`${item}-${index}`} style={{ padding: '10px 12px', borderBottom: '1px solid #f1f5f9', display: 'flex', gap: '8px', fontSize: '0.85rem' }}>
                <span style={{ color: '#6366f1', fontWeight: 'bold' }}></span>
                <span style={{ color: '#475569' }}>{item}</span>
              </li>
            ))}
          </ul>
        </article>
        <article className="panel-card">
          <div className="panel-header">
            <h3>Department Capacity</h3>
            <span className="pill" style={{ background: '#ecfdf5', color: '#10b981' }}>{dashboardData.totalEmployees || 7} total</span>
          </div>
          <div className="dept-list">
            {departments.map((dept, index) => (
              <div key={index} className="dept-item">
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span className="dept-name">{dept.name}</span>
                    <span style={{ fontSize: '0.73rem', color: '#94a3b8', fontWeight: 600 }}>{dept.count} {dept.count === 1 ? 'member' : 'members'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div className="dept-bar-container">
                      <div className="dept-bar-value" style={{ width: `${dept.pct}%`, background: dept.color }} />
                    </div>
                    <span className="dept-percent-text">{dept.pct}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      {/* Persisted HR Reminders Note-Pad */}
      <section className="content-grid" style={{ marginTop: '24px', marginBottom: '24px' }}>
        <article className="panel-card" style={{ gridColumn: '1 / -1' }}>
          <div className="panel-header">
            <h3>HR Workspace Scratchpad & Reminders</h3>
            <span className="pill" style={{ background: '#e0e7ff', color: '#4338ca', fontWeight: 'bold' }}>Persisted locally</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', marginTop: '16px' }}>
            {/* Memo Note-pad */}
            <div>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: '#1e293b' }}>Interactive Memo Pad</h4>
              <textarea
                value={hrMemo}
                onChange={handleMemoChange}
                placeholder="Jot down general notes, phone numbers, interview schedules, or reminders here..."
                rows="6"
                style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.85rem', lineHeight: 1.5, resize: 'none' }}
              />
              <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginTop: '4px' }}>
                ✍️ Auto-saves instantly to your local browser storage.
              </span>
            </div>

            {/* Quick Reminders Checklist */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '0.9rem', color: '#1e293b' }}>Task Reminders Checklist</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {hrTasks.map(t => (
                  <label key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: t.done ? '#94a3b8' : '#334155', cursor: 'pointer', textDecoration: t.done ? 'line-through' : 'none' }}>
                    <input
                      type="checkbox"
                      checked={t.done}
                      onChange={() => handleTaskToggle(t.id)}
                      style={{ cursor: 'pointer' }}
                    />
                    {t.text}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </article>
      </section>
    </>
  )
}

/*  Employee Personal Dashboard  */
function EmployeeDashboardPage({ user, leaveData, payroll, attendance, liveActivity, socketConnected, triggerRefresh, activeUsers, dashboardData, socket }) {
  /*  Real-time clock  */
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  /*  Work session timer states  */
  const [checkedIn, setCheckedIn] = useState(false)
  const [onBreak, setOnBreak] = useState(false)
  const [elapsed, setElapsed] = useState(0) // seconds (worked time excluding breaks)
  const [breakDuration, setBreakDuration] = useState(0) // seconds
  const [checkInLoading, setCheckInLoading] = useState(false)
  const [breakLoading, setBreakLoading] = useState(false)

  const activeRecord = attendance?.checkIns?.[String(user.id)]

  useEffect(() => {
    if (!activeRecord) {
      setCheckedIn(false)
      setOnBreak(false)
      setElapsed(0)
      setBreakDuration(0)
      return
    }
    setCheckedIn(activeRecord.checkedIn)
    setOnBreak(!!activeRecord.breakStartedAt)
  }, [activeRecord])

  // Real-time ticking timer loop
  useEffect(() => {
    const parseTimeToday = (timeStr) => {
      if (!timeStr) return null;
      const cleanStr = timeStr.trim().toLowerCase();
      const modifier = cleanStr.endsWith('pm') ? 'pm' : 'am';
      const timeOnly = cleanStr.replace(/[ap]m/, '').trim();
      let [hours, minutes] = timeOnly.split(':').map(Number);
      if (modifier === 'pm' && hours < 12) hours += 12;
      if (modifier === 'am' && hours === 12) hours = 0;

      const d = new Date();
      d.setHours(hours, minutes, 0, 0);
      return d;
    };

    if (!activeRecord || !activeRecord.checkedIn || !activeRecord.time) {
      setElapsed(0)
      setBreakDuration(0)
      return
    }

    const intervalId = setInterval(() => {
      const now = new Date();
      const checkInDate = parseTimeToday(activeRecord.time);
      if (checkInDate) {
        const totalElapsedSec = Math.max(0, Math.floor((now - checkInDate) / 1000));

        if (activeRecord.breakStartedAt) {
          const breakStartDate = parseTimeToday(activeRecord.breakStartedAt);
          if (breakStartDate) {
            const currentBreakSec = Math.max(0, Math.floor((now - breakStartDate) / 1000));
            const totalBreakSec = (activeRecord.totalBreakDuration || 0) * 60 + currentBreakSec;
            setBreakDuration(totalBreakSec);
            setElapsed(Math.max(0, Math.floor((breakStartDate - checkInDate) / 1000) - (activeRecord.totalBreakDuration || 0) * 60));
          }
        } else {
          const totalBreakSec = (activeRecord.totalBreakDuration || 0) * 60;
          setBreakDuration(totalBreakSec);
          setElapsed(Math.max(0, totalElapsedSec - totalBreakSec));
        }
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [activeRecord]);

  const handleWorkSessionToggle = async () => {
    if (checkInLoading) return
    setCheckInLoading(true)
    try {
      const response = await fetch(API_BASE + '/api/attendance/checkin', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ userId: user.id, name: user.name })
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Unable to update check-in status')
      if (triggerRefresh) triggerRefresh()
    } catch (err) {
      console.error(err)
    } finally {
      setCheckInLoading(false)
    }
  }

  const handleBreakToggle = async () => {
    if (breakLoading) return
    setBreakLoading(true)
    const action = activeRecord?.breakStartedAt ? 'end' : 'start'
    try {
      const response = await fetch(`${API_BASE}/api/attendance/break`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ userId: user.id, action })
      })
      if (response.ok) {
        if (triggerRefresh) triggerRefresh()
      }
    } catch (err) {
      console.error(err)
    } finally {
      setBreakLoading(false)
    }
  }

  const fmtElapsed = (s) => {
    const h = String(Math.floor(s / 3600)).padStart(2, '0')
    const m = String(Math.floor((s % 3600) / 60)).padStart(2, '0')
    const sc = String(s % 60).padStart(2, '0')
    return `${h}:${m}:${sc}`
  }
  const workHoursPct = Math.min(100, Math.round((elapsed / (8 * 3600)) * 100))

  /*  Pomodoro timer  */
  const POMO_WORK = 25 * 60
  const POMO_BREAK = 5 * 60
  const [pomoMode, setPomoMode] = useState('work') // 'work' | 'break'
  const [pomoSec, setPomoSec] = useState(POMO_WORK)
  const [pomoRunning, setPomoRunning] = useState(false)
  const [pomoCycles, setPomoCycles] = useState(0)
  useEffect(() => {
    if (!pomoRunning) return
    const id = setInterval(() => {
      setPomoSec(prev => {
        if (prev <= 1) {
          if (pomoMode === 'work') {
            setPomoMode('break')
            setPomoSec(POMO_BREAK)
            setPomoCycles(c => c + 1)
          } else {
            setPomoMode('work')
            setPomoSec(POMO_WORK)
          }
          return pomoMode === 'work' ? POMO_BREAK : POMO_WORK
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [pomoRunning, pomoMode])
  const fmtPomo = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
  const pomoPct = pomoMode === 'work'
    ? Math.round(((POMO_WORK - pomoSec) / POMO_WORK) * 100)
    : Math.round(((POMO_BREAK - pomoSec) / POMO_BREAK) * 100)

  /*  Interactive tasks  */
  const [tasks, setTasks] = useState([])
  const [newTask, setNewTask] = useState('')
  const [tasksLoading, setTasksLoading] = useState(true)

  const fetchTasks = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/tasks`, { headers: authHeaders() })
      if (response.ok) {
        const data = await response.json()
        setTasks(data.map(t => ({ id: t._id || t.id, title: t.title, due: t.due, priority: t.priority, done: t.done })))
      }
    } catch (err) {
      console.error(err)
    } finally {
      setTasksLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  const toggleTask = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/api/tasks/${id}/toggle`, {
        method: 'PUT',
        headers: authHeaders()
      })
      if (response.ok) {
        setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t))
        if (triggerRefresh) triggerRefresh()
      }
    } catch (err) {
      console.error(err)
    }
  }

  const addTask = async (e) => {
    e.preventDefault()
    if (!newTask.trim()) return
    try {
      const response = await fetch(`${API_BASE}/api/tasks`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ title: newTask.trim() })
      })
      if (response.ok) {
        const t = await response.json()
        setTasks(prev => [...prev, { id: t._id || t.id, title: t.title, due: t.due, priority: t.priority, done: t.done }])
        setNewTask('')
        if (triggerRefresh) triggerRefresh()
      }
    } catch (err) {
      console.error(err)
    }
  }

  const doneTasks = tasks.filter(t => t.done).length
  const taskPct = tasks.length > 0 ? Math.round((doneTasks / tasks.length) * 100) : 0

  /* Real-time dynamic meetings from DB */
  const [meetings, setMeetings] = useState([])
  const [meetingsLoading, setMeetingsLoading] = useState(true)

  const fetchMeetings = useCallback(() => {
    fetch(`${API_BASE}/api/meetings`, { headers: authHeaders() })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setMeetings(data);
        }
      })
      .catch(() => {})
      .finally(() => setMeetingsLoading(false));
  }, [API_BASE]);

  useEffect(() => {
    fetchMeetings()
  }, [fetchMeetings])

  useEffect(() => {
    if (!socket) return
    socket.on('meeting_updated', fetchMeetings)
    return () => {
      socket.off('meeting_updated', fetchMeetings)
    }
  }, [socket, fetchMeetings])

  /*  Derived  */
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 17 ? 'Good afternoon' : 'Good evening'
  const dateStr = now.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  
  const priorityColor = { high: '#ef4444', medium: '#f59e0b', low: '#22c55e' }
  const priorityBg = { high: '#fee2e2', medium: '#fef3c7', low: '#dcfce7' }
  const typeColor = { meeting: '#6366f1', review: '#8b5cf6', training: '#06b6d4', task: '#f59e0b' }
  const typeBg = { meeting: '#eef2ff', review: '#f5f3ff', training: '#ecfeff', task: '#fefce8' }
  const statusColor = { active: '#22c55e', idle: '#f59e0b', offline: '#94a3b8' }

  /* Circular SVG progress helper */
  const CircleProgress = ({ pct, size = 80, stroke = 7, color = '#6366f1', children }) => {
    const r = (size - stroke) / 2
    const circ = 2 * Math.PI * r
    const dash = circ * pct / 100
    return (
      <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e2e8f0" strokeWidth={stroke} />
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
            strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 0.6s ease' }} />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {children}
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* -- HERO BANNER ------------------------------------------ */}
      <div style={{
        background: 'linear-gradient(135deg,#6366f1 0%,#8b5cf6 55%,#a855f7 100%)',
        borderRadius: '22px', padding: '26px 32px', position: 'relative',
        overflow: 'hidden', color: '#fff',
        display: 'grid', gridTemplateColumns: '1fr auto auto', alignItems: 'center', gap: '20px',
      }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, background: 'rgba(255,255,255,0.07)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: -50, right: 140, width: 140, height: 140, background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />
        {/* Left: greeting */}
        <div style={{ zIndex: 1 }}>
          <p style={{ fontSize: '0.82rem', opacity: 0.85, marginBottom: '4px', fontWeight: 500 }}>{dateStr}</p>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 6px', letterSpacing: '-0.02em' }}>
            {greeting}, {user.name}!
          </h2>
          <p style={{ opacity: 0.88, fontSize: '0.92rem', margin: 0 }}>Your real-time workspace is ready.</p>
        </div>
        {/* Centre: live clock */}
        <div style={{
          background: 'rgba(255,255,255,0.13)', backdropFilter: 'blur(12px)',
          borderRadius: '16px', padding: '14px 22px', textAlign: 'center',
          border: '1px solid rgba(255,255,255,0.22)', zIndex: 1, flexShrink: 0,
        }}>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, fontVariantNumeric: 'tabular-nums', lineHeight: 1, letterSpacing: '0.04em' }}>
            {timeStr}
          </div>
          <div style={{ fontSize: '0.72rem', opacity: 0.85, marginTop: '4px', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Live Clock
          </div>
        </div>
        {/* Right: monthly score */}
        <div style={{
          background: 'rgba(255,255,255,0.13)', backdropFilter: 'blur(12px)',
          borderRadius: '16px', padding: '14px 22px', textAlign: 'center',
          border: '1px solid rgba(255,255,255,0.22)', zIndex: 1, flexShrink: 0,
        }}>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, lineHeight: 1 }}>{dashboardData?.monthlyScore || '92%'}</div>
          <div style={{ fontSize: '0.72rem', opacity: 0.85, marginTop: '4px', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Monthly Score</div>
          {socketConnected && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginTop: '6px', fontSize: '0.7rem', opacity: 0.9 }}>
              <span style={{ width: 6, height: 6, background: '#4ade80', borderRadius: '50%', display: 'inline-block', animation: 'pulse 1.5s infinite' }} />
              Live
            </div>
          )}
        </div>
      </div>

      {/* -- ROW 1: Stats cards ----------------------------------- */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px' }}>
        {[
          { label: 'My Attendance', value: dashboardData?.attendance || attendance?.summary || '100%', detail: 'this week', icon: '-', grad: 'linear-gradient(135deg,#6366f1,#8b5cf6)' },
          { label: 'Leave Balance', value: dashboardData?.leaveBalance || leaveData?.balance || '14 days', detail: 'remaining this year', icon: '*', grad: 'linear-gradient(135deg,#34d399,#059669)' },
          { label: 'Net Salary', value: dashboardData?.salary || payroll?.items?.[0]?.value || '$4,820', detail: 'current month', icon: '*', grad: 'linear-gradient(135deg,#fbbf24,#f59e0b)' },
          { label: 'Tasks Done', value: `${doneTasks}/${tasks.length}`, detail: 'completed today', icon: '*', grad: 'linear-gradient(135deg,#38bdf8,#6366f1)' },
        ].map(card => (
          <article key={card.label} className="stat-card">
            <div className="stat-icon" style={{ background: card.grad }}>{card.icon}</div>
            <p>{card.label}</p>
            <h3>{card.value}</h3>
            <span>{card.detail}</span>
          </article>
        ))}
      </div>

      {/* -- ROW 2: Work Session + Pomodoro + Work-hours bar ------ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>

        {/* Work Session */}
        <article className="panel-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
          <div className="panel-header" style={{ width: '100%' }}>
            <h3>Work Session</h3>
            <span className="pill" style={{
              background: onBreak ? '#fef3c7' : checkedIn ? '#dcfce7' : '#f1f5f9',
              color: onBreak ? '#b45309' : checkedIn ? '#16a34a' : '#64748b'
            }}>
              {onBreak ? ' On Break' : checkedIn ? ' Active' : ' Idle'}
            </span>
          </div>
          <CircleProgress pct={workHoursPct} size={90} color={onBreak ? '#f59e0b' : checkedIn ? '#6366f1' : '#cbd5e1'}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: onBreak ? '#f59e0b' : checkedIn ? '#6366f1' : '#94a3b8' }}>{workHoursPct}%</span>
          </CircleProgress>
          <div style={{ fontFamily: 'monospace', fontSize: '1.6rem', fontWeight: 800, color: '#1e293b', letterSpacing: '0.06em' }}>
            {fmtElapsed(elapsed)}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '-8px' }}>
            {onBreak ? 'On break' : breakDuration > 0 ? `Break: ${fmtElapsed(breakDuration)}` : 'of 8h target'}
          </div>
          <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
            <button
              type="button"
              onClick={handleWorkSessionToggle}
              disabled={checkInLoading || onBreak}
              style={{
                flex: 1, padding: '10px', borderRadius: '12px', border: 'none', cursor: 'pointer',
                fontWeight: 700, fontSize: '0.88rem',
                background: checkedIn ? 'linear-gradient(135deg,#ef4444,#dc2626)' : 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                color: '#fff', transition: 'opacity 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              {checkInLoading ? '...' : (checkedIn ? 'Check Out' : 'Check In')}
            </button>
            {checkedIn && (
              <button
                type="button"
                onClick={handleBreakToggle}
                disabled={breakLoading}
                style={{
                  flex: 1, padding: '10px', borderRadius: '12px', border: 'none', cursor: 'pointer',
                  fontWeight: 700, fontSize: '0.88rem',
                  background: onBreak ? 'linear-gradient(135deg,#10b981,#059669)' : 'linear-gradient(135deg,#f59e0b,#fbbf24)',
                  color: '#fff', transition: 'opacity 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                {breakLoading ? '...' : (onBreak ? 'End Break' : 'Go on Break')}
              </button>
            )}
          </div>
        </article>

        {/* Pomodoro Focus Timer */}
        <article className="panel-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
          <div className="panel-header" style={{ width: '100%' }}>
            <h3>Focus Timer</h3>
            <span className="pill" style={{ background: pomoMode === 'work' ? '#eef2ff' : '#ecfeff', color: pomoMode === 'work' ? '#6366f1' : '#06b6d4' }}>
              {pomoMode === 'work' ? ' Focus' : '- Break'}  #{pomoCycles + 1}
            </span>
          </div>
          <CircleProgress pct={pomoPct} size={90} color={pomoMode === 'work' ? '#6366f1' : '#06b6d4'}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: pomoMode === 'work' ? '#6366f1' : '#06b6d4' }}>{pomoPct}%</span>
          </CircleProgress>
          <div style={{ fontFamily: 'monospace', fontSize: '1.6rem', fontWeight: 800, color: '#1e293b', letterSpacing: '0.06em' }}>
            {fmtPomo(pomoSec)}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '-8px' }}>
            {pomoMode === 'work' ? '25 min deep work' : '5 min break'}
          </div>
          <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
            <button type="button" onClick={() => setPomoRunning(r => !r)} style={{
              flex: 1, padding: '10px', borderRadius: '12px', border: 'none', cursor: 'pointer',
              fontWeight: 700, fontSize: '0.88rem',
              background: pomoRunning ? 'linear-gradient(135deg,#f59e0b,#d97706)' : 'linear-gradient(135deg,#6366f1,#8b5cf6)',
              color: '#fff',
            }}>
              {pomoRunning ? ' Pause' : ' Start'}
            </button>
            <button type="button" onClick={() => { setPomoRunning(false); setPomoSec(POMO_WORK); setPomoMode('work') }} style={{
              padding: '10px 14px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer', fontSize: '0.88rem',
            }}>🔄</button>
          </div>
          <div style={{ display: 'flex', gap: '4px' }}>
            {[...Array(4)].map((_, i) => (
              <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: i < pomoCycles % 4 ? '#6366f1' : '#e2e8f0' }} />
            ))}
          </div>
        </article>

        {/* Today's Work Hours Bar */}
        <article className="panel-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="panel-header">
            <h3>Daily Progress</h3>
          </div>
          {[
            { label: 'Work Hours', pct: workHoursPct, color: '#6366f1', value: `${Math.floor(elapsed / 3600)}h ${Math.floor((elapsed % 3600) / 60)}m` },
            { label: 'Tasks Done', pct: taskPct, color: '#10b981', value: `${doneTasks}/${tasks.length}` },
            { label: 'Attendance', pct: parseFloat(dashboardData?.attendance || '100'), color: '#f59e0b', value: dashboardData?.attendance || '100%' },
            { label: 'Focus Time', pct: Math.min(100, pomoCycles * 25), color: '#8b5cf6', value: `${pomoCycles * 25} min` },
          ].map(bar => (
            <div key={bar.label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569' }}>{bar.label}</span>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: bar.color }}>{bar.value}</span>
              </div>
              <div style={{ height: 8, borderRadius: 99, background: '#f1f5f9', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 99, width: `${bar.pct}%`,
                  background: bar.color,
                  transition: 'width 0.8s ease',
                }} />
              </div>
            </div>
          ))}

          {/* Team online status */}
          <div style={{ marginTop: '6px', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Team Online ({activeUsers?.length || 0})</div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {(!activeUsers || activeUsers.length === 0) && <span style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>No one else online</span>}
              {activeUsers?.map(m => (
                <div key={m.socketId} title={`${m.name} — ${m.status}`} style={{
                  position: 'relative', width: 30, height: 30, borderRadius: '50%',
                  background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.7rem', fontWeight: 800, color: '#fff', cursor: 'default',
                }}>
                  {m.name?.[0]?.toUpperCase() || '?'}
                  <span style={{
                    position: 'absolute', bottom: 0, right: 0, width: 8, height: 8,
                    borderRadius: '50%', background: m.status === 'active' ? '#22c55e' : '#f59e0b', border: '2px solid #fff',
                  }} />
                </div>
              ))}
            </div>
          </div>
        </article>
      </div>

      {/* -- ROW 3: Tasks + Schedule ------------------------------ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

        {/* Interactive Tasks */}
        <article className="panel-card">
          <div className="panel-header">
            <h3>My Tasks</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ height: 6, width: 60, borderRadius: 99, background: '#f1f5f9', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${taskPct}%`, background: 'linear-gradient(90deg,#6366f1,#8b5cf6)', transition: 'width 0.5s' }} />
              </div>
              <span className="pill">{doneTasks}/{tasks.length}</span>
            </div>
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {tasks.map(task => (
              <li key={task.id}
                onClick={() => toggleTask(task.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px',
                  borderRadius: '10px', cursor: 'pointer', userSelect: 'none',
                  background: task.done ? '#f8fafc' : '#fff',
                  border: `1px solid ${task.done ? '#f1f5f9' : '#e8eaf0'}`,
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = task.done ? '#f0f4f8' : '#f8f8ff'}
                onMouseLeave={e => e.currentTarget.style.background = task.done ? '#f8fafc' : '#fff'}
              >
                <div style={{
                  width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                  border: task.done ? 'none' : '2px solid #cbd5e1',
                  background: task.done ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s',
                }}>
                  {task.done && <span style={{ color: '#fff', fontSize: '10px', fontWeight: 900 }}></span>}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: task.done ? '#94a3b8' : '#1e293b', textDecoration: task.done ? 'line-through' : 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {task.title}
                  </div>
                  <div style={{ fontSize: '0.73rem', color: '#94a3b8', marginTop: '1px' }}>Due: {task.due}</div>
                </div>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '2px 7px', borderRadius: '6px', color: priorityColor[task.priority], background: priorityBg[task.priority], flexShrink: 0, textTransform: 'capitalize' }}>
                  {task.priority}
                </span>
              </li>
            ))}
          </ul>
          {/* Add task inline */}
          <form onSubmit={addTask} style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text" value={newTask} onChange={e => setNewTask(e.target.value)}
              placeholder="+ Add a new task"
              style={{ flex: 1, padding: '8px 12px', border: '1px dashed #cbd5e1', borderRadius: '10px', fontSize: '0.85rem', outline: 'none', color: '#1e293b', background: '#fafafe' }}
            />
            <button type="submit" style={{ padding: '8px 14px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' }}>
              Add
            </button>
          </form>
        </article>

        {/* Today's Schedule */}
        <article className="panel-card">
          <div className="panel-header">
            <h3>Today's Schedule</h3>
            <span className="pill">{meetings.length} events</span>
          </div>
          {meetingsLoading ? (
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', textAlign: 'center', margin: '20px 0' }}>Loading schedule...</p>
          ) : meetings.length > 0 ? (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '240px', overflowY: 'auto' }}>
              {meetings.map((s) => {
                const isOngoing = s.status === 'Ongoing';
                const meetingTime = new Date(s.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                return (
                  <li key={s._id} style={{
                    display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px',
                    borderRadius: '10px', border: `1px solid ${isOngoing ? '#c7d2fe' : '#f1f5f9'}`,
                    background: isOngoing ? '#eef2ff' : '#f8fafc',
                    opacity: s.status === 'Completed' ? 0.6 : 1,
                    transition: 'all 0.3s',
                  }}>
                    {isOngoing && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#6366f1', flexShrink: 0, animation: 'pulse 1.5s infinite' }} />}
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#6366f1', minWidth: '68px', background: '#eef2ff', padding: '4px 8px', borderRadius: '6px', textAlign: 'center' }}>
                      {meetingTime}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.87rem', fontWeight: 600, color: s.status === 'Completed' ? '#94a3b8' : '#1e293b' }}>{s.title}</div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>Hosted by {s.organizer}</div>
                    </div>
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: '6px', color: isOngoing ? '#047857' : '#475569', background: isOngoing ? '#ecfdf5' : '#f1f5f9', flexShrink: 0, textTransform: 'capitalize' }}>
                      {s.status}
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px 0', color: '#94a3b8' }}>
              <p style={{ margin: 0, fontSize: '0.9rem' }}>No meetings scheduled.</p>
              <p style={{ margin: '4px 0 0', fontSize: '0.78rem' }}>Check back later or start a call in Team Chat.</p>
            </div>
          )}
        </article>
      </div>

      {/* -- ROW 4: Quick Actions + Live Feed + Team Pulse -------- */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>

        {/* Quick Actions */}
        <article className="panel-card">
          <div className="panel-header"><h3>Quick Actions</h3></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {[
              { label: 'Apply Leave', icon: '*', color: '#059669', bg: '#d1fae5', href: '/leave' },
              { label: 'View Payslip', icon: '*', color: '#d97706', bg: '#fef3c7', href: '/payroll' },
              { label: 'Attendance', icon: '-', color: '#6366f1', bg: '#eef2ff', href: '/attendance' },
              { label: 'Team Chat', icon: '*', color: '#8b5cf6', bg: '#f5f3ff', href: '/chat' },
              { label: 'My Projects', icon: '*', color: '#06b6d4', bg: '#ecfeff', href: '/projects' },
              { label: 'View Profile', icon: '*', color: '#f59e0b', bg: '#fefce8', href: '/settings' },
            ].map(action => (
              <a key={action.label} href={action.href} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: '6px', padding: '14px 8px', borderRadius: '12px', background: action.bg,
                textDecoration: 'none', transition: 'transform 0.18s, box-shadow 0.18s',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.09)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
              >
                <span style={{ fontSize: '1.4rem' }}>{action.icon}</span>
                <span style={{ fontSize: '0.73rem', fontWeight: 700, color: action.color, textAlign: 'center' }}>{action.label}</span>
              </a>
            ))}
          </div>
        </article>

        {/* Live Activity Feed */}
        <article className="panel-card">
          <div className="panel-header">
            <h3>Live Activity</h3>
            {socketConnected
              ? <span className="pill" style={{ background: '#dcfce7', color: '#16a34a' }}> Live</span>
              : <span className="pill" style={{ background: '#f1f5f9', color: '#94a3b8' }}>Offline</span>}
          </div>
          {liveActivity && liveActivity.length > 0 ? (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {liveActivity.map((item, i) => (
                <li key={i} style={{
                  padding: '9px 12px', borderRadius: '10px', fontSize: '0.82rem', color: '#475569',
                  display: 'flex', alignItems: 'flex-start', gap: '8px',
                  background: i === 0 ? '#eef2ff' : '#f8fafc',
                  border: `1px solid ${i === 0 ? '#c7d2fe' : '#f1f5f9'}`,
                  transition: 'all 0.4s',
                }}>
                  <span style={{ color: '#6366f1', fontSize: '0.7rem', marginTop: '2px', flexShrink: 0 }}></span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px 0', color: '#94a3b8' }}>
              <p style={{ margin: 0, fontSize: '0.9rem' }}>No recent activity.</p>
              <p style={{ margin: '4px 0 0', fontSize: '0.78rem' }}>Check-ins and system logs will sync here.</p>
            </div>
          )}
        </article>

        {/* Team Pulse */}
        <article className="panel-card">
          <div className="panel-header">
            <h3>Team Pulse</h3>
            {(user.role === 'hr' || user.role === 'super_admin') && (
              <button onClick={() => alert('Create Group functionality coming soon')} style={{
                marginLeft: 'auto', marginRight: '10px', padding: '4px 8px', borderRadius: '6px', 
                border: 'none', background: '#eef2ff', color: '#6366f1', fontSize: '0.75rem', 
                fontWeight: 600, cursor: 'pointer'
              }}>
                Create Group
              </button>
            )}
            <span className="pill">{activeUsers?.filter(m => m.status === 'active').length || 0} online</span>
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {!activeUsers || activeUsers.length === 0 ? <li style={{ fontSize: '0.8rem', color: '#94a3b8', textAlign: 'center', padding: '10px' }}>No one else online</li> : null}
            {activeUsers?.map(m => (
              <li key={m.socketId} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 10px', borderRadius: '10px', background: '#fafafe', border: '1px solid #f1f5f9' }}>
                <div style={{ position: 'relative', width: 34, height: 34, borderRadius: '50%', background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 800, color: '#fff', flexShrink: 0 }}>
                  {m.name?.[0]?.toUpperCase() || '?'}
                  <span style={{ position: 'absolute', bottom: 0, right: 0, width: 9, height: 9, borderRadius: '50%', background: m.status === 'active' ? '#22c55e' : '#f59e0b', border: '2px solid #fff' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>{m.name} {m.id === user.id ? '(You)' : ''}</div>
                  <div style={{ fontSize: '0.73rem', color: '#94a3b8', textTransform: 'capitalize' }}>{m.role.replace('_', ' ')}</div>
                </div>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: m.status === 'active' ? '#22c55e' : '#f59e0b', textTransform: 'capitalize' }}>
                  {m.status}
                </span>
              </li>
            ))}
          </ul>
        </article>
      </div>

    </div>
  )
}

function EmployeeDetailsModal({ employee, onClose, API_BASE }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    tasks: [],
    projects: [],
    leave: { balance: '0 days', requests: [] },
    payroll: { status: 'Processed', items: [], payslips: [] }
  });

  useEffect(() => {
    if (!employee) return;
    const fetchAllDetails = async () => {
      setLoading(true);
      try {
        const headers = authHeaders();
        const empId = employee.id || employee._id;
        const [tasksRes, projectsRes, leaveRes, payrollRes] = await Promise.all([
          fetch(`${API_BASE}/api/tasks?employeeId=${empId}`, { headers }),
          fetch(`${API_BASE}/api/projects?employeeId=${empId}`, { headers }),
          fetch(`${API_BASE}/api/leave?employeeId=${empId}`, { headers }),
          fetch(`${API_BASE}/api/payroll?employeeId=${empId}`, { headers })
        ]);

        setData({
          tasks: tasksRes.ok ? await tasksRes.json() : [],
          projects: projectsRes.ok ? await projectsRes.json() : [],
          leave: leaveRes.ok ? await leaveRes.json() : { balance: '0 days', requests: [] },
          payroll: payrollRes.ok ? await payrollRes.json() : { status: 'Processed', items: [], payslips: [] }
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllDetails();
  }, [employee, API_BASE]);

  if (!employee) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
      <div style={{ background: '#fff', borderRadius: '24px', width: '100%', maxWidth: '800px', height: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '24px 32px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
          <div>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#6366f1', background: 'rgba(99,102,241,0.1)', padding: '3px 10px', borderRadius: '20px' }}>
              Employee Dossier
            </span>
            <h3 style={{ margin: '4px 0 0', fontSize: '1.5rem', color: '#0f172a', fontWeight: 800 }}>{employee.name}</h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '6px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        {/* Content Area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#64748b' }}>Loading employee details...</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
              {/* Profile details */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', background: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                <div>
                  <label style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 700 }}>Role / Designation</label>
                  <p style={{ margin: '4px 0 0', fontSize: '0.95rem', fontWeight: 600, color: '#1e293b' }}>{employee.role}</p>
                </div>
                <div>
                  <label style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 700 }}>Department</label>
                  <p style={{ margin: '4px 0 0', fontSize: '0.95rem', fontWeight: 600, color: '#1e293b' }}>{employee.department}</p>
                </div>
                <div>
                  <label style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 700 }}>Status</label>
                  <p style={{ margin: '4px 0 0', fontSize: '0.95rem', fontWeight: 600, color: '#10b981' }}>{employee.status || 'Active'}</p>
                </div>
              </div>

              {/* Leave Balance Section */}
              <div>
                <h4 style={{ margin: '0 0 12px', fontSize: '1rem', color: '#0f172a', fontWeight: 700 }}>Leave Balance</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                  <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px', textAlign: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '2px' }}>Total Balance</span>
                    <strong style={{ fontSize: '1.2rem', color: '#1e293b' }}>{data.leave.balance || '14 days'}</strong>
                  </div>
                  {data.leave.items?.map((item, i) => (
                    <div key={i} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px', textAlign: 'center' }}>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '2px' }}>{item.label}</span>
                      <strong style={{ fontSize: '1.2rem', color: '#64748b' }}>{item.value}</strong>
                    </div>
                  ))}
                </div>
              </div>

              {/* Projects Section */}
              <div>
                <h4 style={{ margin: '0 0 12px', fontSize: '1rem', color: '#0f172a', fontWeight: 700 }}>Assigned Projects</h4>
                {data.projects.length === 0 ? (
                  <div style={{ color: '#64748b', fontSize: '0.9rem', fontStyle: 'italic' }}>No projects assigned.</div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    {data.projects.map((proj) => (
                      <div key={proj._id || proj.id} style={{ border: '1px solid #e2e8f0', borderRadius: '14px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>{proj.name}</span>
                          <span className="pill" style={{ background: '#e0e7ff', color: '#4338ca', fontSize: '0.75rem' }}>{proj.progress || '0%'}</span>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', lineHeight: 1.4 }}>{proj.summary}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Tasks Section */}
              <div>
                <h4 style={{ margin: '0 0 12px', fontSize: '1rem', color: '#0f172a', fontWeight: 700 }}>Checklist & Tasks</h4>
                {data.tasks.length === 0 ? (
                  <div style={{ color: '#64748b', fontSize: '0.9rem', fontStyle: 'italic' }}>No tasks created.</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {data.tasks.map((task) => (
                      <div key={task._id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                        <span style={{ textDecoration: task.done ? 'line-through' : 'none', color: task.done ? '#94a3b8' : '#334155', fontSize: '0.85rem', fontWeight: 500 }}>
                          {task.title}
                        </span>
                        <span style={{ marginLeft: 'auto', fontSize: '0.72rem', padding: '2px 8px', borderRadius: '6px', background: task.done ? '#ecfdf5' : '#fff', color: task.done ? '#10b981' : '#64748b', border: '1px solid #e2e8f0', fontWeight: 600 }}>
                          {task.done ? 'Completed' : 'Pending'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Payroll Section */}
              <div>
                <h4 style={{ margin: '0 0 12px', fontSize: '1rem', color: '#0f172a', fontWeight: 700 }}>Payroll Summary</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                  {data.payroll.items?.map((item, i) => (
                    <div key={i} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px', background: '#f8fafc' }}>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>{item.label}</span>
                      <strong style={{ fontSize: '1.2rem', color: '#1e293b', display: 'block', marginTop: '4px' }}>{item.value}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '20px 32px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', background: '#f8fafc' }}>
          <button type="button" className="primary-button" onClick={onClose}>Close Dossier</button>
        </div>
      </div>
    </div>
  );
}

function EmployeesPage({ employees, attendance, API_BASE, triggerRefresh, user }) {
  const [showModal, setShowModal] = useState(false);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [exporting, setExporting] = useState(false);
  const [newEmp, setNewEmp] = useState({ name: '', role: '', department: '', status: 'Active' });
  const [moveForm, setMoveForm] = useState({ department: '', role: '' });
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailsEmp, setDetailsEmp] = useState(null);

  const isHR = user?.role === 'hr' || user?.role === 'super_admin';
  const checkIns = attendance?.checkIns || {};
  const getLiveStatus = (employee) => {
    const userId = employee.userId || employee.user?._id || employee.user?.id;
    const empId = employee._id || employee.id;
    const record = (userId ? checkIns[String(userId)] : null) || (empId ? checkIns[String(empId)] : null);
    if (record?.checkedIn) {
      if (record.breakStartedAt) {
        return {
          label: 'On break',
          tone: 'pending',
          detail: 'On break since ' + record.breakStartedAt,
          focus: record.currentFocus
        };
      }
      return {
        label: 'Active now',
        tone: 'active',
        detail: record.time ? 'Checked in at ' + record.time : 'Checked in',
        focus: record.currentFocus
      };
    }
    if (employee.status === 'Pending' || employee.status === 'Rejected') return { label: employee.status, tone: employee.status.toLowerCase(), detail: 'Account status' };
    return { label: 'Not checked in', tone: 'idle', detail: 'No active check-in' };
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!newEmp.name.trim() || !newEmp.role.trim() || !newEmp.department.trim()) {
      setFormError('Name, role, and department are required.');
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE}/api/employees`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(newEmp)
      });
      if (response.ok) {
        setNewEmp({ name: '', role: '', department: '', status: 'Active' });
        setShowModal(false);
        if (triggerRefresh) triggerRefresh();
      } else {
        const data = await response.json();
        setFormError(data.message || 'Failed to add employee.');
      }
    } catch {
      // Offline fallback  add locally
      if (triggerRefresh) triggerRefresh();
      setNewEmp({ name: '', role: '', department: '', status: 'Active' });
      setShowModal(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenMoveModal = (emp) => {
    setSelectedEmp(emp);
    setMoveForm({ department: emp.department, role: emp.role });
    setFormError('');
    setShowMoveModal(true);
  };

  const handleMoveEmployee = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!moveForm.role.trim() || !moveForm.department.trim()) {
      setFormError('Role and department are required.');
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE}/api/employees/${selectedEmp.id || selectedEmp._id}/move`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({
          role: moveForm.role,
          department: moveForm.department
        })
      });
      if (response.ok) {
        setShowMoveModal(false);
        setSelectedEmp(null);
        if (triggerRefresh) triggerRefresh();
      } else {
        const data = await response.json();
        setFormError(data.message || 'Failed to move employee.');
      }
    } catch {
      if (triggerRefresh) triggerRefresh();
      setShowMoveModal(false);
      setSelectedEmp(null);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadExcel = async () => {
    setFormError('');
    setExporting(true);
    try {
      const response = await fetch(`${API_BASE}/api/employees/export`, {
        headers: authDownloadHeaders()
      });
      if (!response.ok) {
        throw new Error('Failed to download employee data.');
      }
      const blob = await response.blob();
      downloadBlob(blob, 'employees.csv');
    } catch {
      downloadEmployeesCsv(employees, 'employees.csv');
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      <section className="panel-card">
        <div className="panel-header">
          <h3>Employee directory</h3>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <button type="button" className="ghost-button" onClick={handleDownloadExcel} disabled={exporting}>
              {exporting ? 'Downloading...' : 'Download Excel'}
            </button>
            <button type="button" className="primary-button" onClick={() => { setFormError(''); setShowModal(true); }}>+ Add employee</button>
          </div>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
              <th>Department</th>
              <th>Status</th>
              {isHR && <th style={{ textAlign: 'right' }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {employees.length === 0 ? (
              <tr>
                <td colSpan={isHR ? 5 : 4} style={{ textAlign: 'center', color: '#64748b', padding: '24px' }}>
                  No real-time employee records found. Add an employee or start the backend database connection.
                </td>
              </tr>
            ) : employees.map((employee) => (
              <tr key={employee.id || employee._id}>
                <td>{employee.name}</td>
                <td>{employee.role}</td>
                <td>{employee.department}</td>
                <td>
                  {(() => {
                    const liveStatus = getLiveStatus(employee);
                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span className={'attendance-status attendance-status-' + liveStatus.tone} title={liveStatus.detail}>
                          {liveStatus.label}
                        </span>
                        {liveStatus.focus && (
                          <span style={{ fontSize: '0.75rem', color: '#6366f1', fontWeight: 700, fontStyle: 'italic', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            💻 {liveStatus.focus}
                          </span>
                        )}
                      </div>
                    );
                  })()}
                </td>
                {isHR && (
                  <td style={{ textAlign: 'right' }}>
                    <button
                      type="button"
                      className="primary-button"
                      style={{ padding: '6px 12px', fontSize: '0.8rem', minHeight: 'unset', display: 'inline-flex', alignItems: 'center', cursor: 'pointer', borderRadius: '8px', marginRight: '6px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}
                      onClick={() => { setDetailsEmp(employee); setShowDetailsModal(true); }}
                    >
                      View
                    </button>
                    <button
                      type="button"
                      className="ghost-button"
                      style={{ padding: '6px 12px', fontSize: '0.8rem', minHeight: 'unset', display: 'inline-flex', alignItems: 'center', cursor: 'pointer', borderRadius: '8px' }}
                      onClick={() => handleOpenMoveModal(employee)}
                    >
                      Move
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {showModal && (
        <div className="google-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div className="google-modal-container" style={{ maxWidth: '440px', width: '100%' }}>
            <div className="google-logo-header" style={{ marginBottom: '4px' }}>
              <h2 style={{ fontSize: '1.2rem' }}>Add New Employee</h2>
              <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Fill in the details to add a new team member</p>
            </div>
            <form onSubmit={handleAddEmployee} className="auth-form-new" style={{ gap: '14px', padding: '0 0 4px' }}>
              <div className="form-group">
                <input
                  type="text"
                  value={newEmp.name}
                  onChange={(e) => setNewEmp({ ...newEmp, name: e.target.value })}
                  placeholder="Full name"
                  required
                  autoFocus
                />
              </div>
              <div className="form-group">
                <input
                  type="text"
                  value={newEmp.role}
                  onChange={(e) => setNewEmp({ ...newEmp, role: e.target.value })}
                  placeholder="Job title / Role"
                  required
                />
              </div>
              <div className="form-group">
                <input
                  type="text"
                  value={newEmp.department}
                  onChange={(e) => setNewEmp({ ...newEmp, department: e.target.value })}
                  placeholder="Department"
                  required
                />
              </div>
              <div className="form-group">
                <select
                  value={newEmp.status}
                  onChange={(e) => setNewEmp({ ...newEmp, status: e.target.value })}
                  style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', width: '100%', fontSize: '0.95rem' }}
                >
                  <option value="Active">Active</option>
                  <option value="Pending">Pending</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              {formError && <p className="error-text" style={{ marginTop: 0 }}>{formError}</p>}
              <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                <button type="submit" className="submit-button" disabled={submitting} style={{ marginTop: 0, flex: 1 }}>
                  {submitting ? 'Adding...' : 'Add Employee'}
                </button>
                <button
                  type="button"
                  className="google-login-button"
                  onClick={() => setShowModal(false)}
                  style={{ marginBottom: 0, flex: 1 }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showMoveModal && selectedEmp && (
        <div className="google-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowMoveModal(false); }}>
          <div className="google-modal-container" style={{ maxWidth: '440px', width: '100%' }}>
            <div className="google-logo-header" style={{ marginBottom: '4px' }}>
              <h2 style={{ fontSize: '1.2rem' }}>Move Employee</h2>
              <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Transfer <strong>{selectedEmp.name}</strong> to a new department or role</p>
            </div>
            <form onSubmit={handleMoveEmployee} className="auth-form-new" style={{ gap: '14px', padding: '0 0 4px' }}>
              <div className="form-group">
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '4px' }}>Department</label>
                <input
                  type="text"
                  value={moveForm.department}
                  onChange={(e) => setMoveForm({ ...moveForm, department: e.target.value })}
                  placeholder="New Department"
                  required
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '4px' }}>Job Title / Role</label>
                <input
                  type="text"
                  value={moveForm.role}
                  onChange={(e) => setMoveForm({ ...moveForm, role: e.target.value })}
                  placeholder="New Job Title / Role"
                  required
                />
              </div>
              {formError && <p className="error-text" style={{ marginTop: 0 }}>{formError}</p>}
              <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                <button type="submit" className="submit-button" disabled={submitting} style={{ marginTop: 0, flex: 1 }}>
                  {submitting ? 'Moving...' : 'Move Employee'}
                </button>
                <button
                  type="button"
                  className="google-login-button"
                  onClick={() => setShowMoveModal(false)}
                  style={{ marginBottom: 0, flex: 1 }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDetailsModal && detailsEmp && (
        <EmployeeDetailsModal
          employee={detailsEmp}
          onClose={() => { setShowDetailsModal(false); setDetailsEmp(null); }}
          API_BASE={API_BASE}
        />
      )}
    </>
  );
}

function ApprovalsPage({ user, API_BASE, triggerRefresh }) {
  const isHR = user.role === 'hr';
  const isAdmin = user.role === 'super_admin';
  const canApprove = isHR || isAdmin;

  // ─── Local demo state (used when backend is offline) ──────────────────────
  const [demoApprovals, setDemoApprovals] = useState([
    { id: 'demo-1', name: 'Ravi Kumar', email: 'ravi@ems.com', department: '', role: '', status: 'Pending', requestedAt: '2026-07-01' },
    { id: 'demo-2', name: 'Sneha Mehta', email: 'sneha@ems.com', department: 'HR', role: 'HR Analyst', status: 'HR Approved', requestedAt: '2026-07-03' },
    { id: 'demo-3', name: 'Arjun Das', email: 'arjun@ems.com', department: 'Sales', role: 'Sales Rep', status: 'HR Approved', requestedAt: '2026-07-05' },
    { id: 'demo-4', name: 'Priya Singh', email: 'priya@ems.com', department: 'Finance', role: 'Analyst', status: 'HR Rejected', requestedAt: '2026-07-06' },
    { id: 'demo-5', name: 'Carlos Reyes', email: 'carlos@ems.com', department: 'Eng', role: 'Dev', status: 'Admin Approved', requestedAt: '2026-07-02' },
  ]);
  const [liveApprovals, setLiveApprovals] = useState(null); // null = not loaded yet
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [formById, setFormById] = useState({});

  // Which tab is active: 'hr-queue' | 'admin-queue' | 'history'
  const [activeTab, setActiveTab] = useState(isAdmin ? 'admin-queue' : 'hr-queue');

  const approvals = liveApprovals ?? demoApprovals;

  const loadApprovals = () => {
    if (!canApprove) { setLoading(false); return; }
    setLoading(true);
    fetch(`${API_BASE}/api/approvals`, { headers: authHeaders() })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Unable to load approvals');
        return data;
      })
      .then((data) => {
        setLiveApprovals(data);
        setFormById(Object.fromEntries(data.map((item) => [
          item.id,
          { department: item.department === 'General' ? '' : (item.department || ''), role: item.role === 'Employee' ? '' : (item.role || '') }
        ])));
        setMessage('');
      })
      .catch(() => {
        // Backend unavailable – fall back to demo data
        setLiveApprovals(null);
        setFormById(Object.fromEntries(demoApprovals.map((item) => [
          item.id,
          { department: item.department || '', role: item.role || '' }
        ])));
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadApprovals(); }, [user.id]);

  const updateForm = (id, field, value) => {
    setFormById((cur) => ({ ...cur, [id]: { ...(cur[id] || {}), [field]: value } }));
  };

  // ─── HR handles first-level decisions ─────────────────────────────────────
  const handleHRDecision = async (id, decision) => {
    setMessage('');
    const form = formById[id] || {};
    if (decision === 'hr_approve' && (!form.department?.trim() || !form.role?.trim())) {
      setMessage('Fill in Department and Role before approving.');
      return;
    }
    const nextStatus = decision === 'hr_approve' ? 'HR Approved' : 'HR Rejected';
    try {
      const res = await fetch(`${API_BASE}/api/approvals/${id}/${decision === 'hr_approve' ? 'approve' : 'reject'}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ department: form.department, role: form.role })
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.message || 'Action failed');
      setMessage(payload.message || `Marked as ${nextStatus}`);
      loadApprovals();
      if (triggerRefresh) triggerRefresh();
    } catch {
      // Offline: mutate demo state locally
      setDemoApprovals((prev) =>
        prev.map((a) => a.id === id
          ? { ...a, status: nextStatus, department: form.department || a.department, role: form.role || a.role }
          : a)
      );
      setMessage(`[Offline demo] Marked as ${nextStatus}`);
    }
  };

  // ─── Admin handles final decisions ────────────────────────────────────────
  const handleAdminDecision = async (id, decision) => {
    setMessage('');
    const nextStatus = decision === 'admin_approve' ? 'Admin Approved' : 'Admin Rejected';
    try {
      const res = await fetch(`${API_BASE}/api/approvals/${id}/admin-${decision === 'admin_approve' ? 'approve' : 'reject'}`, {
        method: 'PUT',
        headers: authHeaders()
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.message || 'Action failed');
      setMessage(payload.message || `Marked as ${nextStatus}`);
      loadApprovals();
      if (triggerRefresh) triggerRefresh();
    } catch {
      // Offline: mutate demo state locally
      setDemoApprovals((prev) =>
        prev.map((a) => a.id === id ? { ...a, status: nextStatus } : a)
      );
      setMessage(`[Offline demo] Marked as ${nextStatus}`);
    }
  };

  // ─── Derived lists ────────────────────────────────────────────────────────
  const hrQueue = approvals.filter((a) => a.status === 'Pending');
  const adminQueue = approvals.filter((a) => a.status === 'HR Approved');
  const history = approvals.filter((a) => ['HR Rejected', 'Admin Approved', 'Admin Rejected'].includes(a.status));

  const statusMeta = {
    'Pending': { color: '#d97706', bg: '#fef3c7', label: 'Pending HR Review' },
    'HR Approved': { color: '#2563eb', bg: '#dbeafe', label: 'HR Approved – Awaiting Admin' },
    'HR Rejected': { color: '#dc2626', bg: '#fee2e2', label: 'HR Rejected' },
    'Admin Approved': { color: '#16a34a', bg: '#dcfce7', label: 'Admin Approved ✓' },
    'Admin Rejected': { color: '#dc2626', bg: '#fee2e2', label: 'Admin Rejected' },
  };

  if (!canApprove) {
    return (
      <article className="panel-card">
        <div className="panel-header"><h3>Approvals</h3></div>
        <p className="panel-copy">Only HR and Admin accounts can manage employee approvals.</p>
      </article>
    );
  }

  // ─── Tab styles ───────────────────────────────────────────────────────────
  const tabStyle = (key) => ({
    padding: '9px 20px',
    borderRadius: '10px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 700,
    fontSize: '0.85rem',
    transition: 'all 0.18s',
    background: activeTab === key ? 'linear-gradient(135deg,#4338ca,#8b5cf6)' : '#f1f5f9',
    color: activeTab === key ? '#fff' : '#64748b',
    boxShadow: activeTab === key ? '0 4px 12px rgba(99,102,241,0.25)' : 'none',
  });

  // ─── Approval row renderer ────────────────────────────────────────────────
  const renderRow = (item, actions) => {
    const meta = statusMeta[item.status] || {};
    return (
      <tr key={item.id}>
        <td>
          <div style={{ fontWeight: 700, color: '#1e293b' }}>{item.name}</div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{item.email}</div>
        </td>
        <td>
          {actions === 'hr' ? (
            <input
              type="text"
              value={formById[item.id]?.department || ''}
              onChange={(e) => updateForm(item.id, 'department', e.target.value)}
              placeholder="Department"
              style={{ width: '100%', minWidth: 120, padding: '7px 10px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.85rem' }}
            />
          ) : (
            <span style={{ fontWeight: 600, color: '#334155' }}>{item.department || '—'}</span>
          )}
        </td>
        <td>
          {actions === 'hr' ? (
            <input
              type="text"
              value={formById[item.id]?.role || ''}
              onChange={(e) => updateForm(item.id, 'role', e.target.value)}
              placeholder="Job role"
              style={{ width: '100%', minWidth: 120, padding: '7px 10px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.85rem' }}
            />
          ) : (
            <span style={{ fontWeight: 600, color: '#334155' }}>{item.role || '—'}</span>
          )}
        </td>
        <td>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '4px 10px', borderRadius: 20,
            background: meta.bg, color: meta.color,
            fontSize: '0.75rem', fontWeight: 700, whiteSpace: 'nowrap'
          }}>
            {meta.label || item.status}
          </span>
        </td>
        <td style={{ textAlign: 'right' }}>
          {actions === 'hr' && (
            <div style={{ display: 'inline-flex', gap: 8 }}>
              <button
                type="button"
                onClick={() => handleHRDecision(item.id, 'hr_approve')}
                style={{ padding: '7px 14px', background: 'linear-gradient(135deg,#2563eb,#4f46e5)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', transition: 'opacity 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                HR Approve
              </button>
              <button
                type="button"
                onClick={() => handleHRDecision(item.id, 'hr_reject')}
                style={{ padding: '7px 14px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', transition: 'opacity 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                Reject
              </button>
            </div>
          )}
          {actions === 'admin' && (
            <div style={{ display: 'inline-flex', gap: 8 }}>
              <button
                type="button"
                onClick={() => handleAdminDecision(item.id, 'admin_approve')}
                style={{ padding: '7px 14px', background: 'linear-gradient(135deg,#16a34a,#059669)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', transition: 'opacity 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                Admin Approve ✓
              </button>
              <button
                type="button"
                onClick={() => handleAdminDecision(item.id, 'admin_reject')}
                style={{ padding: '7px 14px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', transition: 'opacity 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                Final Reject
              </button>
            </div>
          )}
          {actions === 'history' && (
            <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{item.requestedAt || '—'}</span>
          )}
        </td>
      </tr>
    );
  };

  const tableHeader = (showInputCols = true) => (
    <thead>
      <tr>
        <th>Employee</th>
        <th>Department</th>
        <th>Role</th>
        <th>Status</th>
        <th style={{ textAlign: 'right' }}>Actions</th>
      </tr>
    </thead>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* ── Header ── */}
      <section className="page-heading" style={{ paddingBottom: 0 }}>
        <div>
          <p className="eyebrow">Approval workflow</p>
          <h2>Employee Onboarding Approvals</h2>
          <p className="helper-text" style={{ margin: 0 }}>
            Two-stage pipeline: HR reviews first → Admin gives final sign-off.
          </p>
        </div>

        {/* Stage pipeline legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {[
            { label: 'Pending', color: '#d97706', bg: '#fef3c7' },
            { label: '→ HR Approved', color: '#2563eb', bg: '#dbeafe' },
            { label: '→ Admin Approved', color: '#16a34a', bg: '#dcfce7' },
          ].map((s) => (
            <span key={s.label} style={{ padding: '4px 12px', borderRadius: 20, background: s.bg, color: s.color, fontSize: '0.75rem', fontWeight: 700 }}>
              {s.label}
            </span>
          ))}
        </div>
      </section>

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {isHR && (
          <button type="button" style={tabStyle('hr-queue')} onClick={() => setActiveTab('hr-queue')}>
            HR Queue
            {hrQueue.length > 0 && (
              <span style={{ marginLeft: 8, background: '#ef4444', color: '#fff', borderRadius: 10, padding: '1px 7px', fontSize: '0.72rem' }}>
                {hrQueue.length}
              </span>
            )}
          </button>
        )}
        {isAdmin && (
          <>
            <button type="button" style={tabStyle('admin-queue')} onClick={() => setActiveTab('admin-queue')}>
              Admin Queue
              {adminQueue.length > 0 && (
                <span style={{ marginLeft: 8, background: '#ef4444', color: '#fff', borderRadius: 10, padding: '1px 7px', fontSize: '0.72rem' }}>
                  {adminQueue.length}
                </span>
              )}
            </button>
            <button type="button" style={tabStyle('hr-queue')} onClick={() => setActiveTab('hr-queue')}>
              HR Queue
              {hrQueue.length > 0 && (
                <span style={{ marginLeft: 8, background: '#ef4444', color: '#fff', borderRadius: 10, padding: '1px 7px', fontSize: '0.72rem' }}>
                  {hrQueue.length}
                </span>
              )}
            </button>
          </>
        )}
        <button type="button" style={tabStyle('history')} onClick={() => setActiveTab('history')}>
          History
          {history.length > 0 && (
            <span style={{ marginLeft: 8, background: '#94a3b8', color: '#fff', borderRadius: 10, padding: '1px 7px', fontSize: '0.72rem' }}>
              {history.length}
            </span>
          )}
        </button>
      </div>

      {/* ── Status message ── */}
      {message && (
        <div className={`feather-badge ${message.toLowerCase().includes('reject') ? 'danger' : 'success'}`} style={{ alignSelf: 'flex-start' }}>
          {message}
        </div>
      )}

      {/* ── HR Queue Tab ── */}
      {activeTab === 'hr-queue' && (
        <section className="panel-card">
          <div className="panel-header">
            <div>
              <h3>HR First-Level Review</h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#94a3b8' }}>
                Set department &amp; role, then approve or reject.
              </p>
            </div>
            <span className="pill" style={{ background: '#fef3c7', color: '#d97706' }}>
              {hrQueue.length} pending
            </span>
          </div>
          {loading ? (
            <p className="panel-copy">Loading…</p>
          ) : hrQueue.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '36px 0', color: '#94a3b8' }}>
              <div style={{ fontSize: '2rem', marginBottom: 8 }}>✅</div>
              <p style={{ margin: 0, fontWeight: 600 }}>No pending HR requests</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                {tableHeader()}
                <tbody>{hrQueue.map((item) => renderRow(item, isHR ? 'hr' : 'history'))}</tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* ── Admin Queue Tab ── */}
      {activeTab === 'admin-queue' && isAdmin && (
        <section className="panel-card">
          <div className="panel-header">
            <div>
              <h3>Admin Final Sign-Off</h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#94a3b8' }}>
                These have been reviewed by HR and are awaiting your final decision.
              </p>
            </div>
            <span className="pill" style={{ background: '#dbeafe', color: '#2563eb' }}>
              {adminQueue.length} awaiting
            </span>
          </div>
          {loading ? (
            <p className="panel-copy">Loading…</p>
          ) : adminQueue.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '36px 0', color: '#94a3b8' }}>
              <div style={{ fontSize: '2rem', marginBottom: 8 }}>🎯</div>
              <p style={{ margin: 0, fontWeight: 600 }}>No requests awaiting admin approval</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                {tableHeader(false)}
                <tbody>{adminQueue.map((item) => renderRow(item, 'admin'))}</tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* ── History Tab ── */}
      {activeTab === 'history' && (
        <section className="panel-card">
          <div className="panel-header">
            <h3>Approval History</h3>
            <span className="subtle-pill">{history.length} resolved</span>
          </div>
          {history.length === 0 ? (
            <p className="panel-copy">No resolved approvals yet.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                {tableHeader(false)}
                <tbody>{history.map((item) => renderRow(item, 'history'))}</tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

function AttendancePage({ attendance, user, API_BASE, triggerRefresh }) {
  const [status, setStatus] = useState({ checkedIn: false, time: '', breakStartedAt: null, totalBreakDuration: 0, currentFocus: '', history: [] });
  const [loading, setLoading] = useState(false);
  const [breakLoading, setBreakLoading] = useState(false);

  // Digital Clock state
  const [clockTime, setClockTime] = useState(new Date());

  // Real-time ticking stopwatch states (in seconds)
  const [activeWorkSeconds, setActiveWorkSeconds] = useState(0);
  const [activeBreakSeconds, setActiveBreakSeconds] = useState(0);

  // Tab state
  const [activeTab, setActiveTab] = useState('history'); // 'history' | 'regularize' | 'approvals'

  // Regularization requests state
  const [regRequests, setRegRequests] = useState([]);
  const [regDate, setRegDate] = useState('');
  const [regCheckIn, setRegCheckIn] = useState('');
  const [regCheckOut, setRegCheckOut] = useState('');
  const [regReason, setRegReason] = useState('');
  const [regSubmitting, setRegSubmitting] = useState(false);
  const [regSuccessMessage, setRegSuccessMessage] = useState('');

  // Live Work Focus state
  const [focusInput, setFocusInput] = useState('');
  const [focusUpdating, setFocusUpdating] = useState(false);
  const [focusSuccess, setFocusSuccess] = useState(false);

  // HR Approval state
  const [pendingRegs, setPendingRegs] = useState([]);
  const [actioningId, setActioningId] = useState(null);

  const isHR = user.role === 'hr' || user.role === 'super_admin';

  const loadStatus = useCallback(() => {
    if (!user || !API_BASE) return;
    fetch(`${API_BASE}/api/attendance/status/${user.id}`, { headers: authHeaders() })
      .then((res) => res.json())
      .then((data) => {
        setStatus(data);
        setFocusInput(data.currentFocus || '');
      })
      .catch(() => { });
  }, [user, API_BASE]);

  const loadRegularizations = useCallback(() => {
    if (!user || !API_BASE) return;
    fetch(`${API_BASE}/api/attendance/regularizations`, { headers: authHeaders() })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          if (isHR) {
            const sorted = [...data].sort((a, b) => {
              if (a.status === 'Pending' && b.status !== 'Pending') return -1;
              if (a.status !== 'Pending' && b.status === 'Pending') return 1;
              return new Date(b.createdAt) - new Date(a.createdAt);
            });
            setPendingRegs(sorted.filter(r => r.status === 'Pending'));
            setRegRequests(sorted.filter(r => r.userId === user.id || r.status !== 'Pending'));
          } else {
            setRegRequests(data);
          }
        }
      })
      .catch(() => { });
  }, [user, API_BASE, isHR]);

  useEffect(() => {
    loadStatus();
    loadRegularizations();
  }, [loadStatus, loadRegularizations]);

  // Clock tick & Stopwatch calculations loop
  useEffect(() => {
    const parseTimeToday = (timeStr) => {
      if (!timeStr) return null;
      const cleanStr = timeStr.trim().toLowerCase();
      const modifier = cleanStr.endsWith('pm') ? 'pm' : 'am';
      const timeOnly = cleanStr.replace(/[ap]m/, '').trim();
      let [hours, minutes] = timeOnly.split(':').map(Number);
      if (modifier === 'pm' && hours < 12) hours += 12;
      if (modifier === 'am' && hours === 12) hours = 0;

      const d = new Date();
      d.setHours(hours, minutes, 0, 0);
      return d;
    };

    const intervalId = setInterval(() => {
      const now = new Date();
      setClockTime(now);

      if (status.checkedIn && status.time) {
        const checkInDate = parseTimeToday(status.time);
        if (checkInDate) {
          const elapsedSec = Math.max(0, Math.floor((now - checkInDate) / 1000));

          if (status.breakStartedAt) {
            const breakStartDate = parseTimeToday(status.breakStartedAt);
            if (breakStartDate) {
              const currentBreakSec = Math.max(0, Math.floor((now - breakStartDate) / 1000));
              const totalBreakSec = (status.totalBreakDuration || 0) * 60 + currentBreakSec;
              setActiveBreakSeconds(totalBreakSec);

              const workedSec = Math.max(0, Math.floor((breakStartDate - checkInDate) / 1000) - (status.totalBreakDuration || 0) * 60);
              setActiveWorkSeconds(workedSec);
            }
          } else {
            const totalBreakSec = (status.totalBreakDuration || 0) * 60;
            setActiveBreakSeconds(totalBreakSec);

            const workedSec = Math.max(0, elapsedSec - totalBreakSec);
            setActiveWorkSeconds(workedSec);
          }
        }
      } else {
        setActiveWorkSeconds(0);
        setActiveBreakSeconds(0);
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [status.checkedIn, status.time, status.breakStartedAt, status.totalBreakDuration]);

  const handleCheckInToggle = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/attendance/checkin`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ userId: user.id, name: user.name })
      });
      const data = await response.json();
      setStatus(prev => ({
        ...prev,
        checkedIn: data.checkedIn,
        time: data.time || '',
        breakStartedAt: null,
        totalBreakDuration: 0,
        currentFocus: ''
      }));
      setFocusInput('');
      loadStatus();
      if (triggerRefresh) triggerRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBreakToggle = async () => {
    setBreakLoading(true);
    const action = status.breakStartedAt ? 'end' : 'start';
    try {
      const response = await fetch(`${API_BASE}/api/attendance/break`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ userId: user.id, action })
      });
      const data = await response.json();
      setStatus(prev => ({
        ...prev,
        breakStartedAt: data.breakStartedAt,
        totalBreakDuration: data.totalBreakDuration
      }));
      loadStatus();
      if (triggerRefresh) triggerRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setBreakLoading(false);
    }
  };

  const handleUpdateFocus = async (e) => {
    e.preventDefault();
    setFocusUpdating(true);
    setFocusSuccess(false);
    try {
      const response = await fetch(`${API_BASE}/api/attendance/focus`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ userId: user.id, focus: focusInput })
      });
      if (response.ok) {
        setStatus(prev => ({ ...prev, currentFocus: focusInput }));
        setFocusSuccess(true);
        setTimeout(() => setFocusSuccess(false), 3000);
        if (triggerRefresh) triggerRefresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFocusUpdating(false);
    }
  };

  const handleRegularizeSubmit = async (e) => {
    e.preventDefault();
    setRegSubmitting(true);
    setRegSuccessMessage('');
    try {
      const response = await fetch(`${API_BASE}/api/attendance/regularize`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          userId: user.id,
          userName: user.name,
          date: regDate,
          checkInTime: regCheckIn,
          checkOutTime: regCheckOut,
          reason: regReason
        })
      });
      if (response.ok) {
        setRegDate('');
        setRegCheckIn('');
        setRegCheckOut('');
        setRegReason('');
        setRegSuccessMessage('Correction request submitted successfully!');
        loadRegularizations();
        if (triggerRefresh) triggerRefresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRegSubmitting(false);
    }
  };

  const handleApprovalDecision = async (requestId, statusDecision) => {
    setActioningId(requestId);
    try {
      const response = await fetch(`${API_BASE}/api/attendance/regularize/approve`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ requestId, status: statusDecision })
      });
      if (response.ok) {
        loadRegularizations();
        loadStatus();
        if (triggerRefresh) triggerRefresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActioningId(null);
    }
  };

  const formatClockTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  };

  const formatClockDate = (date) => {
    return date.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatDuration = (totalSeconds) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return [
      h.toString().padStart(2, '0'),
      m.toString().padStart(2, '0'),
      s.toString().padStart(2, '0')
    ].join(':');
  };

  const workdayLimitSec = 28800;
  const workProgressPct = Math.min(100, (activeWorkSeconds / workdayLimitSec) * 100);
  const overtimeSeconds = Math.max(0, activeWorkSeconds - workdayLimitSec);

  return (
    <div className="attendance-layout">
      <article className="panel-card">
        <div className="panel-header">
          <h3>Clock-In Control Center</h3>
          {status.breakStartedAt && (
            <div className="break-pulse-indicator">
              <span className="dot"></span>
              <span>On Break</span>
            </div>
          )}
        </div>

        <div className="digital-clock-card">
          <span className="digital-clock-time">{formatClockTime(clockTime)}</span>
          <span className="digital-clock-date">{formatClockDate(clockTime)}</span>
        </div>

        <div className="checkin-container" style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>Status</span>
            <span className="pill" style={{
              background: status.checkedIn ? (status.breakStartedAt ? '#fef3c7' : '#dcfce7') : '#fee2e2',
              color: status.checkedIn ? (status.breakStartedAt ? '#b45309' : '#15803d') : '#b91c1c',
              fontWeight: 'bold',
              fontSize: '0.8rem'
            }}>
              {status.checkedIn ? (status.breakStartedAt ? 'On Break' : 'Active / Working') : 'Not Checked In'}
            </span>
          </div>

          {status.checkedIn && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.8rem', color: '#64748b' }}>
                <div>
                  <strong>Logged In Time:</strong>
                  <p style={{ margin: '4px 0 0 0', fontWeight: 700, color: '#334155', fontSize: '1.05rem', fontFamily: 'monospace' }}>
                    {formatDuration(activeWorkSeconds)}
                  </p>
                </div>
                <div>
                  <strong>Break Duration:</strong>
                  <p style={{ margin: '4px 0 0 0', fontWeight: 700, color: status.breakStartedAt ? '#d97706' : '#334155', fontSize: '1.05rem', fontFamily: 'monospace' }}>
                    {formatDuration(activeBreakSeconds)}
                  </p>
                </div>
              </div>

              {/* Progress Meter */}
              <div style={{ marginTop: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '6px' }}>
                  <span>Daily Progress (8h)</span>
                  <span>{workProgressPct.toFixed(1)}%</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '99px', overflow: 'hidden', position: 'relative' }}>
                  <div style={{
                    width: `${workProgressPct}%`,
                    height: '100%',
                    background: status.breakStartedAt ? 'linear-gradient(90deg, #f59e0b, #fbbf24)' : 'linear-gradient(90deg, #6366f1, #a855f7)',
                    borderRadius: '99px',
                    transition: 'width 0.5s ease-out',
                    boxShadow: '0 0 8px rgba(99, 102, 241, 0.4)'
                  }}></div>
                </div>
                {overtimeSeconds > 0 && (
                  <span className="pill" style={{ display: 'inline-block', marginTop: '6px', fontSize: '0.7rem', background: '#fbcfe8', color: '#be185d', fontWeight: 'bold' }}>
                    ⚠️ Overtime: +{formatDuration(overtimeSeconds)}
                  </span>
                )}
              </div>

              {/* Current Task Input */}
              <form onSubmit={handleUpdateFocus} style={{ borderTop: '1px solid #e2e8f0', marginTop: '8px', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>What are you working on right now?</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    value={focusInput}
                    onChange={(e) => setFocusInput(e.target.value)}
                    placeholder="e.g. Fixing design styles, writing tests..."
                    style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                  <button
                    type="submit"
                    className="primary-button"
                    disabled={focusUpdating}
                    style={{ marginTop: 0, padding: '8px 14px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
                  >
                    {focusUpdating ? 'Updating...' : 'Update'}
                  </button>
                </div>
                {focusSuccess && (
                  <span style={{ fontSize: '0.7rem', color: '#16a34a', fontWeight: 'bold' }}>✓ Focus shared with team</span>
                )}
              </form>
            </div>
          )}

          <div className="attendance-action-buttons">
            <button
              type="button"
              className={`submit-button ${status.checkedIn ? 'danger-btn' : ''}`}
              onClick={handleCheckInToggle}
              disabled={loading || status.breakStartedAt}
              style={{ padding: '12px 24px', background: status.checkedIn ? '#ef4444' : 'linear-gradient(135deg, #4338ca, #8b5cf6)', borderRadius: '10px', border: 'none', color: '#fff', cursor: 'pointer', transition: 'all 0.2s', flex: 2 }}
            >
              {loading ? 'Processing...' : (status.checkedIn ? 'Check Out' : 'Check In Now')}
            </button>

            {status.checkedIn && (
              <button
                type="button"
                className={`break-btn ${status.breakStartedAt ? 'on-break' : ''}`}
                onClick={handleBreakToggle}
                disabled={breakLoading}
                style={{ flex: 1.2 }}
              >
                {breakLoading ? '...' : (status.breakStartedAt ? 'End Break' : 'Go on Break')}
              </button>
            )}
          </div>
        </div>
      </article>

      <article className="panel-card">
        <div className="panel-header">
          <h3>Shift calendar</h3>
        </div>
        <ul className="list">
          {attendance.schedule.map((item) => (
            <li key={item.title} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
              <span style={{ fontWeight: 600, color: '#334155' }}>{item.title}</span>
              <span className="pill" style={{ background: '#f1f5f9', color: '#64748b', fontSize: '0.75rem' }}>{item.time}</span>
            </li>
          ))}
        </ul>
      </article>

      <div className="attendance-tabs-container">
        <div className="attendance-tab-headers">
          <button
            type="button"
            className={`attendance-tab-btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            My History Log
          </button>
          <button
            type="button"
            className={`attendance-tab-btn ${activeTab === 'regularize' ? 'active' : ''}`}
            onClick={() => setActiveTab('regularize')}
          >
            Corrections & Requests
          </button>
          {isHR && (
            <button
              type="button"
              className={`attendance-tab-btn ${activeTab === 'approvals' ? 'active' : ''}`}
              onClick={() => setActiveTab('approvals')}
              style={{ position: 'relative' }}
            >
              Pending Approvals
              {pendingRegs.length > 0 && (
                <span style={{ position: 'absolute', top: '-6px', right: '-8px', background: '#ef4444', color: '#fff', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '99px', fontWeight: 'bold' }}>
                  {pendingRegs.length}
                </span>
              )}
            </button>
          )}
        </div>

        <div className="attendance-tab-content">
          {activeTab === 'history' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h4 style={{ margin: 0, fontSize: '1rem', color: '#1e293b' }}>Attendance Logs</h4>
                <span className="pill" style={{ background: '#e0e7ff', color: '#4338ca', fontSize: '0.75rem', fontWeight: 'bold' }}>
                  Live stats: {attendance.summary || '97% weekly'}
                </span>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className="premium-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Check-In</th>
                      <th>Check-Out</th>
                      <th>Break</th>
                      <th>Total Hours</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {status.history && status.history.length > 0 ? (
                      [...status.history].reverse().map((h, i) => (
                        <tr key={i}>
                          <td style={{ fontWeight: 600 }}>{h.date}</td>
                          <td>{h.checkInTime}</td>
                          <td>{h.checkOutTime || 'Active'}</td>
                          <td>{h.breakDuration} mins</td>
                          <td>{h.totalHours} hrs</td>
                          <td>
                            <span className="pill" style={{
                              background: h.status === 'On Time' ? '#dcfce7' : '#fef3c7',
                              color: h.status === 'On Time' ? '#16a34a' : '#d97706',
                              fontSize: '0.75rem',
                              padding: '4px 8px'
                            }}>
                              {h.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', color: '#64748b', padding: '20px' }}>
                          No attendance logs recorded yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'regularize' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '24px' }}>
              <div style={{ background: 'rgba(248, 250, 252, 0.5)', padding: '20px', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                <h4 style={{ marginTop: 0, marginBottom: '16px', fontSize: '0.95rem' }}>Request Clock Time Correction</h4>

                {regSuccessMessage && (
                  <div className="success-alert">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    {regSuccessMessage}
                  </div>
                )}

                <form onSubmit={handleRegularizeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div className="form-group">
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '4px', display: 'block' }}>Date</label>
                    <input
                      type="date"
                      value={regDate}
                      onChange={(e) => setRegDate(e.target.value)}
                      required
                      style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', width: '100%' }}
                    />
                  </div>
                  <div className="regularize-grid">
                    <div className="form-group">
                      <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '4px', display: 'block' }}>Clock In</label>
                      <input
                        type="text"
                        value={regCheckIn}
                        onChange={(e) => setRegCheckIn(e.target.value)}
                        placeholder="e.g. 09:15 am"
                        required
                        style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', width: '100%' }}
                      />
                    </div>
                    <div className="form-group">
                      <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '4px', display: 'block' }}>Clock Out</label>
                      <input
                        type="text"
                        value={regCheckOut}
                        onChange={(e) => setRegCheckOut(e.target.value)}
                        placeholder="e.g. 06:00 pm"
                        required
                        style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', width: '100%' }}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '4px', display: 'block' }}>Reason</label>
                    <textarea
                      value={regReason}
                      onChange={(e) => setRegReason(e.target.value)}
                      placeholder="Why do you need correction?"
                      required
                      rows="3"
                      style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', width: '100%', resize: 'none' }}
                    />
                  </div>
                  <button
                    type="submit"
                    className="primary-button"
                    disabled={regSubmitting}
                    style={{ marginTop: '8px', padding: '10px 16px', fontSize: '0.85rem' }}
                  >
                    {regSubmitting ? 'Submitting...' : 'Submit Request'}
                  </button>
                </form>
              </div>

              <div>
                <h4 style={{ marginTop: 0, marginBottom: '16px', fontSize: '0.95rem' }}>My Requests</h4>
                <div style={{ overflowX: 'auto' }}>
                  <table className="premium-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Correction Times</th>
                        <th>Reason</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {regRequests && regRequests.length > 0 ? (
                        regRequests.map((r) => (
                          <tr key={r._id || r.id}>
                            <td style={{ fontWeight: 600 }}>{r.date}</td>
                            <td>
                              <span style={{ fontSize: '0.8rem' }}>{r.checkInTime} - {r.checkOutTime}</span>
                            </td>
                            <td><p style={{ margin: 0, fontSize: '0.8rem', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={r.reason}>{r.reason}</p></td>
                            <td>
                              <span className="pill" style={{
                                background: r.status === 'Approved' ? '#dcfce7' : (r.status === 'Rejected' ? '#fee2e2' : '#fef3c7'),
                                color: r.status === 'Approved' ? '#16a34a' : (r.status === 'Rejected' ? '#dc2626' : '#b45309'),
                                fontSize: '0.75rem'
                              }}>
                                {r.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" style={{ textAlign: 'center', color: '#64748b', padding: '20px' }}>
                            No correction requests found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'approvals' && isHR && (
            <div>
              <h4 style={{ marginTop: 0, marginBottom: '16px', fontSize: '0.95rem', color: '#1e293b' }}>
                Pending Attendance Corrections ({pendingRegs.length})
              </h4>
              <div style={{ overflowX: 'auto' }}>
                <table className="premium-table">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Date</th>
                      <th>Proposed Time</th>
                      <th>Reason</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingRegs && pendingRegs.length > 0 ? (
                      pendingRegs.map((r) => (
                        <tr key={r._id || r.id}>
                          <td><strong>{r.userName}</strong></td>
                          <td style={{ fontWeight: 600 }}>{r.date}</td>
                          <td>
                            <span className="pill" style={{ background: '#eef2ff', color: '#4338ca', fontSize: '0.75rem', fontWeight: 600 }}>
                              {r.checkInTime} - {r.checkOutTime}
                            </span>
                          </td>
                          <td>{r.reason}</td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '8px' }}>
                              <button
                                type="button"
                                className="primary-button"
                                onClick={() => handleApprovalDecision(r._id || r.id, 'Approved')}
                                disabled={actioningId === (r._id || r.id)}
                                style={{ padding: '6px 12px', background: '#16a34a', fontSize: '0.75rem', marginTop: 0 }}
                              >
                                {actioningId === (r._id || r.id) ? '...' : 'Approve'}
                              </button>
                              <button
                                type="button"
                                className="submit-button danger-btn"
                                onClick={() => handleApprovalDecision(r._id || r.id, 'Rejected')}
                                disabled={actioningId === (r._id || r.id)}
                                style={{ padding: '6px 12px', background: '#dc2626', fontSize: '0.75rem', marginTop: 0 }}
                              >
                                {actioningId === (r._id || r.id) ? '...' : 'Reject'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center', color: '#64748b', padding: '20px' }}>
                          No pending correction approvals at the moment.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function LeavePage({ leaveData, user, API_BASE, triggerRefresh }) {
  const [showForm, setShowForm] = useState(false);
  const [leaveType, setLeaveType] = useState('Sick leave');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE}/api/leave/request`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ name: user.name, type: leaveType, reason })
      });
      if (response.ok) {
        setReason('');
        setShowForm(false);
        if (triggerRefresh) triggerRefresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleApproveReject = async (id, status) => {
    try {
      const response = await fetch(`${API_BASE}/api/leave/approve`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ id, status })
      });
      if (response.ok) {
        if (triggerRefresh) triggerRefresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const isHR = user.role === 'hr' || user.role === 'super_admin';

  return (
    <section className="content-grid">
      <article className="panel-card">
        <div className="panel-header">
          <h3>Leave balance</h3>
          <span className="pill">{leaveData.balance}</span>
        </div>
        <ul className="list">
          {leaveData.items.map((item) => (
            <li key={item.label}>{item.label}: {item.value}</li>
          ))}
        </ul>

        <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
          {!showForm ? (
            <button
              type="button"
              className="primary-button"
              onClick={() => setShowForm(true)}
            >
              Apply for Leave
            </button>
          ) : (
            <form onSubmit={handleRequestSubmit} className="auth-form-new" style={{ gap: '12px' }}>
              <div className="form-group">
                <select value={leaveType} onChange={(e) => setLeaveType(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <option value="Sick leave">Sick leave</option>
                  <option value="Casual leave">Casual leave</option>
                  <option value="Annual leave">Annual leave</option>
                </select>
              </div>
              <div className="form-group">
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Reason for leave"
                  required
                  style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="submit-button" disabled={submitting} style={{ marginTop: 0, padding: '10px 16px', flex: 1 }}>
                  {submitting ? 'Submitting...' : 'Submit'}
                </button>
                <button type="button" className="google-login-button" onClick={() => setShowForm(false)} style={{ marginBottom: 0, padding: '10px 16px', flex: 1 }}>
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </article>
      <article className="panel-card">
        <div className="panel-header">
          <h3>Pending approvals</h3>
        </div>
        <ul className="approval-list" style={{ listStyleType: 'none', paddingLeft: 0, margin: 0 }}>
          {leaveData.requests.map((item) => (
            <li key={item.id || item.name} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', alignItems: 'center', columnGap: '16px', padding: '14px 0', borderBottom: '1px solid #e2e8f0', width: '100%' }}>
              <div style={{ minWidth: 0 }}>
                <strong>{item.name}</strong> - {item.type}
                <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>Reason: {item.reason}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end' }}>
                <span className={`subtle-pill status-${item.status.toLowerCase()}`} style={{ color: item.status === 'Approved' ? '#16a34a' : (item.status === 'Rejected' ? '#dc2626' : '#d97706'), background: item.status === 'Approved' ? '#dcfce7' : (item.status === 'Rejected' ? '#fee2e2' : '#fef3c7') }}>{item.status}</span>
                {isHR && item.status === 'Pending' && (
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      type="button"
                      onClick={() => handleApproveReject(item.id, 'Approved')}
                      style={{ padding: '6px 12px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer' }}
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApproveReject(item.id, 'Rejected')}
                      style={{ padding: '6px 12px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer' }}
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      </article>
    </section>
  )
}

function PayrollPage({ payroll, API_BASE, triggerRefresh, user }) {
  const [payrollActionMessage, setPayrollActionMessage] = useState('')
  const [payrollActionError, setPayrollActionError] = useState('')
  const [payrollActionLoading, setPayrollActionLoading] = useState('')
  const [employeePayroll, setEmployeePayroll] = useState([])
  const [selectedPayrollId, setSelectedPayrollId] = useState('')
  const [isEditingPayroll, setIsEditingPayroll] = useState(false)
  const [editBankName, setEditBankName] = useState('')
  const [editAccountNumber, setEditAccountNumber] = useState('')
  const [editIfsc, setEditIfsc] = useState('')
  const [editBaseSalary, setEditBaseSalary] = useState(0)
  const [editBonus, setEditBonus] = useState(0)
  const [editDeductions, setEditDeductions] = useState(0)

  const isAdmin = user?.role === 'super_admin' || user?.role === 'hr'

  const payrollStats = [
    { label: 'Gross pay', value: '$5,470', detail: 'before deductions', icon: 'GP', grad: 'linear-gradient(135deg,#0ea5e9,#6366f1)' },
    { label: 'Net salary', value: payroll.items.find((item) => item.label === 'Net salary')?.value || '$4,820', detail: 'ready to release', icon: 'NS', grad: 'linear-gradient(135deg,#10b981,#059669)' },
    { label: 'Tax withheld', value: '$420', detail: 'statutory estimate', icon: 'TX', grad: 'linear-gradient(135deg,#f59e0b,#ef4444)' },
    { label: 'Pay cycle', value: 'Monthly', detail: 'closes Jun 25', icon: 'PC', grad: 'linear-gradient(135deg,#8b5cf6,#6366f1)' }
  ]

  const payrollTimeline = [
    { label: 'Timesheets locked', date: '2026-06-20', status: 'Done' },
    { label: 'Finance verification', date: '2026-06-23', status: 'Done' },
    { label: 'Bank file prepared', date: '2026-06-24', status: 'Ready' },
    { label: 'Employee payslips sent', date: '2026-06-25', status: payroll.status }
  ]

  const complianceChecks = [
    { label: 'PF / benefits matched', status: 'Clear' },
    { label: 'Tax declarations reviewed', status: 'Clear' },
    { label: 'Reimbursements included', status: '2 pending' },
    { label: 'Bank account validation', status: 'Clear' }
  ]

  const departmentSplit = [
    { label: 'Engineering', value: '$2,140', pct: 44, color: '#6366f1' },
    { label: 'Operations', value: '$1,210', pct: 25, color: '#0ea5e9' },
    { label: 'HR', value: '$760', pct: 16, color: '#10b981' },
    { label: 'Sales', value: '$710', pct: 15, color: '#f59e0b' }
  ]

  const payrollActions = [
    { label: 'Generate slips', action: 'generate_slips' },
    { label: 'Review bonuses', action: 'review_bonuses' },
    { label: 'Approve reimbursements', action: 'approve_reimbursements' },
    { label: 'Bank transfer file', action: 'bank_transfer_file' }
  ]

  useEffect(() => {
    if (!API_BASE) return
    fetch(`${API_BASE}/api/payroll/employees`, { headers: authHeaders() })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('Unable to load employee payroll')))
      .then((rows) => {
        setEmployeePayroll(rows)
        setSelectedPayrollId((current) => current || rows[0]?.id || '')
      })
      .catch(() => setEmployeePayroll([]))
  }, [API_BASE])

  const selectedPayroll = employeePayroll.find((item) => item.id === selectedPayrollId) || employeePayroll[0]
  const canTransferPayroll = user?.role === 'hr' || user?.role === 'super_admin'

  useEffect(() => {
    if (selectedPayroll) {
      setEditBankName(selectedPayroll.bankName || '')
      setEditAccountNumber(selectedPayroll.accountNumber || '')
      setEditIfsc(selectedPayroll.ifsc || '')
      setEditBaseSalary(selectedPayroll.baseSalary || 0)
      setEditBonus(selectedPayroll.bonus || 0)
      setEditDeductions(selectedPayroll.deductions || 0)
      setIsEditingPayroll(false)
    }
  }, [selectedPayroll])

  const handleSavePayrollDetails = async () => {
    if (!selectedPayroll) return
    setPayrollActionLoading(`save-${selectedPayroll.id}`)
    setPayrollActionMessage('')
    setPayrollActionError('')
    try {
      const response = await fetch(`${API_BASE}/api/payroll/employees/${selectedPayroll.id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({
          bankName: editBankName,
          accountNumber: editAccountNumber,
          ifsc: editIfsc,
          baseSalary: editBaseSalary,
          bonus: editBonus,
          deductions: editDeductions
        })
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.message || 'Failed to update payroll details')

      setPayrollActionMessage(`Payroll details updated successfully for ${payload.name}!`)
      setEmployeePayroll((rows) => rows.map((row) => row.id === selectedPayroll.id ? payload : row))
      setIsEditingPayroll(false)
    } catch (error) {
      setPayrollActionError(error.message)
    } finally {
      setPayrollActionLoading('')
    }
  }

  const handleSalaryTransfer = async () => {
    if (!selectedPayroll) return
    setPayrollActionLoading(`transfer-${selectedPayroll.id}`)
    setPayrollActionMessage('')
    setPayrollActionError('')
    try {
      const response = await fetch(`${API_BASE}/api/payroll/transfer`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ employeeId: selectedPayroll.id })
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.message || 'Salary transfer failed')
      setPayrollActionMessage(`${payload.message} (${payload.transactionId})`)
      setEmployeePayroll((rows) => rows.map((row) => row.id === selectedPayroll.id ? payload.payroll : row))
      if (triggerRefresh) triggerRefresh()
    } catch (error) {
      setPayrollActionError(error.message === 'Failed to fetch' ? 'Backend unavailable. Start the server at http://localhost:5000.' : error.message)
    } finally {
      setPayrollActionLoading('')
    }
  }

  const handlePayrollAction = async (action) => {
    setPayrollActionLoading(action)
    setPayrollActionMessage('')
    setPayrollActionError('')

    // Client-side actions
    if (action === 'bank_transfer_file') {
      try {
        if (!employeePayroll || employeePayroll.length === 0) {
          throw new Error('No employees available for transfer')
        }
        const headers = ['Beneficiary Name', 'Bank Name', 'Account Number', 'IFSC Code', 'Amount', 'Currency', 'Payment Reference']
        const rows = employeePayroll.map(emp => [
          emp.name,
          emp.bankName || 'N/A',
          emp.accountNumber || 'N/A',
          emp.ifsc || 'N/A',
          emp.netSalary || 0,
          emp.currency || '$',
          `SALARY-${new Date().toISOString().slice(0, 7)}`
        ])
        const csv = [headers, ...rows]
          .map((row) => row.map(escapeCsvValue).join(','))
          .join('\n')

        downloadBlob(new Blob([csv], { type: 'text/csv;charset=utf-8;' }), `bank_transfer_${new Date().toISOString().slice(0, 10)}.csv`)
        setPayrollActionMessage('Bank transfer file downloaded securely.')
      } catch (error) {
        setPayrollActionError(error.message)
      } finally {
        setPayrollActionLoading('')
      }
      return
    }

    try {
      const response = await fetch(`${API_BASE}/api/payroll/action`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ action })
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.message || 'Payroll action failed')

      // Customize message based on action for better UX
      if (action === 'generate_slips') setPayrollActionMessage('Success: Payslips generated and emailed to all active employees.')
      else if (action === 'review_bonuses') setPayrollActionMessage('Success: Bonus review tasks assigned to department heads.')
      else if (action === 'approve_reimbursements') setPayrollActionMessage('Success: 12 pending reimbursements sent for final approval.')
      else setPayrollActionMessage(payload.message)

      if (triggerRefresh) triggerRefresh()
    } catch (error) {
      setPayrollActionError(error.message === 'Failed to fetch' ? 'Backend unavailable. Start the server at http://localhost:5000.' : error.message)
    } finally {
      setPayrollActionLoading('')
    }
  }

  const handlePayrollExport = async () => {
    setPayrollActionLoading('export')
    setPayrollActionMessage('')
    setPayrollActionError('')
    try {
      const response = await fetch(`${API_BASE}/api/payroll/export`, { headers: authDownloadHeaders() })
      if (!response.ok) throw new Error('Failed to export payroll data.')
      const blob = await response.blob()
      downloadBlob(blob, 'payroll.csv')
      setPayrollActionMessage('Payroll CSV exported')
    } catch {
      const headers = ['Label', 'Value']
      const rows = [
        ...payroll.items.map((item) => [item.label, item.value]),
        ...payroll.payslips.map((item) => [item.name, item.date])
      ]
      const csv = [headers, ...rows]
        .map((row) => row.map(escapeCsvValue).join(','))
        .join('\n')
      downloadBlob(new Blob([csv], { type: 'text/csv;charset=utf-8;' }), 'payroll.csv')
      setPayrollActionMessage('Backend unavailable, exported current payroll view')
    } finally {
      setPayrollActionLoading('')
    }
  }

  // ─── Employee-only view ────────────────────────────────────────────────────
  if (!isAdmin) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <section className="page-heading">
          <div>
            <p className="eyebrow">My Payroll</p>
            <h2>Salary &amp; Payslips</h2>
            <p className="helper-text" style={{ margin: 0 }}>View your salary summary and download your payslips.</p>
          </div>
        </section>

        {/* Personal salary summary cards */}
        <section className="stats-grid">
          {[
            { label: 'Net salary', value: payroll.items.find(i => i.label === 'Net salary')?.value || '$4,820', detail: 'this month', icon: 'NS', grad: 'linear-gradient(135deg,#10b981,#059669)' },
            { label: 'Bonus', value: payroll.items.find(i => i.label === 'Bonus')?.value || '$480', detail: 'included', icon: 'BN', grad: 'linear-gradient(135deg,#f59e0b,#ef4444)' },
            { label: 'Deductions', value: payroll.items.find(i => i.label === 'Deductions')?.value || '$170', detail: 'this cycle', icon: 'DX', grad: 'linear-gradient(135deg,#8b5cf6,#6366f1)' },
            { label: 'Pay cycle', value: 'Monthly', detail: 'closes Jun 25', icon: 'PC', grad: 'linear-gradient(135deg,#0ea5e9,#6366f1)' },
          ].map(card => (
            <article key={card.label} className="stat-card">
              <div className="stat-icon" style={{ background: card.grad, color: '#fff', fontSize: '0.78rem', fontWeight: 800 }}>{card.icon}</div>
              <p>{card.label}</p>
              <h3>{card.value}</h3>
              <span>{card.detail}</span>
              <div className="card-gradient-band" />
            </article>
          ))}
        </section>

        <section className="content-grid">
          {/* Monthly breakdown */}
          <article className="panel-card">
            <div className="panel-header">
              <h3>Monthly payroll</h3>
              <span className="pill">{payroll.status}</span>
            </div>
            <ul className="list">
              {payroll.items.map(item => (
                <li key={item.label}>{item.label}: {item.value}</li>
              ))}
            </ul>
          </article>

          {/* Recent payslips */}
          <article className="panel-card">
            <div className="panel-header">
              <h3>Recent payslips</h3>
              <span className="subtle-pill">{payroll.payslips.length} files</span>
            </div>
            <ul className="list">
              {payroll.payslips.map(item => (
                <li key={item.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{item.name}</span>
                  <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{item.date}</span>
                </li>
              ))}
            </ul>
            <p className="helper-text" style={{ marginTop: '12px', fontSize: '0.78rem' }}>
              Contact HR to download or dispute a payslip.
            </p>
          </article>
        </section>
      </div>
    )
  }

  // ─── Admin / HR full payroll dashboard ────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <section className="page-heading">
        <div>
          <p className="eyebrow">Payroll workspace</p>
          <h2>Monthly compensation control</h2>
          <p className="helper-text" style={{ margin: 0 }}>Track payouts, compliance, payslips, and department payroll exposure.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <button type="button" className="ghost-button" onClick={handlePayrollExport} disabled={payrollActionLoading === 'export'}>
            {payrollActionLoading === 'export' ? 'Exporting...' : 'Export CSV'}
          </button>
          <button type="button" className="primary-button" onClick={() => handlePayrollAction('release')} disabled={payrollActionLoading === 'release'}>
            {payrollActionLoading === 'release' ? 'Releasing...' : 'Release Payroll'}
          </button>
        </div>
      </section>

      {(payrollActionMessage || payrollActionError) && (
        <div className={`feather-badge ${payrollActionError ? 'danger' : 'success'}`} style={{ alignSelf: 'flex-start' }}>
          {payrollActionError || payrollActionMessage}
        </div>
      )}

      <section className="stats-grid">
        {payrollStats.map((card) => (
          <article key={card.label} className="stat-card">
            <div className="stat-icon" style={{ background: card.grad, color: '#fff', fontSize: '0.78rem', fontWeight: 800 }}>
              {card.icon}
            </div>
            <p>{card.label}</p>
            <h3>{card.value}</h3>
            <span>{card.detail}</span>
            <div className="card-gradient-band" />
          </article>
        ))}
      </section>

      <section className="content-grid">
        <article className="panel-card">
          <div className="panel-header">
            <h3>Employee salary transfer</h3>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {selectedPayroll && canTransferPayroll && (
                <button
                  type="button"
                  onClick={() => setIsEditingPayroll(!isEditingPayroll)}
                  style={{
                    border: 'none',
                    background: 'none',
                    color: '#6366f1',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 8px',
                    borderRadius: '8px',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.background = 'rgba(99, 102, 241, 0.08)'}
                  onMouseLeave={(e) => e.target.style.background = 'none'}
                >
                  {isEditingPayroll ? 'Cancel' : '✏️ Edit details'}
                </button>
              )}
              <span className="pill">{employeePayroll.length} employees</span>
            </div>
          </div>
          {employeePayroll.length ? (
            <div style={{ display: 'grid', gap: '14px' }}>
              <div className="form-group">
                <label>Select employee</label>
                <select value={selectedPayroll?.id || ''} onChange={(event) => setSelectedPayrollId(event.target.value)} disabled={isEditingPayroll}>
                  {employeePayroll.map((item) => (
                    <option key={item.id} value={item.id}>{item.name} - {item.department}</option>
                  ))}
                </select>
              </div>

              {selectedPayroll && isEditingPayroll ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '10px' }}>
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label style={{ fontSize: '0.78rem' }}>Bank Name</label>
                    <input type="text" value={editBankName} onChange={(e) => setEditBankName(e.target.value)} style={{ padding: '8px 12px', fontSize: '0.9rem' }} />
                  </div>
                  <div className="form-group">
                    <label style={{ fontSize: '0.78rem' }}>Account Number</label>
                    <input type="text" value={editAccountNumber} onChange={(e) => setEditAccountNumber(e.target.value)} style={{ padding: '8px 12px', fontSize: '0.9rem' }} />
                  </div>
                  <div className="form-group">
                    <label style={{ fontSize: '0.78rem' }}>IFSC Code</label>
                    <input type="text" value={editIfsc} onChange={(e) => setEditIfsc(e.target.value)} style={{ padding: '8px 12px', fontSize: '0.9rem' }} />
                  </div>
                  <div className="form-group">
                    <label style={{ fontSize: '0.78rem' }}>Base Salary</label>
                    <input type="number" value={editBaseSalary} onChange={(e) => setEditBaseSalary(Number(e.target.value))} style={{ padding: '8px 12px', fontSize: '0.9rem' }} />
                  </div>
                  <div className="form-group">
                    <label style={{ fontSize: '0.78rem' }}>Bonus</label>
                    <input type="number" value={editBonus} onChange={(e) => setEditBonus(Number(e.target.value))} style={{ padding: '8px 12px', fontSize: '0.9rem' }} />
                  </div>
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label style={{ fontSize: '0.78rem' }}>Deductions</label>
                    <input type="number" value={editDeductions} onChange={(e) => setEditDeductions(Number(e.target.value))} style={{ padding: '8px 12px', fontSize: '0.9rem' }} />
                  </div>
                  <button
                    type="button"
                    className="primary-button"
                    onClick={handleSavePayrollDetails}
                    disabled={payrollActionLoading === `save-${selectedPayroll.id}`}
                    style={{ gridColumn: 'span 2', justifyContent: 'center', borderRadius: '12px', marginTop: '5px', background: 'linear-gradient(135deg, #10b981, #059669)' }}
                  >
                    {payrollActionLoading === `save-${selectedPayroll.id}` ? 'Saving...' : '💾 Save Changes'}
                  </button>
                </div>
              ) : selectedPayroll ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '10px' }}>
                  <div className="subtle-pill" style={{ justifyContent: 'space-between', borderRadius: '12px' }}>Role <strong>{selectedPayroll.role}</strong></div>
                  <div className="subtle-pill" style={{ justifyContent: 'space-between', borderRadius: '12px' }}>Bank <strong>{selectedPayroll.bankName}</strong></div>
                  <div className="subtle-pill" style={{ justifyContent: 'space-between', borderRadius: '12px' }}>Account <strong>{selectedPayroll.accountNumber}</strong></div>
                  <div className="subtle-pill" style={{ justifyContent: 'space-between', borderRadius: '12px' }}>IFSC <strong>{selectedPayroll.ifsc}</strong></div>
                  <div className="subtle-pill" style={{ justifyContent: 'space-between', borderRadius: '12px' }}>Gross <strong>{selectedPayroll.currency}{selectedPayroll.baseSalary + selectedPayroll.bonus}</strong></div>
                  <div className="subtle-pill" style={{ justifyContent: 'space-between', borderRadius: '12px' }}>Net <strong>{selectedPayroll.currency}{selectedPayroll.netSalary}</strong></div>
                </div>
              ) : null}

              {!isEditingPayroll && (
                <button type="button" className="primary-button" onClick={handleSalaryTransfer} disabled={!canTransferPayroll || !selectedPayroll || payrollActionLoading === `transfer-${selectedPayroll?.id}`} style={{ justifyContent: 'center', borderRadius: '12px' }}>
                  {payrollActionLoading === `transfer-${selectedPayroll?.id}` ? 'Transferring...' : 'Transfer Salary'}
                </button>
              )}
              {!canTransferPayroll && <p className="helper-text" style={{ margin: 0 }}>Only HR and Super Admin can transfer salary.</p>}
            </div>
          ) : (
            <p className="helper-text">No active employees are available for payroll transfer.</p>
          )}
        </article>

        <article className="panel-card">
          <div className="panel-header">
            <h3>Transfer process</h3>
            <span className="feather-badge info">Admin controlled</span>
          </div>
          <ul className="list">
            <li>1. HR selects an active employee.</li>
            <li>2. Admin-reviewed salary, bonus, deductions, and bank details are shown.</li>
            <li>3. HR clicks Transfer Salary.</li>
            <li>4. Backend records the action, sends a live payroll update, and returns a transaction ID.</li>
          </ul>
        </article>
      </section>
      <section className="content-grid">
        <article className="panel-card">
          <div className="panel-header">
            <h3>Monthly payroll</h3>
            <span className="pill">{payroll.status}</span>
          </div>
          <ul className="list">
            {payroll.items.map((item) => (
              <li key={item.label}>{item.label}: {item.value}</li>
            ))}
          </ul>
        </article>

        <article className="panel-card">
          <div className="panel-header">
            <h3>Recent payslips</h3>
            <span className="subtle-pill">{payroll.payslips.length} files</span>
          </div>
          <ul className="list">
            {payroll.payslips.map((item) => (
              <li key={item.name}>{item.name}  {item.date}</li>
            ))}
          </ul>
        </article>
      </section>

      <section className="content-grid">
        <article className="panel-card">
          <div className="panel-header">
            <h3>Payroll timeline</h3>
            <span className="feather-badge success">On schedule</span>
          </div>
          <ul className="list">
            {payrollTimeline.map((item) => (
              <li key={item.label}>
                <span style={{ fontWeight: 700, color: '#334155' }}>{item.label}</span>
                <span style={{ float: 'right', color: '#94a3b8' }}>{item.date}  {item.status}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="panel-card">
          <div className="panel-header">
            <h3>Compliance checks</h3>
            <span className="feather-badge info">Audit ready</span>
          </div>
          <ul className="list">
            {complianceChecks.map((item) => (
              <li key={item.label}>{item.label}: {item.status}</li>
            ))}
          </ul>
        </article>
      </section>

      <section className="content-grid">
        <article className="panel-card">
          <div className="panel-header">
            <h3>Department split</h3>
            <span className="subtle-pill">$4,820 total</span>
          </div>
          <div className="dept-list">
            {departmentSplit.map((dept) => (
              <div key={dept.label} className="dept-item">
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span className="dept-name">{dept.label}</span>
                    <span style={{ fontSize: '0.73rem', color: '#94a3b8', fontWeight: 600 }}>{dept.value}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div className="dept-bar-container">
                      <div className="dept-bar-value" style={{ width: `${dept.pct}%`, background: dept.color }} />
                    </div>
                    <span className="dept-percent-text">{dept.pct}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="panel-card">
          <div className="panel-header">
            <h3>Quick actions</h3>
            <span className="pill">Finance</span>
          </div>
          <div className="feature-grid" style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', marginTop: 0 }}>
            {payrollActions.map((item) => (
              <button key={item.action} type="button" className="ghost-button" onClick={() => handlePayrollAction(item.action)} disabled={payrollActionLoading === item.action} style={{ justifyContent: 'center', borderRadius: '12px' }}>
                {payrollActionLoading === item.action ? 'Working...' : item.label}
              </button>
            ))}
          </div>
        </article>
      </section>
    </div>
  )
}

function RecruitmentPage({ recruitment, user, API_BASE, triggerRefresh }) {
  const [showModal, setShowModal] = useState(false);
  const [newRoleTitle, setNewRoleTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isAdmin = user?.role === 'super_admin' || user?.role === 'hr';

  // Mapping for pipeline stats to give them icons and gradients
  const pipelineConfig = {
    'Applicants': { icon: 'AP', grad: 'linear-gradient(135deg, #6366f1, #8b5cf6)' },
    'Interviews': { icon: 'IN', grad: 'linear-gradient(135deg, #0ea5e9, #3b82f6)' },
    'Offers': { icon: 'OF', grad: 'linear-gradient(135deg, #10b981, #059669)' }
  };

  const getStageColor = (stage) => {
    const s = (stage || '').toLowerCase();
    if (s.includes('screen')) return { bg: '#fef3c7', color: '#d97706' };
    if (s.includes('hr') || s.includes('interview')) return { bg: '#e0e7ff', color: '#4338ca' };
    if (s.includes('offer')) return { bg: '#dcfce7', color: '#16a34a' };
    if (s.includes('hire') || s.includes('accept')) return { bg: '#dcfce7', color: '#16a34a' };
    return { bg: '#f1f5f9', color: '#475569' };
  };

  const STAGE_PROGRESSION = ['Screening', 'HR Round', 'Technical Interview', 'Final Round', 'Offer Extended', 'Hired'];

  const handleAddRole = async (e) => {
    e.preventDefault();
    if (!newRoleTitle.trim()) return;
    setIsSubmitting(true);
    setError('');

    try {
      const token = window.localStorage.getItem('ems-token');
      const response = await fetch(`${API_BASE}/api/recruitment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ title: newRoleTitle.trim() })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to add role');

      setShowModal(false);
      setNewRoleTitle('');
      if (triggerRefresh) triggerRefresh();
    } catch (err) {
      setError(err.message === 'Failed to fetch' ? 'Backend unavailable.' : err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdvanceStage = async (job) => {
    if (!isAdmin) return;
    const currentIndex = STAGE_PROGRESSION.indexOf(job.stage);
    if (currentIndex === -1 || currentIndex >= STAGE_PROGRESSION.length - 1) return;

    const nextStage = STAGE_PROGRESSION[currentIndex + 1];

    try {
      const token = window.localStorage.getItem('ems-token');
      const response = await fetch(`${API_BASE}/api/recruitment/${job.id}/stage`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ stage: nextStage })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to update stage');

      if (triggerRefresh) triggerRefresh();
    } catch (err) {
      alert(err.message === 'Failed to fetch' ? 'Backend unavailable.' : err.message);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative' }}>
      <section className="page-heading">
        <div>
          <p className="eyebrow">Talent acquisition</p>
          <h2>Recruitment Pipeline</h2>
          <p className="helper-text" style={{ margin: 0 }}>
            Track open positions, applicant funnels, and interview stages.
          </p>
        </div>
        {isAdmin && (
          <button type="button" className="primary-button" onClick={() => setShowModal(true)}>
            + New Requisition
          </button>
        )}
      </section>

      {/* Pipeline Health Stats */}
      <section className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        {recruitment.pipeline.map((item) => {
          const config = pipelineConfig[item.label] || { icon: 'PI', grad: 'linear-gradient(135deg, #94a3b8, #64748b)' };
          return (
            <article key={item.label} className="stat-card">
              <div className="stat-icon" style={{ background: config.grad, color: '#fff', fontSize: '0.85rem', fontWeight: 800 }}>
                {config.icon}
              </div>
              <p>{item.label}</p>
              <h3>{item.value}</h3>
              <div className="card-gradient-band" />
            </article>
          );
        })}
      </section>

      {/* Open Positions List */}
      <section className="panel-card">
        <div className="panel-header">
          <h3>Active Positions</h3>
          <span className="pill">{recruitment.openRoles} total</span>
        </div>

        {recruitment.positions && recruitment.positions.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recruitment.positions.map((job) => {
              const stageMeta = getStageColor(job.stage);
              const canAdvance = isAdmin && STAGE_PROGRESSION.indexOf(job.stage) < STAGE_PROGRESSION.length - 1;
              return (
                <div key={job.title} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '16px 20px', background: '#f8fafc', borderRadius: '12px',
                  border: '1px solid #e2e8f0', transition: 'all 0.2s', cursor: canAdvance ? 'pointer' : 'default'
                }}
                  onMouseEnter={e => Object.assign(e.currentTarget.style, { transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' })}
                  onMouseLeave={e => Object.assign(e.currentTarget.style, { transform: 'none', boxShadow: 'none' })}
                  onClick={() => handleAdvanceStage(job)}
                  title={canAdvance ? `Click to advance to ${STAGE_PROGRESSION[STAGE_PROGRESSION.indexOf(job.stage) + 1]}` : ''}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, #e0e7ff, #f3e8ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4f46e5', fontWeight: 800, fontSize: '0.9rem' }}>
                      {job.title.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 style={{ margin: 0, color: '#1e293b', fontSize: '1rem', fontWeight: 700 }}>{job.title}</h4>
                      <p style={{ margin: '2px 0 0', color: '#64748b', fontSize: '0.8rem' }}>Full-time • Remote/Hybrid</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <span style={{
                      padding: '6px 12px', borderRadius: '20px',
                      background: stageMeta.bg, color: stageMeta.color,
                      fontSize: '0.75rem', fontWeight: 700, whiteSpace: 'nowrap'
                    }}>
                      {job.stage}
                    </span>
                    {canAdvance && (
                      <button type="button" style={{
                        background: 'none', border: 'none', color: '#94a3b8',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
            <p>No active recruitment positions.</p>
          </div>
        )}
      </section>

      {/* New Requisition Modal */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '440px', padding: '32px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>New Job Requisition</h3>
                <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.85rem' }}>Open a new position for hiring.</p>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '4px' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            {error && <div className="feather-badge danger" style={{ marginBottom: '16px', display: 'flex' }}>{error}</div>}

            <form onSubmit={handleAddRole}>
              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label>Job Title</label>
                <input
                  type="text"
                  value={newRoleTitle}
                  onChange={(e) => setNewRoleTitle(e.target.value)}
                  placeholder="e.g. Senior Backend Engineer"
                  autoFocus
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" className="ghost-button" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="primary-button" disabled={isSubmitting || !newRoleTitle.trim()}>
                  {isSubmitting ? 'Opening...' : 'Open Position'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function ProjectsPage({ projects, employees = [], user, API_BASE, triggerRefresh, socket }) {
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [summary, setSummary] = useState('');
  const [owner, setOwner] = useState('');
  const [deadline, setDeadline] = useState('');
  const [budget, setBudget] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!socket) return;

    const handleProjectAdded = () => {
      if (triggerRefresh) triggerRefresh();
    };

    socket.on('project_added', handleProjectAdded);

    return () => {
      socket.off('project_added', handleProjectAdded);
    };
  }, [socket, triggerRefresh]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !summary) return;
    setSubmitting(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE}/api/projects`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ name, summary, owner, deadline, budget })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to create project');

      setName('');
      setSummary('');
      setOwner('');
      setDeadline('');
      setBudget('');
      setShowModal(false);
      // Backend emits project_added, triggering the socket listener to refresh
    } catch (err) {
      setError(err.message === 'Failed to fetch' ? 'Backend unavailable.' : err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const isHR = user.role === 'hr' || user.role === 'super_admin';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative' }}>
      <section className="page-heading">
        <div>
          <p className="eyebrow">Project Management</p>
          <h2>Active Projects</h2>
          <p className="helper-text" style={{ margin: 0 }}>
            Track cross-functional initiatives, budgets, and deadlines in real-time.
          </p>
        </div>
        {isHR && (
          <button type="button" className="primary-button" onClick={() => setShowModal(true)}>
            + Add New Project
          </button>
        )}
      </section>

      <section className="content-grid">
        {projects.map((project) => (
          <article key={project.name || project._id} className="panel-card" style={{ transition: 'transform 0.2s', cursor: 'pointer' }}
            onMouseEnter={e => Object.assign(e.currentTarget.style, { transform: 'translateY(-2px)', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)' })}
            onMouseLeave={e => Object.assign(e.currentTarget.style, { transform: 'none', boxShadow: 'none' })}
          >
            <div className="panel-header" style={{ marginBottom: '12px' }}>
              <h3 style={{ fontSize: '1.1rem', color: '#0f172a' }}>{project.name}</h3>
              <span className="pill" style={{ background: '#e0e7ff', color: '#4338ca' }}>{project.progress || '0%'}</span>
            </div>

            <p className="panel-copy" style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '20px', lineHeight: '1.5' }}>
              {project.summary}
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: 'auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f1f5f9', padding: '6px 10px', borderRadius: '8px', fontSize: '0.8rem', color: '#475569' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                {project.owner || 'Unassigned'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#fef2f2', padding: '6px 10px', borderRadius: '8px', fontSize: '0.8rem', color: '#b91c1c' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                {project.deadline || 'No deadline'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#ecfdf5', padding: '6px 10px', borderRadius: '8px', fontSize: '0.8rem', color: '#047857' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                {project.budget || 'N/A'}
              </div>
            </div>
          </article>
        ))}
      </section>

      {/* New Project Modal */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '500px', padding: '32px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>Add New Project</h3>
                <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.85rem' }}>Create a new cross-functional initiative.</p>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '4px' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            {error && <div className="feather-badge danger" style={{ marginBottom: '16px', display: 'flex' }}>{error}</div>}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label>Project Name <span style={{ color: '#ef4444' }}>*</span></label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Q4 Marketing Campaign" autoFocus required />
              </div>
              <div className="form-group">
                <label>Summary <span style={{ color: '#ef4444' }}>*</span></label>
                <textarea value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Brief description of the project goals" rows="3" required style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.9rem', color: '#334155', fontFamily: 'inherit', resize: 'vertical' }}></textarea>
              </div>

              <div className="form-group">
                <label>Project Owner <span style={{ color: '#ef4444' }}>*</span></label>
                <select value={owner} onChange={(e) => setOwner(e.target.value)} required style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.9rem', color: '#334155' }}>
                  <option value="">Select Employee</option>
                  {employees.map((emp) => (
                    <option key={emp._id || emp.id} value={emp.name}>
                      {emp.name} ({emp.role || 'Employee'})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label>Deadline</label>
                  <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Budget</label>
                  <input type="text" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="e.g. $45,000" />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button type="button" className="ghost-button" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="primary-button" disabled={submitting || !name || !summary}>
                  {submitting ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function ChatPage({ notifications, user, API_BASE, socket, activeUsers }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [inCall, setInCall] = useState(false);
  const [meetings, setMeetings] = useState([]);
  const [currentMeetingId, setCurrentMeetingId] = useState(null);
  const [typingUsers, setTypingUsers] = useState({});
  const [isTypingLocal, setIsTypingLocal] = useState(false);
  const typingTimeoutRef = useRef(null);

  const fetchMeetings = useCallback(() => {
    fetch(`${API_BASE}/api/meetings`, { headers: authHeaders() })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setMeetings(data);
      })
      .catch(() => { });
  }, [API_BASE]);

  useEffect(() => {
    if (!API_BASE) return;
    fetch(`${API_BASE}/api/chat/messages`, { headers: authHeaders() })
      .then((res) => res.json())
      .then((data) => setMessages(data))
      .catch(() => { });

    fetchMeetings();
  }, [API_BASE, fetchMeetings]);

  useEffect(() => {
    if (!socket) return;

    const handleChatMessage = (msg) => {
      setMessages((prev) => [...prev, msg]);
    };

    const handleMeetingUpdate = () => {
      fetchMeetings();
    };

    const handleTypingStatus = ({ name, isTyping }) => {
      if (name === user.name) return;
      setTypingUsers((prev) => {
        const updated = { ...prev };
        if (isTyping) {
          updated[name] = true;
        } else {
          delete updated[name];
        }
        return updated;
      });
    };

    socket.on('chat_message', handleChatMessage);
    socket.on('meeting_updated', handleMeetingUpdate);
    socket.on('typing_status', handleTypingStatus);

    return () => {
      socket.off('chat_message', handleChatMessage);
      socket.off('meeting_updated', handleMeetingUpdate);
      socket.off('typing_status', handleTypingStatus);
    };
  }, [socket, fetchMeetings, user.name]);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setNewMessage(val);

    if (!socket) return;

    if (!isTypingLocal && val.trim().length > 0) {
      setIsTypingLocal(true);
      socket.emit('typing', { name: user.name, isTyping: true });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTypingLocal(false);
      socket.emit('typing', { name: user.name, isTyping: false });
    }, 2000);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket) return;

    socket.emit('send_message', {
      sender: user.name,
      text: newMessage
    });

    if (isTypingLocal) {
      setIsTypingLocal(false);
      socket.emit('typing', { name: user.name, isTyping: false });
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    setNewMessage('');
  };

  const handleJoinMeeting = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/meetings`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ title: 'Group Standup Room' })
      });
      const data = await response.json();
      if (response.ok) {
        setCurrentMeetingId(data._id);
        setInCall(true);
      }
    } catch (err) {
      console.error(err);
      setInCall(true); // Still allow joining if API fails
    }
  };

  const handleLeaveMeeting = async () => {
    setInCall(false);
    if (currentMeetingId) {
      try {
        await fetch(`${API_BASE}/api/meetings/${currentMeetingId}/end`, {
          method: 'PUT',
          headers: authHeaders()
        });
        setCurrentMeetingId(null);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const meetingRoomUrl = `https://meet.jit.si/EMS-Team-Collaboration-Room`;

  return (
    <section className="content-grid" style={{ gridTemplateColumns: inCall ? '1fr 2fr' : '1fr 1fr' }}>
      <article className="panel-card" style={{ display: 'flex', flexDirection: 'column', height: inCall ? '600px' : '480px' }}>
        <div className="panel-header">
          <h3>Team collaboration</h3>
          <span className="pill">Live Chat</span>
        </div>

        <div className="chat-messages" style={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
          {messages.map((msg, index) => {
            const isMe = msg.sender === user.name;
            return (
              <div key={index} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '85%', display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '2px' }}>{msg.sender}  {msg.time}</span>
                <div style={{ background: isMe ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : '#f1f5f9', color: isMe ? '#fff' : '#1e293b', padding: '8px 14px', borderRadius: isMe ? '16px 16px 2px 16px' : '16px 16px 16px 2px', fontSize: '0.95rem', wordBreak: 'break-word' }}>
                  {msg.text}
                </div>
              </div>
            );
          })}
          {Object.keys(typingUsers).length > 0 && (
            <div style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '6px', color: '#6366f1', fontSize: '0.85rem', fontStyle: 'italic', padding: '5px 10px' }}>
              <span className="glow-dot" style={{ width: '6px', height: '6px', margin: 0 }} />
              <span>{Object.keys(typingUsers).join(', ')} {Object.keys(typingUsers).length === 1 ? 'is' : 'are'} typing...</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
          <input
            type="text"
            value={newMessage}
            onChange={handleInputChange}
            placeholder="Type your message..."
            required
            style={{ flexGrow: 1, padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: '10px', outline: 'none', fontSize: '0.95rem' }}
          />
          <button type="submit" className="primary-button" style={{ borderRadius: '10px', padding: '10px 20px' }}>
            Send
          </button>
        </form>
      </article>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <article className="panel-card" style={{ flexGrow: inCall ? 1 : 0, display: 'flex', flexDirection: 'column', minHeight: inCall ? '600px' : 'auto' }}>
          <div className="panel-header">
            <h3>Live Video Meeting</h3>
            {inCall && <span className="pill" style={{ background: '#dcfce7', color: '#16a34a' }}>Ongoing</span>}
          </div>

          {!inCall ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '30px 20px', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '12px', marginTop: '10px' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', color: '#6366f1' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="23 7 16 12 23 17 23 7"></polygon>
                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                </svg>
              </div>
              <h4 style={{ margin: '0 0 8px 0', color: '#1e293b' }}>Group Standup Room</h4>
              <p style={{ margin: '0 0 20px 0', color: '#64748b', fontSize: '0.9rem' }}>Join the live team video call. No external software required.</p>
              <button
                type="button"
                className="primary-button"
                onClick={handleJoinMeeting}
                style={{ borderRadius: '24px', padding: '10px 24px', background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none' }}
              >
                Join Meeting Now
              </button>
            </div>
          ) : (
            <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', marginTop: '10px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
              <iframe
                allow="camera; microphone; display-capture; autoplay; clipboard-write"
                src={`${meetingRoomUrl}#userInfo.displayName="${encodeURIComponent(user.name)}"&config.prejoinPageEnabled=false`}
                style={{ width: '100%', height: '100%', border: '0', flexGrow: 1 }}
                title="Live Video Meeting"
              />
              <div style={{ padding: '10px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={handleLeaveMeeting}
                  style={{ padding: '8px 16px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}
                >
                  Leave Meeting
                </button>
              </div>
            </div>
          )}
        </article>

        {!inCall && (
          <>
            <article className="panel-card">
              <div className="panel-header">
                <h3>Active Team Members</h3>
                <span className="pill" style={{ background: '#dcfce7', color: '#16a34a' }}>
                  {activeUsers?.length || 0} Online
                </span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
                {activeUsers && activeUsers.length > 0 ? (
                  activeUsers.map((activeUser) => (
                    <div
                      key={activeUser.socketId}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '6px 12px',
                        borderRadius: '999px',
                        background: '#f8fafc',
                        border: '1px solid rgba(99, 102, 241, 0.15)',
                        fontSize: '0.85rem',
                        color: '#1e293b',
                        fontWeight: '600'
                      }}
                    >
                      <span
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: '#22c55e',
                          boxShadow: '0 0 8px #22c55e'
                        }}
                      />
                      {activeUser.name}
                      <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: '500', textTransform: 'capitalize' }}>
                        ({activeUser.role.replace('_', ' ')})
                      </span>
                    </div>
                  ))
                ) : (
                  <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '5px 0' }}>No other active team members online.</p>
                )}
              </div>
            </article>

            <article className="panel-card" style={{ flexGrow: 1 }}>
              <div className="panel-header">
                <h3>Meeting History</h3>
                <span className="pill" style={{ background: '#e0e7ff', color: '#4338ca' }}>{meetings.length} Total</span>
              </div>
              {meetings.length > 0 ? (
                <ul className="list" style={{ maxHeight: '200px', overflowY: 'auto', margin: 0, padding: 0 }}>
                  {meetings.map((meeting) => (
                    <li key={meeting._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                      <div>
                        <div style={{ color: '#0f172a', fontWeight: '500' }}>{meeting.title}</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Hosted by {meeting.organizer} • {new Date(meeting.startedAt).toLocaleString()}</div>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.75rem', padding: '4px 8px', borderRadius: '12px', background: meeting.status === 'Ongoing' ? '#dcfce7' : '#f1f5f9', color: meeting.status === 'Ongoing' ? '#16a34a' : '#475569', fontWeight: 'bold' }}>
                          {meeting.status}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', textAlign: 'center', marginTop: '20px' }}>No past meetings recorded.</p>
              )}
            </article>
          </>
        )}
      </div>
    </section>
  );
}

function SettingsPage({ user, setUser, API_BASE }) {
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
      <section className="page-heading" style={{ paddingBottom: '10px', borderBottom: '1px solid #e2e8f0', marginBottom: '10px' }}>
        <div>
          <p className="eyebrow">Account Configuration</p>
          <h2>Settings</h2>
          <p className="helper-text" style={{ margin: 0 }}>
            Manage your personal profile and security preferences.
          </p>
        </div>
      </section>

      {error && <div className="feather-badge danger">{error}</div>}

      <section className="content-grid" style={{ gridTemplateColumns: '1fr' }}>
        <article className="panel-card" style={{ padding: '30px' }}>
          <div className="panel-header" style={{ marginBottom: '24px' }}>
            <h3>Profile Information</h3>
            <span className="pill" style={{ background: '#e0e7ff', color: '#4338ca' }}>{user.role}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: getAvatarColor(user.name), color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold' }}>
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div style={{ flexGrow: 1 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#64748b', marginBottom: '6px', fontWeight: 600 }}>Display Name</label>
                {isEditing ? (
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input
                      type="text"
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', flexGrow: 1 }}
                      autoFocus
                    />
                    <button className="primary-button" onClick={handleSaveProfile} disabled={isSaving} style={{ padding: '8px 16px', borderRadius: '8px' }}>
                      {isSaving ? 'Saving...' : 'Save'}
                    </button>
                    <button className="ghost-button" onClick={() => { setIsEditing(false); setEditName(user.name); }} style={{ padding: '8px 16px' }}>
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '1.1rem', color: '#0f172a', fontWeight: 600 }}>{user.name}</span>
                    <button
                      onClick={() => setIsEditing(true)}
                      style={{ background: 'none', border: 'none', color: '#6366f1', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px' }}
                      title="Edit Name"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div style={{ height: '1px', background: '#f1f5f9', margin: '10px 0' }}></div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#64748b', marginBottom: '6px', fontWeight: 600 }}>Email Address</label>
                <div style={{ fontSize: '1rem', color: '#334155' }}>
                  {user.role === 'super_admin' ? '••••••••@ems.com' : user.email}
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#64748b', marginBottom: '6px', fontWeight: 600 }}>Authentication Method</label>
                <div style={{ fontSize: '1rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {user.isGoogle ? (
                    <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ea4335" strokeWidth="2"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg> Connected via Google</>
                  ) : (
                    <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg> Email & Password</>
                  )}
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#64748b', marginBottom: '6px', fontWeight: 600 }}>Timezone</label>
                <div style={{ fontSize: '1rem', color: '#334155' }}>UTC+5:30 (IST)</div>
              </div>

              {empProfile && (
                <>
                  <div style={{ height: '1px', background: '#f1f5f9', margin: '10px 0', gridColumn: '1 / -1' }}></div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', gridColumn: '1 / -1' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: '#64748b', marginBottom: '6px', fontWeight: 600 }}>Department</label>
                      <div style={{ fontSize: '1rem', color: '#334155', fontWeight: 500 }}>{empProfile.department || 'General'}</div>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: '#64748b', marginBottom: '6px', fontWeight: 600 }}>Designation / Role Title</label>
                      <div style={{ fontSize: '1rem', color: '#334155', fontWeight: 500 }}>{empProfile.role || 'Employee'}</div>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: '#64748b', marginBottom: '6px', fontWeight: 600 }}>Leave Balance</label>
                      <div style={{ fontSize: '1rem', color: '#334155', fontWeight: 500 }}>{empProfile.leaveBalance || 14} days</div>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: '#64748b', marginBottom: '6px', fontWeight: 600 }}>Employment Status</label>
                      <div style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: 8, height: 8, background: empProfile.status === 'Active' ? '#10b981' : '#f59e0b', borderRadius: '50%' }} />
                        <span style={{ color: '#334155', fontWeight: 500 }}>{empProfile.status || 'Active'}</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </article>

        <article className="panel-card" style={{ padding: '30px' }}>
          <div className="panel-header" style={{ marginBottom: '24px' }}>
            <h3>Security Controls</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { key: 'twoFactor', title: 'Two-Factor Authentication (2FA)', desc: 'Require a security code in addition to your password.' },
              { key: 'deviceManagement', title: 'Device Management', desc: 'Monitor and manage devices logged into your account.' },
              { key: 'auditLogs', title: 'Activity Audit Logs', desc: 'Keep a record of all sensitive actions performed on this account.' }
            ].map(setting => (
              <div key={setting.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div>
                  <h4 style={{ margin: '0 0 4px 0', color: '#0f172a', fontSize: '1rem' }}>{setting.title}</h4>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>{setting.desc}</p>
                </div>

                {/* Toggle Switch */}
                <button
                  onClick={() => handleToggle(setting.key)}
                  style={{
                    position: 'relative', width: '44px', height: '24px', borderRadius: '12px',
                    background: controls[setting.key] ? '#10b981' : '#cbd5e1',
                    border: 'none', cursor: 'pointer', transition: 'background 0.3s'
                  }}
                >
                  <div style={{
                    position: 'absolute', top: '2px', left: controls[setting.key] ? '22px' : '2px',
                    width: '20px', height: '20px', background: 'white', borderRadius: '50%',
                    transition: 'left 0.3s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                  }} />
                </button>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}

function TasksPage({ user, API_BASE }) {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchTasks = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/tasks`, { headers: authHeaders() });
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE}/api/tasks`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ title: newTask.trim() })
      });
      if (response.ok) {
        setNewTask('');
        fetchTasks();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleTask = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/api/tasks/${id}/toggle`, {
        method: 'PUT',
        headers: authHeaders()
      });
      if (response.ok) {
        fetchTasks();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const priorityColor = { high: '#ef4444', medium: '#f59e0b', low: '#22c55e' };
  const priorityBg = { high: '#fee2e2', medium: '#fef3c7', low: '#dcfce7' };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
      <section className="page-heading" style={{ paddingBottom: '10px', borderBottom: '1px solid #e2e8f0', marginBottom: '20px' }}>
        <div>
          <p className="eyebrow">Task Management</p>
          <h2>My Tasks</h2>
          <p className="helper-text" style={{ margin: 0 }}>
            Manage and track your daily checklist.
          </p>
        </div>
      </section>

      <section className="panel-card" style={{ padding: '24px' }}>
        <form onSubmit={handleAddTask} style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Add a new task..."
            style={{
              flex: 1,
              padding: '10px 14px',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              fontSize: '0.9rem',
              outline: 'none',
            }}
            disabled={submitting}
          />
          <button type="submit" className="primary-button" disabled={submitting} style={{ whiteSpace: 'nowrap', padding: '10px 20px', borderRadius: '8px' }}>
            {submitting ? 'Adding...' : 'Add Task'}
          </button>
        </form>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
            <p style={{ margin: 0, fontWeight: 500 }}>All caught up!</p>
            <p style={{ margin: '4px 0 0', fontSize: '0.8rem' }}>No tasks assigned to you.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {tasks.map(task => (
              <div key={task._id || task.id} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                textDecoration: task.done ? 'line-through' : 'none',
                opacity: task.done ? 0.7 : 1,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <input
                    type="checkbox"
                    checked={task.done}
                    onChange={() => handleToggleTask(task._id || task.id)}
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '0.9rem', color: task.done ? '#64748b' : '#0f172a', fontWeight: 500 }}>
                    {task.title}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    fontSize: '0.75rem',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    background: priorityBg[task.priority] || '#fee2e2',
                    color: priorityColor[task.priority] || '#ef4444',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                  }}>{task.priority || 'medium'}</span>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Due {task.due || 'Soon'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function NotificationsPage({ user, API_BASE }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/notifications`, { headers: authHeaders() });
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
      <section className="page-heading" style={{ paddingBottom: '10px', borderBottom: '1px solid #e2e8f0', marginBottom: '20px' }}>
        <div>
          <p className="eyebrow">Alerts & System Updates</p>
          <h2>Notifications</h2>
          <p className="helper-text" style={{ margin: 0 }}>
            Stay updated with recent alerts and messages.
          </p>
        </div>
      </section>

      <section className="panel-card" style={{ padding: '24px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
            <p style={{ margin: 0, fontWeight: 500 }}>No notifications</p>
            <p style={{ margin: '4px 0 0', fontSize: '0.8rem' }}>You're all caught up!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {notifications.map(notif => (
              <div key={notif._id || notif.id} style={{
                display: 'flex',
                alignItems: 'start',
                gap: '12px',
                padding: '14px 16px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  background: '#6366f1',
                  borderRadius: '50%',
                  marginTop: '6px',
                  flexShrink: 0
                }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '0.9rem', color: '#0f172a', margin: 0, fontWeight: 500 }}>{notif.title}</p>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginTop: '4px' }}>{notif.time || 'Just now'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(getStoredUser)
  const [dashboardData, setDashboardData] = useState({ totalEmployees: 0, attendance: '0%', pendingLeaves: 0, payrollStatus: '0 releases' })
  const [employees, setEmployees] = useState(fallbackEmployees)
  const [attendance, setAttendance] = useState(fallbackAttendance)
  const [leaveData, setLeaveData] = useState(fallbackLeaveData)
  const [payroll, setPayroll] = useState(fallbackPayroll)
  const [recruitment, setRecruitment] = useState(fallbackRecruitment)
  const [projects, setProjects] = useState(fallbackProjects)
  const [notifications, setNotifications] = useState(fallbackNotifications)
  const [authMode, setAuthMode] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'employee' })
  const [googleEmail, setGoogleEmail] = useState('')
  const [error, setError] = useState('')
  const [socketConnected, setSocketConnected] = useState(false)
  const [liveActivity, setLiveActivity] = useState([])
  const [activeUsers, setActiveUsers] = useState([])
  const [showGoogleModal, setShowGoogleModal] = useState(false)
  const [socket, setSocket] = useState(null)
  const [pendingApproval, setPendingApproval] = useState(false)
  const [pendingMessage, setPendingMessage] = useState('')

  const loadData = () => {
    if (!user) return
    const headers = authHeaders()
    Promise.all([
      fetch(`${API_BASE}/api/dashboard?role=${user.role}`, { headers }),
      fetch(`${API_BASE}/api/employees`, { headers }),
      fetch(`${API_BASE}/api/attendance`, { headers }),
      fetch(`${API_BASE}/api/leave`, { headers }),
      fetch(`${API_BASE}/api/payroll`, { headers }),
      fetch(`${API_BASE}/api/recruitment`, { headers }),
      fetch(`${API_BASE}/api/projects`, { headers }),
      fetch(`${API_BASE}/api/notifications`, { headers })
    ])
      .then(async (responses) => {
        const unauthorized = responses.find(r => r.status === 401)
        if (unauthorized) {
          handleLogout()
          throw new Error('Unauthorized')
        }
        const failed = responses.find(r => !r.ok)
        if (failed) {
          throw new Error(`Request failed with status: ${failed.status}`)
        }
        return Promise.all(responses.map(r => r.json()))
      })
      .then(([dashboard, employees, attendance, leave, payroll, recruitment, projects, notifications]) => {
        if (dashboard?.[user.role]) {
          setDashboardData(dashboard[user.role])
        }
        if (Array.isArray(employees)) setEmployees(employees)
        if (attendance) setAttendance(attendance)
        if (leave) setLeaveData(leave)
        if (payroll) setPayroll(payroll)
        if (recruitment) setRecruitment(recruitment)
        if (Array.isArray(projects)) setProjects(projects)
        if (Array.isArray(notifications)) setNotifications(notifications)
      })
      .catch((err) => {
        console.error('Failed to load data:', err)
        setDashboardData({ totalEmployees: 0, attendance: '0%', pendingLeaves: 0, payrollStatus: '0 releases' })
        setEmployees([])
        setAttendance(fallbackAttendance)
        setLeaveData(fallbackLeaveData)
        setPayroll(fallbackPayroll)
        setRecruitment(fallbackRecruitment)
        setProjects(fallbackProjects)
        setNotifications(fallbackNotifications)
      })
  }

  useEffect(() => {
    if (!user) return

    window.localStorage.setItem('ems-user', JSON.stringify(user))
    // token is already saved at login/register/google time

    loadData()

    const socketInstance = io(API_BASE, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      timeout: 10000
    })
    setSocket(socketInstance)

    const handleRealtimeRefresh = (message) => {
      if (message) {
        setLiveActivity((current) => [message, ...(Array.isArray(current) ? current : [])].slice(0, 6))
        setNotifications((current) => [{ title: message, time: 'just now' }, ...(Array.isArray(current) ? current : [])].slice(0, 6))
      }
      loadData()
    }

    socketInstance.on('connect', () => {
      setSocketConnected(true)
      socketInstance.emit('join_room', user.role)
      socketInstance.emit('user_online', { id: user.id, name: user.name, role: user.role, status: 'active' })
      setLiveActivity((current) => ['Real-time connection active', ...(Array.isArray(current) ? current : [])].slice(0, 6))
    })
    socketInstance.on('active_users_update', (users) => {
      setActiveUsers(users)
    })
    socketInstance.on('connect_error', () => {
      setSocketConnected(false)
    })
    socketInstance.on('disconnect', () => {
      setSocketConnected(false)
    })
    socketInstance.on('notification', handleRealtimeRefresh)
    socketInstance.on('employee_added', () => handleRealtimeRefresh('Employee directory updated'))
    socketInstance.on('employee_moved', () => handleRealtimeRefresh('Employee role or department updated'))
    socketInstance.on('employee_updated', () => handleRealtimeRefresh('Employee details updated'))
    socketInstance.on('approval_updated', () => handleRealtimeRefresh('Approval status updated'))
    socketInstance.on('attendance_updated', () => handleRealtimeRefresh('Attendance status updated'))
    socketInstance.on('project_added', () => handleRealtimeRefresh('Project list updated'))
    socketInstance.on('payroll_updated', (message) => handleRealtimeRefresh(message || 'Payroll updated'))
    socketInstance.on('leave_updated', () => handleRealtimeRefresh('Leave requests updated'))
    socketInstance.on('recruitment_updated', () => handleRealtimeRefresh('Recruitment list updated'))

    const fallbackRefresh = setInterval(() => {
      if (!socketInstance.connected) loadData()
    }, 15000)

    return () => {
      clearInterval(fallbackRefresh)
      socketInstance.disconnect()
    }
  }, [user])

  const handleGoogleLogin = () => {
    setError('')
    setPendingMessage('')
    setPendingApproval(false)
    setShowGoogleModal(true)
  }

  const handleGoogleSelect = async (selectedUser) => {
    try {
      const response = await fetch(`${API_BASE}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: selectedUser.name, email: selectedUser.email, role: selectedUser.role })
      });
      const payload = await response.json();
      if (!response.ok) {
        if (response.status === 403 && (payload.status === 'Pending' || payload.status === 'Rejected')) {
          setPendingApproval(true);
          setPendingMessage(payload.message);
          setShowGoogleModal(false);
          return;
        }
        throw new Error(payload.message || 'Google login failed');
      }

      if (response.status === 202 && payload.status === 'Pending') {
        setPendingApproval(true);
        setPendingMessage(payload.message);
        setShowGoogleModal(false);
        return;
      }

      if (payload.user.token) {
        window.localStorage.setItem('ems-token', payload.user.token)
      }
      setUser({
        id: payload.user.id,
        name: payload.user.name,
        email: payload.user.email,
        role: payload.user.role,
        isGoogle: true
      })
      setGoogleEmail(payload.user.email)
      setShowGoogleModal(false)
    } catch (err) {
      setError(err.message)
      setShowGoogleModal(false)
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setPendingMessage('')
    setPendingApproval(false)

    const normalizedEmail = form.email.trim().toLowerCase()

    if (authMode === 'login') {
      try {
        const response = await fetch(`${API_BASE}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: normalizedEmail, password: form.password, role: form.role })
        })
        const payload = await response.json()
        if (!response.ok) {
          if (response.status === 403 && (payload.status === 'Pending' || payload.status === 'Rejected')) {
            setPendingApproval(true);
            setPendingMessage(payload.message);
            return;
          }
          throw new Error(payload.message || 'Unable to sign in')
        }
        if (payload.user.token) {
          window.localStorage.setItem('ems-token', payload.user.token)
        }
        setUser({ id: payload.user.id, name: payload.user.name, email: payload.user.email, role: payload.user.role })
        return
      } catch (errorMessage) {
        if (errorMessage.message === 'Failed to fetch') {
          const matchingUser = demoUsers.find((candidate) => candidate.email === normalizedEmail)
          if (matchingUser && matchingUser.password === form.password && matchingUser.role === form.role) {
            setUser({ id: matchingUser.id, name: matchingUser.name, email: matchingUser.email, role: matchingUser.role })
            if (matchingUser.role === 'employee') {
              setEmployees((current) => [
                ...(Array.isArray(current) ? current : []),
                { id: matchingUser.id, name: matchingUser.name, role: 'Employee', department: 'General', status: 'Active' }
              ])
            }
            return
          }
          setError('Backend unavailable or role does not match. Please start the server at http://localhost:5000 or use credentials for the selected role.')
          return
        }
        setError(errorMessage.message)
      }
      return
    }

    if (!form.name || !form.password) {
      setError('Please fill in your full name and password.')
      return
    }

    try {
      const response = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: normalizedEmail, role: form.role, password: form.password })
      })
      const payload = await response.json()
      if (!response.ok) {
        throw new Error(payload.message || 'Unable to create your account')
      }
      if (response.status === 202 && payload.status === 'Pending') {
        setPendingApproval(true);
        setPendingMessage(payload.message);
        return;
      }
      if (payload.user.token) {
        window.localStorage.setItem('ems-token', payload.user.token)
      }
      setUser({ id: payload.user.id, name: payload.user.name, email: payload.user.email, role: payload.user.role })
    } catch (errorMessage) {
      if (errorMessage.message === 'Failed to fetch') {
        const newUser = {
          id: Date.now(),
          name: form.name,
          email: normalizedEmail,
          role: form.role,
          password: form.password
        }
        demoUsers.push(newUser)
        setUser({ id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role })
        if (newUser.role === 'employee') {
          setEmployees((current) => [
            ...(Array.isArray(current) ? current : []),
            { id: newUser.id, name: newUser.name, role: 'Employee', department: 'General', status: 'Active' }
          ])
        }
        return
      }
      setError(errorMessage.message)
    }
  }

  const handleLogout = () => {
    window.localStorage.removeItem('ems-user')
    window.localStorage.removeItem('ems-token')
    setUser(null)
    setForm({ name: '', email: '', password: '', role: 'employee' })
    setError('')
    setPendingMessage('')
    setPendingApproval(false)
  }

  if (!user) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage form={form} setForm={setForm} authMode={authMode} setAuthMode={setAuthMode} onSubmit={handleSubmit} onGoogleLogin={handleGoogleLogin} error={error} googleEmail={googleEmail} pendingMessage={pendingMessage} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <GoogleModal
          isOpen={showGoogleModal}
          onClose={() => setShowGoogleModal(false)}
          onSelectAccount={handleGoogleSelect}
          demoUsers={demoUsers}
        />
      </BrowserRouter>
    )
  }

  return (
    <BrowserRouter>
      <AppLayout user={user} onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<ProtectedRoute user={user}>{user.role === 'employee' ? <EmployeeDashboardPage user={user} leaveData={leaveData} payroll={payroll} attendance={attendance} liveActivity={liveActivity} socketConnected={socketConnected} triggerRefresh={loadData} activeUsers={activeUsers} dashboardData={dashboardData} socket={socket} /> : <DashboardPage user={user} dashboardData={dashboardData} liveActivity={liveActivity} socketConnected={socketConnected} employees={employees} attendance={attendance} API_BASE={API_BASE} notifications={notifications} activeUsers={activeUsers} />}</ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute user={user}>{user.role === 'employee' ? <EmployeeDashboardPage user={user} leaveData={leaveData} payroll={payroll} attendance={attendance} liveActivity={liveActivity} socketConnected={socketConnected} triggerRefresh={loadData} activeUsers={activeUsers} dashboardData={dashboardData} socket={socket} /> : <DashboardPage user={user} dashboardData={dashboardData} liveActivity={liveActivity} socketConnected={socketConnected} employees={employees} attendance={attendance} API_BASE={API_BASE} notifications={notifications} activeUsers={activeUsers} />}</ProtectedRoute>} />
          <Route path="/employees" element={<ProtectedRoute user={user}><EmployeesPage employees={employees} attendance={attendance} API_BASE={API_BASE} triggerRefresh={loadData} user={user} /></ProtectedRoute>} />
          <Route path="/approvals" element={<ProtectedRoute user={user}><ApprovalsPage user={user} API_BASE={API_BASE} triggerRefresh={loadData} /></ProtectedRoute>} />
          <Route path="/attendance" element={<ProtectedRoute user={user}><AttendancePage attendance={attendance} user={user} API_BASE={API_BASE} triggerRefresh={loadData} /></ProtectedRoute>} />
          <Route path="/leave" element={<ProtectedRoute user={user}><LeavePage leaveData={leaveData} user={user} API_BASE={API_BASE} triggerRefresh={loadData} /></ProtectedRoute>} />
          <Route path="/payroll" element={<ProtectedRoute user={user}><PayrollPage payroll={payroll} API_BASE={API_BASE} triggerRefresh={loadData} user={user} /></ProtectedRoute>} />
          <Route path="/recruitment" element={<ProtectedRoute user={user}><RecruitmentPage recruitment={recruitment} user={user} API_BASE={API_BASE} triggerRefresh={loadData} /></ProtectedRoute>} />
          <Route path="/projects" element={<ProtectedRoute user={user}><ProjectsPage projects={projects} employees={employees} user={user} API_BASE={API_BASE} triggerRefresh={loadData} socket={socket} /></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute user={user}><ChatPage notifications={notifications} user={user} API_BASE={API_BASE} socket={socket} activeUsers={activeUsers} /></ProtectedRoute>} />
          <Route path="/tasks" element={<ProtectedRoute user={user}><TasksPage user={user} API_BASE={API_BASE} /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute user={user}><NotificationsPage user={user} API_BASE={API_BASE} /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute user={user}><SettingsPage user={user} setUser={setUser} API_BASE={API_BASE} /></ProtectedRoute>} />
          {/* Redirect /login and any unknown route to dashboard after login */}
          <Route path="/login" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  )
}

export default App























