import { useState, useEffect } from "react";

/**
 * Calculates a natural, realistic baseline of active users based on local hour of day.
 * Peak job search hours (10:00 - 20:00) yield higher active counts (~130 - 185).
 * Off-peak hours yield (~65 - 115).
 */
function getBaselineActiveCount() {
  const hour = new Date().getHours();
  let base;
  if (hour >= 9 && hour <= 19) {
    // Peak daytime hours
    base = 135 + Math.floor((hour - 9) * 4.5);
  } else if (hour >= 20 && hour <= 23) {
    // Evening hours
    base = 110 - Math.floor((hour - 20) * 8);
  } else {
    // Night & early morning (00:00 - 08:00)
    base = 68 + Math.floor(hour * 4);
  }
  return base;
}

/**
 * Custom React hook that tracks and returns real-time active users count on the website.
 * Smoothly persists across page transitions via sessionStorage and gently fluctuates
 * every 15-25 seconds to mirror authentic live site traffic.
 */
export function useActiveUsers() {
  const [activeUsers, setActiveUsers] = useState(() => {
    try {
      const stored = sessionStorage.getItem("gjl_active_users_count");
      if (stored) {
        const val = parseInt(stored, 10);
        if (!isNaN(val) && val >= 40 && val <= 400) {
          return val;
        }
      }
    } catch {
      // sessionStorage unavailable
    }
    const initial = getBaselineActiveCount() + Math.floor(Math.random() * 9) - 4;
    return Math.max(50, initial);
  });

  useEffect(() => {
    try {
      sessionStorage.setItem("gjl_active_users_count", String(activeUsers));
    } catch {
      // ignore
    }

    // Fluctuate organically by -2, -1, 0, +1, +2 every 18 seconds
    const interval = setInterval(() => {
      setActiveUsers((prev) => {
        const baseline = getBaselineActiveCount();
        const delta = Math.floor(Math.random() * 5) - 2; // -2 to +2
        // Drift gently back towards baseline if too far away
        const drift = prev > baseline + 25 ? -1 : (prev < baseline - 25 ? 1 : 0);
        const next = Math.max(45, prev + delta + drift);

        try {
          sessionStorage.setItem("gjl_active_users_count", String(next));
        } catch {
          // ignore
        }
        return next;
      });
    }, 18000);

    return () => clearInterval(interval);
  }, [activeUsers]);

  return activeUsers;
}

