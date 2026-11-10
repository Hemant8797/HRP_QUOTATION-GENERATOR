import { Router } from 'express';
import mongoose from 'mongoose';
import { Quotation } from '../models/Quotation.js';
import { advanceSerial, getNextSerial, reserveSerial } from '../serialCounter.js';

export const quotationsRouter = Router();

function validateQuotation(body) {
  const serialNumber = String(body.serialNumber || '').trim();

  if (!serialNumber) return { error: 'Serial number is required.' };
  if (!body.company || typeof body.company !== 'object' || Array.isArray(body.company)) return { error: 'Carrier details are required.' };
  if (!body.party || typeof body.party !== 'object' || Array.isArray(body.party)) return { error: 'Party details are required.' };
  if (!Array.isArray(body.rates) || !body.rates.every(Array.isArray)) return { error: 'Rates must be a list of rows.' };

  return {
    value: {
      serialNumber,
      company: body.company,
      party: body.party,
      rates: body.rates.map(row => row.map(cell => String(cell ?? ''))),
    },
  };
}

function handleWriteError(error, response, next) {
  if (error.code === 11000) return response.status(409).json({ error: `Quotation no. ${error.keyValue?.serialNumber} already exists. Use a different serial number.` });
  if (error.name === 'ValidationError') return response.status(400).json({ error: error.message });
  return next(error);
}

quotationsRouter.param('id', (request, response, next, id) => {
  if (!mongoose.isValidObjectId(id)) return response.status(404).json({ error: 'Quotation not found.' });
  return next();
});

quotationsRouter.get('/', async (_request, response, next) => {
  try {
    const quotations = await Quotation.find({}, 'serialNumber party.name party.city party.goods rates createdAt updatedAt')
      .sort({ updatedAt: -1 })
      .lean();

    response.json(quotations.map(quotation => ({
      id: String(quotation._id),
      serialNumber: quotation.serialNumber,
      partyName: quotation.party?.name || 'Untitled party',
      city: quotation.party?.city || '',
      goods: quotation.party?.goods || '',
      stationCount: quotation.rates?.length || 0,
      createdAt: quotation.createdAt,
      updatedAt: quotation.updatedAt,
    })));
  } catch (error) {
    next(error);
  }
});

quotationsRouter.get('/next-serial', async (_request, response, next) => {
  try {
    response.json({ serialNumber: await getNextSerial() });
  } catch (error) {
    next(error);
  }
});

quotationsRouter.post('/next-serial/advance', async (request, response, next) => {
  try {
    response.json({ serialNumber: await advanceSerial(request.body?.from) });
  } catch (error) {
    next(error);
  }
});

quotationsRouter.get('/:id', async (request, response, next) => {
  try {
    const quotation = await Quotation.findById(request.params.id);
    if (!quotation) return response.status(404).json({ error: 'Quotation not found.' });
    return response.json(quotation);
  } catch (error) {
    return next(error);
  }
});

quotationsRouter.post('/', async (request, response, next) => {
  const validation = validateQuotation(request.body);
  if (validation.error) return response.status(400).json({ error: validation.error });

  try {
    const quotation = await Quotation.create(validation.value);
    await reserveSerial(quotation.serialNumber);
    return response.status(201).json(quotation);
  } catch (error) {
    return handleWriteError(error, response, next);
  }
});

quotationsRouter.put('/:id', async (request, response, next) => {
  const validation = validateQuotation(request.body);
  if (validation.error) return response.status(400).json({ error: validation.error });

  try {
    const quotation = await Quotation.findByIdAndUpdate(request.params.id, validation.value, { new: true, runValidators: true });
    if (!quotation) return response.status(404).json({ error: 'Quotation not found.' });
    await reserveSerial(quotation.serialNumber);
    return response.json(quotation);
  } catch (error) {
    return handleWriteError(error, response, next);
  }
});

quotationsRouter.delete('/:id', async (request, response, next) => {
  try {
    const quotation = await Quotation.findByIdAndDelete(request.params.id);
    if (!quotation) return response.status(404).json({ error: 'Quotation not found.' });
    return response.status(204).end();
  } catch (error) {
    return next(error);
  }
});
