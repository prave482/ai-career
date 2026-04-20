export type CareerAnalysis = {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  missingSkills: string[];
};

export type SkillGapAnalysis = {
  role: string;
  currentSkills: string[];
  missingSkills: string[];
  learningPath: string[];
};

export type CareerProject = {
  title: string;
  summary: string;
  techStack: string[];
  steps: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  portfolioValue: string;
};

export type InterviewQuestion = {
  question: string;
  focusArea: string;
  idealAnswerHint: string;
};

export type InterviewFeedback = {
  score: number;
  verdict: string;
  strengths: string[];
  improvements: string[];
  sampleAnswer: string;
};

export type ProgressSnapshot = {
  completedSkills: string[];
  completedProjects: string[];
  weeklyGoal: string;
  completionScore: number;
  updatedAt: string;
};

export type CareerSnapshot = {
  analysis: CareerAnalysis;
  skillGap: SkillGapAnalysis;
  projects: CareerProject[];
  interviewQuestions: InterviewQuestion[];
  progress: ProgressSnapshot;
  aiProvider: string;
};

export type CareerProfileRecord = {
  id: string;
  fullName: string;
  email: string;
  targetRole: string;
  careerGoals: string[];
  skills: string[];
  resumeText: string;
  resumeFileName?: string;
  analysis: CareerAnalysis;
  skillGap: SkillGapAnalysis;
  projects: CareerProject[];
  interviewQuestions: InterviewQuestion[];
  progress: ProgressSnapshot;
  createdAt: string;
  updatedAt: string;
};
