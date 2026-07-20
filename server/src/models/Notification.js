import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  title: { type: String, required: true },
  time: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model('Notification', notificationSchema);
