import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  // Use the secure server-side environment variable
  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured on server' });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const modelsToTry = [
      'gemini-2.5-flash',
      'gemini-2.5-flash-lite',
      'gemini-flash-latest',
    ];

    let lastError;
    let resultText = null;

    for (const modelName of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        resultText = result.response.text();
        break; // Success
      } catch (err) {
        console.warn(`[Gemini Proxy] ${modelName} failed:`, err.message);
        lastError = err;
        if (err.status === 401 || err.status === 403) throw err;
      }
    }

    if (resultText === null) {
      throw lastError || new Error('All models failed');
    }

    res.status(200).json({ text: resultText });
  } catch (error) {
    console.error('Gemini API Proxy Error:', error);
    res
      .status(500)
      .json({ error: error.message || 'Failed to generate content' });
  }
}
