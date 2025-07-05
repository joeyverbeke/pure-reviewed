import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import the sanitize handler (ES modules)
import sanitizeHandler from '../api/sanitize.js';
import healthHandler from '../api/health.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// API Routes
app.post('/api/sanitize', async (req, res) => {
  try {
    await sanitizeHandler(req, res);
  } catch (error) {
    console.error('Sanitize error:', error);
    res.status(500).json({ error: 'Processing failed' });
  }
});

app.get('/api/health', async (req, res) => {
  try {
    await healthHandler(req, res);
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({ error: 'Health check failed' });
  }
});

// Serve index.html for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`🔑 OpenAI API: ${process.env.OPENAI_API_KEY ? '✅ Configured' : '❌ Not configured (fallback mode)'}`);
  console.log(`📡 API endpoints:`);
  console.log(`   POST /api/sanitize - Process text`);
  console.log(`   GET  /api/health   - Health check`);
  console.log('-'.repeat(50));
}); 