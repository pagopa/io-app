import { Errors } from "@pagopa/io-react-native-wallet";
import { ItwSessionExpiredError } from "../../api/client";
import { CredentialIssuanceEvents } from "./events";

export const createCredentialIssuanceGuardsImplementation = () => ({
  isSessionExpired: ({ event }: { event: CredentialIssuanceEvents }) =>
    "error" in event && event.error instanceof ItwSessionExpiredError,

  isAsyncCredentialFlow: ({ event }: { event: CredentialIssuanceEvents }) =>
    "error" in event &&
    // @ts-expect-error update io-react-native-wallet
    event.error instanceof Errors.CredentialIssuingNotSynchronousError
});
