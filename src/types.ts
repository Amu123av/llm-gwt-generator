export type PromptMode = 'few-shot' | 'zero-shot' | 'baseline';

export type CategoryType = 'normal' | 'boundary' | 'negative';

export type ModelProvider = 'google' | 'openai' | 'anthropic' | 'perplexity' | 'xai';

export interface ModelInfo {
  id: string;
  name: string;
  provider: ModelProvider;
  providerName: string;
  badgeColor: string;
  note: string;
  isDefault?: boolean;
}

export interface TestCase {
  test_case_id: string;
  category: CategoryType;
  given: string;
  when: string;
  then: string;
  traceable_to: string;
}

export interface TestGenerationResponse {
  requirement_id: string;
  domain: string;
  test_cases: TestCase[];
}

export interface GenerationMetrics {
  totalTestCases: number;
  categoryCount: {
    normal: number;
    boundary: number;
    negative: number;
  };
  hasNormal: boolean;
  hasBoundary: boolean;
  hasNegative: boolean;
  testCategoryCoverage: number; // 0 to 100% (TCC)
  totalRequirementClauses: number;
  coveredRequirementClauses: number;
  requirementClauseCoverage: number; // 0 to 100% (RCC)
  coverageScore: number; // TCC (0 to 100%)
  atomicCount: number;
  nonAtomicCount: number;
  atomicityHeuristicScore: number; // 0 to 100%
  atomicityCheck: 'passed' | 'warning';
  traceableCount: number;
  traceabilityScore: number; // 0 to 100%
  traceabilityValid: boolean;
  schemaConformance: boolean;
  schemaConformanceReason?: string;
  latencyMs: number;
  rawText?: string;
  error?: string;
}

export interface GenerationResult {
  success: boolean;
  error?: string;
  data?: TestGenerationResponse;
  rawOutput: string;
  metrics: GenerationMetrics;
  promptUsed: string;
  systemInstructionUsed?: string;
  mode: PromptMode;
  model: string;
  modelName?: string;
  provider: ModelProvider;
  temperature: number;
  timestamp: string;
  requirement_id: string;
}

export interface RequirementInput {
  requirement_id: string;
  domain: string;
  source_ref: string;
  requirement_text: string;
}

export interface SampleRequirement extends RequirementInput {
  title: string;
  description: string;
  tags: string[];
}

export interface ComparisonResult {
  requirement: RequirementInput;
  fewShotResult?: GenerationResult;
  zeroShotResult?: GenerationResult;
  baselineResult?: GenerationResult;
  modelAResult?: GenerationResult;
  modelBResult?: GenerationResult;
  timestamp: string;
}

export interface ExperimentExportRow {
  requirement_id: string;
  domain: string;
  source_ref: string;
  model_provider: string;
  model_name: string;
  prompt_mode: string;
  temperature: number;
  test_case_id: string;
  category: string;
  given: string;
  when: string;
  then: string;
  traceability: string; // e.g. "100%" or "Traceable"
  schema_conformance: string; // "PASS" | "FAIL"
  test_category_coverage: number; // %
  atomicity_heuristic: number; // %
  latency_ms: number;
  timestamp: string;
  execution_status: string; // "SUCCESS" | "FAILED"
  error_message?: string;
}


