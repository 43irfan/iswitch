import type { Metadata } from 'next';
import { JetBrains_Mono, Manrope } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { cn } from '@/lib/utils';
import './globals.css';

const manrope = Manrope({
  variable: '--font-manrope',
  subsets: ['latin'],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: 'iSwitch Signal — Telecom Control Plane',
  description: 'Carrier-grade control plane for retail PBX, wholesale SIP, routing, billing, and live network operations.',
  openGraph: {
    title: 'iSwitch Signal — Telecom Control Plane',
    description: 'Every call. Under control.',
    images: [{ url: '/og.png', width: 1536, height: 864 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'iSwitch Signal — Telecom Control Plane',
    description: 'Every call. Under control.',
    images: ['/og.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var m=localStorage.getItem('iswitch-theme')||'system';var d=m==='dark'||(m==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.setAttribute('data-theme',d?'dark':'light');document.documentElement.classList.toggle('dark',d);}catch(e){}})();`,
          }}
        />
      </head>
      <body
        className={cn(
          manrope.variable,
          jetbrainsMono.variable,
          'min-h-screen font-sans antialiased',
        )}
      >
        <ThemeProvider>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
