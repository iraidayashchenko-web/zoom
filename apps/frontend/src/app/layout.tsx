import './globals.css';
import type { ReactNode } from 'react';
export const metadata = { title: 'NovaMeet', description: 'Secure enterprise video meetings' };
export default function RootLayout({ children }: { children: ReactNode }) { return <html lang="en"><body>{children}</body></html>; }
