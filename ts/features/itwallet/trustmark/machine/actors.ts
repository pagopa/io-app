import * as O from "fp-ts/lib/Option";
import { fromPromise } from "xstate";
import { useIOStore } from "../../../../store/hooks";
import { sessionTokenSelector } from "../../../authentication/common/store/selectors";
import { assert } from "../../../../utils/assert";
import * as itwAttestationUtils from "../../common/utils/itwAttestationUtils";
import { itwIntegrityKeyTagSelector } from "../../issuance/store/selectors";
import * as itwTrustmarkUtils from "../utils";
import { Env } from "../../common/utils/environment";
import { CredentialMetadata } from "../../common/utils/itwTypesUtils";

export type GetWalletAttestationActorOutput = Awaited<
  ReturnType<typeof itwAttestationUtils.getAttestation>
>;

export type GetCredentialTrustmarkUrlActorInput = {
  walletInstanceAttestation?: string;
  credential?: CredentialMetadata;
};

export type GetCredentialTrustmarkUrlActorOutput = Awaited<
  ReturnType<typeof itwTrustmarkUtils.getCredentialTrustmark>
>;

/**
 * Creates the actors for the itwTrustmarkMachine
 * @param env - The environment to use for the IT Wallet API calls
 * @param store the IOStore
 * @returns the actors
 */
export const createItwTrustmarkActorsImplementation = (
  env: Env,
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
      return await itwAttestationUtils.getAttestation(
        env,
        integrityKeyTag.value,
        sessionToken
      );
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
      env,
      input.walletInstanceAttestation,
      input.credential
    );
  });

  return {
    getWalletAttestationActor,
    getCredentialTrustmarkActor
  };
};
