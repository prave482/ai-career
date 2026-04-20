import Link from 'next/link';
import { ArrowRight, BriefcaseBusiness, Mic, Sparkles, Target, TrendingUp } from 'lucide-react';

const featureCards = [
  {
    title: 'Resume Analyzer',
    copy: 'Upload your resume and receive AI-powered strengths, weaknesses, and missing skill insights.',
  },
  {
    title: 'Skill Gap Analysis',
    copy: 'Compare your current skills to a target role and get a practical learning path.',
  },
  {
    title: 'Project Generator',
    copy: 'Generate portfolio-worthy projects with tech stack suggestions and implementation steps.',
  },
  {
    title: 'Mock Interview',
    copy: 'Practice questions tailored to your target role and evaluate your answers.',
  },
  {
    title: 'Progress Tracking',
    copy: 'Keep your roadmap visible by tracking finished skills, projects, and weekly goals.',
  },
];

export default function HomePage() {
  return (
    <div className="page-shell">
      <section className="landing-hero surface">
        <div className="landing-hero__copy">
          <p className="eyebrow">AI Career Copilot</p>
          <h1>A multi-page career website built for real resume analysis.</h1>
          <p className="lead-copy">
            Move through a proper product flow instead of a single long page. Analyze your profile,
            explore project ideas, practice interviews, and track progress across dedicated pages.
          </p>
          <div className="hero-actions">
            <Link href="/analyze" className="primary-button">
              Start With Resume Analyzer
            </Link>
            <Link href="/dashboard" className="secondary-button">
              Open Dashboard
              <ArrowRight size={16} />
            </Link>
          </div>
          <div className="tag-row">
            <span className="tag"><Sparkles size={14} /> OpenAI / LLaMA ready</span>
            <span className="tag"><BriefcaseBusiness size={14} /> Portfolio planning</span>
            <span className="tag"><Mic size={14} /> Interview practice</span>
          </div>
        </div>

        <div className="landing-hero__panel">
          <div className="hero-stat">
            <Target size={18} />
            <div>
              <strong>Role-focused analysis</strong>
              <p>Start with your own live data, not seeded demo content.</p>
            </div>
          </div>
          <div className="hero-stat">
            <TrendingUp size={18} />
            <div>
              <strong>Persistent profile</strong>
              <p>Your latest analyzed profile can be reused across pages.</p>
            </div>
          </div>
          <div className="hero-stat">
            <Sparkles size={18} />
            <div>
              <strong>Production-ready flow</strong>
              <p>Frontend pages are connected to backend REST APIs and database storage.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="cards-grid cards-grid--three">
        {featureCards.map((card) => (
          <article key={card.title} className="surface feature-card">
            <h2>{card.title}</h2>
            <p>{card.copy}</p>
          </article>
        ))}
      </section>

      <section className="surface page-cta">
        <div>
          <p className="eyebrow">Explore The Product</p>
          <h2>Use dedicated pages for each step of the journey.</h2>
          <p className="lead-copy">
            Begin with the resume analyzer, then continue through projects, interview prep, and progress tracking.
          </p>
        </div>
        <div className="cta-links">
          <Link href="/analyze">Resume Analyzer</Link>
          <Link href="/projects">Projects</Link>
          <Link href="/interview">Mock Interview</Link>
          <Link href="/progress">Progress Tracker</Link>
        </div>
      </section>
    </div>
  );
}
