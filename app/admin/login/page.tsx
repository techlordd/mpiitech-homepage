import { redirect } from 'next/navigation';
import { adminConfigured, isAdmin } from '@/lib/auth';
import LoginForm from './login-form';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Sign in' };

export default async function LoginPage() {
  if (await isAdmin()) redirect('/admin');
  return <div className="login"><div className="login-card">
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src="/logo.png" alt="MPIITECH"/>
    <h1>Website admin</h1>
    <p>Sign in to manage the MPIITECH website.</p>
    {!adminConfigured() && <div className="notice warn" style={{ marginTop: 16 }}><b>Admin access is not set up yet</b>Add an <code>ADMIN_PASSWORD</code> environment variable (and optionally <code>ADMIN_USERNAME</code>, default “admin”), then redeploy.</div>}
    <LoginForm/>
  </div></div>;
}
