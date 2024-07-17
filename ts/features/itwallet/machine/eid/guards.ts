import { Errors } from "@pagopa/io-react-native-wallet";
import { pipe } from "fp-ts/lib/function";
import * as t from "io-ts";
import * as E from "fp-ts/lib/Either";
import * as J from "fp-ts/lib/Json";
import * as O from "fp-ts/lib/Option";
import { useIOStore } from "../../../../store/hooks";
import { profileFiscalCodeSelector } from "../../../../store/reducers/profile";
import { EidIssuanceEvents } from "./events";
import { Context } from "./context";

const NativeAuthSessionClosed = t.type({
  error: t.literal("NativeAuthSessionClosed")
});

const EID_FISCAL_CODE_KEY = "tax_id_code";

export const createEidIssuanceGuardsImplementation = (
  store: ReturnType<typeof useIOStore>
) => ({
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
  },

  /**
   * Guard to check whether the user for whom the eID was issued
   * is the same that is currently authenticated in app.
   */
  issuedEidMatchesAuthenticatedUser: ({ context }: { context: Context }) => {
    const authenticatedUserFiscalCode = profileFiscalCodeSelector(
      store.getState()
    );

    const eidFiscalCode = pipe(
      context.eid?.parsedCredential,
      O.fromNullable,
      O.chain(x => O.fromNullable(x[EID_FISCAL_CODE_KEY]?.value)),
      O.map(t.string.decode),
      O.chain(O.fromEither),
      O.getOrElse(() => "")
    );

    return authenticatedUserFiscalCode === eidFiscalCode;
  }
});
