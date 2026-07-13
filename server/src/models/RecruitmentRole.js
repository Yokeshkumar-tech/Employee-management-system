import mongoose from 'mongoose';

const recruitmentRoleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  stage: { type: String, default: 'Screening' },
  metricLabel: { type: String },
  metricValue: { type: String }
}, { timestamps: true });

export default mongoose.model('RecruitmentRole', recruitmentRoleSchema);
