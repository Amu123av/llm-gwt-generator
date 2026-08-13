import React from 'react';
import { Sparkles, FileCode2, Layers, BookOpen, Cpu, BarChart3, TestTube2 } from 'lucide-react';

interface HeaderProps {
  activeTab: 'generator' | 'comparison' | 'inspector' | 'benchmark' | 'batch';
  setActiveTab: (tab: 'generator' | 'comparison' | 'inspector' | 'benchmark' | 'batch') => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-600 rounded-lg text-white shadow-md shadow-indigo-500/20">
              <TestTube2 className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-bold tracking-tight text-slate-100">
                  GWT Test Case Generator
                </h1>
                <span className="px-2 py-0.5 text-xs font-medium bg-indigo-950 text-indigo-300 border border-indigo-800/60 rounded-full">
                  AI Studio Prompt Kit
                </span>
              </div>
              <p className="text-xs text-slate-400">
                LLM-Assisted Requirement-to-Test-Case Prompt Engineering Framework
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center space-x-1 sm:space-x-2">
            <button
              onClick={() => setActiveTab('generator')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                activeTab === 'generator'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Sparkles className="h-4 w-4" />
              <span>Workbench</span>
            </button>

            <button
              onClick={() => setActiveTab('comparison')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                activeTab === 'comparison'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              <span>Baseline vs Kit</span>
            </button>

            <button
              onClick={() => setActiveTab('inspector')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                activeTab === 'inspector'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileCode2 className="h-4 w-4" />
              <span>Prompt Kit</span>
            </button>

            <button
              onClick={() => setActiveTab('benchmark')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                activeTab === 'benchmark'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <BookOpen className="h-4 w-4" />
              <span>Dataset</span>
            </button>

            <button
              onClick={() => setActiveTab('batch')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                activeTab === 'batch'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Layers className="h-4 w-4" />
              <span>Batch Run</span>
            </button>
          </nav>

          {/* Model Status Badge */}
          <div className="hidden lg:flex items-center space-x-1 text-xs bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-300">
            <Cpu className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
            <div className="flex items-center space-x-1 text-[11px] font-mono">
              <span className="text-indigo-400 font-semibold">Gemini</span>
              <span className="text-slate-600">•</span>
              <span className="text-emerald-400 font-semibold">ChatGPT</span>
              <span className="text-slate-600">•</span>
              <span className="text-amber-400 font-semibold">Claude</span>
              <span className="text-slate-600">•</span>
              <span className="text-cyan-400 font-semibold">Perplexity</span>
              <span className="text-slate-600">•</span>
              <span className="text-purple-400 font-semibold">Grok</span>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
};
