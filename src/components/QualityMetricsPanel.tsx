import React from 'react';
import { GenerationMetrics } from '../types';
import { CheckCircle2, AlertTriangle, ShieldCheck, Zap, BarChart2, PieChart } from 'lucide-react';

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
    coverageScore,
    atomicityCheck,
    traceabilityValid,
    schemaConformance,
    latencyMs,
  } = metrics;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg text-slate-100">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
        <div className="flex items-center space-x-2">
          <BarChart2 className="h-5 w-5 text-indigo-400" />
          <h3 className="text-base font-bold text-white">Test Quality Evaluation Metrics</h3>
        </div>
        <span className="text-xs px-2.5 py-0.5 rounded-full font-mono font-medium bg-slate-800 text-slate-300 border border-slate-700">
          Mode: {mode.toUpperCase()}
        </span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {/* Requirement Coverage Score */}
        <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg">
          <div className="text-[11px] font-medium text-slate-400 mb-1 flex justify-between items-center">
            <span>Requirement Coverage (RC)</span>
            <PieChart className="h-3.5 w-3.5 text-indigo-400" />
          </div>
          <div className="text-xl font-extrabold text-white font-mono">
            {coverageScore}%
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                coverageScore >= 90
                  ? 'bg-emerald-500'
                  : coverageScore >= 60
                  ? 'bg-amber-500'
                  : 'bg-rose-500'
              }`}
              style={{ width: `${coverageScore}%` }}
            />
          </div>
        </div>

        {/* Total Test Cases */}
        <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg">
          <div className="text-[11px] font-medium text-slate-400 mb-1">Total Test Cases</div>
          <div className="text-xl font-extrabold text-indigo-400 font-mono">
            {totalTestCases}
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">Generated test cases</span>
        </div>

        {/* Schema Conformance */}
        <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg">
          <div className="text-[11px] font-medium text-slate-400 mb-1">Schema Conformance</div>
          <div className="flex items-center space-x-1.5 mt-1">
            {schemaConformance ? (
              <>
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                <span className="text-sm font-bold text-emerald-300">Conformant</span>
              </>
            ) : (
              <>
                <AlertTriangle className="h-5 w-5 text-amber-400" />
                <span className="text-sm font-bold text-amber-300">Unstructured</span>
              </>
            )}
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">
            {schemaConformance ? 'Validated JSON Schema' : 'Non-schema raw format'}
          </span>
        </div>

        {/* Latency */}
        <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg">
          <div className="text-[11px] font-medium text-slate-400 mb-1 flex items-center justify-between">
            <span>Generation Latency</span>
            <Zap className="h-3.5 w-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-extrabold text-white font-mono">
            {latencyMs} <span className="text-xs text-slate-400 font-normal">ms</span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">Server response time</span>
        </div>
      </div>

      {/* Category Breakdown Progress */}
      <div className="bg-slate-950 border border-slate-800 rounded-lg p-3.5">
        <div className="flex justify-between items-center text-xs font-semibold text-slate-300 mb-2">
          <span>Category Distribution Breakdown</span>
          <span className="text-slate-400 font-normal text-[11px]">Paper Criteria Coverage</span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="bg-slate-900 border border-slate-800 p-2 rounded-md">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <span className={`h-2 w-2 rounded-full ${hasNormal ? 'bg-emerald-400' : 'bg-slate-600'}`} />
              <span className="text-slate-300 font-medium">Normal Case</span>
            </div>
            <span className="font-mono font-bold text-emerald-400 text-sm">{categoryCount.normal}</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-2 rounded-md">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <span className={`h-2 w-2 rounded-full ${hasBoundary ? 'bg-purple-400' : 'bg-slate-600'}`} />
              <span className="text-slate-300 font-medium">Boundary Case</span>
            </div>
            <span className="font-mono font-bold text-purple-400 text-sm">{categoryCount.boundary}</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-2 rounded-md">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <span className={`h-2 w-2 rounded-full ${hasNegative ? 'bg-rose-400' : 'bg-slate-600'}`} />
              <span className="text-slate-300 font-medium">Negative Case</span>
            </div>
            <span className="font-mono font-bold text-rose-400 text-sm">{categoryCount.negative}</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-800/80">
          <div className="flex items-center space-x-1">
            <ShieldCheck className="h-3.5 w-3.5 text-indigo-400" />
            <span>Traceability: {traceabilityValid ? 'Validated' : 'Discrepancy'}</span>
          </div>
          <div className="flex items-center space-x-1">
            <span>Atomicity: {atomicityCheck === 'passed' ? 'Pass (GWT Single Action)' : 'Warning'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
