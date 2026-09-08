import mongoose from 'mongoose';

const historySchema = new mongoose.Schema({
  action: { 
    type: String, 
    enum: ['Created', 'Check-Out', 'Check-In', 'Maintenance', 'Retired', 'Updated'], 
    required: true 
  },
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', default: null },
  employeeName: { type: String, default: '' },
  date: { type: Date, default: Date.now },
  condition: { type: String, default: 'Good' },
  notes: { type: String, default: '' }
}, { _id: true });

const assetSchema = new mongoose.Schema({
  assetTag: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  category: { type: String, required: true }, // e.g., Laptop, Monitor, Phone, Accessory, Other
  purchaseDate: { type: Date, default: null },
  purchaseCost: { type: Number, default: null },
  status: { 
    type: String, 
    enum: ['Available', 'Assigned', 'In Repair', 'Retired'], 
    default: 'Available' 
  },
  condition: { 
    type: String, 
    enum: ['New', 'Good', 'Fair', 'Needs Repair', 'Damaged'], 
    default: 'Good' 
  },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', default: null },
  assignmentDate: { type: Date, default: null },
  expectedReturnDate: { type: Date, default: null },
  notes: { type: String, default: '' },
  history: [historySchema]
}, { timestamps: true });

export default mongoose.model('Asset', assetSchema);
