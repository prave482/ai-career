import { Router } from 'express';
import CareerProfile from '../models/CareerProfile';
import {
  buildProgressSnapshot,
  evaluateInterviewAnswer,
  generateCareerSnapshot,
  generateInterviewQuestionsForProfile,
  generateProjectsForProfile,
} from '../services/ai.service';
import { CareerProfileRecord } from '../types/career';
import { isDatabaseReady } from '../utils/database';
import {
  createMemoryProfile,
  findMemoryProfileByEmail,
  findMemoryProfileById,
  updateMemoryProfile,
} from '../utils/memoryStore';
import { extractTextFromBase64Document } from '../utils/pdf';

const router = Router();

function normalizeList(input: unknown) {
  if (Array.isArray(input)) {
    return input.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof input === 'string') {
    return input
      .split(/[,\n]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function buildSnapshotInput(payload: Record<string, unknown>) {
  const fullName = String(payload.fullName ?? '').trim();
  const email = String(payload.email ?? '').trim().toLowerCase();
  const targetRole = String(payload.targetRole ?? '').trim();
  const careerGoals = normalizeList(payload.careerGoals);
  const skills = normalizeList(payload.skills);
  const resumeTextInput = String(payload.resumeText ?? '').trim();
  const resumeFileName = payload.resumeFileName ? String(payload.resumeFileName) : undefined;
  const resumeFileBase64 = payload.resumeFileBase64 ? String(payload.resumeFileBase64) : '';
  const extractedResumeText =
    !resumeTextInput && resumeFileBase64 ? extractTextFromBase64Document(resumeFileBase64, resumeFileName) : '';
  const resumeText = (resumeTextInput || extractedResumeText).trim();

  return {
    fullName,
    email,
    targetRole,
    careerGoals,
    skills,
    resumeText,
    resumeFileName,
  };
}

function validateBaseProfile(profile: ReturnType<typeof buildSnapshotInput>) {
  if (!profile.fullName) return 'Full name is required.';
  if (!profile.email) return 'Email is required.';
  if (!profile.targetRole) return 'Target role is required.';
  if (!profile.resumeText && !profile.skills.length) {
    return 'Provide a resume or list at least a few skills so the system can analyze the profile.';
  }
  return null;
}

function serializeProfile(document: any): CareerProfileRecord {
  return {
    id: String(document._id ?? document.id),
    fullName: document.fullName,
    email: document.email,
    targetRole: document.targetRole,
    careerGoals: document.careerGoals ?? [],
    skills: document.skills ?? [],
    resumeText: document.resumeText ?? '',
    resumeFileName: document.resumeFileName,
    analysis: document.analysis,
    skillGap: document.skillGap,
    projects: document.projects ?? [],
    interviewQuestions: document.interviewQuestions ?? [],
    progress: document.progress,
    createdAt: document.createdAt instanceof Date ? document.createdAt.toISOString() : String(document.createdAt),
    updatedAt: document.updatedAt instanceof Date ? document.updatedAt.toISOString() : String(document.updatedAt),
  };
}

async function findProfileById(id: string): Promise<CareerProfileRecord | null> {
  if (!isDatabaseReady()) return findMemoryProfileById(id);
  const profile = await CareerProfile.findById(id).lean();
  return profile ? serializeProfile(profile) : null;
}

router.post('/profiles/analyze', async (req, res, next) => {
  try {
    const input = buildSnapshotInput(req.body as Record<string, unknown>);
    const validationError = validateBaseProfile(input);
    if (validationError) {
      return res.status(400).json({ success: false, error: validationError });
    }

    const snapshot = await generateCareerSnapshot(input);
    const now = new Date().toISOString();

    if (!isDatabaseReady()) {
      const existing = findMemoryProfileByEmail(input.email);
      const nextRecord = {
        fullName: input.fullName,
        email: input.email,
        targetRole: input.targetRole,
        careerGoals: input.careerGoals,
        skills: input.skills,
        resumeText: input.resumeText,
        resumeFileName: input.resumeFileName,
        analysis: snapshot.analysis,
        skillGap: snapshot.skillGap,
        projects: snapshot.projects,
        interviewQuestions: snapshot.interviewQuestions,
        progress: snapshot.progress,
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
      };

      const saved = existing
        ? updateMemoryProfile(existing.id, (current) => ({ ...current, ...nextRecord }))!
        : createMemoryProfile(nextRecord);

      return res.json({
        success: true,
        data: {
          profile: saved,
          meta: { aiProvider: snapshot.aiProvider, storage: 'memory' },
        },
      });
    }

    const savedDoc = await CareerProfile.findOneAndUpdate(
      { email: input.email },
      {
        fullName: input.fullName,
        email: input.email,
        targetRole: input.targetRole,
        careerGoals: input.careerGoals,
        skills: input.skills,
        resumeText: input.resumeText,
        resumeFileName: input.resumeFileName,
        analysis: snapshot.analysis,
        skillGap: snapshot.skillGap,
        projects: snapshot.projects,
        interviewQuestions: snapshot.interviewQuestions,
        progress: snapshot.progress,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.json({
      success: true,
      data: {
        profile: serializeProfile(savedDoc),
        meta: { aiProvider: snapshot.aiProvider, storage: 'mongodb' },
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/profiles/:id', async (req, res, next) => {
  try {
    const profile = await findProfileById(req.params.id);
    if (!profile) {
      return res.status(404).json({ success: false, error: 'Profile not found.' });
    }

    return res.json({ success: true, data: { profile } });
  } catch (error) {
    next(error);
  }
});

router.post('/profiles/:id/projects', async (req, res, next) => {
  try {
    const profile = await findProfileById(req.params.id);
    if (!profile) {
      return res.status(404).json({ success: false, error: 'Profile not found.' });
    }

    const generated = await generateProjectsForProfile(profile);
    const progress = buildProgressSnapshot(
      profile.skillGap.missingSkills,
      generated.projects,
      profile.progress.completedSkills,
      profile.progress.completedProjects,
      profile.progress.weeklyGoal
    );

    if (!isDatabaseReady()) {
      const updated = updateMemoryProfile(profile.id, (current) => ({
        ...current,
        projects: generated.projects,
        progress,
        updatedAt: new Date().toISOString(),
      }));

      return res.json({
        success: true,
        data: { profile: updated, meta: { aiProvider: generated.aiProvider, storage: 'memory' } },
      });
    }

    const updated = await CareerProfile.findByIdAndUpdate(
      profile.id,
      { projects: generated.projects, progress },
      { new: true }
    );

    return res.json({
      success: true,
      data: { profile: serializeProfile(updated), meta: { aiProvider: generated.aiProvider, storage: 'mongodb' } },
    });
  } catch (error) {
    next(error);
  }
});

router.post('/profiles/:id/interview/questions', async (req, res, next) => {
  try {
    const profile = await findProfileById(req.params.id);
    if (!profile) {
      return res.status(404).json({ success: false, error: 'Profile not found.' });
    }

    const generated = await generateInterviewQuestionsForProfile(profile);

    if (!isDatabaseReady()) {
      const updated = updateMemoryProfile(profile.id, (current) => ({
        ...current,
        interviewQuestions: generated.interviewQuestions,
        updatedAt: new Date().toISOString(),
      }));

      return res.json({
        success: true,
        data: { profile: updated, meta: { aiProvider: generated.aiProvider, storage: 'memory' } },
      });
    }

    const updated = await CareerProfile.findByIdAndUpdate(
      profile.id,
      { interviewQuestions: generated.interviewQuestions },
      { new: true }
    );

    return res.json({
      success: true,
      data: { profile: serializeProfile(updated), meta: { aiProvider: generated.aiProvider, storage: 'mongodb' } },
    });
  } catch (error) {
    next(error);
  }
});

router.post('/profiles/:id/interview/evaluate', async (req, res, next) => {
  try {
    const profile = await findProfileById(req.params.id);
    if (!profile) {
      return res.status(404).json({ success: false, error: 'Profile not found.' });
    }

    const question = String(req.body.question ?? '').trim();
    const answer = String(req.body.answer ?? '').trim();

    if (!question || !answer) {
      return res.status(400).json({ success: false, error: 'Question and answer are required.' });
    }

    const feedback = await evaluateInterviewAnswer({
      targetRole: profile.targetRole,
      question,
      answer,
    });

    return res.json({ success: true, data: { feedback } });
  } catch (error) {
    next(error);
  }
});

router.patch('/profiles/:id/progress', async (req, res, next) => {
  try {
    const profile = await findProfileById(req.params.id);
    if (!profile) {
      return res.status(404).json({ success: false, error: 'Profile not found.' });
    }

    const completedSkills = normalizeList(req.body.completedSkills);
    const completedProjects = normalizeList(req.body.completedProjects);
    const weeklyGoal = String(req.body.weeklyGoal ?? profile.progress.weeklyGoal ?? '').trim();
    const progress = buildProgressSnapshot(
      profile.skillGap.missingSkills,
      profile.projects,
      completedSkills,
      completedProjects,
      weeklyGoal
    );

    if (!isDatabaseReady()) {
      const updated = updateMemoryProfile(profile.id, (current) => ({
        ...current,
        progress,
        updatedAt: new Date().toISOString(),
      }));

      return res.json({ success: true, data: { profile: updated } });
    }

    const updated = await CareerProfile.findByIdAndUpdate(profile.id, { progress }, { new: true });
    return res.json({ success: true, data: { profile: serializeProfile(updated) } });
  } catch (error) {
    next(error);
  }
});

export default router;
