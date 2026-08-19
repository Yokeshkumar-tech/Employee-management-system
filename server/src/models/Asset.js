import mongoose from 'mongoose';

const assetSchema = new mongoose.Schema({
  assetTag: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  category: { type: String, required: true }, // e.g., Laptop, Monitor, Phone
  purchaseDate: { type: Date },
  purchaseCost: { type: Number },
  status: { type: String, enum: ['Available', 'Assigned', 'In Repair', 'Retired'], default: 'Available' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', default: null },
  assignmentDate: { type: Date }
}, { timestamps: true });

export default mongoose.model('Asset', assetSchema);
