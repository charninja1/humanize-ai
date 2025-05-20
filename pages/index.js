import { useState } from 'react';

export default function Home() {
  const [input, setInput] = useState('');
  const [rewritten, setRewritten] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRewrite() {
    setLoading(true);
    const res = await fetch('/api/rewrite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: input }),
    });
    const data = await res.json();
    setRewritten(data.rewritten);
    setLoading(false);
  }

  return (
    <div style={{ padding: 40, fontFamily: 'Arial' }}>
      <h1>Humanize.ai</h1>
      <textarea
        rows="10"
        cols="80"
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder="Paste AI-generated text here"
      />
      <br />
      <button onClick={handleRewrite} disabled={loading}>
        {loading ? 'Rewriting...' : 'Humanize'}
      </button>
      <h3>Output:</h3>
      <pre>{rewritten}</pre>
    </div>
  );
}