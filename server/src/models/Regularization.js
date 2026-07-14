import mongoose from 'mongoose';

const regularizationSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  date: { type: String, required: true }, // Format: 'YYYY-MM-DD'
  checkInTime: { type: String, required: true }, // Format: 'hh:mm am/pm'
  checkOutTime: { type: String, required: true }, // Format: 'hh:mm am/pm'
  reason: { type: String, required: true },
  status: { type: String, default: 'Pending' } // 'Pending', 'Approved', 'Rejected'
}, { timestamps: true });

export default mongoose.model('Regularization', regularizationSchema);
