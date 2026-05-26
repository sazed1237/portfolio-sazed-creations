"use client";

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import PageTransition from '@/components/PageTransition';
import StairTransition from '@/components/StairTransition';

export default function AppShell({ children }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');
  const firstLoadRef = useRef(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAdminRoute) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const duration = firstLoadRef.current ? 1200 : 700;
    firstLoadRef.current = false;

    const timer = window.setTimeout(() => {
      setIsLoading(false);
    }, duration);

    return () => window.clearTimeout(timer);
  }, [pathname, isAdminRoute]);

  if (isAdminRoute) {
    return <div className="min-h-screen">{children}</div>;
  }

  if (isLoading) {
    return (
      <main className="min-h-screen">
        <StairTransition active />
      </main>
    );
  }

  return (
    <>
      <main className="flex-1 flex flex-col">
        <Header />
        <div className="flex-1">
          <PageTransition>{children}</PageTransition>
        </div>
      </main>
      <Footer />
    </>
  );
}
