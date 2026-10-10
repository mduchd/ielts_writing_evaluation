import { Topic } from '@/types/ielts';

export const PRESET_TOPICS: Topic[] = [
  {
    id: 't2-ai-workplace',
    type: 'task2',
    category: 'Technology & Employment',
    title: 'Impact of AI on Future Employment',
    prompt: 'Some people believe that the rapid development of artificial intelligence will lead to mass unemployment, while others argue that it will create more opportunities and improve human lives. Discuss both views and give your own opinion.',
    minWords: 250,
    timeLimitMinutes: 40,
  },
  {
    id: 't2-higher-education',
    type: 'task2',
    category: 'Education & Society',
    title: 'Tuition Fees for Higher Education',
    prompt: 'University education should be completely free for all students regardless of their socioeconomic background. To what extent do you agree or disagree with this statement?',
    minWords: 250,
    timeLimitMinutes: 40,
  },
  {
    id: 't2-environmental-responsibility',
    type: 'task2',
    category: 'Environment & Policy',
    title: 'Individual vs Government Action on Climate',
    prompt: 'Some people argue that individuals cannot do much to resolve major global environmental issues and that only large corporations and governments can make a difference. To what extent do you agree or disagree?',
    minWords: 250,
    timeLimitMinutes: 40,
  },
  {
    id: 't1-renewable-energy',
    type: 'task1',
    category: 'Line Graph',
    title: 'Renewable Energy Consumption (1995–2025)',
    prompt: 'The chart below shows the proportion of energy generated from renewable sources in four European countries between 1995 and 2025. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.',
    chartDescription: 'Line graph tracking Renewable Energy Share (%) in Germany, Norway, France, and Spain over a 30-year period.',
    chartDataSummary: [
      'Norway remained highest: started at 62% in 1995, rose steadily to 78% in 2025.',
      'Germany experienced the fastest growth: 12% in 1995 surged to 48% by 2025.',
      'Spain grew steadily from 18% (1995) to 42% (2025).',
      'France saw moderate increase from 15% to 26% over the entire period.'
    ],
    minWords: 150,
    timeLimitMinutes: 20,
  },
  {
    id: 't1-internet-access-bar',
    type: 'task1',
    category: 'Bar Chart',
    title: 'Household Broadband Penetration',
    prompt: 'The bar chart illustrates household internet access rates across five different nations in 2012 and 2022. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.',
    chartDescription: 'Comparison of 5 nations (South Korea, UK, Canada, Brazil, India) across two years: 2012 vs 2022.',
    chartDataSummary: [
      'South Korea led in both years: 82% (2012) -> 98% (2022).',
      'UK grew from 70% to 94%.',
      'Canada increased from 68% to 91%.',
      'Brazil showed dramatic leap: 38% -> 76%.',
      'India surged from 14% to 58%, marking the largest relative expansion.'
    ],
    minWords: 150,
    timeLimitMinutes: 20,
  }
];

export const CUSTOM_TOPIC_TEMPLATE: Topic = {
  id: 'custom-topic',
  type: 'task2',
  category: 'Custom Prompt',
  title: 'Custom User Prompt',
  prompt: 'Enter your custom IELTS Writing prompt here...',
  minWords: 250,
  timeLimitMinutes: 40,
};
