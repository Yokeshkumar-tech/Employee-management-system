import mongoose from 'mongoose';

const expenseClaimSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  date: { type: Date, default: Date.now },
  category: { type: String, required: true }, // e.g., Travel, Meals, Supplies
  amount: { type: Number, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected', 'Paid'], default: 'Pending' },
  receiptUrl: { type: String },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default mongoose.model('ExpenseClaim', expenseClaimSchema);
