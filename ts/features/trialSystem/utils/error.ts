type TrialSystemErrorType =
  | "TRIAL_SYSTEM_USER_NOT_FOUND"
  | "TRIAL_SYSTEM_GENERIC_ERROR"
  | "TRIAL_SYSTEM_NETWORK_ERROR";

export class TrialSystemError extends Error {
  public readonly type?: TrialSystemErrorType;

  constructor(
    message: string | undefined,
    type: TrialSystemErrorType = "TRIAL_SYSTEM_GENERIC_ERROR"
  ) {
    // Pass parent constructor parameters
    super(message);

    // Maintains stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, TrialSystemError);
    }

    this.name = "TrialSystemError";
    if (message) {
      this.message = message;
    }
    // Set custom information
    this.type = type;
  }
}
