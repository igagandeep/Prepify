import type { CreateJobInput } from './api';

const demoJobs: CreateJobInput[] = [
  { company: 'Google', role: 'Senior Frontend Engineer', status: 'Interview', location: 'Mountain View, CA', salary: '$180k - $250k', jobUrl: 'https://careers.google.com', notes: 'Reached out via LinkedIn recruiter' },
  { company: 'Stripe', role: 'Full Stack Engineer', status: 'Applied', location: 'San Francisco, CA', salary: '$160k - $220k', jobUrl: 'https://stripe.com/jobs', notes: 'Applied through careers page' },
  { company: 'Figma', role: 'Design Engineer', status: 'Applied', location: 'San Francisco, CA', salary: '$150k - $200k', notes: '' },
  { company: 'Vercel', role: 'Developer Advocate', status: 'Rejected', location: 'Remote', salary: '$120k - $160k', notes: 'Great experience, keep in touch' },
  { company: 'Linear', role: 'Software Engineer', status: 'Applied', location: 'Remote', salary: '$150k - $200k', notes: 'Referral from a friend' },
  { company: 'Notion', role: 'Product Engineer', status: 'Offer', location: 'Remote', salary: '$140k - $180k', notes: 'Strong offer, evaluating compensation' },
  { company: 'GitHub', role: 'Staff Engineer', status: 'Interview', location: 'Remote', salary: '$200k - $280k', jobUrl: 'https://github.com/about/careers', notes: 'System design round scheduled' },
  { company: 'Shopify', role: 'Backend Engineer', status: 'Applied', location: 'Remote', salary: '$130k - $170k', notes: '' },
  { company: 'Airbnb', role: 'React Native Engineer', status: 'Rejected', location: 'San Francisco, CA', salary: '$160k - $220k', notes: 'Phone screen went well but moved on' },
  { company: 'Anthropic', role: 'Software Engineer', status: 'Interview', location: 'San Francisco, CA', salary: '$180k - $300k', jobUrl: 'https://anthropic.com/careers', notes: 'Working on take-home project' },
];

export default demoJobs;
