/* eslint-disable @typescript-eslint/no-empty-function */
import { fromPromise } from "xstate5";
import * as attestationUtils from "../../common/utils/itwAttestationUtils";
import { StoredCredential } from "../../common/utils/itwTypesUtils";

export const createIssuanceActorsImplementation = () => {
  const checkUserOptIn = fromPromise<undefined>(async () => undefined);

  const registerWalletInstance = fromPromise<string>(async () => {
    try {
      const hardwareKeyTag =
        await attestationUtils.getIntegrityHardwareKeyTag();
      await attestationUtils.registerWalletInstance(hardwareKeyTag);
      return Promise.resolve(hardwareKeyTag);
    } catch (e) {
      return Promise.reject(e);
    }
  });

  const getWalletAttestation = fromPromise<
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
  });

  const activateWalletAttestation = fromPromise<string>(async () => "");

  const requestEid = fromPromise<StoredCredential, string | undefined>(
    async () => ({} as StoredCredential)
  );

  const requestCredential = fromPromise<StoredCredential>(
    async () => ({} as StoredCredential)
  );

  return {
    checkUserOptIn,
    registerWalletInstance,
    getWalletAttestation,
    activateWalletAttestation,
    requestEid,
    requestCredential
  };
};
