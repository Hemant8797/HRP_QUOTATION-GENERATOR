# HRP Logistics Quotation Desk

Full-stack quotation app: React (Vite) frontend, Express API, MongoDB (Mongoose) database.

- **New quotation** (`#/new`): create a quotation with a live print preview. Carrier details are pre-filled; party details start empty. The quotation number comes from a counter stored in MongoDB that starts at 101. **Reset** clears the form and moves the counter to the next number, and saving a quotation keeps the counter ahead of the saved number, so reopening the site always shows the next number.
- **Quotation list** (`#/quotations`): every saved quotation, searchable by number, party, city or goods. Open, modify or delete from here.
- **View** (`#/quotations/:id`): the print-ready quotation with **Print** and **Modify** buttons.
- **Modify** (`#/quotations/:id/edit`): edit and save changes to an existing quotation.

## Project structure

```
server/
  index.js              Express app (API + serves dist/ in production)
  db.js                 MongoDB connection
  models/Quotation.js   Mongoose schema
  routes/quotations.js  REST routes
src/
  main.jsx              App shell, routing, toasts
  QuotationEditor.jsx   Create / modify form
  QuotationList.jsx     Quotation list
  QuotationView.jsx     Read-only view with print
  Quotation.jsx         Printable quotation layout
```

## API

| Method | Path | Description |
| --- | --- | --- |
| GET | `/api/quotations` | List quotation summaries (newest first) |
| GET | `/api/quotations/next-serial` | Current counter value (number for the next blank quotation) |
| POST | `/api/quotations/next-serial/advance` | Move the counter past `{ from }` and return the new number |
| GET | `/api/quotations/:id` | Get one quotation |
| POST | `/api/quotations` | Create (serial numbers must be unique) |
| PUT | `/api/quotations/:id` | Update |
| DELETE | `/api/quotations/:id` | Delete |

## Local setup

1. Start MongoDB locally (for example `brew services start mongodb-community`) or create a MongoDB Atlas cluster.
2. Copy `.env.example` to `.env` and set `MONGODB_URI`.
3. Run `npm install`.
4. In one terminal run `npm run dev:server` (API on port 4000, restarts on changes); in another run `npm run dev` (Vite proxies `/api` to the API).

## Production

Run `npm run build`, then `npm start`. Express serves both the API and the built frontend from one process, so only `MONGODB_URI` (and optionally `PORT`) needs to be set.

To host the frontend separately, set `VITE_API_URL` to the API URL followed by `/api` before building, and add the frontend's URL to `CORS_ORIGIN` on the API server. Keep `MONGODB_URI` server-side; never expose it as a `VITE_` variable.
