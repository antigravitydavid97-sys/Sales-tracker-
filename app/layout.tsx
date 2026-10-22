import type { Metadata } from 'next';
import './globals.css';
import { SalesTrackerProvider } from '@/context/SalesTrackerContext';
import { AppShell } from '@/components/layout/AppShell';

export const metadata: Metadata = {
  title: 'TE@M Sales Tracker',
  description: 'Herramienta profesional de seguimiento y control de ventas mensuales, cálculo de incentivos, bonus por producto, ritmo y proyecciones de cierre.',
  openGraph: {
    title: 'TE@M Sales Tracker',
    description: 'Herramienta profesional de seguimiento y control de ventas mensuales, cálculo de incentivos, bonus por producto, ritmo y proyecciones de cierre.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TE@M Sales Tracker',
    description: 'Herramienta profesional de seguimiento y control de ventas mensuales, cálculo de incentivos, bonus por producto, ritmo y proyecciones de cierre.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body suppressHydrationWarning className="bg-slate-50 min-h-screen text-slate-900">
        <SalesTrackerProvider>
          <AppShell>{children}</AppShell>
        </SalesTrackerProvider>
      </body>
    </html>
  );
}

