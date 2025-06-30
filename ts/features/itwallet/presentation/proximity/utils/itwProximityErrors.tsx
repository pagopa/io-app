/* eslint-disable max-classes-per-file */

/**
 * Thrown when requested documents are not valid
 */
export class InvalidRequestedDocumentsError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = this.constructor.name;
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
