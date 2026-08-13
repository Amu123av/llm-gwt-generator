import React, { useState } from 'react';
import { TestCase, TestGenerationResponse } from '../types';
import { Check, Copy, Download, Code, LayoutGrid, Table as TableIcon, Filter, Search, Tag, ArrowRight } from 'lucide-react';

interface TestCaseDisplayProps {
  data: TestGenerationResponse | null;
  rawOutput: string;
  mode: string;
  latencyMs?: number;
}

export const TestCaseDisplay: React.FC<TestCaseDisplayProps> = ({ data, rawOutput, mode, latencyMs }) => {
  const [viewMode, setViewMode] = useState<'cards' | 'table' | 'json' | 'gherkin'>('cards');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'normal' | 'boundary' | 'negative'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);

  if (!data || !data.test_cases || data.test_cases.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400">
        <Code className="h-10 w-10 text-slate-600 mx-auto mb-3" />
        <p className="text-sm font-medium text-slate-300">No Generated Test Cases Available</p>
        <p className="text-xs text-slate-400 mt-1">
          Input a requirement above and click "Generate Given-When-Then Test Cases" to run Gemini.
        </p>
      </div>
    );
  }

  const filteredCases = data.test_cases.filter((tc) => {
    const matchesCategory =
      categoryFilter === 'all' || tc.category.toLowerCase().includes(categoryFilter);
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      !query ||
      tc.test_case_id.toLowerCase().includes(query) ||
      tc.given.toLowerCase().includes(query) ||
      tc.when.toLowerCase().includes(query) ||
      tc.then.toLowerCase().includes(query);

    return matchesCategory && matchesSearch;
  });

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJson = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `test-cases-${data.requirement_id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const generateGherkinText = () => {
    let output = `Feature: Verify Requirement ${data.requirement_id} (${data.domain})\n\n`;
    data.test_cases.forEach((tc) => {
      output += `  # Category: ${tc.category} | Traceable: ${tc.traceable_to}\n`;
      output += `  Scenario: ${tc.test_case_id}\n`;
      output += `    Given ${tc.given}\n`;
      output += `    When ${tc.when}\n`;
      output += `    Then ${tc.then}\n\n`;
    });
    return output;
  };

  const getCategoryBadge = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes('boundary')) {
      return (
        <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-purple-950 text-purple-300 border border-purple-800/60">
          BOUNDARY
        </span>
      );
    }
    if (cat.includes('negative') || cat.includes('error')) {
      return (
        <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-rose-950 text-rose-300 border border-rose-800/60">
          NEGATIVE
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/60">
        NORMAL
      </span>
    );
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg text-slate-100">
      {/* Top Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-800 gap-3 mb-4">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-base font-bold text-white">Generated GWT Test Suite</h3>
            <span className="text-xs bg-slate-800 text-slate-300 border border-slate-700 px-2.5 py-0.5 rounded-full font-mono">
              {data.test_cases.length} cases
            </span>
            {latencyMs && (
              <span className="text-[11px] text-slate-400 font-mono">({latencyMs} ms)</span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Requirement ID: <span className="text-slate-200 font-medium">{data.requirement_id}</span> | Domain: <span className="text-slate-200 font-medium">{data.domain}</span>
          </p>
        </div>

        {/* View Switcher & Export */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded text-xs font-medium flex items-center space-x-1 ${
                viewMode === 'cards' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Cards View"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Cards</span>
            </button>

            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded text-xs font-medium flex items-center space-x-1 ${
                viewMode === 'table' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Table View"
            >
              <TableIcon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Table</span>
            </button>

            <button
              onClick={() => setViewMode('gherkin')}
              className={`p-1.5 rounded text-xs font-medium flex items-center space-x-1 ${
                viewMode === 'gherkin' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Gherkin Format"
            >
              <Tag className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Gherkin</span>
            </button>

            <button
              onClick={() => setViewMode('json')}
              className={`p-1.5 rounded text-xs font-medium flex items-center space-x-1 ${
                viewMode === 'json' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Raw JSON Schema"
            >
              <Code className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">JSON</span>
            </button>
          </div>

          <button
            onClick={handleCopyJson}
            className="p-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 flex items-center space-x-1"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            onClick={handleDownloadJson}
            className="p-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 flex items-center space-x-1"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* Filter and Search controls */}
      {(viewMode === 'cards' || viewMode === 'table') && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center space-x-1 text-xs">
            <Filter className="h-3.5 w-3.5 text-slate-400 mr-1" />
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                categoryFilter === 'all'
                  ? 'bg-slate-800 text-white font-medium border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({data.test_cases.length})
            </button>
            <button
              onClick={() => setCategoryFilter('normal')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                categoryFilter === 'normal'
                  ? 'bg-emerald-950 text-emerald-300 font-medium border border-emerald-800'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Normal
            </button>
            <button
              onClick={() => setCategoryFilter('boundary')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                categoryFilter === 'boundary'
                  ? 'bg-purple-950 text-purple-300 font-medium border border-purple-800'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Boundary
            </button>
            <button
              onClick={() => setCategoryFilter('negative')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                categoryFilter === 'negative'
                  ? 'bg-rose-950 text-rose-300 font-medium border border-rose-800'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Negative
            </button>
          </div>

          <div className="relative">
            <Search className="h-3.5 w-3.5 text-slate-500 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search test cases..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-xs text-slate-200 pl-8 pr-3 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 w-full sm:w-48"
            />
          </div>
        </div>
      )}

      {/* Cards View */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 gap-3">
          {filteredCases.map((tc) => (
            <div
              key={tc.test_case_id}
              className="bg-slate-950 border border-slate-800/80 rounded-lg p-4 hover:border-slate-700 transition-all"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/60 mb-3">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs font-bold text-indigo-300">{tc.test_case_id}</span>
                  {getCategoryBadge(tc.category)}
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  Traceable to: <span className="text-slate-300 font-semibold">{tc.traceable_to}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="bg-slate-900/80 p-2.5 rounded-md border border-slate-800">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block mb-1">
                    GIVEN (Precondition)
                  </span>
                  <p className="text-slate-300 leading-relaxed">{tc.given}</p>
                </div>

                <div className="bg-slate-900/80 p-2.5 rounded-md border border-slate-800">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 block mb-1">
                    WHEN (Stimulus)
                  </span>
                  <p className="text-slate-300 leading-relaxed">{tc.when}</p>
                </div>

                <div className="bg-slate-900/80 p-2.5 rounded-md border border-slate-800">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block mb-1">
                    THEN (Expected Result)
                  </span>
                  <p className="text-slate-300 leading-relaxed">{tc.then}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="overflow-x-auto border border-slate-800 rounded-lg">
          <table className="w-full text-xs text-left text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-3 py-2.5 font-bold">ID</th>
                <th className="px-3 py-2.5 font-bold">Category</th>
                <th className="px-3 py-2.5 font-bold">Given</th>
                <th className="px-3 py-2.5 font-bold">When</th>
                <th className="px-3 py-2.5 font-bold">Then</th>
                <th className="px-3 py-2.5 font-bold">Traceable To</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-slate-900/40">
              {filteredCases.map((tc) => (
                <tr key={tc.test_case_id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-3 py-2.5 font-mono font-bold text-indigo-300 whitespace-nowrap">
                    {tc.test_case_id}
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap">{getCategoryBadge(tc.category)}</td>
                  <td className="px-3 py-2.5 max-w-xs">{tc.given}</td>
                  <td className="px-3 py-2.5 max-w-xs">{tc.when}</td>
                  <td className="px-3 py-2.5 max-w-xs">{tc.then}</td>
                  <td className="px-3 py-2.5 font-mono text-slate-400 whitespace-nowrap">{tc.traceable_to}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Gherkin View */}
      {viewMode === 'gherkin' && (
        <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 font-mono text-xs text-emerald-400 overflow-x-auto">
          <pre>{generateGherkinText()}</pre>
        </div>
      )}

      {/* JSON Schema View */}
      {viewMode === 'json' && (
        <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 font-mono text-xs text-indigo-300 overflow-x-auto max-h-96">
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};
