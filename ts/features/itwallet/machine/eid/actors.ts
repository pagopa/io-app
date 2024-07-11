import { openAuthenticationSession } from "@pagopa/io-react-native-login-utils";
import { fromPromise } from "xstate5";
import { LocalIdpsFallback } from "../../../../utils/idps";
import { getIdpLoginUri } from "../../../../utils/login";
import * as attestationUtils from "../../common/utils/itwAttestationUtils";
import * as issuanceUtils from "../../common/utils/itwIssuanceUtils";
import { StoredCredential } from "../../common/utils/itwTypesUtils";
import { assert } from "../../../../utils/assert";
import { type Identification } from "./context";

export type RequestEidActorParams = {
  integrityKeyTag: string | undefined;
  identification: Identification | undefined;
};

export const createEidIssuanceActorsImplementation = () => ({
  createWalletInstance: fromPromise<string>(async () => {
    try {
      const hardwareKeyTag =
        await attestationUtils.getIntegrityHardwareKeyTag();
      await attestationUtils.registerWalletInstance(hardwareKeyTag);
      return Promise.resolve(hardwareKeyTag);
    } catch (e) {
      return Promise.reject(e);
    }
  }),

  /*   obtainWalletAttestation: fromPromise<
    string,
    ObtainWalletAttestationActorParams
  >(async ({ input }) => {
    assert(input.hardwareKeyTag, "hardwareKeyTag is undefined");

    try {
      const walletAttestation = attestationUtils.getAttestation(
        input.hardwareKeyTag
      );
      return Promise.resolve(walletAttestation);
    } catch (e) {
      return Promise.reject(e);
    }
  }), */

  showSpidIdentificationWebView: fromPromise<string, LocalIdpsFallback>(
    async ({ input }) =>
      openAuthenticationSession(getIdpLoginUri(input.id, 2), "iologin")
  ),

  requestEid: fromPromise<StoredCredential, RequestEidActorParams>(
    async ({ input }) => {
      assert(input.integrityKeyTag, "integrityKeyTag is undefined");
      assert(input.identification, "identification is undefined");

      return issuanceUtils.getPid({
        integrityKeyTag: input.integrityKeyTag,
        identification: input.identification
      });
    }
  )
});
