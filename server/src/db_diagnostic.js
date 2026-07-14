import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Employee from './models/Employee.js';
import Project from './models/Project.js';
import LeaveRequest from './models/LeaveRequest.js';
import CheckIn from './models/CheckIn.js';
import Notification from './models/Notification.js';
import ChatMessage from './models/ChatMessage.js';
import PayrollRecord from './models/PayrollRecord.js';
import RecruitmentRole from './models/RecruitmentRole.js';
import Regularization from './models/Regularization.js';

dotenv.config();

const mongoURI = process.env.MONGODB_URI;

console.log('Performing database diagnostics...');
console.log('Connecting to: ' + mongoURI);

async function runDiagnostic() {
  try {
    await mongoose.connect(mongoURI);
    console.log('✓ Successfully connected to MongoDB database!');
    console.log('=============================================');

    const collections = [
      { name: 'Users', model: User },
      { name: 'Employees', model: Employee },
      { name: 'Projects', model: Project },
      { name: 'Leave Requests', model: LeaveRequest },
      { name: 'Check Ins / Attendance', model: CheckIn },
      { name: 'Notifications', model: Notification },
      { name: 'Chat Messages', model: ChatMessage },
      { name: 'Payroll Records', model: PayrollRecord },
      { name: 'Recruitment Roles', model: RecruitmentRole },
      { name: 'Attendance Regularizations', model: Regularization },
    ];

    for (const col of collections) {
      try {
        const count = await col.model.countDocuments({});
        console.log(`✓ Collection [${col.name}] - Count: ${count}`);
      } catch (err) {
        console.log(`✗ Error reading collection [${col.name}]:`, err.message);
      }
    }

    console.log('=============================================');
    console.log('Database diagnostic check complete.');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('✗ Database connection failed:', error.message);
    process.exit(1);
  }
}

runDiagnostic();
