import { ModelInfo } from '../types';

export const SUPPORTED_MODELS: ModelInfo[] = [
  // Google Gemini
  {
    id: 'gemini-3.6-flash',
    name: 'Gemini 3.6 Flash',
    provider: 'google',
    providerName: 'Google AI',
    badgeColor: 'bg-indigo-950 text-indigo-300 border-indigo-800',
    note: 'Fast, cost-effective, high-accuracy structured test case engine.',
    isDefault: true,
  },
  {
    id: 'gemini-3.1-pro-preview',
    name: 'Gemini 3.1 Pro',
    provider: 'google',
    providerName: 'Google AI',
    badgeColor: 'bg-indigo-950 text-indigo-300 border-indigo-800',
    note: 'Maximum reasoning and consistency for complex multi-page specs.',
  },

  // OpenAI ChatGPT
  {
    id: 'gpt-4o',
    name: 'ChatGPT (GPT-4o)',
    provider: 'openai',
    providerName: 'OpenAI',
    badgeColor: 'bg-emerald-950 text-emerald-300 border-emerald-800',
    note: 'Flagship multimodal model with strong instruction following.',
  },
  {
    id: 'gpt-4o-mini',
    name: 'ChatGPT (GPT-4o Mini)',
    provider: 'openai',
    providerName: 'OpenAI',
    badgeColor: 'bg-emerald-950 text-emerald-300 border-emerald-800',
    note: 'Lightweight, ultra-fast model for high-throughput generation.',
  },
  {
    id: 'o3-mini',
    name: 'ChatGPT (o3-mini)',
    provider: 'openai',
    providerName: 'OpenAI',
    badgeColor: 'bg-emerald-950 text-emerald-300 border-emerald-800',
    note: 'Specialized reasoning model for deep logic & edge case synthesis.',
  },

  // Anthropic Claude
  {
    id: 'claude-3-5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'anthropic',
    providerName: 'Anthropic',
    badgeColor: 'bg-amber-950 text-amber-300 border-amber-800',
    note: 'Industry standard for precise software testing & coding logic.',
  },
  {
    id: 'claude-3-5-haiku',
    name: 'Claude 3.5 Haiku',
    provider: 'anthropic',
    providerName: 'Anthropic',
    badgeColor: 'bg-amber-950 text-amber-300 border-amber-800',
    note: 'Blazing fast structured output model with high format adherence.',
  },

  // Perplexity
  {
    id: 'sonar-reasoning',
    name: 'Perplexity Sonar Reasoning',
    provider: 'perplexity',
    providerName: 'Perplexity AI',
    badgeColor: 'bg-cyan-950 text-cyan-300 border-cyan-800',
    note: 'Search-grounded chain-of-thought spec & bug analysis.',
  },
  {
    id: 'sonar',
    name: 'Perplexity Sonar',
    provider: 'perplexity',
    providerName: 'Perplexity AI',
    badgeColor: 'bg-cyan-950 text-cyan-300 border-cyan-800',
    note: 'Real-time context-aware requirement evaluation.',
  },

  // xAI Grok
  {
    id: 'grok-3',
    name: 'xAI Grok-3',
    provider: 'xai',
    providerName: 'xAI',
    badgeColor: 'bg-purple-950 text-purple-300 border-purple-800',
    note: 'Next-generation deep reasoning & adversarial negative testing.',
  },
  {
    id: 'grok-2',
    name: 'xAI Grok-2',
    provider: 'xai',
    providerName: 'xAI',
    badgeColor: 'bg-purple-950 text-purple-300 border-purple-800',
    note: 'High-speed direct compliance model.',
  },
];

export const PROMPT_KIT = {
  step1Settings: {
    recommendedModels: SUPPORTED_MODELS,
    recommendedTemperature: 0.2,
    responseFormat: "JSON with Response Schema"
  },


  step2SystemInstruction: `You are a senior QA engineer generating black-box test cases from natural-language software requirements or bug reports. You will be given ONE requirement at a time.

Your task: generate Given-When-Then (GWT) style test cases that verify the behaviour described in the requirement.

STRICT CONSTRAINTS (do not violate):
1. Atomicity — each test case must verify exactly ONE behaviour/condition.
2. No fabrication — never invent preconditions, data values, or system behaviour that is not stated or directly implied by the requirement text. If the requirement is ambiguous or underspecified, generate the most reasonable literal interpretation and do not add unstated detail.
3. Coverage — generate test cases covering, where applicable: the normal/expected case, at least one boundary case, and at least one negative/error case.
4. No duplication — do not generate two test cases that test the same condition in different words.
5. Traceability — every test case must reference the requirement_id it was derived from.
6. Output ONLY valid JSON matching the schema below. No prose, no markdown fences, no explanation outside the JSON.

OUTPUT SCHEMA (JSON):
{
  "requirement_id": "string",
  "domain": "string",
  "test_cases": [
    {
      "test_case_id": "string (e.g. TC-<requirement_id>-01)",
      "category": "normal | boundary | negative",
      "given": "string",
      "when": "string",
      "then": "string",
      "traceable_to": "string (must equal requirement_id)"
    }
  ]
}`,

  step3AZeroShotTemplate: `Requirement Context:
- requirement_id: {{requirement_id}}
- domain: {{domain}}
- source_ref: {{source_ref}}
- requirement_text: "{{requirement_text}}"

Generate the test cases now, following the system instructions exactly.`,

  step3BFewShotTemplate: `Here are example requirement → test case conversions to guide your style:

EXAMPLE 1 (Mozilla-style, informal):
Requirement: "The browser shall not crash when a malformed URL is entered in the address bar."
Output:
{
  "requirement_id": "EX-1",
  "domain": "Mozilla",
  "test_cases": [
    {
      "test_case_id": "TC-EX-1-01",
      "category": "normal",
      "given": "the browser is running and the address bar is focused",
      "when": "a valid well-formed URL is entered and Enter is pressed",
      "then": "the browser navigates to the page successfully",
      "traceable_to": "EX-1"
    },
    {
      "test_case_id": "TC-EX-1-02",
      "category": "negative",
      "given": "the browser is running and the address bar is focused",
      "when": "a malformed URL string is entered and Enter is pressed",
      "then": "the browser displays an invalid-address indication without terminating the process",
      "traceable_to": "EX-1"
    }
  ]
}

EXAMPLE 2 (Bluetooth-style, formal/normative):
Requirement: "The device shall terminate the connection if no response is received within the supervision timeout period."
Output:
{
  "requirement_id": "EX-2",
  "domain": "Bluetooth",
  "test_cases": [
    {
      "test_case_id": "TC-EX-2-01",
      "category": "normal",
      "given": "an active connection exists between two devices",
      "when": "a response is received within the supervision timeout period",
      "then": "the connection remains active",
      "traceable_to": "EX-2"
    },
    {
      "test_case_id": "TC-EX-2-02",
      "category": "boundary",
      "given": "an active connection exists and the supervision timeout is about to elapse",
      "when": "no response is received exactly at the supervision timeout boundary",
      "then": "the device terminates the connection",
      "traceable_to": "EX-2"
    }
  ]
}

Now generate test cases for the following requirement, following the same style and the system instructions exactly:

Requirement Context:
- requirement_id: {{requirement_id}}
- domain: {{domain}}
- source_ref: {{source_ref}}
- requirement_text: "{{requirement_text}}"`,

  step4BaselineTemplate: `Write some test cases for this: {{requirement_text}}`
};

export function buildPrompt(
  mode: 'few-shot' | 'zero-shot' | 'baseline',
  input: { requirement_id: string; domain: string; source_ref: string; requirement_text: string }
): { prompt: string; systemInstruction?: string } {
  if (mode === 'baseline') {
    return {
      prompt: PROMPT_KIT.step4BaselineTemplate.replace('{{requirement_text}}', input.requirement_text)
    };
  }

  const template = mode === 'few-shot' ? PROMPT_KIT.step3BFewShotTemplate : PROMPT_KIT.step3AZeroShotTemplate;
  const prompt = template
    .replace('{{requirement_id}}', input.requirement_id || 'REQ-001')
    .replace('{{domain}}', input.domain || 'Mozilla')
    .replace('{{source_ref}}', input.source_ref || 'Ref-001')
    .replace('{{requirement_text}}', input.requirement_text);

  return {
    prompt,
    systemInstruction: PROMPT_KIT.step2SystemInstruction
  };
}
