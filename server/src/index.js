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
import Notification from './models/Notification.js';
import ChatMessage from './models/ChatMessage.js';
import PayrollRecord from './models/PayrollRecord.js';
import RecruitmentRole from './models/RecruitmentRole.js';

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


// REST Routes
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

// Approval Routes (HR & Admin only)
app.get('/api/approvals', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || (user.role !== 'hr' && user.role !== 'super_admin')) {
      return res.status(403).json({ message: 'Forbidden. HR/Admin access required.' });
    }
    const pendings = await Employee.find({ status: 'Pending' }).populate('userId', 'email');
    res.json(pendings.map(e => ({
      id: e._id,
      name: e.name,
      role: e.role,
      department: e.department,
      status: e.status,
      email: e.userId?.email || 'N/A',
      createdAt: e.createdAt
    })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/approvals/:id/approve', protect, async (req, res) => {
  try {
    const adminUser = await User.findById(req.user.id);
    if (!adminUser || (adminUser.role !== 'hr' && adminUser.role !== 'super_admin')) {
      return res.status(403).json({ message: 'Forbidden. HR/Admin access required.' });
    }
    const { department, role } = req.body || {};
    if (!department || !role) {
      return res.status(400).json({ message: 'Department and Role are required for approval.' });
    }

    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: 'Employee join request not found.' });

    employee.status = 'Active';
    employee.department = department;
    employee.role = role;
    await employee.save();

    await addNotification(`Join request approved: ${employee.name} assigned to ${department} (${role})`);
    io.emit('approval_updated', employee);
    res.json({ message: 'Employee approved successfully', employee });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/approvals/:id/reject', protect, async (req, res) => {
  try {
    const adminUser = await User.findById(req.user.id);
    if (!adminUser || (adminUser.role !== 'hr' && adminUser.role !== 'super_admin')) {
      return res.status(403).json({ message: 'Forbidden. HR/Admin access required.' });
    }
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: 'Employee join request not found.' });

    employee.status = 'Rejected';
    await employee.save();

    await addNotification(`Join request rejected: ${employee.name}`);
    io.emit('approval_updated', employee);
    res.json({ message: 'Employee request rejected', employee });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/attendance', async (_req, res) => {
  try {
    const checkInsList = await CheckIn.find();
    let checkInsMap = {};
    checkInsList.forEach(c => {
      checkInsMap[c.userId] = { checkedIn: c.checkedIn, time: c.time };
    });
    
    res.json({ ...attendanceStats, checkIns: checkInsMap });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/attendance/status/:userId', async (req, res) => {
  try {
    const status = await CheckIn.findOne({ userId: req.params.userId });
    res.json(status || { checkedIn: false });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/attendance/checkin', protect, async (req, res) => {
  try {
    const { userId, name } = req.body || {};
    if (!userId) return res.status(400).json({ message: 'User ID is required' });

    let record = await CheckIn.findOne({ userId });
    
    if (record && record.checkedIn) {
      record.checkedIn = false;
      await record.save();
      await addNotification(`${name} checked out`);
      io.emit('attendance_updated', record); // Real-time
      res.json({ checkedIn: false, message: 'Checked out successfully' });
    } else {
      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      if (record) {
        record.checkedIn = true;
        record.time = time;
      } else {
        record = new CheckIn({ userId, checkedIn: true, time });
      }
      await record.save();
      
      await addNotification(`${name} checked in at ${time}`);
      io.emit('attendance_updated', record); // Real-time
      res.json({ checkedIn: true, time, message: 'Checked in successfully' });
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

app.get('/api/recruitment', async (_req, res) => {
  try {
    const roles = await RecruitmentRole.find().sort({ createdAt: 1 });
    if (!roles.length) return res.json(recruitmentData);

    const pipeline = roles
      .filter((role) => role.metricLabel)
      .map((role) => ({ label: role.metricLabel, value: role.metricValue || '0' }));

    res.json({
      openRoles: roles.length,
      positions: roles.map((role) => ({ title: role.title, stage: role.stage })),
      pipeline: pipeline.length ? pipeline : recruitmentData.pipeline
    });
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







