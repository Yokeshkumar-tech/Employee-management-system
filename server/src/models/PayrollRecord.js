import mongoose from 'mongoose';

const payrollRecordSchema = new mongoose.Schema({
  label: { type: String, required: true },
  value: { type: String, required: true },
  type: { type: String, enum: ['summary', 'payslip'], default: 'summary' },
  date: { type: String },
  status: { type: String, default: 'Processed' }
}, { timestamps: true });

export default mongoose.model('PayrollRecord', payrollRecordSchema);
