import { useState, useRef, useEffect } from 'react';

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
  const [characterCount, setCharacterCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const [showOriginalComparison, setShowOriginalComparison] = useState(false);
  const outputRef = useRef(null);
  const inputRef = useRef(null);

  async function detectText(text) {
    setError('');
    try {
      const res = await fetch('/api/detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text,
          isRewritten: text !== input 
        }),
      });
      
      if (!res.ok) {
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
    if (!input.trim()) {
      setError('Please enter some text to humanize');
      return;
    }
    
    setError('');
    setLoading(true);
    setRewrittenScore(null);
    
    try {
      if (originalScore === null) {
        setDetectLoading(true);
        const score = await detectText(input);
        setOriginalScore(score);
        setDetectLoading(false);
      }
      
      const res = await fetch('/api/rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: input,
          preserveStyle,
          humanizationStrength
        }),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to rewrite text');
      }
      
      const data = await res.json();
      setRewritten(data.rewritten);
      
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
    setRewrittenScore(null);
    if (humanizationStrength === 'light') {
      setHumanizationStrength('medium');
    } else if (humanizationStrength === 'medium') {
      setHumanizationStrength('strong');
    }
    handleRewrite();
  }

  function handleCopyOutput() {
    if (rewritten) {
      navigator.clipboard.writeText(rewritten)
        .then(() => {
          setCopied(true);
          setTimeout(() => {
            setCopied(false);
          }, 1500);
        })
        .catch(err => {
          setError('Failed to copy text: ' + err.message);
        });
    }
  }

  function getScoreColor(score) {
    if (score === null) return '#a0aec0';
    if (score < 20) return '#38a169'; // Green - very human-like
    if (score < 40) return '#68d391'; // Light green - mostly human
    if (score < 60) return '#f6ad55'; // Orange - mixed
    if (score < 80) return '#ed8936'; // Dark orange - mostly AI
    return '#e53e3e'; // Red - very AI-like
  }

  useEffect(() => {
    // Add keyframes and styles
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    `;
    document.head.appendChild(style);
    
    // Load Inter font
    const fontLink = document.createElement('link');
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
    fontLink.rel = 'stylesheet';
    document.head.appendChild(fontLink);
    
    return () => {
      document.head.removeChild(style);
      document.head.removeChild(fontLink);
    };
  }, []);

  return (
    <div style={{
      fontFamily: '"Inter", system-ui, sans-serif',
      maxWidth: '900px',
      margin: '0 auto',
      padding: '40px 20px',
      backgroundColor: '#f8fafc',
      minHeight: '100vh'
    }}>
      <header style={{textAlign: 'center', marginBottom: '40px'}}>
        <h1 style={{
          fontSize: '36px',
          background: 'linear-gradient(90deg, #3a7bd5, #00d2ff)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          margin: '0 0 10px'
        }}>
          Humanize.ai
        </h1>
        <p style={{color: '#718096', fontSize: '18px'}}>
          Transform AI-generated text to sound naturally human and bypass detection
        </p>
      </header>
      
      <div style={{
        backgroundColor: 'white',
        padding: '25px',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
        marginBottom: '25px'
      }}>
        <label style={{
          display: 'block',
          marginBottom: '12px',
          fontWeight: '600',
          fontSize: '18px'
        }}>
          Input Text
        </label>
        <textarea
          ref={inputRef}
          value={input}
          onChange={e => {
            setInput(e.target.value);
            setCharacterCount(e.target.value.length);
          }}
          placeholder="Paste AI-generated text here..."
          style={{
            width: '100%',
            minHeight: '180px',
            padding: '16px',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            resize: 'vertical',
            fontFamily: 'inherit',
            fontSize: '16px',
            lineHeight: '1.6'
          }}
        />
        <div style={{textAlign: 'right', fontSize: '14px', color: '#a0aec0', marginTop: '8px'}}>
          {characterCount} / 5000
        </div>
        
        {originalScore !== null && (
          <div style={{marginTop: '15px'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px'}}>
              <span style={{fontWeight: '600'}}>AI Detection Score:</span>
              <div style={{
                backgroundColor: `${getScoreColor(originalScore)}20`,
                color: getScoreColor(originalScore),
                fontWeight: '600',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '14px'
              }}>
                {originalScore}% AI
              </div>
            </div>
          </div>
        )}
      </div>

      <div style={{
        display: 'flex',
        gap: '25px',
        flexWrap: 'wrap',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
        padding: '25px',
        marginBottom: '25px'
      }}>
        <div style={{flex: '1', minWidth: '250px'}}>
          <label style={{
            display: 'block',
            marginBottom: '12px',
            fontWeight: '600',
            fontSize: '16px'
          }}>
            Humanization Settings
          </label>
          <div style={{marginBottom: '15px'}}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              gap: '10px'
            }}>
              <input
                type="checkbox"
                checked={preserveStyle}
                onChange={e => setPreserveStyle(e.target.checked)}
              />
              <span>Preserve original tone/style</span>
            </label>
          </div>
        </div>
        
        <div style={{flex: '1', minWidth: '250px'}}>
          <label style={{
            display: 'block',
            marginBottom: '12px',
            fontWeight: '600',
            fontSize: '16px'
          }}>
            Humanization Strength
          </label>
          <div style={{display: 'flex', gap: '10px'}}>
            {['light', 'medium', 'strong'].map(strength => (
              <button
                key={strength}
                onClick={() => setHumanizationStrength(strength)}
                style={{
                  flex: 1,
                  padding: '10px 15px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  backgroundColor: humanizationStrength === strength ? '#ebf8ff' : 'white',
                  borderColor: humanizationStrength === strength ? '#4299e1' : '#e2e8f0',
                  color: humanizationStrength === strength ? '#2b6cb0' : '#4a5568',
                  fontWeight: humanizationStrength === strength ? '600' : 'normal',
                  cursor: 'pointer',
                  textTransform: 'capitalize'
                }}
              >
                {strength}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div style={{
          color: '#c53030',
          backgroundColor: '#fff5f5',
          padding: '16px',
          borderRadius: '8px',
          border: '1px solid #fed7d7',
          fontSize: '15px',
          marginBottom: '20px'
        }}>
          {error}
        </div>
      )}
      
      <button 
        onClick={handleRewrite} 
        disabled={loading || detectLoading}
        style={{
          backgroundColor: '#4299e1',
          backgroundImage: 'linear-gradient(135deg, #3a7bd5, #00d2ff)',
          color: 'white',
          padding: '14px 28px',
          border: 'none',
          borderRadius: '12px',
          cursor: (loading || detectLoading) ? 'not-allowed' : 'pointer',
          opacity: (loading || detectLoading) ? 0.7 : 1,
          fontSize: '18px',
          fontWeight: '600',
          width: '100%',
          height: '60px',
          marginBottom: '25px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px'
        }}
      >
        {(loading || detectLoading) ? (
          <span>{loading ? 'Rewriting Text...' : 'Analyzing Text...'}</span>
        ) : (
          <span>Humanize Text</span>
        )}
      </button>

      {rewritten && (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
          padding: '25px',
          border: '1px solid #e2e8f0',
          animation: 'fadeIn 0.5s ease-out'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <div>
              <h3 style={{
                margin: '0',
                fontSize: '18px',
                fontWeight: '600'
              }}>Humanized Text</h3>
              {rewrittenScore !== null && (
                <div style={{marginTop: '8px'}}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '8px'
                  }}>
                    <span style={{fontSize: '15px', fontWeight: '500'}}>AI Detection Score:</span> 
                    <div style={{
                      backgroundColor: `${getScoreColor(rewrittenScore)}20`,
                      color: getScoreColor(rewrittenScore),
                      fontWeight: '600',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <span>{rewrittenScore}% AI</span>
                      
                      {rewrittenScore > 30 && (
                        <button
                          onClick={handleTryAgain}
                          style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.6)',
                            border: 'none',
                            borderRadius: '50%',
                            width: '22px',
                            height: '22px',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                          }}
                          title="Try stronger humanization"
                        >
                          ↻
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div style={{display: 'flex', gap: '10px'}}>
              <button
                onClick={() => setShowOriginalComparison(!showOriginalComparison)}
                style={{
                  backgroundColor: showOriginalComparison ? '#ebf8ff' : 'white',
                  border: `1px solid ${showOriginalComparison ? '#63b3ed' : '#e2e8f0'}`,
                  borderRadius: '8px',
                  padding: '8px 16px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                {showOriginalComparison ? 'Hide Original' : 'Compare'}
              </button>

              <button
                onClick={handleCopyOutput}
                style={{
                  backgroundColor: copied ? '#f0fff4' : 'white',
                  border: `1px solid ${copied ? '#9ae6b4' : '#e2e8f0'}`,
                  borderRadius: '8px',
                  padding: '8px 16px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                {copied ? 'Copied!' : 'Copy Output'}
              </button>
            </div>
          </div>
          
          {showOriginalComparison ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '15px',
              marginTop: '15px'
            }}>
              <div>
                <div style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  marginBottom: '10px'
                }}>
                  Original Text
                </div>
                <div style={{
                  backgroundColor: '#f8fafc',
                  padding: '20px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  fontFamily: 'inherit',
                  fontSize: '16px',
                  lineHeight: '1.7',
                  maxHeight: '500px',
                  overflowY: 'auto'
                }}>
                  {input}
                </div>
              </div>
              <div>
                <div style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  marginBottom: '10px'
                }}>
                  Humanized Text
                </div>
                <pre 
                  ref={outputRef}
                  style={{
                    backgroundColor: '#f8fafc',
                    padding: '20px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    fontFamily: 'inherit',
                    fontSize: '16px',
                    lineHeight: '1.7',
                    margin: 0,
                    maxHeight: '500px',
                    overflowY: 'auto'
                  }}
                >
                  {rewritten}
                </pre>
              </div>
            </div>
          ) : (
            <pre 
              ref={outputRef}
              style={{
                backgroundColor: '#f8fafc',
                padding: '20px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                fontFamily: 'inherit',
                fontSize: '16px',
                lineHeight: '1.7',
                margin: '15px 0 0 0',
                maxHeight: '500px',
                overflowY: 'auto'
              }}
            >
              {rewritten}
            </pre>
          )}
          
          {detectLoading && (
            <div style={{
              textAlign: 'center',
              marginTop: '20px',
              color: '#718096'
            }}>
              Analyzing humanized text...
            </div>
          )}
        </div>
      )}
      
      <div style={{
        marginTop: '40px',
        fontSize: '14px',
        color: '#718096',
        borderTop: '1px solid #e2e8f0',
        paddingTop: '20px',
        textAlign: 'center'
      }}>
        <p>© 2025 Humanize.ai — Transform AI text into natural human writing</p>
        <div style={{
          marginTop: '10px',
          fontSize: '13px'
        }}>
        </div>
      </div>
    </div>
  );
}