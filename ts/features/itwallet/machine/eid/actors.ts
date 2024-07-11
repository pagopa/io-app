import { openAuthenticationSession } from "@pagopa/io-react-native-login-utils";
import { fromPromise } from "xstate5";
import { LocalIdpsFallback } from "../../../../utils/idps";
import { getIdpLoginUri } from "../../../../utils/login";
import { StoredCredential } from "../../common/utils/itwTypesUtils";
import {
  getAttestation,
  getIntegrityHardwareKeyTag,
  registerWalletInstance
} from "../../common/utils/itwAttestationUtils";

export const createEidIssuanceActorsImplementation = () => ({
  createWalletInstance: fromPromise<string>(async () => {
    try {
      const hardwareKeyTag = await getIntegrityHardwareKeyTag();
      await registerWalletInstance(hardwareKeyTag);
      return Promise.resolve(hardwareKeyTag);
    } catch (e) {
      return Promise.reject(e);
    }
  }),

  obtainWalletAttestation: fromPromise<
    string,
    { hardwareKeyTag: string | undefined }
  >(async ({ input }) => {
    if (input.hardwareKeyTag === undefined) {
      return Promise.reject(new Error("hardwareKeyTag is undefined"));
    }

    try {
      const walletAttestation = getAttestation(input.hardwareKeyTag);
      return Promise.resolve(walletAttestation);
    } catch (e) {
      return Promise.reject(e);
    }
  }),

  showSpidIdentificationWebView: fromPromise<string, LocalIdpsFallback>(
    async ({ input }) =>
      openAuthenticationSession(getIdpLoginUri(input.id, 2), "iologin")
  ),

  requestEid: fromPromise<StoredCredential, string | undefined>(
    async () => ({} as StoredCredential)
  )
});
