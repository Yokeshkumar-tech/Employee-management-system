import mongoose from 'mongoose';

const assetRequestSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  employeeName: { type: String, required: true },
  category: { type: String, required: true }, // e.g. Laptop, Monitor, Phone, Accessory, Other
  reason: { type: String, required: true },
  urgency: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected', 'Fulfilled'], default: 'Pending' },
  adminComment: { type: String, default: '' },
  allocatedAsset: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset', default: null },
  requestedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('AssetRequest', assetRequestSchema);
