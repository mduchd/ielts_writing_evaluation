'use client';

import React from 'react';
import {
  Gear,
  Moon,
  Sun,
  LockSimple,
  LockSimpleOpen,
  CaretDown,
  SpeakerHigh,
  SpeakerSimpleSlash,
} from '@phosphor-icons/react';

import { Topic, UserSettings } from '@/types/ielts';
import { PRESET_TOPICS, CUSTOM_TOPIC_TEMPLATE } from '@/lib/topics';
import { audioFX } from '@/lib/audio';

interface NavbarProps {
  currentTopic: Topic;
  onSelectTopic: (topic: Topic) => void;
  settings: UserSettings;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
  onOpenSettingsModal: () => void;
  isEvaluating: boolean;
}

export default function Navbar({
  currentTopic,
  onSelectTopic,
  settings,
  onUpdateSettings,
  onOpenSettingsModal,
  isEvaluating,
}: NavbarProps) {
  const toggleSpellcheck = () => {
    audioFX.playClick();
    onUpdateSettings({ spellcheckLocked: !settings.spellcheckLocked });
  };

  const handleFontChange = (font: 'sans' | 'serif' | 'exam') => {
    audioFX.playClick();
    onUpdateSettings({ editorFont: font });
  };

  const toggleSound = () => {
    const next = !settings.soundEnabled;
    audioFX.setEnabled(next);
    onUpdateSettings({ soundEnabled: next });
    if (next) audioFX.playClick();
  };

  const toggleTheme = () => {
    audioFX.playClick();
    const nextTheme = settings.theme === 'dark' ? 'light' : 'dark';
    onUpdateSettings({ theme: nextTheme });
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 transition-colors shadow-xs">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
        {/* Brand & Identity */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 text-xs font-bold tracking-wider bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 rounded">
              IELTS
            </span>
            <span className="text-base font-bold tracking-tight text-zinc-950 dark:text-white hidden sm:inline-block">
              EVALUATOR
            </span>
          </div>

          <div className="h-5 w-px bg-zinc-300 dark:bg-zinc-700 hidden md:block" />

          {/* Topic Selector */}
          <div className="relative group">
            <select
              value={currentTopic.id}
              onChange={(e) => {
                audioFX.playClick();
                const found = PRESET_TOPICS.find((t) => t.id === e.target.value);
                if (found) {
                  onSelectTopic(found);
                } else if (e.target.value === 'custom-topic') {
                  onSelectTopic(CUSTOM_TOPIC_TEMPLATE);
                }
              }}
              disabled={isEvaluating}
              className="text-sm appearance-none bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-md px-3 py-2 pr-8 font-bold text-zinc-950 dark:text-white focus:outline-none focus:border-zinc-950 dark:focus:border-white max-w-[200px] sm:max-w-xs md:max-w-sm truncate cursor-pointer shadow-xs"
            >
              <optgroup label="IELTS Writing Task 2 (Essay)">
                {PRESET_TOPICS.filter((t) => t.type === 'task2').map((t) => (
                  <option key={t.id} value={t.id}>
                    [Task 2] {t.title}
                  </option>
                ))}
              </optgroup>
              <optgroup label="IELTS Writing Task 1 (Report)">
                {PRESET_TOPICS.filter((t) => t.type === 'task1').map((t) => (
                  <option key={t.id} value={t.id}>
                    [Task 1] {t.title}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Tùy Chọn Khác">
                <option value="custom-topic">✍️ Tự nhập đề bài của bạn</option>
              </optgroup>
            </select>
            <CaretDown
              weight="bold"
              size={13}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-800 dark:text-zinc-200"
            />
          </div>
        </div>

        {/* Toolbar Controls - Ultra Streamlined Square Icons & Segmented Pills */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Font Type Switcher */}
          <div className="flex items-center h-9 border border-zinc-300 dark:border-zinc-700 rounded-md p-0.5 bg-zinc-100 dark:bg-zinc-900">
            <button
              type="button"
              onClick={() => handleFontChange('sans')}
              title="Font Sans-serif (Inter)"
              className={`h-full px-2.5 flex items-center justify-center rounded text-xs font-sans font-bold transition-colors ${
                settings.editorFont === 'sans'
                  ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-xs'
                  : 'text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white'
              }`}
            >
              Sans
            </button>
            <button
              type="button"
              onClick={() => handleFontChange('serif')}
              title="Font Academic Serif"
              className={`h-full px-2.5 flex items-center justify-center rounded text-xs font-serif font-bold transition-colors ${
                settings.editorFont === 'serif'
                  ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-xs'
                  : 'text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white'
              }`}
            >
              Serif
            </button>
            <button
              type="button"
              onClick={() => handleFontChange('exam')}
              title="Font Exam Arial (BC/IDP)"
              className={`h-full px-2.5 flex items-center justify-center rounded text-xs font-exam font-bold transition-colors ${
                settings.editorFont === 'exam'
                  ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-xs'
                  : 'text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white'
              }`}
            >
              Exam
            </button>
          </div>

          {/* Spellcheck Lock (Icon Only) */}
          <button
            type="button"
            onClick={toggleSpellcheck}
            title={
              settings.spellcheckLocked
                ? 'Kiểm tra chính tả: Đang KHÓA (Mô phỏng thi thật)'
                : 'Kiểm tra chính tả: Đang MỞ (Trình duyệt tự sửa lỗi)'
            }
            className={`h-9 w-9 flex items-center justify-center rounded-md border transition-colors shadow-xs ${
              settings.spellcheckLocked
                ? 'border-zinc-950 dark:border-white bg-zinc-950 text-white dark:bg-white dark:text-zinc-950'
                : 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:border-zinc-600'
            }`}
          >
            {settings.spellcheckLocked ? (
              <LockSimple weight="bold" size={17} />
            ) : (
              <LockSimpleOpen weight="bold" size={17} />
            )}
          </button>

          {/* Sound Toggle (Icon Only) */}
          <button
            type="button"
            onClick={toggleSound}
            title={settings.soundEnabled ? 'Âm thanh: Đang BẬT (Bấm để tắt)' : 'Âm thanh: Đang TẮT (Bấm để bật)'}
            className="h-9 w-9 flex items-center justify-center rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 hover:border-zinc-600 transition-colors shadow-xs"
          >
            {settings.soundEnabled ? (
              <SpeakerHigh weight="bold" size={17} className="text-emerald-600 dark:text-emerald-400" />
            ) : (
              <SpeakerSimpleSlash weight="bold" size={17} className="text-zinc-400 dark:text-zinc-500" />
            )}
          </button>

          {/* Settings API Modal Trigger (Icon Only) */}
          <button
            type="button"
            onClick={() => {
              audioFX.playClick();
              onOpenSettingsModal();
            }}
            title="Cấu hình API Key & Tham số"
            className="h-9 w-9 flex items-center justify-center text-zinc-800 dark:text-zinc-200 hover:text-zinc-950 dark:hover:text-white border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-900 hover:border-zinc-600 dark:hover:border-zinc-400 transition-colors shadow-xs"
          >
            <Gear weight="bold" size={18} />
          </button>

          {/* Theme Switcher (Icon Only 1-Click Toggle) */}
          <button
            type="button"
            onClick={toggleTheme}
            title={settings.theme === 'dark' ? 'Đổi sang giao diện Sáng' : 'Đổi sang giao diện Tối'}
            className="h-9 w-9 flex items-center justify-center rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 hover:border-zinc-600 transition-colors shadow-xs"
          >
            {settings.theme === 'dark' ? (
              <Sun weight="bold" size={18} className="text-amber-400" />
            ) : (
              <Moon weight="bold" size={18} className="text-indigo-600" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
