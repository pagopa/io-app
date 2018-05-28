/**
 * Defines a tagged type for SessionToken
 */

export interface ISessionTokenTag {
  kind: "session-token";
}

export type SessionToken = string & ISessionTokenTag;
