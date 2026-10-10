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
  ArrowsLeftRight,
  TrendDown,
  TrendUp,
} from '@phosphor-icons/react';
import { EvaluationResult, InlineAnnotation, Topic, ErrorType, WritingHistoryItem } from '@/types/ielts';
import { audioFX } from '@/lib/audio';
import { summarizeRevision } from '@/lib/revisions';

interface EvaluationViewProps {
  result: EvaluationResult;
  topic: Topic;
  originalEssay: string;
  previousAttempt: WritingHistoryItem | null;
  onRetry: () => void;
}

export default function EvaluationView({
  result,
  topic,
  originalEssay,
  previousAttempt,
  onRetry,
}: EvaluationViewProps) {
  const [activeTab, setActiveTab] = useState<'inline' | 'criteria' | 'rewrites' | 'error_vault' | 'revision'>('inline');
  const [selectedAnnotation, setSelectedAnnotation] = useState<InlineAnnotation | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const revision = previousAttempt ? summarizeRevision(previousAttempt, result) : null;

  const formatDelta = (value: number) => `${value > 0 ? '+' : ''}${value.toFixed(1)}`;

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

    const annotations = [...result.inlineAnnotations]
      .filter((ann) =>
        ann.sourceStart >= 0 &&
        ann.sourceEnd > ann.sourceStart &&
        ann.sourceEnd <= originalEssay.length &&
        originalEssay.slice(ann.sourceStart, ann.sourceEnd) === ann.originalText
      )
      .sort((a, b) => a.sourceStart - b.sourceStart || a.sourceEnd - b.sourceEnd);
    const elements: React.ReactNode[] = [];
    let cursor = 0;

    annotations.forEach((ann) => {
      // Do not render overlapping marks: the verifier should prevent them, but
      // keeping the essay readable is safer than nesting interactive controls.
      if (ann.sourceStart < cursor) return;
      if (ann.sourceStart > cursor) elements.push(originalEssay.slice(cursor, ann.sourceStart));

      const badge = getErrorTypeBadge(ann.errorType);
      const isSelected = selectedAnnotation?.id === ann.id;
      elements.push(
        <button
          key={`${ann.id}-${ann.sourceStart}`}
          type="button"
          onClick={() => {
            audioFX.playInspect();
            setSelectedAnnotation(ann);
          }}
          aria-label={`Xem giải thích: ${ann.categoryName}`}
          className={`inline px-1.5 py-0.5 rounded cursor-pointer transition-all border font-bold ${badge.color} ${
            isSelected
              ? 'ring-2 ring-zinc-950 dark:ring-white shadow-sm'
              : 'hover:brightness-95'
          }`}
        >
          {ann.originalText}
        </button>
      );
      cursor = ann.sourceEnd;
    });

    if (cursor < originalEssay.length) elements.push(originalEssay.slice(cursor));

    return (
      <div className="whitespace-pre-wrap text-base sm:text-lg leading-[1.9] text-zinc-950 dark:text-zinc-50 font-normal">
        {elements}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-5 sm:py-8 space-y-5 sm:space-y-6">
      <div
        className={`rounded-lg border p-4 text-sm sm:text-base leading-relaxed font-medium ${
          result.metadata.mode === 'demo'
            ? 'border-amber-300 bg-amber-50 text-amber-950 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-100'
            : 'border-sky-300 bg-sky-50 text-sky-950 dark:border-sky-800 dark:bg-sky-950/50 dark:text-sky-100'
        }`}
      >
        <p className="font-bold">
          {result.metadata.mode === 'demo' ? 'Kết quả Demo — độ tin cậy thấp' : 'Ước lượng AI — cần đối chiếu khi cần điểm chính thức'}
        </p>
        <ul className="mt-1 list-disc pl-5">
          {result.metadata.notices.map((notice) => <li key={notice}>{notice}</li>)}
        </ul>
      </div>
      {revision && (
        <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-4 text-emerald-950 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-100">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="flex items-center gap-2 font-bold"><ArrowsLeftRight weight="bold" size={20} /> Kết quả sau khi sửa bài</p>
              <p className="mt-1 text-sm leading-relaxed">Band {revision.previousOverallBand.toFixed(1)} → {result.overallBand.toFixed(1)} ({formatDelta(revision.overallBandDelta)}).</p>
            </div>
            <button
              type="button"
              onClick={() => {
                audioFX.playClick();
                setActiveTab('revision');
              }}
              className="rounded-md border border-emerald-400 bg-white px-3 py-2 text-sm font-bold text-emerald-950 hover:bg-emerald-100 dark:border-emerald-700 dark:bg-zinc-900 dark:text-emerald-100 dark:hover:bg-emerald-950"
            >
              Xem so sánh
            </button>
          </div>
        </div>
      )}
      {/* Top Navigation & Action */}
      <div className="flex flex-col items-start gap-3 border-b border-zinc-300 dark:border-zinc-700 pb-4 sm:flex-row sm:items-center sm:justify-between">
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
          <span className="text-xs sm:text-base text-zinc-900 dark:text-zinc-100 font-bold">
            {topic.type.toUpperCase()} • <span>{result.stats.wordCount}</span> từ • <span>{Math.round(result.stats.timeSpentSeconds / 60)}</span> phút làm bài
          </span>
        </div>
      </div>

      {/* Main Score Overview Card */}
      <div className="border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 p-4 sm:p-7 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6 items-center">
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
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
              {/* Task Response */}
              <div className="p-3 sm:p-4 border border-sky-300 dark:border-sky-800 rounded-md bg-sky-50 dark:bg-sky-950/60">
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
              <div className="p-3 sm:p-4 border border-indigo-300 dark:border-indigo-800 rounded-md bg-indigo-50 dark:bg-indigo-950/60">
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
              <div className="p-3 sm:p-4 border border-amber-300 dark:border-amber-800 rounded-md bg-amber-50 dark:bg-amber-950/60">
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
              <div className="p-3 sm:p-4 border border-red-300 dark:border-red-800 rounded-md bg-red-50 dark:bg-red-950/60">
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
      <div className="-mx-4 px-4 flex items-center gap-1 border-b border-zinc-300 dark:border-zinc-700 text-sm sm:text-base font-bold overflow-x-auto [scrollbar-width:thin]">
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
        {revision && (
          <button
            type="button"
            onClick={() => {
              audioFX.playClick();
              setActiveTab('revision');
            }}
            className={`px-5 py-3.5 border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'revision'
                ? 'border-zinc-950 dark:border-white text-zinc-950 dark:text-white font-bold'
                : 'border-transparent text-zinc-800 dark:text-zinc-200 hover:text-zinc-950 dark:hover:text-white'
            }`}
          >
            <ArrowsLeftRight weight="bold" size={20} />
            <span>So Sánh Bản Sửa</span>
          </button>
        )}
      </div>


      {/* Tab 1: Interactive Inline Annotated Essay */}
      {activeTab === 'inline' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 items-start">
          {/* Essay Area with Annotations (7 cols) */}
          <div className="lg:col-span-7 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 p-4 sm:p-7 shadow-xs space-y-5">
            <div className="flex flex-col items-start gap-3 pb-3 border-b border-zinc-200 dark:border-zinc-700 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-sm sm:text-base font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                Bản thảo có đánh dấu lỗi & điểm sáng
              </span>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm font-bold">
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
          <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-20">
            {selectedAnnotation ? (
              <div className="border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 p-4 sm:p-6 shadow-xs space-y-4">
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
              <div className="border border-dashed border-zinc-400 dark:border-zinc-700 rounded-lg p-6 sm:p-10 text-center text-zinc-800 dark:text-zinc-200 text-base space-y-3 bg-zinc-50/50 dark:bg-zinc-900/50">
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
              className="border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 p-4 sm:p-7 shadow-xs space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-zinc-200 dark:border-zinc-700">
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
            <div className="border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 p-4 sm:p-7 shadow-xs space-y-4">
              <div className="flex flex-col items-start gap-3 pb-3 border-b border-zinc-200 dark:border-zinc-700 sm:flex-row sm:items-center sm:justify-between">
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
            <div className="border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 p-4 sm:p-7 shadow-xs space-y-4">
              <div className="flex flex-col items-start gap-3 pb-3 border-b border-zinc-200 dark:border-zinc-700 sm:flex-row sm:items-center sm:justify-between">
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
            <div className="border border-zinc-300 dark:border-zinc-700 rounded-lg bg-zinc-100 dark:bg-zinc-950 p-4 sm:p-7 space-y-3">
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
        <div className="border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 p-4 sm:p-7 shadow-xs space-y-5">
          <div className="flex flex-col items-start gap-3 pb-3 border-b border-zinc-200 dark:border-zinc-700 sm:flex-row sm:items-center sm:justify-between">
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
                  <div className="flex flex-wrap items-center gap-2.5">
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

      {activeTab === 'revision' && revision && previousAttempt && (
        <div className="space-y-5">
          <div className="border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 p-4 sm:p-7 shadow-xs">
            <div className="flex items-start gap-3">
              {revision.overallBandDelta >= 0 ? <TrendUp weight="bold" size={24} className="mt-0.5 text-emerald-600 dark:text-emerald-400" /> : <TrendDown weight="bold" size={24} className="mt-0.5 text-red-600 dark:text-red-400" />}
              <div>
                <h3 className="text-lg font-bold text-zinc-950 dark:text-white">Tác động của lần sửa bài</h3>
                <p className="mt-1 text-sm sm:text-base text-zinc-800 dark:text-zinc-200">So sánh này chỉ phản ánh hai lần chấm liên tiếp cùng đề; với kết quả Demo, hãy dùng nó để theo dõi quy tắc phát hiện được thay vì xem như thay đổi band chính thức.</p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
              {[
                ['Overall', revision.overallBandDelta],
                ['TR', revision.criteriaDeltas.taskResponse],
                ['CC', revision.criteriaDeltas.coherenceCohesion],
                ['LR', revision.criteriaDeltas.lexicalResource],
                ['GRA', revision.criteriaDeltas.grammaticalRangeAccuracy],
              ].map(([label, delta]) => {
                const value = Number(delta);
                return (
                  <div key={String(label)} className={`rounded-md border p-3 ${value >= 0 ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/50' : 'border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950/50'}`}>
                    <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">{label}</p>
                    <p className={`mt-1 text-2xl font-black tabular-nums ${value >= 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-700 dark:text-red-300'}`}>{formatDelta(value)}</p>
                  </div>
                );
              })}
            </div>

            <p className="mt-4 text-sm font-semibold text-zinc-800 dark:text-zinc-200">Số từ: {previousAttempt.result.stats.wordCount} → {result.stats.wordCount} ({revision.wordCountDelta > 0 ? '+' : ''}{revision.wordCountDelta})</p>

            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <div className="rounded-md border border-emerald-300 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950/50">
                <p className="font-bold text-emerald-950 dark:text-emerald-100">Nhóm lỗi không còn xuất hiện</p>
                {revision.resolvedErrorCategories.length > 0 ? <p className="mt-2 text-sm leading-relaxed text-emerald-950 dark:text-emerald-100">{revision.resolvedErrorCategories.join(' · ')}</p> : <p className="mt-2 text-sm text-emerald-950 dark:text-emerald-100">Chưa xác định được nhóm lỗi đã khắc phục.</p>}
              </div>
              <div className="rounded-md border border-amber-300 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/50">
                <p className="font-bold text-amber-950 dark:text-amber-100">Nhóm lỗi vẫn lặp lại</p>
                {revision.recurringErrorCategories.length > 0 ? <p className="mt-2 text-sm leading-relaxed text-amber-950 dark:text-amber-100">{revision.recurringErrorCategories.join(' · ')}</p> : <p className="mt-2 text-sm text-amber-950 dark:text-amber-100">Không có nhóm lỗi lặp lại trong annotation hiện tại.</p>}
              </div>
            </div>
          </div>

          <div className="border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 p-4 sm:p-7 shadow-xs">
            <h3 className="text-lg font-bold text-zinc-950 dark:text-white">Bản so sánh theo đoạn</h3>
            <p className="mt-1 text-sm sm:text-base text-zinc-800 dark:text-zinc-200">Các đoạn khác nhau được tô nền để bạn tập trung vào những phần đã chỉnh sửa.</p>
            <div className="mt-5 space-y-5">
              {Array.from({ length: Math.max(previousAttempt.essay.split(/\n\s*\n/).length, originalEssay.split(/\n\s*\n/).length) }, (_, index) => {
                const before = previousAttempt.essay.split(/\n\s*\n/)[index] ?? '';
                const after = originalEssay.split(/\n\s*\n/)[index] ?? '';
                const changed = before !== after;
                return (
                  <div key={index} className="grid gap-3 lg:grid-cols-2">
                    <article className={`rounded-md border p-4 ${changed ? 'border-red-300 bg-red-50 dark:border-red-900 dark:bg-red-950/30' : 'border-zinc-300 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950'}`}>
                      <p className="mb-2 text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Trước · Đoạn {index + 1}</p>
                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-950 dark:text-zinc-50">{before || '— Chưa có đoạn tương ứng —'}</p>
                    </article>
                    <article className={`rounded-md border p-4 ${changed ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/30' : 'border-zinc-300 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950'}`}>
                      <p className="mb-2 text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Sau · Đoạn {index + 1}</p>
                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-950 dark:text-zinc-50">{after || '— Đã xóa đoạn này —'}</p>
                    </article>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
