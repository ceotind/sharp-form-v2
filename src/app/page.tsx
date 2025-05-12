'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push('/forms');
      } else {
        router.push('/auth/login');
      }
    }
  }, [user, loading, router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="animate-pulse">
        <h1 className="text-4xl font-bold">SharpForm Builder</h1>
        <p className="mt-4 text-xl text-center">Loading...</p>
      </div>
    </main>
  );
}
