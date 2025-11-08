import OpenAI from "openai";

interface GenerateInterviewQuestionRequest {
  label: string; // category label
  askCount: number; // number of questions desired
  jobDescription?: string;
  secretPrompt?: string;
  existingQuestions?: string[]; // to avoid duplicates
}

interface GenerateInterviewQuestionResponse {
  label: string;
  questions: string[];
}

// Helper to build the prompt for a single category
function buildPrompt(req: GenerateInterviewQuestionRequest): string {
  const { label, askCount, jobDescription, secretPrompt, existingQuestions } = req;
  return `You are an assistant that writes clear, concise, role-relevant interview questions.
Return ONLY a JSON object with a field \"questions\" that is an array of ${askCount} unique strings. No commentary.

Category: ${label}
Desired number of questions: ${askCount}
Job Description (may be partial): ${jobDescription ?? "(none provided)"}
Evaluator Secret Prompt (guidance for emphasis, if any): ${secretPrompt ?? "(none provided)"}
Avoid duplicating these existing questions: ${existingQuestions && existingQuestions.length ? existingQuestions.join(" | ") : "(none)"}`;
}

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const req: GenerateInterviewQuestionRequest = body;

    if (!req || typeof req.label !== "string" || typeof req.askCount !== "number") {
      return new Response(JSON.stringify({ error: "Invalid request body" }), { status: 400 });
    }

    if (req.askCount < 1 || req.askCount > 20) {
      return new Response(JSON.stringify({ error: "askCount must be between 1 and 20" }), { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Missing OPENAI_API_KEY" }), { status: 500 });
    }

    const openai = new OpenAI({ apiKey });

    const prompt = buildPrompt(req);

    // Use Responses API (new OpenAI SDK) or fall back to chat.completions depending on availability
    // We'll attempt responses API first.
    let text: string | undefined;
    try {
      // @ts-ignore - some versions expose responses
      const resp: any = await openai.responses.create({
        model: "gpt-4o-mini",
        input: prompt,
        temperature: 0.7,
      });
      text = resp.output_text;
    } catch (e) {
      // Fallback to chat completions if responses API not available
      const chat = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You generate only JSON with a questions array." },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
      });
      text = chat.choices?.[0]?.message?.content;
    }

    if (!text) {
      return new Response(JSON.stringify({ error: "No text returned from model" }), { status: 500 });
    }

    // Attempt to parse JSON; if model returned markdown/code fencing, strip it
    const cleaned = text
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    let parsed: any;
    try {
      parsed = JSON.parse(cleaned);
    } catch (err) {
      // Try to salvage by locating a JSON object substring
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (match) {
        parsed = JSON.parse(match[0]);
      } else {
        return new Response(JSON.stringify({ error: "Failed to parse model JSON", raw: cleaned }), { status: 500 });
      }
    }

    let questions: string[] = Array.isArray(parsed.questions) ? parsed.questions : [];
    // Basic sanitization
    questions = questions
      .map((q) => (typeof q === "string" ? q.trim() : ""))
      .filter((q) => q.length > 0);

    // Ensure length matches askCount; if short, pad with placeholders
    if (questions.length < req.askCount) {
      const deficit = req.askCount - questions.length;
      for (let i = 0; i < deficit; i++) {
        questions.push(`(Placeholder question ${i + 1} – model returned fewer than requested)`);
      }
    }

    const response: GenerateInterviewQuestionResponse = { label: req.label, questions };
    return new Response(JSON.stringify(response), { status: 200 });
  } catch (error: any) {
    console.error("generate-interview-question error", error);
    return new Response(JSON.stringify({ error: "Internal server error", details: error?.message }), { status: 500 });
  }
}
