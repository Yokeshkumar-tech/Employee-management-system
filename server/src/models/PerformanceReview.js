import mongoose from 'mongoose';

const performanceReviewSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  reviewerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reviewPeriod: { type: String, required: true }, // e.g., "Q1 2026"
  rating: { type: Number, min: 1, max: 5, required: true },
  comments: { type: String },
  goalsAchieved: { type: String },
  areasForImprovement: { type: String },
  status: { type: String, enum: ['Draft', 'Submitted', 'Acknowledged'], default: 'Draft' }
}, { timestamps: true });

export default mongoose.model('PerformanceReview', performanceReviewSchema);
