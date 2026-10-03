import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Anjani Infra Admin Portal',
  description: 'Manage banners, projects, blogs, client testimonials, and video showcase for Anjani Infra.',
  icons: {
    icon: '/anjani-logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0b1219] text-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}
