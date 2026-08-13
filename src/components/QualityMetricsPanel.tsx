import React from 'react';
import { GenerationMetrics } from '../types';
import { CheckCircle2, AlertTriangle, ShieldCheck, Zap, BarChart2, PieChart, Check, XCircle } from 'lucide-react';

interface QualityMetricsPanelProps {
  metrics: GenerationMetrics | null;
  mode: string;
}

export const QualityMetricsPanel: React.FC<QualityMetricsPanelProps> = ({ metrics, mode }) => {
  if (!metrics) {
    return null;
  }

  const {
    totalTestCases,
    categoryCount,
    hasNormal,
    hasBoundary,
    hasNegative,
    testCategoryCoverage,
    totalRequirementClauses,
    coveredRequirementClauses,
    requirementClauseCoverage,
    atomicCount,
    nonAtomicCount,
    atomicityHeuristicScore,
    traceableCount,
    traceabilityScore,
    schemaConformance,
    schemaConformanceReason,
    latencyMs,
    error,
  } = metrics;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg text-slate-100">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
        <div className="flex items-center space-x-2">
          <BarChart2 className="h-5 w-5 text-indigo-400" />
          <h3 className="text-base font-bold text-white">Empirical Research Metrics</h3>
        </div>
        <span className="text-xs px-2.5 py-0.5 rounded-full font-mono font-medium bg-slate-800 text-slate-300 border border-slate-700">
          Mode: {mode.toUpperCase()}
        </span>
      </div>

      {error && (
        <div className="bg-rose-950/80 border border-rose-800 rounded-lg p-3 mb-4 text-xs text-rose-200 flex items-start space-x-2">
          <XCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Execution Error:</span> {error}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {/* Test Category Coverage (TCC %) */}
        <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg">
          <div className="text-[11px] font-medium text-slate-400 mb-1 flex justify-between items-center">
            <span>Test Category Coverage (TCC)</span>
            <PieChart className="h-3.5 w-3.5 text-indigo-400" />
          </div>
          <div className="text-xl font-extrabold text-white font-mono">
            {testCategoryCoverage}%
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                testCategoryCoverage >= 90
                  ? 'bg-emerald-500'
                  : testCategoryCoverage >= 60
                  ? 'bg-amber-500'
                  : 'bg-rose-500'
              }`}
              style={{ width: `${testCategoryCoverage}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">Normal, Boundary & Negative</span>
        </div>

        {/* Requirement Clause Coverage (RCC %) */}
        <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg">
          <div className="text-[11px] font-medium text-slate-400 mb-1 flex justify-between items-center">
            <span>Clause Coverage (RCC)</span>
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-extrabold text-emerald-400 font-mono">
            {requirementClauseCoverage}%
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">
            {coveredRequirementClauses}/{totalRequirementClauses} clauses verified
          </span>
        </div>

        {/* Schema Conformance */}
        <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg">
          <div className="text-[11px] font-medium text-slate-400 mb-1">Schema Conformance</div>
          <div className="flex items-center space-x-1.5 mt-1">
            {schemaConformance ? (
              <>
                <Check className="h-4 w-4 text-emerald-400" />
                <span className="text-sm font-bold text-emerald-400 font-mono">PASS</span>
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4 text-rose-400" />
                <span className="text-sm font-bold text-rose-400 font-mono">FAIL</span>
              </>
            )}
          </div>
          <span className="text-[10px] text-slate-400 block mt-1 truncate" title={schemaConformanceReason}>
            {schemaConformance ? 'Strict JSON GWT Schema' : schemaConformanceReason || 'Unstructured / Failed'}
          </span>
        </div>

        {/* Latency */}
        <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg">
          <div className="text-[11px] font-medium text-slate-400 mb-1 flex items-center justify-between">
            <span>Latency</span>
            <Zap className="h-3.5 w-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-extrabold text-white font-mono">
            {latencyMs} <span className="text-xs text-slate-400 font-normal">ms</span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">Server execution time</span>
        </div>
      </div>

      {/* Category Breakdown & Atomicity / Traceability */}
      <div className="bg-slate-950 border border-slate-800 rounded-lg p-3.5">
        <div className="flex justify-between items-center text-xs font-semibold text-slate-300 mb-2">
          <span>Test Category Distribution</span>
          <span className="text-slate-400 font-normal text-[11px]">Total: {totalTestCases} Test Cases</span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="bg-slate-900 border border-slate-800 p-2 rounded-md">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <span className={`h-2 w-2 rounded-full ${hasNormal ? 'bg-emerald-400' : 'bg-slate-600'}`} />
              <span className="text-slate-300 font-medium">Normal</span>
            </div>
            <span className="font-mono font-bold text-emerald-400 text-sm">{categoryCount.normal}</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-2 rounded-md">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <span className={`h-2 w-2 rounded-full ${hasBoundary ? 'bg-purple-400' : 'bg-slate-600'}`} />
              <span className="text-slate-300 font-medium">Boundary</span>
            </div>
            <span className="font-mono font-bold text-purple-400 text-sm">{categoryCount.boundary}</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-2 rounded-md">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <span className={`h-2 w-2 rounded-full ${hasNegative ? 'bg-rose-400' : 'bg-slate-600'}`} />
              <span className="text-slate-300 font-medium">Negative</span>
            </div>
            <span className="font-mono font-bold text-rose-400 text-sm">{categoryCount.negative}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] text-slate-300 mt-3 pt-3 border-t border-slate-800">
          <div className="flex items-center justify-between bg-slate-900 px-3 py-1.5 rounded border border-slate-800">
            <div className="flex items-center space-x-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-indigo-400" />
              <span className="font-medium">Traceability:</span>
            </div>
            <span className="font-mono font-bold text-indigo-300">
              {traceabilityScore}% ({traceableCount}/{totalTestCases})
            </span>
          </div>

          <div className="flex items-center justify-between bg-slate-900 px-3 py-1.5 rounded border border-slate-800">
            <div className="flex items-center space-x-1.5">
              <BarChart2 className="h-3.5 w-3.5 text-amber-400" />
              <span className="font-medium">Atomicity Heuristic:</span>
            </div>
            <span className="font-mono font-bold text-amber-300">
              {atomicityHeuristicScore}% ({atomicCount} atomic / {nonAtomicCount} compound)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

