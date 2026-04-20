'use client';

import Link from 'next/link';
import ProfileEmptyState from '@/components/ProfileEmptyState';
import ProfileSummary from '@/components/ProfileSummary';
import { useCareerProfile } from '@/hooks/useCareerProfile';

export default function DashboardPage() {
  const { profile, meta, isBootstrapping } = useCareerProfile();

  if (isBootstrapping) {
    return <div className="page-shell"><div className="surface"><p>Loading dashboard...</p></div></div>;
  }

  if (!profile) {
    return (
      <div className="page-shell">
        <ProfileEmptyState
          title="No career profile found yet"
          copy="Start with the Resume Analyzer page, submit your own data, and then the dashboard will populate with live results."
        />
      </div>
    );
  }

  return (
    <div className="page-shell panel-stack">
      <ProfileSummary profile={profile} meta={meta} />

      <section className="cards-grid cards-grid--three">
        <Link href="/projects" className="surface nav-card">
          <h2>Projects</h2>
          <p>Open your generated project roadmap and refresh ideas.</p>
        </Link>
        <Link href="/interview" className="surface nav-card">
          <h2>Interview</h2>
          <p>Practice role-specific mock interview questions.</p>
        </Link>
        <Link href="/progress" className="surface nav-card">
          <h2>Progress</h2>
          <p>Track completed skills, projects, and your weekly goal.</p>
        </Link>
      </section>
    </div>
  );
}
