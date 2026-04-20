'use client';

import { ChangeEvent, FormEvent, useState, useTransition } from 'react';
import { LoaderCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { analyzeCareerProfile, CareerProfile } from '@/lib/api';

type ProfileMeta = {
  aiProvider: string;
  storage: string;
};

type Props = {
  onProfileReady: (profile: CareerProfile, meta: ProfileMeta) => void;
};

type FormState = {
  fullName: string;
  email: string;
  targetRole: string;
  skills: string;
  careerGoals: string;
  resumeText: string;
};

const initialForm: FormState = {
  fullName: '',
  email: '',
  targetRole: '',
  skills: '',
  careerGoals: '',
  resumeText: '',
};

function splitCommaList(input: string) {
  return input.split(/[,\n]/).map((item) => item.trim()).filter(Boolean);
}

export default function ProfileForm({ onProfileReady }: Props) {
  const [form, setForm] = useState<FormState>(initialForm);
  const [isPending, startTransition] = useTransition();

  const handleChange = (field: keyof FormState) => (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    startTransition(async () => {
      try {
        const result = await analyzeCareerProfile({
          fullName: form.fullName,
          email: form.email,
          targetRole: form.targetRole,
          skills: splitCommaList(form.skills),
          careerGoals: splitCommaList(form.careerGoals),
          resumeText: form.resumeText,
        });
        onProfileReady(result.profile, result.meta);
        toast.success('Career analysis created.');
      } catch (error: any) {
        const errMsg = error?.response?.data?.error || error?.message || 'Failed to analyze profile.';
        toast.error(errMsg);
      }
    });
  };

  return (
    <form className="surface panel-stack" onSubmit={handleSubmit}>
      <div className="section-heading">
        <div>
          <p className="eyebrow">Resume Analyzer</p>
          <h1>Analyze your profile</h1>
        </div>
        <span className="status-pill">AI-Powered</span>
      </div>

      <div className="field-grid">
        <label>
          Full name
          <input className="input" value={form.fullName} onChange={handleChange('fullName')} placeholder="Your name" />
        </label>
        <label>
          Email
          <input className="input" type="email" value={form.email} onChange={handleChange('email')} placeholder="you@example.com" />
        </label>
        <label>
          Target role
          <input className="input" value={form.targetRole} onChange={handleChange('targetRole')} placeholder="Frontend Developer" />
        </label>
        <label>
          Skills
          <input className="input" value={form.skills} onChange={handleChange('skills')} placeholder="React, TypeScript, Node.js" />
        </label>
      </div>

      <label>
        Career goals
        <textarea className="textarea" rows={3} value={form.careerGoals} onChange={handleChange('careerGoals')} placeholder="Describe your career goals and what you want to improve." />
      </label>

      <label>
        Resume text
        <textarea className="textarea" rows={10} value={form.resumeText} onChange={handleChange('resumeText')} placeholder="Paste your resume text here..." />
      </label>

      <button className="primary-button" type="submit" disabled={isPending}>
        {isPending ? <LoaderCircle className="spin" size={18} /> : null}
        <span>{isPending ? 'Analyzing...' : 'Run Analysis'}</span>
      </button>
    </form>
  );
}