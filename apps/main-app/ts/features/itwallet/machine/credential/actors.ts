import type { CredentialOffer } from "@pagopa/io-react-native-wallet";

import * as O from "fp-ts/lib/Option";
import { fromPromise } from "xstate";

import { assert } from "../../../../utils/assert";
import { sessionTokenSelector } from "../../../authentication/common/store/selectors";
import * as itwAttestationUtils from "../../common/utils/itwAttestationUtils";
import * as credentialIssuanceUtils from "../../common/utils/itwCredentialIssuanceUtils";
import { isAssertionGenerationError } from "../../common/utils/itwFailureUtils";
import { getIoWallet } from "../../common/utils/itwIoWallet";
import { ensureIntegrityServiceIsStoreReadyOrThrow } from "../../common/utils/itwStoreUtils";
import {
  CredentialAccessToken,
  CredentialBundle
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
import { Context } from "./context";
import { CredentialIssuanceMachineDeps } from "./input";

export type GetWalletAttestationActorInput = {
  deps: CredentialIssuanceMachineDeps;
};

export type GetWalletAttestationActorOutput = Awaited<
  ReturnType<typeof itwAttestationUtils.getWalletInstanceAttestation>
>;

export type ObtainAccessTokenActorInput = Partial<
  Omit<
    Parameters<credentialIssuanceUtils.CompleteAuthFlow>[0],
    "env" | "itwVersion" | "pid"
  >
> & {
  deps: CredentialIssuanceMachineDeps;
};

export type ObtainCredentialActorInput = Partial<
  Parameters<credentialIssuanceUtils.ObtainCredential>[0]
> & {
  deps: CredentialIssuanceMachineDeps;
};

export type ObtainCredentialActorOutput = {
  credentials: ReadonlyArray<CredentialBundle>;
  walletUnitAttestations: Record<string, string>;
};

export type ObtainCredentialStatusActorInput = Pick<
  Context,
  "credentials" | "issuerConf"
> & {
  deps: CredentialIssuanceMachineDeps;
};

export type ProcessCredentialOfferActorInput = {
  credentialOfferUri: Context["credentialOfferUri"];
  deps: CredentialIssuanceMachineDeps;
};

export type ProcessCredentialOfferActorOutput = {
  grantDetails: CredentialOffer.ExtractGrantDetailsResult;
  offer: CredentialOffer.CredentialOffer;
};

export type RequestCredentialActorInput = Partial<
  Parameters<credentialIssuanceUtils.RequestCredential>[0]
> & {
  deps: CredentialIssuanceMachineDeps;
};

export type RequestCredentialActorOutput = Awaited<
  ReturnType<typeof credentialIssuanceUtils.requestCredential>
>;

export type VerifyTrustFederationActorInput = Pick<
  Context,
  "resolvedCredentialOffer"
> & {
  deps: CredentialIssuanceMachineDeps;
};

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

export const verifyTrustFederationActor = fromPromise<
  void,
  VerifyTrustFederationActorInput
>(async ({ input }) => {
  const { env, itwVersion } = input.deps;
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

export const getWalletAttestationActor = fromPromise<
  GetWalletAttestationActorOutput,
  GetWalletAttestationActorInput
>(async ({ input }) => {
  const { env, itwVersion, store } = input.deps;
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
});

export const requestCredentialActor = fromPromise<
  RequestCredentialActorOutput,
  RequestCredentialActorInput
>(async ({ input }) => {
  const {
    credentialType,
    walletInstanceAttestation,
    skipMdocIssuance = true,
    resolvedCredentialOffer,
    deps
  } = input;
  const { env, itwVersion, store } = deps;

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

export const obtainAccessTokenActor = fromPromise<
  CredentialAccessToken,
  ObtainAccessTokenActorInput
>(async ({ input }) => {
  const {
    codeVerifier,
    issuerConf,
    walletInstanceAttestation,
    requestedCredential,
    evaluatedDcqlQuery,
    responseMode,
    deps
  } = input;
  const { env, itwVersion } = deps;

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
export const obtainCredentialActor = fromPromise<
  ObtainCredentialActorOutput,
  ObtainCredentialActorInput
>(async ({ input }) => {
  const { credentialType, accessToken, issuerConf, clientId, deps } = input;
  const { env, itwVersion, store } = deps;
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
    walletUnitAttestations: extractWalletUnitAttestations(authorizedCredentials)
  };
});

export const obtainCredentialStatusActor = fromPromise<
  ReadonlyArray<CredentialBundle>,
  ObtainCredentialStatusActorInput
>(async ({ input }) => {
  assert(input.credentials, "credentials are undefined");
  const { env, itwVersion } = input.deps;

  return await credentialIssuanceUtils.attachCredentialsStatus({
    credentials: input.credentials,
    env,
    itwVersion,
    issuerConf: input.issuerConf
  });
});

export const processCredentialOfferActor = fromPromise<
  ProcessCredentialOfferActorOutput,
  ProcessCredentialOfferActorInput
>(async ({ input }) => {
  assert(input.credentialOfferUri, "credentialOfferUri is undefined");
  const { itwVersion } = input.deps;

  const wallet = getIoWallet(itwVersion);

  const offer = await wallet.CredentialsOffer.resolveCredentialOffer(
    input.credentialOfferUri
  );

  const grantDetails = wallet.CredentialsOffer.extractGrantDetails(offer);

  return { offer, grantDetails };
});
