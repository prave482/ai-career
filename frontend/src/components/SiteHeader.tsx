'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BriefcaseBusiness, LayoutDashboard, LineChart, Mic, Sparkles, Target } from 'lucide-react';

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/analyze', label: 'Resume Analyzer' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/projects', label: 'Projects' },
  { href: '/interview', label: 'Interview' },
  { href: '/progress', label: 'Progress' },
];

export default function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link href="/" className="site-brand">
          <div className="site-brand__icon">
            <Sparkles size={18} />
          </div>
          <div>
            <div className="site-brand__title">AI Career Copilot</div>
            <div className="site-brand__subtitle">Resume to role-ready roadmap</div>
          </div>
        </Link>

        <nav className="site-nav">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`site-nav__link ${pathname === item.href ? 'is-active' : ''}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="site-header__actions">
          <Link href="/analyze" className="site-chip">
            <Target size={15} />
            <span>Start Analysis</span>
          </Link>
        </div>
      </div>

      <div className="mobile-nav">
        <Link href="/dashboard" className={pathname === '/dashboard' ? 'is-active' : ''}>
          <LayoutDashboard size={16} />
          <span>Dashboard</span>
        </Link>
        <Link href="/analyze" className={pathname === '/analyze' ? 'is-active' : ''}>
          <BriefcaseBusiness size={16} />
          <span>Analyze</span>
        </Link>
        <Link href="/projects" className={pathname === '/projects' ? 'is-active' : ''}>
          <LineChart size={16} />
          <span>Projects</span>
        </Link>
        <Link href="/interview" className={pathname === '/interview' ? 'is-active' : ''}>
          <Mic size={16} />
          <span>Interview</span>
        </Link>
      </div>
    </header>
  );
}
