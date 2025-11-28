// Simple CORS proxy for local development
// This is NOT needed when deployed to Azure
import express from 'express';
import fetch from 'node-fetch';

const app = express();
const PORT = 3001;

app.use(express.json());

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Accept');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Proxy endpoint
app.get('/sparql', async (req, res) => {
  try {
    // Correct TriplyDB API endpoint
    const apiEndpoint = 'https://api.open-regels.triply.cc/datasets/stevengort/aow-leeftijd-service/services/aow-leeftijd-service/sparql';
    const queryParams = new URLSearchParams(req.query);
    const fullUrl = `${apiEndpoint}?${queryParams.toString()}`;

    console.log('📡 Proxy - Forwarding request to TriplyDB API');
    console.log('   Endpoint:', apiEndpoint);
    console.log('   Query preview:', req.query.query?.substring(0, 80) + '...');

    const response = await fetch(fullUrl, {
      headers: {
        'Accept': 'application/sparql-results+json',
        'User-Agent': 'TriplyDB-Local-Proxy/1.0'
      }
    });

    console.log('✅ TriplyDB Response:', response.status, response.statusText);
    
    const contentType = response.headers.get('content-type');
    console.log('   Content-Type:', contentType);
    
    res.header('Content-Type', contentType);

    // Check if we got HTML (error page) instead of JSON
    if (contentType && contentType.includes('html')) {
      const htmlError = await response.text();
      console.error('❌ TriplyDB returned HTML instead of JSON');
      console.error('   First 500 chars:', htmlError.substring(0, 500));
      
      return res.status(500).json({ 
        error: 'TriplyDB returned an error page',
        detail: 'Check if dataset exists and is public. You may need to use the correct API endpoint.',
        statusCode: response.status,
        hint: 'Try checking the endpoint URL in TriplyDB web interface'
      });
    }

    if (contentType && contentType.includes('json')) {
      const data = await response.json();
      console.log('✅ Success! Results count:', data.results?.bindings?.length || 0);
      res.json(data);
    } else {
      const data = await response.text();
      console.log('   Text response length:', data.length);
      res.send(data);
    }
  } catch (error) {
    console.error('❌ Proxy error:', error.message);
    res.status(500).json({ 
      error: 'Proxy failed',
      message: error.message 
    });
  }
});

app.listen(PORT, () => {
  console.log('🔄 CORS Proxy Server Started');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`   Listening on: http://localhost:${PORT}`);
  console.log(`   Proxying to:  https://open-regels.triply.cc/stevengort/aow-leeftijd-service/sparql`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
});
