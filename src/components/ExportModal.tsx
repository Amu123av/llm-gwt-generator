import React, { useState } from 'react';
import { GenerationResult } from '../types';
import { X, Download, FileSpreadsheet, FileJson, Check, Copy } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  results: GenerationResult[];
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, results }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const generateCSV = () => {
    const headers = [
      'Timestamp',
      'Requirement ID',
      'Model',
      'Provider',
      'Prompt Mode',
      'Temperature',
      'Total Test Cases',
      'Normal Count',
      'Boundary Count',
      'Negative Count',
      'Test Category Coverage (%)',
      'Clause Coverage (%)',
      'Atomicity Heuristic (%)',
      'Traceability (%)',
      'Schema Conformance',
      'Schema Conformance Reason',
      'Latency (ms)',
      'Status',
    ];

    const rows = results.map((r) => [
      `"${r.timestamp}"`,
      `"${r.requirement_id || ''}"`,
      `"${r.model}"`,
      `"${r.provider}"`,
      `"${r.mode}"`,
      r.temperature ?? 0.2,
      r.metrics?.totalTestCases || 0,
      r.metrics?.categoryCount?.normal || 0,
      r.metrics?.categoryCount?.boundary || 0,
      r.metrics?.categoryCount?.negative || 0,
      r.metrics?.testCategoryCoverage ?? r.metrics?.coverageScore ?? 0,
      r.metrics?.requirementClauseCoverage ?? 0,
      r.metrics?.atomicityHeuristicScore ?? 0,
      r.metrics?.traceabilityScore ?? 0,
      r.metrics?.schemaConformance ? 'PASS' : 'FAIL',
      `"${(r.metrics?.schemaConformanceReason || '').replace(/"/g, '""')}"`,
      r.metrics?.latencyMs || 0,
      r.success ? 'SUCCESS' : 'FAILED',
    ]);

    return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
  };

  const handleDownloadCSV = () => {
    const csvContent = generateCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `test-generation-research-results-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadJSON = () => {
    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `test-generation-research-results-${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyCSV = () => {
    navigator.clipboard.writeText(generateCSV());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-xl w-full p-6 shadow-2xl text-slate-100">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div className="flex items-center space-x-2">
            <Download className="h-5 w-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">Export Research Experiment Data</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-xs text-slate-300 mb-4 leading-relaxed">
          Export recorded experiment execution parameters and quantitative metrics for empirical analysis, paper plots, and baseline comparison tables.
        </p>

        <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg mb-4 text-xs font-mono text-slate-400">
          <div className="flex justify-between items-center mb-1">
            <span className="text-slate-300 font-bold">Captured Experiment Runs:</span>
            <span className="text-indigo-400 font-bold">{results.length} record(s)</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Includes TCC (%), RCC (%), Atomicity Heuristic (%), Traceability (%), Schema Conformance, Latency (ms), and Prompt Modes.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <button
            onClick={handleDownloadCSV}
            disabled={results.length === 0}
            className="flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium py-2.5 px-4 rounded-lg text-xs transition"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Download CSV Dataset</span>
          </button>

          <button
            onClick={handleDownloadJSON}
            disabled={results.length === 0}
            className="flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium py-2.5 px-4 rounded-lg text-xs transition"
          >
            <FileJson className="h-4 w-4" />
            <span>Download JSON Raw Logs</span>
          </button>
        </div>

        <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
          <button
            onClick={handleCopyCSV}
            disabled={results.length === 0}
            className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-slate-200"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? 'Copied CSV to Clipboard' : 'Copy CSV to Clipboard'}</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
