import mongoose, { Schema } from 'mongoose';

const AnalysisSchema = new Schema(
  {
    summary: { type: String, required: true },
    strengths: { type: [String], default: [] },
    weaknesses: { type: [String], default: [] },
    missingSkills: { type: [String], default: [] },
  },
  { _id: false }
);

const SkillGapSchema = new Schema(
  {
    role: { type: String, required: true },
    currentSkills: { type: [String], default: [] },
    missingSkills: { type: [String], default: [] },
    learningPath: { type: [String], default: [] },
  },
  { _id: false }
);

const ProjectSchema = new Schema(
  {
    title: { type: String, required: true },
    summary: { type: String, required: true },
    techStack: { type: [String], default: [] },
    steps: { type: [String], default: [] },
    difficulty: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], required: true },
    portfolioValue: { type: String, required: true },
  },
  { _id: false }
);

const InterviewQuestionSchema = new Schema(
  {
    question: { type: String, required: true },
    focusArea: { type: String, required: true },
    idealAnswerHint: { type: String, required: true },
  },
  { _id: false }
);

const ProgressSchema = new Schema(
  {
    completedSkills: { type: [String], default: [] },
    completedProjects: { type: [String], default: [] },
    weeklyGoal: { type: String, default: '' },
    completionScore: { type: Number, default: 0 },
    updatedAt: { type: String, required: true },
  },
  { _id: false }
);

const CareerProfileSchema = new Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, index: true, unique: true },
    targetRole: { type: String, required: true },
    careerGoals: { type: [String], default: [] },
    skills: { type: [String], default: [] },
    resumeText: { type: String, default: '' },
    resumeFileName: { type: String },
    analysis: { type: AnalysisSchema, required: true },
    skillGap: { type: SkillGapSchema, required: true },
    projects: { type: [ProjectSchema], default: [] },
    interviewQuestions: { type: [InterviewQuestionSchema], default: [] },
    progress: { type: ProgressSchema, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.CareerProfile ||
  mongoose.model('CareerProfile', CareerProfileSchema);
