'use client';

import { useTransition } from 'react';
import toast from 'react-hot-toast';
import { ArrowUpRight, LoaderCircle } from 'lucide-react';
import ProfileEmptyState from '@/components/ProfileEmptyState';
import { refreshProjects } from '@/lib/api';
import { useCareerProfile } from '@/hooks/useCareerProfile';

export default function ProjectsPage() {
  const { profile, meta, persistProfile, isBootstrapping } = useCareerProfile();
  const [isRefreshing, startTransition] = useTransition();

  const handleRefresh = () => {
    if (!profile) return;
    startTransition(async () => {
      try {
        const result = await refreshProjects(profile.id);
        persistProfile(result.profile, result.meta);
        toast.success('Projects refreshed.');
      } catch (error: any) {
        toast.error(error?.response?.data?.error || 'Failed to refresh projects.');
      }
    });
  };

  if (isBootstrapping) {
    return <div className="page-shell"><div className="surface"><p>Loading projects...</p></div></div>;
  }

  if (!profile) {
    return (
      <div className="page-shell">
        <ProfileEmptyState
          title="No project recommendations yet"
          copy="Create a profile from the Resume Analyzer first, then this page will show role-based project ideas."
        />
      </div>
    );
  }

  return (
    <div className="page-shell panel-stack">
      <section className="surface">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Project Generator</p>
            <h1>Projects for {profile.targetRole}</h1>
          </div>
          <div className="header-actions">
            <span className="tag">AI: {meta?.aiProvider ?? 'saved'}</span>
            <button className="secondary-button" onClick={handleRefresh} disabled={isRefreshing}>
              {isRefreshing ? <LoaderCircle className="spin" size={16} /> : <ArrowUpRight size={16} />}
              <span>Refresh Projects</span>
            </button>
          </div>
        </div>
      </section>

      <section className="cards-grid cards-grid--two">
        {profile.projects.map((project) => (
          <article key={project.title} className="surface project-card">
            <div className="section-heading">
              <div>
                <h2>{project.title}</h2>
                <p>{project.summary}</p>
              </div>
              <span className="status-pill">{project.difficulty}</span>
            </div>
            <div className="tag-row">
              {project.techStack.map((tech) => (
                <span key={tech} className="tag">{tech}</span>
              ))}
            </div>
            <ul className="list">
              {project.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ul>
            <p className="portfolio-note">{project.portfolioValue}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
