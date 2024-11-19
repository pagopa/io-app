import { fromPromise } from "xstate";
import { itwEaaVerifierBaseUrl } from "../../../../config";
import { useIOStore } from "../../../../store/hooks";
import { getCredentialTrustmark } from "../../common/utils/itwTrustmarkUtils";
import { StoredCredential } from "../../common/utils/itwTypesUtils";
import { itwWalletInstanceAttestationSelector } from "../../walletInstance/store/reducers";

export type GetCredentialTrustmarkUrlActorInput = {
  credential: StoredCredential;
};

export type GetCredentialTrustmarkUrlActorOutput = Awaited<
  ReturnType<typeof getCredentialTrustmark>
>;

/**
 * Creates the actors for the itwTrustmarkMachine
 * @param store the IOStore
 * @returns the actors
 */
export const createItwTrustmarkActorsImplementation = (
  store: ReturnType<typeof useIOStore>
) => {
  /**
   * Get the credential trustmark actor
   */
  const getCredentialTrustmarkActor = fromPromise<
    GetCredentialTrustmarkUrlActorOutput,
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
    return await getCredentialTrustmark(
      walletInstanceAttestation,
      input.credential,
      itwEaaVerifierBaseUrl
    );
  });

  return {
    getCredentialTrustmarkActor
  };
};
