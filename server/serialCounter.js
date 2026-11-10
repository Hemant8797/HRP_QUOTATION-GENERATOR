import { Counter } from './models/Counter.js';
import { Quotation } from './models/Quotation.js';

// The counter holds the serial number shown on the next blank quotation.
const COUNTER_ID = 'quotationSerial';
const FIRST_SERIAL = 101;

function toSerialNumber(value) {
  return /^\d+$/.test(String(value ?? '').trim()) ? Number(value) : null;
}

async function ensureCounter() {
  const existing = await Counter.findById(COUNTER_ID).lean();
  if (existing) return existing.value;

  // First run: continue after any quotations that were saved before the counter existed.
  const [latest] = await Quotation.aggregate([
    { $match: { serialNumber: /^[0-9]+$/ } },
    { $addFields: { numericSerial: { $toLong: '$serialNumber' } } },
    { $sort: { numericSerial: -1 } },
    { $limit: 1 },
  ]);
  const start = Math.max(FIRST_SERIAL, latest ? Number(latest.numericSerial) + 1 : FIRST_SERIAL);
  const counter = await Counter.findOneAndUpdate({ _id: COUNTER_ID }, { $setOnInsert: { value: start } }, { upsert: true, new: true }).lean();
  return counter.value;
}

export async function getNextSerial() {
  return String(await ensureCounter());
}

// Moves the counter one past the larger of its current value and the serial being replaced.
export async function advanceSerial(fromSerial) {
  await ensureCounter();
  const from = toSerialNumber(fromSerial) ?? 0;
  const counter = await Counter.findOneAndUpdate(
    { _id: COUNTER_ID },
    [{ $set: { value: { $max: [{ $add: ['$value', 1] }, from + 1] } } }],
    { new: true },
  ).lean();
  return String(counter.value);
}

// Keeps the counter ahead of a serial number that has just been saved.
export async function reserveSerial(savedSerial) {
  const saved = toSerialNumber(savedSerial);
  if (saved === null) return;
  await ensureCounter();
  await Counter.updateOne({ _id: COUNTER_ID }, { $max: { value: saved + 1 } });
}
