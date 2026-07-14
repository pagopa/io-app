/* eslint-disable max-classes-per-file */

/**
 * Thrown when the verifier (RP) is not marked as trusted
 */
export class UntrustedRpError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

/**
 * Thrown when one or more mandatory credentials are missing
 */
export class MissingCredentialError extends Error {
  constructor(public credentialTypes: Array<string>) {
    super("One or more mandatory credentials are missing");
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
