import React, { useState } from 'react';
import { RequirementInput, ComparisonResult } from '../types';
import { SAMPLE_REQUIREMENTS } from '../data/sampleRequirements';
import { BarChart3, ArrowRight, RefreshCw, AlertCircle, CheckCircle2, FileText, Sparkles } from 'lucide-react';

interface SideBySideComparisonProps {
  apiKeys?: Record<string, string>;
}

export const SideBySideComparison: React.FC<SideBySideComparisonProps> = ({ apiKeys = {} }) => {
  const [comparisonType, setComparisonType] = useState<'prompt' | 'model'>('model');
  const [selectedSample, setSelectedSample] = useState<RequirementInput>(SAMPLE_REQUIREMENTS[0]);
  const [customText, setCustomText] = useState(SAMPLE_REQUIREMENTS[0].requirement_text);
  const [modelA, setModelA] = useState<string>('gemini-3.6-flash');
  const [modelB, setModelB] = useState<string>('gpt-4o');
  const [isLoading, setIsLoading] = useState(false);
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSelectSample = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    const found = SAMPLE_REQUIREMENTS.find((s) => s.requirement_id === id);
    if (found) {
      setSelectedSample(found);
      setCustomText(found.requirement_text);
    }
  };

  const handleRunComparison = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const body = comparisonType === 'model'
        ? {
            requirement_id: selectedSample.requirement_id,
            domain: selectedSample.domain,
            source_ref: selectedSample.source_ref,
            requirement_text: customText,
            model_a: modelA,
            model_b: modelB,
            user_api_keys: apiKeys,
          }
        : {
            requirement_id: selectedSample.requirement_id,
            domain: selectedSample.domain,
            source_ref: selectedSample.source_ref,
            requirement_text: customText,
            model: modelA,
            user_api_keys: apiKeys,
          };

      const response = await fetch('/api/compare-modes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to compare modes.');
      }

      const data: ComparisonResult = await response.json();
      setComparisonResult(data);
    } catch (err: any) {
      setError(err.message || 'An error occurred during comparison.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Intro Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg text-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 mb-4 gap-3">
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white">
              Side-by-Side Model & Prompt Engineering Evaluation
            </h2>
          </div>

          {/* Toggle between Model Comparison and Prompt Strategy Comparison */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setComparisonType('model')}
              className={`px-3 py-1 font-semibold rounded-lg transition-all ${
                comparisonType === 'model'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Cross-Model (e.g. ChatGPT vs Claude)
            </button>

            <button
              type="button"
              onClick={() => setComparisonType('prompt')}
              className={`px-3 py-1 font-semibold rounded-lg transition-all ${
                comparisonType === 'prompt'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Prompt Strategy (Baseline vs Kit)
            </button>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          {comparisonType === 'model'
            ? 'Compare outputs side-by-side across major LLM architectures (Google Gemini, OpenAI ChatGPT, Anthropic Claude, Perplexity, xAI Grok).'
            : 'Compare standard Baseline (Unstructured Naive Prompting) against the 5-Component Prompt Engineering Framework (Prompt Kit).'}
        </p>

        {/* Input Controls */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-3">
          {comparisonType === 'model' ? (
            <>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Model A</label>
                <select
                  value={modelA}
                  onChange={(e) => setModelA(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-xs text-indigo-300 font-semibold rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="gemini-3.6-flash">Google Gemini 3.6 Flash</option>
                  <option value="gemini-3.1-pro-preview">Google Gemini 3.1 Pro</option>
                  <option value="gpt-4o">ChatGPT (GPT-4o)</option>
                  <option value="claude-3-5-sonnet">Claude 3.5 Sonnet</option>
                  <option value="sonar-reasoning">Perplexity Sonar Reasoning</option>
                  <option value="grok-3">xAI Grok-3</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Model B</label>
                <select
                  value={modelB}
                  onChange={(e) => setModelB(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-xs text-emerald-300 font-semibold rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="gpt-4o">ChatGPT (GPT-4o)</option>
                  <option value="claude-3-5-sonnet">Claude 3.5 Sonnet</option>
                  <option value="gemini-3.6-flash">Google Gemini 3.6 Flash</option>
                  <option value="sonar-reasoning">Perplexity Sonar Reasoning</option>
                  <option value="grok-3">xAI Grok-3</option>
                  <option value="gpt-4o-mini">ChatGPT (GPT-4o Mini)</option>
                </select>
              </div>
            </>
          ) : (
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-400 mb-1">Select Requirement</label>
              <select
                value={selectedSample.requirement_id}
                onChange={handleSelectSample}
                className="w-full bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                {SAMPLE_REQUIREMENTS.map((s) => (
                  <option key={s.requirement_id} value={s.requirement_id}>
                    [{s.domain}] {s.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-slate-400 mb-1">Requirement Text</label>
            <textarea
              rows={2}
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-lg p-2 font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
            />
          </div>
        </div>

        <button
          onClick={handleRunComparison}
          disabled={isLoading || !customText.trim()}
          className="mt-4 w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl flex items-center justify-center space-x-2 transition-all shadow-md shadow-indigo-600/30 disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Executing Side-by-Side Model Generations...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              <span>Run Side-by-Side Evaluation</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="bg-rose-950/80 border border-rose-800 p-4 rounded-xl text-rose-200 text-xs flex items-center space-x-2">
          <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Comparison Results */}
      {comparisonResult && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Panel Left (Model A or Baseline) */}
          {comparisonResult.modelAResult ? (
            <div className="bg-slate-900 border border-indigo-700/80 rounded-xl p-5 text-slate-100 shadow-lg">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                <div className="flex items-center space-x-2">
                  <span className="p-1.5 bg-indigo-950 border border-indigo-700 text-indigo-300 rounded-md text-xs font-bold font-mono">
                    MODEL A
                  </span>
                  <h3 className="text-sm font-bold text-indigo-300 capitalize">
                    {comparisonResult.modelAResult.model}
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-slate-400">
                  {comparisonResult.modelAResult.metrics.latencyMs} ms
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs mb-4">
                <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Coverage</span>
                  <span className="font-mono font-bold text-emerald-400">
                    {comparisonResult.modelAResult.metrics.coverageScore}%
                  </span>
                </div>
                <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Test Cases</span>
                  <span className="font-mono font-bold text-white">
                    {comparisonResult.modelAResult.metrics.totalTestCases}
                  </span>
                </div>
                <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">JSON Schema</span>
                  <span className="font-mono font-bold text-emerald-400">Conformant</span>
                </div>
              </div>

              <div className="mb-2">
                <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">
                  Structured GWT Response:
                </span>
                <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono text-xs text-indigo-300 whitespace-pre-wrap max-h-96 overflow-y-auto">
                  {JSON.stringify(comparisonResult.modelAResult.data, null, 2)}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-amber-800/60 rounded-xl p-5 text-slate-100 shadow-lg">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                <div className="flex items-center space-x-2">
                  <span className="p-1.5 bg-amber-950 border border-amber-800 text-amber-300 rounded-md text-xs font-bold font-mono">
                    BASELINE
                  </span>
                  <h3 className="text-sm font-bold text-amber-300">Baseline (Unstructured)</h3>
                </div>
                <span className="text-[11px] font-mono text-slate-400">
                  {comparisonResult.baselineResult?.metrics.latencyMs} ms
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs mb-4">
                <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Coverage</span>
                  <span className="font-mono font-bold text-amber-400">
                    {comparisonResult.baselineResult?.metrics.coverageScore}%
                  </span>
                </div>
                <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Test Cases</span>
                  <span className="font-mono font-bold text-white">
                    {comparisonResult.baselineResult?.metrics.totalTestCases}
                  </span>
                </div>
                <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">JSON Schema</span>
                  <span className="font-mono font-bold text-rose-400">None</span>
                </div>
              </div>

              <div className="mb-2">
                <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">
                  Raw Output:
                </span>
                <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono text-xs text-slate-300 whitespace-pre-wrap max-h-96 overflow-y-auto">
                  {comparisonResult.baselineResult?.rawOutput}
                </div>
              </div>
            </div>
          )}

          {/* Panel Right (Model B or Few-Shot) */}
          {comparisonResult.modelBResult ? (
            <div className="bg-slate-900 border border-emerald-700/80 rounded-xl p-5 text-slate-100 shadow-lg">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                <div className="flex items-center space-x-2">
                  <span className="p-1.5 bg-emerald-950 border border-emerald-700 text-emerald-300 rounded-md text-xs font-bold font-mono">
                    MODEL B
                  </span>
                  <h3 className="text-sm font-bold text-emerald-300 capitalize">
                    {comparisonResult.modelBResult.model}
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-slate-400">
                  {comparisonResult.modelBResult.metrics.latencyMs} ms
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs mb-4">
                <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Coverage</span>
                  <span className="font-mono font-bold text-emerald-400">
                    {comparisonResult.modelBResult.metrics.coverageScore}%
                  </span>
                </div>
                <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Test Cases</span>
                  <span className="font-mono font-bold text-white">
                    {comparisonResult.modelBResult.metrics.totalTestCases}
                  </span>
                </div>
                <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">JSON Schema</span>
                  <span className="font-mono font-bold text-emerald-400">Conformant</span>
                </div>
              </div>

              <div className="mb-2">
                <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">
                  Structured GWT Response:
                </span>
                <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono text-xs text-emerald-300 whitespace-pre-wrap max-h-96 overflow-y-auto">
                  {JSON.stringify(comparisonResult.modelBResult.data, null, 2)}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-indigo-700/80 rounded-xl p-5 text-slate-100 shadow-lg">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                <div className="flex items-center space-x-2">
                  <span className="p-1.5 bg-indigo-950 border border-indigo-700 text-indigo-300 rounded-md text-xs font-bold font-mono">
                    PROMPT KIT
                  </span>
                  <h3 className="text-sm font-bold text-indigo-300">Prompt Kit Framework (Few-Shot)</h3>
                </div>
                <span className="text-[11px] font-mono text-slate-400">
                  {comparisonResult.fewShotResult?.metrics.latencyMs} ms
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs mb-4">
                <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Coverage</span>
                  <span className="font-mono font-bold text-emerald-400">
                    {comparisonResult.fewShotResult?.metrics.coverageScore}%
                  </span>
                </div>
                <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Test Cases</span>
                  <span className="font-mono font-bold text-white">
                    {comparisonResult.fewShotResult?.metrics.totalTestCases}
                  </span>
                </div>
                <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">JSON Schema</span>
                  <span className="font-mono font-bold text-emerald-400">Conformant</span>
                </div>
              </div>

              <div className="mb-2">
                <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">
                  Structured GWT Response:
                </span>
                <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono text-xs text-indigo-300 whitespace-pre-wrap max-h-96 overflow-y-auto">
                  {JSON.stringify(comparisonResult.fewShotResult?.data, null, 2)}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

