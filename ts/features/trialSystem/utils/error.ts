type TrialSystemErrorType =
  /* The user is not found in the trial system which corresponds to a 404 error
  However, the API also returns 404 when the trial id is not found
  We assume the trial id is correct so the only reason for the 404 is the user not being found. */
  | "TRIAL_SYSTEM_USER_NOT_FOUND"
  | "TRIAL_SYSTEM_GENERIC_ERROR"
  | "TRIAL_SYSTEM_NETWORK_ERROR";

/**
 * Custom error class for Trial System errors. It allows to specify a type of error
 * as some specific errors need to be handled differently.
 */
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
