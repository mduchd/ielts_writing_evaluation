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


