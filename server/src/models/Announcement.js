import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  priority: { type: String, enum: ['Low', 'Normal', 'High'], default: 'Normal' },
  targetAudience: { type: String, default: 'All' }, // All, or specific department
  validUntil: { type: Date }
}, { timestamps: true });

export default mongoose.model('Announcement', announcementSchema);
