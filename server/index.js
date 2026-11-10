import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import { connectDatabase } from './db.js';
import { quotationsRouter } from './routes/quotations.js';

const app = express();
const port = Number(process.env.PORT || 4000);
const distDirectory = fileURLToPath(new URL('../dist', import.meta.url));
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

// Unlisted origins simply get no CORS headers (the browser then blocks them); same-origin requests are unaffected.
app.use('/api', cors({ origin: allowedOrigins }));
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_request, response) => {
  const isConnected = mongoose.connection.readyState === 1;
  response.status(isConnected ? 200 : 503).json({ status: isConnected ? 'ok' : 'database disconnected' });
});

app.use('/api/quotations', quotationsRouter);

app.use('/api', (_request, response) => {
  response.status(404).json({ error: 'API route not found.' });
});

// Serve the built frontend (npm run build) so the whole app can run from one process.
if (existsSync(distDirectory)) app.use(express.static(distDirectory));

app.use((error, _request, response, _next) => {
  console.error(error);
  response.status(500).json({ error: 'Unable to process the quotation request.' });
});

try {
  await connectDatabase();
  app.listen(port, () => {
    console.log(`Quotation API listening on port ${port}`);
  });
} catch (error) {
  console.error('Unable to connect to MongoDB:', error.message);
  process.exit(1);
}
