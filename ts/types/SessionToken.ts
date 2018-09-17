/**
 * Defines a tagged type for SessionToken
 */

interface ISessionTokenTag {
  kind: "session-token";
}

export type SessionToken = string & ISessionTokenTag;
