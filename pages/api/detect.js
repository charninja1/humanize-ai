export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { text } = req.body;
    
    if (!text || text.trim() === '') {
      return res.status(400).json({ error: 'Text input is required' });
    }

    // Simplified response - AI percentage feature removed
    return res.status(200).json({ 
      success: true,
      message: "Text processed successfully"
    });
    
  } catch (error) {
    console.error('Error in detection API:', error.message);
    res.status(500).json({ error: 'Failed to process text', message: error.message });
  }
}