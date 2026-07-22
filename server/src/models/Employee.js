import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true },
  role: { type: String, required: true },
  department: { type: String, required: true },
  status: { type: String, default: 'Active' },
  approvalStage: {
    type: String,
    enum: ['Pending', 'HR Approved', 'HR Rejected', 'Admin Approved', 'Admin Rejected'],
    default: null
  },
  requestedAt: { type: Date, default: Date.now },
  // Bank & Salary details for payroll
  bankName: { type: String },
  accountNumber: { type: String },
  ifsc: { type: String },
  baseSalary: { type: Number },
  bonus: { type: Number },
  deductions: { type: Number }
}, { timestamps: true });

export default mongoose.model('Employee', employeeSchema);
