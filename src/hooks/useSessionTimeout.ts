import { useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";

interface UseSessionTimeoutOptions {
  timeoutMinutes?: number;
  warningMinutes?: number;
  onWarning?: () => void;
  onTimeout?: () => void;
}

export const useSessionTimeout = ({
  timeoutMinutes = 30,
  warningMinutes = 5,
  onWarning,
  onTimeout,
}: UseSessionTimeoutOptions = {}) => {
  const { user, signOut } = useAuth();

  const handleTimeout = useCallback(async () => {
    if (onTimeout) {
      onTimeout();
    } else {
      await signOut();
    }
  }, [onTimeout, signOut]);

  const handleWarning = useCallback(() => {
    if (onWarning) {
      onWarning();
    }
  }, [onWarning]);

  useEffect(() => {
    if (!user) return;

    let warningTimer: NodeJS.Timeout;
    let timeoutTimer: NodeJS.Timeout;

    const resetTimers = () => {
      clearTimeout(warningTimer);
      clearTimeout(timeoutTimer);

      // Set warning timer
      warningTimer = setTimeout(() => {
        handleWarning();
      }, (timeoutMinutes - warningMinutes) * 60 * 1000);

      // Set timeout timer
      timeoutTimer = setTimeout(() => {
        handleTimeout();
      }, timeoutMinutes * 60 * 1000);
    };

    const resetOnActivity = () => {
      resetTimers();
    };

    // Events that reset the timer
    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
    ];

    // Add event listeners
    events.forEach((event) => {
      document.addEventListener(event, resetOnActivity, true);
    });

    // Initialize timers
    resetTimers();

    // Cleanup
    return () => {
      clearTimeout(warningTimer);
      clearTimeout(timeoutTimer);
      events.forEach((event) => {
        document.removeEventListener(event, resetOnActivity, true);
      });
    };
  }, [user, timeoutMinutes, warningMinutes, handleWarning, handleTimeout]);

  return {
    isActive: !!user,
  };
};
