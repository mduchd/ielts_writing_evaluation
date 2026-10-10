'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import ExamWorkspace from '@/components/ExamWorkspace';
import EvaluationView from '@/components/EvaluationView';
import SettingsModal from '@/components/SettingsModal';
import ProgressDashboard from '@/components/ProgressDashboard';
import { Topic, EvaluationResult, UserSettings, WritingHistoryItem } from '@/types/ielts';
import { CUSTOM_TOPIC_TEMPLATE, PRESET_TOPICS } from '@/lib/topics';
import { summarizeRevision } from '@/lib/revisions';

const DRAFT_STORAGE_KEY = 'ielts_writing_draft_v1';
const HISTORY_STORAGE_KEY = 'ielts_writing_history_v1';
const MAX_HISTORY_ITEMS = 30;

interface SavedDraft {
  essayText: string;
  topicId: string;
  customPrompt?: string;
  savedAt: string;
}

export default function Home() {
  const [currentTopic, setCurrentTopic] = useState<Topic>(PRESET_TOPICS[0]);
  const [essayText, setEssayText] = useState<string>('');
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isProgressOpen, setIsProgressOpen] = useState(false);
  const [history, setHistory] = useState<WritingHistoryItem[]>([]);
  const [revisionBaseline, setRevisionBaseline] = useState<WritingHistoryItem | null>(null);
  const [hasRestoredDraft, setHasRestoredDraft] = useState(false);

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

  useEffect(() => {
    try {
      const saved = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (!saved) return;
      const parsed: unknown = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        setHistory(parsed.filter((item): item is WritingHistoryItem =>
          typeof item === 'object' && item !== null && 'id' in item && 'topic' in item && 'result' in item
        ).slice(0, MAX_HISTORY_ITEMS));
      }
    } catch (error) {
      console.warn('Failed to restore writing history from localStorage', error);
    }
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (!saved) return;
      const draft = JSON.parse(saved) as Partial<SavedDraft>;
      if (typeof draft.essayText !== 'string' || typeof draft.topicId !== 'string') return;

      const presetTopic = PRESET_TOPICS.find((topic) => topic.id === draft.topicId);
      if (presetTopic) {
        setCurrentTopic(presetTopic);
      } else if (draft.topicId === CUSTOM_TOPIC_TEMPLATE.id && typeof draft.customPrompt === 'string') {
        setCurrentTopic({ ...CUSTOM_TOPIC_TEMPLATE, prompt: draft.customPrompt });
      }
      setEssayText(draft.essayText);
    } catch (error) {
      console.warn('Failed to restore essay draft from localStorage', error);
    } finally {
      setHasRestoredDraft(true);
    }
  }, []);

  useEffect(() => {
    if (!hasRestoredDraft) return;

    const draft: SavedDraft = {
      essayText,
      topicId: currentTopic.id,
      ...(currentTopic.id === CUSTOM_TOPIC_TEMPLATE.id ? { customPrompt: currentTopic.prompt } : {}),
      savedAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
    } catch (error) {
      console.warn('Failed to save essay draft to localStorage', error);
    }
  }, [currentTopic, essayText, hasRestoredDraft]);

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
    if (topic.id === currentTopic.id) return;
    if (essayText.trim() && !window.confirm('Đổi đề sẽ xóa bài viết hiện tại. Bạn có muốn tiếp tục?')) {
      return;
    }
    setCurrentTopic(topic);
    setEssayText('');
    setEvaluationResult(null);
    setRevisionBaseline(null);
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
      const previousAttempt = history.find((item) =>
        item.topic.id === currentTopic.id && item.topic.prompt === currentTopic.prompt
      );
      const revision = previousAttempt ? summarizeRevision(previousAttempt, data) : undefined;
      setEvaluationResult(data);
      setRevisionBaseline(previousAttempt ?? null);
      setHistory((previous) => {
        const next: WritingHistoryItem[] = [
          {
            id: data.id,
            topic: currentTopic,
            essay: essayText,
            result: data,
            savedAt: data.submittedAt,
            revision,
          },
          ...previous.filter((item) => item.id !== data.id),
        ].slice(0, MAX_HISTORY_ITEMS);
        try {
          localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(next));
        } catch (storageError) {
          console.warn('Failed to save writing history to localStorage', storageError);
        }
        return next;
      });
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

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(HISTORY_STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear writing history from localStorage', error);
    }
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
        onOpenProgressDashboard={() => setIsProgressOpen(true)}
        isEvaluating={isEvaluating}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {evaluationResult ? (
          <EvaluationView
            result={evaluationResult}
            topic={currentTopic}
            originalEssay={essayText}
            previousAttempt={revisionBaseline}
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
        <div className="max-w-[1680px] 2xl:max-w-[1760px] mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>IELTS WRITING AI EVALUATOR • RUBRIC-GROUNDED PRACTICE</span>
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
      <ProgressDashboard
        isOpen={isProgressOpen}
        history={history}
        onClose={() => setIsProgressOpen(false)}
        onClearHistory={handleClearHistory}
      />
    </div>
  );
}
