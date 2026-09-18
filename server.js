// import express from 'express';

// const app = express();
// let cachedAdcashJs = '';
// let lastFetchTime = 0;
// const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes cache

// async function refreshAdcashScript() {
//   try {
//     // Native fetch is built into Node 18+
//     const response = await fetch('https://adbpage.com/adblock?v=3&format=js');
//     if (response.ok) {
//       cachedAdcashJs = await response.text();
//       lastFetchTime = Date.now();
//       console.log('Successfully refreshed Adcash Anti-Adblock script');
//     }
//   } catch (err) {
//     console.error('Failed to fetch Adcash Anti-Adblock script:', err);
//   }
// }

// // Initial fetch on server start
// refreshAdcashScript();

// // Periodically update cache every 5 minutes
// setInterval(refreshAdcashScript, CACHE_DURATION_MS);

// // Serve the cached script to your frontend
// app.get('/api/adcash-lib.js', (req, res) => {
//   res.setHeader('Content-Type', 'application/javascript');
//   res.setHeader('Cache-Control', 'public, max-age=300');
//   res.send(cachedAdcashJs);
// });

// app.listen(5000, () => console.log('Server running on port 5000'));









import express from 'express';

const app = express();
let cachedAdcashJs = '';
let lastFetchTime = 0;
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes cache

async function refreshAdcashScript() {
  try {
    const response = await fetch('https://adbpage.com/adblock?v=3&format=js');
    if (response.ok) {
      cachedAdcashJs = await response.text();
      lastFetchTime = Date.now();
      console.log('Successfully refreshed Adcash Anti-Adblock script');
    }
  } catch (err) {
    console.error('Failed to fetch Adcash Anti-Adblock script:', err);
  }
}

// Initial fetch on server start
refreshAdcashScript();

// Periodically update cache every 5 minutes
setInterval(refreshAdcashScript, CACHE_DURATION_MS);

// Root health check
app.get('/', (req, res) => {
  res.send('GetJobLink API Proxy is up and running!');
});

// Serve the cached script to your frontend
app.get('/api/adcash-lib.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.setHeader('Cache-Control', 'public, max-age=300');
  res.send(cachedAdcashJs);
});

// Greenhouse API proxy (bypass CORS)
app.get('/api/greenhouse/:board/jobs', async (req, res) => {
  try {
    const { board } = req.params;
    const url = `https://api.greenhouse.io/v1/boards/${encodeURIComponent(board)}/jobs`;
    const response = await fetch(url);
    if (!response.ok) {
      return res.status(response.status).json({ error: 'Greenhouse fetch failed' });
    }
    const data = await response.json();
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.json(data);
  } catch (err) {
    console.error('Greenhouse proxy error:', err);
    res.status(500).json({ error: 'Proxy error' });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));