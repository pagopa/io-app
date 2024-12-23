import * as O from "fp-ts/lib/Option";
import { fromPromise } from "xstate";
import { itwEaaVerifierBaseUrl } from "../../../../config";
import { useIOStore } from "../../../../store/hooks";
import { sessionTokenSelector } from "../../../../store/reducers/authentication";
import { assert } from "../../../../utils/assert";
import * as itwAttestationUtils from "../../common/utils/itwAttestationUtils";
import * as itwTrustmarkUtils from "../utils";
import { StoredCredential } from "../../common/utils/itwTypesUtils";
import { itwIntegrityKeyTagSelector } from "../../issuance/store/selectors";
import { itwWalletInstanceAttestationStore } from "../../walletInstance/store/actions";

export type GetWalletAttestationActorOutput = Awaited<
  ReturnType<typeof itwAttestationUtils.getAttestation>
>;

export type GetCredentialTrustmarkUrlActorInput = {
  walletInstanceAttestation?: string;
  credential?: StoredCredential;
};

export type GetCredentialTrustmarkUrlActorOutput = Awaited<
  ReturnType<typeof itwTrustmarkUtils.getCredentialTrustmark>
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
   * This actor gets the wallet instance attestation in case it's expired
   */
  const getWalletAttestationActor =
    fromPromise<GetWalletAttestationActorOutput>(async () => {
      const sessionToken = sessionTokenSelector(store.getState());
      const integrityKeyTag = itwIntegrityKeyTagSelector(store.getState());

      assert(sessionToken, "sessionToken is undefined");
      assert(O.isSome(integrityKeyTag), "integriyKeyTag is not present");

      /**
       * Get the wallet instance attestation
       */
      const wia = await itwAttestationUtils.getAttestation(
        integrityKeyTag.value,
        sessionToken
      );

      /**
       * Store the wallet instance attestation in the store to persist it across sessions
       */
      store.dispatch(itwWalletInstanceAttestationStore(wia));

      return wia;
    });

  const getCredentialTrustmarkActor = fromPromise<
    GetCredentialTrustmarkUrlActorOutput,
    GetCredentialTrustmarkUrlActorInput
  >(async ({ input }) => {
    assert(
      input.walletInstanceAttestation,
      "walletInstanceAttestation is undefined"
    );
    assert(input.credential, "credential is undefined");

    // Generate trustmark url to be presented
    return await itwTrustmarkUtils.getCredentialTrustmark(
      input.walletInstanceAttestation,
      input.credential,
      itwEaaVerifierBaseUrl
    );
  });

  return {
    getWalletAttestationActor,
    getCredentialTrustmarkActor
  };
};
