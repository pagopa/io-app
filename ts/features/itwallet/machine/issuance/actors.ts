/* eslint-disable @typescript-eslint/no-empty-function */
import {
  WalletInstance,
  WalletInstanceAttestation,
  createCryptoContextFor
} from "@pagopa/io-react-native-wallet";
import { fromPromise } from "xstate5";
import { itwWalletProviderBaseUrl } from "../../../../config";
import {
  ensureIntegrityServiceIsReady,
  generateIntegrityHardwareKeyTag,
  getIntegrityContext
} from "../../common/utils/itwIntegrity";
import { getOrGenerateCyptoKey } from "../../common/utils/itwSecureStorageUtils";
import { StoredCredential } from "../../common/utils/itwTypesUtils";

const WALLET_ATTESTATION_KEY_TAG = "WALLET_ATTESTATION_KEY_TAG";

export const createIssuanceActorsImplementation = () => {
  const checkUserOptIn = fromPromise<undefined>(async () => undefined);

  const issueWalletAttestation = fromPromise<string>(async () => {
    try {
      await ensureIntegrityServiceIsReady();

      const hardwarekeyTag = await generateIntegrityHardwareKeyTag();
      const integrityContext = getIntegrityContext(hardwarekeyTag);

      await WalletInstance.createWalletInstance({
        integrityContext,
        walletProviderBaseUrl: itwWalletProviderBaseUrl
      });

      // generate Key for Wallet Instance Attestation
      // ensure the key esists befor starting the issuing process
      await getOrGenerateCyptoKey(WALLET_ATTESTATION_KEY_TAG);

      const wiaCryptoContext = createCryptoContextFor(
        WALLET_ATTESTATION_KEY_TAG
      );

      const issuingAttestation = await WalletInstanceAttestation.getAttestation(
        {
          wiaCryptoContext,
          integrityContext,
          walletProviderBaseUrl: itwWalletProviderBaseUrl
        }
      );

      return Promise.resolve(issuingAttestation);
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
    issueWalletAttestation,
    activateWalletAttestation,
    requestEid,
    requestCredential
  };
};
