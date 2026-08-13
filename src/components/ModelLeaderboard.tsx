import React, { useState } from 'react';
import { SAMPLE_REQUIREMENTS } from '../data/sampleRequirements';
import { SUPPORTED_MODELS } from '../data/prompts';
import { GenerationResult, RequirementInput } from '../types';
import { Trophy, Zap, ShieldCheck, Play, RefreshCw, BarChart2, Cpu, CheckCircle2, AlertCircle, Eye, Award } from 'lucide-react';

interface ModelLeaderboardProps {
  apiKeys?: Record<string, string>;
}

export const ModelLeaderboard: React.FC<ModelLeaderboardProps> = ({ apiKeys = {} }) => {
  const [selectedReq, setSelectedReq] = useState<RequirementInput>(SAMPLE_REQUIREMENTS[0]);
  const [customReqText, setCustomReqText] = useState<string>(SAMPLE_REQUIREMENTS[0].requirement_text);
  const [benchmarkResults, setBenchmarkResults] = useState<{ [modelId: string]: GenerationResult }>({});
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: SUPPORTED_MODELS.length });
  const [activeInspectModel, setActiveInspectModel] = useState<GenerationResult | null>(null);

  const handleSelectReq = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const found = SAMPLE_REQUIREMENTS.find((r) => r.requirement_id === e.target.value);
    if (found) {
      setSelectedReq(found);
      setCustomReqText(found.requirement_text);
    }
  };

  const handleRunAllModelBenchmark = async () => {
    setIsRunning(true);
    setBenchmarkResults({});
    setProgress({ current: 0, total: SUPPORTED_MODELS.length });

    const newResults: { [modelId: string]: GenerationResult } = {};

    for (let i = 0; i < SUPPORTED_MODELS.length; i++) {
      const model = SUPPORTED_MODELS[i];
      try {
        const response = await fetch('/api/generate-test-cases', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            requirement_id: selectedReq.requirement_id,
            domain: selectedReq.domain,
            source_ref: selectedReq.source_ref,
            requirement_text: customReqText,
            prompt_mode: 'few-shot',
            model: model.id,
            temperature: 0.2,
            user_api_keys: apiKeys,
          }),
        });

        if (response.ok) {
          const resData: GenerationResult = await response.json();
          newResults[model.id] = resData;
        }
      } catch (err) {
        console.error(`Error benchmarking model ${model.id}:`, err);
      }

      setProgress({ current: i + 1, total: SUPPORTED_MODELS.length });
      setBenchmarkResults({ ...newResults });
    }

    setIsRunning(false);
  };

  const modelResultsList = SUPPORTED_MODELS.map((m) => {
    const res = benchmarkResults[m.id];
    return {
      modelInfo: m,
      result: res || null,
      coverage: res?.metrics?.coverageScore || 0,
      totalCases: res?.metrics?.totalTestCases || 0,
      normal: res?.metrics?.categoryCount?.normal || 0,
      boundary: res?.metrics?.categoryCount?.boundary || 0,
      negative: res?.metrics?.categoryCount?.negative || 0,
      latency: res?.metrics?.latencyMs || 0,
      schema: res?.metrics?.schemaConformance || false,
    };
  });

  // Sort by coverage score descending, then boundary cases descending
  const rankedList = [...modelResultsList].sort((a, b) => {
    if (b.coverage !== a.coverage) return b.coverage - a.coverage;
    if (b.boundary !== a.boundary) return b.boundary - a.boundary;
    return a.latency - b.latency;
  });

  const bestCoverageScore = Math.max(...rankedList.map((r) => r.coverage), 0);
  const fastestLatency = Math.min(
    ...rankedList.filter((r) => r.latency > 0).map((r) => r.latency),
    99999
  );
  const bestBoundaryCount = Math.max(...rankedList.map((r) => r.boundary), 0);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg text-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3 mb-4">
          <div className="flex items-center space-x-2">
            <Trophy className="h-5 w-5 text-amber-400 shrink-0" />
            <div>
              <h2 className="text-base font-bold text-white">
                Multi-LLM Model Accuracy & Coverage Benchmark
              </h2>
              <p className="text-xs text-slate-400">
                Evaluate Google Gemini, OpenAI ChatGPT, Anthropic Claude, Perplexity, and xAI Grok on identical specs
              </p>
            </div>
          </div>

          <button
            onClick={handleRunAllModelBenchmark}
            disabled={isRunning}
            className="py-2.5 px-5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-xs rounded-xl flex items-center space-x-2 transition-all shadow-md shadow-indigo-600/30 disabled:opacity-50 shrink-0"
          >
            {isRunning ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>
                  Benchmarking Models ({progress.current}/{progress.total})...
                </span>
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                <span>Run Full Multi-Model Benchmark</span>
              </>
            )}
          </button>
        </div>

        {/* Input Selector */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Select Benchmark Spec</label>
            <select
              value={selectedReq.requirement_id}
              onChange={handleSelectReq}
              className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 font-medium rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              {SAMPLE_REQUIREMENTS.map((req) => (
                <option key={req.requirement_id} value={req.requirement_id}>
                  [{req.domain}] {req.title}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-400 mb-1">Requirement Content</label>
            <textarea
              rows={2}
              value={customReqText}
              onChange={(e) => setCustomReqText(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs font-mono text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
            />
          </div>
        </div>

        {/* Progress Bar */}
        {isRunning && (
          <div className="mt-4 bg-slate-950 p-3 rounded-lg border border-slate-800">
            <div className="flex justify-between text-xs text-slate-300 mb-1">
              <span className="font-medium">Evaluating LLM Architectures Side-by-Side</span>
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
      </div>

      {/* Leaderboard Matrix Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div className="flex items-center space-x-2">
            <Award className="h-5 w-5 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">Model Performance & Accuracy Ranking</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {Object.keys(benchmarkResults).length} / {SUPPORTED_MODELS.length} Models Evaluated
          </span>
        </div>

        <div className="overflow-x-auto border border-slate-800 rounded-lg">
          <table className="w-full text-xs text-left text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-3 py-3 font-bold text-center">Rank</th>
                <th className="px-3 py-3 font-bold">Model Engine</th>
                <th className="px-3 py-3 font-bold">Provider</th>
                <th className="px-3 py-3 font-bold">Coverage (RC %)</th>
                <th className="px-3 py-3 font-bold">Normal</th>
                <th className="px-3 py-3 font-bold">Boundary</th>
                <th className="px-3 py-3 font-bold">Negative</th>
                <th className="px-3 py-3 font-bold">Schema</th>
                <th className="px-3 py-3 font-bold">Latency</th>
                <th className="px-3 py-3 font-bold">Highlights</th>
                <th className="px-3 py-3 font-bold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-slate-900/40">
              {rankedList.map((item, idx) => {
                const isTested = item.result !== null;
                const isBestCoverage = isTested && item.coverage === bestCoverageScore && bestCoverageScore > 0;
                const isFastest = isTested && item.latency === fastestLatency && fastestLatency < 99999;
                const isBestBoundary = isTested && item.boundary === bestBoundaryCount && bestBoundaryCount > 0;

                return (
                  <tr
                    key={item.modelInfo.id}
                    className={`hover:bg-slate-800/40 transition-colors ${
                      isBestCoverage ? 'bg-indigo-950/20' : ''
                    }`}
                  >
                    {/* Rank */}
                    <td className="px-3 py-3 text-center font-mono font-bold">
                      {isTested ? (
                        idx === 0 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs">
                            🥇
                          </span>
                        ) : idx === 1 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-400/20 text-slate-300 border border-slate-400/40 text-xs">
                            🥈
                          </span>
                        ) : idx === 2 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-700/20 text-amber-500 border border-amber-700/40 text-xs">
                            🥉
                          </span>
                        ) : (
                          <span className="text-slate-500">#{idx + 1}</span>
                        )
                      ) : (
                        <span className="text-slate-600">-</span>
                      )}
                    </td>

                    {/* Model Engine */}
                    <td className="px-3 py-3 font-semibold text-white">
                      <div>
                        <span>{item.modelInfo.name}</span>
                        <span className="block text-[10px] text-slate-400 font-normal">
                          {item.modelInfo.id}
                        </span>
                      </div>
                    </td>

                    {/* Provider Badge */}
                    <td className="px-3 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded border ${item.modelInfo.badgeColor}`}
                      >
                        {item.modelInfo.providerName}
                      </span>
                    </td>

                    {/* Coverage */}
                    <td className="px-3 py-3 font-mono font-bold">
                      {isTested ? (
                        <div className="flex items-center space-x-1.5">
                          <span
                            className={
                              item.coverage >= 90
                                ? 'text-emerald-400 text-sm'
                                : item.coverage >= 70
                                ? 'text-amber-400 text-sm'
                                : 'text-rose-400 text-sm'
                            }
                          >
                            {item.coverage}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-600 italic">Pending</span>
                      )}
                    </td>

                    {/* Counts */}
                    <td className="px-3 py-3 font-mono text-emerald-300">
                      {isTested ? item.normal : '-'}
                    </td>
                    <td className="px-3 py-3 font-mono text-purple-300">
                      {isTested ? item.boundary : '-'}
                    </td>
                    <td className="px-3 py-3 font-mono text-rose-300">
                      {isTested ? item.negative : '-'}
                    </td>

                    {/* Schema */}
                    <td className="px-3 py-3 font-mono">
                      {isTested ? (
                        item.schema ? (
                          <span className="text-emerald-400 flex items-center space-x-1">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>100%</span>
                          </span>
                        ) : (
                          <span className="text-rose-400 flex items-center space-x-1">
                            <AlertCircle className="h-3.5 w-3.5" />
                            <span>Failed</span>
                          </span>
                        )
                      ) : (
                        '-'
                      )}
                    </td>

                    {/* Latency */}
                    <td className="px-3 py-3 font-mono text-slate-400">
                      {isTested ? `${item.latency} ms` : '-'}
                    </td>

                    {/* Highlights */}
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap gap-1">
                        {isBestCoverage && (
                          <span className="px-1.5 py-0.5 bg-amber-950 text-amber-300 border border-amber-800 rounded text-[9px] font-bold">
                            🏆 Top Coverage
                          </span>
                        )}
                        {isFastest && (
                          <span className="px-1.5 py-0.5 bg-cyan-950 text-cyan-300 border border-cyan-800 rounded text-[9px] font-bold">
                            ⚡ Fast Response
                          </span>
                        )}
                        {isBestBoundary && (
                          <span className="px-1.5 py-0.5 bg-purple-950 text-purple-300 border border-purple-800 rounded text-[9px] font-bold">
                            🛡️ Boundary Leader
                          </span>
                        )}
                        {!isTested && (
                          <span className="text-slate-600 text-[10px]">Ready to evaluate</span>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-3 py-3 text-center">
                      {isTested ? (
                        <button
                          onClick={() => setActiveInspectModel(item.result)}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-indigo-200 text-[11px] font-medium rounded flex items-center space-x-1 mx-auto transition-all"
                        >
                          <Eye className="h-3 w-3" />
                          <span>View GWT</span>
                        </button>
                      ) : (
                        <span className="text-slate-600 text-[10px]">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Model Result Inspection Modal */}
      {activeInspectModel && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 max-w-3xl w-full max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center space-x-2">
                <Cpu className="h-5 w-5 text-indigo-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Model Output Details: {activeInspectModel.model}
                </h3>
              </div>
              <button
                onClick={() => setActiveInspectModel(null)}
                className="text-slate-400 hover:text-white text-xs font-semibold px-2.5 py-1 rounded bg-slate-800"
              >
                Close
              </button>
            </div>

            <div className="space-y-4">
              {/* Metrics Summary Strip */}
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block mb-0.5">Coverage</span>
                  <span className="font-mono font-bold text-emerald-400">
                    {activeInspectModel.metrics.coverageScore}%
                  </span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block mb-0.5">Total Cases</span>
                  <span className="font-mono font-bold text-white">
                    {activeInspectModel.metrics.totalTestCases}
                  </span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block mb-0.5">Latency</span>
                  <span className="font-mono font-bold text-amber-400">
                    {activeInspectModel.metrics.latencyMs} ms
                  </span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block mb-0.5">Schema</span>
                  <span className="font-mono font-bold text-indigo-400">
                    {activeInspectModel.metrics.schemaConformance ? 'Conformant' : 'Non-Standard'}
                  </span>
                </div>
              </div>

              {/* JSON Output Display */}
              <div>
                <span className="text-xs font-semibold text-slate-300 block mb-1">
                  Generated Given-When-Then Response JSON:
                </span>
                <pre className="bg-slate-950 p-4 rounded-lg text-xs font-mono text-indigo-300 border border-slate-800 overflow-x-auto max-h-96">
                  {JSON.stringify(activeInspectModel.data, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
