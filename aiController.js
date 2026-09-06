// controllers/aiController.js
// -----------------------------------------------------------------------------
// Talks to OpenRouter on behalf of the frontend. The OpenRouter API key lives
// only in process.env (backend/.env) and is never sent to, or readable by,
// the browser. The frontend only ever calls our own POST /api/ai/chat route.
// -----------------------------------------------------------------------------

const axios = require('axios');
const { success, error } = require('../utils/response');
const { asyncHandler } = require('../middleware/errorMiddleware');

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Healthcare-safety system prompt: every request to the model is anchored by
// this, regardless of what the frontend sends as "message" / "context".
const SYSTEM_PROMPT = `You are a preliminary health-information assistant inside the Swastya Sethu
patient app. You are NOT a doctor and you do not provide medical diagnoses.

Rules you must always follow:
- Give general, educational information only (possible causes, self-care, when to seek care).
- Never claim a definitive diagnosis. Use cautious language ("this could be associated with...").
- If symptoms suggest a medical emergency (e.g. chest pain, severe breathing difficulty,
  severe bleeding, stroke signs, loss of consciousness), your FIRST sentence must clearly tell
  the user to seek immediate emergency care or call local emergency services (108/112 in India).
- Always include a brief reminder that this does not replace consultation with a licensed doctor.
- Keep responses concise (roughly 80-150 words) and in plain, friendly language.
- Do not recommend specific prescription medications or dosages.`;

// POST /api/ai/chat
// Body: { message: string, context?: object }  -- context is optional extra
// structured info (e.g. symptoms/duration/severity from the assessment wizard).
const chat = asyncHandler(async (req, res) => {
  const { message, context } = req.body;

  if (!message || typeof message !== 'string' || !message.trim()) {
    return error(res, 'message is required.', 422);
  }
  if (message.length > 2000) {
    return error(res, 'message is too long (max 2000 characters).', 422);
  }

  if (!process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY === 'PASTE_NEW_API_KEY_HERE') {
    return error(res, 'AI feature is not configured on the server yet.', 503);
  }

  let userContent = message.trim();
  if (context && typeof context === 'object') {
    // Keep this compact; never let the frontend inject its own system role.
    userContent += `\n\n[Structured context from app]\n${JSON.stringify(context).slice(0, 1000)}`;
  }

  try {
    const response = await axios.post(
      OPENROUTER_URL,
      {
        model: process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userContent }
        ],
        max_tokens: 400,
        temperature: 0.4
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          // Optional but recommended by OpenRouter for attribution/rate-limit purposes:
          'HTTP-Referer': process.env.APP_PUBLIC_URL || 'http://localhost:5000',
          'X-Title': 'Swastya Sethu'
        },
        timeout: 20000
      }
    );

    const reply = response.data?.choices?.[0]?.message?.content?.trim();

    if (!reply) {
      return error(res, 'AI service returned an empty response. Please try again.', 502);
    }

    // Only the reply text goes back to the frontend — never the raw
    // OpenRouter payload, headers, or anything derived from the API key.
    return success(res, 'AI response generated.', {
      reply,
      disclaimer: 'This is general information, not a medical diagnosis. Consult a doctor for concerns.'
    });
  } catch (err) {
    const status = err.response?.status;
    console.error('OpenRouter request failed:', status || err.message);

    if (status === 401) {
      return error(res, 'AI service authentication failed. Check server configuration.', 502);
    }
    if (status === 429) {
      return error(res, 'AI service is busy right now. Please try again shortly.', 429);
    }
    return error(res, 'Could not reach the AI service. Please try again later.', 502);
  }
});

module.exports = { chat };
