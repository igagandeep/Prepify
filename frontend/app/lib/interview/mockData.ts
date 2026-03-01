// ─── Types ────────────────────────────────────────────────────────────────────

export type InterviewType = 'Technical' | 'Behavioral' | 'Mixed';
export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type QuestionCount = 5 | 10 | 15;
export type RatingLevel = 'High' | 'Medium' | 'Low';

export interface InterviewConfig {
  role: string;
  type: InterviewType;
  count: QuestionCount;
  difficulty: Difficulty;
}

export interface AnswerFeedback {
  score: number; // 1–10
  accuracy: RatingLevel;
  clarity: RatingLevel;
  strengths: string[];
  improvements: string[];
}

export interface MockQuestion {
  id: number;
  question: string;
  feedback: AnswerFeedback;
}

export interface SessionResult extends MockQuestion {
  userAnswer: string;
}

export interface MockResults {
  overallScore: number; // 0–100
  summary: string;
  topStrengths: string[];
  areasToImprove: string[];
  recommendation: string;
  questions: SessionResult[];
}

// ─── Technical questions pool ─────────────────────────────────────────────────

const TECHNICAL_QUESTIONS: MockQuestion[] = [
  {
    id: 1,
    question:
      'Can you walk me through how you would design a REST API for a social media platform? Focus on endpoint structure, authentication, and scalability considerations.',
    feedback: {
      score: 8,
      accuracy: 'High',
      clarity: 'High',
      strengths: [
        'Clearly outlined resource-based endpoints (/users, /posts, /comments)',
        'Mentioned JWT for stateless authentication',
        'Addressed pagination for list endpoints',
      ],
      improvements: [
        'Rate limiting and API versioning were not mentioned',
        'Caching strategies (Redis, CDN) were skipped',
      ],
    },
  },
  {
    id: 2,
    question:
      'What is the difference between == and === in JavaScript? When would you choose one over the other?',
    feedback: {
      score: 9,
      accuracy: 'High',
      clarity: 'High',
      strengths: [
        'Accurately explained type coercion with ==',
        'Gave concrete examples (0 == false, null == undefined)',
        'Correctly recommended === as the default',
      ],
      improvements: ['Could mention edge cases like NaN !== NaN'],
    },
  },
  {
    id: 3,
    question:
      'Explain Big O notation and analyze the time complexity of binary search. Why does it matter in practice?',
    feedback: {
      score: 7,
      accuracy: 'High',
      clarity: 'Medium',
      strengths: [
        'Correctly identified O(log n) for binary search',
        'Explained the divide-and-conquer approach well',
      ],
      improvements: [
        'The O(1) vs O(n) contrast examples were unclear',
        'Space complexity (O(1) iterative vs O(log n) recursive) was omitted',
        'Real-world context for when Big O matters could be stronger',
      ],
    },
  },
  {
    id: 4,
    question:
      'How would you approach debugging a memory leak in a production Node.js application?',
    feedback: {
      score: 7,
      accuracy: 'Medium',
      clarity: 'High',
      strengths: [
        'Suggested using --inspect with Chrome DevTools',
        'Mentioned heap snapshots as a diagnostic tool',
        'Proposed checking event listener cleanup',
      ],
      improvements: [
        'process.memoryUsage() for quick monitoring was not mentioned',
        'Could discuss clinic.js or 0x as profiling tools',
        'Circular references as a leak source were not covered',
      ],
    },
  },
  {
    id: 5,
    question:
      'What are the SOLID principles? Explain the Single Responsibility Principle with a concrete code example.',
    feedback: {
      score: 8,
      accuracy: 'High',
      clarity: 'High',
      strengths: [
        'Listed all five SOLID principles correctly',
        'Code example clearly demonstrated SRP',
        'Connected SRP to testability and maintainability',
      ],
      improvements: [
        'Examples for the other four principles were not discussed',
        'Could explain how violating SRP leads to "God classes"',
      ],
    },
  },
  {
    id: 6,
    question:
      'Describe your experience with relational databases. How would you optimize a slow SQL query?',
    feedback: {
      score: 6,
      accuracy: 'Medium',
      clarity: 'Medium',
      strengths: [
        'Mentioned using EXPLAIN to analyze query plans',
        'Suggested adding indexes on frequently queried columns',
      ],
      improvements: [
        'Query caching and connection pooling were not mentioned',
        'Covering/composite indexes were not discussed',
        'Should mention avoiding SELECT * and reducing N+1 queries',
        'No mention of normalization trade-offs',
      ],
    },
  },
  {
    id: 7,
    question:
      'What is the difference between a process and a thread? How does Node.js handle concurrency despite being single-threaded?',
    feedback: {
      score: 8,
      accuracy: 'High',
      clarity: 'High',
      strengths: [
        'Correctly explained shared memory in threads vs isolated memory in processes',
        'Explained the event loop and non-blocking I/O well',
        'Mentioned the worker_threads module for CPU-intensive tasks',
      ],
      improvements: [
        'The cluster module for multi-process Node.js was skipped',
        'libuv thread pool internals were not touched on',
      ],
    },
  },
  {
    id: 8,
    question:
      'How would you implement authentication and authorization in a web application? Describe your approach end-to-end.',
    feedback: {
      score: 9,
      accuracy: 'High',
      clarity: 'High',
      strengths: [
        'Described JWT structure (header, payload, signature) accurately',
        'Mentioned refresh token rotation for security',
        'Differentiated authentication from authorization clearly',
        'Mentioned RBAC for authorization',
      ],
      improvements: ['OAuth 2.0 / OIDC for third-party auth was briefly skipped'],
    },
  },
  {
    id: 9,
    question:
      'Explain the concept of microservices. What are the trade-offs compared to a monolithic architecture?',
    feedback: {
      score: 7,
      accuracy: 'High',
      clarity: 'Medium',
      strengths: [
        'Identified independent deployability as a key microservices benefit',
        'Mentioned service communication patterns (REST, message queues)',
        'Acknowledged increased operational complexity',
      ],
      improvements: [
        'Distributed tracing and observability challenges were omitted',
        'Data consistency across services (sagas, 2PC) was not discussed',
        'Could mention when a monolith is actually the better choice',
      ],
    },
  },
  {
    id: 10,
    question:
      'Tell me about a challenging technical problem you solved recently. Walk me through your thought process and what you learned.',
    feedback: {
      score: 8,
      accuracy: 'High',
      clarity: 'High',
      strengths: [
        'Used STAR format (Situation, Task, Action, Result) effectively',
        'Demonstrated structured problem-solving under pressure',
        'Clearly articulated lessons learned',
      ],
      improvements: [
        'Could quantify impact more specifically (e.g., "reduced latency by 40%")',
        'Team collaboration details could be elaborated',
      ],
    },
  },
];

// ─── Behavioral questions pool ────────────────────────────────────────────────

const BEHAVIORAL_QUESTIONS: MockQuestion[] = [
  {
    id: 1,
    question:
      'Tell me about a time you had to work with a difficult team member. How did you handle the situation?',
    feedback: {
      score: 8,
      accuracy: 'High',
      clarity: 'High',
      strengths: [
        'Stayed professional and focused on the work outcome',
        'Proactively sought a 1-on-1 conversation to resolve the conflict',
        'Demonstrated empathy by listening to the other person\'s concerns',
      ],
      improvements: [
        'Could describe how you followed up after the resolution',
        'Mention what you would do differently in hindsight',
      ],
    },
  },
  {
    id: 2,
    question:
      'Describe a situation where you had to meet a tight deadline. What did you do to ensure delivery?',
    feedback: {
      score: 9,
      accuracy: 'High',
      clarity: 'High',
      strengths: [
        'Broke the work into prioritized tasks immediately',
        'Communicated proactively with stakeholders about scope',
        'Delivered on time without sacrificing quality on critical parts',
      ],
      improvements: [
        'Could mention how you prevented similar situations in the future',
      ],
    },
  },
  {
    id: 3,
    question:
      'Give me an example of when you had to learn something quickly under pressure. How did you approach it?',
    feedback: {
      score: 7,
      accuracy: 'High',
      clarity: 'Medium',
      strengths: [
        'Showed resourcefulness by using documentation and asking mentors',
        'Demonstrated a clear growth mindset',
      ],
      improvements: [
        'The example could be more specific about what was learned',
        'Outcome and measurable impact were not clearly stated',
      ],
    },
  },
  {
    id: 4,
    question:
      'Tell me about a time you received critical feedback. How did you respond to it?',
    feedback: {
      score: 8,
      accuracy: 'High',
      clarity: 'High',
      strengths: [
        'Accepted the feedback without becoming defensive',
        'Created an action plan and followed through',
        'Showed maturity in using it as a growth opportunity',
      ],
      improvements: [
        'Could mention seeking clarification to ensure full understanding',
      ],
    },
  },
  {
    id: 5,
    question:
      'Describe a time you had to make a difficult decision with incomplete information. What was your process?',
    feedback: {
      score: 7,
      accuracy: 'Medium',
      clarity: 'High',
      strengths: [
        'Gathered as much available information as quickly as possible',
        'Consulted relevant stakeholders before deciding',
        'Made the call decisively when needed',
      ],
      improvements: [
        'Risk assessment and mitigation before deciding was not explained',
        'Retrospective analysis after the outcome was not mentioned',
      ],
    },
  },
  {
    id: 6,
    question:
      'Tell me about a project you are most proud of. What was your specific contribution?',
    feedback: {
      score: 9,
      accuracy: 'High',
      clarity: 'High',
      strengths: [
        'Clearly articulated ownership and individual impact',
        'Described the business value of the project',
        'Showed genuine enthusiasm and investment in the work',
      ],
      improvements: [
        'Could mention what the team learned collectively from the project',
      ],
    },
  },
  {
    id: 7,
    question:
      'Describe a time you had to persuade someone to see things your way. How did you approach it?',
    feedback: {
      score: 7,
      accuracy: 'High',
      clarity: 'Medium',
      strengths: [
        'Used data and evidence to support the argument',
        'Listened actively to objections and addressed them',
      ],
      improvements: [
        'Could describe how you adapted your communication style to the audience',
        'The relationship status after the conversation was unclear',
      ],
    },
  },
  {
    id: 8,
    question:
      'Give an example of when you took initiative beyond your assigned responsibilities.',
    feedback: {
      score: 8,
      accuracy: 'High',
      clarity: 'High',
      strengths: [
        'Identified a problem proactively without being asked',
        'Drove the solution end-to-end with clear ownership',
        'Outcome had a measurable positive impact on the team',
      ],
      improvements: [
        'Could mention how you got buy-in from leadership or peers',
      ],
    },
  },
  {
    id: 9,
    question:
      'Tell me about a time a project did not go as planned. What happened and what did you do?',
    feedback: {
      score: 7,
      accuracy: 'High',
      clarity: 'Medium',
      strengths: [
        'Took accountability without placing blame on others',
        'Pivoted quickly and communicated the issue to stakeholders',
      ],
      improvements: [
        'Root cause analysis could be more detailed',
        'Preventive measures taken afterwards were not mentioned',
      ],
    },
  },
  {
    id: 10,
    question:
      'Where do you see yourself in five years, and how does this role fit into that vision?',
    feedback: {
      score: 8,
      accuracy: 'High',
      clarity: 'High',
      strengths: [
        'Career vision was realistic and well-articulated',
        'Clearly connected long-term goals to this role',
        'Showed genuine interest in growth opportunities',
      ],
      improvements: [
        'Could mention specific skills you plan to develop in this role',
      ],
    },
  },
];

// ─── Mixed pool (interleaved) ──────────────────────────────────────────────────

const MIXED_QUESTIONS: MockQuestion[] = [
  TECHNICAL_QUESTIONS[0],
  BEHAVIORAL_QUESTIONS[0],
  TECHNICAL_QUESTIONS[1],
  BEHAVIORAL_QUESTIONS[1],
  TECHNICAL_QUESTIONS[2],
  BEHAVIORAL_QUESTIONS[2],
  TECHNICAL_QUESTIONS[3],
  BEHAVIORAL_QUESTIONS[3],
  TECHNICAL_QUESTIONS[4],
  BEHAVIORAL_QUESTIONS[4],
  TECHNICAL_QUESTIONS[5],
  BEHAVIORAL_QUESTIONS[5],
  TECHNICAL_QUESTIONS[6],
  BEHAVIORAL_QUESTIONS[6],
  TECHNICAL_QUESTIONS[7],
].map((q, i) => ({ ...q, id: i + 1 }));

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getMockQuestions(type: InterviewType, count: QuestionCount): MockQuestion[] {
  const pool =
    type === 'Technical'
      ? TECHNICAL_QUESTIONS
      : type === 'Behavioral'
      ? BEHAVIORAL_QUESTIONS
      : MIXED_QUESTIONS;

  return pool.slice(0, Math.min(count, pool.length)).map((q, i) => ({ ...q, id: i + 1 }));
}

// ─── Hardcoded demo results (used when navigating directly to /results) ───────

export const DEMO_RESULTS: MockResults = {
  overallScore: 78,
  summary:
    'You demonstrated solid technical knowledge across core software engineering topics, with particularly strong answers on JavaScript fundamentals and system design. Your responses were well-structured and showed clear communication skills. The main areas for growth are database optimisation and distributed systems design.',
  topStrengths: [
    'Strong JavaScript and Node.js fundamentals',
    'Clear communication with structured, well-organised answers',
    'Good understanding of authentication and security principles',
    'Demonstrated ownership and accountability in behavioural responses',
  ],
  areasToImprove: [
    'Database optimisation and advanced SQL query techniques',
    'Distributed systems concepts (eventual consistency, sagas)',
    'Quantifying the impact of your work with specific metrics',
    'Deeper knowledge of observability and monitoring tools',
  ],
  recommendation: 'Ready for mid-level engineering interviews',
  questions: [
    {
      id: 1,
      question:
        'Can you walk me through how you would design a REST API for a social media platform?',
      userAnswer:
        'I would start by identifying the core resources: users, posts, comments, and likes. Each would have standard CRUD endpoints following REST conventions. For authentication I\'d use JWT tokens with refresh token rotation to keep sessions stateless and secure.',
      feedback: {
        score: 8,
        accuracy: 'High',
        clarity: 'High',
        strengths: [
          'Clearly outlined resource-based endpoints',
          'Mentioned JWT for stateless authentication',
          'Addressed pagination for list endpoints',
        ],
        improvements: [
          'Could have mentioned rate limiting and API versioning',
          'Caching strategies were not discussed',
        ],
      },
    },
    {
      id: 2,
      question: 'What is the difference between == and === in JavaScript?',
      userAnswer:
        'The == operator performs type coercion before comparison, while === is a strict equality check requiring both the value and type to match. I always recommend === as the default to avoid unexpected coercion bugs.',
      feedback: {
        score: 9,
        accuracy: 'High',
        clarity: 'High',
        strengths: [
          'Accurately explained type coercion',
          'Gave concrete examples',
          'Correctly recommended === as the default',
        ],
        improvements: ['Could mention edge cases like NaN !== NaN'],
      },
    },
    {
      id: 3,
      question:
        'Explain Big O notation and analyze the time complexity of binary search.',
      userAnswer:
        'Big O describes the upper bound on algorithm time complexity. Binary search is O(log n) because it eliminates half the search space with each comparison, making it far more efficient than linear search on sorted data.',
      feedback: {
        score: 7,
        accuracy: 'High',
        clarity: 'Medium',
        strengths: [
          'Correctly identified O(log n) for binary search',
          'Explained the divide-and-conquer approach well',
        ],
        improvements: [
          'The O(1) vs O(n) contrast could be clearer',
          'Space complexity was omitted',
        ],
      },
    },
    {
      id: 4,
      question:
        'How would you approach debugging a memory leak in a production Node.js application?',
      userAnswer:
        'I would use --inspect to connect Chrome DevTools and take heap snapshots at intervals to identify objects not being garbage collected. I\'d also check for event listeners that aren\'t cleaned up.',
      feedback: {
        score: 7,
        accuracy: 'Medium',
        clarity: 'High',
        strengths: [
          'Suggested using --inspect with Chrome DevTools',
          'Mentioned heap snapshots as a diagnostic tool',
        ],
        improvements: [
          'process.memoryUsage() for quick monitoring was not mentioned',
          'Could discuss clinic.js as a profiling tool',
        ],
      },
    },
    {
      id: 5,
      question:
        'What are the SOLID principles? Explain the Single Responsibility Principle with a concrete example.',
      userAnswer:
        'SOLID stands for Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, and Dependency Inversion. SRP means a class should have only one reason to change. For example, separating email sending logic from user registration logic into distinct classes.',
      feedback: {
        score: 8,
        accuracy: 'High',
        clarity: 'High',
        strengths: [
          'Listed all five SOLID principles correctly',
          'Code example clearly demonstrated SRP',
          'Connected SRP to testability',
        ],
        improvements: [
          'Examples for the other four principles were not discussed',
        ],
      },
    },
  ],
};
