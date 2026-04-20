import { randomUUID } from 'crypto';
import { CareerProfileRecord } from '../types/career';

const store = new Map<string, CareerProfileRecord>();

export function createMemoryProfile(profile: Omit<CareerProfileRecord, 'id'>): CareerProfileRecord {
  const id = randomUUID();
  const saved = { ...profile, id };
  store.set(id, saved);
  return saved;
}

export function updateMemoryProfile(
  id: string,
  updater: (current: CareerProfileRecord) => CareerProfileRecord
): CareerProfileRecord | null {
  const current = store.get(id);
  if (!current) return null;
  const next = updater(current);
  store.set(id, next);
  return next;
}

export function findMemoryProfileById(id: string): CareerProfileRecord | null {
  return store.get(id) ?? null;
}

export function findMemoryProfileByEmail(email: string): CareerProfileRecord | null {
  const normalized = email.trim().toLowerCase();
  for (const profile of store.values()) {
    if (profile.email.toLowerCase() === normalized) return profile;
  }
  return null;
}
