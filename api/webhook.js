export default async function handler(req, res) {
  console.log('📨 Webhook received:', {
    method: req.method,
    body: req.body,
    timestamp: new Date().toISOString()
  });

  try {
    // Phản hồi nhanh cho Zalo trước
    if (req.method === 'POST' && req.body) {
      // Trả về OK ngay lập tức
      res.status(200).json({ 
        success: true, 
        message: 'Webhook received',
        timestamp: new Date().toISOString()
      });

      // Xử lý Apps Script bất đồng bộ (không chờ)
      processAsyncRequest(req.body);
    } else {
      res.status(405).json({ 
        error: 'Method not allowed',
        message: 'Only POST requests accepted' 
      });
    }

  } catch (error) {
    console.error('❌ Webhook error:', error.message);
    res.status(200).json({
      success: true,
      message: 'Webhook received but processing failed'
    });
  }
}

// Xử lý Apps Script không đồng bộ
async function processAsyncRequest(body) {
  try {
    const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxNV3x4sXlMfoMIAV8LqqSAQltMBz6pouEI-48YhiJXnwFKuIKE7YCIxIn2OgLlFp0/exec';
    
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Zalo-Webhook-Proxy/1.0'
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(25000) // 25s timeout
    });

    const result = await response.text();
    console.log('✅ Apps Script response:', {
      status: response.status,
      result: result.substring(0, 200)
    });

  } catch (error) {
    console.error('❌ Apps Script processing error:', error.message);
  }
}
