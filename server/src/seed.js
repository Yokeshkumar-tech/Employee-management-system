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

dotenv.config();

const usersData = [
  { name: 'Ava Chen', email: 'admin@ems.com', password: 'password123', role: 'super_admin' },
  { name: 'Mina Patel', email: 'hr@ems.com', password: 'password123', role: 'hr' },
  { name: 'Leo Brooks', email: 'employee@ems.com', password: 'password123', role: 'employee' }
];

const employeesData = [
  { name: 'Ava Chen', role: 'Super Admin', department: 'Administration', status: 'Active', email: 'admin@ems.com' },
  { name: 'Mina Patel', role: 'HR Partner', department: 'Human Resources', status: 'Active', email: 'hr@ems.com' }
];

const leaveData = [
  { name: 'Rina Shah', type: 'Sick leave', status: 'Pending', reason: 'Fever' },
  { name: 'Tom Lewis', type: 'Casual leave', status: 'Approved', reason: 'Family function' }
];

const projectsData = [
  { name: 'Northwind rollout', progress: '82%', summary: 'Coordinate implementation with finance and operations.', owner: 'Anika', deadline: '2026-07-15', budget: '$180k' },
  { name: 'Global onboarding revamp', progress: '64%', summary: 'Streamline new-hire documentation and access provisioning.', owner: 'Mina', deadline: '2026-08-02', budget: '$96k' }
];

const notificationsData = [
  { title: 'Leave approval requested', time: '2m ago' },
  { title: 'New interview scheduled', time: '15m ago' },
  { title: 'Payroll batch released', time: '31m ago' }
];

const chatMessagesData = [
  { sender: 'Priya', text: 'Shared onboarding checklist', time: '10:00' },
  { sender: 'Jon', text: 'Updated sprint milestone', time: '10:02' },
  { sender: 'Ravi', text: 'Mentioned the payroll review', time: '10:05' }
];

const payrollRecordsData = [
  { label: 'Net salary', value: '$4,820', type: 'summary', status: 'Processed' },
  { label: 'Bonus', value: '$480', type: 'summary', status: 'Processed' },
  { label: 'Deductions', value: '$170', type: 'summary', status: 'Processed' },
  { label: 'June payslip', value: '2026-06-25', date: '2026-06-25', type: 'payslip', status: 'Processed' },
  { label: 'May payslip', value: '2026-05-27', date: '2026-05-27', type: 'payslip', status: 'Processed' }
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
      RecruitmentRole.deleteMany()
    ]);

    console.log('Inserting seed data...');
    const insertedUsers = await User.insertMany(usersData);
    
    // Assign some users to employees
    const userByEmail = Object.fromEntries(insertedUsers.map((user) => [user.email, user]));
    const empsWithUserId = employeesData.map(({ email, ...emp }) => ({
      ...emp,
      ...(email && userByEmail[email] ? { userId: userByEmail[email]._id } : {})
    }));
    await Employee.insertMany(empsWithUserId);

    await LeaveRequest.insertMany(leaveData);
    await Project.insertMany(projectsData);
    await Notification.insertMany(notificationsData);
    await ChatMessage.insertMany(chatMessagesData);
    await PayrollRecord.insertMany(payrollRecordsData);
    await RecruitmentRole.insertMany(recruitmentRolesData);

    console.log('Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seedData();

