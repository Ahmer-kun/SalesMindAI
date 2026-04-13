const https = require("https");

// ─── OpenAI ───────────────────────────────────────────────────────────────────
const callOpenAI = (messages, maxTokens = 400) => {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model: "gpt-3.5-turbo",
      messages,
      max_tokens: maxTokens,
      temperature: 0.75,
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

// ─── HuggingFace via Groq provider ───────────────────────────────────────────
const callHuggingFace = (messages, maxTokens = 400) => {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages,
      max_tokens: maxTokens,
      temperature: 0.75,
    });

    const options = {
      hostname: "router.huggingface.co",
      path: "/groq/openai/v1/chat/completions",
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
        console.log(`[HF/Groq] Status: ${res.statusCode} | Body: ${data.substring(0, 300)}`);

        try {
          const parsed = JSON.parse(data);

          if (parsed.error) {
            const msg = typeof parsed.error === "string"
              ? parsed.error
              : parsed.error.message || JSON.stringify(parsed.error);
            return reject(new Error(msg));
          }

          const text = parsed.choices?.[0]?.message?.content;
          if (!text) {
            return reject(new Error(`Unexpected response: ${JSON.stringify(parsed).substring(0, 150)}`));
          }

          resolve(text.trim());
        } catch (err) {
          reject(new Error(`Failed to parse response: ${err.message}`));
        }
      });
    });

    req.on("error", (err) => reject(new Error(`Network error: ${err.message}`)));
    req.write(body);
    req.end();
  });
};

// ─── Router ───────────────────────────────────────────────────────────────────
const callAI = async (messages, maxTokens = 400) => {
  const hasOpenAI = !!(
    process.env.OPENAI_API_KEY &&
    process.env.OPENAI_API_KEY.startsWith("sk-") &&
    process.env.OPENAI_API_KEY.length > 20
  );

  const hasHuggingFace = !!(
    process.env.HUGGINGFACE_API_KEY &&
    process.env.HUGGINGFACE_API_KEY.startsWith("hf_") &&
    process.env.HUGGINGFACE_API_KEY.length > 10
  );

  console.log(`[AI] OpenAI: ${hasOpenAI ? "✓" : "✗"} | HuggingFace/Groq: ${hasHuggingFace ? "✓" : "✗"}`);

  if (hasOpenAI) {
    try {
      return await callOpenAI(messages, maxTokens);
    } catch (err) {
      console.warn("[AI] OpenAI failed:", err.message);
      if (!hasHuggingFace) throw err;
      console.warn("[AI] Falling back to HuggingFace/Groq...");
    }
  }

  if (hasHuggingFace) {
    return await callHuggingFace(messages, maxTokens);
  }

  throw new Error(
    "No AI provider configured. Add OPENAI_API_KEY or HUGGINGFACE_API_KEY to your .env file."
  );
};

// ─── generateOutreach ─────────────────────────────────────────────────────────
const generateOutreach = async (leadData, productDescription) => {
  const { name, company, notes } = leadData;

  const messages = [
    {
      role: "system",
      content: `You are an expert B2B sales copywriter. Write concise, human-sounding outreach emails.
Rules:
- Maximum 120 words
- No clichés like "I hope this email finds you well"
- Sound like a real person
- One clear call-to-action at the end
- No subject line, just the email body
- Use the lead context to make it personal`,
    },
    {
      role: "user",
      content: `Write a cold outreach email to:
Name: ${name}
Company: ${company || "their company"}
Context: ${notes || "No additional context"}
Offering: ${productDescription}
Make it personal and worth replying to.`,
    },
  ];

  return await callAI(messages, 350);
};

// ─── generateFollowUp ─────────────────────────────────────────────────────────
const generateFollowUp = async (leadData, previousMessage, followUpGoal) => {
  const { name, company } = leadData;

  const messages = [
    {
      role: "system",
      content: `You are a skilled sales professional writing follow-up messages.
Rules:
- Maximum 100 words
- Reference the previous conversation naturally
- Don't be pushy or desperate
- Sound warm and human
- One clear low-friction ask at the end
- No subject line, just the message body`,
    },
    {
      role: "user",
      content: `Write a follow-up to ${name} from ${company || "their company"}.
Previous context: "${previousMessage}"
Goal: ${followUpGoal || "move toward a meeting"}
Make it feel like a natural continuation.`,
    },
  ];

  return await callAI(messages, 300);
};

// ─── scoreLead ────────────────────────────────────────────────────────────────
const scoreLead = async (leadData, conversation = "") => {
  const { name, company, status, notes } = leadData;

  const messages = [
    {
      role: "system",
      content: `You are a sales qualification expert. Score leads on conversion likelihood.
Respond with ONLY valid JSON, no other text:
{
  "score": <number 0-100>,
  "label": "<Hot|Warm|Cold>",
  "reasoning": "<2-3 sentences>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "concerns": ["<concern 1>", "<concern 2>"]
}`,
    },
    {
      role: "user",
      content: `Score this lead:
Name: ${name}
Company: ${company || "Unknown"}
Status: ${status}
Notes: ${notes || "No notes"}
Conversation: ${conversation || "None yet"}
Base score on: engagement, fit, pain points, urgency, buying signals.`,
    },
  ];

  const raw = await callAI(messages, 400);

  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found");
    const result = JSON.parse(jsonMatch[0]);
    result.score = Math.max(0, Math.min(100, Math.round(Number(result.score) || 0)));
    result.label = result.score >= 70 ? "Hot" : result.score >= 40 ? "Warm" : "Cold";
    return result;
  } catch {
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


// /**
//  * aiService.js
//  * Path: server/services/aiService.js
//  *
//  * FIXED: HuggingFace endpoint and path corrected.
//  * Uses api-inference.huggingface.co with the correct model path.
//  */

// const https = require("https");

// // ─── OpenAI ───────────────────────────────────────────────────────────────────
// const callOpenAI = (messages, maxTokens = 400) => {
//   return new Promise((resolve, reject) => {
//     const body = JSON.stringify({
//       model: "gpt-3.5-turbo",
//       messages,
//       max_tokens: maxTokens,
//       temperature: 0.75,
//     });

//     const options = {
//       hostname: "api.openai.com",
//       path: "/v1/chat/completions",
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
//         "Content-Length": Buffer.byteLength(body),
//       },
//     };

//     const req = https.request(options, (res) => {
//       let data = "";
//       res.on("data", (chunk) => (data += chunk));
//       res.on("end", () => {
//         try {
//           const parsed = JSON.parse(data);
//           if (parsed.error) return reject(new Error(parsed.error.message));
//           resolve(parsed.choices[0].message.content.trim());
//         } catch {
//           reject(new Error("Failed to parse OpenAI response"));
//         }
//       });
//     });

//     req.on("error", reject);
//     req.write(body);
//     req.end();
//   });
// };

// // ─── HuggingFace ──────────────────────────────────────────────────────────────
// // Uses the correct inference API host and a reliable public model
// const callHuggingFace = (prompt) => {
//   return new Promise((resolve, reject) => {
//     const body = JSON.stringify({
//       inputs: prompt,
//       parameters: {
//         max_new_tokens: 300,
//         temperature: 0.75,
//         return_full_text: false,
//         do_sample: true,
//       },
//     });

//     const options = {
//       hostname: "api-inference.huggingface.co",
//       path: "/models/mistralai/Mistral-7B-Instruct-v0.3",
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
//         "Content-Length": Buffer.byteLength(body),
//       },
//     };

//     const req = https.request(options, (res) => {
//       let data = "";
//       res.on("data", (chunk) => (data += chunk));
//       res.on("end", () => {
//         console.log(`[HF] Status: ${res.statusCode} | Body: ${data.substring(0, 200)}`);

//         // Non-200 HTTP status
//         if (res.statusCode !== 200) {
//           // 503 means model is loading — tell the user clearly
//           if (res.statusCode === 503) {
//             return reject(new Error("HuggingFace model is loading. Please wait 20 seconds and try again."));
//           }
//           return reject(new Error(`HuggingFace API error ${res.statusCode}: ${data.substring(0, 100)}`));
//         }

//         try {
//           const parsed = JSON.parse(data);

//           // Error object in body
//           if (parsed.error) return reject(new Error(parsed.error));

//           let text = null;

//           // Standard HF format: [{ generated_text: "..." }]
//           if (Array.isArray(parsed) && parsed[0]?.generated_text) {
//             text = parsed[0].generated_text;
//           }
//           // Single object: { generated_text: "..." }
//           else if (parsed.generated_text) {
//             text = parsed.generated_text;
//           }
//           // OpenAI-compatible: { choices: [{ message: { content } }] }
//           else if (parsed.choices?.[0]?.message?.content) {
//             text = parsed.choices[0].message.content;
//           }
//           // Text completion: { choices: [{ text }] }
//           else if (parsed.choices?.[0]?.text) {
//             text = parsed.choices[0].text;
//           }

//           if (!text) {
//             return reject(new Error(`Unexpected HuggingFace response format: ${JSON.stringify(parsed).substring(0, 150)}`));
//           }

//           resolve(text.trim());
//         } catch (err) {
//           reject(new Error(`Failed to parse HuggingFace response: ${err.message}`));
//         }
//       });
//     });

//     req.on("error", (err) => reject(new Error(`HuggingFace network error: ${err.message}`)));
//     req.write(body);
//     req.end();
//   });
// };

// // ─── Router ───────────────────────────────────────────────────────────────────
// const callAI = async (messages, hfPrompt, maxTokens = 400) => {
//   const hasOpenAI = !!(
//     process.env.OPENAI_API_KEY &&
//     process.env.OPENAI_API_KEY.startsWith("sk-") &&
//     process.env.OPENAI_API_KEY.length > 20
//   );

//   const hasHuggingFace = !!(
//     process.env.HUGGINGFACE_API_KEY &&
//     process.env.HUGGINGFACE_API_KEY.startsWith("hf_") &&
//     process.env.HUGGINGFACE_API_KEY.length > 10
//   );

//   console.log(`[AI] OpenAI: ${hasOpenAI ? "✓" : "✗"} | HuggingFace: ${hasHuggingFace ? "✓" : "✗"}`);

//   if (hasOpenAI) {
//     try {
//       return await callOpenAI(messages, maxTokens);
//     } catch (err) {
//       console.warn("[AI] OpenAI failed:", err.message);
//       if (!hasHuggingFace) throw err;
//       console.warn("[AI] Falling back to HuggingFace...");
//     }
//   }

//   if (hasHuggingFace) {
//     return await callHuggingFace(hfPrompt);
//   }

//   throw new Error(
//     "No AI provider configured. Add OPENAI_API_KEY or HUGGINGFACE_API_KEY to your .env file."
//   );
// };

// // ─── generateOutreach ─────────────────────────────────────────────────────────
// const generateOutreach = async (leadData, productDescription) => {
//   const { name, company, notes } = leadData;

//   const systemPrompt = `You are an expert B2B sales copywriter. 
// You write concise, human-sounding outreach emails that don't sound like AI or templates.
// Rules:
// - Maximum 120 words
// - Never start with "I hope this email finds you well" or similar clichés
// - Sound like a real person, not a bot
// - One clear call-to-action at the end
// - No subject line needed, just the email body
// - Use the lead's context to make it feel personal`;

//   const userPrompt = `Write a cold outreach email to:
// Name: ${name}
// Company: ${company || "their company"}
// Context about them: ${notes || "No additional context"}
// What I'm offering: ${productDescription}
// Make it feel personal, relevant, and worth replying to.`;

//   const hfPrompt = `<s>[INST] ${systemPrompt}\n\n${userPrompt} [/INST]`;
//   const messages = [
//     { role: "system", content: systemPrompt },
//     { role: "user", content: userPrompt },
//   ];

//   return await callAI(messages, hfPrompt, 350);
// };

// // ─── generateFollowUp ─────────────────────────────────────────────────────────
// const generateFollowUp = async (leadData, previousMessage, followUpGoal) => {
//   const { name, company } = leadData;

//   const systemPrompt = `You are a skilled sales professional writing follow-up messages.
// Rules:
// - Maximum 100 words
// - Reference the previous conversation naturally
// - Don't be pushy or desperate
// - Sound warm and human
// - One clear, low-friction ask at the end
// - No subject line, just the message body`;

//   const userPrompt = `Write a follow-up message to ${name} from ${company || "their company"}.
// Previous conversation/context: "${previousMessage}"
// Goal of this follow-up: ${followUpGoal || "continue the conversation and move toward a meeting"}
// Make it feel like a natural continuation, not a generic bump.`;

//   const hfPrompt = `<s>[INST] ${systemPrompt}\n\n${userPrompt} [/INST]`;
//   const messages = [
//     { role: "system", content: systemPrompt },
//     { role: "user", content: userPrompt },
//   ];

//   return await callAI(messages, hfPrompt, 300);
// };

// // ─── scoreLead ────────────────────────────────────────────────────────────────
// const scoreLead = async (leadData, conversation = "") => {
//   const { name, company, status, notes } = leadData;

//   const systemPrompt = `You are a sales qualification expert. 
// Analyze the lead information and score their likelihood to convert.
// You MUST respond with ONLY valid JSON in this exact format, no other text:
// {
//   "score": <number 0-100>,
//   "label": "<Hot|Warm|Cold>",
//   "reasoning": "<2-3 sentences explaining the score>",
//   "strengths": ["<strength 1>", "<strength 2>"],
//   "concerns": ["<concern 1>", "<concern 2>"]
// }`;

//   const userPrompt = `Score this lead:
// Name: ${name}
// Company: ${company || "Unknown"}
// Current status: ${status}
// Notes: ${notes || "No notes"}
// Conversation history: ${conversation || "No conversation yet"}
// Score based on: engagement signals, company fit, pain points mentioned, urgency, and buying signals.`;

//   const hfPrompt = `<s>[INST] ${systemPrompt}\n\n${userPrompt}\n\nRespond with JSON only. [/INST]`;
//   const messages = [
//     { role: "system", content: systemPrompt },
//     { role: "user", content: userPrompt },
//   ];

//   const raw = await callAI(messages, hfPrompt, 400);

//   try {
//     const jsonMatch = raw.match(/\{[\s\S]*\}/);
//     if (!jsonMatch) throw new Error("No JSON found in response");
//     const result = JSON.parse(jsonMatch[0]);
//     result.score = Math.max(0, Math.min(100, Math.round(Number(result.score) || 0)));
//     result.label = result.score >= 70 ? "Hot" : result.score >= 40 ? "Warm" : "Cold";
//     return result;
//   } catch {
//     return {
//       score: status === "Hot" ? 75 : status === "Warm" ? 45 : 20,
//       label: status,
//       reasoning: "Could not fully analyze this lead. Score based on current status.",
//       strengths: [],
//       concerns: ["Insufficient data for detailed analysis"],
//     };
//   }
// };

// module.exports = { generateOutreach, generateFollowUp, scoreLead };