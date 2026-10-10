'use client';

import React, { useState, useEffect } from 'react';
import {
  SealCheck,
  WarningCircle,
  Translate,
  GitFork,
  Target,
  Copy,
  Check,
  ArrowLeft,
  BookBookmark,
  FileText,
  ChartLineUp,
  X,
  Lightbulb,
} from '@phosphor-icons/react';
import { EvaluationResult, InlineAnnotation, Topic, ErrorType } from '@/types/ielts';
import { audioFX } from '@/lib/audio';

interface EvaluationViewProps {
  result: EvaluationResult;
  topic: Topic;
  originalEssay: string;
  onRetry: () => void;
}

export default function EvaluationView({
  result,
  topic,
  originalEssay,
  onRetry,
}: EvaluationViewProps) {
  const [activeTab, setActiveTab] = useState<'inline' | 'criteria' | 'rewrites' | 'error_vault'>('inline');
  const [selectedAnnotation, setSelectedAnnotation] = useState<InlineAnnotation | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  useEffect(() => {
    // Play elegant academic score reveal chord upon mounting
    audioFX.playScoreReveal();
  }, []);

  const handleCopy = (text: string, label: string) => {
    audioFX.playCopy();
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const getErrorTypeBadge = (type: ErrorType) => {
    switch (type) {
      case 'grammar':
        return {
          label: 'Ngữ Pháp (GRA)',
          color: 'text-red-950 bg-red-100 border-red-400 dark:text-red-100 dark:bg-red-950/80 dark:border-red-600',
        };
      case 'vocabulary':
        return {
          label: 'Từ Vựng (LR)',
          color: 'text-amber-950 bg-amber-100 border-amber-400 dark:text-amber-100 dark:bg-amber-950/80 dark:border-amber-600',
        };
      case 'coherence':
        return {
          label: 'Liên Kết (CC)',
          color: 'text-indigo-950 bg-indigo-100 border-indigo-400 dark:text-indigo-100 dark:bg-indigo-950/80 dark:border-indigo-600',
        };
      case 'excellence':
        return {
          label: 'Điểm Sáng (Band 8+)',
          color: 'text-emerald-950 bg-emerald-100 border-emerald-400 dark:text-emerald-100 dark:bg-emerald-950/80 dark:border-emerald-600',
        };
    }
  };

  const getCEFRLevel = (band: number) => {
    if (band >= 8.5) return 'C2 Mastery (Thông thạo đỉnh cao)';
    if (band >= 7.0) return 'C1 Effective Operational (Vận hành hiệu quả)';
    if (band >= 5.5) return 'B2 Vantage (Trung cấp độc lập)';
    if (band >= 4.0) return 'B1 Threshold (Cơ bản đủ dùng)';
    return 'A2 Waystage';
  };

  // Render the essay with interactive clickable marks
  const renderAnnotatedEssay = () => {
    if (!result.inlineAnnotations || result.inlineAnnotations.length === 0) {
      return (
        <div className="whitespace-pre-wrap leading-relaxed text-base sm:text-lg text-zinc-950 dark:text-zinc-50 font-normal">
          {originalEssay}
        </div>
      );
    }

    const paragraphs = originalEssay.split(/\n+/);

    return (
      <div className="space-y-6 text-base sm:text-lg leading-[1.9] text-zinc-950 dark:text-zinc-50 font-normal">
        {paragraphs.map((paragraph, pIdx) => {
          let elements: React.ReactNode[] = [paragraph];

          result.inlineAnnotations.forEach((ann) => {
            if (!ann.originalText || ann.originalText.trim().length === 0) return;

            const newElements: React.ReactNode[] = [];
            elements.forEach((el) => {
              if (typeof el !== 'string') {
                newElements.push(el);
                return;
              }

              const index = el.indexOf(ann.originalText);
              if (index === -1) {
                newElements.push(el);
              } else {
                const before = el.substring(0, index);
                const match = el.substring(index, index + ann.originalText.length);
                const after = el.substring(index + ann.originalText.length);

                const badge = getErrorTypeBadge(ann.errorType);
                const isSelected = selectedAnnotation?.id === ann.id;

                if (before) newElements.push(before);

                newElements.push(
                  <mark
                    key={`${ann.id}-${index}`}
                    onClick={() => {
                      audioFX.playInspect();
                      setSelectedAnnotation(ann);
                    }}
                    className={`inline-block px-2 py-0.5 rounded cursor-pointer transition-all border font-bold ${badge.color} ${
                      isSelected
                        ? 'ring-2 ring-zinc-950 dark:ring-white scale-[1.02] shadow-sm'
                        : 'hover:brightness-95 hover:scale-[1.01]'
                    }`}
                  >
                    {match}
                  </mark>
                );

                if (after) newElements.push(after);
              }
            });
            elements = newElements;
          });

          return <p key={pIdx}>{elements}</p>;
        })}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Top Navigation & Action */}
      <div className="flex items-center justify-between border-b border-zinc-300 dark:border-zinc-700 pb-4">
        <button
          type="button"
          onClick={() => {
            audioFX.playClick();
            onRetry();
          }}
          className="flex items-center gap-2 text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100 hover:text-zinc-950 dark:hover:text-white transition-colors"
        >
          <ArrowLeft weight="bold" size={20} />
          <span>Quay lại phòng thi / Viết lại bài</span>
        </button>


        <div className="flex items-center gap-2">
          <span className="text-sm sm:text-base text-zinc-900 dark:text-zinc-100 font-bold">
            {topic.type.toUpperCase()} • <span>{result.stats.wordCount}</span> từ • <span>{Math.round(result.stats.timeSpentSeconds / 60)}</span> phút làm bài
          </span>
        </div>
      </div>

      {/* Main Score Overview Card */}
      <div className="border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 p-6 sm:p-7 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Big Overall Band Display (4 Cols) */}
          <div className="md:col-span-4 border-b md:border-b-0 md:border-r border-zinc-300 dark:border-zinc-700 pb-5 md:pb-0 md:pr-6 text-center md:text-left">
            <div className="text-xs sm:text-sm uppercase tracking-wider text-zinc-800 dark:text-zinc-200 font-bold mb-1.5">
              Điểm Tổng Kết (Overall Band)
            </div>
            <div className="flex items-baseline gap-3 justify-center md:justify-start">
              <span className="text-6xl sm:text-7xl font-mono font-black tracking-tight text-zinc-950 dark:text-white">
                {result.overallBand.toFixed(1)}
              </span>
              <span className="text-lg font-bold text-zinc-800 dark:text-zinc-200 font-mono">/ 9.0</span>
            </div>
            <div className="mt-3 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-xs sm:text-sm font-bold text-zinc-950 dark:text-white border border-zinc-300 dark:border-zinc-700">
              <SealCheck weight="bold" size={20} className="text-emerald-600 dark:text-emerald-400" />
              <span>{getCEFRLevel(result.overallBand)}</span>
            </div>
          </div>

          {/* 4 Criteria Sub-scores (8 Cols) */}
          <div className="md:col-span-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {/* Task Response */}
              <div className="p-4 border border-sky-300 dark:border-sky-800 rounded-md bg-sky-50 dark:bg-sky-950/60">
                <div className="flex items-center justify-between text-xs sm:text-sm text-sky-950 dark:text-sky-200 mb-1">
                  <span className="font-bold">Task Response</span>
                  <Target weight="bold" size={18} />
                </div>
                <div className="text-3xl sm:text-4xl font-mono font-bold text-sky-950 dark:text-sky-100">
                  {result.criteria.taskResponse.band.toFixed(1)}
                </div>
                <p className="text-xs text-sky-900 dark:text-sky-300 mt-1 font-bold">Mức độ hoàn thành</p>
              </div>

              {/* Coherence & Cohesion */}
              <div className="p-4 border border-indigo-300 dark:border-indigo-800 rounded-md bg-indigo-50 dark:bg-indigo-950/60">
                <div className="flex items-center justify-between text-xs sm:text-sm text-indigo-950 dark:text-indigo-200 mb-1">
                  <span className="font-bold">Coherence</span>
                  <GitFork weight="bold" size={18} />
                </div>
                <div className="text-3xl sm:text-4xl font-mono font-bold text-indigo-950 dark:text-indigo-100">
                  {result.criteria.coherenceCohesion.band.toFixed(1)}
                </div>
                <p className="text-xs text-indigo-900 dark:text-indigo-300 mt-1 font-bold">Mạch lạc & Bố cục</p>
              </div>

              {/* Lexical Resource */}
              <div className="p-4 border border-amber-300 dark:border-amber-800 rounded-md bg-amber-50 dark:bg-amber-950/60">
                <div className="flex items-center justify-between text-xs sm:text-sm text-amber-950 dark:text-amber-200 mb-1">
                  <span className="font-bold">Lexical Res.</span>
                  <Translate weight="bold" size={18} />
                </div>
                <div className="text-3xl sm:text-4xl font-mono font-bold text-amber-950 dark:text-amber-100">
                  {result.criteria.lexicalResource.band.toFixed(1)}
                </div>
                <p className="text-xs text-amber-900 dark:text-amber-300 mt-1 font-bold">Vốn từ vựng</p>
              </div>

              {/* Grammatical Range & Accuracy */}
              <div className="p-4 border border-red-300 dark:border-red-800 rounded-md bg-red-50 dark:bg-red-950/60">
                <div className="flex items-center justify-between text-xs sm:text-sm text-red-950 dark:text-red-200 mb-1">
                  <span className="font-bold">Grammar</span>
                  <WarningCircle weight="bold" size={18} />
                </div>
                <div className="text-3xl sm:text-4xl font-mono font-bold text-red-950 dark:text-red-100">
                  {result.criteria.grammaticalRangeAccuracy.band.toFixed(1)}
                </div>
                <p className="text-xs text-red-900 dark:text-red-300 mt-1 font-bold">Độ chuẩn ngữ pháp</p>
              </div>
            </div>

            {/* Examiner High-Level Summary */}
            <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-700 text-sm sm:text-base leading-relaxed font-normal text-zinc-950 dark:text-zinc-50">
              <strong className="text-zinc-950 dark:text-white font-bold">Nhận xét tổng quát của Giám Khảo: </strong>
              {result.examinerSummary}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Controller */}
      <div className="flex items-center gap-1 border-b border-zinc-300 dark:border-zinc-700 text-sm sm:text-base font-bold overflow-x-auto">
        <button
          type="button"
          onClick={() => {
            audioFX.playClick();
            setActiveTab('inline');
          }}
          className={`px-5 py-3.5 border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'inline'
              ? 'border-zinc-950 dark:border-white text-zinc-950 dark:text-white font-bold'
              : 'border-transparent text-zinc-800 dark:text-zinc-200 hover:text-zinc-950 dark:hover:text-white'
          }`}
        >
          <FileText weight="bold" size={20} />
          <span>Sửa Lỗi Trực Tiếp ({result.inlineAnnotations.length} điểm)</span>
        </button>

        <button
          type="button"
          onClick={() => {
            audioFX.playClick();
            setActiveTab('criteria');
          }}
          className={`px-5 py-3.5 border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'criteria'
              ? 'border-zinc-950 dark:border-white text-zinc-950 dark:text-white font-bold'
              : 'border-transparent text-zinc-800 dark:text-zinc-200 hover:text-zinc-950 dark:hover:text-white'
          }`}
        >
          <ChartLineUp weight="bold" size={20} />
          <span>Phân Tích 4 Tiêu Chí Chi Tiết</span>
        </button>

        <button
          type="button"
          onClick={() => {
            audioFX.playClick();
            setActiveTab('rewrites');
          }}
          className={`px-5 py-3.5 border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'rewrites'
              ? 'border-zinc-950 dark:border-white text-zinc-950 dark:text-white font-bold'
              : 'border-transparent text-zinc-800 dark:text-zinc-200 hover:text-zinc-950 dark:hover:text-white'
          }`}
        >
          <Lightbulb weight="bold" size={20} />
          <span>Bài Viết Mẫu Nâng Band (7.5 & 8.5)</span>
        </button>

        <button
          type="button"
          onClick={() => {
            audioFX.playClick();
            setActiveTab('error_vault');
          }}
          className={`px-5 py-3.5 border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'error_vault'
              ? 'border-zinc-950 dark:border-white text-zinc-950 dark:text-white font-bold'
              : 'border-transparent text-zinc-800 dark:text-zinc-200 hover:text-zinc-950 dark:hover:text-white'
          }`}
        >
          <BookBookmark weight="bold" size={20} />
          <span>Sổ Tay Lỗi Sai Cần Ghi Nhớ</span>
        </button>
      </div>


      {/* Tab 1: Interactive Inline Annotated Essay */}
      {activeTab === 'inline' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Essay Area with Annotations (7 cols) */}
          <div className="lg:col-span-7 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 p-6 sm:p-7 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-700">
              <span className="text-sm sm:text-base font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                Bản thảo có đánh dấu lỗi & điểm sáng
              </span>
              <div className="flex items-center gap-3 text-xs sm:text-sm font-bold">
                <span className="flex items-center gap-1.5 text-red-700 dark:text-red-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-600" /> Ngữ pháp
                </span>
                <span className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-600" /> Từ vựng
                </span>
                <span className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" /> Liên kết
                </span>
                <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" /> Band 8+
                </span>
              </div>
            </div>

            {/* Click to inspect tip */}
            <div className="p-4 bg-zinc-100 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-md text-sm sm:text-base text-zinc-950 dark:text-zinc-100 font-semibold leading-relaxed">
              💡 Bấm trực tiếp vào bất kỳ đoạn được bôi màu nào dưới đây để xem giải thích chi tiết và gợi ý nâng cấp câu Band 8.5.
            </div>

            {renderAnnotatedEssay()}
          </div>

          {/* Inline Inspector Card (5 cols) */}
          <div className="lg:col-span-5 space-y-4 sticky top-20">
            {selectedAnnotation ? (
              <div className="border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-700">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs sm:text-sm font-bold px-3 py-1 rounded border ${
                        getErrorTypeBadge(selectedAnnotation.errorType).color
                      }`}
                    >
                      {selectedAnnotation.categoryName}
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedAnnotation(null)}
                    className="p-1 text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white"
                  >
                    <X weight="bold" size={20} />
                  </button>
                </div>

                {/* Original Quote */}
                <div>
                  <div className="text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 uppercase font-bold mb-1.5">
                    Đoạn văn trong bài của bạn:
                  </div>
                  <div className="p-4 bg-zinc-100 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-md text-base font-semibold text-zinc-950 dark:text-white">
                    &quot;{selectedAnnotation.originalText}&quot;
                  </div>
                </div>

                {/* Explanation */}
                <div>
                  <div className="text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 uppercase font-bold mb-1.5">
                    Giải thích học thuật & Lý do sửa:
                  </div>
                  <p className="text-base text-zinc-950 dark:text-zinc-100 leading-relaxed font-normal">
                    {selectedAnnotation.explanation}
                  </p>
                </div>

                {/* Suggested Fix */}
                <div className="p-4 bg-zinc-100 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-md space-y-1">
                  <div className="text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 uppercase font-bold">
                    Cách sửa chuẩn ngữ pháp:
                  </div>
                  <div className="text-base sm:text-lg font-bold text-zinc-950 dark:text-white">
                    {selectedAnnotation.suggestedFix}
                  </div>
                </div>

                {/* Band 8.5 Alternative */}
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-md space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-bold text-emerald-950 dark:text-emerald-200 uppercase flex items-center gap-1.5">
                      <SealCheck weight="bold" size={18} /> Gợi ý nâng cấp Band 8.5+:
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(selectedAnnotation.band8Alternative, selectedAnnotation.id)}
                      className="text-xs sm:text-sm font-bold text-emerald-900 dark:text-emerald-300 hover:underline flex items-center gap-1"
                    >
                      {copiedText === selectedAnnotation.id ? (
                        <>
                          <Check weight="bold" size={16} /> Đã sao chép
                        </>
                      ) : (
                        <>
                          <Copy weight="bold" size={16} /> Sao chép
                        </>
                      )}
                    </button>
                  </div>
                  <div className="text-base sm:text-lg font-serif font-medium italic text-emerald-950 dark:text-emerald-100 leading-relaxed">
                    &quot;{selectedAnnotation.band8Alternative}&quot;
                  </div>
                </div>
              </div>
            ) : (
              <div className="border border-dashed border-zinc-400 dark:border-zinc-700 rounded-lg p-10 text-center text-zinc-800 dark:text-zinc-200 text-base space-y-3 bg-zinc-50/50 dark:bg-zinc-900/50">
                <Lightbulb weight="bold" size={40} className="mx-auto text-zinc-800 dark:text-zinc-200" />
                <p className="font-bold text-zinc-950 dark:text-white text-lg">
                  Chọn một điểm bôi màu trên bài viết
                </p>
                <p className="text-sm sm:text-base text-zinc-800 dark:text-zinc-200 max-w-xs mx-auto font-medium leading-relaxed">
                  Hệ thống sẽ hiển thị phân tích lỗi, cơ sở lý thuyết và phương án viết lại mức Band 8.5 tại đây.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Detailed 4-Criteria Breakdown */}
      {activeTab === 'criteria' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(result.criteria).map(([key, criterion]) => (
            <div
              key={key}
              className="border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 p-6 sm:p-7 shadow-xs space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-700">
                <span className="text-lg font-bold text-zinc-950 dark:text-white">
                  {criterion.label}
                </span>
                <span className="text-base sm:text-lg font-mono font-bold px-3.5 py-1 rounded bg-zinc-950 text-white dark:bg-white dark:text-zinc-950">
                  Band {criterion.band.toFixed(1)}
                </span>
              </div>

              <p className="text-base text-zinc-950 dark:text-zinc-100 leading-relaxed font-normal">
                {criterion.feedback}
              </p>

              {criterion.strengths && criterion.strengths.length > 0 && (
                <div className="pt-2">
                  <div className="text-xs sm:text-sm uppercase text-emerald-800 dark:text-emerald-400 font-bold mb-2">
                    ✓ Điểm mạnh đạt được:
                  </div>
                  <ul className="text-sm sm:text-base text-zinc-900 dark:text-zinc-100 space-y-2 font-medium">
                    {criterion.strengths.map((s, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">•</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {criterion.weaknesses && criterion.weaknesses.length > 0 && (
                <div className="pt-2">
                  <div className="text-xs sm:text-sm uppercase text-red-800 dark:text-red-400 font-bold mb-2">
                    ⚠ Điểm cần khắc phục:
                  </div>
                  <ul className="text-sm sm:text-base text-zinc-900 dark:text-zinc-100 space-y-2 font-medium">
                    {criterion.weaknesses.map((w, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <span className="text-red-600 dark:text-red-400 font-bold">•</span>
                        <span>{w}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Model Rewrites (Band 7.5 & 8.5) */}
      {activeTab === 'rewrites' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Band 7.5 Version */}
            <div className="border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 p-6 sm:p-7 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-700">
                <span className="text-lg font-bold text-zinc-950 dark:text-white flex items-center gap-2">
                  <SealCheck weight="bold" size={20} /> Phiên Bản Nâng Cấp Band 7.5
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(result.sampleRewrites.band75Version, 'band75')}
                  className="text-xs sm:text-sm font-bold text-zinc-800 dark:text-zinc-200 hover:text-zinc-950 dark:hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded border border-zinc-300 dark:border-zinc-700"
                >
                  {copiedText === 'band75' ? <Check weight="bold" size={16} /> : <Copy weight="bold" size={16} />}
                  <span>{copiedText === 'band75' ? 'Đã sao chép' : 'Sao chép'}</span>
                </button>
              </div>
              <p className="text-base sm:text-lg text-zinc-950 dark:text-zinc-50 leading-[1.9] font-serif font-normal whitespace-pre-wrap">
                {result.sampleRewrites.band75Version}
              </p>
            </div>

            {/* Band 8.5 Version */}
            <div className="border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 p-6 sm:p-7 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-700">
                <span className="text-lg font-bold text-zinc-950 dark:text-white flex items-center gap-2">
                  <SealCheck weight="bold" size={20} className="text-emerald-600 dark:text-emerald-400" /> Phiên Bản Chuẩn Giám Khảo Band 8.5+
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(result.sampleRewrites.band85Version, 'band85')}
                  className="text-xs sm:text-sm font-bold text-zinc-800 dark:text-zinc-200 hover:text-zinc-950 dark:hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded border border-zinc-300 dark:border-zinc-700"
                >
                  {copiedText === 'band85' ? <Check weight="bold" size={16} /> : <Copy weight="bold" size={16} />}
                  <span>{copiedText === 'band85' ? 'Đã sao chép' : 'Sao chép'}</span>
                </button>
              </div>
              <p className="text-base sm:text-lg text-zinc-950 dark:text-zinc-50 leading-[1.9] font-serif font-normal whitespace-pre-wrap">
                {result.sampleRewrites.band85Version}
              </p>
            </div>
          </div>

          {/* Key Upgrades Summary */}
          {result.sampleRewrites.keyUpgrades && result.sampleRewrites.keyUpgrades.length > 0 && (
            <div className="border border-zinc-300 dark:border-zinc-700 rounded-lg bg-zinc-100 dark:bg-zinc-950 p-6 sm:p-7 space-y-3">
              <div className="text-base font-bold uppercase tracking-wider text-zinc-950 dark:text-white">
                Các bước chuyển đổi kỹ thuật từ bài làm lên Band 8.5:
              </div>
              <ul className="text-base text-zinc-900 dark:text-zinc-100 space-y-2.5 font-medium leading-relaxed">
                {result.sampleRewrites.keyUpgrades.map((upgrade, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="font-bold text-sm mt-0.5">[{idx + 1}]</span>
                    <span>{upgrade}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Personal Error Vault */}
      {activeTab === 'error_vault' && (
        <div className="border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 p-6 sm:p-7 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-700">
            <div>
              <h3 className="text-lg font-bold text-zinc-950 dark:text-white">
                Sổ Tay Lỗi Sai Cần Tránh Cho Bài Viết Tiếp Theo
              </h3>
              <p className="text-sm sm:text-base text-zinc-800 dark:text-zinc-200 font-medium">
                Hệ thống tự động phân loại các lỗi phát hiện trong bài viết này để bạn ôn luyện.
              </p>
            </div>
            <span className="text-sm font-bold px-3 py-1.5 bg-zinc-200 dark:bg-zinc-800 rounded text-zinc-950 dark:text-white">
              Tổng số: {result.inlineAnnotations.length} ghi chú
            </span>
          </div>

          <div className="space-y-4">
            {result.inlineAnnotations.map((item, idx) => (
              <div
                key={idx}
                className="p-5 border border-zinc-300 dark:border-zinc-700 rounded-md bg-zinc-50 dark:bg-zinc-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-base"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`text-xs sm:text-sm font-bold px-3 py-0.5 rounded border ${
                        getErrorTypeBadge(item.errorType).color
                      }`}
                    >
                      {item.categoryName}
                    </span>
                    <span className="text-zinc-950 dark:text-white font-bold text-sm sm:text-base">
                      &quot;{item.originalText}&quot;
                    </span>
                  </div>
                  <p className="text-zinc-950 dark:text-zinc-100 font-normal leading-relaxed">{item.explanation}</p>
                </div>

                <div className="shrink-0 text-left sm:text-right w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-zinc-300 dark:border-zinc-700">
                  <span className="text-xs uppercase font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Sửa thành:</span>
                  <span className="font-bold text-zinc-950 dark:text-white text-base sm:text-lg">
                    {item.suggestedFix}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
