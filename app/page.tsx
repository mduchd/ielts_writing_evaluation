'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import ExamWorkspace from '@/components/ExamWorkspace';
import EvaluationView from '@/components/EvaluationView';
import SettingsModal from '@/components/SettingsModal';
import { Topic, EvaluationResult, UserSettings } from '@/types/ielts';
import { PRESET_TOPICS } from '@/lib/topics';

export default function Home() {
  const [currentTopic, setCurrentTopic] = useState<Topic>(PRESET_TOPICS[0]);
  const [essayText, setEssayText] = useState<string>('');
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Settings with local storage persistence
  const [settings, setSettings] = useState<UserSettings>({
    apiKey: '',
    provider: 'gemini',
    model: 'gemini-1.5-flash',
    editorFont: 'sans',
    fontSize: 'standard',
    spellcheckLocked: true,
    theme: 'light',
    soundEnabled: true,
    soundVolume: 0.25,
  });

  useEffect(() => {
    // Mặc định luôn là giao diện sáng (Light Mode)
    document.documentElement.classList.remove('dark');
    try {
      const saved = localStorage.getItem('ielts_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        setSettings((prev) => ({ ...prev, ...parsed }));
        if (parsed.theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    } catch (e) {
      console.warn('Failed to load settings from localStorage', e);
    }
  }, []);

  const handleUpdateSettings = (newSettings: Partial<UserSettings>) => {
    if (newSettings.theme) {
      if (newSettings.theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      try {
        localStorage.setItem('ielts_settings', JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to save settings', e);
      }
      return updated;
    });
  };


  const handleSelectTopic = (topic: Topic) => {
    setCurrentTopic(topic);
    setEvaluationResult(null);
  };

  const handleUpdateCustomTopic = (newPrompt: string) => {
    setCurrentTopic((prev) => ({
      ...prev,
      prompt: newPrompt,
    }));
  };

  const handleSubmitEvaluation = async (timeSpentSeconds: number) => {
    if (!essayText.trim()) return;

    setIsEvaluating(true);
    try {
      const response = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          essay: essayText,
          topic: currentTopic,
          timeSpentSeconds,
          apiKey: settings.apiKey,
          provider: settings.provider,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Evaluation failed');
      }

      const data: EvaluationResult = await response.json();
      setEvaluationResult(data);
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error: unknown) {
      console.error('Error during evaluation:', error);
      const msg = error instanceof Error ? error.message : 'Đã xảy ra lỗi không xác định';
      alert(`Lỗi trong quá trình chấm bài: ${msg}`);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleRetry = () => {
    setEvaluationResult(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors">
      {/* Top Navbar */}
      <Navbar
        currentTopic={currentTopic}
        onSelectTopic={handleSelectTopic}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onOpenSettingsModal={() => setIsSettingsOpen(true)}
        isEvaluating={isEvaluating}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {evaluationResult ? (
          <EvaluationView
            result={evaluationResult}
            topic={currentTopic}
            originalEssay={essayText}
            onRetry={handleRetry}
          />
        ) : (
          <ExamWorkspace
            topic={currentTopic}
            onUpdateCustomTopic={handleUpdateCustomTopic}
            essayText={essayText}
            onChangeEssayText={setEssayText}
            onSubmitForEvaluation={handleSubmitEvaluation}
            isEvaluating={isEvaluating}
            settings={settings}
          />
        )}
      </main>

      {/* Discrete Academic Footer */}
      <footer className="border-t border-zinc-300 dark:border-zinc-700 py-6 text-center text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 font-semibold">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>IELTS WRITING AI EVALUATOR • CALIBRATED BAND DESCRIPTORS</span>
          <div className="flex items-center gap-3">
            <span>TASK 1 & TASK 2</span>
            <span>•</span>
            <span>GEMINI 1.5 FLASH / GPT-4O-MINI READY</span>
          </div>
        </div>
      </footer>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={handleUpdateSettings}
      />
    </div>
  );
}
