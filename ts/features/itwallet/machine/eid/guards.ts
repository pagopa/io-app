import { Errors } from "@pagopa/io-react-native-wallet";
import { pipe } from "fp-ts/lib/function";
import * as t from "io-ts";
import * as J from "fp-ts/lib/Json";
import * as E from "fp-ts/lib/Either";
import { EidIssuanceEvents } from "./events";

export const NativeAuthSessionClosed = t.type({
  error: t.literal("NativeAuthSessionClosed")
});

export const createEidIssuanceGuardsImplementation = () => ({
  /**
   * Guard to check whether a native authentication session
   * opened with io-react-native-login-utils was closed by the user.
   */
  isNativeAuthSessionClosed: ({ event }: { event: EidIssuanceEvents }) => {
    if ("error" in event && event.error instanceof Errors.AuthorizationError) {
      return pipe(
        event.error.message,
        J.parse,
        E.map(NativeAuthSessionClosed.is),
        E.getOrElse(() => false)
      );
    }
    return false;
  }
});
