import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const distPath = path.join(__dirname, 'dist');

// Serve static assets from the production build directory
app.use(express.static(distPath, {
  maxAge: '1d',
  index: false,
}));

// SPA Fallback: Serve index.html for all non-static file routes so page refreshes never return 404
app.get('*', (req, res) => {
  const indexPath = path.join(distPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head><meta http-equiv="refresh" content="2"><title>Loading...</title></head>
        <body style="font-family:sans-serif;background:#08121B;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
          <p>Starting up Certified Adventures...</p>
        </body>
      </html>
    `);
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Certified Adventures server running on http://0.0.0.0:${PORT}`);
});
