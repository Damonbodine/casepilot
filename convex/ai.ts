import { action } from "./_generated/server";
import { internal } from "./_generated/api";
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

async function callOpenRouter(
  systemPrompt: string,
  userMessage: string,
  maxTokens: number = 1024,
  temperature: number = 0.7
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY environment variable is not set");
  }

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
        max_tokens: maxTokens,
        temperature,
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
}

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

    const userMessage =
      typeof args.context === "string"
        ? args.context
        : JSON.stringify(args.context, null, 2);

    return await callOpenRouter(systemPrompt, userMessage);
  },
});

export const assessRisk = action({
  args: {
    clientId: v.id("clients"),
  },
  handler: async (ctx, args) => {
    const client = await ctx.runQuery(
      internal.aiHelpers.getClient,
      { id: args.clientId }
    );

    const systemPrompt = `You are a social services risk assessment specialist. Analyze the client's intake data and generate a risk assessment.

You MUST respond with valid JSON only, no markdown, no code fences. Use this exact format:
{"score": <number 1-10>, "level": "<Low|Medium|High|Critical>", "reasoning": "<detailed reasoning>", "factors": [{"name": "<factor name>", "impact": "<positive|negative|neutral>", "detail": "<explanation>"}]}

Score guide: 1-3 = Low risk, 4-5 = Medium, 6-8 = High, 9-10 = Critical.
Consider: housing stability, employment, health conditions, support network, language barriers, primary needs, and demographic risk factors.`;

    const userMessage = JSON.stringify({
      firstName: client.firstName,
      lastName: client.lastName,
      gender: client.gender,
      race: client.race,
      preferredLanguage: client.preferredLanguage,
      address: client.address,
      city: client.city,
      state: client.state,
      primaryNeed: client.primaryNeed,
      riskLevel: client.riskLevel,
      status: client.status,
      notes: client.notes,
      emergencyContactName: client.emergencyContactName,
      emergencyContactRelation: client.emergencyContactRelation,
      intakeDate: client.intakeDate ? new Date(client.intakeDate).toISOString() : null,
    });

    const result = await callOpenRouter(systemPrompt, userMessage, 1024, 0.3);

    try {
      const cleaned = result.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      return JSON.parse(cleaned);
    } catch {
      return {
        score: 5,
        level: "Medium",
        reasoning: result,
        factors: [],
      };
    }
  },
});

export const summarizeCaseNotes = action({
  args: {
    caseId: v.id("cases"),
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    const notes: any[] = await ctx.runQuery(
      internal.aiHelpers.listCaseNotes,
      { caseId: args.caseId }
    );

    const filtered: any[] = notes.filter(
      (n: any) => n.createdAt >= args.startDate && n.createdAt <= args.endDate
    );

    if (filtered.length === 0) {
      return {
        overview: "No case notes found in the selected date range.",
        keyEvents: "",
        serviceDelivery: "",
        goalsProgress: "",
        concerns: "",
        recommendations: "",
        noteCount: 0,
        dateRange: {
          start: new Date(args.startDate).toISOString(),
          end: new Date(args.endDate).toISOString(),
        },
      };
    }

    const systemPrompt = `You are a case management supervisor writing a narrative summary of case notes. Analyze the notes and produce a structured summary.

You MUST respond with valid JSON only, no markdown, no code fences. Use this exact format:
{"overview": "<2-3 sentence overview>", "keyEvents": "<key events and milestones>", "serviceDelivery": "<services delivered or discussed>", "goalsProgress": "<progress on client goals>", "concerns": "<any concerns or risks identified>", "recommendations": "<recommended next steps>"}`;

    const notesText = filtered
      .map(
        (n: any) =>
          `[${new Date(n.createdAt).toLocaleDateString()}] (${n.category}) ${n.content}`
      )
      .join("\n\n");

    const result = await callOpenRouter(systemPrompt, notesText, 1500, 0.4);

    try {
      const cleaned = result.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const parsed = JSON.parse(cleaned);
      return {
        ...parsed,
        noteCount: filtered.length,
        dateRange: {
          start: new Date(args.startDate).toISOString(),
          end: new Date(args.endDate).toISOString(),
        },
      };
    } catch {
      return {
        overview: result,
        keyEvents: "",
        serviceDelivery: "",
        goalsProgress: "",
        concerns: "",
        recommendations: "",
        noteCount: filtered.length,
        dateRange: {
          start: new Date(args.startDate).toISOString(),
          end: new Date(args.endDate).toISOString(),
        },
      };
    }
  },
});

export const recommendServices = action({
  args: {
    clientId: v.id("clients"),
  },
  handler: async (ctx, args) => {
    const client = await ctx.runQuery(
      internal.aiHelpers.getClient,
      { id: args.clientId }
    );
    const services = await ctx.runQuery(
      internal.aiHelpers.listActiveServices,
      { orgId: client.organizationId }
    );

    const systemPrompt = `You are a social services coordinator matching clients to available services. Analyze the client profile and available services, then recommend the top 3-5 best matches.

You MUST respond with valid JSON only, no markdown, no code fences. Use this exact format:
{"recommendations": [{"serviceName": "<exact service name from the list>", "matchScore": <1-100>, "reasoning": "<why this service matches>", "priority": "<high|medium|low>"}]}

Only recommend services from the provided list. Rank by relevance to client needs.`;

    const userMessage = JSON.stringify({
      client: {
        name: `${client.firstName} ${client.lastName}`,
        primaryNeed: client.primaryNeed,
        riskLevel: client.riskLevel,
        gender: client.gender,
        preferredLanguage: client.preferredLanguage,
        notes: client.notes,
      },
      availableServices: services.map((s: any) => ({
        name: s.name,
        description: s.description,
        category: s.category,
        deliveryMethod: s.deliveryMethod,
      })),
    });

    const result = await callOpenRouter(systemPrompt, userMessage, 1024, 0.4);

    try {
      const cleaned = result.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      return JSON.parse(cleaned);
    } catch {
      return { recommendations: [] };
    }
  },
});

export const suggestCaseWorker = action({
  args: {
    clientId: v.id("clients"),
    caseType: v.string(),
    orgId: v.id("organizations"),
  },
  handler: async (ctx, args) => {
    const client = await ctx.runQuery(
      internal.aiHelpers.getClient,
      { id: args.clientId }
    );
    const users = await ctx.runQuery(
      internal.aiHelpers.listOrgUsers,
      { orgId: args.orgId }
    );
    const workers = users.filter(
      (u: any) => u.isActive && (u.role === "CaseWorker" || u.role === "CaseManager")
    );

    const workerProfiles = await Promise.all(
      workers.map(async (w: any) => {
        const cases = await ctx.runQuery(
          internal.aiHelpers.listCasesByWorker,
          { workerId: w._id }
        );
        const activeCases = cases.filter((c: any) => c.status !== "Closed");
        return {
          id: w._id,
          name: w.name,
          role: w.role,
          title: w.title,
          activeCaseCount: activeCases.length,
          caseloadLimit: w.caseloadLimit,
          caseTypes: [...new Set(activeCases.map((c: any) => c.type))],
        };
      })
    );

    const systemPrompt = `You are a case management supervisor assigning new cases. Analyze the client needs and available case workers, then suggest the best worker for this case.

You MUST respond with valid JSON only, no markdown, no code fences. Use this exact format:
{"suggestedWorkerId": "<worker id>", "workerName": "<worker name>", "reasoning": "<why this worker is the best fit>", "factors": [{"factor": "<consideration>", "detail": "<explanation>"}]}

Consider: current caseload vs limit, experience with similar case types, workload balance. Prefer workers with lower caseloads and relevant experience.`;

    const userMessage = JSON.stringify({
      client: {
        name: `${client.firstName} ${client.lastName}`,
        primaryNeed: client.primaryNeed,
        riskLevel: client.riskLevel,
        preferredLanguage: client.preferredLanguage,
      },
      caseType: args.caseType,
      availableWorkers: workerProfiles,
    });

    const result = await callOpenRouter(systemPrompt, userMessage, 1024, 0.3);

    try {
      const cleaned = result.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      return JSON.parse(cleaned);
    } catch {
      return {
        suggestedWorkerId: null,
        workerName: null,
        reasoning: result,
        factors: [],
      };
    }
  },
});
