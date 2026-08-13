import React, { useState } from 'react';
import { PROMPT_KIT } from '../data/prompts';
import { FileCode2, Copy, Check, Terminal, Settings, Layers, BookOpen, Code2 } from 'lucide-react';

export const PromptKitInspector: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [copiedStep, setCopiedStep] = useState<number | null>(null);

  const handleCopy = (text: string, stepNumber: number) => {
    navigator.clipboard.writeText(text);
    setCopiedStep(stepNumber);
    setTimeout(() => setCopiedStep(null), 2000);
  };

  const getPythonScriptCode = () => {
    return `# LLM-Assisted Requirement-to-Test-Case Batch Script (Gemini API)
import os
import json
from google import genai
from google.genai import types

# Initialize Gemini Client
client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

system_instruction = """${PROMPT_KIT.step2SystemInstruction}"""

# Requirement Context
req_context = {
    "requirement_id": "REQ-MOZ-01",
    "domain": "Mozilla",
    "source_ref": "Bug #184920",
    "requirement_text": "The browser shall not crash when a malformed URL is entered in the address bar."
}

prompt = f"""Requirement Context:
- requirement_id: {req_context['requirement_id']}
- domain: {req_context['domain']}
- source_ref: {req_context['source_ref']}
- requirement_text: "{req_context['requirement_text']}"

Generate the test cases now, following the system instructions exactly."""

response = client.models.generate_content(
    model="gemini-3.6-flash",
    contents=prompt,
    config=types.GenerateContentConfig(
        system_instruction=system_instruction,
        temperature=0.2,
        response_mime_type="application/json",
    )
)

print(response.text)
`;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg text-slate-100">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
        <div className="flex items-center space-x-2">
          <FileCode2 className="h-5 w-5 text-indigo-400" />
          <h2 className="text-base font-bold text-white">Google AI Studio Prompt Kit Specification</h2>
        </div>
        <span className="text-xs px-2.5 py-0.5 rounded-full font-mono font-medium bg-indigo-950 text-indigo-300 border border-indigo-800">
          5-Component Framework
        </span>
      </div>

      {/* Step Selector Tabs */}
      <div className="flex overflow-x-auto space-x-2 pb-3 mb-4 border-b border-slate-800/80">
        <button
          onClick={() => setActiveStep(1)}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
            activeStep === 1 ? 'bg-indigo-600 text-white' : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Settings className="h-3.5 w-3.5" />
          <span>Step 1: Settings</span>
        </button>

        <button
          onClick={() => setActiveStep(2)}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
            activeStep === 2 ? 'bg-indigo-600 text-white' : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Terminal className="h-3.5 w-3.5" />
          <span>Step 2: System Instruction</span>
        </button>

        <button
          onClick={() => setActiveStep(3)}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
            activeStep === 3 ? 'bg-indigo-600 text-white' : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="h-3.5 w-3.5" />
          <span>Step 3: User Templates</span>
        </button>

        <button
          onClick={() => setActiveStep(4)}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
            activeStep === 4 ? 'bg-indigo-600 text-white' : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen className="h-3.5 w-3.5" />
          <span>Step 4: Baseline Prompt</span>
        </button>

        <button
          onClick={() => setActiveStep(5)}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
            activeStep === 5 ? 'bg-indigo-600 text-white' : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Code2 className="h-3.5 w-3.5" />
          <span>Step 5: API Automation Code</span>
        </button>
      </div>

      {/* Step Content */}
      {activeStep === 1 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-indigo-300">STEP 1 — Recommended Multi-Model Engine Settings</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-lg">
              <span className="font-bold text-white block mb-1">Supported Model Architectures</span>
              <p className="text-slate-300 leading-relaxed">
                <strong className="text-indigo-400">Google Gemini</strong> (3.6 Flash / 3.1 Pro)<br />
                <strong className="text-emerald-400">OpenAI ChatGPT</strong> (GPT-4o, GPT-4o-mini, o3-mini)<br />
                <strong className="text-amber-400">Anthropic Claude</strong> (Claude 3.5 Sonnet / Haiku)<br />
                <strong className="text-cyan-400">Perplexity AI</strong> (Sonar / Sonar Reasoning)<br />
                <strong className="text-purple-400">xAI Grok</strong> (Grok-3 / Grok-2)
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-lg">
              <span className="font-bold text-white block mb-1">Decoding Temperature</span>
              <p className="text-slate-300">
                Set to <strong className="text-amber-400 font-mono">0.2</strong> (low temperature forces consistent, structured GWT output across all provider model families).
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-lg">
              <span className="font-bold text-white block mb-1">Response Format</span>
              <p className="text-slate-300">
                Structured Output <strong className="text-emerald-400 font-mono">JSON</strong> matching responseSchema across all providers.
              </p>
            </div>
          </div>
        </div>
      )}


      {activeStep === 2 && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-indigo-300">STEP 2 — System Instructions & Constraints</h3>
            <button
              onClick={() => handleCopy(PROMPT_KIT.step2SystemInstruction, 2)}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1 rounded-md border border-slate-700 flex items-center space-x-1"
            >
              {copiedStep === 2 ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copiedStep === 2 ? 'Copied' : 'Copy System Instructions'}</span>
            </button>
          </div>
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 font-mono text-xs text-indigo-200 overflow-x-auto whitespace-pre-wrap">
            {PROMPT_KIT.step2SystemInstruction}
          </div>
        </div>
      )}

      {activeStep === 3 && (
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-bold text-indigo-300">3A. Zero-Shot Template</h3>
              <button
                onClick={() => handleCopy(PROMPT_KIT.step3AZeroShotTemplate, 31)}
                className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded-md border border-slate-700 flex items-center space-x-1"
              >
                {copiedStep === 31 ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>Copy</span>
              </button>
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono text-xs text-slate-300 whitespace-pre-wrap">
              {PROMPT_KIT.step3AZeroShotTemplate}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-bold text-indigo-300">3B. Few-Shot Template (k=2 Exemplars: Mozilla + Bluetooth)</h3>
              <button
                onClick={() => handleCopy(PROMPT_KIT.step3BFewShotTemplate, 32)}
                className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded-md border border-slate-700 flex items-center space-x-1"
              >
                {copiedStep === 32 ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>Copy</span>
              </button>
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono text-xs text-slate-300 whitespace-pre-wrap max-h-80 overflow-y-auto">
              {PROMPT_KIT.step3BFewShotTemplate}
            </div>
          </div>
        </div>
      )}

      {activeStep === 4 && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-amber-300">STEP 4 — Baseline (Unstructured) Naive Prompt</h3>
            <button
              onClick={() => handleCopy(PROMPT_KIT.step4BaselineTemplate, 4)}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1 rounded-md border border-slate-700 flex items-center space-x-1"
            >
              {copiedStep === 4 ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>Copy</span>
            </button>
          </div>
          <p className="text-xs text-slate-400">
            Used for naive baseline comparison runs without System Instructions or JSON schema constraints.
          </p>
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 font-mono text-xs text-amber-200">
            {PROMPT_KIT.step4BaselineTemplate}
          </div>
        </div>
      )}

      {activeStep === 5 && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-emerald-300">STEP 5 — Gemini API Automation Code (Python)</h3>
            <button
              onClick={() => handleCopy(getPythonScriptCode(), 5)}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1 rounded-md border border-slate-700 flex items-center space-x-1"
            >
              {copiedStep === 5 ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>Copy Python Script</span>
            </button>
          </div>
          <p className="text-xs text-slate-400">
            Automates test case generation across a full requirements set via Gemini API.
          </p>
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 font-mono text-xs text-emerald-300 overflow-x-auto whitespace-pre">
            {getPythonScriptCode()}
          </div>
        </div>
      )}
    </div>
  );
};
