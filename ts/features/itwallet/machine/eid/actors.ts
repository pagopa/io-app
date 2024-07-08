import { openAuthenticationSession } from "@pagopa/io-react-native-login-utils";
import { fromPromise } from "xstate5";
import { LocalIdpsFallback } from "../../../../utils/idps";
import { getIdpLoginUri } from "../../../../utils/login";
import * as attestationUtils from "../../common/utils/itwAttestationUtils";
import * as issuanceUtils from "../../common/utils/itwIssuanceUtils";
import { StoredCredential } from "../../common/utils/itwTypesUtils";

export const createEidIssuanceActorsImplementation = () => ({
  registerWalletInstance: fromPromise<string>(async () => {
    try {
      const hardwareKeyTag =
        await attestationUtils.getIntegrityHardwareKeyTag();
      await attestationUtils.registerWalletInstance(hardwareKeyTag);
      return Promise.resolve(hardwareKeyTag);
    } catch (e) {
      return Promise.reject(e);
    }
  }),

  getWalletAttestation: fromPromise<
    string,
    { hardwareKeyTag: string | undefined }
  >(async ({ input }) => {
    if (input.hardwareKeyTag === undefined) {
      return Promise.reject(new Error("hardwareKeyTag is undefined"));
    }

    try {
      const walletAttestation = attestationUtils.getAttestation(
        input.hardwareKeyTag
      );
      return Promise.resolve(walletAttestation);
    } catch (e) {
      return Promise.reject(e);
    }
  }),

  showSpidIdentificationWebView: fromPromise<string, LocalIdpsFallback>(
    async ({ input }) =>
      openAuthenticationSession(getIdpLoginUri(input.id, 2), "iologin")
  ),

  requestEid: fromPromise<
    StoredCredential,
    { walletInstanceAttestation: string }
  >(async ({ input }) => {
    const eidCredential = await issuanceUtils.getPid({
      walletInstanceAttestation: input.walletInstanceAttestation,
      idphint: "https://demo.spid.gov.it"
    });

    return {} as StoredCredential;
  })
});
