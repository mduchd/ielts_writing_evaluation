'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Timer,
  Play,
  Pause,
  ArrowClockwise,
  CheckCircle,
  ChartLineUp,
  PaperPlaneRight,
  Trash,
} from '@phosphor-icons/react';
import { Topic, UserSettings } from '@/types/ielts';
import { audioFX } from '@/lib/audio';


interface ExamWorkspaceProps {
  topic: Topic;
  onUpdateCustomTopic?: (newPrompt: string) => void;
  essayText: string;
  onChangeEssayText: (text: string) => void;
  onSubmitForEvaluation: (timeSpent: number) => void;
  isEvaluating: boolean;
  settings: UserSettings;
}

export default function ExamWorkspace({
  topic,
  onUpdateCustomTopic,
  essayText,
  onChangeEssayText,
  onSubmitForEvaluation,
  isEvaluating,
  settings,
}: ExamWorkspaceProps) {
  // Timer State
  const initialSeconds = topic.timeLimitMinutes * 60;
  const [secondsRemaining, setSecondsRemaining] = useState(initialSeconds);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [hasStartedTyping, setHasStartedTyping] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const hasPlayedMilestoneRef = useRef(false);
  const prevWordCountRef = useRef(0);

  // Reset timer on topic change
  useEffect(() => {
    setSecondsRemaining(topic.timeLimitMinutes * 60);
    setIsTimerRunning(false);
    setHasStartedTyping(false);
    hasPlayedMilestoneRef.current = false;
  }, [topic]);

  // Timer Tick & Audio Alerts
  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev === 300) {
            // Exactly 5 minutes left
            audioFX.playTimerWarning();
          }
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsTimerRunning(false);
            audioFX.playTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChangeEssayText(e.target.value);
    if (!hasStartedTyping && e.target.value.trim().length > 0) {
      setHasStartedTyping(true);
      setIsTimerRunning(true);
    }
  };

  const toggleTimer = () => {
    audioFX.playClick();
    setIsTimerRunning(!isTimerRunning);
  };

  const resetTimer = () => {
    audioFX.playClick();
    setIsTimerRunning(false);
    setSecondsRemaining(topic.timeLimitMinutes * 60);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Word & Character count
  const words = essayText.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const charCount = essayText.length;
  const progressPercent = Math.min(100, Math.round((wordCount / topic.minWords) * 100));
  const isWordCountSufficient = wordCount >= topic.minWords;
  const timeSpentSeconds = topic.timeLimitMinutes * 60 - secondsRemaining;

  // Milestone word goal audio effect (triggers once when crossing threshold)
  useEffect(() => {
    if (wordCount >= topic.minWords && prevWordCountRef.current < topic.minWords && prevWordCountRef.current > 0) {
      if (!hasPlayedMilestoneRef.current) {
        audioFX.playMilestone();
        hasPlayedMilestoneRef.current = true;
      }
    } else if (wordCount < topic.minWords) {
      hasPlayedMilestoneRef.current = false;
    }
    prevWordCountRef.current = wordCount;
  }, [wordCount, topic.minWords]);


  // Dynamic large font sizes based on UserSettings
  const getEditorFontClass = () => {
    const size = settings.fontSize || 'standard';
    if (size === 'xlarge') {
      if (settings.editorFont === 'serif') return 'font-serif text-[21px] leading-[1.95]';
      if (settings.editorFont === 'exam') return 'font-exam text-[20px] leading-[1.85]';
      return 'font-sans text-[20px] leading-[1.9]';
    }
    if (size === 'large') {
      if (settings.editorFont === 'serif') return 'font-serif text-[19px] leading-[1.9]';
      if (settings.editorFont === 'exam') return 'font-exam text-[18px] leading-[1.8]';
      return 'font-sans text-[18px] leading-[1.85]';
    }
    // standard (comfortable 17px default)
    if (settings.editorFont === 'serif') return 'font-serif text-[18px] leading-[1.85]';
    if (settings.editorFont === 'exam') return 'font-exam text-[17px] leading-[1.75]';
    return 'font-sans text-[17px] leading-[1.8]';
  };

  const loadSampleEssay = () => {
    audioFX.playClick();
    if (topic.id === 't2-ai-workplace') {
      onChangeEssayText(
        `In recent years, the rapid advancement of artificial intelligence has sparked intense debate regarding its implications for the global workforce. While some commentators argue that automation will cause widespread job destruction, others believe it will generate unprecedented economic opportunities. This essay will examine both perspectives before presenting my own view.\n\nOn the one hand, skeptics contend that machines and intelligent algorithms are increasingly capable of outperforming humans in routine and cognitive tasks. For instance, customer support roles, repetitive data processing, and even preliminary medical diagnostics are being automated. This could lead to a lot of sudden redundancies, particularly for low-skilled laborers who may find it exceedingly difficult to transition into specialized technology sectors. Furthermore, the speed of technological innovation may outpace educational curricula, creating structural unemployment.\n\nOn the other hand, proponents argue that historical technological revolutions have consistently created more jobs than they destroyed. The emergence of artificial intelligence creates brand-new professions, such as machine learning engineers, prompt architects, and ethical oversight specialists. In my opinion, I think AI should be viewed as an augmentative tool rather than a wholesale replacement. By eliminating tedious administrative burdens, employees can devote greater energy to creative problem-solving and interpersonal engagement.\n\nIn conclusion, while the transition phase entails legitimate economic disruption, I believe that proactive retraining initiatives and governmental policies will enable society to harness AI effectively, leading to net job growth and improved living standards.`
      );
    } else {
      onChangeEssayText(
        `Over the past several decades, the debate over this issue has gained substantial prominence. Proponents maintain that significant advantages can be achieved through coordinated policies, whereas opponents emphasize potential drawbacks.\n\nFirst and foremost, it is clear that structured interventions provide tangible benefits. For instance, empirical research indicates that individuals who receive targeted support demonstrate better outcomes in academic and professional settings. Furthermore, a lot of communities have experienced sustainable development when resources are allocated effectively.\n\nConversely, critics highlight the substantial financial burden associated with broad-scale implementation. Without stringent oversight, such measures may lead to inefficiency and unequal resource distribution.\n\nIn conclusion, while legitimate challenges exist, the long-term benefits clearly outweigh the temporary drawbacks, provided that appropriate regulatory frameworks are instituted.`
      );
    }
    setHasStartedTyping(true);
    setIsTimerRunning(true);
  };

  return (
    <div className="max-w-[1680px] 2xl:max-w-[1760px] mx-auto px-4 sm:px-6 py-5 sm:py-8">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 sm:gap-6 2xl:gap-8 items-start">
        {/* Left Pane: Topic Details & Rubric (4 Columns) */}
        <div className="xl:col-span-4 space-y-5">
          <div className="border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 p-4 sm:p-7 shadow-xs space-y-4">
            {/* Topic Header Badges */}
            <div className="flex flex-col items-start gap-2 pb-2 border-b border-zinc-200 dark:border-zinc-800 sm:flex-row sm:items-center sm:justify-between">
              <span className="inline-flex items-center px-3.5 py-1 text-xs sm:text-sm font-bold bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 rounded">
                {topic.type.toUpperCase()}
              </span>
              <div className="flex items-center gap-2 text-sm sm:text-base text-zinc-900 dark:text-zinc-100 font-semibold">
                <span className="tabular-nums font-bold text-base sm:text-lg">{topic.timeLimitMinutes}</span>
                <span>phút</span>
                <span>•</span>
                <span>Tối thiểu <strong className="tabular-nums font-bold text-base sm:text-lg">{topic.minWords}</strong> từ</span>
              </div>
            </div>

            <div>
              <div className="text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 font-bold mb-1">
                Chủ đề: <span className="font-bold text-zinc-950 dark:text-white underline decoration-zinc-400">{topic.category}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-zinc-950 dark:text-white tracking-tight leading-snug">
                {topic.title}
              </h2>
            </div>

            {/* Topic Prompt Content */}
            {topic.id === 'custom-topic' ? (
              <div className="space-y-2">
                <label className="text-sm sm:text-base font-bold text-zinc-950 dark:text-white">
                  Nhập đề bài IELTS của bạn:
                </label>
                <textarea
                  value={topic.prompt}
                  onChange={(e) => onUpdateCustomTopic && onUpdateCustomTopic(e.target.value)}
                  placeholder="Dán hoặc gõ đề bài Writing vào đây..."
                  rows={6}
                  className="w-full text-base sm:text-lg p-4 border border-zinc-300 dark:border-zinc-700 rounded-md bg-zinc-50 dark:bg-zinc-950 text-zinc-950 dark:text-white font-medium focus:outline-none focus:border-zinc-950 dark:focus:border-white resize-none leading-relaxed"
                />
              </div>
            ) : (
              <div className="p-5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-md text-base sm:text-[17px] text-zinc-950 dark:text-zinc-50 leading-relaxed font-normal select-text shadow-xs">
                {topic.prompt}
              </div>
            )}

            {/* Task 1 Chart Details (if applicable) */}
            {topic.type === 'task1' && topic.chartDataSummary && (
              <div className="mt-4 p-5 border border-zinc-300 dark:border-zinc-700 rounded-md bg-zinc-50 dark:bg-zinc-950 space-y-2.5">
                <div className="flex items-center gap-2 text-base font-bold text-zinc-950 dark:text-white">
                  <ChartLineUp weight="bold" size={20} />
                  <span>Dữ Liệu Đồ Thị & Điểm Số Trọng Tâm (Task 1)</span>
                </div>
                {topic.chartDescription && (
                  <p className="text-sm sm:text-base text-zinc-900 dark:text-zinc-100 italic font-medium leading-relaxed">
                    {topic.chartDescription}
                  </p>
                )}
                <ul className="space-y-2 text-sm sm:text-base text-zinc-900 dark:text-zinc-100 font-medium leading-relaxed">
                  {topic.chartDataSummary.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="text-zinc-900 dark:text-zinc-100 font-bold text-sm mt-0.5">[{idx + 1}]</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Band Descriptors Checklist */}
            <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-700 text-sm sm:text-base text-zinc-900 dark:text-zinc-100 space-y-2.5 font-medium leading-relaxed">
              <div className="font-bold text-zinc-950 dark:text-white text-base">
                Tiêu chuẩn giám khảo IDP & British Council:
              </div>
              <p>• <strong className="text-zinc-950 dark:text-white">TR (Task Response):</strong> Trả lời trọn vẹn đề bài, phát triển luận điểm có dẫn chứng xác đáng.</p>
              <p>• <strong className="text-zinc-950 dark:text-white">CC (Coherence & Cohesion):</strong> Bố cục 4–5 đoạn rõ ràng, tránh lạm dụng từ nối máy móc.</p>
              <p>• <strong className="text-zinc-950 dark:text-white">LR (Lexical Resource):</strong> Sử dụng chính xác academic collocations, kiểm soát văn phong trang trọng.</p>
              <p>• <strong className="text-zinc-950 dark:text-white">GRA (Grammar Range):</strong> Đa dạng câu phức, kiểm soát lỗi thì động từ và mạo từ.</p>
            </div>
          </div>
        </div>

        {/* Right Pane: Exam Editor & Live Feedback Controls (8 Columns) */}
        <div className="xl:col-span-8 space-y-5">
          {/* Status Bar: Timer + Word Count */}
          <div className="border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Timer Control */}
            <div className="flex items-center gap-2.5">
              <div
                className={`flex items-center gap-2.5 px-4 py-2 rounded-md text-lg sm:text-xl font-bold tabular-nums border ${
                  secondsRemaining < 300 && secondsRemaining > 0
                    ? 'border-red-400 bg-red-100 text-red-700 dark:border-red-800 dark:bg-red-950/80 dark:text-red-300'
                    : 'border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-950 text-zinc-950 dark:text-white'
                }`}
              >
                <Timer weight="bold" size={22} />
                <span>{formatTime(secondsRemaining)}</span>
              </div>

              <button
                type="button"
                onClick={toggleTimer}
                title={isTimerRunning ? 'Tạm dừng đồng hồ' : 'Tiếp tục đếm giờ'}
                className="h-10 w-10 flex items-center justify-center rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-950 dark:text-white font-bold transition-colors shadow-xs"
              >
                {isTimerRunning ? <Pause weight="bold" size={18} /> : <Play weight="bold" size={18} />}
              </button>

              <button
                type="button"
                onClick={resetTimer}
                title="Khởi động lại đồng hồ"
                className="h-10 w-10 flex items-center justify-center rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-950 dark:text-white font-bold transition-colors shadow-xs"
              >
                <ArrowClockwise weight="bold" size={18} />
              </button>
            </div>

            {/* Word Count Metric */}
            <div className="flex items-center justify-between gap-3 sm:justify-start sm:gap-4">
              <div className="text-left sm:text-right min-w-0">
                <div className="flex items-center gap-2 sm:justify-end">
                  <span
                    className={`text-2xl sm:text-3xl font-black tabular-nums ${
                      isWordCountSufficient
                        ? 'text-emerald-700 dark:text-emerald-400'
                        : 'text-zinc-950 dark:text-white'
                    }`}
                  >
                    {wordCount}
                  </span>
                  <span className="text-base text-zinc-800 dark:text-zinc-200 font-bold">/ {topic.minWords} từ</span>
                  {isWordCountSufficient && (
                    <span title="Đã đạt độ dài tối thiểu">
                      <CheckCircle
                        weight="fill"
                        size={20}
                        className="text-emerald-600 dark:text-emerald-400"
                      />
                    </span>
                  )}
                </div>
                <div className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 font-semibold">
                  {charCount} ký tự • {words.length > 0 ? Math.round(charCount / Math.max(1, wordCount) * 10) / 10 : 0} ký tự/từ
                </div>
              </div>

              {/* Quick sample loader & clear button */}
              <div className="flex shrink-0 items-center gap-2 pl-3 border-l border-zinc-300 dark:border-zinc-700">
                <button
                  type="button"
                  onClick={loadSampleEssay}
                  title="Tải bài viết mẫu để thử nghiệm nhanh"
                  className="h-10 px-4 text-xs sm:text-sm font-bold border border-zinc-300 dark:border-zinc-700 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-950 dark:text-white hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors shadow-xs"
                >
                  Bài mẫu
                </button>
                {essayText.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      audioFX.playClick();
                      onChangeEssayText('');
                    }}
                    title="Xóa toàn bộ văn bản"
                    className="h-10 w-10 flex items-center justify-center rounded-md border border-zinc-300 dark:border-zinc-700 text-zinc-700 hover:text-red-600 dark:text-zinc-300 dark:hover:text-red-400 transition-colors shadow-xs"
                  >
                    <Trash weight="bold" size={18} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Word Count Progress Bar */}
          <div className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                isWordCountSufficient ? 'bg-emerald-600' : 'bg-zinc-800 dark:bg-zinc-200'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Main Writing Textarea with Dynamic, Spacious Font */}
          <div className="border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 overflow-hidden shadow-xs relative">
            <textarea
              value={essayText}
              onChange={handleTextChange}
              placeholder="Bắt đầu viết bài essay của bạn tại đây... (Đồng hồ sẽ tự động kích hoạt khi bạn gõ phím đầu tiên)"
              spellCheck={!settings.spellcheckLocked}
              rows={18}
              className={`w-full p-4 sm:p-7 bg-transparent text-zinc-950 dark:text-zinc-50 placeholder:text-zinc-500 dark:placeholder:text-zinc-400 focus:outline-none resize-y min-h-[360px] sm:min-h-[460px] xl:min-h-0 xl:h-[clamp(360px,calc(100vh-500px),560px)] ${getEditorFontClass()}`}
            />

            {/* Bottom Bar inside Textarea */}
            <div className="px-4 sm:px-6 py-3.5 bg-zinc-100 dark:bg-zinc-950 border-t border-zinc-300 dark:border-zinc-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 font-semibold">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span>Font: <strong className="text-zinc-950 dark:text-white">{settings.editorFont.toUpperCase()}</strong></span>
                <span>•</span>
                <span>Spellcheck: <strong className="text-zinc-950 dark:text-white">{settings.spellcheckLocked ? 'Đã khóa' : 'Bật'}</strong></span>
                <span>•</span>
                <span>Cỡ chữ: <strong className="text-zinc-950 dark:text-white">{settings.fontSize || 'standard'}</strong></span>
              </div>
              <div>
                {!isWordCountSufficient ? (
                  <span className="text-amber-800 dark:text-amber-300 font-bold">
                    Cần thêm {topic.minWords - wordCount} từ nữa để đạt quy định
                  </span>
                ) : (
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                    ✓ Đã đủ độ dài bài thi
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Submit Action Area */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
            <p className="text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 font-semibold leading-relaxed max-w-sm">
              Bài viết sẽ được chấm điểm theo 4 tiêu chí chính thức của IDP/British Council kèm phát hiện lỗi tương tác trực tiếp.
            </p>

            <button
              type="button"
              onClick={() => {
                audioFX.playSubmit();
                onSubmitForEvaluation(timeSpentSeconds);
              }}
              disabled={isEvaluating || essayText.trim().length < 20}
              className={`flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-md font-bold text-sm sm:text-base transition-all shadow-xs ${
                isEvaluating || essayText.trim().length < 20
                  ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-500 cursor-not-allowed border border-zinc-300 dark:border-zinc-700'
                  : 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-100 active:scale-[0.99]'
              }`}
            >
              {isEvaluating ? (
                <>
                  <div className="w-5 h-5 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin" />
                  <span>Đang chấm bài & phân tích lỗi...</span>
                </>
              ) : (
                <>
                  <PaperPlaneRight weight="bold" size={20} />
                  <span>Nộp Bài & Chấm Điểm AI</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
