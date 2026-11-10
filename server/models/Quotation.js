import mongoose from 'mongoose';

const { Schema } = mongoose;
const text = { type: String, trim: true, default: '' };

const companySchema = new Schema({
  name: text,
  address: text,
  phone: text,
  email: text,
  pan: text,
  gstin: text,
}, { _id: false });

const partySchema = new Schema({
  name: text,
  address: text,
  city: text,
  email: text,
  phone: text,
  tin: text,
  goods: text,
  billingType: text,
  bilty: text,
  minimumCharge: text,
  fov: text,
  afterRs: text,
  rrc: text,
  hamali: text,
  surcharge: text,
  ccDoor: text,
}, { _id: false });

const quotationSchema = new Schema({
  serialNumber: { type: String, required: true, trim: true, unique: true },
  company: { type: companySchema, required: true },
  party: { type: partySchema, required: true },
  // Each row: [station, goods, per kg, per case, per T3, per T4, per T5]
  rates: { type: [[String]], default: [] },
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform(_doc, value) {
      delete value._id;
      delete value.__v;
      return value;
    },
  },
});

quotationSchema.index({ updatedAt: -1 });

export const Quotation = mongoose.model('Quotation', quotationSchema);
