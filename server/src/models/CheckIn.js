import mongoose from 'mongoose';

const checkInSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  checkedIn: { type: Boolean, default: false },
  time: { type: String }, // current check-in time
  breakStartedAt: { type: String, default: null }, // e.g. "12:30 pm" or null
  totalBreakDuration: { type: Number, default: 0 }, // in minutes
  currentFocus: { type: String, default: '' }, // live work focus
  history: [{
    date: { type: String }, // '2026-07-14'
    checkInTime: { type: String },
    checkOutTime: { type: String },
    breakDuration: { type: Number, default: 0 }, // in minutes
    status: { type: String, default: 'On Time' }, // 'On Time', 'Late'
    totalHours: { type: Number, default: 0 } // worked hours
  }]
}, { timestamps: true });

export default mongoose.model('CheckIn', checkInSchema);
