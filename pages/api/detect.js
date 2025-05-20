export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { text } = req.body;
    
    if (!text || text.trim() === '') {
      return res.status(400).json({ error: 'Text input is required' });
    }

    // Check if GPTZero API key is configured
    if (!process.env.GPTZERO_API_KEY) {
      console.log('GPTZero API key not configured, using mock detection');
      // Return a mock detection response - random score between 60-90 for original text
      // and 5-30 for rewritten text to simulate improvement
      
      // This logic assumes original texts have higher AI probability scores
      // If this is a rewritten text (shorter than original but similar), give a lower score
      const mockScore = req.body.isRewritten ? 
        Math.floor(Math.random() * 25) + 5 : // 5-30% for rewritten
        Math.floor(Math.random() * 30) + 60; // 60-90% for original
        
      return res.status(200).json({ 
        aiProbability: mockScore,
        isMockData: true
      });
    }

    // Real GPTZero API call when key is available
    const response = await fetch('https://api.gptzero.me/v2/predict/text', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.GPTZERO_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        document: text,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`GPTZero API error: ${errorData.error || 'Unknown error'}`);
    }

    const data = await response.json();
    
    // Extract the AI probability score from the response
    // Adjust the parsing based on the actual GPTZero API response format
    const aiProbability = Math.round(data.documents?.[0]?.completely_generated_prob * 100) || 0;

    res.status(200).json({ 
      aiProbability,
      rawResponse: data
    });
  } catch (error) {
    console.error('Error in detection API:', error.message);
    res.status(500).json({ error: 'Failed to analyze text', message: error.message });
  }
}