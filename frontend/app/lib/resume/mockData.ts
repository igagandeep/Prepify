import type { AnalyzeResult } from '../api/resume';

/**
 * Demo result returned in non-local (deployed) builds.
 * Lets visitors explore the full Resume Analyzer UI without needing an API key.
 *
 * IMPORTANT: Do NOT remove this — it powers the public demo.
 * For the real AI analysis, the local/Electron build calls the backend API.
 */
export const DEMO_RESUME_RESULT: AnalyzeResult = {
  score: 72,
  matchedKeywords: [
    'React',
    'TypeScript',
    'Node.js',
    'REST API',
    'Git',
    'Agile',
    'PostgreSQL',
    'Unit Testing',
    'JavaScript',
    'CI/CD',
  ],
  missingKeywords: [
    'Docker',
    'Kubernetes',
    'AWS',
    'GraphQL',
    'Redis',
    'Microservices',
    'System Design',
  ],
  keywordFrequency: [],
  suggestions: [
    {
      id: '1',
      category: 'Summary',
      text: 'Results-driven Software Engineer with 3+ years of experience building scalable web applications using React, TypeScript, and Node.js. Adept at delivering high-quality code in Agile environments and optimising system performance for production workloads.',
    },
    {
      id: '2',
      category: 'Experience',
      text: 'Engineered and deployed 3 production-grade REST APIs in Node.js and TypeScript, cutting average response latency by 40% through query optimisation and caching strategies.',
    },
    {
      id: '3',
      category: 'Experience',
      text: 'Led migration of a monolithic frontend to a React 18 component library, improving page-load performance by 35% and enabling independent team deployments.',
    },
    {
      id: '4',
      category: 'Experience',
      text: 'Collaborated in two-week Agile sprints, consistently shipping features on schedule while maintaining 90%+ unit-test coverage across the codebase.',
    },
    {
      id: '5',
      category: 'Skills',
      text: 'Docker & container orchestration (Kubernetes)',
    },
    {
      id: '6',
      category: 'Skills',
      text: 'AWS (EC2, S3, Lambda)',
    },
    {
      id: '7',
      category: 'Skills',
      text: 'GraphQL API design',
    },
    {
      id: '8',
      category: 'Skills',
      text: 'Redis caching',
    },
    {
      id: '9',
      category: 'Education',
      text: 'Consider listing relevant coursework such as Distributed Systems, Cloud Computing, or Database Internals to align with the role\'s infrastructure focus.',
    },
  ],
};
