'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Briefcase,
  FileText,
  MessageCircle,
  Heart,
  Github,
  Eye,
  Download,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
  Shield,
  ChevronRight,
  Check,
  X,
  Lightbulb,
  Globe,
} from 'lucide-react';

const isDemo = process.env.NEXT_PUBLIC_APP_MODE === 'demo';

/* ── Framer variants ──────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94], delay },
  }),
};

const fadeLeft = {
  hidden: { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] } },
};

const fadeRight = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const viewport = { once: true, margin: '-80px' };

/* ── Job Tracker visual ───────────────────────────────────────── */
function JobTrackerVisual() {
  const stages = [
    { label: 'Wishlist', color: 'text-slate-400', dot: 'bg-slate-500', count: 8 },
    { label: 'Applied', color: 'text-blue-400', dot: 'bg-blue-400', count: 12 },
    { label: 'Interview', color: 'text-yellow-400', dot: 'bg-yellow-400', count: 3 },
    { label: 'Offer', color: 'text-green-400', dot: 'bg-green-400', count: 1 },
    { label: 'Rejected', color: 'text-red-400', dot: 'bg-red-400', count: 4 },
  ];

  const cards = [
    { company: 'Google', role: 'Senior SWE', stage: 2 },
    { company: 'Stripe', role: 'Full Stack Eng', stage: 3 },
    { company: 'Vercel', role: 'DX Engineer', stage: 1 },
    { company: 'Linear', role: 'Product Eng', stage: 0 },
    { company: 'Figma', role: 'Platform Eng', stage: 4 },
    { company: 'Shopify', role: 'Backend Eng', stage: 1 },
  ];

  return (
    <div className="feature-visual">
      <div className="window-bar">
        <div className="win-dot bg-[#FF5F57]" />
        <div className="win-dot bg-[#FEBC2E]" />
        <div className="win-dot bg-[#28C840]" />
        <span className="text-slate-500 text-xs font-mono ml-3">prepify · job tracker</span>
      </div>
      <div className="p-4">
        {/* Pipeline strip */}
        <div className="flex gap-1.5 mb-4">
          {stages.map((s) => (
            <div key={s.label} className="flex-1 bg-white/[0.03] border border-white/[0.06] rounded-lg p-2 text-center">
              <div className={`w-1.5 h-1.5 rounded-full ${s.dot} mx-auto mb-1`} />
              <div className={`text-[10px] font-semibold ${s.color} leading-none mb-1`}>{s.label}</div>
              <div className="text-lg font-black text-white/80 leading-none">{s.count}</div>
            </div>
          ))}
        </div>
        {/* Job rows */}
        <div className="space-y-1.5">
          {cards.map((c, i) => (
            <motion.div
              key={c.company}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              viewport={viewport}
              className="flex items-center gap-2.5 bg-white/[0.03] border border-white/[0.05] rounded-lg px-3 py-2"
            >
              <div className="w-7 h-7 rounded-md bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {c.company[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white text-xs font-semibold">{c.company}</div>
                <div className="text-slate-500 text-xs">{c.role}</div>
              </div>
              <div className="flex gap-1">
                {stages.map((s, si) => (
                  <div
                    key={si}
                    className={`w-1.5 h-5 rounded-sm ${si <= c.stage ? s.dot : 'bg-white/10'}`}
                  />
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Resume Analyzer visual ───────────────────────────────────── */
function ResumeAnalyzerVisual() {
  const keywords = [
    { word: 'React', match: true },
    { word: 'TypeScript', match: true },
    { word: 'Node.js', match: false },
    { word: 'GraphQL', match: true },
    { word: 'AWS', match: false },
    { word: 'REST APIs', match: true },
  ];

  const suggestions = [
    'Add Node.js experience or highlight backend exposure',
    'Mention any AWS or cloud platform experience',
    'Quantify React projects with user/impact metrics',
  ];

  return (
    <div className="feature-visual">
      <div className="window-bar">
        <div className="win-dot bg-[#FF5F57]" />
        <div className="win-dot bg-[#FEBC2E]" />
        <div className="win-dot bg-[#28C840]" />
        <span className="text-slate-500 text-xs font-mono ml-3">prepify · resume analyzer</span>
      </div>
      <div className="p-4 space-y-3">
        {/* Two panes */}
        <div className="grid grid-cols-2 gap-3">
          {/* Job Description */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3">
            <div className="text-xs font-semibold text-slate-400 mb-2 flex items-center gap-1.5">
              <FileText className="w-3 h-3" /> Job Description
            </div>
            <div className="text-xs text-slate-500 leading-relaxed space-y-1">
              <p>We're looking for a senior engineer with strong <span className="bg-blue-500/20 text-blue-300 px-0.5 rounded">React</span> and <span className="bg-blue-500/20 text-blue-300 px-0.5 rounded">TypeScript</span> skills...</p>
              <p>Experience with <span className="bg-purple-500/20 text-purple-300 px-0.5 rounded">Node.js</span>, <span className="bg-blue-500/20 text-blue-300 px-0.5 rounded">GraphQL</span>, and <span className="bg-purple-500/20 text-purple-300 px-0.5 rounded">AWS</span> required...</p>
              <p>Proficiency in <span className="bg-blue-500/20 text-blue-300 px-0.5 rounded">REST APIs</span> and system design...</p>
            </div>
          </div>
          {/* Keywords */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3">
            <div className="text-xs font-semibold text-slate-400 mb-2">Keyword Match</div>
            <div className="space-y-1.5">
              {keywords.map((k, i) => (
                <motion.div
                  key={k.word}
                  initial={{ opacity: 0, x: 10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                  viewport={viewport}
                  className="flex items-center justify-between"
                >
                  <span className="text-xs text-slate-300">{k.word}</span>
                  {k.match
                    ? <Check className="w-3.5 h-3.5 text-green-400" />
                    : <X className="w-3.5 h-3.5 text-red-400" />}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
        {/* Match score */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-300">Overall Match Score</span>
            <span className="text-sm font-black text-white">82%</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div className="match-bar-fill h-full" />
          </div>
        </div>
        {/* AI Suggestions */}
        <div className="bg-purple-500/[0.08] border border-purple-500/20 rounded-xl p-3">
          <div className="text-xs font-semibold text-purple-300 mb-1.5 flex items-center gap-1.5">
            <Lightbulb className="w-3 h-3" /> AI Suggestions
          </div>
          {suggestions.map((s, i) => (
            <div key={i} className="text-xs text-slate-400 flex gap-1.5 mt-1">
              <span className="text-purple-400 mt-0.5">·</span>
              <span>{s}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Mock Interview visual ────────────────────────────────────── */
function MockInterviewVisual() {
  return (
    <div className="feature-visual">
      <div className="window-bar">
        <div className="win-dot bg-[#FF5F57]" />
        <div className="win-dot bg-[#FEBC2E]" />
        <div className="win-dot bg-[#28C840]" />
        <span className="text-slate-500 text-xs font-mono ml-3">prepify · mock interview</span>
      </div>
      <div className="p-4 space-y-3">
        {/* Role badge */}
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-300 text-xs font-medium">
          <Briefcase className="w-3 h-3" /> Senior Software Engineer · Google
        </div>

        {/* AI message */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          viewport={viewport}
          className="flex gap-2.5"
        >
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center flex-shrink-0 text-white text-xs font-bold mt-0.5">AI</div>
          <div className="bg-white/[0.05] border border-white/[0.08] rounded-2xl rounded-tl-none px-3 py-2.5 max-w-xs">
            <p className="text-slate-200 text-xs leading-relaxed">"Tell me about a time you led a team through a technically challenging project. What was your approach?"</p>
          </div>
        </motion.div>

        {/* User message */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          viewport={viewport}
          className="flex gap-2.5 flex-row-reverse"
        >
          <div className="w-7 h-7 rounded-full bg-slate-700 border border-white/10 flex items-center justify-center flex-shrink-0 text-white text-xs font-bold mt-0.5">U</div>
          <div className="bg-blue-600/20 border border-blue-500/20 rounded-2xl rounded-tr-none px-3 py-2.5 max-w-xs">
            <p className="text-slate-200 text-xs leading-relaxed">"At my last role, I led a 5-person team migrating our monolith to microservices. I broke it into phases, assigned ownership..."</p>
          </div>
        </motion.div>

        {/* Typing indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
          viewport={viewport}
          className="flex gap-2.5"
        >
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">AI</div>
          <div className="bg-white/[0.05] border border-white/[0.08] rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-1.5">
            <span className="typing-dot" />
            <span className="typing-dot" />
            <span className="typing-dot" />
          </div>
        </motion.div>

        {/* Feedback card */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          viewport={viewport}
          className="bg-teal-500/[0.08] border border-teal-500/20 rounded-xl p-3"
        >
          <div className="text-xs font-semibold text-teal-300 mb-1.5 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3" /> Live Feedback
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-300">
              <Check className="w-3 h-3 text-green-400 flex-shrink-0" />
              Strong use of STAR method — clear situation & action
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Lightbulb className="w-3 h-3 text-yellow-400 flex-shrink-0" />
              Add specific metrics — e.g. "reduced deploy time by 40%"
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

/* ── Feature section (alternating layout) ────────────────────── */
function FeatureSection({
  eyebrow,
  eyebrowColor,
  title,
  titleAccent,
  description,
  bullets,
  visual,
  reverse = false,
}: {
  eyebrow: string;
  eyebrowColor: string;
  title: string;
  titleAccent: string;
  description: string;
  bullets: string[];
  visual: React.ReactNode;
  reverse?: boolean;
}) {
  return (
    <section className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className={`grid lg:grid-cols-2 gap-16 items-center ${reverse ? 'lg:[&>*:first-child]:order-2' : ''}`}>
          {/* Text */}
          <motion.div
            variants={reverse ? fadeRight : fadeLeft}
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
          >
            <p className={`text-xs font-bold uppercase tracking-widest mb-3 ${eyebrowColor}`}>{eyebrow}</p>
            <h2 className="text-3xl sm:text-4xl font-black leading-tight mb-5">
              {title}
              <span className="block gradient-text">{titleAccent}</span>
            </h2>
            <p className="text-slate-400 leading-relaxed mb-7">{description}</p>
            <div className="space-y-3">
              {bullets.map((b) => (
                <div key={b} className="flex items-start gap-3 text-slate-300">
                  <CheckCircle className="w-4 h-4 text-teal-400 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{b}</span>
                </div>
              ))}
            </div>
          </motion.div>
          {/* Visual */}
          <motion.div
            variants={reverse ? fadeLeft : fadeRight}
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
          >
            {visual}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ── Step card ───────────────────────────────────────────────── */
function StepCard({ num, icon, title, body, delay = 0 }: { num: string; icon: React.ReactNode; title: string; body: string; delay?: number }) {
  return (
    <motion.div
      variants={fadeUp}
      custom={delay}
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
      className="step-card"
    >
      <div className="step-number">{num}</div>
      <div className="step-icon">{icon}</div>
      <h3 className="text-white font-bold text-lg mb-2">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed">{body}</p>
    </motion.div>
  );
}

/* ── Marketing homepage ──────────────────────────────────────── */
function MarketingHomepage() {
  function handleEnterApp() {
    try {
      const name = localStorage.getItem('prepify_username');
      window.location.href = name ? '/dashboard' : '/welcome';
    } catch {
      window.location.href = '/welcome';
    }
  }

  return (
    <div className="min-h-screen bg-[#080C14] text-white overflow-x-hidden">

      {/* ── Nav ────────────────────────────────────────────────── */}
      <nav className="fixed top-0 w-full z-50 glass-nav">
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <img src="/logo-dark.png" alt="Prepify" className="h-7 w-auto" />
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/igagandeep/Prepify"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors text-sm px-3 py-1.5"
            >
              <Github className="w-4 h-4" />
              <span className="hidden sm:inline">GitHub</span>
            </a>
            <button
              onClick={handleEnterApp}
              className="btn-primary text-sm px-5 py-2"
            >
              Try Demo →
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-20">
        <div className="hero-bg" />
        <div className="hero-grid" />
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-8 animate-pulse-slow"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Open Source · Free Forever · No Account Needed
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="text-4xl sm:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight mb-6"
          >
            Prepare smarter.
            <span className="block gradient-text">Interview with</span>
            confidence.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="text-lg sm:text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Track every application, analyze your resume against job descriptions with AI,
            and practice mock interviews — all in one open-source tool that runs on your machine.
            No subscriptions. No data harvesting.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-3"
          >
            <button
              onClick={handleEnterApp}
              className="btn-primary flex items-center gap-2 px-8 py-4 text-base w-full sm:w-auto justify-center"
            >
              <Eye className="w-5 h-5" />
              See Live Demo
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="/setup.bat"
              download="setup.bat"
              className="btn-secondary flex items-center gap-2 px-8 py-4 text-base w-full sm:w-auto justify-center"
            >
              <Download className="w-5 h-5" />
              Download for Windows
            </a>
            <div className="relative group w-full sm:w-auto">
              <button
                disabled={true}
                className="btn-secondary flex items-center gap-2 px-8 py-4 text-base w-full justify-center opacity-50 cursor-not-allowed"
              >
                <Globe className="w-5 h-5" />
                Chrome Extension
              </button>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-slate-800 border border-white/10 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                Coming soon to the Chrome Web Store
              </div>
            </div>
          </motion.div>

          {/* Windows requirement note */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.65 }}
            className="text-slate-500 text-xs mb-12"
          >
            Windows download requires <span className="text-slate-400 font-medium">Node.js 18+</span> and <span className="text-slate-400 font-medium">Git</span>
          </motion.p>

          {/* 3 feature pills */}
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="flex flex-wrap justify-center gap-3"
          >
            {[
              { icon: <Briefcase className="w-4 h-4 text-blue-400" />, label: 'Job Tracking' },
              { icon: <FileText className="w-4 h-4 text-purple-400" />, label: 'Resume Analyzer' },
              { icon: <MessageCircle className="w-4 h-4 text-cyan-400" />, label: 'AI Mock Interviews' },
            ].map(({ icon, label }) => (
              <motion.div
                key={label}
                variants={fadeUp}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-slate-300 text-sm font-medium"
              >
                {icon}
                {label}
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 scroll-indicator">
          <div className="scroll-dot" />
        </div>
      </section>

      {/* ── Stats ──────────────────────────────────────────────── */}
      <div className="shimmer-divider" />
      <section className="py-16 px-6">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          className="max-w-3xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-10"
        >
          {[
            { value: '$0', label: 'Cost, ever' },
            { value: '100%', label: 'Open source' },
            { value: '3', label: 'Core tools' },
            { value: '∞', label: 'Jobs tracked' },
          ].map(({ value, label }, i) => (
            <motion.div key={label} variants={fadeUp} custom={i * 0.1} className="text-center">
              <div className="stat-value">{value}</div>
              <div className="text-slate-400 text-sm mt-1 font-medium">{label}</div>
            </motion.div>
          ))}
        </motion.div>
      </section>
      <div className="shimmer-divider" />

      {/* ── Feature 1: Job Tracking ─────────────────────────────── */}
      <FeatureSection
        eyebrow="Job Tracking"
        eyebrowColor="text-blue-400"
        title="Every application,"
        titleAccent="one organized view."
        description="Stop losing track of where you applied, who you talked to, and what the next step is. Prepify gives you a visual pipeline so your entire job search is at a glance."
        bullets={[
          'Kanban board — Wishlist, Applied, Interview, Offer, Rejected',
          'Track company, role, salary, and follow-up dates',
          'Scrape jobs directly from LinkedIn with the Chrome Extension',
          'Never miss a follow-up again',
        ]}
        visual={<JobTrackerVisual />}
      />

      {/* ── Feature 2: Resume Analyzer ─────────────────────────── */}
      <div className="shimmer-divider" />
      <FeatureSection
        eyebrow="Resume Analyzer"
        eyebrowColor="text-purple-400"
        title="Know exactly how your"
        titleAccent="resume stacks up."
        description="Paste a job description and upload your resume. Prepify's AI instantly highlights keyword gaps, calculates a match score, and gives you actionable suggestions to tailor your resume for that specific role."
        bullets={[
          'Side-by-side keyword gap analysis',
          'AI match score — see how well you fit the role',
          'Specific, actionable improvement suggestions',
          'Tailored for every job description, not just generic advice',
        ]}
        visual={<ResumeAnalyzerVisual />}
        reverse
      />

      {/* ── Feature 3: Mock Interview ──────────────────────────── */}
      <div className="shimmer-divider" />
      <FeatureSection
        eyebrow="AI Mock Interviews"
        eyebrowColor="text-cyan-400"
        title="Practice until you're"
        titleAccent="ready for anything."
        description="Prepify's AI interviewer asks real questions tailored to your target role and company. Answer, get live feedback on structure and content, and refine your responses — before it counts."
        bullets={[
          'Role-specific questions based on your target job',
          'Real-time feedback on your STAR method usage',
          'Suggestions to add metrics and specificity',
          'Build muscle memory for the most common questions',
        ]}
        visual={<MockInterviewVisual />}
      />
      <div className="shimmer-divider" />

      {/* ── Mission ────────────────────────────────────────────── */}
      <section className="py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            {/* Left – story */}
            <motion.div
              variants={fadeLeft}
              initial="hidden"
              whileInView="visible"
              viewport={viewport}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold mb-6">
                <Heart className="w-3.5 h-3.5" />
                Why We Built This
              </div>
              <h2 className="text-4xl sm:text-5xl font-black leading-tight mb-6">
                Built by a job seeker,
                <span className="block gradient-text">for job seekers.</span>
              </h2>
              <p className="text-slate-300 text-lg leading-relaxed mb-5">
                Job searching is exhausting. Spreadsheets overflow. Paid tools
                want a credit card before they help. And you're already stressed enough.
              </p>
              <p className="text-slate-400 leading-relaxed mb-8">
                Prepify started as a personal frustration project — a way to stay organized
                and prepared without yet another subscription. It grew into something bigger:
                a fully open-source toolkit that puts you in control. Your data stays on
                your machine. No tracking. No upsells.
              </p>
              <div className="space-y-3">
                {[
                  'Zero cost — no freemium traps, ever',
                  'Your data lives on your machine, not our servers',
                  'Open source — fork it, own it, extend it',
                  'AI-powered without passing on AI subscription costs',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3 text-slate-300">
                    <CheckCircle className="w-4 h-4 text-teal-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right – vision cards */}
            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={viewport}
            >
              {[
                {
                  icon: <Target className="w-6 h-6 text-blue-400" />,
                  title: 'Our Mission',
                  body: 'Democratize access to powerful job search tools. Every job seeker — regardless of income — deserves the same AI-powered advantage.',
                },
                {
                  icon: <TrendingUp className="w-6 h-6 text-purple-400" />,
                  title: "What We're Building",
                  body: 'A complete job search OS — from discovery to offer — that\'s private, fast, and works offline. Web app, mobile, and browser extension on the roadmap.',
                },
                {
                  icon: <Zap className="w-6 h-6 text-cyan-400" />,
                  title: 'The Bigger Picture',
                  body: 'We believe the best tools should be open. Prepify is built in public, improved by the community, and will never be locked behind a paywall.',
                },
              ].map(({ icon, title, body }) => (
                <motion.div key={title} variants={fadeUp} className="vision-card">
                  <div className="mb-3">{icon}</div>
                  <h3 className="text-white font-bold mb-1.5">{title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{body}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>
      <div className="shimmer-divider" />

      {/* ── How it works ───────────────────────────────────────── */}
      <section className="py-28 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
            className="text-center mb-16"
          >
            <p className="text-xs font-semibold text-cyan-400 uppercase tracking-widest mb-3">Get Started</p>
            <h2 className="text-4xl sm:text-5xl font-black mb-4">
              Up and running in{' '}
              <span className="gradient-text">3 minutes</span>
            </h2>
            <p className="text-slate-400 text-lg">From download to job-ready — faster than brewing coffee.</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-5">
            <StepCard
              num="01"
              icon={<Briefcase className="w-5 h-5" />}
              title="Track Your Applications"
              body="Add jobs manually or scrape from LinkedIn with the Chrome Extension. Organize everything across Wishlist, Applied, Interview, Offer, and Rejected columns."
              delay={0}
            />
            <StepCard
              num="02"
              icon={<FileText className="w-5 h-5" />}
              title="Analyze Your Resume"
              body="Paste a job description and let AI highlight keyword gaps, calculate your match score, and give you tailored suggestions to improve your resume for that specific role."
              delay={0.15}
            />
            <StepCard
              num="03"
              icon={<MessageCircle className="w-5 h-5" />}
              title="Practice Mock Interviews"
              body="Run AI-powered mock interviews tuned to your target role. Get real-time feedback on structure, clarity, and content — so you walk in confident."
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* ── Open source CTA ────────────────────────────────────── */}
      <section className="py-10 px-6 pb-28">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          className="max-w-3xl mx-auto"
        >
          <div className="cta-card">
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6">
              <Github className="w-8 h-8 text-white" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-400 text-xs font-semibold mb-5">
              <Shield className="w-3 h-3" />
              100% Open Source · MIT License
            </div>
            <h2 className="text-3xl sm:text-4xl font-black mb-4 relative z-10">Join the community</h2>
            <p className="text-slate-300 mb-8 leading-relaxed max-w-xl mx-auto relative z-10">
              Every line of code is public on GitHub. Contribute features, report bugs, or
              star the repo to support the project. Built in public, for everyone.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
              <button
                onClick={handleEnterApp}
                className="btn-primary flex items-center gap-2 justify-center px-8 py-4"
              >
                <Eye className="w-5 h-5" /> Try the Demo
              </button>
              <a href="https://github.com/igagandeep/Prepify" target="_blank" rel="noopener noreferrer" className="btn-secondary flex items-center gap-2 justify-center px-8 py-4">
                <Github className="w-5 h-5" /> Star on GitHub
              </a>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <div className="shimmer-divider" />
      <footer className="py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <img src="/logo-dark.png" alt="Prepify" className="h-6 w-auto opacity-50" />
            <span className="text-slate-600 text-sm">Open Source · Built with love</span>
          </div>
          <div className="flex items-center gap-6 text-slate-600 text-sm">
            <a href="https://github.com/igagandeep/Prepify" target="_blank" rel="noopener noreferrer" className="hover:text-slate-300 transition-colors flex items-center gap-1.5">
              <Github className="w-4 h-4" /> GitHub
            </a>
            <span className="flex items-center gap-1.5">
              <Shield className="w-4 h-4" /> Privacy First
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ── Root ──────────────────────────────────────────────────────── */
export default function Home() {
  const router = useRouter();
  useEffect(() => {
    if (isDemo) return;
    try {
      const name = localStorage.getItem('prepify_username');
      router.replace(name ? '/dashboard' : '/welcome');
    } catch {
      router.replace('/welcome');
    }
  }, [router]);
  if (!isDemo) return null;
  return <MarketingHomepage />;
}
