/* eslint-disable max-classes-per-file */

/**
 * Error thrown when a credential status is not valid, determined
 * by checking the corresponding index in the token status list.
 */
export class InvalidTslCredentialStatus extends Error {
  constructor(credentialId: string) {
    super(`${credentialId}'s status is not valid`);
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
