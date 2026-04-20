'use client';

import ProfileForm from '@/components/ProfileForm';
import ProfileSummary from '@/components/ProfileSummary';
import { useCareerProfile } from '@/hooks/useCareerProfile';

export default function AnalyzePage() {
  const { profile, meta, persistProfile, clearProfile } = useCareerProfile();

  return (
    <div className="page-shell two-panel-layout">
      <ProfileForm onProfileReady={persistProfile} />
      <div>
        {profile ? (
          <ProfileSummary profile={profile} meta={meta} onClear={clearProfile} />
        ) : (
          <div className="surface empty-state-panel">
            <h2>Your analysis will appear here</h2>
            <p>
              Enter your real resume details on the left. Once analysis is complete, strengths,
              weaknesses, missing skills, and learning path recommendations will show up here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
