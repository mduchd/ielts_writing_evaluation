import { EvaluationResult, RevisionSummary, WritingHistoryItem } from '@/types/ielts';

const roundDelta = (value: number) => Math.round(value * 10) / 10;

function issueCategories(result: EvaluationResult): Set<string> {
  return new Set(
    result.inlineAnnotations
      .filter((annotation) => annotation.errorType !== 'excellence')
      .map((annotation) => annotation.categoryName)
  );
}

/** Compare a resubmission against the latest attempt on the same prompt. */
export function summarizeRevision(
  previousAttempt: WritingHistoryItem,
  currentResult: EvaluationResult
): RevisionSummary {
  const previousIssues = issueCategories(previousAttempt.result);
  const currentIssues = issueCategories(currentResult);

  return {
    previousAttemptId: previousAttempt.id,
    previousOverallBand: previousAttempt.result.overallBand,
    overallBandDelta: roundDelta(currentResult.overallBand - previousAttempt.result.overallBand),
    wordCountDelta: currentResult.stats.wordCount - previousAttempt.result.stats.wordCount,
    criteriaDeltas: {
      taskResponse: roundDelta(currentResult.criteria.taskResponse.band - previousAttempt.result.criteria.taskResponse.band),
      coherenceCohesion: roundDelta(currentResult.criteria.coherenceCohesion.band - previousAttempt.result.criteria.coherenceCohesion.band),
      lexicalResource: roundDelta(currentResult.criteria.lexicalResource.band - previousAttempt.result.criteria.lexicalResource.band),
      grammaticalRangeAccuracy: roundDelta(currentResult.criteria.grammaticalRangeAccuracy.band - previousAttempt.result.criteria.grammaticalRangeAccuracy.band),
    },
    resolvedErrorCategories: [...previousIssues].filter((category) => !currentIssues.has(category)).sort(),
    recurringErrorCategories: [...currentIssues].filter((category) => previousIssues.has(category)).sort(),
  };
}
