'use client';

import React, { useState, useEffect } from 'react';
import { X, Key, ShieldCheck, Cpu, SpeakerHigh, SpeakerSimpleSlash } from '@phosphor-icons/react';
import { UserSettings } from '@/types/ielts';
import { audioFX } from '@/lib/audio';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onSaveSettings: (settings: UserSettings) => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
}: SettingsModalProps) {
  const [apiKey, setApiKey] = useState(settings.apiKey || '');
  const [provider, setProvider] = useState<'gemini' | 'openai'>(settings.provider || 'gemini');
  const [soundEnabled, setSoundEnabled] = useState(settings.soundEnabled ?? true);
  const [soundVolume, setSoundVolume] = useState(settings.soundVolume ?? 0.25);

  useEffect(() => {
    setApiKey(settings.apiKey || '');
    setProvider(settings.provider || 'gemini');
    setSoundEnabled(settings.soundEnabled ?? true);
    setSoundVolume(settings.soundVolume ?? 0.25);
  }, [settings, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    audioFX.playClick();
    audioFX.setEnabled(soundEnabled);
    audioFX.setVolume(soundVolume);
    onSaveSettings({
      ...settings,
      apiKey: apiKey.trim(),
      provider,
      soundEnabled,
      soundVolume,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-none p-3 sm:p-4">
      <div className="w-full max-w-lg max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-2rem)] overflow-y-auto bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg shadow-2xl text-zinc-950 dark:text-white">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-950">
          <div className="flex items-center gap-2.5">
            <Key weight="bold" size={20} className="text-zinc-900 dark:text-zinc-100" />
            <h3 className="text-sm sm:text-base font-bold tracking-tight uppercase">Cấu hình AI API & Khảo Thí</h3>
          </div>
          <button
            onClick={() => {
              audioFX.playClick();
              onClose();
            }}
            className="p-1.5 text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white transition-colors"
          >
            <X weight="bold" size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 space-y-5 text-sm sm:text-base">
          {/* AI Provider */}
          <div>
            <label className="block font-bold mb-2 text-zinc-950 dark:text-white text-base">
              Chọn Nhà Cung Cấp AI
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  audioFX.playClick();
                  setProvider('gemini');
                }}
                className={`p-3.5 border rounded-md text-left transition-all ${
                  provider === 'gemini'
                    ? 'border-zinc-950 dark:border-white bg-zinc-100 dark:bg-zinc-800 font-bold text-zinc-950 dark:text-white shadow-xs'
                    : 'border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 hover:border-zinc-600 font-semibold'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Cpu weight="bold" size={18} />
                  <span className="text-base font-bold">Google Gemini</span>
                </div>
                <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 font-medium">Gemini 1.5 Flash (Tối ưu tốc độ)</p>
              </button>

              <button
                type="button"
                onClick={() => {
                  audioFX.playClick();
                  setProvider('openai');
                }}
                className={`p-3.5 border rounded-md text-left transition-all ${
                  provider === 'openai'
                    ? 'border-zinc-950 dark:border-white bg-zinc-100 dark:bg-zinc-800 font-bold text-zinc-950 dark:text-white shadow-xs'
                    : 'border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 hover:border-zinc-600 font-semibold'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Cpu weight="bold" size={18} />
                  <span className="text-base font-bold">OpenAI</span>
                </div>
                <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 font-medium">GPT-4o-mini</p>
              </button>
            </div>
          </div>

          {/* Sound Controls */}
          <div className="p-4 border border-zinc-300 dark:border-zinc-700 rounded-md bg-zinc-50 dark:bg-zinc-950 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="min-w-0">
                <label className="font-bold text-zinc-950 dark:text-white text-base block">
                  Hiệu Ứng Âm Thanh Khảo Thí (Sound FX)
                </label>
                <span className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 font-medium">
                  Phản hồi xúc giác vi mô cho bấm nút, nhắc giờ 5 phút và chúc mừng đủ 250 từ
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  const next = !soundEnabled;
                  setSoundEnabled(next);
                  audioFX.setEnabled(next);
                  if (next) audioFX.playClick();
                }}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs sm:text-sm font-bold border transition-colors shadow-xs ${
                  soundEnabled
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-950 dark:bg-emerald-950/60 dark:text-emerald-200'
                    : 'border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                }`}
              >
                {soundEnabled ? <SpeakerHigh weight="bold" size={16} /> : <SpeakerSimpleSlash weight="bold" size={16} />}
                <span>{soundEnabled ? 'Bật' : 'Tắt'}</span>
              </button>
            </div>

            {soundEnabled && (
              <div className="flex items-center gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                <span className="text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 font-bold shrink-0">Mức âm lượng:</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[
                    { label: 'Êm dịu (20%)', val: 0.2 },
                    { label: 'Chuẩn (40%)', val: 0.4 },
                    { label: 'Rõ nét (70%)', val: 0.7 },
                  ].map((preset) => (
                    <button
                      key={preset.val}
                      type="button"
                      onClick={() => {
                        setSoundVolume(preset.val);
                        audioFX.setVolume(preset.val);
                        audioFX.playClick();
                      }}
                      className={`px-3 py-1 rounded text-xs font-bold border transition-colors ${
                        Math.abs(soundVolume - preset.val) < 0.05
                          ? 'border-zinc-950 dark:border-white bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-xs'
                          : 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 hover:border-zinc-500'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* API Key */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-bold text-zinc-950 dark:text-white text-base">
                API Key Cá Nhân
              </label>
              <span className="text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-300">Tùy chọn</span>
            </div>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={provider === 'gemini' ? 'AIzaSy...' : 'sk-...'}
              className="w-full px-4 py-2.5 border border-zinc-300 dark:border-zinc-700 rounded-md bg-zinc-50 dark:bg-zinc-950 text-zinc-950 dark:text-white font-mono text-sm sm:text-base font-semibold focus:outline-none focus:border-zinc-950 dark:focus:border-white"
            />
            <p className="mt-2 text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed font-medium">
              * Khóa API được lưu cục bộ trên trình duyệt (Local Storage) và chỉ dùng để gửi yêu cầu chấm bài của bạn. Nếu để trống, hệ thống dùng <strong>Local Heuristic Evaluator</strong> với phân tích quy tắc cơ bản; đây không thay thế phản hồi của AI hoặc giám khảo IELTS.
            </p>
          </div>

          <div className="p-4 bg-zinc-100 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-md text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 font-medium flex items-start gap-3">
            <ShieldCheck weight="bold" size={22} className="shrink-0 text-emerald-600 mt-0.5" />
            <span>
              Quy chuẩn chấm thi áp dụng đúng <strong>IELTS Public Band Descriptors</strong> chính thức từ British Council và IDP với cơ chế chống nâng điểm (Anti-Score Inflation).
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-4 sm:px-6 py-4 border-t border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-950">
          <button
            type="button"
            onClick={() => {
              audioFX.playClick();
              onClose();
            }}
            className="px-4 py-2 text-sm font-bold text-zinc-800 dark:text-zinc-200 hover:text-zinc-950 dark:hover:text-white"
          >
            Đóng
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 text-sm font-bold bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 rounded-md hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors shadow-xs"
          >
            Lưu Cấu Hình
          </button>
        </div>
      </div>
    </div>
  );
}
