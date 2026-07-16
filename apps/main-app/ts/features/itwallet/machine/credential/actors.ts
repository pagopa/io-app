import type {
  CredentialOffer,
  ItwVersion
} from "@pagopa/io-react-native-wallet";

import * as O from "fp-ts/lib/Option";
import { fromPromise } from "xstate";

import { useIOStore } from "../../../../store/hooks";
import { assert } from "../../../../utils/assert";
import { sessionTokenSelector } from "../../../authentication/common/store/selectors";
import { Env } from "../../common/utils/environment";
import * as itwAttestationUtils from "../../common/utils/itwAttestationUtils";
import * as credentialIssuanceUtils from "../../common/utils/itwCredentialIssuanceUtils";
import { getCredentialStatusAssertion } from "../../common/utils/itwCredentialStatusAssertionUtils";
import { getCredentialStatusFromStatusList } from "../../common/utils/itwCredentialStatusListUtils";
import {
  enrichErrorWithMetadata,
  isAssertionGenerationError
} from "../../common/utils/itwFailureUtils";
import { getIoWallet } from "../../common/utils/itwIoWallet";
import { ensureIntegrityServiceIsStoreReadyOrThrow } from "../../common/utils/itwStoreUtils";
import {
  CredentialAccessToken,
  CredentialBundle,
  CredentialFormat,
  IssuerConfiguration
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

export type ObtainCredentialActorInput = Partial<
  Parameters<credentialIssuanceUtils.ObtainCredential>[0]
>;

export type ObtainCredentialActorOutput = {
  credentials: ReadonlyArray<CredentialBundle>;
  walletUnitAttestations: Record<string, string>;
};

export type ObtainCredentialStatusActorInput = Pick<
  Context,
  "credentials" | "issuerConf"
>;

export type ProcessCredentialOfferActorInput = {
  credentialOfferUri: Context["credentialOfferUri"];
};

export type ProcessCredentialOfferActorOutput = {
  grantDetails: CredentialOffer.ExtractGrantDetailsResult;
  offer: CredentialOffer.CredentialOffer;
};

export type RequestCredentialActorInput = Partial<
  Parameters<credentialIssuanceUtils.RequestCredential>[0]
>;

export type RequestCredentialActorOutput = Awaited<
  ReturnType<typeof credentialIssuanceUtils.requestCredential>
>;

export type VerifyTrustFederationActorInput = Pick<
  Context,
  "resolvedCredentialOffer"
>;

/**
 * Builds the dictionary of Wallet Unit Attestations generated during issuance, keyed by their
 * `walletUnitAttestationId`. Works for both single and batch issuance, where a batch shares a
 * single WUA across all its keys.
 */
const extractWalletUnitAttestations = (
  authorizedCredentials: ReadonlyArray<{
    walletUnitAttestation?: string;
    walletUnitAttestationId?: string;
  }>
): Record<string, string> =>
  authorizedCredentials.reduce(
    (acc, c) =>
      c.walletUnitAttestationId && c.walletUnitAttestation
        ? { ...acc, [c.walletUnitAttestationId]: c.walletUnitAttestation }
        : acc,
    {} as Record<string, string>
  );

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

    const eidOption = itwCredentialsEidSelector(store.getState());
    assert("value" in eidOption, "eID is undefined");
    const eid = eidOption.value;

    // Retrieve the PID credential before showing the trust issuer screen so the
    // requested DCQL claims can be evaluated and displayed to the user.
    const pidCredential = await CredentialsVault.get(eid.credentialId);
    assert(pidCredential, "PID credential not found in secure storage");

    const pid: CredentialBundle = {
      metadata: eid,
      credential: pidCredential
    };

    const result = await credentialIssuanceUtils.requestCredential({
      env,
      itwVersion,
      credentialType,
      walletInstanceAttestation,
      skipMdocIssuance,
      resolvedCredentialOffer,
      pid
    });
    return result;
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
      evaluatedDcqlQuery,
      responseMode
    } = input;

    assert(codeVerifier, "codeVerifier is undefined");
    assert(issuerConf, "issuerConf is undefined");
    assert(walletInstanceAttestation, "walletInstanceAttestation is undefined");
    assert(requestedCredential, "requestedCredential is undefined");
    assert(evaluatedDcqlQuery, "evaluatedDcqlQuery is undefined");

    const { accessToken } = await credentialIssuanceUtils.completeAuthFlow({
      env,
      itwVersion,
      codeVerifier,
      issuerConf,
      walletInstanceAttestation,
      requestedCredential,
      responseMode,
      evaluatedDcqlQuery
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

    // Decide whether to obtain the credential in batch (multiple copies) based on the app-side
    // configuration and the issuer's advertised batch size. One-time-use credentials are obtained
    // in batch so the wallet holds several copies, each consumed on a single presentation.
    const batchSize = credentialIssuanceUtils.getEffectiveBatchSize(
      credentialType,
      issuerConf.credential_issuance_batch_size
    );

    const keyGenParams = {
      env,
      itwVersion,
      hardwareKeyTag: integrityKeyTag.value,
      sessionToken
    };

    if (batchSize > 1) {
      const authorizedCredentials =
        await credentialIssuanceUtils.generateBatchKeysWithWalletUnitAttestation(
          accessToken,
          batchSize,
          keyGenParams
        );

      const credentials = await credentialIssuanceUtils.obtainCredentialsBatch({
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
        walletUnitAttestations: extractWalletUnitAttestations(
          authorizedCredentials
        )
      };
    }

    const authorizedCredentials =
      await credentialIssuanceUtils.generateKeysWithWalletUnitAttestation(
        accessToken,
        keyGenParams
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
      walletUnitAttestations: extractWalletUnitAttestations(
        authorizedCredentials
      )
    };
  });

  const obtainCredentialStatus = fromPromise<
    ReadonlyArray<CredentialBundle>,
    ObtainCredentialStatusActorInput
  >(async ({ input }) => {
    assert(input.credentials, "credentials are undefined");

    const ioWallet = getIoWallet(itwVersion);

    return await Promise.all(
      input.credentials.map(async credential => {
        if (ioWallet.CredentialStatus.statusAssertion.isSupported) {
          return getStatusWithStatusAssertion(credential);
        }
        if (ioWallet.CredentialStatus.statusList.isSupported) {
          assert(input.issuerConf, "issuerConf is undefined");
          return getStatusWithStatusList(credential, input.issuerConf);
        }
        return credential;
      })
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

  const getStatusWithStatusList = async (
    bundle: CredentialBundle,
    issuerConf: IssuerConfiguration
  ): Promise<CredentialBundle> => {
    if (bundle.metadata.format === CredentialFormat.MDOC) {
      return bundle;
    }

    const { status, rawStatus, uri, idx, parsedStatusList } =
      await getCredentialStatusFromStatusList(
        bundle,
        itwVersion,
        issuerConf.keys
      );

    return {
      credential: bundle.credential,
      metadata: {
        ...bundle.metadata,
        validity: {
          type: "status_list",
          status,
          rawStatus,
          statusList: { uri, idx }
        }
      },
      statusList: { uri, payload: parsedStatusList }
    };
  };

  const getStatusWithStatusAssertion = async (
    bundle: CredentialBundle
  ): Promise<CredentialBundle> => {
    if (bundle.metadata.format === CredentialFormat.MDOC) {
      return bundle;
    }
    const { parsedStatusAssertion } = await getCredentialStatusAssertion(
      bundle,
      env,
      itwVersion
    ).catch(
      enrichErrorWithMetadata({
        credentialId: bundle.metadata.credentialId
      })
    );

    return {
      credential: bundle.credential,
      metadata: {
        ...bundle.metadata,
        validity: {
          type: "status_assertion",
          status: "valid",
          statusAssertion: parsedStatusAssertion
        }
      }
    };
  };

  return {
    verifyTrustFederation,
    getWalletAttestation,
    obtainAccessToken,
    requestCredential,
    obtainCredential,
    obtainCredentialStatus,
    processCredentialOffer,
    ...createCommonActorsImplementation(store)
  };
};
