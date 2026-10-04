'use client';
import { useActionState } from 'react';
import { login } from '../actions';

export default function LoginForm() {
  const [state, action, pending] = useActionState(login, null);
  return <form action={action}>
    <label className="f"><span>Username</span><input name="username" autoComplete="username" required defaultValue="admin"/></label>
    <label className="f"><span>Password</span><input name="password" type="password" autoComplete="current-password" required autoFocus/></label>
    {state?.error && <div className="notice error" role="alert">{state.error}</div>}
    <button className="btn accent" disabled={pending}>{pending ? 'Signing in…' : 'Sign in'}</button>
  </form>;
}
