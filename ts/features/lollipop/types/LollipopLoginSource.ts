import { PublicKey } from "@pagopa/io-react-native-crypto";
import * as O from "fp-ts/lib/Option";
import { WebViewSourceUri } from "react-native-webview/lib/WebViewTypes";

/**
 * Type representing login source successfully defined
 */
type LoginSourceReady = {
  kind: "ready";
  value: WebViewSourceUri;
  publicKey: O.Option<PublicKey>;
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

const isLoginSourceReady = (lgs: LoginSourceAsync): lgs is LoginSourceReady =>
  lgs.kind === "ready";

export const publicKey = (lgs: LoginSourceAsync) =>
  isLoginSourceReady(lgs) ? lgs.publicKey : O.none;
