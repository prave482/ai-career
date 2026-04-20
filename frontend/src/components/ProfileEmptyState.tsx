'use client';

import Link from 'next/link';
import { FileWarning } from 'lucide-react';

export default function ProfileEmptyState({
  title,
  copy,
}: {
  title: string;
  copy: string;
}) {
  return (
    <div className="surface empty-state-panel">
      <FileWarning size={28} />
      <h2>{title}</h2>
      <p>{copy}</p>
      <Link href="/analyze" className="primary-button">
        Create Career Profile
      </Link>
    </div>
  );
}
