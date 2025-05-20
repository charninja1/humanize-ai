export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { text, preserveStyle = false, humanizationStrength = 'medium' } = req.body;
    
    if (!text || text.trim() === '') {
      return res.status(400).json({ error: 'Text input is required' });
    }

    const systemPrompt = getSystemPrompt(preserveStyle, humanizationStrength);

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4.1",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: text,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const rewritten = data.choices?.[0]?.message?.content ?? "Rewrite failed.";

    res.status(200).json({ rewritten });
  } catch (error) {
    console.error('Error in rewrite API:', error.message);
    res.status(500).json({ error: 'Failed to rewrite text', message: error.message });
  }
}

function getSystemPrompt(preserveStyle, humanizationStrength) {
  // Base prompt for all strengths
  const basePrompt = `You are a writing assistant that rewrites AI-generated text so it reads naturally and passes AI detection tools.

Your job is to transform clearly AI-generated text into writing that appears genuinely human-authored. 

Guidelines:
- Introduce varied sentence structures (simple, compound, complex)
- Use natural transitions between ideas
- Add mild redundancy and tangential thoughts occasionally
- Include human-like quirks (slight hesitations, imperfect phrasing)
- Vary vocabulary and avoid repetitive patterns
- Use contractions, idioms, and colloquialisms appropriately
- Avoid perfectly balanced arguments or overly structured writing
- Introduce occasional subjective viewpoints or personal observations`;

  // Style preservation modifier
  const styleModifier = preserveStyle 
    ? `\n\nMaintain the original text's overall style, tone, and structure while making it more human-like.` 
    : `\n\nFeel free to reorganize ideas and shift the tone to make the text more natural and human-like.`;

  // Strength-specific instructions
  let strengthModifier = '';
  
  switch (humanizationStrength) {
    case 'light':
      strengthModifier = `\n\nApply minimal changes to the original text. Focus on making small adjustments to wording and sentence structure while mostly preserving the original content.`;
      break;
    case 'medium':
      strengthModifier = `\n\nApply a moderate level of humanization. Make noticeable changes to sentence structures and add some natural language patterns while keeping the core content intact.`;
      break;
    case 'strong':
      strengthModifier = `\n\nApply significant humanization. Thoroughly rework the text with natural language patterns, conversational elements, and human-like quirks. Feel free to restructure paragraphs while preserving the key information.`;
      break;
    default:
      strengthModifier = `\n\nApply a moderate level of humanization. Make noticeable changes to sentence structures and add some natural language patterns while keeping the core content intact.`;
  }

  return basePrompt + styleModifier + strengthModifier;
}