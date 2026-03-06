import * as O from "fp-ts/lib/Option";
import { fromPromise } from "xstate";
import { Trust } from "@pagopa/io-react-native-wallet";
import { useIOStore } from "../../../../store/hooks";
import { sessionTokenSelector } from "../../../authentication/common/store/selectors";
import { assert } from "../../../../utils/assert";
import * as itwAttestationUtils from "../../common/utils/itwAttestationUtils";
import * as credentialIssuanceUtils from "../../common/utils/itwCredentialIssuanceUtils";
import { getCredentialStatusAssertion } from "../../common/utils/itwCredentialStatusAssertionUtils";
import {
  CredentialFormat,
  StoredCredential
} from "../../common/utils/itwTypesUtils";
import { itwCredentialsEidSelector } from "../../credentials/store/selectors";
import {
  itwIntegrityKeyTagSelector,
  itwWalletInstanceRenewalErrorSelector
} from "../../issuance/store/selectors";
import {
  itwSetWalletInstanceRenewalError,
  itwStoreIntegrityKeyTag
} from "../../issuance/store/actions";
import { Env } from "../../common/utils/environment";
import {
  enrichErrorWithMetadata,
  isAssertionGenerationError
} from "../../common/utils/itwFailureUtils";
import {
  trackWalletInstanceRenewalFailure,
  trackWalletInstanceRenewalSuccess
} from "../../issuance/analytics";
import { type Context } from "./context";

export type GetWalletAttestationActorOutput = Awaited<
  ReturnType<typeof itwAttestationUtils.getAttestation>
>;

export type RequestCredentialActorInput =
  Partial<credentialIssuanceUtils.RequestCredentialParams> & {
    skipMdocIssuance: boolean;
  };

export type RequestCredentialActorOutput = Awaited<
  ReturnType<typeof credentialIssuanceUtils.requestCredential>
>;

export type ObtainCredentialActorInput =
  Partial<credentialIssuanceUtils.ObtainCredentialParams>;

export type ObtainCredentialActorOutput = Awaited<
  ReturnType<typeof credentialIssuanceUtils.obtainCredential>
>;

export type ObtainStatusAssertionActorInput = Pick<Context, "credentials">;

/**
 * Creates the actors for the eid issuance machine
 * @param env - The environment to use for the IT Wallet API calls
 * @param store the IOStore
 * @returns the actors
 */
export const createCredentialIssuanceActorsImplementation = (
  env: Env,
  store: ReturnType<typeof useIOStore>
) => {
  const verifyTrustFederation = fromPromise<void>(async () => {
    // Evaluate the issuer trust
    const trustAnchorEntityConfig =
      await Trust.Build.getTrustAnchorEntityConfiguration(
        env.WALLET_TA_BASE_URL
      );

    // Create the trust chain for the PID provider
    const builtChainJwts = await Trust.Build.buildTrustChain(
      env.WALLET_EAA_PROVIDER_BASE_URL,
      trustAnchorEntityConfig
    );

    // Perform full validation on the built chain
    await Trust.Verify.verifyTrustChain(
      trustAnchorEntityConfig,
      builtChainJwts,
      {
        connectTimeout: 10000,
        readTimeout: 10000,
        requireCrl: true
      }
    );
  });

  const getWalletAttestation = fromPromise<GetWalletAttestationActorOutput>(
    async () => {
      const sessionToken = sessionTokenSelector(store.getState());
      const integrityKeyTag = itwIntegrityKeyTagSelector(store.getState());

      assert(sessionToken, "sessionToken is undefined");
      assert(O.isSome(integrityKeyTag), "integriyKeyTag is not present");

      try {
        return await itwAttestationUtils.getAttestation(
          env,
          integrityKeyTag.value,
          sessionToken
        );
      } catch (firstError) {
        // On iOS, the stored DCAppAttest key can become invalid (DCErrorInvalidKey,
        // com.apple.devicecheck.error 3), causing GENERATION_ASSERTION_FAILED during
        // assertion generation. We recover by creating a new wallet instance with a
        // fresh key and retrying the attestation once.
        const isRenewalError = itwWalletInstanceRenewalErrorSelector(
          store.getState()
        );

        // If the error is not related to assertion generation or if we've already attempted a renewal, we throw the error and prompt the user to retry.
        if (!isAssertionGenerationError(firstError) || isRenewalError) {
          throw firstError;
        }

        // Otherwise, we attempt to recover by creating a new wallet instance,
        // which will generate a new hardware key tag,
        // and retrying the attestation with the new key tag.
        const newHardwareKeyTag =
          await itwAttestationUtils.getIntegrityHardwareKeyTag();
        store.dispatch(itwStoreIntegrityKeyTag(newHardwareKeyTag));
        await itwAttestationUtils.registerWalletInstance(
          env,
          newHardwareKeyTag,
          sessionToken,
          { isRenewal: true }
        );

        return await itwAttestationUtils
          .getAttestation(env, newHardwareKeyTag, sessionToken)
          .then(attestation => {
            // Track the successful renewal in Mixpanel
            trackWalletInstanceRenewalSuccess();
            return attestation;
          })
          .catch(error => {
            // If the attestation retrieval fails again after renewing the wallet instance,
            // we set a flag in the store to prevent further renewal attempts and prompt the user with an error.
            store.dispatch(itwSetWalletInstanceRenewalError(true));
            // Track the renewal failure in Mixpanel
            trackWalletInstanceRenewalFailure(error);
            throw error;
          });
      }
    }
  );

  const requestCredential = fromPromise<
    RequestCredentialActorOutput,
    RequestCredentialActorInput
  >(async ({ input }) => {
    const { credentialType, walletInstanceAttestation, skipMdocIssuance } =
      input;

    assert(credentialType, "credentialType is undefined");
    assert(walletInstanceAttestation, "walletInstanceAttestation is undefined");

    return await credentialIssuanceUtils.requestCredential({
      env,
      credentialType,
      walletInstanceAttestation,
      skipMdocIssuance
    });
  });

  const obtainCredential = fromPromise<
    ObtainCredentialActorOutput,
    ObtainCredentialActorInput
  >(async ({ input }) => {
    const {
      credentialType,
      requestedCredential,
      issuerConf,
      walletInstanceAttestation,
      clientId,
      codeVerifier
    } = input;

    const eid = itwCredentialsEidSelector(store.getState());

    assert(credentialType, "credentialType is undefined");
    assert(walletInstanceAttestation, "walletInstanceAttestation is undefined");
    assert(requestedCredential, "requestedCredential is undefined");
    assert(issuerConf, "issuerConf is undefined");
    assert(clientId, "clientId is undefined");
    assert(codeVerifier, "codeVerifier is undefined");
    assert(O.isSome(eid), "eID is undefined");

    return await credentialIssuanceUtils.obtainCredential({
      env,
      credentialType,
      walletInstanceAttestation,
      requestedCredential,
      issuerConf,
      clientId,
      codeVerifier,
      pid: eid.value
    });
  });

  const obtainStatusAssertion = fromPromise<
    Array<StoredCredential>,
    ObtainStatusAssertionActorInput
  >(async ({ input }) => {
    assert(input.credentials, "credentials are undefined");

    const requestStatusAssertionOrSkip = async (
      credential: StoredCredential
    ): Promise<StoredCredential> => {
      // Status assertions for mDoc credentials are not supported yet
      if (credential.format === CredentialFormat.MDOC) {
        return credential;
      }

      const { statusAssertion, parsedStatusAssertion } =
        await getCredentialStatusAssertion(credential, env).catch(
          enrichErrorWithMetadata({ credentialId: credential.credentialId })
        );

      return {
        ...credential,
        storedStatusAssertion: {
          credentialStatus: "valid",
          statusAssertion,
          parsedStatusAssertion: parsedStatusAssertion.payload
        }
      };
    };

    return await Promise.all(
      input.credentials.map(requestStatusAssertionOrSkip)
    );
  });

  return {
    verifyTrustFederation,
    getWalletAttestation,
    requestCredential,
    obtainCredential,
    obtainStatusAssertion
  };
};
