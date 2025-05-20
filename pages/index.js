import { useState, useRef, useEffect } from 'react';
import Head from 'next/head';

export default function Home() {
  const [input, setInput] = useState('');
  const [rewritten, setRewritten] = useState('');
  const [loading, setLoading] = useState(false);
  // AI detection loading state removed
  const [error, setError] = useState('');
  const [preserveStyle, setPreserveStyle] = useState(false);
  const [humanizationStrength, setHumanizationStrength] = useState('medium');
  // AI percentage feature removed
  const [characterCount, setCharacterCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const [showOriginalComparison, setShowOriginalComparison] = useState(false);
  const outputRef = useRef(null);
  const inputRef = useRef(null);

  // AI detection function removed

  async function handleRewrite() {
    const trimmedInput = input.trim();
    if (!trimmedInput) {
      setError('Please enter some text to humanize');
      return;
    }
    
    if (trimmedInput.length < 250) {
      setError('Please enter at least 250 characters for better results');
      return;
    }
    
    if (trimmedInput.length > 8000) {
      setError('Text exceeds the maximum limit of 8000 characters');
      return;
    }
    
    setError('');
    setLoading(true);
    
    try {
      
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
      
      // AI percentage detection removed
      
    } catch (err) {
      setError(err.message || 'An error occurred while processing your request');
      console.error('Rewrite error:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleTryAgain() {
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

  // AI score color function removed

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
    <>
      <Head>
        <title>Humanize.ai - Make AI Text Sound Human | Bypass AI Detection</title>
        <meta name="description" content="Transform AI-generated text into natural human writing. Our AI text humanizer helps students and professionals make their essays and content sound naturally human and bypass AI detection tools." />
        <meta name="keywords" content="AI text humanizer, make AI text sound human, bypass AI detection, humanize AI text, AI essay rewriter, AI paraphraser, AI text converter, ChatGPT humanizer, AI writing tool" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://humanize.ai/" />
        <meta property="og:title" content="Humanize.ai - Make AI Text Sound Human | Bypass AI Detection" />
        <meta property="og:description" content="Transform AI-generated text into natural human writing. Our tool helps students make their essays sound naturally human and undetectable by AI checkers." />
        <meta property="og:image" content="https://humanize.ai/og-image.jpg" />
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://humanize.ai/" />
        <meta property="twitter:title" content="Humanize.ai - Make AI Text Sound Human | Bypass AI Detection" />
        <meta property="twitter:description" content="Transform AI-generated text into natural human writing. Our tool helps students make their essays sound naturally human and undetectable by AI checkers." />
        <meta property="twitter:image" content="https://humanize.ai/og-image.jpg" />
        
        {/* Canonical URL */}
        <link rel="canonical" href="https://humanize.ai/" />
        
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        
        {/* Robots */}
        <meta name="robots" content="index, follow" />
        
        {/* Schema.org structured data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Humanize.ai",
            "url": "https://humanize.ai/",
            "description": "Transform AI-generated text into natural human writing. Our AI text humanizer helps students and professionals make their essays and content sound naturally human and bypass AI detection tools.",
            "applicationCategory": "Education",
            "operatingSystem": "All",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "keywords": "AI text humanizer, make AI text sound human, bypass AI detection, humanize AI text, AI essay rewriter, AI paraphraser, AI text converter, ChatGPT humanizer, AI writing tool",
            "softwareHelp": {
              "@type": "CreativeWork",
              "text": "A tool that helps transform AI-generated text to sound more human and bypass AI detection tools."
            }
          })}
        </script>
        
        {/* FAQ Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "How does Humanize.ai make AI text undetectable?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Humanize.ai uses advanced language processing to rewrite AI-generated text in a way that preserves the original meaning but makes it sound more naturally human, helping it bypass AI detection tools."
                }
              },
              {
                "@type": "Question",
                "name": "Can Humanize.ai help with my essay?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes! Humanize.ai is designed specifically to help students with essays by making AI-generated text sound more natural and undetectable by AI checkers while maintaining the original meaning."
                }
              },
              {
                "@type": "Question",
                "name": "Will my professor know I used AI?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "When you use Humanize.ai to rewrite your AI-generated content, the resulting text becomes much more difficult for AI detection tools to identify, making it much less likely that your professor will know AI was used."
                }
              },
              {
                "@type": "Question",
                "name": "Is Humanize.ai free to use?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes, Humanize.ai is a free tool that helps transform AI text into naturally human-sounding content."
                }
              }
            ]
          })}
        </script>
      </Head>
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
          Humanize.ai: AI Text Humanizer
        </h1>
        <p style={{color: '#718096', fontSize: '18px'}}>
          Transform AI-generated essays and content to sound naturally human and bypass AI detection
        </p>
        <h2 style={{
          fontSize: '18px',
          color: '#4a5568',
          margin: '15px 0 0',
          fontWeight: '500'
        }}>
          The #1 tool for students to make AI essays undetectable
        </h2>
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
          placeholder="Paste your AI-generated essay or text here to make it sound human and bypass detection..."
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
        <div style={{
          display: 'flex',
          justifyContent: 'space-between', 
          fontSize: '14px', 
          color: '#a0aec0', 
          marginTop: '8px'
        }}>
          <span style={{
            color: characterCount < 250 ? '#e53e3e' : (characterCount > 8000 ? '#e53e3e' : '#38a169')
          }}>
            {characterCount < 250 ? `${250 - characterCount} more characters needed` : ''}
            {characterCount > 8000 ? `${characterCount - 8000} characters over limit` : ''}
            {characterCount >= 250 && characterCount <= 8000 ? 'Text length is good' : ''}
          </span>
          <span>
            {characterCount} / 8000
          </span>
        </div>
        
        {/* AI percentage feature removed */}
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
        disabled={loading}
        style={{
          backgroundColor: '#4299e1',
          backgroundImage: 'linear-gradient(135deg, #3a7bd5, #00d2ff)',
          color: 'white',
          padding: '14px 28px',
          border: 'none',
          borderRadius: '12px',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.7 : 1,
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
        {loading ? (
          <span>Rewriting Text...</span>
        ) : (
          <span>Make AI Text Sound Human</span>
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
              <div style={{marginTop: '8px'}}>
                <button
                  onClick={handleTryAgain}
                  style={{
                    backgroundColor: 'rgba(66, 153, 225, 0.1)',
                    border: '1px solid #bee3f8',
                    borderRadius: '8px',
                    padding: '5px 10px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    color: '#2b6cb0'
                  }}
                  title="Try stronger humanization"
                >
                  Try Stronger Humanization ↻
                </button>
              </div>
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
          
          {/* AI detection loading indicator removed */}
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
        <p>© 2025 Humanize.ai — The #1 Tool to Transform AI Text into Natural Human Writing</p>
        <div style={{
          marginTop: '20px',
          fontSize: '14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          <p>Trusted by students and professionals to bypass AI detection tools like Turnitin, GPTZero, and ZeroGPT</p>
          <div style={{ marginTop: '10px' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '10px', color: '#4a5568' }}>Why Use Humanize.ai?</h3>
            <ul style={{ 
              textAlign: 'left', 
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '10px',
              padding: '0',
              margin: '0',
              listStyle: 'none'
            }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ color: '#4299e1' }}>✓</span> Make AI-written essays undetectable
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ color: '#4299e1' }}>✓</span> Bypass AI detection tools
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ color: '#4299e1' }}>✓</span> Maintain original meaning
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ color: '#4299e1' }}>✓</span> Sound naturally human
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}