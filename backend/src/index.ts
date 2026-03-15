import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import startupRoutes from './routes/startups';

const app = express();
const PORT = process.env.PORT ?? 4000;

app.use(cors({ origin: process.env.FRONTEND_URL ?? 'http://localhost:3000' }));
app.use(express.json());

// ── Routes ────────────────────────────────────────────────────
app.use('/api/startups', startupRoutes);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// ── Start ─────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
