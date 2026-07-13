import { useEffect, useState } from 'react'
import { BrowserRouter, Link, Navigate, NavLink, Route, Routes } from 'react-router-dom'
import { io } from 'socket.io-client'
import './App.css'

/*  Feather nav icons map  */
const NAV_ICONS = {
  '/dashboard': (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>
  ),
  '/employees': (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  '/attendance': (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  '/leave': (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  '/payroll': (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23"/>
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
  ),
  '/recruitment': (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/>
      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  ),
  '/projects': (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
  '/chat': (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  ),
  '/settings': (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
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
    { left: '10%',  size: 5,  dur: 18, delay: 0,    color: 'rgba(99,102,241,0.5)'  },
    { left: '25%',  size: 3,  dur: 22, delay: 4,    color: 'rgba(168,85,247,0.4)'  },
    { left: '40%',  size: 6,  dur: 16, delay: 8,    color: 'rgba(56,189,248,0.4)'  },
    { left: '55%',  size: 4,  dur: 20, delay: 2,    color: 'rgba(52,211,153,0.4)'  },
    { left: '70%',  size: 5,  dur: 24, delay: 6,    color: 'rgba(251,191,36,0.35)' },
    { left: '82%',  size: 3,  dur: 17, delay: 10,   color: 'rgba(251,113,133,0.4)' },
    { left: '92%',  size: 4,  dur: 21, delay: 3,    color: 'rgba(99,102,241,0.4)'  },
    { left: '18%',  size: 3,  dur: 19, delay: 14,   color: 'rgba(168,85,247,0.35)' },
    { left: '63%',  size: 6,  dur: 26, delay: 7,    color: 'rgba(56,189,248,0.3)'  },
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
  summary: '97% weekly',
  items: [
    { label: 'Check-ins', value: '221' },
    { label: 'Late entries', value: '8' },
    { label: 'OT approved', value: '12h' }
  ],
  schedule: [
    { title: 'Team sync', time: '09:30' },
    { title: 'Payroll review', time: '12:00' },
    { title: 'Interview panel', time: '15:30' }
  ]
}

const fallbackLeaveData = {
  balance: '14 days',
  items: [
    { label: 'Casual', value: '6 left' },
    { label: 'Sick', value: '4 left' },
    { label: 'Annual', value: '4 left' }
  ],
  requests: [
    { name: 'Rina Shah', type: 'Sick leave', status: 'Pending' },
    { name: 'Tom Lewis', type: 'Casual leave', status: 'Approved' }
  ]
}

const fallbackPayroll = {
  status: 'Processed',
  items: [
    { label: 'Net salary', value: '$4,820' },
    { label: 'Bonus', value: '$480' },
    { label: 'Deductions', value: '$170' }
  ],
  payslips: [
    { name: 'June payslip', date: '2026-06-25' },
    { name: 'May payslip', date: '2026-05-27' }
  ]
}

const fallbackRecruitment = {
  openRoles: 6,
  positions: [
    { title: 'Senior Frontend Engineer', stage: 'Screening' },
    { title: 'People Operations Manager', stage: 'HR Round' }
  ],
  pipeline: [
    { label: 'Applicants', value: '38' },
    { label: 'Interviews', value: '12' },
    { label: 'Offers', value: '4' }
  ]
}

const fallbackProjects = [
  { name: 'Northwind rollout', progress: '82%', summary: 'Coordinate implementation with finance and operations.', owner: 'Anika', deadline: '2026-07-15', budget: '$180k' },
  { name: 'Global onboarding revamp', progress: '64%', summary: 'Streamline new-hire documentation and access provisioning.', owner: 'Mina', deadline: '2026-08-02', budget: '$96k' }
]

const fallbackNotifications = [
  { title: 'Leave approval requested', time: '2m ago' },
  { title: 'New interview scheduled', time: '15m ago' },
  { title: 'Payroll batch released', time: '31m ago' }
]

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
  hr: [
    { to: '/dashboard', label: 'Overview' },
    { to: '/employees', label: 'Employees' },
    { to: '/approvals', label: 'Approvals' },
    { to: '/attendance', label: 'Attendance' },
    { to: '/leave', label: 'Leave' },
    { to: '/payroll', label: 'Payroll' },
    { to: '/recruitment', label: 'Recruitment' },
    { to: '/chat', label: 'Chat' }
  ],
  employee: [
    { to: '/dashboard', label: 'Home' },
    { to: '/attendance', label: 'Attendance' },
    { to: '/leave', label: 'Leave' },
    { to: '/payroll', label: 'Payroll' },
    { to: '/projects', label: 'Projects' },
    { to: '/chat', label: 'Chat' }
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
  return (
    <div className="app-shell">
      <FloatingParticles />

      <header className="topbar">
        <div className="topbar-brand">
          <p className="eyebrow">Enterprise HRMS</p>
          <h1>Employee Management System</h1>
        </div>
        <div className="topbar-actions">
          <LiveClock />
          {user.isGoogle && (
            <span className="google-signed-in-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.0 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
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

      <nav className="sidebar-nav">
        <div className="sidebar-label">Menu</div>
        {navByRole[user.role]?.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
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
          <circle cx="100" cy="80" r="40" fill="#a8e6cf" opacity="0.3"/>
          <circle cx="420" cy="100" r="50" fill="#ffd89b" opacity="0.3"/>
          
          {/* Chart/Graph */}
          <rect x="40" y="80" width="140" height="100" rx="15" fill="#7fd3c1" opacity="0.8"/>
          <polyline points="60,150 90,100 130,120 160,80" stroke="white" strokeWidth="3" fill="none"/>
          <circle cx="60" cy="150" r="4" fill="white"/>
          <circle cx="90" cy="100" r="4" fill="white"/>
          <circle cx="130" cy="120" r="4" fill="white"/>
          <circle cx="160" cy="80" r="4" fill="white"/>
          
          {/* Hanging lights */}
          <line x1="100" y1="0" x2="100" y2="50" stroke="#7fd3c1" strokeWidth="4"/>
          <circle cx="100" cy="65" r="20" fill="#7fd3c1"/>
          <line x1="340" y1="0" x2="340" y2="50" stroke="#7fd3c1" strokeWidth="4"/>
          <circle cx="340" cy="65" r="20" fill="#7fd3c1"/>
          
          {/* Clock */}
          <circle cx="400" cy="140" r="35" fill="none" stroke="#ffc107" strokeWidth="3"/>
          <line x1="400" y1="140" x2="400" y2="115" stroke="#ffc107" strokeWidth="2"/>
          <line x1="400" y1="140" x2="415" y2="140" stroke="#ffc107" strokeWidth="2"/>
          <circle cx="400" cy="140" r="4" fill="#ffc107"/>
          
          {/* Person 1 - Left (celebrating) */}
          <circle cx="120" cy="220" r="18" fill="#1e40af"/>
          <path d="M 120 240 L 110 290 M 120 240 L 130 290" stroke="#1e40af" strokeWidth="8" strokeLinecap="round"/>
          <rect x="100" y="240" width="40" height="40" fill="#f0f0f0" rx="4"/>
          <circle cx="100" cy="258" r="6" fill="#1e40af"/>
          <line x1="105" y1="253" x2="95" y2="240" stroke="#1e40af" strokeWidth="6" strokeLinecap="round"/>
          
          {/* Person 2 - Middle (jumping) */}
          <circle cx="250" cy="200" r="20" fill="#f59e0b"/>
          <rect x="230" y="225" width="40" height="50" fill="#fbbf24" rx="4"/>
          <path d="M 230 275 L 225 320 M 270 275 L 275 320" stroke="#1e3a8a" strokeWidth="8" strokeLinecap="round"/>
          <path d="M 210 240 L 180 220 M 290 240 L 320 220" stroke="#f59e0b" strokeWidth="8" strokeLinecap="round"/>
          
          {/* Person 3 - Right (celebrating) */}
          <circle cx="360" cy="230" r="18" fill="#f59e0b"/>
          <rect x="340" y="255" width="40" height="45" fill="#1e40af" rx="4"/>
          <path d="M 340 300 L 335 345 M 380 300 L 385 345" stroke="#1e40af" strokeWidth="8" strokeLinecap="round"/>
          <path d="M 320 270 L 290 250" stroke="#f59e0b" strokeWidth="8" strokeLinecap="round"/>
          <path d="M 380 270 L 410 250" stroke="#f59e0b" strokeWidth="8" strokeLinecap="round"/>
          
          {/* Yellow platform */}
          <ellipse cx="250" cy="380" rx="180" ry="40" fill="#fbbf24"/>
          <path d="M 70 380 Q 100 360 250 360 Q 400 360 430 380" fill="#fcd34d"/>
          
          {/* Background decorative elements */}
          <line x1="50" y1="350" x2="120" y2="320" stroke="#7fd3c1" strokeWidth="2" opacity="0.5"/>
          <line x1="380" y1="360" x2="450" y2="330" stroke="#7fd3c1" strokeWidth="2" opacity="0.5"/>
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
    }, 1500)
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
    }, 1500)
  }

  return (
    <div className="google-modal-overlay">
      <div className="google-modal-container">
        {view === 'loading' ? (
          <div className="google-loading-view">
            <div className="google-spinner"></div>
            <p className="google-loading-title">Signing in with Google</p>
            <p className="google-loading-subtitle">
              {selectedUser ? selectedUser.email : customEmail}
            </p>
          </div>
        ) : view === 'custom' ? (
          <div className="google-custom-view">
            <div className="google-logo-header">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.0 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
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
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.0 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
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
                    <span className="google-account-email">{item.email}</span>
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

        <button type="button" className="google-login-button" onClick={onGoogleLogin}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.0 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>
        {googleEmail && (
          <p className="google-email-label">Signing in with {googleEmail}</p>
        )}

        <div className="divider">
          <span>Or continue with email</span>
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

function DashboardPage({ user, dashboardData, liveActivity, socketConnected }) {
  const isAdmin = user.role === 'super_admin'

  /*  Shared state  */
  const [hoveredBarIndex, setHoveredBarIndex] = useState(null)
  const [hoveredPoint, setHoveredPoint] = useState(null)

  /*  Admin-only state  */
  const [adminTab, setAdminTab] = useState('overview') // 'overview' | 'system' | 'audit'
  const [auditFilter, setAuditFilter] = useState('all')
  const [hoveredGauge, setHoveredGauge] = useState(null)

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

  /*  HR/Shared: Performance Pulse  */
  const pulseData = [
    { day: 'Mon', value: 78, desc: 'Normal workload, strong check-in consistency.' },
    { day: 'Tue', value: 84, desc: 'High collaboration peak during team sprint reviews.' },
    { day: 'Wed', value: 69, desc: 'Mid-week focus day with slightly lower check-ins.' },
    { day: 'Thu', value: 92, desc: 'Maximum activity and cross-department pull requests.' },
    { day: 'Fri', value: 76, desc: 'Consistent performance, steady weekend wind-down.' },
    { day: 'Sat', value: 34, desc: 'Weekend shift, voluntary coverage.' },
    { day: 'Sun', value: 42, desc: 'Support and maintenance shift updates.' },
  ]

  /*  HR/Shared: SLA SVG Trend  */
  const trendData = [
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
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e2e8f0" strokeWidth={7} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={7}
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
          <div style={{ position:'absolute', top:-60, right:-60, width:220, height:220, background:'rgba(99,102,241,0.15)', borderRadius:'50%' }} />
          <div style={{ position:'absolute', bottom:-50, right:160, width:140, height:140, background:'rgba(139,92,246,0.1)', borderRadius:'50%' }} />
          <div style={{ position:'absolute', top:'50%', left:'35%', transform:'translateY(-50%)', width:1, height:'60%', background:'rgba(255,255,255,0.06)' }} />

          <div style={{ zIndex:1 }}>
            <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'8px' }}>
              <span style={{ fontSize:'0.72rem', fontWeight:800, letterSpacing:'0.12em', textTransform:'uppercase', color:'#a5b4fc', background:'rgba(99,102,241,0.2)', padding:'3px 10px', borderRadius:'20px', border:'1px solid rgba(99,102,241,0.3)' }}>
              Super Admin Console
              </span>
              {socketConnected && (
                <span style={{ fontSize:'0.7rem', color:'#4ade80', fontWeight:600, display:'flex', alignItems:'center', gap:'4px' }}>
                  <span style={{ width:6, height:6, background:'#4ade80', borderRadius:'50%', display:'inline-block', animation:'pulse 1.5s infinite' }} />
                  Live
                </span>
              )}
            </div>
            <h2 style={{ fontSize:'2rem', fontWeight:800, margin:'0 0 6px', letterSpacing:'-0.02em' }}>
              Welcome, {user.name} 
            </h2>
            <p style={{ opacity:0.72, fontSize:'0.92rem', margin:0 }}>
              Full system control  Manage users, payroll, access controls, and enterprise operations.
            </p>
          </div>

          {/* Tabs */}
          <div style={{ display:'flex', flexDirection:'column', gap:'8px', zIndex:1 }}>
            {['overview','system','audit'].map(tab => (
              <button
                key={tab}
                onClick={() => setAdminTab(tab)}
                style={{
                  padding:'8px 20px', borderRadius:'10px', border:'none', cursor:'pointer',
                  fontWeight:700, fontSize:'0.8rem', letterSpacing:'0.04em', textTransform:'capitalize',
                  background: adminTab === tab ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)',
                  color: adminTab === tab ? '#fff' : 'rgba(255,255,255,0.55)',
                  backdropFilter:'blur(8px)',
                  border: adminTab === tab ? '1px solid rgba(255,255,255,0.2)' : '1px solid transparent',
                  transition:'all 0.2s',
                }}
              >
                {tab === 'overview' ? 'Overview' : tab === 'system' ? 'System' : 'Audit Log'}
              </button>
            ))}
          </div>
        </div>

        {/* -- STATS ROW -- */}
        <section className="stats-grid dashboard-stats" style={{ marginBottom:'24px' }}>
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
            <article className="panel-card admin-quick-actions" style={{ marginBottom:'24px' }}>
              <div className="panel-header">
                <h3>Admin Quick Actions</h3>
                <span className="pill" style={{ background:'#f1f5f9', color:'#6366f1' }}>Admin only</span>
              </div>
              <div className="admin-actions-grid" style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:'12px', marginTop:'4px' }}>
                {adminActions.map((action) => (
                  <a key={action.label} href={action.href} style={{
                    display:'flex', flexDirection:'column', alignItems:'center', gap:'8px',
                    padding:'18px 10px', borderRadius:'14px', background: action.bg,
                    textDecoration:'none', transition:'transform 0.2s, box-shadow 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow='0 10px 24px rgba(0,0,0,0.10)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='none'; }}>
                    <span style={{ fontSize:'1.6rem' }}>{action.icon}</span>
                    <span style={{ fontSize:'0.73rem', fontWeight:700, color: action.color, textAlign:'center', lineHeight:1.3 }}>{action.label}</span>
                  </a>
                ))}
              </div>
            </article>

            {/* System Health + Department Capacity */}
            <section className="content-grid" style={{ marginBottom:'24px' }}>
              {/* System Health Gauges */}
              <article className="panel-card">
                <div className="panel-header">
                  <h3>System Health</h3>
                  <span className="pill" style={{ background:'#ecfdf5', color:'#10b981' }}>All systems operational</span>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'18px', marginTop:'14px' }}>
                  {systemHealth.map((gauge, idx) => (
                    <div key={idx}
                      onMouseEnter={() => setHoveredGauge(idx)}
                      onMouseLeave={() => setHoveredGauge(null)}
                      style={{
                        display:'flex', alignItems:'center', gap:'14px', padding:'12px 14px',
                        borderRadius:'12px', background: hoveredGauge === idx ? '#f8fafc' : 'transparent',
                        border: hoveredGauge === idx ? '1px solid #e2e8f0' : '1px solid transparent',
                        cursor:'default', transition:'all 0.2s',
                      }}>
                      <div style={{ position:'relative', flexShrink:0 }}>
                        <Gauge value={gauge.value} color={gauge.color} invert={gauge.invert} />
                        <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
                          <span style={{ fontSize:'0.72rem', fontWeight:800, color: gauge.color }}>
                            {gauge.value}%
                          </span>
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize:'0.82rem', fontWeight:700, color:'#1e293b' }}>{gauge.icon} {gauge.label}</div>
                        <div style={{ fontSize:'0.72rem', color:'#94a3b8', marginTop:'3px' }}>{gauge.detail}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </article>

              {/* Department Capacity */}
              <article className="panel-card">
                <div className="panel-header">
                  <h3>Department Capacity</h3>
                  <span className="pill" style={{ background:'#ecfdf5', color:'#10b981' }}>{dashboardData.totalEmployees || 7} total</span>
                </div>
                <div className="dept-list">
                  {departments.map((dept, index) => (
                    <div key={index} className="dept-item">
                      <div style={{ flex:1 }}>
                        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'4px' }}>
                          <span className="dept-name">{dept.name}</span>
                          <span style={{ fontSize:'0.73rem', color:'#94a3b8', fontWeight:600 }}>{dept.count} {dept.count === 1 ? 'member' : 'members'}</span>
                        </div>
                        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                          <div className="dept-bar-container">
                            <div className="dept-bar-value" style={{ width:`${dept.pct}%`, background: dept.color }} />
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
            <section className="content-grid" style={{ marginBottom:'24px' }}>
              {/* Role Access Matrix */}
              <article className="panel-card">
                <div className="panel-header">
                  <h3>Role Access Matrix</h3>
                  <span className="pill" style={{ background:'#fef3c7', color:'#d97706' }}>Admin view</span>
                </div>
                <table style={{ width:'100%', borderCollapse:'collapse', marginTop:'8px', fontSize:'0.82rem' }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign:'left', padding:'8px 10px', color:'#94a3b8', fontWeight:700, fontSize:'0.72rem', letterSpacing:'0.07em', textTransform:'uppercase', borderBottom:'2px solid #f1f5f9' }}>Feature</th>
                      {['Admin','HR','Employee'].map(r => (
                        <th key={r} style={{ textAlign:'center', padding:'8px 12px', color:'#94a3b8', fontWeight:700, fontSize:'0.72rem', letterSpacing:'0.07em', textTransform:'uppercase', borderBottom:'2px solid #f1f5f9' }}>{r}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {roleMatrix.map((row, i) => (
                      <tr key={i} style={{ background: i % 2 === 0 ? '#fafafe' : 'transparent' }}>
                        <td style={{ padding:'9px 10px', color:'#475569', fontWeight:600 }}>{row.feature}</td>
                        {[row.admin, row.hr, row.employee].map((has, j) => (
                          <td key={j} style={{ textAlign:'center', padding:'9px 12px' }}>
                            <span style={{
                              display:'inline-flex', alignItems:'center', justifyContent:'center',
                              width:22, height:22, borderRadius:'50%',
                              background: has ? '#dcfce7' : '#fee2e2',
                              color: has ? '#16a34a' : '#dc2626',
                              fontSize:'0.7rem', fontWeight:900,
                            }}>
                              {has ? '' : '-'}
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
                    <li key={`${item}-${index}`} style={{ padding:'10px 12px', borderBottom:'1px solid #f1f5f9', display:'flex', gap:'8px', fontSize:'0.85rem' }}>
                      <span style={{ color:'#6366f1', fontWeight:'bold' }}></span>
                      <span style={{ color:'#475569' }}>{item}</span>
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
            <section className="content-grid" style={{ marginBottom:'24px' }}>
              {/* Detailed System Health */}
              <article className="panel-card">
                <div className="panel-header">
                  <h3>Infrastructure Status</h3>
                  <span className="pill" style={{ background:'#ecfdf5', color:'#10b981' }}> All systems operational</span>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:'14px', marginTop:'14px' }}>
                  {[
                    { name: 'Express API Server', status:'operational', uptime:'99.7%', resp:'42ms', color:'#10b981' },
                    { name: 'MongoDB Atlas', status:'operational', uptime:'99.9%', resp:'12ms', color:'#10b981' },
                    { name: 'Socket.io Realtime', status:'operational', uptime:'98.2%', resp:'8ms', color:'#10b981' },
                    { name: 'Auth Service (JWT)', status:'operational', uptime:'100%', resp:'3ms', color:'#10b981' },
                    { name: 'File Storage', status:'degraded', uptime:'94.1%', resp:'380ms', color:'#f59e0b' },
                    { name: 'Email Notifications', status:'offline', uptime:'0%', resp:'N/A', color:'#ef4444' },
                  ].map((svc, i) => (
                    <div key={i} style={{ display:'flex', alignItems:'center', gap:'14px', padding:'12px 14px', borderRadius:'12px', background:'#f8fafc', border:'1px solid #f1f5f9' }}>
                      <span style={{ width:10, height:10, borderRadius:'50%', background: svc.color, boxShadow:`0 0 8px ${svc.color}`, flexShrink:0 }} />
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:'0.85rem', fontWeight:700, color:'#1e293b' }}>{svc.name}</div>
                        <div style={{ fontSize:'0.72rem', color:'#94a3b8', textTransform:'capitalize' }}>{svc.status}</div>
                      </div>
                      <div style={{ textAlign:'right' }}>
                        <div style={{ fontSize:'0.8rem', fontWeight:700, color: svc.color }}>{svc.uptime}</div>
                        <div style={{ fontSize:'0.7rem', color:'#94a3b8' }}>Resp: {svc.resp}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </article>

              {/* Active Users / Sessions */}
              <article className="panel-card">
                <div className="panel-header">
                  <h3>Active Sessions</h3>
                  <span className="pill" style={{ background:'#eef2ff', color:'#6366f1' }}>Live</span>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:'12px', marginTop:'14px' }}>
                  {[
                    { name:'Ava Chen', role:'Super Admin', ip:'192.168.1.12', time:'Just now', device:'Chrome/Windows', color:'#6366f1' },
                    { name:'Mina Patel', role:'HR', ip:'192.168.1.23', time:'2m ago', device:'Safari/Mac', color:'#8b5cf6' },
                    { name:'Leo Brooks', role:'Employee', ip:'10.0.0.45', time:'5m ago', device:'Firefox/Linux', color:'#10b981' },
                  ].map((sess, i) => (
                    <div key={i} style={{ display:'flex', alignItems:'center', gap:'12px', padding:'10px 12px', borderRadius:'12px', background:'#f8fafc', border:'1px solid #f1f5f9' }}>
                      <div style={{ width:34, height:34, borderRadius:'50%', background:`linear-gradient(135deg,${sess.color},${sess.color}88)`, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:800, fontSize:'0.8rem', flexShrink:0 }}>
                        {sess.name[0]}
                      </div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:'0.85rem', fontWeight:700, color:'#1e293b' }}>{sess.name}</div>
                        <div style={{ fontSize:'0.72rem', color:'#94a3b8' }}>{sess.device}  {sess.ip}</div>
                      </div>
                      <div style={{ textAlign:'right' }}>
                        <span style={{ fontSize:'0.72rem', fontWeight:700, padding:'2px 8px', borderRadius:'6px', background:'#eef2ff', color: sess.color }}>{sess.role}</span>
                        <div style={{ fontSize:'0.7rem', color:'#94a3b8', marginTop:'3px' }}>{sess.time}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop:'20px', paddingTop:'16px', borderTop:'1px solid #f1f5f9' }}>
                  <div style={{ fontSize:'0.75rem', fontWeight:700, color:'#94a3b8', marginBottom:'12px', textTransform:'uppercase', letterSpacing:'0.08em' }}>Resource Usage</div>
                  {[
                    { label:'CPU Usage', value:38, color:'#6366f1' },
                    { label:'Memory', value:61, color:'#8b5cf6' },
                    { label:'DB Connections', value:24, color:'#10b981' },
                    { label:'Bandwidth', value:45, color:'#f59e0b' },
                  ].map((res, i) => (
                    <div key={i} style={{ marginBottom:'10px' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'4px' }}>
                        <span style={{ fontSize:'0.78rem', color:'#475569', fontWeight:600 }}>{res.label}</span>
                        <span style={{ fontSize:'0.78rem', fontWeight:800, color: res.color }}>{res.value}%</span>
                      </div>
                      <div style={{ height:6, borderRadius:99, background:'#f1f5f9', overflow:'hidden' }}>
                        <div style={{ height:'100%', width:`${res.value}%`, borderRadius:99, background: res.color, transition:'width 0.8s ease' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            </section>
          </>
        )}

        {/* -- TAB: AUDIT LOG -- */}
        {adminTab === 'audit' && (
          <article className="panel-card" style={{ marginBottom:'24px' }}>
            <div className="panel-header">
              <h3>Audit Log</h3>
              <div style={{ display:'flex', gap:'8px' }}>
                {['all','approval','leave','payroll','auth','project'].map(f => (
                  <button key={f} onClick={() => setAuditFilter(f)} style={{
                    padding:'4px 12px', borderRadius:'20px', border:'none', cursor:'pointer',
                    fontSize:'0.72rem', fontWeight:700, textTransform:'capitalize',
                    background: auditFilter === f ? '#6366f1' : '#f1f5f9',
                    color: auditFilter === f ? '#fff' : '#64748b',
                    transition:'all 0.2s',
                  }}>{f}</button>
                ))}
              </div>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:'10px', marginTop:'14px' }}>
              {filteredAudit.map((entry, i) => (
                <div key={i} style={{
                  display:'flex', alignItems:'center', gap:'14px', padding:'12px 16px',
                  borderRadius:'12px', background:'#fafafe', border:'1px solid #f1f5f9',
                  transition:'all 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.background='#f0f4ff'}
                onMouseLeave={e => e.currentTarget.style.background='#fafafe'}
                >
                  <div style={{ width:36, height:36, borderRadius:'50%', background:'#eef2ff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1rem', flexShrink:0 }}>
                    {entry.icon}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:'0.85rem', fontWeight:700, color:'#1e293b' }}>{entry.action}</div>
                    <div style={{ fontSize:'0.73rem', color:'#94a3b8', marginTop:'2px' }}>
                      By <strong style={{ color:'#475569' }}>{entry.actor}</strong>  Target: {entry.target}
                    </div>
                  </div>
                  <div style={{ textAlign:'right', flexShrink:0 }}>
                    <span style={{ fontSize:'0.72rem', fontWeight:700, padding:'2px 8px', borderRadius:'6px', background:'#eef2ff', color:'#6366f1', textTransform:'capitalize' }}>{entry.type}</span>
                    <div style={{ fontSize:'0.7rem', color:'#94a3b8', marginTop:'3px' }}>{entry.time} today</div>
                  </div>
                </div>
              ))}
              {filteredAudit.length === 0 && (
                <div style={{ textAlign:'center', padding:'40px', color:'#94a3b8', fontSize:'0.88rem' }}>
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
                <div className="svg-chart-tooltip" style={{ left:`${(hoveredPoint.x / svgW) * 100}%`, top:`${(hoveredPoint.y / svgH) * 100}%` }}>
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
    </>
  )
}

/*  Employee Personal Dashboard  */
function EmployeeDashboardPage({ user, leaveData, payroll, attendance, liveActivity, socketConnected, triggerRefresh }) {
  /*  Real-time clock  */
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  /*  Work session timer  */
  const [checkedIn, setCheckedIn] = useState(false)
  const [checkInTime, setCheckInTime] = useState(null)
  const [elapsed, setElapsed] = useState(0) // seconds
  const [checkInLoading, setCheckInLoading] = useState(false)
  useEffect(() => {
    if (!checkedIn || !checkInTime) return
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - checkInTime) / 1000)), 1000)
    return () => clearInterval(id)
  }, [checkedIn, checkInTime])
  useEffect(() => {
    const activeRecord = attendance?.checkIns?.[String(user.id)]
    if (activeRecord?.checkedIn) {
      setCheckedIn(true)
      setCheckInTime((current) => current || Date.now())
      return
    }
    setCheckedIn(false)
    setCheckInTime(null)
    setElapsed(0)
  }, [attendance?.checkIns, user.id])

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
      setCheckedIn(data.checkedIn)
      setCheckInTime(data.checkedIn ? Date.now() : null)
      setElapsed(0)
      if (triggerRefresh) triggerRefresh()
    } catch {
      setCheckedIn((current) => {
        const next = !current
        setCheckInTime(next ? Date.now() : null)
        setElapsed(0)
        return next
      })
    } finally {
      setCheckInLoading(false)
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
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Submit timesheet for June', due: 'Today', priority: 'high', done: false },
    { id: 2, title: 'Complete onboarding module 3', due: 'Tomorrow', priority: 'medium', done: false },
    { id: 3, title: 'Update project status report', due: 'Jul 12', priority: 'medium', done: true },
    { id: 4, title: 'Team sync meeting notes', due: 'Jul 13', priority: 'low', done: false },
    { id: 5, title: 'Review Q3 roadmap doc', due: 'Jul 14', priority: 'low', done: false },
  ])
  const [newTask, setNewTask] = useState('')
  const toggleTask = (id) => setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t))
  const addTask = (e) => {
    e.preventDefault()
    if (!newTask.trim()) return
    setTasks(prev => [...prev, { id: Date.now(), title: newTask.trim(), due: 'Soon', priority: 'medium', done: false }])
    setNewTask('')
  }
  const doneTasks = tasks.filter(t => t.done).length
  const taskPct = Math.round((doneTasks / tasks.length) * 100)

  /*  Live activity feed (auto-appends new items)  */
  const feedItems = [
    'Attendance sync complete',
    'Payroll batch released',
    'Leave request submitted',
    'Project milestone updated',
    'Team chat message received',
    'Schedule reminder triggered',
  ]
  const [feed, setFeed] = useState(liveActivity.length ? liveActivity : feedItems.slice(0, 3))
  useEffect(() => {
    const id = setInterval(() => {
      const next = feedItems[Math.floor(Math.random() * feedItems.length)]
      const ts = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      setFeed(prev => [`${next}  ${ts}`, ...prev].slice(0, 6))
    }, 12000)
    return () => clearInterval(id)
  }, [])

  /*  Team pulse (online members simulation)  */
  const [team] = useState([
    { name: 'Anika', role: 'Team Lead', status: 'active', color: '#6366f1' },
    { name: 'Mina', role: 'HR Partner', status: 'active', color: '#8b5cf6' },
    { name: 'Daniel', role: 'Engineer', status: 'idle', color: '#06b6d4' },
    { name: 'Rina', role: 'Designer', status: 'offline', color: '#f59e0b' },
    { name: 'Tom', role: 'Analyst', status: 'active', color: '#10b981' },
  ])

  /*  Derived  */
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 17 ? 'Good afternoon' : 'Good evening'
  const dateStr = now.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  const mySchedule = [
    { time: '09:30 AM', event: 'Daily standup', type: 'meeting' },
    { time: '11:00 AM', event: 'Project review with Anika', type: 'review' },
    { time: '02:00 PM', event: 'HR orientation session', type: 'training' },
    { time: '04:30 PM', event: 'Submit weekly report', type: 'task' },
  ]
  const priorityColor = { high: '#ef4444', medium: '#f59e0b', low: '#22c55e' }
  const priorityBg   = { high: '#fee2e2', medium: '#fef3c7', low: '#dcfce7' }
  const typeColor    = { meeting: '#6366f1', review: '#8b5cf6', training: '#06b6d4', task: '#f59e0b' }
  const typeBg       = { meeting: '#eef2ff', review: '#f5f3ff', training: '#ecfeff', task: '#fefce8' }
  const statusColor  = { active: '#22c55e', idle: '#f59e0b', offline: '#94a3b8' }

  /* Circular SVG progress helper */
  const CircleProgress = ({ pct, size = 80, stroke = 7, color = '#6366f1', children }) => {
    const r = (size - stroke) / 2
    const circ = 2 * Math.PI * r
    const dash = circ * pct / 100
    return (
      <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e2e8f0" strokeWidth={stroke} />
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
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
        <div style={{ position:'absolute', top:-40, right:-40, width:200, height:200, background:'rgba(255,255,255,0.07)', borderRadius:'50%' }} />
        <div style={{ position:'absolute', bottom:-50, right:140, width:140, height:140, background:'rgba(255,255,255,0.05)', borderRadius:'50%' }} />
        {/* Left: greeting */}
        <div style={{ zIndex: 1 }}>
          <p style={{ fontSize:'0.82rem', opacity:0.85, marginBottom:'4px', fontWeight:500 }}>{dateStr}</p>
          <h2 style={{ fontSize:'1.75rem', fontWeight:800, margin:'0 0 6px', letterSpacing:'-0.02em' }}>
            {greeting}, {user.name}! 
          </h2>
          <p style={{ opacity:0.88, fontSize:'0.92rem', margin:0 }}>Your real-time workspace is ready.</p>
        </div>
        {/* Centre: live clock */}
        <div style={{
          background:'rgba(255,255,255,0.13)', backdropFilter:'blur(12px)',
          borderRadius:'16px', padding:'14px 22px', textAlign:'center',
          border:'1px solid rgba(255,255,255,0.22)', zIndex:1, flexShrink:0,
        }}>
          <div style={{ fontSize:'1.8rem', fontWeight:800, fontVariantNumeric:'tabular-nums', lineHeight:1, letterSpacing:'0.04em' }}>
            {timeStr}
          </div>
          <div style={{ fontSize:'0.72rem', opacity:0.85, marginTop:'4px', fontWeight:600, letterSpacing:'0.05em', textTransform:'uppercase' }}>
            Live Clock
          </div>
        </div>
        {/* Right: monthly score */}
        <div style={{
          background:'rgba(255,255,255,0.13)', backdropFilter:'blur(12px)',
          borderRadius:'16px', padding:'14px 22px', textAlign:'center',
          border:'1px solid rgba(255,255,255,0.22)', zIndex:1, flexShrink:0,
        }}>
          <div style={{ fontSize:'1.8rem', fontWeight:800, lineHeight:1 }}>92%</div>
          <div style={{ fontSize:'0.72rem', opacity:0.85, marginTop:'4px', fontWeight:600, letterSpacing:'0.05em', textTransform:'uppercase' }}>Monthly Score</div>
          {socketConnected && (
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'4px', marginTop:'6px', fontSize:'0.7rem', opacity:0.9 }}>
              <span style={{ width:6, height:6, background:'#4ade80', borderRadius:'50%', display:'inline-block', animation:'pulse 1.5s infinite' }} />
              Live
            </div>
          )}
        </div>
      </div>

      {/* -- ROW 1: Stats cards ----------------------------------- */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'16px' }}>
        {[
          { label:'My Attendance', value: attendance?.summary || '97% weekly', detail:'this week', icon:'-', grad:'linear-gradient(135deg,#6366f1,#8b5cf6)' },
          { label:'Leave Balance',  value: leaveData?.balance || '14 days',    detail:'remaining this year', icon:'*', grad:'linear-gradient(135deg,#34d399,#059669)' },
          { label:'Net Salary',     value: payroll?.items?.[0]?.value || '4,820', detail:'current month', icon:'*', grad:'linear-gradient(135deg,#fbbf24,#f59e0b)' },
          { label:'Tasks Done',     value: `${doneTasks}/${tasks.length}`,     detail:'completed today', icon:'*', grad:'linear-gradient(135deg,#38bdf8,#6366f1)' },
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
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'16px' }}>

        {/* Work Session */}
        <article className="panel-card" style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'14px' }}>
          <div className="panel-header" style={{ width:'100%' }}>
            <h3>Work Session</h3>
            <span className="pill" style={{ background: checkedIn ? '#dcfce7' : '#f1f5f9', color: checkedIn ? '#16a34a' : '#64748b' }}>
              {checkedIn ? ' Active' : ' Idle'}
            </span>
          </div>
          <CircleProgress pct={workHoursPct} size={90} color={checkedIn ? '#6366f1' : '#cbd5e1'}>
            <span style={{ fontSize:'0.75rem', fontWeight:700, color: checkedIn ? '#6366f1' : '#94a3b8' }}>{workHoursPct}%</span>
          </CircleProgress>
          <div style={{ fontFamily:'monospace', fontSize:'1.6rem', fontWeight:800, color:'#1e293b', letterSpacing:'0.06em' }}>
            {fmtElapsed(elapsed)}
          </div>
          <div style={{ fontSize:'0.75rem', color:'#94a3b8', marginTop:'-8px' }}>of 8h target</div>
          <button
            type="button"
            onClick={handleWorkSessionToggle}
            disabled={checkInLoading}

            style={{
              width:'100%', padding:'10px', borderRadius:'12px', border:'none', cursor:'pointer',
              fontWeight:700, fontSize:'0.88rem', letterSpacing:'0.02em',
              background: checkedIn ? 'linear-gradient(135deg,#ef4444,#dc2626)' : 'linear-gradient(135deg,#6366f1,#8b5cf6)',
              color:'#fff', transition:'opacity 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity='0.88'}
            onMouseLeave={e => e.currentTarget.style.opacity='1'}
          >
            {checkInLoading ? ' Processing...' : (checkedIn ? ' Check Out' : ' Check In')}
          </button>
        </article>

        {/* Pomodoro Focus Timer */}
        <article className="panel-card" style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'14px' }}>
          <div className="panel-header" style={{ width:'100%' }}>
            <h3>Focus Timer</h3>
            <span className="pill" style={{ background: pomoMode==='work' ? '#eef2ff' : '#ecfeff', color: pomoMode==='work' ? '#6366f1' : '#06b6d4' }}>
              {pomoMode==='work' ? ' Focus' : '- Break'}  #{pomoCycles + 1}
            </span>
          </div>
          <CircleProgress pct={pomoPct} size={90} color={pomoMode==='work' ? '#6366f1' : '#06b6d4'}>
            <span style={{ fontSize:'0.72rem', fontWeight:700, color: pomoMode==='work' ? '#6366f1' : '#06b6d4' }}>{pomoPct}%</span>
          </CircleProgress>
          <div style={{ fontFamily:'monospace', fontSize:'1.6rem', fontWeight:800, color:'#1e293b', letterSpacing:'0.06em' }}>
            {fmtPomo(pomoSec)}
          </div>
          <div style={{ fontSize:'0.75rem', color:'#94a3b8', marginTop:'-8px' }}>
            {pomoMode==='work' ? '25 min deep work' : '5 min break'}
          </div>
          <div style={{ display:'flex', gap:'8px', width:'100%' }}>
            <button type="button" onClick={() => setPomoRunning(r => !r)} style={{
              flex:1, padding:'10px', borderRadius:'12px', border:'none', cursor:'pointer',
              fontWeight:700, fontSize:'0.88rem',
              background: pomoRunning ? 'linear-gradient(135deg,#f59e0b,#d97706)' : 'linear-gradient(135deg,#6366f1,#8b5cf6)',
              color:'#fff',
            }}>
              {pomoRunning ? ' Pause' : ' Start'}
            </button>
            <button type="button" onClick={() => { setPomoRunning(false); setPomoSec(POMO_WORK); setPomoMode('work') }} style={{
              padding:'10px 14px', borderRadius:'12px', border:'1px solid #e2e8f0', background:'#f8fafc', cursor:'pointer', fontSize:'0.88rem',
            }}></button>
          </div>
          <div style={{ display:'flex', gap:'4px' }}>
            {[...Array(4)].map((_, i) => (
              <div key={i} style={{ width:10, height:10, borderRadius:'50%', background: i < pomoCycles % 4 ? '#6366f1' : '#e2e8f0' }} />
            ))}
          </div>
        </article>

        {/* Today's Work Hours Bar */}
        <article className="panel-card" style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
          <div className="panel-header">
            <h3>Daily Progress</h3>
          </div>
          {[
            { label:'Work Hours', pct: workHoursPct, color:'#6366f1', value: `${Math.floor(elapsed/3600)}h ${Math.floor((elapsed%3600)/60)}m` },
            { label:'Tasks Done', pct: taskPct, color:'#10b981', value: `${doneTasks}/${tasks.length}` },
            { label:'Attendance',  pct: 97, color:'#f59e0b', value:'97%' },
            { label:'Focus Time',  pct: Math.min(100, pomoCycles * 25), color:'#8b5cf6', value: `${pomoCycles * 25} min` },
          ].map(bar => (
            <div key={bar.label}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'5px' }}>
                <span style={{ fontSize:'0.78rem', fontWeight:600, color:'#475569' }}>{bar.label}</span>
                <span style={{ fontSize:'0.78rem', fontWeight:700, color: bar.color }}>{bar.value}</span>
              </div>
              <div style={{ height:8, borderRadius:99, background:'#f1f5f9', overflow:'hidden' }}>
                <div style={{
                  height:'100%', borderRadius:99, width:`${bar.pct}%`,
                  background: bar.color,
                  transition:'width 0.8s ease',
                }} />
              </div>
            </div>
          ))}

          {/* Team online status */}
          <div style={{ marginTop:'6px', paddingTop:'12px', borderTop:'1px solid #f1f5f9' }}>
            <div style={{ fontSize:'0.75rem', fontWeight:700, color:'#94a3b8', marginBottom:'8px', textTransform:'uppercase', letterSpacing:'0.06em' }}>Team Online</div>
            <div style={{ display:'flex', gap:'6px', flexWrap:'wrap' }}>
              {team.map(m => (
                <div key={m.name} title={`${m.name}  ${m.status}`} style={{
                  position:'relative', width:30, height:30, borderRadius:'50%',
                  background: m.color, display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:'0.7rem', fontWeight:800, color:'#fff', cursor:'default',
                }}>
                  {m.name[0]}
                  <span style={{
                    position:'absolute', bottom:0, right:0, width:8, height:8,
                    borderRadius:'50%', background: statusColor[m.status], border:'2px solid #fff',
                  }} />
                </div>
              ))}
            </div>
          </div>
        </article>
      </div>

      {/* -- ROW 3: Tasks + Schedule ------------------------------ */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>

        {/* Interactive Tasks */}
        <article className="panel-card">
          <div className="panel-header">
            <h3>My Tasks</h3>
            <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
              <div style={{ height:6, width:60, borderRadius:99, background:'#f1f5f9', overflow:'hidden' }}>
                <div style={{ height:'100%', width:`${taskPct}%`, background:'linear-gradient(90deg,#6366f1,#8b5cf6)', transition:'width 0.5s' }} />
              </div>
              <span className="pill">{doneTasks}/{tasks.length}</span>
            </div>
          </div>
          <ul style={{ listStyle:'none', padding:0, margin:'0 0 12px', display:'flex', flexDirection:'column', gap:'8px' }}>
            {tasks.map(task => (
              <li key={task.id}
                onClick={() => toggleTask(task.id)}
                style={{
                  display:'flex', alignItems:'center', gap:'10px', padding:'10px 12px',
                  borderRadius:'10px', cursor:'pointer', userSelect:'none',
                  background: task.done ? '#f8fafc' : '#fff',
                  border: `1px solid ${task.done ? '#f1f5f9' : '#e8eaf0'}`,
                  transition:'all 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = task.done ? '#f0f4f8' : '#f8f8ff'}
                onMouseLeave={e => e.currentTarget.style.background = task.done ? '#f8fafc' : '#fff'}
              >
                <div style={{
                  width:18, height:18, borderRadius:'50%', flexShrink:0,
                  border: task.done ? 'none' : '2px solid #cbd5e1',
                  background: task.done ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'transparent',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  transition:'all 0.2s',
                }}>
                  {task.done && <span style={{ color:'#fff', fontSize:'10px', fontWeight:900 }}></span>}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:'0.85rem', fontWeight:600, color: task.done ? '#94a3b8' : '#1e293b', textDecoration: task.done ? 'line-through' : 'none', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {task.title}
                  </div>
                  <div style={{ fontSize:'0.73rem', color:'#94a3b8', marginTop:'1px' }}>Due: {task.due}</div>
                </div>
                <span style={{ fontSize:'0.68rem', fontWeight:700, padding:'2px 7px', borderRadius:'6px', color: priorityColor[task.priority], background: priorityBg[task.priority], flexShrink:0, textTransform:'capitalize' }}>
                  {task.priority}
                </span>
              </li>
            ))}
          </ul>
          {/* Add task inline */}
          <form onSubmit={addTask} style={{ display:'flex', gap:'8px' }}>
            <input
              type="text" value={newTask} onChange={e => setNewTask(e.target.value)}
              placeholder="+ Add a new task"
              style={{ flex:1, padding:'8px 12px', border:'1px dashed #cbd5e1', borderRadius:'10px', fontSize:'0.85rem', outline:'none', color:'#1e293b', background:'#fafafe' }}
            />
            <button type="submit" style={{ padding:'8px 14px', background:'linear-gradient(135deg,#6366f1,#8b5cf6)', color:'#fff', border:'none', borderRadius:'10px', cursor:'pointer', fontWeight:700, fontSize:'0.85rem' }}>
              Add
            </button>
          </form>
        </article>

        {/* Today's Schedule */}
        <article className="panel-card">
          <div className="panel-header">
            <h3>Today's Schedule</h3>
            <span className="pill">4 events</span>
          </div>
          <ul style={{ listStyle:'none', padding:0, margin:0, display:'flex', flexDirection:'column', gap:'10px' }}>
            {mySchedule.map((s, i) => {
              const [hStr, rest] = s.time.split(':')
              const [mStr, ampm] = rest.split(' ')
              let hr = parseInt(hStr)
              if (ampm === 'PM' && hr !== 12) hr += 12
              if (ampm === 'AM' && hr === 12) hr = 0
              const eventDate = new Date(); eventDate.setHours(hr, parseInt(mStr), 0, 0)
              const isPast = now > eventDate
              const isCurrent = Math.abs(now - eventDate) < 60 * 60 * 1000 && !isPast
              return (
                <li key={i} style={{
                  display:'flex', alignItems:'center', gap:'12px', padding:'10px 12px',
                  borderRadius:'10px', border:`1px solid ${isCurrent ? '#c7d2fe' : '#f1f5f9'}`,
                  background: isCurrent ? '#eef2ff' : isPast ? '#f8fafc' : '#fafafe',
                  opacity: isPast ? 0.6 : 1,
                  transition:'all 0.3s',
                }}>
                  {isCurrent && <span style={{ width:6, height:6, borderRadius:'50%', background:'#6366f1', flexShrink:0, animation:'pulse 1.5s infinite' }} />}
                  <div style={{ fontSize:'0.7rem', fontWeight:700, color:'#6366f1', minWidth:'68px', background:'#eef2ff', padding:'4px 8px', borderRadius:'6px', textAlign:'center' }}>
                    {s.time}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:'0.87rem', fontWeight:600, color: isPast ? '#94a3b8' : '#1e293b' }}>{s.event}</div>
                    {isCurrent && <div style={{ fontSize:'0.72rem', color:'#6366f1', fontWeight:600, marginTop:'2px' }}>Happening now</div>}
                    {isPast && <div style={{ fontSize:'0.72rem', color:'#94a3b8', marginTop:'2px' }}>Completed</div>}
                  </div>
                  <span style={{ fontSize:'0.68rem', fontWeight:700, padding:'2px 8px', borderRadius:'6px', color: typeColor[s.type], background: typeBg[s.type], flexShrink:0, textTransform:'capitalize' }}>
                    {s.type}
                  </span>
                </li>
              )
            })}
          </ul>
        </article>
      </div>

      {/* -- ROW 4: Quick Actions + Live Feed + Team Pulse -------- */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'16px' }}>

        {/* Quick Actions */}
        <article className="panel-card">
          <div className="panel-header"><h3>Quick Actions</h3></div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
            {[
              { label:'Apply Leave',  icon:'*', color:'#059669', bg:'#d1fae5', href:'/leave' },
              { label:'View Payslip', icon:'*', color:'#d97706', bg:'#fef3c7', href:'/payroll' },
              { label:'Attendance',   icon:'-', color:'#6366f1', bg:'#eef2ff', href:'/attendance' },
              { label:'Team Chat',    icon:'*', color:'#8b5cf6', bg:'#f5f3ff', href:'/chat' },
              { label:'My Projects',  icon:'*', color:'#06b6d4', bg:'#ecfeff', href:'/projects' },
              { label:'View Profile', icon:'*', color:'#f59e0b', bg:'#fefce8', href:'/settings' },
            ].map(action => (
              <a key={action.label} href={action.href} style={{
                display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
                gap:'6px', padding:'14px 8px', borderRadius:'12px', background: action.bg,
                textDecoration:'none', transition:'transform 0.18s, box-shadow 0.18s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow='0 8px 20px rgba(0,0,0,0.09)' }}
              onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='none' }}
              >
                <span style={{ fontSize:'1.4rem' }}>{action.icon}</span>
                <span style={{ fontSize:'0.73rem', fontWeight:700, color: action.color, textAlign:'center' }}>{action.label}</span>
              </a>
            ))}
          </div>
        </article>

        {/* Live Activity Feed */}
        <article className="panel-card">
          <div className="panel-header">
            <h3>Live Activity</h3>
            {socketConnected
              ? <span className="pill" style={{ background:'#dcfce7', color:'#16a34a' }}> Live</span>
              : <span className="pill" style={{ background:'#f1f5f9', color:'#94a3b8' }}>Offline</span>}
          </div>
          <ul style={{ listStyle:'none', padding:0, margin:0, display:'flex', flexDirection:'column', gap:'8px' }}>
            {feed.map((item, i) => (
              <li key={i} style={{
                padding:'9px 12px', borderRadius:'10px', fontSize:'0.82rem', color:'#475569',
                display:'flex', alignItems:'flex-start', gap:'8px',
                background: i === 0 ? '#eef2ff' : '#f8fafc',
                border:`1px solid ${i === 0 ? '#c7d2fe' : '#f1f5f9'}`,
                transition:'all 0.4s',
              }}>
                <span style={{ color:'#6366f1', fontSize:'0.7rem', marginTop:'2px', flexShrink:0 }}></span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </article>

        {/* Team Pulse */}
        <article className="panel-card">
          <div className="panel-header">
            <h3>Team Pulse</h3>
            <span className="pill">{team.filter(m=>m.status==='active').length} online</span>
          </div>
          <ul style={{ listStyle:'none', padding:0, margin:0, display:'flex', flexDirection:'column', gap:'10px' }}>
            {team.map(m => (
              <li key={m.name} style={{ display:'flex', alignItems:'center', gap:'12px', padding:'8px 10px', borderRadius:'10px', background:'#fafafe', border:'1px solid #f1f5f9' }}>
                <div style={{ position:'relative', width:34, height:34, borderRadius:'50%', background: m.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.8rem', fontWeight:800, color:'#fff', flexShrink:0 }}>
                  {m.name[0]}
                  <span style={{ position:'absolute', bottom:0, right:0, width:9, height:9, borderRadius:'50%', background: statusColor[m.status], border:'2px solid #fff' }} />
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:'0.85rem', fontWeight:700, color:'#1e293b' }}>{m.name}</div>
                  <div style={{ fontSize:'0.73rem', color:'#94a3b8' }}>{m.role}</div>
                </div>
                <span style={{ fontSize:'0.7rem', fontWeight:700, color: statusColor[m.status], textTransform:'capitalize' }}>
                  {m.status === 'active' ? ' Active' : m.status === 'idle' ? ' Idle' : ' Away'}
                </span>
              </li>
            ))}
          </ul>
        </article>
      </div>

    </div>
  )
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

  const isHR = user?.role === 'hr' || user?.role === 'super_admin';
  const checkIns = attendance?.checkIns || {};
  const getLiveStatus = (employee) => {
    const userId = employee.userId || employee.user?._id || employee.user?.id;
    const record = userId ? checkIns[String(userId)] : null;
    if (record?.checkedIn) return { label: 'Active now', tone: 'active', detail: record.time ? 'Checked in at ' + record.time : 'Checked in' };
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
                      <span className={'attendance-status attendance-status-' + liveStatus.tone} title={liveStatus.detail}>
                        {liveStatus.label}
                      </span>
                    );
                  })()}
                </td>
                {isHR && (
                  <td style={{ textAlign: 'right' }}>
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
    </>
  );
}

function ApprovalsPage({ user, API_BASE, triggerRefresh }) {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [formById, setFormById] = useState({});

  const canApprove = user.role === 'hr' || user.role === 'super_admin';

  const loadApprovals = () => {
    if (!canApprove) {
      setApprovals([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch(`${API_BASE}/api/approvals`, { headers: authHeaders() })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Unable to load approvals');
        return data;
      })
      .then((data) => {
        setApprovals(data);
        setFormById(Object.fromEntries(data.map((item) => [
          item.id,
          { department: item.department === 'General' ? '' : item.department, role: item.role === 'Employee' ? '' : item.role }
        ])));
        setMessage('');
      })
      .catch((err) => setMessage(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadApprovals();
  }, [user.id]);

  const updateForm = (id, field, value) => {
    setFormById((current) => ({
      ...current,
      [id]: { ...(current[id] || {}), [field]: value }
    }));
  };

  const handleDecision = async (id, decision) => {
    setMessage('');
    const form = formById[id] || {};
    const endpoint = decision === 'approve' ? 'approve' : 'reject';

    if (decision === 'approve' && (!form.department?.trim() || !form.role?.trim())) {
      setMessage('Department and role are required before approval.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/approvals/${id}/${endpoint}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ department: form.department, role: form.role })
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message || 'Approval update failed');
      setMessage(payload.message || 'Approval updated');
      loadApprovals();
      if (triggerRefresh) triggerRefresh();
    } catch (err) {
      setMessage(err.message);
    }
  };

  if (!canApprove) {
    return (
      <article className="panel-card">
        <div className="panel-header">
          <h3>Approvals</h3>
        </div>
        <p className="panel-copy">Only HR and admin accounts can manage employee approvals.</p>
      </article>
    );
  }

  return (
    <section className="panel-card">
      <div className="panel-header">
        <h3>Employee approvals</h3>
        <span className="pill">{approvals.length} pending</span>
      </div>
      {message && <p className="error-text" style={{ marginTop: 0 }}>{message}</p>}
      {loading ? (
        <p className="panel-copy">Loading approvals...</p>
      ) : approvals.length === 0 ? (
        <p className="panel-copy">No pending employee requests.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>Role</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {approvals.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.email}</td>
                  <td>
                    <input
                      type="text"
                      value={formById[item.id]?.department || ''}
                      onChange={(e) => updateForm(item.id, 'department', e.target.value)}
                      placeholder="Department"
                      style={{ width: '100%', minWidth: '140px', padding: '8px 10px', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={formById[item.id]?.role || ''}
                      onChange={(e) => updateForm(item.id, 'role', e.target.value)}
                      placeholder="Job role"
                      style={{ width: '100%', minWidth: '140px', padding: '8px 10px', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                    />
                  </td>
                  <td><span className="subtle-pill">{item.status}</span></td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '8px' }}>
                      <button type="button" className="primary-button" style={{ padding: '8px 12px' }} onClick={() => handleDecision(item.id, 'approve')}>
                        Approve
                      </button>
                      <button type="button" className="ghost-button" style={{ padding: '8px 12px', color: '#dc2626' }} onClick={() => handleDecision(item.id, 'reject')}>
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function AttendancePage({ attendance, user, API_BASE, triggerRefresh }) {
  const [status, setStatus] = useState({ checkedIn: false, time: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || !API_BASE) return;
    fetch(`${API_BASE}/api/attendance/status/${user.id}`, { headers: authHeaders() })
      .then((res) => res.json())
      .then((data) => setStatus(data))
      .catch(() => {});
  }, [user, API_BASE]);

  const handleCheckInToggle = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/attendance/checkin`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ userId: user.id, name: user.name })
      });
      const data = await response.json();
      setStatus({ checkedIn: data.checkedIn, time: data.time || '' });
      if (triggerRefresh) triggerRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="content-grid">
      <article className="panel-card">
        <div className="panel-header">
          <h3>Attendance snapshot</h3>
          <span className="pill">{attendance.summary}</span>
        </div>
        <ul className="list">
          {attendance.items.map((item) => (
            <li key={item.label}>{item.label}: {item.value}</li>
          ))}
        </ul>

        <div className="checkin-container" style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
          <p className="panel-copy" style={{ marginBottom: '12px' }}>
            {status.checkedIn 
              ? `Status: Checked In today at ${status.time}` 
              : 'Status: Not Checked In today'}
          </p>
          <button 
            type="button" 
            className={`submit-button ${status.checkedIn ? 'danger-btn' : ''}`}
            onClick={handleCheckInToggle}
            disabled={loading}
            style={{ width: 'auto', padding: '10px 24px', background: status.checkedIn ? '#ef4444' : 'linear-gradient(135deg, #4338ca, #8b5cf6)' }}
          >
            {loading ? 'Processing...' : (status.checkedIn ? 'Check Out' : 'Check In Now')}
          </button>
        </div>
      </article>
      <article className="panel-card">
        <div className="panel-header">
          <h3>Shift calendar</h3>
        </div>
        <ul className="list">
          {attendance.schedule.map((item) => (
            <li key={item.title}>{item.title}  {item.time}</li>
          ))}
        </ul>
      </article>
    </section>
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

function PayrollPage({ payroll }) {
  return (
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
        </div>
        <ul className="list">
          {payroll.payslips.map((item) => (
            <li key={item.name}>{item.name}  {item.date}</li>
          ))}
        </ul>
      </article>
    </section>
  )
}

function RecruitmentPage({ recruitment }) {
  return (
    <section className="content-grid">
      <article className="panel-card">
        <div className="panel-header">
          <h3>Open positions</h3>
          <span className="pill">{recruitment.openRoles} active</span>
        </div>
        <ul className="list">
          {recruitment.positions.map((job) => (
            <li key={job.title}>{job.title}  {job.stage}</li>
          ))}
        </ul>
      </article>
      <article className="panel-card">
        <div className="panel-header">
          <h3>Pipeline health</h3>
        </div>
        <ul className="list">
          {recruitment.pipeline.map((item) => (
            <li key={item.label}>{item.label}: {item.value}</li>
          ))}
        </ul>
      </article>
    </section>
  )
}

function ProjectsPage({ projects, user, API_BASE, triggerRefresh }) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [summary, setSummary] = useState('');
  const [owner, setOwner] = useState('');
  const [deadline, setDeadline] = useState('');
  const [budget, setBudget] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE}/api/projects`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ name, summary, owner, deadline, budget })
      });
      if (response.ok) {
        setName('');
        setSummary('');
        setOwner('');
        setDeadline('');
        setBudget('');
        setShowForm(false);
        if (triggerRefresh) triggerRefresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const isHR = user.role === 'hr' || user.role === 'super_admin';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {isHR && (
        <div style={{ alignSelf: 'flex-start' }}>
          {!showForm ? (
            <button type="button" className="primary-button" onClick={() => setShowForm(true)}>
              + Add New Project
            </button>
          ) : (
            <article className="panel-card" style={{ maxWidth: '500px', marginTop: '10px' }}>
              <div className="panel-header" style={{ marginBottom: '16px' }}>
                <h3>Add New Project</h3>
              </div>
              <form onSubmit={handleSubmit} className="auth-form-new" style={{ gap: '12px' }}>
                <div className="form-group">
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Project name" required />
                </div>
                <div className="form-group">
                  <input type="text" value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Summary" required />
                </div>
                <div className="form-group">
                  <input type="text" value={owner} onChange={(e) => setOwner(e.target.value)} placeholder="Owner Name" />
                </div>
                <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} placeholder="Deadline" />
                  <input type="text" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="Budget (e.g. $180k)" />
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="submit" className="submit-button" disabled={submitting} style={{ marginTop: 0, flex: 1 }}>
                    {submitting ? 'Creating...' : 'Create'}
                  </button>
                  <button type="button" className="google-login-button" onClick={() => setShowForm(false)} style={{ marginBottom: 0, flex: 1 }}>
                    Cancel
                  </button>
                </div>
              </form>
            </article>
          )}
        </div>
      )}

      <section className="content-grid">
        {projects.map((project) => (
          <article key={project.name} className="panel-card">
            <div className="panel-header">
              <h3>{project.name}</h3>
              <span className="pill">{project.progress}</span>
            </div>
            <p className="panel-copy">{project.summary}</p>
            <ul className="list">
              <li>Owner: {project.owner}</li>
              <li>Deadline: {project.deadline}</li>
              <li>Budget: {project.budget}</li>
            </ul>
          </article>
        ))}
      </section>
    </div>
  )
}

function ChatPage({ notifications, user, API_BASE, socket }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    if (!API_BASE) return;
    fetch(`${API_BASE}/api/chat/messages`, { headers: authHeaders() })
      .then((res) => res.json())
      .then((data) => setMessages(data))
      .catch(() => {});
  }, [API_BASE]);

  useEffect(() => {
    if (!socket) return;

    const handleChatMessage = (msg) => {
      setMessages((prev) => [...prev, msg]);
    };

    socket.on('chat_message', handleChatMessage);

    return () => {
      socket.off('chat_message', handleChatMessage);
    };
  }, [socket]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket) return;

    socket.emit('send_message', {
      sender: user.name,
      text: newMessage
    });
    setNewMessage('');
  };

  return (
    <section className="content-grid">
      <article className="panel-card" style={{ display: 'flex', flexDirection: 'column', height: '480px' }}>
        <div className="panel-header">
          <h3>Team collaboration</h3>
          <span className="pill">Live Chat</span>
        </div>
        
        <div className="chat-messages" style={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
          {messages.map((msg, index) => {
            const isMe = msg.sender === user.name;
            return (
              <div key={index} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '75%', display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '2px' }}>{msg.sender}  {msg.time}</span>
                <div style={{ background: isMe ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : '#f1f5f9', color: isMe ? '#fff' : '#1e293b', padding: '8px 14px', borderRadius: isMe ? '16px 16px 2px 16px' : '16px 16px 16px 2px', fontSize: '0.95rem' }}>
                  {msg.text}
                </div>
              </div>
            );
          })}
        </div>

        <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
          <input 
            type="text" 
            value={newMessage} 
            onChange={(e) => setNewMessage(e.target.value)} 
            placeholder="Type your message..." 
            required 
            style={{ flexGrow: 1, padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: '10px', outline: 'none', fontSize: '0.95rem' }} 
          />
          <button type="submit" className="primary-button" style={{ borderRadius: '10px', padding: '10px 20px' }}>
            Send
          </button>
        </form>
      </article>
      <article className="panel-card">
        <div className="panel-header">
          <h3>Notifications center</h3>
        </div>
        <ul className="list">
          {notifications.map((item, index) => (
            <li key={index}>{item.title}  {item.time}</li>
          ))}
        </ul>
      </article>
    </section>
  )
}

function SettingsPage({ user }) {
  return (
    <section className="content-grid">
      <article className="panel-card">
        <div className="panel-header">
          <h3>Profile</h3>
          <span className="pill">{user.role}</span>
        </div>
        <ul className="list">
          <li>Name: {user.name}</li>
          <li>Email: {user.email}</li>
          <li>Authentication: {user.isGoogle ? 'Connected via Google' : 'Email / Password'}</li>
          <li>Timezone: UTC+5:30</li>
        </ul>
      </article>
      <article className="panel-card">
        <div className="panel-header">
          <h3>Security controls</h3>
        </div>
        <ul className="list">
          <li>2FA enabled</li>
          <li>Device management active</li>
          <li>Audit logs enabled</li>
        </ul>
      </article>
    </section>
  )
}

function App() {
  const [user, setUser] = useState(getStoredUser)
  const [dashboardData, setDashboardData] = useState({ totalEmployees: 248, attendance: '92%', pendingLeaves: 7, payrollStatus: '8 batches' })
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
  const [liveActivity, setLiveActivity] = useState(['Attendance sync complete', 'Payroll review scheduled', 'Recruitment funnel updated'])
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
        const [dashboardRes, employeesRes, attendanceRes, leaveRes, payrollRes, recruitmentRes, projectsRes, notificationsRes] = responses
        return {
          dashboard: await dashboardRes.json(),
          employees: await employeesRes.json(),
          attendance: await attendanceRes.json(),
          leave: await leaveRes.json(),
          payroll: await payrollRes.json(),
          recruitment: await recruitmentRes.json(),
          projects: await projectsRes.json(),
          notifications: await notificationsRes.json()
        }
      })
      .then((payload) => {
        if (payload.dashboard?.[user.role]) {
          setDashboardData(payload.dashboard[user.role])
        }
        setEmployees(payload.employees)
        setAttendance(payload.attendance)
        setLeaveData(payload.leave)
        setPayroll(payload.payroll)
        setRecruitment(payload.recruitment)
        setProjects(payload.projects)
        setNotifications(payload.notifications)
      })
      .catch(() => {
        setDashboardData({ totalEmployees: 248, attendance: '92%', pendingLeaves: 7, payrollStatus: '8 batches' })
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
        setLiveActivity((current) => [message, ...current].slice(0, 6))
        setNotifications((current) => [{ title: message, time: 'just now' }, ...current].slice(0, 6))
      }
      loadData()
    }

    socketInstance.on('connect', () => {
      setSocketConnected(true)
      socketInstance.emit('join_room', user.role)
      setLiveActivity((current) => ['Real-time connection active', ...current].slice(0, 6))
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
    socketInstance.on('approval_updated', () => handleRealtimeRefresh('Approval status updated'))
    socketInstance.on('attendance_updated', () => handleRealtimeRefresh('Attendance status updated'))
    socketInstance.on('project_added', () => handleRealtimeRefresh('Project list updated'))

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
                ...current,
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
            ...current,
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
          <Route path="/" element={<ProtectedRoute user={user}>{user.role === 'employee' ? <EmployeeDashboardPage user={user} leaveData={leaveData} payroll={payroll} attendance={attendance} liveActivity={liveActivity} socketConnected={socketConnected} triggerRefresh={loadData} /> : <DashboardPage user={user} dashboardData={dashboardData} liveActivity={liveActivity} socketConnected={socketConnected} />}</ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute user={user}>{user.role === 'employee' ? <EmployeeDashboardPage user={user} leaveData={leaveData} payroll={payroll} attendance={attendance} liveActivity={liveActivity} socketConnected={socketConnected} triggerRefresh={loadData} /> : <DashboardPage user={user} dashboardData={dashboardData} liveActivity={liveActivity} socketConnected={socketConnected} />}</ProtectedRoute>} />
          <Route path="/employees" element={<ProtectedRoute user={user}><EmployeesPage employees={employees} attendance={attendance} API_BASE={API_BASE} triggerRefresh={loadData} user={user} /></ProtectedRoute>} />
          <Route path="/approvals" element={<ProtectedRoute user={user}><ApprovalsPage user={user} API_BASE={API_BASE} triggerRefresh={loadData} /></ProtectedRoute>} />
          <Route path="/attendance" element={<ProtectedRoute user={user}><AttendancePage attendance={attendance} user={user} API_BASE={API_BASE} triggerRefresh={loadData} /></ProtectedRoute>} />
          <Route path="/leave" element={<ProtectedRoute user={user}><LeavePage leaveData={leaveData} user={user} API_BASE={API_BASE} triggerRefresh={loadData} /></ProtectedRoute>} />
          <Route path="/payroll" element={<ProtectedRoute user={user}><PayrollPage payroll={payroll} /></ProtectedRoute>} />
          <Route path="/recruitment" element={<ProtectedRoute user={user}><RecruitmentPage recruitment={recruitment} /></ProtectedRoute>} />
          <Route path="/projects" element={<ProtectedRoute user={user}><ProjectsPage projects={projects} user={user} API_BASE={API_BASE} triggerRefresh={loadData} /></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute user={user}><ChatPage notifications={notifications} user={user} API_BASE={API_BASE} socket={socket} /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute user={user}><SettingsPage user={user} /></ProtectedRoute>} />
          {/* Redirect /login and any unknown route to dashboard after login */}
          <Route path="/login" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  )
}

export default App























