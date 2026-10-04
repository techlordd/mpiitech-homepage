import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: 'MPIITECH | Learn, Build & Grow',
  description: 'Learn practical digital skills at MPIITECH in Modakeke, Osun State. Explore training programmes and enquire about center hire.'
};
export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) {
  return <html lang="en"><body>{children}</body></html>;
}
