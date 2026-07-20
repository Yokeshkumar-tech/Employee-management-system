import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';

import User from './models/User.js';
import Employee from './models/Employee.js';
import Project from './models/Project.js';
import LeaveRequest from './models/LeaveRequest.js';
import CheckIn from './models/CheckIn.js';
import Notification from './models/Notification.js';
import ChatMessage from './models/ChatMessage.js';
import PayrollRecord from './models/PayrollRecord.js';
import RecruitmentRole from './models/RecruitmentRole.js';
import Task from './models/Task.js';

dotenv.config();

const usersData = [
  { name: 'Ava Chen', email: 'admin@ems.com', password: 'password123', role: 'super_admin' },
  { name: 'Mina Patel', email: 'hr@ems.com', password: 'password123', role: 'hr' },
  { name: 'Leo Brooks', email: 'employee@ems.com', password: 'password123', role: 'employee' }
];

const employeesData = [
  { name: 'Ava Chen', role: 'Super Admin', department: 'Administration', status: 'Active', email: 'admin@ems.com', leaveBalance: 14, casualLeaveBalance: 6, sickLeaveBalance: 4, annualLeaveBalance: 4, salary: '$6,500', performanceScore: 95 },
  { name: 'Mina Patel', role: 'HR Partner', department: 'Human Resources', status: 'Active', email: 'hr@ems.com', leaveBalance: 14, casualLeaveBalance: 6, sickLeaveBalance: 4, annualLeaveBalance: 4, salary: '$5,200', performanceScore: 93 },
  { name: 'Leo Brooks', role: 'Employee', department: 'Engineering', status: 'Active', email: 'employee@ems.com', leaveBalance: 14, casualLeaveBalance: 6, sickLeaveBalance: 4, annualLeaveBalance: 4, salary: '$4,820', performanceScore: 92 }
];

const chatMessagesData = [
  { sender: 'Priya', text: 'Shared onboarding checklist', time: '10:00' },
  { sender: 'Jon', text: 'Updated sprint milestone', time: '10:02' },
  { sender: 'Ravi', text: 'Mentioned the payroll review', time: '10:05' }
];

const recruitmentRolesData = [
  { title: 'Senior Frontend Engineer', stage: 'Screening', metricLabel: 'Applicants', metricValue: '38' },
  { title: 'People Operations Manager', stage: 'HR Round', metricLabel: 'Interviews', metricValue: '12' },
  { title: 'Payroll Analyst', stage: 'Offer', metricLabel: 'Offers', metricValue: '4' }
];

async function seedData() {
  try {
    await connectDB();

    console.log('Clearing existing data...');
    await Promise.all([
      User.deleteMany(),
      Employee.deleteMany(),
      Project.deleteMany(),
      LeaveRequest.deleteMany(),
      CheckIn.deleteMany(),
      Notification.deleteMany(),
      ChatMessage.deleteMany(),
      PayrollRecord.deleteMany(),
      RecruitmentRole.deleteMany(),
      Task.deleteMany()
    ]);

    console.log('Inserting seed data...');
    const insertedUsers = await User.insertMany(usersData);

    // Assign some users to employees
    const userByEmail = Object.fromEntries(insertedUsers.map((user) => [user.email, user]));
    const empsWithUserId = employeesData.map(({ email, ...emp }) => ({
      ...emp,
      ...(email && userByEmail[email] ? { userId: userByEmail[email]._id } : {})
    }));
    const insertedEmployees = await Employee.insertMany(empsWithUserId);
    const employeeByName = Object.fromEntries(insertedEmployees.map((emp) => [emp.name, emp]));

    const leoEmp = employeeByName['Leo Brooks'];
    const minaEmp = employeeByName['Mina Patel'];
    const avaEmp = employeeByName['Ava Chen'];

    const leaveData = [
      { employee: leoEmp._id, name: 'Leo Brooks', type: 'Sick leave', status: 'Pending', reason: 'Fever' },
      { employee: leoEmp._id, name: 'Leo Brooks', type: 'Casual leave', status: 'Approved', reason: 'Family function' }
    ];

    const projectsData = [
      { employee: leoEmp._id, name: 'Northwind rollout', progress: '82%', summary: 'Coordinate implementation with finance and operations.', owner: 'Leo Brooks', deadline: '2026-07-15', budget: '$180k' },
      { employee: minaEmp._id, name: 'Global onboarding revamp', progress: '64%', summary: 'Streamline new-hire documentation and access provisioning.', owner: 'Mina Patel', deadline: '2026-08-02', budget: '$96k' }
    ];

    const notificationsData = [
      { employee: leoEmp._id, title: 'Welcome to EMS', time: '1m ago' },
      { employee: leoEmp._id, title: 'Leave approval requested', time: '2m ago' },
      { employee: minaEmp._id, title: 'New interview scheduled', time: '15m ago' },
      { employee: avaEmp._id, title: 'Payroll batch released', time: '31m ago' }
    ];

    const payrollRecordsData = [
      { employee: leoEmp._id, label: 'Net salary', value: '$4,820', type: 'summary', status: 'Processed' },
      { employee: leoEmp._id, label: 'Bonus', value: '$480', type: 'summary', status: 'Processed' },
      { employee: leoEmp._id, label: 'Deductions', value: '$170', type: 'summary', status: 'Processed' },
      { employee: leoEmp._id, label: 'June payslip', value: '2026-06-25', date: '2026-06-25', type: 'payslip', status: 'Processed' },
      { employee: leoEmp._id, label: 'May payslip', value: '2026-05-27', date: '2026-05-27', type: 'payslip', status: 'Processed' },
      
      { employee: minaEmp._id, label: 'Net salary', value: '$5,200', type: 'summary', status: 'Processed' },
      { employee: minaEmp._id, label: 'Bonus', value: '$600', type: 'summary', status: 'Processed' },
      { employee: minaEmp._id, label: 'Deductions', value: '$200', type: 'summary', status: 'Processed' },
      { employee: minaEmp._id, label: 'June payslip', value: '2026-06-25', date: '2026-06-25', type: 'payslip', status: 'Processed' }
    ];

    const tasksData = [
      { employee: leoEmp._id, title: 'Submit timesheet for June', due: 'Today', priority: 'high', done: false },
      { employee: leoEmp._id, title: 'Complete onboarding module 3', due: 'Tomorrow', priority: 'medium', done: false },
      { employee: leoEmp._id, title: 'Update project status report', due: 'Jul 12', priority: 'medium', done: true },
      { employee: leoEmp._id, title: 'Team sync meeting notes', due: 'Jul 13', priority: 'low', done: false },
      { employee: leoEmp._id, title: 'Review Q3 roadmap doc', due: 'Jul 14', priority: 'low', done: false }
    ];

    const checkInsData = [
      {
        employee: leoEmp._id,
        userId: String(leoEmp._id),
        checkedIn: false,
        time: '',
        breakStartedAt: null,
        totalBreakDuration: 0,
        currentFocus: '',
        history: [
          { date: '2026-07-16', checkInTime: '09:15 am', checkOutTime: '06:00 pm', breakDuration: 45, status: 'On Time', totalHours: 8 },
          { date: '2026-07-15', checkInTime: '09:40 am', checkOutTime: '06:15 pm', breakDuration: 60, status: 'Late', totalHours: 7.58 }
        ]
      },
      {
        employee: minaEmp._id,
        userId: String(minaEmp._id),
        checkedIn: false,
        time: '',
        breakStartedAt: null,
        totalBreakDuration: 0,
        currentFocus: '',
        history: [
          { date: '2026-07-16', checkInTime: '09:20 am', checkOutTime: '05:30 pm', breakDuration: 30, status: 'On Time', totalHours: 7.67 }
        ]
      }
    ];

    await LeaveRequest.insertMany(leaveData);
    await Project.insertMany(projectsData);
    await Notification.insertMany(notificationsData);
    await ChatMessage.insertMany(chatMessagesData);
    await PayrollRecord.insertMany(payrollRecordsData);
    await RecruitmentRole.insertMany(recruitmentRolesData);
    await Task.insertMany(tasksData);
    await CheckIn.insertMany(checkInsData);

    console.log('Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seedData();
