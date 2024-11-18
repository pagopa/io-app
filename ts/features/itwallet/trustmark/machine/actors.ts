import { fromPromise } from "xstate";
import { itwEaaVerifierBaseUrl } from "../../../../config";
import { useIOStore } from "../../../../store/hooks";
import { generateTrustmarkUrl } from "../../common/utils/itwCredentialUtils";
import { StoredCredential } from "../../common/utils/itwTypesUtils";
import { itwWalletInstanceAttestationSelector } from "../../walletInstance/store/reducers";

export type GetCredentialTrustmarkUrlActorInput = {
  credential: StoredCredential;
};

export const createItwTrustmarkActorsImplementation = (
  store: ReturnType<typeof useIOStore>
) => {
  const getCredentialTrustmarkUrlActor = fromPromise<
    string,
    GetCredentialTrustmarkUrlActorInput
  >(async ({ input }) => {
    // Gets the Wallet Instance Attestation from the persisted store
    const walletInstanceAttestation = itwWalletInstanceAttestationSelector(
      store.getState()
    );

    if (!walletInstanceAttestation) {
      throw new Error("Wallet Instance Attestation not found");
    }

    // Generate trustmark url to be presented
    return generateTrustmarkUrl(
      walletInstanceAttestation,
      input.credential,
      itwEaaVerifierBaseUrl
    );
  });

  return {
    getCredentialTrustmarkUrlActor
  };
};
