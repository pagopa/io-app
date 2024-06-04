/* eslint-disable @typescript-eslint/no-empty-function */
import { fromPromise } from "xstate5";
import { StoredCredential } from "../../common/utils/itwTypesUtils";

export const createIssuanceActorsImplementation = () => {
  const checkUserOptIn = fromPromise<undefined>(async () => undefined);
  const issueWalletAttestation = fromPromise<string>(async () => "");
  const activateWalletAttestation = fromPromise<string>(async () => "");
  const requestEid = fromPromise<StoredCredential, string | undefined>(
    async () => ({} as StoredCredential)
  );
  const requestCredential = fromPromise<StoredCredential>(
    async () => ({} as StoredCredential)
  );

  return {
    checkUserOptIn,
    issueWalletAttestation,
    activateWalletAttestation,
    requestEid,
    requestCredential
  };
};
