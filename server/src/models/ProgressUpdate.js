import mongoose from 'mongoose';

const progressUpdateSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  text: { type: String, required: true },
  percentage: { type: Number, default: 0, min: 0, max: 100 },
  status: { type: String, enum: ['On Track', 'Delayed', 'Blocked', 'Completed'], default: 'On Track' }
}, { timestamps: true });

export default mongoose.model('ProgressUpdate', progressUpdateSchema);
