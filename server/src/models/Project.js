import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  name: { type: String, required: true },
  progress: { type: String, default: '0%' },
  summary: { type: String, required: true },
  owner: { type: String, default: 'Unassigned' },
  deadline: { type: String, default: '2026-12-31' },
  budget: { type: String, default: 'N/A' }
}, { timestamps: true });

export default mongoose.model('Project', projectSchema);
