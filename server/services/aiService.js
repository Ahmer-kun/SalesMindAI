/**
 * aiService.js
 * Path: server/services/aiService.js
 *
 * Core AI engine for SalesMind AI.
 * Supports OpenAI (primary) with HuggingFace as free fallback.
 * All prompts are structured for consistent, human-sounding output.
 */

const https = require("https");

// ─── Helper: call OpenAI Chat Completions API ─────────────────────────────────
const callOpenAI = (messages, maxTokens = 400) => {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model: "gpt-3.5-turbo", // cheapest, fastest — stays within free trial
      messages,
      max_tokens: maxTokens,
      temperature: 0.75, // slightly creative but not random
    });

    const options = {
      hostname: "api.openai.com",
      path: "/v1/chat/completions",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Length": Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) return reject(new Error(parsed.error.message));
          resolve(parsed.choices[0].message.content.trim());
        } catch {
          reject(new Error("Failed to parse OpenAI response"));
        }
      });
    });

    req.on("error", reject);
    req.write(body);
    req.end();
  });
};

// ─── Helper: call HuggingFace Inference API (free fallback) ──────────────────
const callHuggingFace = (prompt) => {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      inputs: prompt,
      parameters: { max_new_tokens: 300, temperature: 0.75, return_full_text: false },
    });

    const options = {
      hostname: "api-inference.huggingface.co",
      // Mistral-7B — best free model for instruction following
      path: "/models/mistralai/Mistral-7B-Instruct-v0.2",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        "Content-Length": Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) return reject(new Error(parsed.error));
          // HuggingFace returns array
          const text = Array.isArray(parsed)
            ? parsed[0]?.generated_text
            : parsed?.generated_text;
          resolve(text?.trim() || "");
        } catch {
          reject(new Error("Failed to parse HuggingFace response"));
        }
      });
    });

    req.on("error", reject);
    req.write(body);
    req.end();
  });
};

// ─── Router: try OpenAI first, fall back to HuggingFace ─────────────────────
const callAI = async (messages, hfPrompt, maxTokens = 400) => {
  // Try OpenAI if key is configured
  if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== "your_openai_api_key_here") {
    try {
      return await callOpenAI(messages, maxTokens);
    } catch (err) {
      console.warn("[AI] OpenAI failed, falling back to HuggingFace:", err.message);
    }
  }

  // Fall back to HuggingFace
  if (process.env.HUGGINGFACE_API_KEY && process.env.HUGGINGFACE_API_KEY !== "your_huggingface_api_key_here") {
    return await callHuggingFace(hfPrompt);
  }

  throw new Error("No AI provider configured. Please add OPENAI_API_KEY or HUGGINGFACE_API_KEY to your .env file.");
};

// ═══════════════════════════════════════════════════════════════════════════════
// PUBLIC AI FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * generateOutreach
 * Creates a personalized first-touch sales email for a lead.
 *
 * @param {Object} leadData - { name, company, email, notes, status }
 * @param {string} productDescription - What you're selling
 * @returns {string} Generated outreach message
 */
const generateOutreach = async (leadData, productDescription) => {
  const { name, company, notes } = leadData;

  const systemPrompt = `You are an expert B2B sales copywriter. 
You write concise, human-sounding outreach emails that don't sound like AI or templates.
Rules:
- Maximum 120 words
- Never start with "I hope this email finds you well" or similar clichés
- Sound like a real person, not a bot
- One clear call-to-action at the end
- No subject line needed, just the email body
- Use the lead's context to make it feel personal`;

  const userPrompt = `Write a cold outreach email to:
Name: ${name}
Company: ${company || "their company"}
Context about them: ${notes || "No additional context"}

What I'm offering: ${productDescription}

Make it feel personal, relevant, and worth replying to.`;

  // HuggingFace formatted prompt (Mistral instruction format)
  const hfPrompt = `<s>[INST] ${systemPrompt}\n\n${userPrompt} [/INST]`;

  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ];

  return await callAI(messages, hfPrompt, 350);
};

/**
 * generateFollowUp
 * Creates a smart follow-up message based on previous conversation.
 *
 * @param {Object} leadData - { name, company, status }
 * @param {string} previousMessage - The last message/conversation context
 * @param {string} followUpGoal - What you want to achieve (e.g. "book a call")
 * @returns {string} Generated follow-up message
 */
const generateFollowUp = async (leadData, previousMessage, followUpGoal) => {
  const { name, company } = leadData;

  const systemPrompt = `You are a skilled sales professional writing follow-up messages.
Rules:
- Maximum 100 words
- Reference the previous conversation naturally
- Don't be pushy or desperate
- Sound warm and human
- One clear, low-friction ask at the end
- No subject line, just the message body`;

  const userPrompt = `Write a follow-up message to ${name} from ${company || "their company"}.

Previous conversation/context:
"${previousMessage}"

Goal of this follow-up: ${followUpGoal || "continue the conversation and move toward a meeting"}

Make it feel like a natural continuation, not a generic bump.`;

  const hfPrompt = `<s>[INST] ${systemPrompt}\n\n${userPrompt} [/INST]`;

  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ];

  return await callAI(messages, hfPrompt, 300);
};

/**
 * scoreLead
 * Analyzes lead data and returns a score 0-100 + reasoning.
 *
 * @param {Object} leadData - { name, company, status, notes, email }
 * @param {string} conversation - Full conversation history if any
 * @returns {{ score: number, label: string, reasoning: string }}
 */
const scoreLead = async (leadData, conversation = "") => {
  const { name, company, status, notes } = leadData;

  const systemPrompt = `You are a sales qualification expert. 
Analyze the lead information and score their likelihood to convert.
You MUST respond with ONLY valid JSON in this exact format, no other text:
{
  "score": <number 0-100>,
  "label": "<Hot|Warm|Cold>",
  "reasoning": "<2-3 sentences explaining the score>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "concerns": ["<concern 1>", "<concern 2>"]
}`;

  const userPrompt = `Score this lead:
Name: ${name}
Company: ${company || "Unknown"}
Current status: ${status}
Notes: ${notes || "No notes"}
Conversation history: ${conversation || "No conversation yet"}

Score based on: engagement signals, company fit, pain points mentioned, urgency, and any buying signals.`;

  const hfPrompt = `<s>[INST] ${systemPrompt}\n\n${userPrompt}\n\nRespond with JSON only. [/INST]`;

  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ];

  const raw = await callAI(messages, hfPrompt, 400);

  // Parse JSON response safely
  try {
    // Extract JSON even if model adds extra text
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found in response");
    const result = JSON.parse(jsonMatch[0]);

    // Validate and clamp score
    result.score = Math.max(0, Math.min(100, Math.round(Number(result.score) || 0)));
    result.label = result.score >= 70 ? "Hot" : result.score >= 40 ? "Warm" : "Cold";

    return result;
  } catch {
    // Fallback if parsing fails
    return {
      score: status === "Hot" ? 75 : status === "Warm" ? 45 : 20,
      label: status,
      reasoning: "Could not fully analyze this lead. Score based on current status.",
      strengths: [],
      concerns: ["Insufficient data for detailed analysis"],
    };
  }
};

module.exports = { generateOutreach, generateFollowUp, scoreLead };