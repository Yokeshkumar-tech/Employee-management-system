import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { Server } from 'socket.io';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { connectDB } from './config/db.js';
import { protect } from './middleware/auth.js';

import User from './models/User.js';
import Employee from './models/Employee.js';
import Project from './models/Project.js';
import LeaveRequest from './models/LeaveRequest.js';
import CheckIn from './models/CheckIn.js';
import Regularization from './models/Regularization.js';
import Notification from './models/Notification.js';
import ChatMessage from './models/ChatMessage.js';
import PayrollRecord from './models/PayrollRecord.js';
import RecruitmentRole from './models/RecruitmentRole.js';
import Meeting from './models/Meeting.js';
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE'] }
});
const port = process.env.PORT || 5000;

// Connect to Database
connectDB();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: true, credentials: true }));
app.use(compression());
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());

// Static Mock Data for parts not fully dynamic yet
let attendanceStats = {
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
};

let leaveStats = {
  balance: '14 days',
  items: [
    { label: 'Casual', value: '6 left' },
    { label: 'Sick', value: '4 left' },
    { label: 'Annual', value: '4 left' }
  ]
};

let payrollData = {
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
};

let recruitmentData = {
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
};

// Socket.io Events Setup
io.on('connection', (socket) => {
  socket.on('join_room', (role) => {
    socket.join(role);
    socket.emit('notification', `Connected to ${role} workspace`);
  });

  socket.on('send_message', async (msg) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const chatMsg = new ChatMessage({
      sender: msg.sender,
      text: msg.text,
      time
    });
    await chatMsg.save();

    io.emit('chat_message', chatMsg);
  });

  const timer = setInterval(() => {
    socket.emit('notification', 'Live sync update: attendance and metrics refreshed');
  }, 30000);

  socket.on('disconnect', () => clearInterval(timer));
});

async function addNotification(title) {
  const time = 'Just now';
  const notification = new Notification({ title, time });
  await notification.save();
  io.emit('notification', title);
}

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '30d' });
};

const sampleEmployeeNames = ['Alicia Stone', 'Daniel Kim', 'Nadia Flores', 'Sanjay Rao', 'Leo Brooks'];
const sampleEmployeeNameSet = new Set(sampleEmployeeNames.map((name) => name.toLowerCase()));

function isSampleEmployee(employee) {
  return sampleEmployeeNameSet.has(String(employee.name || '').toLowerCase());
}

function hashText(text) {
  return String(text || '').split('').reduce((total, char) => total + char.charCodeAt(0), 0);
}

function buildEmployeePayroll(employee) {
  const seed = hashText(employee._id || employee.id || employee.name);
  const baseSalary = 3600 + (seed % 7) * 420;
  const bonus = 250 + (seed % 5) * 75;
  const deductions = Math.round(baseSalary * 0.08) + (seed % 4) * 35;
  const netSalary = baseSalary + bonus - deductions;
  const accountSuffix = String(1000 + (seed % 9000));

  return {
    id: String(employee._id || employee.id),
    name: employee.name,
    role: employee.role,
    department: employee.department,
    status: employee.status,
    bankName: ['HDFC Bank', 'ICICI Bank', 'Axis Bank', 'SBI'][seed % 4],
    accountNumber: `XXXX-${accountSuffix}`,
    ifsc: `EMS${String(seed % 10000).padStart(4, '0')}`,
    baseSalary,
    bonus,
    deductions,
    netSalary,
    currency: '$',
    payStatus: payrollData.status === 'Released' ? 'Transferred' : 'Ready'
  };
}

app.get('/api/health', (_req, res) => res.json({ ok: true, message: 'Employee Management API is running' }));

app.get('/api/dashboard', async (req, res) => {
  try {
    const role = req.query.role || 'super_admin';
    const totalEmployeesCount = await Employee.countDocuments();
    const pendingLeavesCount = await LeaveRequest.countDocuments({ status: 'Pending' });

    const payload = {
      super_admin: { totalEmployees: totalEmployeesCount, attendance: '92%', pendingLeaves: pendingLeavesCount, payrollStatus: '8 batches' },
      hr: { totalEmployees: totalEmployeesCount, attendance: '95%', pendingLeaves: pendingLeavesCount, payrollStatus: '5 batches' },
      employee: { totalEmployees: totalEmployeesCount, attendance: '96%', pendingLeaves: pendingLeavesCount, payrollStatus: 'Current month' }
    };

    res.json(payload[role] ? { [role]: payload[role] } : payload);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/employees', async (_req, res) => {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 });
    res.json(employees.filter((employee) => !isSampleEmployee(employee)).map(e => ({ ...e.toObject(), id: e._id })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
app.get('/api/employees/export', protect, async (_req, res) => {
  try {
    const employees = (await Employee.find().sort({ createdAt: -1 }).lean()).filter((employee) => !isSampleEmployee(employee));
    const headers = ['Name', 'Role', 'Department', 'Status', 'Created At'];
    const escapeCsvValue = (value) => {
      const text = value === null || value === undefined ? '' : String(value);
      return `"${text.replace(/"/g, '""')}"`;
    };
    const rows = employees.map((employee) => [
      employee.name,
      employee.role,
      employee.department,
      employee.status,
      employee.createdAt ? new Date(employee.createdAt).toISOString() : ''
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCsvValue).join(','))
      .join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="employees.csv"');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/employees', protect, async (req, res) => {
  try {
    const { name, role, department, status } = req.body || {};
    if (!name || !role || !department) return res.status(400).json({ message: 'Name, role, and department are required' });

    const newEmployee = new Employee({ name, role, department, status: status || 'Active' });
    await newEmployee.save();

    await addNotification(`New employee added: ${name}`);
    io.emit('employee_added', newEmployee); // Real-time
    res.status(201).json(newEmployee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/employees/:id/move', protect, async (req, res) => {
  try {
    const { department, role } = req.body || {};
    if (!department || !role) return res.status(400).json({ message: 'Department and role are required' });

    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    const oldDept = employee.department;
    const oldRole = employee.role;
    employee.department = department;
    employee.role = role;
    await employee.save();

    await addNotification(`Employee ${employee.name} moved from ${oldDept} (${oldRole}) to ${department} (${role})`);
    io.emit('employee_moved', employee);
    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── Approval Routes (Two-Stage: HR → Admin) ─────────────────────────────────

// GET all approvals (Pending, HR Approved, HR Rejected, Admin Approved, Admin Rejected)
app.get('/api/approvals', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || (user.role !== 'hr' && user.role !== 'super_admin')) {
      return res.status(403).json({ message: 'Forbidden. HR/Admin access required.' });
    }

    // Fetch employees that are in any approval stage OR have Pending status
    const records = await Employee.find({
      $or: [
        { status: 'Pending' },
        { approvalStage: { $in: ['Pending', 'HR Approved', 'HR Rejected', 'Admin Approved', 'Admin Rejected'] } }
      ]
    })
      .populate('userId', 'email')
      .sort({ requestedAt: -1 });

    res.json(records.map(e => ({
      id: e._id,
      name: e.name,
      role: e.role,
      department: e.department,
      // approvalStage takes priority; fall back to 'Pending' if status is Pending
      status: e.approvalStage || (e.status === 'Pending' ? 'Pending' : null),
      email: e.userId?.email || 'N/A',
      requestedAt: e.requestedAt ? new Date(e.requestedAt).toISOString().split('T')[0] : (e.createdAt ? new Date(e.createdAt).toISOString().split('T')[0] : '—')
    })).filter(e => e.status !== null));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// STAGE 1 – HR approves (Pending → HR Approved)
app.put('/api/approvals/:id/approve', protect, async (req, res) => {
  try {
    const hrUser = await User.findById(req.user.id);
    if (!hrUser || (hrUser.role !== 'hr' && hrUser.role !== 'super_admin')) {
      return res.status(403).json({ message: 'Forbidden. HR/Admin access required.' });
    }

    const { department, role } = req.body || {};
    if (!department || !role) {
      return res.status(400).json({ message: 'Department and Role are required for HR approval.' });
    }

    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: 'Employee request not found.' });

    if (employee.approvalStage && employee.approvalStage !== 'Pending') {
      return res.status(409).json({ message: `Cannot HR-approve: current stage is "${employee.approvalStage}".` });
    }

    employee.approvalStage = 'HR Approved';
    employee.department = department;
    employee.role = role;
    // keep status as 'Pending' so employee is NOT yet active — awaiting admin
    await employee.save();

    await addNotification(`HR approved: ${employee.name} → awaiting Admin sign-off`);
    io.emit('approval_updated', { id: employee._id, stage: 'HR Approved', name: employee.name });
    res.json({ message: `${employee.name} HR-approved. Forwarded to Admin for final sign-off.`, employee });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// STAGE 1 – HR rejects (Pending → HR Rejected)
app.put('/api/approvals/:id/reject', protect, async (req, res) => {
  try {
    const hrUser = await User.findById(req.user.id);
    if (!hrUser || (hrUser.role !== 'hr' && hrUser.role !== 'super_admin')) {
      return res.status(403).json({ message: 'Forbidden. HR/Admin access required.' });
    }

    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: 'Employee request not found.' });

    employee.approvalStage = 'HR Rejected';
    employee.status = 'Rejected';
    await employee.save();

    await addNotification(`HR rejected: ${employee.name}`);
    io.emit('approval_updated', { id: employee._id, stage: 'HR Rejected', name: employee.name });
    res.json({ message: `${employee.name}'s request was rejected by HR.`, employee });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// STAGE 2 – Admin final approve (HR Approved → Admin Approved → Active)
app.put('/api/approvals/:id/admin-approve', protect, async (req, res) => {
  try {
    const adminUser = await User.findById(req.user.id);
    if (!adminUser || adminUser.role !== 'super_admin') {
      return res.status(403).json({ message: 'Forbidden. Super Admin access required.' });
    }

    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: 'Employee request not found.' });

    if (employee.approvalStage !== 'HR Approved') {
      return res.status(409).json({ message: `Cannot Admin-approve: current stage is "${employee.approvalStage || employee.status}". Requires "HR Approved" first.` });
    }

    employee.approvalStage = 'Admin Approved';
    employee.status = 'Active'; // Employee is now fully onboarded
    await employee.save();

    await addNotification(`Admin approved: ${employee.name} is now Active in ${employee.department}`);
    io.emit('approval_updated', { id: employee._id, stage: 'Admin Approved', name: employee.name });
    io.emit('employee_added', employee); // Trigger employee list refresh
    res.json({ message: `${employee.name} fully approved by Admin. Employee is now Active.`, employee });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// STAGE 2 – Admin final reject (HR Approved → Admin Rejected)
app.put('/api/approvals/:id/admin-reject', protect, async (req, res) => {
  try {
    const adminUser = await User.findById(req.user.id);
    if (!adminUser || adminUser.role !== 'super_admin') {
      return res.status(403).json({ message: 'Forbidden. Super Admin access required.' });
    }

    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: 'Employee request not found.' });

    employee.approvalStage = 'Admin Rejected';
    employee.status = 'Rejected';
    await employee.save();

    await addNotification(`Admin rejected: ${employee.name}`);
    io.emit('approval_updated', { id: employee._id, stage: 'Admin Rejected', name: employee.name });
    res.json({ message: `${employee.name} was finally rejected by Admin.`, employee });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Helper to parse time strings and calculate hours worked
function calculateHours(checkIn, checkOut, breakMin = 0) {
  if (!checkIn || !checkOut) return 0;
  const parseTime = (timeStr) => {
    const cleanStr = timeStr.trim().toLowerCase();
    const modifier = cleanStr.endsWith('pm') ? 'pm' : 'am';
    const timeOnly = cleanStr.replace(/[ap]m/, '').trim();
    let [hours, minutes] = timeOnly.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) return 0;
    if (modifier === 'pm' && hours < 12) hours += 12;
    if (modifier === 'am' && hours === 12) hours = 0;
    return hours * 60 + minutes;
  };
  const startMin = parseTime(checkIn);
  const endMin = parseTime(checkOut);
  const diff = endMin < startMin ? (endMin - startMin + 24 * 60) : (endMin - startMin);
  const actualDiff = diff - breakMin;
  return Math.max(0, parseFloat((actualDiff / 60).toFixed(2)));
}

app.get('/api/attendance', async (_req, res) => {
  try {
    const checkInsList = await CheckIn.find();
    let checkInsMap = {};
    checkInsList.forEach(c => {
      checkInsMap[c.userId] = { 
        checkedIn: c.checkedIn, 
        time: c.time,
        breakStartedAt: c.breakStartedAt,
        totalBreakDuration: c.totalBreakDuration,
        currentFocus: c.currentFocus,
        history: c.history 
      };
    });
    
    res.json({ ...attendanceStats, checkIns: checkInsMap });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/attendance/status/:userId', async (req, res) => {
  try {
    const status = await CheckIn.findOne({ userId: req.params.userId });
    res.json(status || { checkedIn: false, breakStartedAt: null, totalBreakDuration: 0, currentFocus: '', history: [] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/attendance/checkin', protect, async (req, res) => {
  try {
    const { userId, name } = req.body || {};
    if (!userId) return res.status(400).json({ message: 'User ID is required' });

    let record = await CheckIn.findOne({ userId });
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const date = new Date().toISOString().split('T')[0];

    if (record && record.checkedIn) {
      // Check Out
      const checkInTime = record.time;
      const breakMin = record.totalBreakDuration || 0;
      const totalHours = calculateHours(checkInTime, time, breakMin);

      // Determine status based on check-in time
      const parseTime = (tStr) => {
        const cleanStr = tStr.trim().toLowerCase();
        const modifier = cleanStr.endsWith('pm') ? 'pm' : 'am';
        const timeOnly = cleanStr.replace(/[ap]m/, '').trim();
        let [h, m] = timeOnly.split(':').map(Number);
        if (modifier === 'pm' && h < 12) h += 12;
        if (modifier === 'am' && h === 12) h = 0;
        return h * 60 + m;
      };
      
      const checkInMinutes = parseTime(checkInTime);
      const isLate = checkInMinutes > (9 * 60 + 30); // 09:30 am
      const statusStr = isLate ? 'Late' : 'On Time';

      record.checkedIn = false;
      record.time = '';
      record.breakStartedAt = null;
      record.totalBreakDuration = 0;
      record.currentFocus = '';

      // Add to history
      record.history.push({
        date,
        checkInTime,
        checkOutTime: time,
        breakDuration: breakMin,
        status: statusStr,
        totalHours
      });

      await record.save();
      await addNotification(`${name} checked out. Worked: ${totalHours}h.`);
      io.emit('attendance_updated', record);
      res.json({ checkedIn: false, message: 'Checked out successfully', totalHours });
    } else {
      // Check In
      if (record) {
        record.checkedIn = true;
        record.time = time;
        record.breakStartedAt = null;
        record.totalBreakDuration = 0;
        record.currentFocus = '';
      } else {
        record = new CheckIn({ 
          userId, 
          checkedIn: true, 
          time, 
          breakStartedAt: null, 
          totalBreakDuration: 0,
          currentFocus: '',
          history: [] 
        });
      }
      await record.save();
      
      await addNotification(`${name} checked in at ${time}`);
      io.emit('attendance_updated', record);
      res.json({ checkedIn: true, time, message: 'Checked in successfully' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/attendance/break', protect, async (req, res) => {
  try {
    const { userId, action } = req.body || {};
    if (!userId) return res.status(400).json({ message: 'User ID is required' });

    let record = await CheckIn.findOne({ userId });
    if (!record || !record.checkedIn) {
      return res.status(400).json({ message: 'User is not checked in' });
    }

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (action === 'start') {
      record.breakStartedAt = time;
      await record.save();
      io.emit('attendance_updated', record);
      res.json({ 
        message: 'Break started', 
        breakStartedAt: record.breakStartedAt, 
        totalBreakDuration: record.totalBreakDuration 
      });
    } else if (action === 'end') {
      if (!record.breakStartedAt) {
        return res.status(400).json({ message: 'No active break to end' });
      }
      
      const parseTime = (timeStr) => {
        const cleanStr = timeStr.trim().toLowerCase();
        const modifier = cleanStr.endsWith('pm') ? 'pm' : 'am';
        const timeOnly = cleanStr.replace(/[ap]m/, '').trim();
        let [hours, minutes] = timeOnly.split(':').map(Number);
        if (modifier === 'pm' && hours < 12) hours += 12;
        if (modifier === 'am' && hours === 12) hours = 0;
        return hours * 60 + minutes;
      };
      
      const startMin = parseTime(record.breakStartedAt);
      const endMin = parseTime(time);
      const diff = endMin < startMin ? (endMin - startMin + 24 * 60) : (endMin - startMin);
      
      record.totalBreakDuration = (record.totalBreakDuration || 0) + diff;
      record.breakStartedAt = null;
      await record.save();
      io.emit('attendance_updated', record);
      res.json({ 
        message: 'Break ended, back to work', 
        breakStartedAt: null, 
        totalBreakDuration: record.totalBreakDuration 
      });
    } else {
      res.status(400).json({ message: 'Invalid action' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/attendance/focus', protect, async (req, res) => {
  try {
    const { userId, focus } = req.body || {};
    if (!userId) return res.status(400).json({ message: 'User ID is required' });

    let record = await CheckIn.findOne({ userId });
    if (!record || !record.checkedIn) {
      return res.status(400).json({ message: 'User is not checked in' });
    }

    record.currentFocus = focus || '';
    await record.save();

    io.emit('attendance_updated', record);
    res.json({ message: 'Focus updated successfully', currentFocus: record.currentFocus });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/attendance/regularize', protect, async (req, res) => {
  try {
    const { userId, userName, date, checkInTime, checkOutTime, reason } = req.body || {};
    if (!userId || !userName || !date || !checkInTime || !checkOutTime || !reason) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const request = new Regularization({
      userId,
      userName,
      date,
      checkInTime,
      checkOutTime,
      reason,
      status: 'Pending'
    });
    await request.save();

    await addNotification(`Regularization request submitted by ${userName} for ${date}`);
    io.emit('attendance_updated');
    res.status(201).json({ message: 'Regularization request submitted successfully', request });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/attendance/regularizations', protect, async (req, res) => {
  try {
    const { userId } = req.query;
    let query = {};
    
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    if (user.role === 'employee') {
      query.userId = user._id.toString();
    } else if (userId) {
      query.userId = userId;
    }

    const requests = await Regularization.find(query).sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/attendance/regularize/approve', protect, async (req, res) => {
  try {
    const { requestId, status } = req.body || {};
    if (!requestId || !status) {
      return res.status(400).json({ message: 'Request ID and status are required' });
    }

    const user = await User.findById(req.user.id);
    if (!user || (user.role !== 'hr' && user.role !== 'super_admin')) {
      return res.status(403).json({ message: 'Not authorized to approve requests' });
    }

    const reqRecord = await Regularization.findById(requestId);
    if (!reqRecord) return res.status(404).json({ message: 'Regularization request not found' });

    reqRecord.status = status;
    await reqRecord.save();

    if (status === 'Approved') {
      let checkInDoc = await CheckIn.findOne({ userId: reqRecord.userId });
      if (!checkInDoc) {
        checkInDoc = new CheckIn({ 
          userId: reqRecord.userId, 
          checkedIn: false, 
          time: '', 
          breakStartedAt: null,
          totalBreakDuration: 0,
          currentFocus: '',
          history: [] 
        });
      }

      checkInDoc.history = checkInDoc.history.filter(h => h.date !== reqRecord.date);

      const totalHours = calculateHours(reqRecord.checkInTime, reqRecord.checkOutTime, 0);

      const parseTime = (tStr) => {
        const cleanStr = tStr.trim().toLowerCase();
        const modifier = cleanStr.endsWith('pm') ? 'pm' : 'am';
        const timeOnly = cleanStr.replace(/[ap]m/, '').trim();
        let [h, m] = timeOnly.split(':').map(Number);
        if (modifier === 'pm' && h < 12) h += 12;
        if (modifier === 'am' && h === 12) h = 0;
        return h * 60 + m;
      };
      
      const checkInMinutes = parseTime(reqRecord.checkInTime);
      const isLate = checkInMinutes > (9 * 60 + 30);
      const statusStr = isLate ? 'Late' : 'On Time';

      checkInDoc.history.push({
        date: reqRecord.date,
        checkInTime: reqRecord.checkInTime,
        checkOutTime: reqRecord.checkOutTime,
        breakDuration: 0,
        status: statusStr,
        totalHours
      });

      await checkInDoc.save();
      await addNotification(`Regularization for ${reqRecord.userName} on ${reqRecord.date} was approved.`);
      io.emit('attendance_updated');
      res.json({ message: 'Request approved and check-in history updated' });
    } else {
      await addNotification(`Regularization for ${reqRecord.userName} on ${reqRecord.date} was rejected.`);
      io.emit('attendance_updated');
      res.json({ message: 'Request rejected' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/leave', async (_req, res) => {
  try {
    const requests = await LeaveRequest.find().sort({ createdAt: -1 });
    res.json({
      ...leaveStats,
      requests: requests.map(r => ({ ...r.toObject(), id: r._id }))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/leave/request', protect, async (req, res) => {
  try {
    const { name, type, reason } = req.body || {};
    if (!name || !type) return res.status(400).json({ message: 'Name and type are required' });

    const newRequest = new LeaveRequest({
      name, type, reason: reason || 'No reason provided', status: 'Pending'
    });
    await newRequest.save();

    await addNotification(`Leave requested: ${name} (${type})`);
    io.emit('leave_updated'); // Real-time trigger refresh
    res.status(201).json(newRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/leave/approve', protect, async (req, res) => {
  try {
    const { id, status } = req.body || {};
    if (!id || !status) return res.status(400).json({ message: 'ID and status are required' });

    const request = await LeaveRequest.findById(id);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    request.status = status;
    await request.save();

    await addNotification(`Leave request for ${request.name} was ${status.toLowerCase()}`);
    io.emit('leave_updated'); // Real-time trigger refresh
    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/payroll', async (_req, res) => {
  try {
    const records = await PayrollRecord.find().sort({ createdAt: 1 });
    if (!records.length) return res.json(payrollData);

    const firstStatus = records.find((record) => record.status)?.status || 'Processed';
    res.json({
      status: firstStatus,
      items: records
        .filter((record) => record.type === 'summary')
        .map((record) => ({ label: record.label, value: record.value })),
      payslips: records
        .filter((record) => record.type === 'payslip')
        .map((record) => ({ name: record.label, date: record.date || record.value }))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/payroll/employees', protect, async (_req, res) => {
  try {
    const employees = (await Employee.find({ status: 'Active' }).sort({ name: 1 }).lean()).filter((employee) => !isSampleEmployee(employee));
    res.json(employees.map(buildEmployeePayroll));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/payroll/transfer', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || (user.role !== 'hr' && user.role !== 'super_admin')) {
      return res.status(403).json({ message: 'Forbidden. HR/Admin access required.' });
    }

    const { employeeId } = req.body || {};
    if (!employeeId) return res.status(400).json({ message: 'Employee ID is required' });

    const employee = await Employee.findById(employeeId).lean();
    if (!employee || employee.status !== 'Active') return res.status(404).json({ message: 'Active employee not found' });

    const payroll = buildEmployeePayroll(employee);
    const transactionId = `EMS-PAY-${Date.now().toString(36).toUpperCase()}`;
    const message = `Salary transferred to ${payroll.name}: ${payroll.currency}${payroll.netSalary}`;

    await addNotification(message);
    io.emit('payroll_updated', message);
    res.json({ message, transactionId, payroll: { ...payroll, payStatus: 'Transferred' } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
app.get('/api/payroll/export', protect, async (_req, res) => {
  try {
    const records = await PayrollRecord.find().sort({ createdAt: 1 }).lean();
    const source = records.length
      ? records.map((record) => ({ label: record.label, value: record.value, type: record.type, date: record.date || '', status: record.status }))
      : [
        ...payrollData.items.map((item) => ({ ...item, type: 'summary', date: '', status: payrollData.status })),
        ...payrollData.payslips.map((item) => ({ label: item.name, value: item.date, type: 'payslip', date: item.date, status: payrollData.status }))
      ];
    const headers = ['Label', 'Value', 'Type', 'Date', 'Status'];
    const escapeCsvValue = (value) => {
      const text = value === null || value === undefined ? '' : String(value);
      return `"${text.replace(/"/g, '""')}"`;
    };
    const csv = [headers, ...source.map((record) => [record.label, record.value, record.type, record.date, record.status])]
      .map((row) => row.map(escapeCsvValue).join(','))
      .join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="payroll.csv"');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/payroll/action', protect, async (req, res) => {
  try {
    const { action } = req.body || {};
    const allowedActions = {
      release: 'Payroll released to finance',
      generate_slips: 'Payslips generated',
      review_bonuses: 'Bonus review queued',
      approve_reimbursements: 'Reimbursements sent for approval',
      bank_transfer_file: 'Bank transfer file prepared'
    };

    if (!allowedActions[action]) {
      return res.status(400).json({ message: 'Unknown payroll action' });
    }

    if (action === 'release') {
      payrollData = { ...payrollData, status: 'Released' };
      await PayrollRecord.updateMany({}, { $set: { status: 'Released' } });
    }

    await addNotification(allowedActions[action]);
    io.emit('payroll_updated', allowedActions[action]);
    res.json({ message: allowedActions[action], status: action === 'release' ? 'Released' : payrollData.status });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/recruitment', async (_req, res) => {
  try {
    const roles = await RecruitmentRole.find().sort({ createdAt: 1 });
    if (!roles.length) return res.json(recruitmentData);

    const pipeline = roles
      .filter((role) => role.metricLabel)
      .map((role) => ({ label: role.metricLabel, value: role.metricValue || '0' }));

    res.json({
      openRoles: roles.length,
      positions: roles.map((role) => ({ id: role._id, title: role.title, stage: role.stage })),
      pipeline: pipeline.length ? pipeline : recruitmentData.pipeline
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/recruitment', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || (user.role !== 'hr' && user.role !== 'super_admin')) {
      return res.status(403).json({ message: 'Forbidden. HR/Admin access required.' });
    }

    const { title, stage } = req.body || {};
    if (!title) return res.status(400).json({ message: 'Job title is required.' });

    const newRole = new RecruitmentRole({ title, stage: stage || 'Screening' });
    await newRole.save();

    await addNotification(`New open position added: ${title}`);
    io.emit('recruitment_updated');
    res.status(201).json(newRole);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/recruitment/:id/stage', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || (user.role !== 'hr' && user.role !== 'super_admin')) {
      return res.status(403).json({ message: 'Forbidden. HR/Admin access required.' });
    }

    const { stage } = req.body || {};
    if (!stage) return res.status(400).json({ message: 'Stage is required.' });

    const role = await RecruitmentRole.findById(req.params.id);
    if (!role) return res.status(404).json({ message: 'Position not found.' });

    role.stage = stage;
    await role.save();

    await addNotification(`Recruitment update: ${role.title} advanced to ${stage}`);
    io.emit('recruitment_updated');
    res.json(role);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/projects', async (_req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.json(projects.map(p => ({ ...p.toObject(), id: p._id })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/projects', protect, async (req, res) => {
  try {
    const { name, summary, owner, deadline, budget } = req.body || {};
    if (!name || !summary) return res.status(400).json({ message: 'Name and summary are required' });

    const newProject = new Project({
      name, summary, owner: owner || 'Unassigned', deadline: deadline || '2026-12-31', budget: budget || 'N/A'
    });
    await newProject.save();

    await addNotification(`New Project Created: ${name}`);
    io.emit('project_added', newProject); // Real-time
    res.status(201).json(newProject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/notifications', async (_req, res) => {
  try {
    const notifs = await Notification.find().sort({ createdAt: -1 }).limit(10);
    res.json(notifs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/chat/messages', async (_req, res) => {
  try {
    const msgs = await ChatMessage.find().sort({ createdAt: 1 });
    res.json(msgs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/meetings', async (_req, res) => {
  try {
    const meetings = await Meeting.find().sort({ createdAt: -1 });
    res.json(meetings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/meetings', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const newMeeting = new Meeting({
      title: req.body.title || 'Team Standup',
      organizer: user ? user.name : 'Unknown',
      status: 'Ongoing'
    });
    await newMeeting.save();
    io.emit('meeting_updated');
    res.status(201).json(newMeeting);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/meetings/:id/end', protect, async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) return res.status(404).json({ message: 'Meeting not found' });

    meeting.status = 'Completed';
    meeting.endedAt = Date.now();
    await meeting.save();

    io.emit('meeting_updated');
    res.json(meeting);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin Broadcast Route
app.post('/api/admin/broadcast', protect, async (req, res) => {
  try {
    const { message } = req.body || {};
    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Announcement message is required' });
    }
    
    // Broadcast notification to all connected clients
    await addNotification(`[Broadcast] ${message.trim()}`);
    io.emit('notification', `[Broadcast] ${message.trim()}`);
    res.json({ success: true, message: 'Broadcast sent successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Authentication Routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password, role } = req.body || {};
    const normalizedEmail = email?.trim().toLowerCase();

    const matchedUser = await User.findOne({ email: normalizedEmail });
    if (matchedUser) {
      const isMatch = await bcrypt.compare(password, matchedUser.password);
      if (isMatch || matchedUser.password === password) { // Fallback for unhashed during dev if any
        if (role && matchedUser.role !== role) {
          return res.status(403).json({ message: 'Selected role does not match this account.' });
        }
        if (matchedUser.role === 'employee') {
          let emp = await Employee.findOne({ userId: matchedUser._id });
          if (!emp) {
            emp = await Employee.create({
              userId: matchedUser._id,
              name: matchedUser.name,
              role: 'Employee',
              department: 'General',
              status: 'Active'
            });
          } else if (emp.name !== matchedUser.name) {
            emp.name = matchedUser.name;
            emp.role = emp.role || 'Employee';
            emp.department = emp.department || 'General';
            emp.status = 'Active';
            await emp.save();
          }
          if (emp && emp.status === 'Pending') {
            return res.status(403).json({ message: 'Your registration is pending HR/Admin approval.', status: 'Pending' });
          }
          if (emp && emp.status === 'Rejected') {
            return res.status(403).json({ message: 'Your registration request has been rejected. Please contact HR.', status: 'Rejected' });
          }
        }
        return res.json({
          user: { id: matchedUser._id, name: matchedUser.name, email: matchedUser.email, role: matchedUser.role, token: generateToken(matchedUser._id) }
        });
      }
    }
    res.status(401).json({ message: 'Invalid credentials' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/users/profile', protect, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.name = name;
    await user.save();

    // Also update Employee record if they are an employee
    if (user.role === 'employee') {
      const emp = await Employee.findOne({ userId: user._id });
      if (emp) {
        emp.name = name;
        await emp.save();
        io.emit('employee_updated', emp);
      }
    }

    res.json({ message: 'Profile updated successfully', user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, role = 'employee', password } = req.body || {};
    if (!name || !email || !password) return res.status(400).json({ message: 'Missing fields' });

    const normalizedEmail = email.trim().toLowerCase();
    const exists = await User.findOne({ email: normalizedEmail });
    if (exists) return res.status(400).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({ name, email: normalizedEmail, role, password: hashedPassword });
    await newUser.save();

    const empRole = newUser.role === 'super_admin' ? 'Super Admin' : (newUser.role === 'hr' ? 'HR Partner' : 'Employee');
    const initialStatus = newUser.role === 'employee' ? 'Pending' : 'Active';
    const newEmp = new Employee({ userId: newUser._id, name: newUser.name, role: empRole, department: 'General', status: initialStatus });
    await newEmp.save();

    if (newUser.role === 'employee') {
      await addNotification(`New employee registration pending approval: ${name}`);
      return res.status(202).json({
        message: 'Registration successful. Pending HR approval.',
        status: 'Pending'
      });
    }

    res.status(201).json({
      user: { id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role, token: generateToken(newUser._id) }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/auth/google', async (req, res) => {
  try {
    const { name, email, role } = req.body || {};
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const normalizedEmail = email.trim().toLowerCase();
    let matchedUser = await User.findOne({ email: normalizedEmail });

    if (!matchedUser) {
      matchedUser = new User({
        name: name || email.split('@')[0],
        email: normalizedEmail,
        role: role || 'employee'
      });
      await matchedUser.save();

      const empRole = matchedUser.role === 'super_admin' ? 'Super Admin' : (matchedUser.role === 'hr' ? 'HR Partner' : 'Employee');
      const initialStatus = matchedUser.role === 'employee' ? 'Pending' : 'Active';
      const newEmp = new Employee({ userId: matchedUser._id, name: matchedUser.name, role: empRole, department: 'General', status: initialStatus });
      await newEmp.save();

      if (matchedUser.role === 'employee') {
        await addNotification(`New employee registration pending approval: ${newEmp.name}`);
        return res.status(202).json({
          message: 'Google signup successful. Pending HR approval.',
          status: 'Pending'
        });
      }
    } else {
      if (matchedUser.role === 'employee') {
        let emp = await Employee.findOne({ userId: matchedUser._id });
        if (!emp) {
          emp = await Employee.create({
            userId: matchedUser._id,
            name: matchedUser.name,
            role: 'Employee',
            department: 'General',
            status: 'Active'
          });
        } else if (emp.name !== matchedUser.name) {
          emp.name = matchedUser.name;
          emp.role = emp.role || 'Employee';
          emp.department = emp.department || 'General';
          emp.status = 'Active';
          await emp.save();
        }
        if (emp && emp.status === 'Pending') {
          return res.status(403).json({ message: 'Your registration is pending HR/Admin approval.', status: 'Pending' });
        }
        if (emp && emp.status === 'Rejected') {
          return res.status(403).json({ message: 'Your registration request has been rejected. Please contact HR.', status: 'Rejected' });
        }
      }
    }

    res.json({
      user: { id: matchedUser._id, name: matchedUser.name, email: matchedUser.email, role: matchedUser.role, token: generateToken(matchedUser._id) }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
