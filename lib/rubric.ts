import { TaskType } from '@/types/ielts';

/**
 * Keep the rubric version alongside each evaluation so historic results can be
 * interpreted after prompts or calibration rules are updated.
 */
export const RUBRIC_VERSION = 'ielts-writing-public-band-descriptors-2023-05';
export const EVALUATOR_VERSION = '1.0.0';

export const RUBRIC_CRITERIA = {
  task1: [
    'Task Achievement: identify an overview, select key features and make relevant comparisons.',
    'Coherence and Cohesion: organise information logically and use cohesion naturally.',
    'Lexical Resource: use precise vocabulary for trends, quantities and comparisons.',
    'Grammatical Range and Accuracy: use a controlled range of accurate sentence structures.',
  ],
  task2: [
    'Task Response: answer every part of the question, maintain a clear position and develop ideas.',
    'Coherence and Cohesion: organise ideas logically and use cohesion naturally.',
    'Lexical Resource: use precise, flexible and appropriate vocabulary.',
    'Grammatical Range and Accuracy: use a controlled range of accurate sentence structures.',
  ],
} satisfies Record<TaskType, string[]>;

export function rubricForTask(taskType: TaskType): string {
  return RUBRIC_CRITERIA[taskType].map((criterion, index) => `${index + 1}. ${criterion}`).join('\n');
}
