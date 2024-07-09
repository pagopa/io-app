import { openAuthenticationSession } from "@pagopa/io-react-native-login-utils";
import { fromPromise } from "xstate5";
import { LocalIdpsFallback } from "../../../../utils/idps";
import { getIdpLoginUri } from "../../../../utils/login";
import * as attestationUtils from "../../common/utils/itwAttestationUtils";
import * as issuanceUtils from "../../common/utils/itwIssuanceUtils";
import { StoredCredential } from "../../common/utils/itwTypesUtils";
import { IdentificationMode } from "./events";

export type GetWalletAttestationActorParams = {
  hardwareKeyTag: string | undefined;
};

export type RequestEidActorParams = {
  walletInstanceAttestation: string;
  identificationMode: IdentificationMode;
};

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

  getWalletAttestation: fromPromise<string, GetWalletAttestationActorParams>(
    async ({ input }) => {
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
    }
  ),

  showSpidIdentificationWebView: fromPromise<string, LocalIdpsFallback>(
    async ({ input }) =>
      openAuthenticationSession(getIdpLoginUri(input.id, 2), "iologin")
  ),

  requestEid: fromPromise<StoredCredential, RequestEidActorParams>(
    async ({ input }) => {
      const eidCredential = await issuanceUtils.getPid(input);

      // TODO: create stored credential

      return {} as StoredCredential;
    }
  )
});
