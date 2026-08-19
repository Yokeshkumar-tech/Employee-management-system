import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  category: { type: String, enum: ['Policy', 'Payslip', 'Contract', 'Other'], required: true },
  fileUrl: { type: String, required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }, // Null if it's a company-wide policy
  isCompanyWide: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('Document', documentSchema);
