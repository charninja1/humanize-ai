export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { text } = req.body;

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
          content: "You are a writing assistant that rewrites AI-generated text so it reads naturally and passes AI detection tools. Introduce subtle sentence variation, natural tone, and avoid robotic phrasing.",
        },
        {
          role: "user",
          content: text,
        },
      ],
    }),
  });

  const data = await response.json();
  const rewritten = data.choices?.[0]?.message?.content ?? "Rewrite failed.";

  res.status(200).json({ rewritten });
}