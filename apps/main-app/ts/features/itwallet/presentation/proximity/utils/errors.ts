/* eslint-disable max-classes-per-file */

/**
 * Thrown when all requested credentials are missing
 */
export class MissingCredentialError extends Error {
  constructor(public credentialsDocType: Array<string>) {
    super("All requested credentials are missing");
  }
}

/**
 * Thrown when an operation times out
 */
export class TimeoutError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

/**
 * Thrown when the verifier (RP) is not marked as trusted
 */
export class UntrustedRpError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = this.constructor.name;
  }
}
