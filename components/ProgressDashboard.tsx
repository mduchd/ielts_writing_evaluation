'use client';

import React, { useMemo } from 'react';
import { BookBookmark, ChartLineUp, Clock, Trash, TrendUp, WarningCircle, X } from '@phosphor-icons/react';
import { WritingHistoryItem } from '@/types/ielts';
import { audioFX } from '@/lib/audio';

interface ProgressDashboardProps {
  isOpen: boolean;
  history: WritingHistoryItem[];
  onClose: () => void;
  onClearHistory: () => void;
}

const formatDate = (date: string) => new Intl.DateTimeFormat('vi-VN', {
  dateStyle: 'medium',
  timeStyle: 'short',
}).format(new Date(date));

export default function ProgressDashboard({
  isOpen,
  history,
  onClose,
  onClearHistory,
}: ProgressDashboardProps) {
  const insights = useMemo(() => {
    if (history.length === 0) return null;

    const attempts = [...history].sort((a, b) => +new Date(b.savedAt) - +new Date(a.savedAt));
    const average = (values: number[]) => values.reduce((sum, value) => sum + value, 0) / values.length;
    const bands = {
      taskResponse: average(attempts.map((item) => item.result.criteria.taskResponse.band)),
      coherenceCohesion: average(attempts.map((item) => item.result.criteria.coherenceCohesion.band)),
      lexicalResource: average(attempts.map((item) => item.result.criteria.lexicalResource.band)),
      grammaticalRangeAccuracy: average(attempts.map((item) => item.result.criteria.grammaticalRangeAccuracy.band)),
    };
    const errorCounts = new Map<string, number>();
    attempts.forEach((item) => item.result.inlineAnnotations.forEach((annotation) => {
      if (annotation.errorType === 'excellence') return;
      errorCounts.set(annotation.categoryName, (errorCounts.get(annotation.categoryName) ?? 0) + 1);
    }));
    const repeatedErrors = [...errorCounts.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 5);

    return {
      attempts,
      bands,
      overall: average(attempts.map((item) => item.result.overallBand)),
      repeatedErrors,
    };
  }, [history]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 sm:p-5">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="progress-dashboard-title"
        className="w-full max-w-5xl max-h-[calc(100dvh-1.5rem)] overflow-y-auto rounded-lg border border-zinc-300 bg-white text-zinc-950 shadow-2xl dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
      >
        <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-zinc-300 bg-zinc-100 px-4 py-4 dark:border-zinc-700 dark:bg-zinc-950 sm:px-6">
          <div className="flex min-w-0 items-center gap-2.5">
            <ChartLineUp weight="bold" size={22} />
            <div>
              <h2 id="progress-dashboard-title" className="text-base font-bold sm:text-lg">Tiến độ luyện Writing</h2>
              <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Lưu cục bộ trên trình duyệt này</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              audioFX.playClick();
              onClose();
            }}
            aria-label="Đóng bảng tiến độ"
            className="rounded-md p-1.5 text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white"
          >
            <X weight="bold" size={20} />
          </button>
        </header>

        {!insights ? (
          <div className="px-6 py-14 text-center sm:px-10">
            <BookBookmark weight="bold" size={40} className="mx-auto mb-4 text-zinc-500" />
            <h3 className="text-lg font-bold">Chưa có bài viết đã chấm</h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
              Sau mỗi lần nộp bài, kết quả sẽ xuất hiện ở đây để theo dõi band và lỗi lặp lại.
            </p>
          </div>
        ) : (
          <div className="space-y-6 p-4 sm:p-6">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <div className="rounded-lg border border-zinc-300 bg-zinc-50 p-5 dark:border-zinc-700 dark:bg-zinc-950 lg:col-span-1">
                <div className="flex items-center gap-2 text-sm font-bold text-zinc-700 dark:text-zinc-300">
                  <TrendUp weight="bold" size={19} /> Band trung bình
                </div>
                <p className="mt-2 text-5xl font-black tabular-nums">{insights.overall.toFixed(1)}</p>
                <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">trên {history.length} bài đã lưu</p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:col-span-2">
                {[
                  ['TR', 'Task Response', insights.bands.taskResponse, 'bg-sky-50 border-sky-300 dark:bg-sky-950/60 dark:border-sky-800'],
                  ['CC', 'Coherence', insights.bands.coherenceCohesion, 'bg-indigo-50 border-indigo-300 dark:bg-indigo-950/60 dark:border-indigo-800'],
                  ['LR', 'Lexical', insights.bands.lexicalResource, 'bg-amber-50 border-amber-300 dark:bg-amber-950/60 dark:border-amber-800'],
                  ['GRA', 'Grammar', insights.bands.grammaticalRangeAccuracy, 'bg-red-50 border-red-300 dark:bg-red-950/60 dark:border-red-800'],
                ].map(([short, label, band, color]) => (
                  <div key={String(short)} className={`rounded-lg border p-3 ${color}`}>
                    <p className="text-xs font-bold">{short}</p>
                    <p className="mt-1 text-2xl font-black tabular-nums">{Number(band).toFixed(1)}</p>
                    <p className="mt-1 text-xs font-medium text-zinc-700 dark:text-zinc-300">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-zinc-300 p-5 dark:border-zinc-700">
              <div className="flex items-start gap-2.5">
                <WarningCircle weight="bold" size={21} className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
                <div>
                  <h3 className="font-bold">Lỗi cần ưu tiên ôn</h3>
                  <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">Tổng hợp từ các annotation đã xuất hiện nhiều lần trong lịch sử.</p>
                </div>
              </div>
              {insights.repeatedErrors.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {insights.repeatedErrors.map(([category, count]) => (
                    <span key={category} className="rounded-full border border-amber-300 bg-amber-50 px-3 py-1.5 text-sm font-bold text-amber-950 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-100">
                      {category} · {count} lần
                    </span>
                  ))}
                </div>
              ) : <p className="mt-4 text-sm text-zinc-700 dark:text-zinc-300">Chưa đủ annotation để rút ra mẫu lỗi.</p>}
            </div>

            <div className="rounded-lg border border-zinc-300 dark:border-zinc-700">
              <div className="flex items-center justify-between gap-3 border-b border-zinc-300 px-4 py-3 dark:border-zinc-700">
                <h3 className="font-bold">Lần nộp gần đây</h3>
                <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Tối đa 30 bài được lưu</span>
              </div>
              <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {insights.attempts.slice(0, 8).map((item) => (
                  <li key={item.id} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="truncate font-bold">{item.topic.title}</p>
                      <p className="mt-0.5 flex items-center gap-1.5 text-xs text-zinc-700 dark:text-zinc-300"><Clock size={14} />{formatDate(item.savedAt)} · {item.result.stats.wordCount} từ</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`rounded border px-2 py-1 text-xs font-bold ${item.result.metadata.mode === 'demo' ? 'border-amber-300 bg-amber-50 text-amber-950 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-100' : 'border-sky-300 bg-sky-50 text-sky-950 dark:border-sky-800 dark:bg-sky-950/60 dark:text-sky-100'}`}>
                        {item.result.metadata.mode === 'demo' ? 'Demo' : 'AI'}
                      </span>
                      {item.revision && (
                        <span className={`text-xs font-bold ${item.revision.overallBandDelta >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'}`}>
                          {item.revision.overallBandDelta > 0 ? '+' : ''}{item.revision.overallBandDelta.toFixed(1)} so với bản trước
                        </span>
                      )}
                      <span className="text-lg font-black tabular-nums">{item.result.overallBand.toFixed(1)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-3 border-t border-zinc-200 pt-5 dark:border-zinc-700 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs leading-relaxed text-zinc-700 dark:text-zinc-300">Xóa lịch sử sẽ chỉ xóa dữ liệu local của trình duyệt này và không thể hoàn tác.</p>
              <button
                type="button"
                onClick={() => {
                  if (!window.confirm('Xóa toàn bộ lịch sử luyện viết trên thiết bị này?')) return;
                  audioFX.playClick();
                  onClearHistory();
                }}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md border border-red-300 px-4 py-2 text-sm font-bold text-red-700 hover:bg-red-50 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950/40"
              >
                <Trash weight="bold" size={17} /> Xóa lịch sử
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
