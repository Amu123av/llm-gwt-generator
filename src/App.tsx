import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { RequirementInputForm } from './components/RequirementInputForm';
import { TestCaseDisplay } from './components/TestCaseDisplay';
import { QualityMetricsPanel } from './components/QualityMetricsPanel';
import { SideBySideComparison } from './components/SideBySideComparison';
import { PromptKitInspector } from './components/PromptKitInspector';
import { BenchmarkLibrary } from './components/BenchmarkLibrary';
import { BatchSimulator } from './components/BatchSimulator';
import { ModelLeaderboard } from './components/ModelLeaderboard';
import { ApiKeyModal } from './components/ApiKeyModal';
import { ExportModal } from './components/ExportModal';
import { RequirementInput, PromptMode, GenerationResult, SampleRequirement } from './types';
import { SAMPLE_REQUIREMENTS } from './data/sampleRequirements';
import { AlertCircle } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<
    'generator' | 'comparison' | 'inspector' | 'benchmark' | 'batch' | 'leaderboard'
  >('generator');

  // API Key management state
  const [apiKeys, setApiKeys] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('spectest_user_api_keys');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);

  // Export Modal state and history of results
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [experimentHistory, setExperimentHistory] = useState<GenerationResult[]>([]);

  // Input state
  const [input, setInput] = useState<RequirementInput>({
    requirement_id: SAMPLE_REQUIREMENTS[0].requirement_id,
    domain: SAMPLE_REQUIREMENTS[0].domain,
    source_ref: SAMPLE_REQUIREMENTS[0].source_ref,
    requirement_text: SAMPLE_REQUIREMENTS[0].requirement_text,
  });

  // Config state
  const [promptMode, setPromptMode] = useState<PromptMode>('few-shot');
  const [selectedModel, setSelectedModel] = useState<string>('gemini-3.6-flash');
  const [temperature, setTemperature] = useState<number>(0.2);

  // Execution result state
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (overrideInput?: RequirementInput) => {
    const targetInput = overrideInput || input;
    if (!targetInput.requirement_text.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-test-cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requirement_id: targetInput.requirement_id,
          domain: targetInput.domain,
          source_ref: targetInput.source_ref,
          requirement_text: targetInput.requirement_text,
          prompt_mode: promptMode,
          model: selectedModel,
          temperature,
          user_api_keys: apiKeys,
        }),
      });

      const data: GenerationResult = await response.json();

      if (!response.ok || data.success === false) {
        setResult(data);
        setError(data.error || 'Model execution failed. See details below.');
      } else {
        setResult(data);
        setExperimentHistory((prev) => [data, ...prev]);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during test generation.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectFromBenchmark = (sample: SampleRequirement) => {
    const newInput: RequirementInput = {
      requirement_id: sample.requirement_id,
      domain: sample.domain,
      source_ref: sample.source_ref,
      requirement_text: sample.requirement_text,
    };
    setInput(newInput);
    setActiveTab('generator');
    handleGenerate(newInput);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenApiKeys={() => setIsApiKeyModalOpen(true)}
        onOpenExportModal={() => setIsExportModalOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Error Alert */}
        {error && (
          <div className="bg-rose-950/90 border border-rose-800 rounded-xl p-4 text-xs text-rose-200 flex items-center space-x-2 shadow-lg">
            <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Tab 1: Workbench Generator */}
        {activeTab === 'generator' && (
          <div className="space-y-6">
            <RequirementInputForm
              input={input}
              setInput={setInput}
              promptMode={promptMode}
              setPromptMode={setPromptMode}
              selectedModel={selectedModel}
              setSelectedModel={setSelectedModel}
              temperature={temperature}
              setTemperature={setTemperature}
              onGenerate={() => handleGenerate()}
              isLoading={isLoading}
            />

            {result && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <TestCaseDisplay
                    data={result.data || null}
                    rawOutput={result.rawOutput}
                    mode={result.mode}
                    latencyMs={result.metrics?.latencyMs}
                  />
                </div>
                <div>
                  <QualityMetricsPanel metrics={result.metrics} mode={result.mode} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Model Accuracy Leaderboard */}
        {activeTab === 'leaderboard' && <ModelLeaderboard apiKeys={apiKeys} />}

        {/* Tab 3: Side-by-Side Comparison */}
        {activeTab === 'comparison' && <SideBySideComparison apiKeys={apiKeys} />}

        {/* Tab 4: Prompt Kit Inspector */}
        {activeTab === 'inspector' && <PromptKitInspector />}

        {/* Tab 5: Benchmark Dataset Library */}
        {activeTab === 'benchmark' && (
          <BenchmarkLibrary onSelectAndRun={handleSelectFromBenchmark} />
        )}

        {/* Tab 6: Batch Run Evaluation */}
        {activeTab === 'batch' && <BatchSimulator apiKeys={apiKeys} />}
      </main>

      {/* Modals */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        apiKeys={apiKeys}
        setApiKeys={setApiKeys}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        results={experimentHistory.length > 0 ? experimentHistory : result ? [result] : []}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-500">
        <p>
          SpecTest Studio • LLM Specification Test Generator & Research Evaluation Benchmark Suite
        </p>
      </footer>
    </div>
  );
}


