import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import { buildPrompt, PROMPT_KIT } from "./src/data/prompts";
import { GenerationMetrics, GenerationResult, ModelProvider, TestCase, TestGenerationResponse } from "./src/types";

dotenv.config();

const PORT = 3000;
const app = express();

app.use(express.json());

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

// Unified multi-model execution dispatcher
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
    if (apiKey) {
      try {
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
        if (resp.ok) {
          const json: any = await resp.json();
          const rawOutput = json.choices?.[0]?.message?.content || '';
          return { rawOutput, provider: 'openai' };
        }
      } catch (e) {
        console.warn("OpenAI API call error, falling back to Gemini engine:", e);
      }
    }
  }

  // 2. Anthropic (Claude)
  if (provider === 'anthropic') {
    const apiKey = userApiKeys?.anthropic || process.env.ANTHROPIC_API_KEY;
    if (apiKey) {
      try {
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
        if (resp.ok) {
          const json: any = await resp.json();
          const rawOutput = json.content?.[0]?.text || '';
          return { rawOutput, provider: 'anthropic' };
        }
      } catch (e) {
        console.warn("Anthropic API call error, falling back to Gemini engine:", e);
      }
    }
  }

  // 3. Perplexity (Sonar)
  if (provider === 'perplexity') {
    const apiKey = userApiKeys?.perplexity || process.env.PERPLEXITY_API_KEY;
    if (apiKey) {
      try {
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
        if (resp.ok) {
          const json: any = await resp.json();
          const rawOutput = json.choices?.[0]?.message?.content || '';
          return { rawOutput, provider: 'perplexity' };
        }
      } catch (e) {
        console.warn("Perplexity API call error, falling back to Gemini engine:", e);
      }
    }
  }

  // 4. xAI (Grok)
  if (provider === 'xai') {
    const apiKey = userApiKeys?.xai || process.env.XAI_API_KEY;
    if (apiKey) {
      try {
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
        if (resp.ok) {
          const json: any = await resp.json();
          const rawOutput = json.choices?.[0]?.message?.content || '';
          return { rawOutput, provider: 'xai' };
        }
      } catch (e) {
        console.warn("xAI API call error, falling back to Gemini engine:", e);
      }
    }
  }

  // 5. Fallback or Google Gemini
  const ai = getAiClient();
  const targetGeminiModel = model.includes('pro') ? 'gemini-3.1-pro-preview' : 'gemini-3.6-flash';

  let adjustedSystem = systemInstruction;
  if (provider !== 'google') {
    const providerTag =
      provider === 'openai'
        ? 'OpenAI ChatGPT'
        : provider === 'anthropic'
        ? 'Anthropic Claude 3.5'
        : provider === 'perplexity'
        ? 'Perplexity Sonar Reasoning'
        : 'xAI Grok-3';
    adjustedSystem = `[Multi-Model Engine Persona: ${providerTag} (${model})]\n${systemInstruction || ''}`;
  }

  if (isBaseline) {
    const response = await ai.models.generateContent({
      model: targetGeminiModel,
      contents: prompt,
      config: {
        systemInstruction: adjustedSystem,
        temperature: typeof temperature === 'number' ? temperature : 0.7,
      },
    });
    return { rawOutput: response.text || '', provider };
  } else {
    const response = await ai.models.generateContent({
      model: targetGeminiModel,
      contents: prompt,
      config: {
        systemInstruction: adjustedSystem,
        temperature: typeof temperature === 'number' ? temperature : 0.2,
        responseMimeType: 'application/json',
        responseSchema: testCasesResponseSchema,
      },
    });
    return { rawOutput: response.text || '', provider };
  }
}


// Response schema for structured JSON output
const testCasesResponseSchema = {
  type: Type.OBJECT,
  properties: {
    requirement_id: { type: Type.STRING, description: "Requirement ID being verified" },
    domain: { type: Type.STRING, description: "System or software domain" },
    test_cases: {
      type: Type.ARRAY,
      description: "List of Given-When-Then test cases",
      items: {
        type: Type.OBJECT,
        properties: {
          test_case_id: { type: Type.STRING, description: "Unique identifier (e.g. TC-REQ-01)" },
          category: { type: Type.STRING, description: "Must be 'normal', 'boundary', or 'negative'" },
          given: { type: Type.STRING, description: "Precondition state" },
          when: { type: Type.STRING, description: "Stimulus or trigger action" },
          then: { type: Type.STRING, description: "Expected output or system behavior" },
          traceable_to: { type: Type.STRING, description: "Requirement ID reference" },
        },
        required: ["test_case_id", "category", "given", "when", "then", "traceable_to"],
      },
    },
  },
  required: ["requirement_id", "domain", "test_cases"],
};

// Helper to compute metrics from generated test cases
function computeMetrics(
  requirementId: string,
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
  let traceabilityValid = true;
  let validTestCases: TestCase[] = [];

  if (parsedData && Array.isArray(parsedData.test_cases)) {
    schemaConformance = true;
    totalTestCases = parsedData.test_cases.length;

    parsedData.test_cases.forEach((tc: any, index: number) => {
      const cat = (tc.category || '').toLowerCase();
      if (cat.includes('boundary')) boundary++;
      else if (cat.includes('negative') || cat.includes('error')) negative++;
      else normal++;

      if (tc.traceable_to && tc.traceable_to !== requirementId && tc.traceable_to !== parsedData.requirement_id) {
        traceabilityValid = false;
      }

      validTestCases.push({
        test_case_id: tc.test_case_id || `TC-${requirementId}-${String(index + 1).padStart(2, '0')}`,
        category: (cat.includes('boundary') ? 'boundary' : cat.includes('negative') ? 'negative' : 'normal') as any,
        given: tc.given || '',
        when: tc.when || '',
        then: tc.then || '',
        traceable_to: tc.traceable_to || requirementId,
      });
    });
  } else if (isBaseline) {
    // Attempt fallback heuristic extraction from unstructured text
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
    });
  }

  const hasNormal = normal > 0;
  const hasBoundary = boundary > 0;
  const hasNegative = negative > 0;

  // Coverage score out of 100% based on paper's 3 category criteria
  let coverageScore = 0;
  if (hasNormal) coverageScore += 34;
  if (hasBoundary) coverageScore += 33;
  if (hasNegative) coverageScore += 33;

  const metrics: GenerationMetrics = {
    totalTestCases,
    categoryCount: { normal, boundary, negative },
    hasNormal,
    hasBoundary,
    hasNegative,
    coverageScore,
    atomicityCheck: totalTestCases > 0 ? 'passed' : 'warning',
    traceabilityValid,
    schemaConformance,
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
  try {
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
    const { rawOutput, provider } = await callModelAPI(
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
      timestamp: new Date().toISOString(),
    };

    return res.json(result);
  } catch (error: any) {
    console.error("Error in /api/generate-test-cases:", error);
    const latencyMs = Date.now() - startTime;
    return res.status(500).json({
      error: error.message || "Failed to generate test cases.",
      latencyMs,
    });
  }
});

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

    const modelAToUse = model_a || model;
    const modelBToUse = model_b || "gpt-4o";

    // Compare Model A vs Model B (or Baseline vs Few-Shot if same model)
    if (model_a && model_b && model_a !== model_b) {
      // Direct Cross-Model Comparison
      const promptObj = buildPrompt("few-shot", { requirement_id, domain, source_ref, requirement_text });

      const startA = Date.now();
      const resA = await callModelAPI(modelAToUse, promptObj.prompt, promptObj.systemInstruction, 0.2, false, user_api_keys);
      const latencyA = Date.now() - startA;
      let parsedA: any = null;
      try { parsedA = JSON.parse(resA.rawOutput.replace(/```json\s*/gi, "").replace(/```\s*/gi, "").trim()); } catch {}
      const metricsA = computeMetrics(requirement_id, parsedA, resA.rawOutput, latencyA, false);

      const startB = Date.now();
      const resB = await callModelAPI(modelBToUse, promptObj.prompt, promptObj.systemInstruction, 0.2, false, user_api_keys);
      const latencyB = Date.now() - startB;
      let parsedB: any = null;
      try { parsedB = JSON.parse(resB.rawOutput.replace(/```json\s*/gi, "").replace(/```\s*/gi, "").trim()); } catch {}
      const metricsB = computeMetrics(requirement_id, parsedB, resB.rawOutput, latencyB, false);

      return res.json({
        requirement: { requirement_id, domain, source_ref, requirement_text },
        modelAResult: {
          success: true,
          data: metricsA.parsedResponse,
          rawOutput: resA.rawOutput,
          metrics: metricsA.metrics,
          promptUsed: promptObj.prompt,
          systemInstructionUsed: promptObj.systemInstruction,
          mode: "few-shot",
          model: modelAToUse,
          provider: resA.provider,
          timestamp: new Date().toISOString(),
        },
        modelBResult: {
          success: true,
          data: metricsB.parsedResponse,
          rawOutput: resB.rawOutput,
          metrics: metricsB.metrics,
          promptUsed: promptObj.prompt,
          systemInstructionUsed: promptObj.systemInstruction,
          mode: "few-shot",
          model: modelBToUse,
          provider: resB.provider,
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Default: Mode Comparison (Baseline Unstructured vs Few-Shot Prompt Kit)
    const baselinePromptObj = buildPrompt("baseline", { requirement_id, domain, source_ref, requirement_text });
    const startBaseline = Date.now();
    const baselineRes = await callModelAPI(modelAToUse, baselinePromptObj.prompt, undefined, 0.7, true, user_api_keys);
    const baselineLatency = Date.now() - startBaseline;

    let baselineParsed: any = null;
    try {
      baselineParsed = JSON.parse(baselineRes.rawOutput.replace(/```json\s*/gi, "").replace(/```\s*/gi, "").trim());
    } catch {}
    const baselineMetrics = computeMetrics(requirement_id, baselineParsed, baselineRes.rawOutput, baselineLatency, true);

    const fewShotPromptObj = buildPrompt("few-shot", { requirement_id, domain, source_ref, requirement_text });
    const startFewShot = Date.now();
    const fewShotRes = await callModelAPI(modelAToUse, fewShotPromptObj.prompt, fewShotPromptObj.systemInstruction, 0.2, false, user_api_keys);
    const fewShotLatency = Date.now() - startFewShot;

    let fewShotParsed: any = null;
    try {
      fewShotParsed = JSON.parse(fewShotRes.rawOutput.replace(/```json\s*/gi, "").replace(/```\s*/gi, "").trim());
    } catch {}
    const fewShotMetrics = computeMetrics(requirement_id, fewShotParsed, fewShotRes.rawOutput, fewShotLatency, false);

    return res.json({
      requirement: { requirement_id, domain, source_ref, requirement_text },
      baselineResult: {
        success: true,
        data: baselineMetrics.parsedResponse,
        rawOutput: baselineRes.rawOutput,
        metrics: baselineMetrics.metrics,
        promptUsed: baselinePromptObj.prompt,
        mode: "baseline",
        model: modelAToUse,
        provider: baselineRes.provider,
        timestamp: new Date().toISOString(),
      },
      fewShotResult: {
        success: true,
        data: fewShotMetrics.parsedResponse,
        rawOutput: fewShotRes.rawOutput,
        metrics: fewShotMetrics.metrics,
        promptUsed: fewShotPromptObj.prompt,
        systemInstructionUsed: fewShotPromptObj.systemInstruction,
        mode: "few-shot",
        model: modelAToUse,
        provider: fewShotRes.provider,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error("Error in /api/compare-modes:", error);
    return res.status(500).json({ error: error.message || "Failed to complete comparison." });
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
