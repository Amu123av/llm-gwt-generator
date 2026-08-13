import React, { useState } from 'react';
import { SAMPLE_REQUIREMENTS } from '../data/sampleRequirements';
import { GenerationResult } from '../types';
import { Layers, Play, RefreshCw, CheckCircle2, AlertTriangle, BarChart3, ArrowRight } from 'lucide-react';

export const BatchSimulator: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState<string>('gemini-3.6-flash');
  const [batchResults, setBatchResults] = useState<{ [reqId: string]: GenerationResult }>({});
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: SAMPLE_REQUIREMENTS.length });
  const [activeReqResult, setActiveReqResult] = useState<GenerationResult | null>(null);

  const handleRunBatch = async () => {
    setIsRunning(true);
    setBatchResults({});
    setProgress({ current: 0, total: SAMPLE_REQUIREMENTS.length });

    const newResults: { [reqId: string]: GenerationResult } = {};

    for (let i = 0; i < SAMPLE_REQUIREMENTS.length; i++) {
      const req = SAMPLE_REQUIREMENTS[i];
      try {
        const response = await fetch('/api/generate-test-cases', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            requirement_id: req.requirement_id,
            domain: req.domain,
            source_ref: req.source_ref,
            requirement_text: req.requirement_text,
            prompt_mode: 'few-shot',
            model: selectedModel,
            temperature: 0.2,
          }),
        });

        if (response.ok) {
          const resData: GenerationResult = await response.json();
          newResults[req.requirement_id] = resData;
        }
      } catch (err) {
        console.error(`Error in batch requirement ${req.requirement_id}:`, err);
      }

      setProgress({ current: i + 1, total: SAMPLE_REQUIREMENTS.length });
      setBatchResults({ ...newResults });
    }

    setIsRunning(false);
  };


  const resultsList: GenerationResult[] = Object.values(batchResults);
  const totalCases = resultsList.reduce((acc: number, r: GenerationResult) => acc + (r.metrics?.totalTestCases || 0), 0);
  const avgCoverage =
    resultsList.length > 0
      ? Math.round(resultsList.reduce((acc: number, r: GenerationResult) => acc + (r.metrics?.coverageScore || 0), 0) / resultsList.length)
      : 0;
  const conformantCount = resultsList.filter((r: GenerationResult) => r.metrics?.schemaConformance).length;
  const schemaConformanceRate =
    resultsList.length > 0 ? Math.round((conformantCount / resultsList.length) * 100) : 0;
  const avgLatency =
    resultsList.length > 0
      ? Math.round(resultsList.reduce((acc: number, r: GenerationResult) => acc + (r.metrics?.latencyMs || 0), 0) / resultsList.length)
      : 0;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg text-slate-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3 mb-4">
        <div className="flex items-center space-x-2">
          <Layers className="h-5 w-5 text-indigo-400 shrink-0" />
          <div>
            <h2 className="text-base font-bold text-white">Batch Experiment Evaluation Suite</h2>
            <p className="text-xs text-slate-400">
              Run automated Given-When-Then generation across all benchmark requirements
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            disabled={isRunning}
            className="bg-slate-950 border border-slate-800 text-xs text-indigo-300 font-semibold rounded-xl px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            <optgroup label="Google AI (Gemini)">
              <option value="gemini-3.6-flash">Google Gemini 3.6 Flash</option>
              <option value="gemini-3.1-pro-preview">Google Gemini 3.1 Pro</option>
            </optgroup>
            <optgroup label="OpenAI (ChatGPT)">
              <option value="gpt-4o">ChatGPT (GPT-4o)</option>
              <option value="gpt-4o-mini">ChatGPT (GPT-4o Mini)</option>
              <option value="o3-mini">ChatGPT (o3-mini)</option>
            </optgroup>
            <optgroup label="Anthropic (Claude)">
              <option value="claude-3-5-sonnet">Claude 3.5 Sonnet</option>
              <option value="claude-3-5-haiku">Claude 3.5 Haiku</option>
            </optgroup>
            <optgroup label="Perplexity AI">
              <option value="sonar-reasoning">Perplexity Sonar Reasoning</option>
              <option value="sonar">Perplexity Sonar</option>
            </optgroup>
            <optgroup label="xAI (Grok)">
              <option value="grok-3">xAI Grok-3</option>
              <option value="grok-2">xAI Grok-2</option>
            </optgroup>
          </select>

          <button
            onClick={handleRunBatch}
            disabled={isRunning}
            className="py-2 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl flex items-center space-x-2 transition-all shadow-md shadow-indigo-600/30 disabled:opacity-50 shrink-0"
          >
            {isRunning ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>
                  Processing ({progress.current}/{progress.total})...
                </span>
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                <span>Run Dataset Batch Experiment</span>
              </>
            )}
          </button>
        </div>
      </div>


      {/* Progress Bar */}
      {isRunning && (
        <div className="mb-5 bg-slate-950 p-3 rounded-lg border border-slate-800">
          <div className="flex justify-between text-xs text-slate-300 mb-1">
            <span>Evaluating Benchmark Dataset Requirements</span>
            <span className="font-mono font-bold">
              {progress.current} of {progress.total}
            </span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-indigo-500 h-full transition-all duration-300"
              style={{ width: `${(progress.current / progress.total) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Summary KPI Cards */}
      {resultsList.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-center">
            <span className="text-[11px] text-slate-400 block mb-1">Total Generated Cases</span>
            <span className="text-xl font-extrabold text-indigo-400 font-mono">{totalCases}</span>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-center">
            <span className="text-[11px] text-slate-400 block mb-1">Avg Requirement Coverage</span>
            <span className="text-xl font-extrabold text-emerald-400 font-mono">{avgCoverage}%</span>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-center">
            <span className="text-[11px] text-slate-400 block mb-1">Schema Conformance Rate</span>
            <span className="text-xl font-extrabold text-purple-400 font-mono">{schemaConformanceRate}%</span>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-center">
            <span className="text-[11px] text-slate-400 block mb-1">Avg Latency / Req</span>
            <span className="text-xl font-extrabold text-amber-400 font-mono">{avgLatency} ms</span>
          </div>
        </div>
      )}

      {/* Batch Results Table */}
      {resultsList.length > 0 ? (
        <div className="overflow-x-auto border border-slate-800 rounded-lg">
          <table className="w-full text-xs text-left text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-3 py-2.5 font-bold">Req ID</th>
                <th className="px-3 py-2.5 font-bold">Domain</th>
                <th className="px-3 py-2.5 font-bold">Test Cases</th>
                <th className="px-3 py-2.5 font-bold">Coverage (RC)</th>
                <th className="px-3 py-2.5 font-bold">Normal</th>
                <th className="px-3 py-2.5 font-bold">Boundary</th>
                <th className="px-3 py-2.5 font-bold">Negative</th>
                <th className="px-3 py-2.5 font-bold">Latency</th>
                <th className="px-3 py-2.5 font-bold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-slate-900/40">
              {SAMPLE_REQUIREMENTS.map((req) => {
                const res = batchResults[req.requirement_id];
                if (!res) {
                  return (
                    <tr key={req.requirement_id} className="text-slate-500">
                      <td className="px-3 py-2 font-mono">{req.requirement_id}</td>
                      <td className="px-3 py-2">{req.domain}</td>
                      <td className="px-3 py-2 italic" colSpan={7}>
                        Pending execution...
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr key={req.requirement_id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-3 py-2.5 font-mono font-bold text-indigo-300">
                      {req.requirement_id}
                    </td>
                    <td className="px-3 py-2.5">{req.domain}</td>
                    <td className="px-3 py-2.5 font-mono font-bold">{res.metrics.totalTestCases}</td>
                    <td className="px-3 py-2.5 font-mono font-bold text-emerald-400">
                      {res.metrics.coverageScore}%
                    </td>
                    <td className="px-3 py-2.5 font-mono text-emerald-300">
                      {res.metrics.categoryCount.normal}
                    </td>
                    <td className="px-3 py-2.5 font-mono text-purple-300">
                      {res.metrics.categoryCount.boundary}
                    </td>
                    <td className="px-3 py-2.5 font-mono text-rose-300">
                      {res.metrics.categoryCount.negative}
                    </td>
                    <td className="px-3 py-2.5 font-mono text-slate-400">{res.metrics.latencyMs} ms</td>
                    <td className="px-3 py-2.5">
                      <button
                        onClick={() => setActiveReqResult(res)}
                        className="text-xs text-indigo-400 hover:text-indigo-300 underline font-medium"
                      >
                        View Output
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8 text-slate-500 border border-slate-800/80 rounded-lg">
          <BarChart3 className="h-8 w-8 mx-auto mb-2 text-slate-600" />
          <p className="text-xs">Click "Run Dataset Batch Experiment" to evaluate Gemini across all sample requirements.</p>
        </div>
      )}

      {/* Detail Modal for Selected Batch Requirement */}
      {activeReqResult && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800 mb-3">
              <h3 className="text-sm font-bold text-white">
                Batch Result Details: {activeReqResult.data?.requirement_id}
              </h3>
              <button
                onClick={() => setActiveReqResult(null)}
                className="text-slate-400 hover:text-white text-xs font-semibold px-2 py-1 rounded bg-slate-800"
              >
                Close
              </button>
            </div>
            <pre className="bg-slate-950 p-4 rounded-lg text-xs font-mono text-indigo-300 overflow-x-auto">
              {JSON.stringify(activeReqResult.data, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
