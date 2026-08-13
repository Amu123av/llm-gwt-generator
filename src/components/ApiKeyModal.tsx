import React, { useState, useEffect } from 'react';
import { X, Key, ShieldCheck, Save, Check } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKeys: Record<string, string>;
  setApiKeys: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, apiKeys, setApiKeys }) => {
  const [keys, setKeys] = useState<Record<string, string>>({
    openai: apiKeys.openai || '',
    anthropic: apiKeys.anthropic || '',
    perplexity: apiKeys.perplexity || '',
    xai: apiKeys.xai || '',
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setKeys({
      openai: apiKeys.openai || '',
      anthropic: apiKeys.anthropic || '',
      perplexity: apiKeys.perplexity || '',
      xai: apiKeys.xai || '',
    });
  }, [apiKeys, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    setApiKeys(keys);
    localStorage.setItem('spectest_user_api_keys', JSON.stringify(keys));
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 shadow-2xl text-slate-100">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div className="flex items-center space-x-2">
            <Key className="h-5 w-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">Configure LLM Provider API Keys</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-xs text-slate-300 mb-4 leading-relaxed">
          Specify optional provider API keys for executing OpenAI, Anthropic, Perplexity, or xAI models. Keys are stored safely in local browser storage and passed directly to backend requests.
        </p>

        <div className="space-y-3.5 mb-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              OpenAI API Key (ChatGPT / GPT-4o / o3-mini)
            </label>
            <input
              type="password"
              placeholder="sk-..."
              value={keys.openai}
              onChange={(e) => setKeys({ ...keys, openai: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Anthropic API Key (Claude 3.5 Sonnet / Haiku)
            </label>
            <input
              type="password"
              placeholder="sk-ant-..."
              value={keys.anthropic}
              onChange={(e) => setKeys({ ...keys, anthropic: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Perplexity API Key (Sonar Reasoning)
            </label>
            <input
              type="password"
              placeholder="pplx-..."
              value={keys.perplexity}
              onChange={(e) => setKeys({ ...keys, perplexity: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              xAI API Key (Grok-3 / Grok-2)
            </label>
            <input
              type="password"
              placeholder="xai-..."
              value={keys.xai}
              onChange={(e) => setKeys({ ...keys, xai: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-800 p-2.5 rounded-lg mb-4 text-[11px] text-slate-400 flex items-center space-x-2">
          <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>If keys are left blank, the server will check system environment variables.</span>
        </div>

        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.5 text-xs font-semibold rounded-lg shadow"
          >
            {saved ? <Check className="h-4 w-4 text-emerald-300" /> : <Save className="h-4 w-4" />}
            <span>{saved ? 'Keys Saved' : 'Save API Keys'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
