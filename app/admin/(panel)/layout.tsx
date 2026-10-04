import { redirect } from 'next/navigation';
import { isAdmin } from '@/lib/auth';
import { store } from '@/lib/store';
import Sidebar from '../sidebar';

export const dynamic = 'force-dynamic';

export default async function PanelLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  if (!(await isAdmin())) redirect('/admin/login');
  const counts = await store().submissionCounts().catch(() => []);
  const newCount = (form: string) => counts.filter(c => c.form === form && c.status === 'new').reduce((n, c) => n + c.count, 0);
  return <div className="shell">
    <Sidebar newEnquiries={newCount('enquiry')} newMessages={newCount('contact')}/>
    <main className="main">{children}</main>
  </div>;
}
