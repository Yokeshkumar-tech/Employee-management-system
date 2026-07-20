import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  title: { type: String, required: true },
  due: { type: String, default: 'Soon' },
  priority: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
  done: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('Task', taskSchema);
