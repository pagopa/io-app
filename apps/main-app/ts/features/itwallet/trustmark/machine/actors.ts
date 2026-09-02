import * as O from "fp-ts/lib/Option";
import { fromPromise } from "xstate";

import { assert } from "../../../../utils/assert";
import { sessionTokenSelector } from "../../../authentication/common/store/selectors";
import * as itwAttestationUtils from "../../common/utils/itwAttestationUtils";
import { CredentialMetadata } from "../../common/utils/itwTypesUtils";
import { itwIntegrityKeyTagSelector } from "../../issuance/store/selectors";
import * as itwTrustmarkUtils from "../utils";
import { TrustmarkMachineDeps } from "./input";

export type GetCredentialTrustmarkUrlActorInput = {
  credential?: CredentialMetadata;
  deps: TrustmarkMachineDeps;
  walletInstanceAttestation?: string;
};

export type GetCredentialTrustmarkUrlActorOutput = Awaited<
  ReturnType<typeof itwTrustmarkUtils.getCredentialTrustmark>
>;

export type GetWalletAttestationActorInput = {
  deps: TrustmarkMachineDeps;
};

export type GetWalletAttestationActorOutput = Awaited<
  ReturnType<typeof itwAttestationUtils.getWalletInstanceAttestation>
>;

/**
 * Gets the wallet instance attestation in case it's expired.
 */
export const getWalletAttestationActor = fromPromise<
  GetWalletAttestationActorOutput,
  GetWalletAttestationActorInput
>(async ({ input }) => {
  const { env, itwVersion, store } = input.deps;
  const sessionToken = sessionTokenSelector(store.getState());
  const integrityKeyTag = itwIntegrityKeyTagSelector(store.getState());

  assert(sessionToken, "sessionToken is undefined");
  assert(O.isSome(integrityKeyTag), "integriyKeyTag is not present");

  return await itwAttestationUtils.getWalletInstanceAttestation(
    env,
    itwVersion,
    integrityKeyTag.value,
    sessionToken
  );
});

/**
 * Generates the trustmark url to be presented.
 */
export const getCredentialTrustmarkActor = fromPromise<
  GetCredentialTrustmarkUrlActorOutput,
  GetCredentialTrustmarkUrlActorInput
>(async ({ input }) => {
  const { env, itwVersion } = input.deps;
  assert(
    input.walletInstanceAttestation,
    "walletInstanceAttestation is undefined"
  );
  assert(input.credential, "credential is undefined");

  return await itwTrustmarkUtils.getCredentialTrustmark(
    env,
    itwVersion,
    input.walletInstanceAttestation,
    input.credential
  );
});
