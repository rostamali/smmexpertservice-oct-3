import type { CSSProperties } from 'react';
import '@/app/globals.css';
import NotFoundView from '@/components/NotFoundView';
import { systemPageMetadata } from '@/lib/seo';

export const generateMetadata = () => systemPageMetadata('notFound', {
  title: '404 - Page Not Found',
  description: 'The page you are looking for could not be found.',
  noindex: true,
});

const themeStyle = {
  '--brand': '#3B82F6',
  '--brand-soft': '#EFF6FF',
  '--accent': '#2563EB',
  '--body': '#FFFFFF',
  '--body-dark': '#F8FAFC',
  '--theme-dark': '#172554',
  '--theme-light': '#F8FAFC',
  '--dark': '#101828',
  '--light': '#667085',
  '--text-default': '#667085',
  '--border-light': '#EAECF0',
  '--border-dark': '#D0D5DD',
} as CSSProperties;

export default function GlobalNotFound() {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-slate-600 antialiased" style={themeStyle}>
        <NotFoundView />
      </body>
    </html>
  );
}
