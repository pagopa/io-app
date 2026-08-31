/**
 * Error thrown when a credential status is not valid, determined
 * by checking the corresponding index in the token status list.
 */
export class InvalidTslCredentialStatus extends Error {
  /** The raw status (e.g. "0x01") to map to the dedicated error message */
  rawStatus: string;
  constructor(credentialId: string, rawStatus: string) {
    super(`${credentialId}'s status is: ${rawStatus}`);
    this.rawStatus = rawStatus;
  }
}
