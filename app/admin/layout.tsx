import type { Metadata } from 'next';
import './admin.css';

export const metadata: Metadata = {
  title: { default: 'Admin', template: '%s · MPIITECH admin' },
  robots: { index: false, follow: false },
  icons: { icon: '/favicon.png' }
};

export default function AdminRootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className="admin-body">{children}</body></html>;
}
