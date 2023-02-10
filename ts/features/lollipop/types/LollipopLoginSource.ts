import { WebViewSourceUri } from "react-native-webview/lib/WebViewTypes";

/**
 * Type representing login source successfully defined
 */
type LoginSourceReady = {
  kind: "ready";
  value: WebViewSourceUri;
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
