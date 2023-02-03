type LoginSource = {
  uri: string;
  headers?: Record<string, string>;
};

/**
 * Type representing login source successfully defined
 */
type LoginSourceReady = {
  kind: "ready";
  value: LoginSource;
};

/**
 * Type representing that the login source needs to be calculated yet
 */
type LoginSourceInitial = {
  kind: "initial";
};

/**
 * Type representing all handled objects
 */
export type LoginSourceAsync = LoginSourceReady | LoginSourceInitial;

export const isLoginSourceReady = (
  lgs: LoginSourceAsync
): lgs is LoginSourceReady => lgs.kind === "ready";
