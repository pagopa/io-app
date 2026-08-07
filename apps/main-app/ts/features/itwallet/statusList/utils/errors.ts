/**
 * Error thrown when a credential status is not valid, determined
 * by checking the corresponding index in the token status list.
 */
export class InvalidTslCredentialStatus extends Error {
  constructor(credentialId: string) {
    super(`${credentialId}'s status is not valid`);
  }
}
