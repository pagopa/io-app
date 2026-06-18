import * as O from "fp-ts/lib/Option";
import { fromPromise } from "xstate";
import type {
  CredentialOffer,
  ItwVersion
} from "@pagopa/io-react-native-wallet";
import { useIOStore } from "../../../../store/hooks";
import { assert } from "../../../../utils/assert";
import { sessionTokenSelector } from "../../../authentication/common/store/selectors";
import { Env } from "../../common/utils/environment";
import * as itwAttestationUtils from "../../common/utils/itwAttestationUtils";
import * as credentialIssuanceUtils from "../../common/utils/itwCredentialIssuanceUtils";
import { getCredentialStatusAssertion } from "../../common/utils/itwCredentialStatusAssertionUtils";
import {
  enrichErrorWithMetadata,
  isAssertionGenerationError
} from "../../common/utils/itwFailureUtils";
import { getIoWallet } from "../../common/utils/itwIoWallet";
import {
  CredentialAccessToken,
  CredentialBundle,
  CredentialFormat
} from "../../common/utils/itwTypesUtils";
import { itwCredentialsEidSelector } from "../../credentials/store/selectors";
import { CredentialsVault } from "../../credentials/utils/vault";
import {
  trackWalletInstanceRenewalFailure,
  trackWalletInstanceRenewalSuccess
} from "../../issuance/analytics";
import { itwStoreIntegrityKeyTag } from "../../issuance/store/actions";
import { itwIntegrityKeyTagSelector } from "../../issuance/store/selectors";
import { itwSetWalletInstanceRenewalError } from "../../walletInstance/store/actions";
import { itwWalletInstanceRenewalErrorSelector } from "../../walletInstance/store/selectors";
import { ensureIntegrityServiceIsStoreReadyOrThrow } from "../../common/utils/itwStoreUtils";
import { createCommonActorsImplementation } from "../utils/actors";
import { Context } from "./context";

export type GetWalletAttestationActorOutput = Awaited<
  ReturnType<typeof itwAttestationUtils.getWalletInstanceAttestation>
>;

export type ObtainAccessTokenActorInput = Partial<
  Omit<
    Parameters<credentialIssuanceUtils.CompleteAuthFlow>[0],
    "env" | "itwVersion" | "pid"
  >
>;

export type RequestCredentialActorInput = Partial<
  Parameters<credentialIssuanceUtils.RequestCredential>[0]
>;

export type RequestCredentialActorOutput = Awaited<
  ReturnType<typeof credentialIssuanceUtils.requestCredential>
>;

export type ObtainCredentialActorInput = Partial<
  Parameters<credentialIssuanceUtils.ObtainCredential>[0]
>;

export type ObtainCredentialActorOutput = {
  credentials: ReadonlyArray<CredentialBundle>;
  walletUnitAttestations: Record<string, string>;
};

export type ObtainStatusAssertionActorInput = Pick<Context, "credentials">;

export type VerifyTrustFederationActorInput = Pick<
  Context,
  "resolvedCredentialOffer"
>;

export type ProcessCredentialOfferActorInput = {
  credentialOfferUri: string;
};

export type ProcessCredentialOfferActorOutput = {
  offer: CredentialOffer.CredentialOffer;
  grantDetails: CredentialOffer.ExtractGrantDetailsResult;
};

/**
 * Creates the actors for the eid issuance machine
 * @param env - The environment to use for the IT Wallet API calls
 * @param itwVersion - IT-Wallet technical specs version
 * @param store the IOStore
 * @returns the actors
 */
export const createCredentialIssuanceActorsImplementation = (
  env: Env,
  itwVersion: ItwVersion,
  store: ReturnType<typeof useIOStore>
) => {
  const verifyTrustFederation = fromPromise<
    void,
    VerifyTrustFederationActorInput
  >(async ({ input }) => {
    const ioWallet = getIoWallet(itwVersion);
    const credentialIssuer =
      input.resolvedCredentialOffer?.offer.credential_issuer ??
      env.WALLET_EAA_PROVIDER_BASE_URL.value(itwVersion);
    // Evaluate the issuer trust
    const trustAnchorEntityConfig =
      await ioWallet.Trust.getTrustAnchorEntityConfiguration(
        env.WALLET_TA_BASE_URL
      );

    // Create the trust chain for the PID provider
    const builtChainJwts = await ioWallet.Trust.buildTrustChain(
      credentialIssuer,
      trustAnchorEntityConfig
    );

    // Perform full validation on the built chain
    await ioWallet.Trust.verifyTrustChain(
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
        return await itwAttestationUtils.getWalletInstanceAttestation(
          env,
          itwVersion,
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
          itwVersion,
          newHardwareKeyTag,
          sessionToken,
          { isRenewal: true }
        );

        return await itwAttestationUtils
          .getWalletInstanceAttestation(
            env,
            itwVersion,
            newHardwareKeyTag,
            sessionToken
          )
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
    const {
      credentialType,
      walletInstanceAttestation,
      skipMdocIssuance = true,
      resolvedCredentialOffer
    } = input;

    assert(credentialType, "credentialType is undefined");
    assert(walletInstanceAttestation, "walletInstanceAttestation is undefined");

    return await credentialIssuanceUtils.requestCredential({
      env,
      itwVersion,
      credentialType,
      walletInstanceAttestation,
      skipMdocIssuance,
      resolvedCredentialOffer
    });
  });

  const obtainAccessToken = fromPromise<
    CredentialAccessToken,
    ObtainAccessTokenActorInput
  >(async ({ input }) => {
    const {
      codeVerifier,
      issuerConf,
      walletInstanceAttestation,
      requestedCredential,
      responseMode
    } = input;
    const eid = itwCredentialsEidSelector(store.getState());

    assert(codeVerifier, "codeVerifier is undefined");
    assert(issuerConf, "issuerConf is undefined");
    assert(walletInstanceAttestation, "walletInstanceAttestation is undefined");
    assert(requestedCredential, "requestedCredential is undefined");
    assert(O.isSome(eid), "eID is undefined");

    // Retrieve the PID credential from the vault
    const pidCredential = await CredentialsVault.get(eid.value.credentialId);
    assert(pidCredential, "PID credential not found in secure storage");

    const pid: CredentialBundle = {
      metadata: eid.value,
      credential: pidCredential
    };

    const { accessToken } = await credentialIssuanceUtils.completeAuthFlow({
      env,
      itwVersion,
      codeVerifier,
      issuerConf,
      walletInstanceAttestation,
      requestedCredential,
      responseMode,
      pid
    });
    return accessToken;
  });

  // To ensure a smooth experience when the session token expires, it is important to keep this actor
  // retriable: it must fail as early as possible when `generateKeysWithWalletUnitAttestation` is
  // rejected for session expired, so it can be reentered and retried from where it failed.
  const obtainCredential = fromPromise<
    ObtainCredentialActorOutput,
    ObtainCredentialActorInput
  >(async ({ input }) => {
    const { credentialType, accessToken, issuerConf, clientId } = input;
    const state = store.getState();
    const sessionToken = sessionTokenSelector(state);
    const integrityKeyTag = itwIntegrityKeyTagSelector(state);

    assert(credentialType, "credentialType is undefined");
    assert(issuerConf, "issuerConf is undefined");
    assert(clientId, "clientId is undefined");
    assert(sessionToken, "sessionToken is undefined");
    assert(accessToken, "accessToken is undefined");
    assert(O.isSome(integrityKeyTag), "integriyKeyTag is undefined");

    // The Wallet Unit Attestation makes use of the integrity service
    if (getIoWallet(itwVersion).WalletUnitAttestation.isSupported) {
      await ensureIntegrityServiceIsStoreReadyOrThrow(store);
    }

    const authorizedCredentials =
      await credentialIssuanceUtils.generateKeysWithWalletUnitAttestation(
        accessToken,
        {
          env,
          itwVersion,
          hardwareKeyTag: integrityKeyTag.value,
          sessionToken
        }
      );

    const credentials = await credentialIssuanceUtils.obtainCredential({
      authorizedCredentials,
      env,
      itwVersion,
      accessToken,
      credentialType,
      issuerConf,
      clientId
    });

    return {
      credentials,
      walletUnitAttestations: authorizedCredentials.reduce(
        (acc, c) =>
          c.walletUnitAttestationId && c.walletUnitAttestation
            ? { ...acc, [c.walletUnitAttestationId]: c.walletUnitAttestation }
            : acc,
        {} as Record<string, string>
      )
    };
  });

  const obtainStatusAssertion = fromPromise<
    ReadonlyArray<CredentialBundle>,
    ObtainStatusAssertionActorInput
  >(async ({ input }) => {
    assert(input.credentials, "credentials are undefined");

    const requestStatusAssertionOrSkip = async (
      credential: CredentialBundle
    ): Promise<CredentialBundle> => {
      // Status assertions for mDoc or v1.3+ credentials are not supported
      // TODO: [SIW-3963] Handle status list integration
      if (
        credential.metadata.format === CredentialFormat.MDOC ||
        !getIoWallet(itwVersion).CredentialStatus.statusAssertion.isSupported
      ) {
        return credential;
      }

      const { statusAssertion, parsedStatusAssertion } =
        await getCredentialStatusAssertion(credential, env, itwVersion).catch(
          enrichErrorWithMetadata({
            credentialId: credential.metadata.credentialId
          })
        );

      return {
        ...credential,
        metadata: {
          ...credential.metadata,
          storedStatusAssertion: {
            credentialStatus: "valid",
            statusAssertion,
            parsedStatusAssertion
          }
        }
      };
    };

    return await Promise.all(
      input.credentials.map(requestStatusAssertionOrSkip)
    );
  });

  const processCredentialOffer = fromPromise<
    ProcessCredentialOfferActorOutput,
    ProcessCredentialOfferActorInput
  >(async ({ input }) => {
    assert(input.credentialOfferUri, "credentialOfferUri is undefined");

    const wallet = getIoWallet(itwVersion);

    const offer = await wallet.CredentialsOffer.resolveCredentialOffer(
      input.credentialOfferUri
    );

    const grantDetails = wallet.CredentialsOffer.extractGrantDetails(offer);

    return { offer, grantDetails };
  });

  return {
    verifyTrustFederation,
    getWalletAttestation,
    obtainAccessToken,
    requestCredential,
    obtainCredential,
    obtainStatusAssertion,
    processCredentialOffer,
    ...createCommonActorsImplementation(store)
  };
};
