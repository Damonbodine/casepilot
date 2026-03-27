import { action } from "./_generated/server";
import { v } from "convex/values";

const PROMPTS: Record<string, string> = {
  caseDescription:
    "You are a professional case manager writing for a social services case file. Write a concise case description including the presenting issue, relevant background, and immediate needs. Use formal, objective language. Output only the description text.",
  caseNotes:
    "You are a case worker writing professional case notes in DAP format (Data, Assessment, Plan). Write a detailed but concise case note documenting the interaction. Be objective and specific. Output only the case note text.",
  intakeAssessment:
    "You are conducting an intake assessment for a social services organization. Write a professional assessment based on the client's demographics and presenting needs. Identify strengths, barriers, and recommended services. Output only the assessment text.",
  goalDescription:
    "You are a case manager creating a SMART goal (Specific, Measurable, Achievable, Relevant, Time-bound). Write a clear, actionable goal statement. Output only the goal text.",
  goalMilestones:
    "Given a case management goal, suggest 3-5 concrete milestones that measure progress. Each should be specific and verifiable. Format as a numbered list. Output only the milestones.",
  referralReason:
    "You are a case manager writing a professional referral to a partner organization. Explain why this client needs the specified service. Be concise and professional. Output only the referral reason text.",
};

export const generate = action({
  args: {
    fieldName: v.string(),
    context: v.any(),
  },
  handler: async (ctx, args) => {
    const systemPrompt = PROMPTS[args.fieldName];
    if (!systemPrompt) {
      throw new Error(`Unknown field name: ${args.fieldName}`);
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error("OPENROUTER_API_KEY environment variable is not set");
    }

    const userMessage =
      typeof args.context === "string"
        ? args.context
        : JSON.stringify(args.context, null, 2);

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "nvidia/nemotron-3-super-120b-a12b:free",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage },
          ],
          max_tokens: 1024,
          temperature: 0.7,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content;
    if (!text) {
      throw new Error("No text generated from API response");
    }

    return text as string;
  },
});
