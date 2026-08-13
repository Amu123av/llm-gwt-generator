import React from 'react';
import { Sparkles, FileCode2, Layers, BookOpen, Cpu, BarChart3, TestTube2, Trophy, Key, Download } from 'lucide-react';

interface HeaderProps {
  activeTab: 'generator' | 'comparison' | 'inspector' | 'benchmark' | 'batch' | 'leaderboard';
  setActiveTab: (tab: 'generator' | 'comparison' | 'inspector' | 'benchmark' | 'batch' | 'leaderboard') => void;
  onOpenApiKeys: () => void;
  onOpenExportModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenApiKeys,
  onOpenExportModal,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-600 rounded-lg text-white shadow-md shadow-indigo-500/20">
              <TestTube2 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-100">
                  SpecTest Studio
                </h1>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-indigo-950 text-indigo-300 border border-indigo-800/80 rounded">
                  RESEARCH SUITE
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                LLM Specification Test Generator & Empirical Model Benchmark
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center space-x-1 sm:space-x-1.5 overflow-x-auto py-1">
            <button
              onClick={() => setActiveTab('generator')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === 'generator'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Workbench</span>
            </button>

            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === 'leaderboard'
                  ? 'bg-amber-600 text-white shadow'
                  : 'text-amber-300/90 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Trophy className="h-3.5 w-3.5 text-amber-300" />
              <span>Model Leaderboard</span>
            </button>

            <button
              onClick={() => setActiveTab('comparison')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === 'comparison'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <BarChart3 className="h-3.5 w-3.5" />
              <span>Side-by-Side</span>
            </button>

            <button
              onClick={() => setActiveTab('inspector')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === 'inspector'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileCode2 className="h-3.5 w-3.5" />
              <span>Prompt Kit</span>
            </button>

            <button
              onClick={() => setActiveTab('benchmark')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === 'benchmark'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>Dataset</span>
            </button>

            <button
              onClick={() => setActiveTab('batch')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === 'batch'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Batch Experiment</span>
            </button>
          </nav>

          {/* Action Tools */}
          <div className="hidden lg:flex items-center space-x-2">
            <button
              onClick={onOpenApiKeys}
              className="flex items-center space-x-1 text-xs bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-300 transition"
              title="Configure Model Provider API Keys"
            >
              <Key className="h-3.5 w-3.5 text-amber-400" />
              <span className="font-medium">API Keys</span>
            </button>

            <button
              onClick={onOpenExportModal}
              className="flex items-center space-x-1 text-xs bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-800 rounded-lg px-2.5 py-1.5 text-indigo-200 transition"
              title="Export Research Data (CSV/JSON)"
            >
              <Download className="h-3.5 w-3.5 text-indigo-400" />
              <span className="font-semibold">Export</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};


