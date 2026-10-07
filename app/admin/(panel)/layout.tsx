import { redirect } from 'next/navigation';
import { isAdmin } from '@/lib/auth';
import { store } from '@/lib/store';
import Sidebar from '../sidebar';

export const dynamic = 'force-dynamic';

export default async function PanelLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  if (!(await isAdmin())) redirect('/admin/login');
  const counts = await store().submissionCounts().catch(() => []);
  const newCounts: Record<string, number> = {};
  for (const c of counts) if (c.status === 'new') newCounts[c.form] = (newCounts[c.form] ?? 0) + c.count;
  return <div className="shell">
    <Sidebar newCounts={newCounts}/>
    <main className="main">{children}</main>
  </div>;
}
