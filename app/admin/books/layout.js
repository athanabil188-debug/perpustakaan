'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAdmin } from '../../../lib/auth';
import NotificationChecker from '../NotificationChecker';
import AdminNavbar from '../components/Navbar';
import AdminFooter from '../components/Footer';

export default function AdminBooksLayout({ children }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    // Check if user is authenticated as admin
    if (isAdmin()) {
      setHasAccess(true);
    } else {
      // Redirect to login if not authenticated as admin
      router.push('/login');
    }
    setIsLoading(false);
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-900 via-blue-700 to-blue-400">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="text-white mt-4">Memeriksa otorisasi...</p>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return null; // The redirect happens in useEffect, so we don't render anything here
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-700 to-blue-400">
      <NotificationChecker />
      <AdminNavbar />
      <div className="max-w-7xl mx-auto px-4 py-6">
        {children}
      </div>
      <AdminFooter />
    </div>
  );
}