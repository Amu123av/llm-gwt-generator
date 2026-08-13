import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import { buildPrompt, PROMPT_KIT } from "./src/data/prompts";
import { CategoryType, GenerationMetrics, GenerationResult, ModelProvider, TestCase, TestGenerationResponse } from "./src/types";

dotenv.config();

const PORT = 3000;
const app = express();

app.use(express.json());

const testCasesResponseSchema = {
  type: Type.OBJECT,
  properties: {
    requirement_id: { type: Type.STRING },
    domain: { type: Type.STRING },
    test_cases: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          test_case_id: { type: Type.STRING },
          category: { type: Type.STRING, enum: ['normal', 'boundary', 'negative'] },
          given: { type: Type.STRING },
          when: { type: Type.STRING },
          then: { type: Type.STRING },
          traceable_to: { type: Type.STRING },
        },
        required: ['test_case_id', 'category', 'given', 'when', 'then', 'traceable_to'],
      },
    },
  },
  required: ['requirement_id', 'domain', 'test_cases'],
};

// Initialize Gemini API client on the server
const getAiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is missing.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

function getProviderFromModel(model: string): ModelProvider {
  if (model.startsWith('gpt') || model.startsWith('o3')) return 'openai';
  if (model.startsWith('claude')) return 'anthropic';
  if (model.startsWith('sonar')) return 'perplexity';
  if (model.startsWith('grok')) return 'xai';
  return 'google';
}

// Unified multi-model execution dispatcher (NO Silent Fallback)
async function callModelAPI(
  model: string,
  prompt: string,
  systemInstruction?: string,
  temperature: number = 0.2,
  isBaseline: boolean = false,
  userApiKeys?: Record<string, string>
): Promise<{ rawOutput: string; provider: ModelProvider }> {
  const provider = getProviderFromModel(model);

  // 1. OpenAI (ChatGPT)
  if (provider === 'openai') {
    const apiKey = userApiKeys?.openai || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error(`OpenAI API key is not configured. Please configure OPENAI_API_KEY to run ${model}.`);
    }
    const messages: any[] = [];
    if (systemInstruction) messages.push({ role: 'system', content: systemInstruction });
    messages.push({ role: 'user', content: prompt });
    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        response_format: isBaseline ? undefined : { type: 'json_object' },
      }),
    });
    if (!resp.ok) {
      const errText = await resp.text();
      throw new Error(`OpenAI API request failed (HTTP ${resp.status}): ${errText}`);
    }
    const json: any = await resp.json();
    const rawOutput = json.choices?.[0]?.message?.content || '';
    if (!rawOutput) throw new Error("OpenAI returned an empty response.");
    return { rawOutput, provider: 'openai' };
  }

  // 2. Anthropic (Claude)
  if (provider === 'anthropic') {
    const apiKey = userApiKeys?.anthropic || process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error(`Anthropic API key is not configured. Please configure ANTHROPIC_API_KEY to run Claude.`);
    }
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: model.includes('haiku') ? 'claude-3-5-haiku-20241022' : 'claude-3-5-sonnet-20241022',
        system: systemInstruction,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 2048,
        temperature,
      }),
    });
    if (!resp.ok) {
      const errText = await resp.text();
      throw new Error(`Anthropic API request failed (HTTP ${resp.status}): ${errText}`);
    }
    const json: any = await resp.json();
    const rawOutput = json.content?.[0]?.text || '';
    if (!rawOutput) throw new Error("Anthropic Claude returned an empty response.");
    return { rawOutput, provider: 'anthropic' };
  }

  // 3. Perplexity (Sonar)
  if (provider === 'perplexity') {
    const apiKey = userApiKeys?.perplexity || process.env.PERPLEXITY_API_KEY;
    if (!apiKey) {
      throw new Error(`Perplexity API key is not configured. Please configure PERPLEXITY_API_KEY to run ${model}.`);
    }
    const messages: any[] = [];
    if (systemInstruction) messages.push({ role: 'system', content: systemInstruction });
    messages.push({ role: 'user', content: prompt });
    const resp = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model.includes('reasoning') ? 'sonar-reasoning' : 'sonar',
        messages,
        temperature,
      }),
    });
    if (!resp.ok) {
      const errText = await resp.text();
      throw new Error(`Perplexity API request failed (HTTP ${resp.status}): ${errText}`);
    }
    const json: any = await resp.json();
    const rawOutput = json.choices?.[0]?.message?.content || '';
    if (!rawOutput) throw new Error("Perplexity returned an empty response.");
    return { rawOutput, provider: 'perplexity' };
  }

  // 4. xAI (Grok)
  if (provider === 'xai') {
    const apiKey = userApiKeys?.xai || process.env.XAI_API_KEY;
    if (!apiKey) {
      throw new Error(`xAI API key is not configured. Please configure XAI_API_KEY to run Grok.`);
    }
    const messages: any[] = [];
    if (systemInstruction) messages.push({ role: 'system', content: systemInstruction });
    messages.push({ role: 'user', content: prompt });
    const resp = await fetch('https://api.xai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model.includes('3') ? 'grok-3' : 'grok-2-latest',
        messages,
        temperature,
      }),
    });
    if (!resp.ok) {
      const errText = await resp.text();
      throw new Error(`xAI API request failed (HTTP ${resp.status}): ${errText}`);
    }
    const json: any = await resp.json();
    const rawOutput = json.choices?.[0]?.message?.content || '';
    if (!rawOutput) throw new Error("xAI Grok returned an empty response.");
    return { rawOutput, provider: 'xai' };
  }

  // 5. Google Gemini
  const apiKey = userApiKeys?.google || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Google Gemini API key is not configured. Please configure GEMINI_API_KEY.");
  }
  const ai = new GoogleGenAI({ apiKey, httpOptions: { headers: { "User-Agent": "aistudio-build" } } });
  const targetGeminiModel = model.includes('pro') ? 'gemini-3.1-pro-preview' : 'gemini-3.6-flash';

  if (isBaseline) {
    const response = await ai.models.generateContent({
      model: targetGeminiModel,
      contents: prompt,
      config: {
        systemInstruction,
        temperature: typeof temperature === 'number' ? temperature : 0.7,
      },
    });
    return { rawOutput: response.text || '', provider: 'google' };
  } else {
    const response = await ai.models.generateContent({
      model: targetGeminiModel,
      contents: prompt,
      config: {
        systemInstruction,
        temperature: typeof temperature === 'number' ? temperature : 0.2,
        responseMimeType: 'application/json',
        responseSchema: testCasesResponseSchema,
      },
    });
    return { rawOutput: response.text || '', provider: 'google' };
  }
}



// Helper to extract testable requirement clause conditions
function extractRequirementClauses(requirementText: string): string[] {
  if (!requirementText) return [];
  const rawParts = requirementText
    .split(/(?:\.|\;|\n|\bshall\b|\bmust\b|\bif\b|\bwhen\b|\bunless\b|\bprovided that\b)/i)
    .map(p => p.trim())
    .filter(p => p.length > 8);
  return rawParts.length > 0 ? rawParts : [requirementText.trim()];
}

// Helper to compute rigorous research evaluation metrics from generated test cases
function computeMetrics(
  requirementId: string,
  requirementText: string,
  parsedData: any,
  rawOutput: string,
  latencyMs: number,
  isBaseline: boolean
): { metrics: GenerationMetrics; parsedResponse?: TestGenerationResponse } {
  let totalTestCases = 0;
  let normal = 0;
  let boundary = 0;
  let negative = 0;
  let schemaConformance = false;
  let schemaConformanceReason: string | undefined = undefined;
  let validTestCases: TestCase[] = [];
  let atomicCount = 0;
  let nonAtomicCount = 0;
  let traceableCount = 0;

  if (parsedData && Array.isArray(parsedData.test_cases)) {
    totalTestCases = parsedData.test_cases.length;
    let hasValidationFailure = false;
    const failureReasons: string[] = [];

    if (totalTestCases === 0) {
      hasValidationFailure = true;
      failureReasons.push("Response contains an empty 'test_cases' array.");
    }

    parsedData.test_cases.forEach((tc: any, index: number) => {
      // Required fields validation
      const missingFields: string[] = [];
      if (!tc.given || typeof tc.given !== 'string' || !tc.given.trim()) missingFields.push('given');
      if (!tc.when || typeof tc.when !== 'string' || !tc.when.trim()) missingFields.push('when');
      if (!tc.then || typeof tc.then !== 'string' || !tc.then.trim()) missingFields.push('then');
      if (!tc.test_case_id) missingFields.push('test_case_id');
      if (!tc.traceable_to) missingFields.push('traceable_to');

      const catRaw = (tc.category || '').toLowerCase();
      let normalizedCat: CategoryType = 'normal';
      if (catRaw.includes('boundary') || catRaw.includes('edge') || catRaw.includes('limit')) {
        normalizedCat = 'boundary';
      } else if (catRaw.includes('negative') || catRaw.includes('error') || catRaw.includes('invalid') || catRaw.includes('fail')) {
        normalizedCat = 'negative';
      } else if (catRaw.includes('normal') || catRaw.includes('positive') || catRaw.includes('valid') || catRaw.includes('standard')) {
        normalizedCat = 'normal';
      } else if (catRaw !== '') {
        missingFields.push(`invalid category '${tc.category}'`);
      }

      if (missingFields.length > 0) {
        hasValidationFailure = true;
        failureReasons.push(`Test case #${index + 1} issue: missing ${missingFields.join(', ')}.`);
      }

      // Count categories
      if (normalizedCat === 'boundary') boundary++;
      else if (normalizedCat === 'negative') negative++;
      else normal++;

      // Traceability check
      const tcTrace = String(tc.traceable_to || '').trim();
      const reqIdClean = String(requirementId || '').trim();
      const parsedReqClean = String(parsedData.requirement_id || '').trim();
      if (tcTrace && (tcTrace.toLowerCase().includes(reqIdClean.toLowerCase()) || tcTrace.toLowerCase().includes(parsedReqClean.toLowerCase()) || reqIdClean.toLowerCase().includes(tcTrace.toLowerCase()))) {
        traceableCount++;
      }

      // Atomicity Heuristic check
      const whenText = (tc.when || '').toLowerCase();
      const thenText = (tc.then || '').toLowerCase();
      const compoundPatterns = [
        /\band then\b/,
        /\band also\b/,
        /\badditionally\b/,
        /\bplus\b/,
        /\b\.\s+[a-z]/,
        /;\s+/,
        /\b(and|then)\s+.*\b(and|then)\b/
      ];
      const isCompoundWhen = compoundPatterns.some(p => p.test(whenText));
      const isCompoundThen = compoundPatterns.some(p => p.test(thenText));

      if (isCompoundWhen || isCompoundThen) {
        nonAtomicCount++;
      } else {
        atomicCount++;
      }

      validTestCases.push({
        test_case_id: tc.test_case_id || `TC-${requirementId}-${String(index + 1).padStart(2, '0')}`,
        category: normalizedCat,
        given: tc.given || '',
        when: tc.when || '',
        then: tc.then || '',
        traceable_to: tc.traceable_to || requirementId,
      });
    });

    if (!hasValidationFailure) {
      schemaConformance = true;
    } else {
      schemaConformance = false;
      schemaConformanceReason = failureReasons.slice(0, 2).join(" ");
    }
  } else if (isBaseline) {
    schemaConformance = false;
    schemaConformanceReason = "Baseline mode generates unstructured text without JSON schema conformance.";

    // Attempt heuristic extraction for baseline text
    const lines = rawOutput.split("\n");
    let currentTc: Partial<TestCase> = {};
    lines.forEach((line) => {
      const trimmed = line.trim();
      if (/^(test case|tc|\d+[\.\)])/i.test(trimmed)) {
        if (currentTc.when || currentTc.then) {
          validTestCases.push({
            test_case_id: currentTc.test_case_id || `TC-BASE-${validTestCases.length + 1}`,
            category: (currentTc.category || 'normal') as any,
            given: currentTc.given || 'System is initialized',
            when: currentTc.when || 'Action is performed',
            then: currentTc.then || 'Expected behavior occurs',
            traceable_to: requirementId,
          });
        }
        currentTc = {
          test_case_id: `TC-BASE-${validTestCases.length + 1}`,
          category: /boundary|edge/i.test(trimmed) ? 'boundary' : /negative|error|fail/i.test(trimmed) ? 'negative' : 'normal',
        };
      } else if (/^given/i.test(trimmed)) {
        currentTc.given = trimmed.replace(/^given\s*/i, '');
      } else if (/^when/i.test(trimmed)) {
        currentTc.when = trimmed.replace(/^when\s*/i, '');
      } else if (/^then/i.test(trimmed)) {
        currentTc.then = trimmed.replace(/^then\s*/i, '');
      }
    });

    if (currentTc.when || currentTc.then) {
      validTestCases.push({
        test_case_id: currentTc.test_case_id || `TC-BASE-${validTestCases.length + 1}`,
        category: (currentTc.category || 'normal') as any,
        given: currentTc.given || 'System is running',
        when: currentTc.when || 'Requirement action executed',
        then: currentTc.then || 'Expected outcome verified',
        traceable_to: requirementId,
      });
    }

    totalTestCases = validTestCases.length;
    validTestCases.forEach(tc => {
      if (tc.category === 'boundary') boundary++;
      else if (tc.category === 'negative') negative++;
      else normal++;
      traceableCount++;
      atomicCount++;
    });
  } else {
    schemaConformance = false;
    schemaConformanceReason = "Failed to parse model response as valid JSON schema.";
  }

  const hasNormal = normal > 0;
  const hasBoundary = boundary > 0;
  const hasNegative = negative > 0;

  // 1. Test Category Coverage (TCC %)
  let testCategoryCoverage = 0;
  if (hasNormal) testCategoryCoverage += 34;
  if (hasBoundary) testCategoryCoverage += 33;
  if (hasNegative) testCategoryCoverage += 33;

  // 2. Requirement Clause Coverage (RCC %)
  const reqClauses = extractRequirementClauses(requirementText);
  const totalRequirementClauses = reqClauses.length;
  let coveredRequirementClauses = 0;

  if (totalRequirementClauses > 0 && totalTestCases > 0) {
    const combinedTcText = validTestCases.map(tc => `${tc.given} ${tc.when} ${tc.then}`).join(" ").toLowerCase();
    reqClauses.forEach(clause => {
      const keywords = clause.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 3);
      if (keywords.length === 0) {
        coveredRequirementClauses++;
      } else {
        const matchCount = keywords.filter(kw => combinedTcText.includes(kw)).length;
        if (matchCount >= Math.min(2, keywords.length)) {
          coveredRequirementClauses++;
        }
      }
    });
  }
  const requirementClauseCoverage = totalRequirementClauses > 0
    ? Math.round((coveredRequirementClauses / totalRequirementClauses) * 100)
    : 100;

  // 3. Atomicity Heuristic %
  const atomicityHeuristicScore = totalTestCases > 0 ? Math.round((atomicCount / totalTestCases) * 100) : 0;

  // 4. Traceability %
  const traceabilityScore = totalTestCases > 0 ? Math.round((traceableCount / totalTestCases) * 100) : 0;
  const traceabilityValid = totalTestCases > 0 && traceableCount === totalTestCases;

  const metrics: GenerationMetrics = {
    totalTestCases,
    categoryCount: { normal, boundary, negative },
    hasNormal,
    hasBoundary,
    hasNegative,
    testCategoryCoverage,
    totalRequirementClauses,
    coveredRequirementClauses,
    requirementClauseCoverage,
    coverageScore: testCategoryCoverage,
    atomicCount,
    nonAtomicCount,
    atomicityHeuristicScore,
    atomicityCheck: atomicityHeuristicScore >= 80 ? 'passed' : 'warning',
    traceableCount,
    traceabilityScore,
    traceabilityValid,
    schemaConformance,
    schemaConformanceReason,
    latencyMs,
    rawText: rawOutput,
  };

  const parsedResponse: TestGenerationResponse = {
    requirement_id: parsedData?.requirement_id || requirementId,
    domain: parsedData?.domain || 'General',
    test_cases: validTestCases,
  };

  return { metrics, parsedResponse };
}

// API endpoint to generate test cases
app.post("/api/generate-test-cases", async (req, res) => {
  const startTime = Date.now();
  const {
    requirement_id = "REQ-001",
    domain = "Mozilla",
    source_ref = "Ref-1",
    requirement_text = "",
    prompt_mode = "few-shot",
    model = "gemini-3.6-flash",
    temperature = 0.2,
    user_api_keys = {},
  } = req.body;

  const provider = getProviderFromModel(model);

  if (!requirement_text || typeof requirement_text !== "string" || !requirement_text.trim()) {
    return res.status(400).json({ error: "requirement_text is required." });
  }

  const { prompt, systemInstruction } = buildPrompt(prompt_mode, {
    requirement_id,
    domain,
    source_ref,
    requirement_text,
  });

  const isBaseline = prompt_mode === "baseline";

  try {
    const { rawOutput } = await callModelAPI(
      model,
      prompt,
      systemInstruction,
      temperature,
      isBaseline,
      user_api_keys
    );

    let parsedData: any = null;
    try {
      const cleanJson = rawOutput.replace(/```json\s*/gi, "").replace(/```\s*/gi, "").trim();
      parsedData = JSON.parse(cleanJson);
    } catch {
      parsedData = null;
    }

    const latencyMs = Date.now() - startTime;
    const { metrics, parsedResponse } = computeMetrics(
      requirement_id,
      requirement_text,
      parsedData,
      rawOutput,
      latencyMs,
      isBaseline
    );

    const result: GenerationResult = {
      success: true,
      data: parsedResponse,
      rawOutput,
      metrics,
      promptUsed: prompt,
      systemInstructionUsed: systemInstruction,
      mode: prompt_mode,
      model,
      provider,
      temperature,
      timestamp: new Date().toISOString(),
      requirement_id,
    };

    return res.json(result);
  } catch (error: any) {
    const latencyMs = Date.now() - startTime;
    const errorMsg = error.message || "Model execution failed.";
    const failedMetrics: GenerationMetrics = {
      totalTestCases: 0,
      categoryCount: { normal: 0, boundary: 0, negative: 0 },
      hasNormal: false,
      hasBoundary: false,
      hasNegative: false,
      testCategoryCoverage: 0,
      totalRequirementClauses: 0,
      coveredRequirementClauses: 0,
      requirementClauseCoverage: 0,
      coverageScore: 0,
      atomicCount: 0,
      nonAtomicCount: 0,
      atomicityHeuristicScore: 0,
      atomicityCheck: 'warning',
      traceableCount: 0,
      traceabilityScore: 0,
      traceabilityValid: false,
      schemaConformance: false,
      schemaConformanceReason: `Execution Error: ${errorMsg}`,
      latencyMs,
      error: errorMsg,
    };

    const failedResult: GenerationResult = {
      success: false,
      error: errorMsg,
      data: { requirement_id, domain, test_cases: [] },
      rawOutput: `EXECUTION FAILED: ${errorMsg}`,
      metrics: failedMetrics,
      promptUsed: prompt,
      systemInstructionUsed: systemInstruction,
      mode: prompt_mode,
      model,
      provider,
      temperature,
      timestamp: new Date().toISOString(),
      requirement_id,
    };

    return res.json(failedResult);
  }
});

// Helper for safe individual model run in comparison / benchmark endpoints
async function runSingleModelExperiment(
  model: string,
  promptMode: 'few-shot' | 'zero-shot' | 'baseline',
  input: { requirement_id: string; domain: string; source_ref: string; requirement_text: string },
  temperature: number = 0.2,
  userApiKeys: Record<string, string> = {}
): Promise<GenerationResult> {
  const startTime = Date.now();
  const provider = getProviderFromModel(model);
  const { prompt, systemInstruction } = buildPrompt(promptMode, input);
  const isBaseline = promptMode === 'baseline';

  try {
    const apiRes = await callModelAPI(model, prompt, systemInstruction, temperature, isBaseline, userApiKeys);
    const latencyMs = Date.now() - startTime;

    let parsed: any = null;
    try {
      parsed = JSON.parse(apiRes.rawOutput.replace(/```json\s*/gi, "").replace(/```\s*/gi, "").trim());
    } catch {}

    const { metrics, parsedResponse } = computeMetrics(
      input.requirement_id,
      input.requirement_text,
      parsed,
      apiRes.rawOutput,
      latencyMs,
      isBaseline
    );

    return {
      success: true,
      data: parsedResponse,
      rawOutput: apiRes.rawOutput,
      metrics,
      promptUsed: prompt,
      systemInstructionUsed: systemInstruction,
      mode: promptMode,
      model,
      provider,
      temperature,
      timestamp: new Date().toISOString(),
      requirement_id: input.requirement_id,
    };
  } catch (err: any) {
    const latencyMs = Date.now() - startTime;
    const errorMsg = err.message || "Execution failed.";
    return {
      success: false,
      error: errorMsg,
      data: { requirement_id: input.requirement_id, domain: input.domain, test_cases: [] },
      rawOutput: `EXECUTION FAILED: ${errorMsg}`,
      metrics: {
        totalTestCases: 0,
        categoryCount: { normal: 0, boundary: 0, negative: 0 },
        hasNormal: false,
        hasBoundary: false,
        hasNegative: false,
        testCategoryCoverage: 0,
        totalRequirementClauses: 0,
        coveredRequirementClauses: 0,
        requirementClauseCoverage: 0,
        coverageScore: 0,
        atomicCount: 0,
        nonAtomicCount: 0,
        atomicityHeuristicScore: 0,
        atomicityCheck: 'warning',
        traceableCount: 0,
        traceabilityScore: 0,
        traceabilityValid: false,
        schemaConformance: false,
        schemaConformanceReason: `Execution Error: ${errorMsg}`,
        latencyMs,
        error: errorMsg,
      },
      promptUsed: prompt,
      systemInstructionUsed: systemInstruction,
      mode: promptMode,
      model,
      provider,
      temperature,
      timestamp: new Date().toISOString(),
      requirement_id: input.requirement_id,
    };
  }
}

// API endpoint for Side-by-Side Comparison
app.post("/api/compare-modes", async (req, res) => {
  try {
    const {
      requirement_id = "REQ-COMPARE",
      domain = "Mozilla",
      source_ref = "Ref-Comp",
      requirement_text = "",
      model = "gemini-3.6-flash",
      model_a,
      model_b,
      user_api_keys = {},
    } = req.body;

    if (!requirement_text.trim()) {
      return res.status(400).json({ error: "requirement_text is required for comparison." });
    }

    const reqInput = { requirement_id, domain, source_ref, requirement_text };
    const modelAToUse = model_a || model;
    const modelBToUse = model_b || "gpt-4o";

    // Cross-Model Comparison
    if (model_a && model_b && model_a !== model_b) {
      const resA = await runSingleModelExperiment(modelAToUse, "few-shot", reqInput, 0.2, user_api_keys);
      const resB = await runSingleModelExperiment(modelBToUse, "few-shot", reqInput, 0.2, user_api_keys);

      return res.json({
        requirement: reqInput,
        modelAResult: resA,
        modelBResult: resB,
      });
    }

    // Default: Prompt Mode Comparison (Baseline vs Few-Shot for single model)
    const baselineResult = await runSingleModelExperiment(modelAToUse, "baseline", reqInput, 0.7, user_api_keys);
    const fewShotResult = await runSingleModelExperiment(modelAToUse, "few-shot", reqInput, 0.2, user_api_keys);

    return res.json({
      requirement: reqInput,
      baselineResult,
      fewShotResult,
    });
  } catch (error: any) {
    console.error("Error in /api/compare-modes:", error);
    return res.status(500).json({ error: error.message || "Failed to complete comparison." });
  }
});

// API endpoint for Multi-Model Accuracy Benchmark Matrix
app.post("/api/benchmark-models", async (req, res) => {
  try {
    const {
      requirement_id = "REQ-BENCHMARK",
      domain = "Cross-Domain",
      source_ref = "SpecRef-01",
      requirement_text = "",
      models = [
        "gemini-3.6-flash",
        "gemini-3.1-pro-preview",
        "gpt-4o",
        "gpt-4o-mini",
        "o3-mini",
        "claude-3-5-sonnet",
        "claude-3-5-haiku",
        "sonar-reasoning",
        "grok-3",
      ],
      user_api_keys = {},
    } = req.body;

    if (!requirement_text.trim()) {
      return res.status(400).json({ error: "requirement_text is required for model benchmark." });
    }

    const reqInput = { requirement_id, domain, source_ref, requirement_text };
    const benchmarkResults: Record<string, GenerationResult> = {};

    for (const modelId of models) {
      benchmarkResults[modelId] = await runSingleModelExperiment(modelId, "few-shot", reqInput, 0.2, user_api_keys);
    }

    return res.json({
      requirement: reqInput,
      results: benchmarkResults,
    });
  } catch (error: any) {
    console.error("Error in /api/benchmark-models:", error);
    return res.status(500).json({ error: error.message || "Failed to execute model accuracy benchmark." });
  }
});



// Setup Vite in Dev or Static files in Production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Requirement-to-Test-Case Workbench server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
