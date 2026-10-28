import { useState, useEffect } from "react";

/**
 * Custom hook to calculate and update trial countdown with urgency stages.
 * 
 * Stages:
 * - normal: > 24 hours remaining (Amber/Gold)
 * - warning: 12h - 24 hours remaining (Orange)
 * - critical: < 12 hours remaining (Red, pulsing with live seconds)
 * - expired: <= 0 seconds remaining
 */
export function useTrialCountdown(trialEndsAt, isPaid = false, serverTime = null) {
  const [countdown, setCountdown] = useState(null);

  useEffect(() => {
    // If tenant is paid or has no trial end timestamp, don't show any timer
    if (isPaid || !trialEndsAt) {
      setCountdown(null);
      return;
    }

    // Server-to-client clock offset in milliseconds
    const parsedServerTime = serverTime ? new Date(serverTime).getTime() : NaN;
    const clockOffset = !isNaN(parsedServerTime) ? parsedServerTime - Date.now() : 0;

    function updateTimer() {
      const targetTime = new Date(trialEndsAt).getTime();
      if (isNaN(targetTime)) {
        setCountdown(null);
        return;
      }

      const now = Date.now() + clockOffset;
      const diffInSeconds = Math.floor((targetTime - now) / 1000);

      if (isNaN(diffInSeconds)) {
        setCountdown(null);
        return;
      }

      if (diffInSeconds <= 0) {
        setCountdown({
          expired: true,
          stage: "expired",
          formatted: "Trial Expired",
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          totalSeconds: 0,
        });
        return;
      }

      const days = Math.floor(diffInSeconds / 86400);
      const hours = Math.floor((diffInSeconds % 86400) / 3600);
      const minutes = Math.floor((diffInSeconds % 3600) / 60);
      const seconds = diffInSeconds % 60;

      let stage = "normal";
      let formatted = `${days}d ${hours}h left`;

      if (diffInSeconds <= 12 * 3600) {
        // Less than 12 hours: Critical stage with ticking seconds
        stage = "critical";
        formatted = `${String(hours).padStart(2, "0")}h : ${String(minutes).padStart(2, "0")}m : ${String(seconds).padStart(2, "0")}s`;
      } else if (diffInSeconds <= 24 * 3600) {
        // 12 to 24 hours: Warning stage
        stage = "warning";
        formatted = `${hours}h ${minutes}m left`;
      } else {
        // More than 24 hours: Normal stage
        stage = "normal";
        formatted = days > 0 ? `${days}d ${hours}h left` : `${hours}h left`;
      }

      setCountdown({
        expired: false,
        stage,
        days,
        hours,
        minutes,
        seconds,
        totalSeconds: diffInSeconds,
        formatted,
      });
    }

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [trialEndsAt, isPaid, serverTime]);

  return countdown;
}
