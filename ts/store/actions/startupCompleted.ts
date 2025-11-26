import { createStandardAction } from "typesafe-actions";

export const startupCompleted =
  createStandardAction("STARTUP_COMPLETED")<void>();
