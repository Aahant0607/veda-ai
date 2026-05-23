import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import http from 'http';
import { connectDB } from './config/db';
import { setupWebSocket } from './websocket/ws';
import assignmentRoutes from './routes/assignment.routes';

// ── On Render free tier, run worker in same process ──────────────────
import './workers/generation.worker';

const app    = express();
const server = http.createServer(app);

// ── CORS — allow all origins (fixes Vercel ↔ Render mismatch) ────────
app.use(cors({
  origin: true,
  credentials: true,
}));

// ── Handle preflight requests for all routes ──────────────────────────
app.options('*', cors({ origin: true, credentials: true }));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api/assignments', assignmentRoutes);
app.get('/health', (_, res) => res.json({ status: 'ok' }));

setupWebSocket(server);

const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`🚀 Server + Worker running on port ${PORT}`);
  });
});
