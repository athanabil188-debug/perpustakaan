'use client';

import { useState, useEffect } from 'react';

export default function NotificationBadge() {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingCount();
    
    // Set up polling to update the count every 30 seconds
    const interval = setInterval(fetchPendingCount, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchPendingCount = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/notifications/pending-requests');
      const result = await response.json();

      if (result.success) {
        setCount(result.pending_count || 0);
      } else {
        console.error('Error fetching pending count:', result.message);
        setCount(0);
      }
    } catch (error) {
      console.error('Error fetching pending requests count:', error);
      setCount(0);
    } finally {
      setLoading(false);
    }
  };

  if (loading || count === 0) {
    return null; // Don't show anything if loading or count is 0
  }

  return (
    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
      {count > 99 ? '99+' : count}
    </span>
  );
}