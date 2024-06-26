import { openAuthenticationSession } from "@pagopa/io-react-native-login-utils";
import { fromPromise } from "xstate5";
import { LocalIdpsFallback } from "../../../../utils/idps";
import { getIdpLoginUri } from "../../../../utils/login";
import { StoredCredential } from "../../common/utils/itwTypesUtils";

export const createEidIssuanceActorsImplementation = () => ({
  registerWalletInstance: fromPromise<string>(async () => ""),

  showSpidIdentificationWebView: fromPromise<string, LocalIdpsFallback>(
    async ({ input }) =>
      openAuthenticationSession(getIdpLoginUri(input.id, 2), "iologin")
  ),

  requestEid: fromPromise<StoredCredential, string | undefined>(
    async () => ({} as StoredCredential)
  )
});
