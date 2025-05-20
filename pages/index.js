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
          const outputEl = outputRef.current;
          if (outputEl) {
            const originalBackground = outputEl.style.background;
            outputEl.style.background = '#f0fff4';
            outputEl.style.borderColor = '#9ae6b4';
            setTimeout(() => {
              outputEl.style.background = originalBackground;
              outputEl.style.borderColor = '#e2e8f0';
              setCopied(false);
            }, 1500);
          }
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
  
  // Add animation keyframes
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      @keyframes shimmer {
        from { background-position: 200% 0; }
        to { background-position: -200% 0; }
      }
      @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
      }
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes expandLine {
        to { transform: scaleX(1); }
      }
      @keyframes fadeUp {
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes floatAnimation {
        0% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
        100% { transform: translateY(0); }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  // Add font import
  useEffect(() => {
    const fontLink = document.createElement('link');
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
    fontLink.rel = 'stylesheet';
    document.head.appendChild(fontLink);
    
    return () => {
      document.head.removeChild(fontLink);
    };
  }, []);

  return (
    <div style={{ 
      padding: '40px', 
      maxWidth: '900px', 
      margin: '0 auto', 
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#2d3748',
      background: 'linear-gradient(145deg, #f9fafc 0%, #f1f5f9 100%)',
      minHeight: '100vh',
      position: 'relative',
      overflowX: 'hidden'
    }}>
      {/* Background gradient accent elements */}
      <div style={{
        position: 'absolute',
        top: '-150px',
        right: '-150px',
        width: '300px',
        height: '300px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(56, 178, 172, 0.07) 0%, rgba(56, 178, 172, 0) 70%)',
        zIndex: 0,
        pointerEvents: 'none'
      }}></div>
      <div style={{
        position: 'absolute',
        bottom: '-100px',
        left: '-100px',
        width: '250px',
        height: '250px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(66, 153, 225, 0.07) 0%, rgba(66, 153, 225, 0) 70%)',
        zIndex: 0,
        pointerEvents: 'none'
      }}></div>
      <header style={{ 
        textAlign: 'center', 
        marginBottom: '40px',
        position: 'relative',
        zIndex: 1,
        overflow: 'hidden'
      }}>
        <h1 style={{ 
          fontSize: '36px',
          fontWeight: '700',
          background: 'linear-gradient(90deg, #3a7bd5, #00d2ff)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          margin: '0 0 10px',
          display: 'inline-block',
          position: 'relative'
        }}>
          Humanize.ai
          <span style={{
            position: 'absolute',
            bottom: '-2px',
            left: 0,
            width: '100%',
            height: '2px',
            background: 'linear-gradient(90deg, #3a7bd5, #00d2ff)',
            transform: 'scaleX(0)',
            transformOrigin: 'left',
            animation: 'expandLine 0.8s ease-out forwards 0.3s'
          }}></span>
        </h1>
        <p style={{ 
          color: '#718096', 
          fontSize: '18px',
          maxWidth: '600px',
          margin: '0 auto',
          opacity: 0,
          transform: 'translateY(10px)',
          animation: 'fadeUp 0.8s ease-out forwards 0.6s'
        }}>
          Transform AI-generated text to sound naturally human and bypass detection
        </p>
      </header>
      
      <div style={{ 
        display: 'flex',
        gap: '30px',
        flexDirection: 'column',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{ 
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
          padding: '25px',
          border: '1px solid #e2e8f0'
        }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '12px', 
            fontWeight: '600',
            fontSize: '18px',
            color: '#4a5568'
          }}>
            Input Text
          </label>
          <div style={{ position: 'relative' }}>
            <textarea
              ref={inputRef}
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                minHeight: '180px',
                fontFamily: 'inherit',
                fontSize: '16px',
                lineHeight: '1.6',
                outline: 'none',
                transition: 'border-color 0.2s, box-shadow 0.2s',
                boxSizing: 'border-box',
                boxShadow: input ? '0 2px 4px rgba(0,0,0,0.05) inset' : 'none',
                resize: 'vertical'
              }}
              value={input}
              onChange={e => {
                setInput(e.target.value);
                setCharacterCount(e.target.value.length);
              }}
              placeholder="Paste AI-generated text here..."
              onFocus={(e) => {
                e.target.style.borderColor = '#4299e1';
                e.target.style.boxShadow = '0 0 0 3px rgba(66, 153, 225, 0.15)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e2e8f0';
                e.target.style.boxShadow = input ? '0 2px 4px rgba(0,0,0,0.05) inset' : 'none';
              }}
            />
            <div style={{
              position: 'absolute',
              bottom: '8px',
              right: '12px',
              fontSize: '13px',
              color: characterCount > 5000 ? '#e53e3e' : '#a0aec0',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              padding: '2px 8px',
              borderRadius: '4px'
            }}>
              {characterCount} / 5000
            </div>
          </div>

        {originalScore !== null && (
          <div style={{ 
            marginTop: '15px', 
            fontSize: '15px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '8px'
            }}>
              <span style={{ fontWeight: '600' }}>AI Detection Score:</span> 
              <div style={{ 
                backgroundColor: `${getScoreColor(originalScore)}15`,
                color: getScoreColor(originalScore), 
                fontWeight: '600',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '14px'
              }}>
                {originalScore}% AI
              </div>
            </div>
            <div style={{
              height: '8px',
              width: '100%',
              backgroundColor: '#edf2f7',
              borderRadius: '4px',
              overflow: 'hidden',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                height: '100%',
                width: `${originalScore}%`,
                background: `linear-gradient(90deg, ${getScoreColor(originalScore)}50, ${getScoreColor(originalScore)})`,
                borderRadius: '4px',
                transition: 'width 0.5s ease-in-out'
              }}></div>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '12px',
              color: '#718096',
              marginTop: '4px'
            }}>
              <span>Human</span>
              <span>AI Generated</span>
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
        border: '1px solid #e2e8f0',
        justifyContent: 'space-between'
      }}>
        <div style={{ flex: '1', minWidth: '250px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '12px', 
            fontWeight: '600',
            fontSize: '16px',
            color: '#4a5568'
          }}>
            Humanization Settings
          </label>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              cursor: 'pointer',
              gap: '10px'
            }}>
              <div style={{
                position: 'relative',
                width: '36px',
                height: '20px',
                backgroundColor: preserveStyle ? '#4299e1' : '#cbd5e0',
                borderRadius: '20px',
                transition: 'all 0.3s ease'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '2px',
                  left: preserveStyle ? '18px' : '2px',
                  width: '16px',
                  height: '16px',
                  backgroundColor: 'white',
                  borderRadius: '50%',
                  transition: 'all 0.3s ease'
                }}></div>
              </div>
              <input
                type="checkbox"
                checked={preserveStyle}
                onChange={e => setPreserveStyle(e.target.checked)}
                style={{ 
                  position: 'absolute',
                  opacity: 0,
                  cursor: 'pointer',
                  height: 0,
                  width: 0
                }}
              />
              <span style={{ fontSize: '15px' }}>Preserve original tone/style</span>
            </label>
          </div>
        </div>
        
        <div style={{ flex: '1', minWidth: '250px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '12px', 
            fontWeight: '600',
            fontSize: '16px',
            color: '#4a5568'
          }}>
            Humanization Strength
          </label>
          <div style={{
            display: 'flex',
            gap: '10px'
          }}>
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
                  textTransform: 'capitalize',
                  transition: 'all 0.2s'
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
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
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
          boxShadow: '0 4px 15px rgba(50, 50, 93, 0.15), 0 1px 5px rgba(0, 0, 0, 0.1)',
          transition: 'all 0.3s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          width: '100%',
          height: '60px',
          marginBottom: '25px',
          position: 'relative',
          overflow: 'hidden'
        }}
        onMouseEnter={(e) => {
          if (!loading && !detectLoading) {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 20px rgba(50, 50, 93, 0.2), 0 1px 7px rgba(0, 0, 0, 0.12)';
          }
        }}
        onMouseLeave={(e) => {
          if (!loading && !detectLoading) {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 15px rgba(50, 50, 93, 0.15), 0 1px 5px rgba(0, 0, 0, 0.1)';
          }
        }}
      >
        {(loading || detectLoading) && (
          <>
            <svg width="22" height="22" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{
              animation: 'spin 1s linear infinite'
            }}>
              <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="4" fill="none" strokeDasharray="32" strokeDashoffset="8" />
            </svg>
            <span style={{ position: 'relative' }}>
              {loading ? 'Rewriting Text...' : 'Analyzing Text...'}
            </span>
          </>
        )}
        {!loading && !detectLoading && (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
            </svg>
            <span>Humanize Text</span>
          </>
        )}
        
        {/* Button background animation */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 50%, rgba(255,255,255,0.1) 100%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 2s infinite',
          zIndex: 0,
          pointerEvents: 'none'
        }}></div>
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
                fontWeight: '600',
                color: '#4a5568' 
              }}>Humanized Text</h3>
              {rewrittenScore !== null && (
                <div style={{ 
                  marginTop: '8px'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '8px'
                  }}>
                    <span style={{ fontSize: '15px', fontWeight: '500' }}>AI Detection Score:</span> 
                    <div style={{ 
                      backgroundColor: `${getScoreColor(rewrittenScore)}15`,
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
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            padding: 0,
                            fontSize: '14px',
                            fontWeight: 'bold',
                            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
                            e.target.style.transform = 'scale(1.1)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.6)';
                            e.target.style.transform = 'scale(1)';
                          }}
                          title="Try stronger humanization"
                        >
                          ↻
                        </button>
                      )}
                    </div>
                  </div>
                  <div style={{
                    height: '8px',
                    width: '100%',
                    backgroundColor: '#edf2f7',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    position: 'relative'
                  }}>
                    <div style={{
                      position: 'absolute',
                      height: '100%',
                      width: `${rewrittenScore}%`,
                      background: `linear-gradient(90deg, ${getScoreColor(rewrittenScore)}50, ${getScoreColor(rewrittenScore)})`,
                      borderRadius: '4px',
                      transition: 'width 0.5s ease-in-out'
                    }}></div>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '12px',
                    color: '#718096',
                    marginTop: '4px'
                  }}>
                    <span>Human</span>
                    <span>AI Generated</span>
                  </div>
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setShowOriginalComparison(!showOriginalComparison)}
                style={{
                  backgroundColor: showOriginalComparison ? '#ebf8ff' : 'white',
                  border: `1px solid ${showOriginalComparison ? '#63b3ed' : '#e2e8f0'}`,
                  borderRadius: '8px',
                  padding: '8px 16px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontWeight: '500',
                  transition: 'all 0.2s',
                  color: showOriginalComparison ? '#2b6cb0' : 'inherit'
                }}
                onMouseEnter={(e) => {
                  if (!showOriginalComparison) {
                    e.target.style.borderColor = '#bee3f8';
                    e.target.style.backgroundColor = '#f7fafc';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!showOriginalComparison) {
                    e.target.style.borderColor = '#e2e8f0';
                    e.target.style.backgroundColor = 'white';
                  }
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="10" x2="6" y2="10"></line>
                  <line x1="21" y1="6" x2="3" y2="6"></line>
                  <line x1="21" y1="14" x2="3" y2="14"></line>
                  <line x1="18" y1="18" x2="6" y2="18"></line>
                </svg>
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
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontWeight: '500',
                  transition: 'all 0.2s',
                  color: copied ? '#38a169' : 'inherit'
                }}
                onMouseEnter={(e) => {
                  if (!copied) {
                    e.target.style.borderColor = '#c6f6d5';
                    e.target.style.backgroundColor = '#f0fff4';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!copied) {
                    e.target.style.borderColor = '#e2e8f0';
                    e.target.style.backgroundColor = 'white';
                  }
                }}
              >
                {copied ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                    Copy Output
                  </>
                )}
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
              <div style={{ 
                display: 'flex',
                flexDirection: 'column',
                gap: '10px' 
              }}>
                <div style={{ 
                  fontSize: '14px', 
                  fontWeight: '500',
                  color: '#4a5568' 
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
                  overflowY: 'auto',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05) inset',
                  color: '#718096'
                }}>
                  {input}
                </div>
              </div>
              <div style={{ 
                display: 'flex',
                flexDirection: 'column',
                gap: '10px' 
              }}>
                <div style={{ 
                  fontSize: '14px', 
                  fontWeight: '500',
                  color: '#4a5568' 
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
                    transition: 'all 0.3s',
                    margin: 0,
                    maxHeight: '500px',
                    overflowY: 'auto',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05) inset'
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
                transition: 'all 0.3s',
                margin: '15px 0 0 0',
                maxHeight: '500px',
                overflowY: 'auto',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05) inset'
              }}
            >
              {rewritten}
            </pre>
          )}
          
          {detectLoading && (
            <div style={{ 
              textAlign: 'center', 
              marginTop: '20px', 
              color: '#718096',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px' 
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{
                animation: 'spin 1s linear infinite'
              }}>
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" strokeDasharray="32" strokeDashoffset="8" />
              </svg>
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
          display: 'flex', 
          justifyContent: 'center', 
          gap: '10px',
          marginTop: '10px',
          fontSize: '13px' 
        }}>
          <span>Requires: OPENAI_API_KEY & GPTZERO_API_KEY</span>
        </div>
      </div>
    </div>
  );
}