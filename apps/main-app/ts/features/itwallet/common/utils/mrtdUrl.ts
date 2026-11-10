const getRedirectQuery = (url: string): URLSearchParams => {
  const queryStart = url.indexOf("?");
  return new URLSearchParams(queryStart >= 0 ? url.slice(queryStart + 1) : "");
};

/**
 * Checks if the PID Provider requires the MRTD PoP step by looking for
 * `challenge_info` in the post-auth redirect URL. This is a pure URL-parsing
 * utility with no native dependencies, safe to import from the XState machine
 * definition.
 */
export const isMrtdPoPChallengeRequired = (authRedirectUrl: string): boolean =>
  getRedirectQuery(authRedirectUrl).has("challenge_info");
