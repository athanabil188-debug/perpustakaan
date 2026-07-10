"use client";

import { useEffect } from "react";

export default function NotificationChecker() {
  useEffect(() => {
    const checkPendingRequests = async () => {
      try {
        const response = await fetch("/api/notifications/pending-requests");
        const data = await response.json();
        
        if (data.success) {
          const badge = document.getElementById("notificationBadge");
          if (badge) {
            if (data.pending_count > 0) {
              badge.textContent = data.pending_count;
              badge.classList.remove("hidden");
            } else {
              badge.classList.add("hidden");
            }
          }
        }
      } catch (error) {
        console.error("Error checking pending requests:", error);
      }
    };

    // Check immediately
    checkPendingRequests();
    
    // Check every 30 seconds
    const interval = setInterval(checkPendingRequests, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return null; // This component doesn't render anything
}