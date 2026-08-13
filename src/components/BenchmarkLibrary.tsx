import React, { useState } from 'react';
import { SAMPLE_REQUIREMENTS } from '../data/sampleRequirements';
import { SampleRequirement } from '../types';
import { BookOpen, Sparkles, Tag, ArrowRight, CheckCircle2 } from 'lucide-react';

interface BenchmarkLibraryProps {
  onSelectAndRun: (sample: SampleRequirement) => void;
}

export const BenchmarkLibrary: React.FC<BenchmarkLibraryProps> = ({ onSelectAndRun }) => {
  const [selectedDomain, setSelectedDomain] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredRequirements = SAMPLE_REQUIREMENTS.filter((req) => {
    const matchesDomain = selectedDomain === 'All' || req.domain === selectedDomain;
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      !query ||
      req.title.toLowerCase().includes(query) ||
      req.requirement_id.toLowerCase().includes(query) ||
      req.requirement_text.toLowerCase().includes(query) ||
      req.tags.some((t) => t.toLowerCase().includes(query));

    return matchesDomain && matchesSearch;
  });

  const domains = ['All', 'Mozilla', 'Bluetooth', 'Banking', 'E-Commerce'];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg text-slate-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3 mb-4">
        <div className="flex items-center space-x-2">
          <BookOpen className="h-5 w-5 text-indigo-400" />
          <div>
            <h2 className="text-base font-bold text-white">Benchmark Dataset Library</h2>
            <p className="text-xs text-slate-400">
              Curated normative specs and real-world Bugzilla reports from the research paper
            </p>
          </div>
        </div>

        {/* Domain Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {domains.map((dom) => (
            <button
              key={dom}
              onClick={() => setSelectedDomain(dom)}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                selectedDomain === dom
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
              }`}
            >
              {dom}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredRequirements.map((req) => (
          <div
            key={req.requirement_id}
            className="bg-slate-950 border border-slate-800/90 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-all group"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-950/80 border border-indigo-800/60 px-2.5 py-0.5 rounded-full">
                  {req.requirement_id}
                </span>
                <span className="text-[11px] text-slate-400 font-medium">
                  {req.source_ref}
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-100 mb-1 group-hover:text-indigo-300 transition-colors">
                {req.title}
              </h3>
              <p className="text-xs text-slate-400 mb-3">{req.description}</p>

              <div className="bg-slate-900 border border-slate-800/80 rounded-lg p-3 font-mono text-xs text-slate-300 mb-3">
                "{req.requirement_text}"
              </div>
            </div>

            <div>
              <div className="flex flex-wrap gap-1 mb-3">
                {req.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center space-x-1 text-[10px] bg-slate-900 text-slate-400 border border-slate-800 px-2 py-0.5 rounded-md"
                  >
                    <Tag className="h-2.5 w-2.5 text-slate-500" />
                    <span>{tag}</span>
                  </span>
                ))}
              </div>

              <button
                onClick={() => onSelectAndRun(req)}
                className="w-full py-2 px-3 bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white text-xs font-semibold rounded-lg flex items-center justify-center space-x-2 transition-all border border-slate-700 hover:border-indigo-500 shadow-sm"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Run GWT Test Generation</span>
                <ArrowRight className="h-3.5 w-3.5 ml-1 opacity-70 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
