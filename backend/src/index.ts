import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import http from 'http';
import { connectDB } from './config/db';
import { setupWebSocket } from './websocket/ws';
import assignmentRoutes from './routes/assignment.routes';
import './workers/generation.worker';

const app    = express();
const server = http.createServer(app);

// ── Corrected Manual CORS ────────────────────────────────────────────
app.use((req: Request, res: Response, next: NextFunction) => {
  // Browsers block '*' when credentials are true. We must echo the exact origin.
  const origin = req.headers.origin || '*';
  
  res.header('Access-Control-Allow-Origin', origin);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api/assignments', assignmentRoutes);

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

setupWebSocket(server);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`🚀 Server + Worker running on port ${PORT}`);
  });
});
