import { completePastBookings } from "./completeBookings.job";

const COMPLETION_JOB_INTERVAL_MS = 15 * 60 * 1000;

export const startBackgroundJobs = (): void => {
  completePastBookings().catch((err) =>
    console.error("Initial booking completion job failed:", err),
  );

  setInterval(() => {
    completePastBookings().catch((err) =>
      console.error("Booking completion job failed:", err),
    );
  }, COMPLETION_JOB_INTERVAL_MS);
};
