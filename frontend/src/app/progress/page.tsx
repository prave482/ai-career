'use client';

import { useTransition } from 'react';
import toast from 'react-hot-toast';
import { CheckCircle2 } from 'lucide-react';
import ProfileEmptyState from '@/components/ProfileEmptyState';
import { updateCareerProgress } from '@/lib/api';
import { useCareerProfile } from '@/hooks/useCareerProfile';

export default function ProgressPage() {
  const { profile, persistProfile, isBootstrapping } = useCareerProfile();
  const [isSaving, startTransition] = useTransition();

  const save = (completedSkills: string[], completedProjects: string[], weeklyGoal: string) => {
    if (!profile) return;
    startTransition(async () => {
      try {
        const result = await updateCareerProgress(profile.id, {
          completedSkills,
          completedProjects,
          weeklyGoal,
        });
        persistProfile(result.profile);
      } catch (error: any) {
        toast.error(error?.response?.data?.error || 'Failed to save progress.');
      }
    });
  };

  const toggleSkill = (skill: string) => {
    if (!profile) return;
    const next = profile.progress.completedSkills.includes(skill)
      ? profile.progress.completedSkills.filter((item) => item !== skill)
      : [...profile.progress.completedSkills, skill];
    save(next, profile.progress.completedProjects, profile.progress.weeklyGoal);
  };

  const toggleProject = (projectTitle: string) => {
    if (!profile) return;
    const next = profile.progress.completedProjects.includes(projectTitle)
      ? profile.progress.completedProjects.filter((item) => item !== projectTitle)
      : [...profile.progress.completedProjects, projectTitle];
    save(profile.progress.completedSkills, next, profile.progress.weeklyGoal);
  };

  if (isBootstrapping) {
    return <div className="page-shell"><div className="surface"><p>Loading progress...</p></div></div>;
  }

  if (!profile) {
    return (
      <div className="page-shell">
        <ProfileEmptyState
          title="No progress to track yet"
          copy="Create your career profile first, then come back here to mark skills and projects as completed."
        />
      </div>
    );
  }

  return (
    <div className="page-shell panel-stack">
      <section className="surface">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Progress Tracker</p>
            <h1>Roadmap completion</h1>
          </div>
          <span className="status-pill">{profile.progress.completionScore}% complete</span>
        </div>
      </section>

      <div className="cards-grid cards-grid--three">
        <section className="surface panel-stack">
          <h2>Missing skills</h2>
          {profile.skillGap.missingSkills.map((skill) => {
            const checked = profile.progress.completedSkills.includes(skill);
            return (
              <label key={skill} className={`check-card ${checked ? 'is-checked' : ''}`}>
                <input type="checkbox" checked={checked} onChange={() => toggleSkill(skill)} />
                <span>{skill}</span>
                {checked ? <CheckCircle2 size={16} /> : null}
              </label>
            );
          })}
        </section>

        <section className="surface panel-stack">
          <h2>Projects</h2>
          {profile.projects.map((project) => {
            const checked = profile.progress.completedProjects.includes(project.title);
            return (
              <label key={project.title} className={`check-card ${checked ? 'is-checked' : ''}`}>
                <input type="checkbox" checked={checked} onChange={() => toggleProject(project.title)} />
                <span>{project.title}</span>
                {checked ? <CheckCircle2 size={16} /> : null}
              </label>
            );
          })}
        </section>

        <section className="surface panel-stack">
          <h2>Weekly goal</h2>
          <textarea
            className="textarea"
            rows={8}
            value={profile.progress.weeklyGoal}
            onChange={(event) =>
              persistProfile({
                ...profile,
                progress: { ...profile.progress, weeklyGoal: event.target.value },
              })
            }
            onBlur={() =>
              save(
                profile.progress.completedSkills,
                profile.progress.completedProjects,
                profile.progress.weeklyGoal
              )
            }
          />
          <p className="muted-copy">
            {isSaving ? 'Saving...' : `Updated ${new Date(profile.progress.updatedAt).toLocaleString()}`}
          </p>
        </section>
      </div>
    </div>
  );
}
