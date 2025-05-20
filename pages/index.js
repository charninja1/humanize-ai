import { useState, useRef } from 'react';

export default function Home() {
  const [input, setInput] = useState('');
  const [rewritten, setRewritten] = useState('');
  const [loading, setLoading] = useState(false);
  const [detectLoading, setDetectLoading] = useState(false);
  const [error, setError] = useState('');
  const [preserveStyle, setPreserveStyle] = useState(false);
  const [humanizationStrength, setHumanizationStrength] = useState('medium');
  const [originalScore, setOriginalScore] = useState(null);
  const [rewrittenScore, setRewrittenScore] = useState(null);
  const outputRef = useRef(null);

  async function detectText(text) {
    setError('');
    try {
      const res = await fetch('/api/detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      
      if (\!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Detection failed');
      }
      
      const data = await res.json();
      return data.aiProbability;
    } catch (err) {
      console.error('Detection error:', err);
      setError(`Detection error: ${err.message}`);
      return null;
    }
  }

  async function handleRewrite() {
    if (\!input.trim()) {
      setError('Please enter some text to humanize');
      return;
    }
    
    setError('');
    setLoading(true);
    setRewrittenScore(null);
    
    try {
      // First, detect the original text if not already analyzed
      if (originalScore === null) {
        setDetectLoading(true);
        const score = await detectText(input);
        setOriginalScore(score);
        setDetectLoading(false);
      }
      
      // Now rewrite the text
      const res = await fetch('/api/rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: input,
          preserveStyle,
          humanizationStrength
        }),
      });
      
      if (\!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to rewrite text');
      }
      
      const data = await res.json();
      setRewritten(data.rewritten);
      
      // Detect the rewritten text
      setDetectLoading(true);
      const rewrittenScoreValue = await detectText(data.rewritten);
      setRewrittenScore(rewrittenScoreValue);
      setDetectLoading(false);
      
    } catch (err) {
      setError(err.message || 'An error occurred while processing your request');
      console.error('Rewrite error:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleTryAgain() {
    // Reset the rewritten score and try again with a stronger humanization
    setRewrittenScore(null);
    
    // Adjust the humanization strength to the next level if possible
    if (humanizationStrength === 'light') {
      setHumanizationStrength('medium');
    } else if (humanizationStrength === 'medium') {
      setHumanizationStrength('strong');
    }
    
    // Re-run the rewrite
    handleRewrite();
  }

  function handleCopyOutput() {
    if (rewritten) {
      navigator.clipboard.writeText(rewritten)
        .then(() => {
          // Show temporary "Copied\!" indicator
          const outputEl = outputRef.current;
          if (outputEl) {
            const originalBackground = outputEl.style.background;
            outputEl.style.background = '#e6ffe6';
            setTimeout(() => {
              outputEl.style.background = originalBackground;
            }, 500);
          }
        })
        .catch(err => {
          setError('Failed to copy text: ' + err.message);
        });
    }
  }

  // Helper function to get a color based on the AI score
  function getScoreColor(score) {
    if (score === null) return '#999';
    if (score < 20) return '#2e7d32'; // Safe
    if (score < 50) return '#ff9800'; // Caution
    return '#d32f2f'; // Danger
  }

  return (
    <div style={{ 
      padding: '40px', 
      maxWidth: '800px', 
      margin: '0 auto', 
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ 
        color: '#333', 
        borderBottom: '2px solid #eee', 
        paddingBottom: '10px',
        marginBottom: '25px'
      }}>
        Humanize.ai
      </h1>
      
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
          Input Text:
        </label>
        <textarea
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '4px',
            border: '1px solid #ddd',
            minHeight: '150px',
            fontFamily: 'inherit'
          }}
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Paste AI-generated text here"
        />

        {originalScore \!== null && (
          <div style={{ marginTop: '8px', fontSize: '14px' }}>
            <span style={{ fontWeight: 'bold' }}>Original Detection:</span> 
            <span style={{ 
              color: getScoreColor(originalScore),
              fontWeight: 'bold'
            }}>
              {originalScore}% AI
            </span>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px' }}>
            <input
              type="checkbox"
              checked={preserveStyle}
              onChange={e => setPreserveStyle(e.target.checked)}
              style={{ marginRight: '6px' }}
            />
            Preserve tone/style
          </label>
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '8px' }}>
            Humanization Strength:
          </label>
          <select 
            value={humanizationStrength}
            onChange={e => setHumanizationStrength(e.target.value)}
            style={{
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ddd'
            }}
          >
            <option value="light">Light</option>
            <option value="medium">Medium</option>
            <option value="strong">Strong</option>
          </select>
        </div>
      </div>

      {error && (
        <div style={{ 
          color: 'red', 
          backgroundColor: '#ffeeee', 
          padding: '10px', 
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          {error}
        </div>
      )}
      
      <button 
        onClick={handleRewrite} 
        disabled={loading || detectLoading}
        style={{
          backgroundColor: '#4CAF50',
          color: 'white',
          padding: '10px 20px',
          border: 'none',
          borderRadius: '4px',
          cursor: (loading || detectLoading) ? 'not-allowed' : 'pointer',
          opacity: (loading || detectLoading) ? 0.7 : 1
        }}
      >
        {loading ? 'Rewriting...' : detectLoading ? 'Detecting...' : 'Humanize Text'}
      </button>

      {rewritten && (
        <div style={{ marginTop: '30px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: '0' }}>Output:</h3>
              {rewrittenScore \!== null && (
                <div style={{ fontSize: '14px' }}>
                  <span style={{ fontWeight: 'bold' }}>Detection Score:</span> 
                  <span style={{ 
                    color: getScoreColor(rewrittenScore),
                    fontWeight: 'bold'
                  }}>
                    {rewrittenScore}% AI
                  </span>
                  
                  {rewrittenScore > 30 && (
                    <button
                      onClick={handleTryAgain}
                      style={{
                        backgroundColor: '#ff9800',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '4px 8px',
                        marginLeft: '10px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      Try Again
                    </button>
                  )}
                </div>
              )}
            </div>
            <button
              onClick={handleCopyOutput}
              style={{
                backgroundColor: '#f0f0f0',
                border: '1px solid #ddd',
                borderRadius: '4px',
                padding: '6px 12px',
                cursor: 'pointer'
              }}
            >
              Copy Output
            </button>
          </div>
          
          <pre 
            ref={outputRef}
            style={{ 
              backgroundColor: '#f9f9f9', 
              padding: '15px', 
              borderRadius: '4px',
              border: '1px solid #eee',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              marginTop: '10px',
              fontFamily: 'inherit',
              lineHeight: '1.5',
              transition: 'background 0.3s'
            }}
          >
            {rewritten}
          </pre>
          
          {detectLoading && (
            <div style={{ textAlign: 'center', marginTop: '10px', color: '#666' }}>
              Analyzing results...
            </div>
          )}
        </div>
      )}
      
      <div style={{ marginTop: '40px', fontSize: '14px', color: '#666', borderTop: '1px solid #eee', paddingTop: '20px' }}>
        <p>
          <strong>Note:</strong> This tool requires API keys to be set up correctly in the .env.local file:
        </p>
        <ul style={{ paddingLeft: '20px' }}>
          <li>OPENAI_API_KEY - Required for the rewriting functionality</li>
          <li>GPTZERO_API_KEY - Required for AI detection scoring</li>
        </ul>
      </div>
    </div>
  );
}
EOF < /dev/null