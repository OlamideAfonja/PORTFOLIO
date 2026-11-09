import type { Metadata } from 'next';
import { Inter, JetBrains_Mono, Space_Grotesk } from 'next/font/google';
import { TransitionProvider } from '@/ui/providers/TransitionProvider';
import { Cursor } from '@/ui/Cursor';
import { Nav } from '@/ui/Nav';
import './globals.css';

const sans = Inter({ subsets: ['latin'], variable: '--font-sans' });
const display = Space_Grotesk({ subsets: ['latin'], variable: '--font-display' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

export const metadata: Metadata = {
  title: 'Olamide Afonja · Backend Developer',
  description: 'Backend systems, shown as the systems they are.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable} ${mono.variable}`}>
      <body>
        <TransitionProvider>
          <Nav />
          {children}
          <Cursor />
        </TransitionProvider>
      </body>
    </html>
  );
}
