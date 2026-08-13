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
  coverageScore: number; // 0 to 100%
  atomicityCheck: 'passed' | 'warning';
  traceabilityValid: boolean;
  schemaConformance: boolean;
  latencyMs: number;
  rawText?: string;
  error?: string;
}

export interface GenerationResult {
  success: boolean;
  data?: TestGenerationResponse;
  rawOutput: string;
  metrics: GenerationMetrics;
  promptUsed: string;
  systemInstructionUsed?: string;
  mode: PromptMode;
  model: string;
  provider?: ModelProvider;
  timestamp: string;
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

