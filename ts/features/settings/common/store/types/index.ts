type ProfileErrorType =
  | "PROFILE_EMAIL_VALIDATION_ERROR"
  | "PROFILE_GENRIC_ERROR"
  | "PROFILE_LOAD_ERROR"
  | "PROFILE_EMAIL_IS_NOT_UNIQUE_ERROR";
export class ProfileError extends Error {
  public readonly type?: ProfileErrorType;

  constructor(
    message: string | undefined,
    type: ProfileErrorType = "PROFILE_GENRIC_ERROR"
  ) {
    // Pass parent constructor parameters
    super(message);

    // Maintains stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ProfileError);
    }

    this.name = "ProfileError";
    if (message) {
      this.message = message;
    }
    // Set custom information
    this.type = type;
  }
}
