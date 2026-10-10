export type TaskType = 'task1' | 'task2';

export interface Topic {
  id: string;
  type: TaskType;
  category: string;
  title: string;
  prompt: string;
  chartDescription?: string;
  chartDataSummary?: string[];
  minWords: number;
  timeLimitMinutes: number;
}

export type ErrorType = 'grammar' | 'vocabulary' | 'coherence' | 'excellence';

export interface InlineAnnotation {
  id: string;
  sourceStart: number;
  sourceEnd: number;
  originalText: string;
  errorType: ErrorType;
  categoryName: string;
  explanation: string;
  suggestedFix: string;
  band8Alternative: string;
}

export interface CriterionScore {
  band: number;
  label: string;
  feedback: string;
  strengths: string[];
  weaknesses: string[];
}

export interface SampleRewrites {
  band75Version: string;
  band85Version: string;
  keyUpgrades: string[];
}

export interface TextStats {
  wordCount: number;
  characterCount: number;
  paragraphCount: number;
  sentenceCount: number;
  timeSpentSeconds: number;
  averageSentenceLength: number;
  academicVocabularyPercentage: number;
}

export interface EvaluationResult {
  id: string;
  metadata: EvaluationMetadata;
  overallBand: number;
  examinerSummary: string;
  criteria: {
    taskResponse: CriterionScore;
    coherenceCohesion: CriterionScore;
    lexicalResource: CriterionScore;
    grammaticalRangeAccuracy: CriterionScore;
  };
  inlineAnnotations: InlineAnnotation[];
  sampleRewrites: SampleRewrites;
  stats: TextStats;
  submittedAt: string;
}

export type EvaluationMode = 'demo' | 'ai';
export type EvaluationConfidence = 'low' | 'medium' | 'high';

export interface EvaluationMetadata {
  mode: EvaluationMode;
  confidence: EvaluationConfidence;
  rubricVersion: string;
  evaluatorVersion: string;
  model?: string;
  notices: string[];
}

export interface WritingHistoryItem {
  id: string;
  topic: Topic;
  essay: string;
  result: EvaluationResult;
  savedAt: string;
  revision?: RevisionSummary;
}

export interface RevisionSummary {
  previousAttemptId: string;
  previousOverallBand: number;
  overallBandDelta: number;
  wordCountDelta: number;
  criteriaDeltas: {
    taskResponse: number;
    coherenceCohesion: number;
    lexicalResource: number;
    grammaticalRangeAccuracy: number;
  };
  resolvedErrorCategories: string[];
  recurringErrorCategories: string[];
}

export interface UserSettings {
  apiKey: string;
  provider: 'gemini' | 'openai';
  model: string;
  editorFont: 'sans' | 'serif' | 'exam';
  fontSize: 'standard' | 'large' | 'xlarge'; // standard: 17px, large: 19px, xlarge: 21px
  spellcheckLocked: boolean;
  theme: 'light' | 'dark';
  soundEnabled: boolean;
  soundVolume: number;
}


