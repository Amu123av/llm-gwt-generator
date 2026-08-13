import React from 'react';
import { RequirementInput, PromptMode } from '../types';
import { SAMPLE_REQUIREMENTS } from '../data/sampleRequirements';
import { Sparkles, Sliders, Layers, RefreshCw, FileText, BookmarkPlus } from 'lucide-react';

interface RequirementInputFormProps {
  input: RequirementInput;
  setInput: React.Dispatch<React.SetStateAction<RequirementInput>>;
  promptMode: PromptMode;
  setPromptMode: (mode: PromptMode) => void;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  temperature: number;
  setTemperature: (temp: number) => void;
  onGenerate: () => void;
  isLoading: boolean;
}

export const RequirementInputForm: React.FC<RequirementInputFormProps> = ({
  input,
  setInput,
  promptMode,
  setPromptMode,
  selectedModel,
  setSelectedModel,
  temperature,
  setTemperature,
  onGenerate,
  isLoading,
}) => {
  const handleSampleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sampleId = e.target.value;
    if (!sampleId) return;
    const found = SAMPLE_REQUIREMENTS.find((s) => s.requirement_id === sampleId);
    if (found) {
      setInput({
        requirement_id: found.requirement_id,
        domain: found.domain,
        source_ref: found.source_ref,
        requirement_text: found.requirement_text,
      });
    }
  };

  const handleClear = () => {
    setInput({
      requirement_id: `REQ-${Math.floor(100 + Math.random() * 900)}`,
      domain: 'Mozilla',
      source_ref: 'Spec Section 1.0',
      requirement_text: '',
    });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg text-slate-100">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
        <div className="flex items-center space-x-2">
          <FileText className="h-5 w-5 text-indigo-400" />
          <h2 className="text-base font-semibold text-white">Requirement Context Input</h2>
        </div>

        {/* Preset Requirement Selector */}
        <div className="flex items-center space-x-2">
          <BookmarkPlus className="h-4 w-4 text-slate-400 hidden sm:block" />
          <select
            onChange={handleSampleSelect}
            className="bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            defaultValue=""
          >
            <option value="" disabled>
              -- Load Benchmark Sample --
            </option>
            {SAMPLE_REQUIREMENTS.map((s) => (
              <option key={s.requirement_id} value={s.requirement_id}>
                [{s.domain}] {s.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Requirement ID</label>
          <input
            type="text"
            value={input.requirement_id}
            onChange={(e) => setInput({ ...input, requirement_id: e.target.value })}
            placeholder="e.g. MOZ-BUG-184920"
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Domain</label>
          <select
            value={input.domain}
            onChange={(e) => setInput({ ...input, domain: e.target.value })}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            <option value="Mozilla">Mozilla / Browser</option>
            <option value="Bluetooth">Bluetooth Core Spec</option>
            <option value="Banking">Banking / Financial</option>
            <option value="E-Commerce">E-Commerce</option>
            <option value="Healthcare">Healthcare</option>
            <option value="Custom">Custom Domain</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Source Reference</label>
          <input
            type="text"
            value={input.source_ref}
            onChange={(e) => setInput({ ...input, source_ref: e.target.value })}
            placeholder="e.g. Bugzilla #184920 or Spec 4.2"
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Requirement Text area */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <label className="block text-xs font-medium text-slate-300">
            Requirement or Bug Description Text <span className="text-indigo-400">*</span>
          </label>
          <div className="flex items-center space-x-2 text-[11px] text-slate-400">
            <span>{input.requirement_text.length} chars</span>
            <button
              onClick={handleClear}
              type="button"
              className="text-slate-400 hover:text-slate-200 underline text-[11px]"
            >
              Clear
            </button>
          </div>
        </div>
        <textarea
          rows={4}
          value={input.requirement_text}
          onChange={(e) => setInput({ ...input, requirement_text: e.target.value })}
          placeholder='e.g. "The browser shall not crash or freeze when a malformed URL or invalid URI scheme is entered in the address bar."'
          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono placeholder:text-slate-600 resize-none"
        />
      </div>

      {/* Configuration Section */}
      <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3 mb-5">
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-300 mb-3">
          <Sliders className="h-3.5 w-3.5 text-indigo-400" />
          <span>Framework Prompt Configurations</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Prompt Mode */}
          <div>
            <label className="block text-xs text-slate-400 mb-1 font-medium">Prompt Technique Mode</label>
            <div className="grid grid-cols-3 gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
              <button
                type="button"
                onClick={() => setPromptMode('few-shot')}
                className={`text-[11px] py-1 font-medium rounded transition-all ${
                  promptMode === 'few-shot'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Few-Shot (k=2)
              </button>

              <button
                type="button"
                onClick={() => setPromptMode('zero-shot')}
                className={`text-[11px] py-1 font-medium rounded transition-all ${
                  promptMode === 'zero-shot'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Zero-Shot
              </button>

              <button
                type="button"
                onClick={() => setPromptMode('baseline')}
                className={`text-[11px] py-1 font-medium rounded transition-all ${
                  promptMode === 'baseline'
                    ? 'bg-amber-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Baseline
              </button>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              {promptMode === 'few-shot' && 'k=2 exemplars (Mozilla + Bluetooth) for optimal GWT style consistency.'}
              {promptMode === 'zero-shot' && 'System constraints with strict JSON schema, no exemplars.'}
              {promptMode === 'baseline' && 'Naive unstructured prompt without System Instructions.'}
            </p>
          </div>

          {/* Model Selection */}
          <div>
            <label className="block text-xs text-slate-400 mb-1 font-medium">LLM Model & Engine</label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium"
            >
              <optgroup label="Google AI (Gemini)">
                <option value="gemini-3.6-flash">Google Gemini 3.6 Flash (Recommended)</option>
                <option value="gemini-3.1-pro-preview">Google Gemini 3.1 Pro (Complex Specs)</option>
              </optgroup>

              <optgroup label="OpenAI (ChatGPT)">
                <option value="gpt-4o">ChatGPT (GPT-4o)</option>
                <option value="gpt-4o-mini">ChatGPT (GPT-4o Mini)</option>
                <option value="o3-mini">ChatGPT (o3-mini Reasoning)</option>
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
            <p className="text-[10px] text-slate-400 mt-1">
              {selectedModel.startsWith('gemini') && 'Direct native Gemini engine execution.'}
              {selectedModel.startsWith('gpt') || selectedModel.startsWith('o3') ? 'OpenAI ChatGPT engine.' : ''}
              {selectedModel.startsWith('claude') && 'Anthropic Claude reasoning engine.'}
              {selectedModel.startsWith('sonar') && 'Perplexity search-grounded engine.'}
              {selectedModel.startsWith('grok') && 'xAI Grok reasoning engine.'}
            </p>
          </div>


          {/* Temperature */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs text-slate-400 font-medium">Decoding Temperature</label>
              <span className="text-xs text-indigo-400 font-mono font-bold">{temperature.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.0"
              max="1.0"
              step="0.05"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>0.0 (Deterministic)</span>
              <span className="text-indigo-300 font-semibold">0.2 (Paper Opt)</span>
              <span>1.0 (Creative)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={onGenerate}
        disabled={isLoading || !input.requirement_text.trim()}
        className={`w-full py-2.5 px-4 rounded-xl font-semibold text-sm flex items-center justify-center space-x-2 transition-all shadow-md ${
          isLoading || !input.requirement_text.trim()
            ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
        }`}
      >
        {isLoading ? (
          <>
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>Executing Prompt Engineering Pipeline...</span>
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            <span>Generate Given-When-Then Test Cases</span>
          </>
        )}
      </button>
    </div>
  );
};
