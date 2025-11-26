// api/vocab.js
export const config = { api: { bodyParser: true } };

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Méthode non autorisée" });

  const { phrase, options = "" } = req.body;

  if (!phrase) return res.status(400).json({ error: "Phrase manquante" });

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.8,
        max_tokens: 1000,
        messages: [
          {
            role: "system",
            content: "Tu es un générateur de vocabulaire. Tu réponds UNIQUEMENT avec un JSON strict : {\"words\": [\"mot1\",\"mot2\",...]} contenant exactement 100 mots/expressions max liés au thème. Pas d'explication, pas de texte avant/après."
          },
          {
            role: "user",
            content: `Thème : "${phrase}"\nOptions : ${options || "aucune"}\nDonne-moi jusqu'à 100 mots/expressions pertinents en français.`
          }
        ]
      })
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(err);
    }

    const data = await response.json();
    const content = data.choices[0].message.content.trim();

    res.status(200).json({ words: content });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
}
