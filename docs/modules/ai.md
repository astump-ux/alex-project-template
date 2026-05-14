# Module: AI Providers (Anthropic + Google Gemini)

> Optional module. Enable when your project uses LLMs for analysis, generation, or classification.

---

## Setup

### 1. Get API keys

**Anthropic:**
- https://console.anthropic.com/settings/keys
- Generate a key, copy it. Format: `sk-ant-api03-...`

**Google Generative AI (Gemini):**
- https://aistudio.google.com/apikey
- Generate a key. Format: `AIza...`

### 2. Add to Vercel env vars

```
ANTHROPIC_API_KEY
GOOGLE_GENERATIVE_AI_API_KEY
```

### 3. Install SDKs

```bash
npm install @anthropic-ai/sdk @google/generative-ai
```

### 4. Wire up `src/lib/ai-client.ts`

Pattern: thin abstraction so business logic doesn't care which provider runs.

```typescript
import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";

export type ModelChoice =
  | "claude-haiku-4-5"
  | "claude-sonnet-4-6"
  | "claude-opus-4-7"
  | "gemini-2.0-flash"
  | "gemini-2.0-pro";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const gemini = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);

export async function runLLM(opts: {
  model: ModelChoice;
  system?: string;
  prompt: string;
  maxTokens?: number;
}): Promise<string> {
  if (opts.model.startsWith("claude")) {
    const res = await anthropic.messages.create({
      model: opts.model,
      max_tokens: opts.maxTokens ?? 4096,
      system: opts.system,
      messages: [{ role: "user", content: opts.prompt }],
    });
    return res.content
      .filter((b) => b.type === "text")
      .map((b) => (b as { text: string }).text)
      .join("\n");
  }

  const model = gemini.getGenerativeModel({ model: opts.model });
  const res = await model.generateContent(opts.prompt);
  return res.response.text();
}
```

### 5. Per-task model selection (recommended)

Don't hardcode model names in business logic. Store per-task choices in an `app_settings` table so you can swap models without redeploying:

```sql
-- supabase/migrations/NNN_app_settings.sql
CREATE TABLE app_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO app_settings (key, value) VALUES
  ('default_model_classification', '"claude-haiku-4-5"'),
  ('default_model_analysis', '"claude-sonnet-4-6"'),
  ('default_model_generation', '"claude-sonnet-4-6"');
```

Then in code:
```typescript
const model = await getSetting<ModelChoice>("default_model_analysis");
const result = await runLLM({ model, prompt });
```

---

## Critical patterns

### Deterministic-first (rule engine before LLM)

For any structured task (classification, parsing, validation), build a rule engine first. Only fall back to LLM when rule-engine confidence < threshold. Why: saves money, gives a stable baseline that doesn't drift between model versions.

```typescript
const ruleResult = analyzeWithRules(input);
if (ruleResult.confidence >= 0.7) {
  return ruleResult;
}
// Fall back to LLM
const llmResult = await runLLM({ model: "claude-haiku-4-5", prompt: ... });
return llmResult;
```

### Token logging
Log every LLM call's token count for cost tracking:

```sql
CREATE TABLE ki_usage_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  model TEXT NOT NULL,
  task TEXT NOT NULL,           -- 'classification', 'analysis', etc.
  input_tokens INTEGER NOT NULL,
  output_tokens INTEGER NOT NULL,
  cost_usd NUMERIC(10, 6),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Robust JSON extraction
LLMs sometimes wrap JSON in markdown code blocks, sometimes add explanatory text. Use `jsonrepair` to handle imperfect output:

```typescript
import { jsonrepair } from "jsonrepair";

function extractJson<T>(raw: string): T {
  // Strip markdown fences
  const stripped = raw.replace(/```json\n?|\n?```/g, "").trim();
  // Repair if needed
  return JSON.parse(jsonrepair(stripped));
}
```

### Streaming
For long generation tasks (e.g. user-facing chat), use streaming so the user sees output as it generates:

```typescript
const stream = anthropic.messages.stream({
  model: "claude-sonnet-4-6",
  max_tokens: 4096,
  messages: [{ role: "user", content: prompt }],
});

for await (const event of stream) {
  if (event.type === "content_block_delta") {
    yield event.delta.text;
  }
}
```

---

## Cost guardrails

- Use Haiku for simple tasks (classification, short analysis)
- Use Sonnet for complex tasks (multi-document analysis, generation with reasoning)
- Use Opus rarely — only when Sonnet demonstrably fails
- Set `max_tokens` aggressively — most tasks need <1000 tokens output
- Cache responses where appropriate (e.g. same input → same output is fine for non-personalized tasks)

---

## When NOT to use AI

- Format conversion that regex/parsers handle better
- Calculations (LLMs are bad at math; use code or a calculator)
- Anything where reproducibility matters (LLMs are non-deterministic)
- Anything where a small wrong answer could mislead the user (medical, legal, financial advice)
