/* eslint-disable max-classes-per-file */

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

/**
 * Error thrown when a WUA status is not valid, determined
 * by checking the corresponding index in the token status list.
 */
export class InvalidTslWuaStatus extends Error {
  constructor(wuaId: string) {
    super(`${wuaId} WUA's status is not valid`);
  }
}
