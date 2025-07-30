export default async function handler(req, res) {
  console.log('📨 Webhook received:', {
    method: req.method,
    body: req.body,
    timestamp: new Date().toISOString()
  });

  try {
    const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxNV3x4sXlMfoMIAV8LqqSAQltMBz6pouEI-48YhiJXnwFKuIKE7YCIxIn2OgLlFp0/exec';
    
    if (req.method !== 'POST') {
      return res.status(405).json({ 
        error: 'Method not allowed',
        message: 'Only POST requests are accepted' 
      });
    }

    if (!req.body) {
      return res.status(400).json({ 
        error: 'Bad request',
        message: 'Request body is required' 
      });
    }

    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Zalo-Webhook-Proxy/1.0'
      },
      body: JSON.stringify(req.body)
    });

    const result = await response.text();
    
    console.log('✅ Apps Script response:', {
      status: response.status,
      result: result
    });

    res.status(response.status).send(result);

  } catch (error) {
    console.error('❌ Webhook proxy error:', error.message);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Webhook proxy failed'
    });
  }
}
