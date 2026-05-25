import { CieUtils } from "@pagopa/io-react-native-cie";
import { ItwVersion } from "@pagopa/io-react-native-wallet";
import * as O from "fp-ts/lib/Option";
import { fromPromise } from "xstate";
import { useIOStore } from "../../../../store/hooks";
import { assert } from "../../../../utils/assert";
import { sessionTokenSelector } from "../../../authentication/common/store/selectors";
import * as cieUtils from "../../../authentication/login/cie/utils/cie";
import { trackItwRequest } from "../../analytics";
import { Env } from "../../common/utils/environment";
import {
  getWalletInstanceAttestation,
  getIntegrityHardwareKeyTag,
  registerWalletInstance
} from "../../common/utils/itwAttestationUtils";
import { isAssertionGenerationError } from "../../common/utils/itwFailureUtils";
import { getIoWallet } from "../../common/utils/itwIoWallet";
import * as issuanceUtils from "../../common/utils/itwIssuanceUtils";
import { revokeCurrentWalletInstance } from "../../common/utils/itwRevocationUtils";
import {
  CredentialAccessToken,
  CredentialBundle,
  WalletInstanceAttestations
} from "../../common/utils/itwTypesUtils";
import * as mrtdUtils from "../../common/utils/mrtd";
import { itwCredentialsReplaceByType } from "../../credentials/store/actions";
import { CredentialsVault } from "../../credentials/utils/vault";
import {
  trackWalletInstanceRenewalFailure,
  trackWalletInstanceRenewalSuccess
} from "../../issuance/analytics";
import { itwStoreIntegrityKeyTag } from "../../issuance/store/actions";
import { itwIntegrityKeyTagSelector } from "../../issuance/store/selectors";
import { itwLifecycleStoresReset } from "../../lifecycle/store/actions";
import {
  itwSetWalletInstanceRenewalError,
  itwWalletUnitAttestationsStore
} from "../../walletInstance/store/actions";
import { itwWalletInstanceRenewalErrorSelector } from "../../walletInstance/store/selectors";
import { createCredentialUpgradeActionsImplementation } from "../upgrade/actions";
import { createCredentialUpgradeActorsImplementation } from "../upgrade/actors";
import { itwCredentialUpgradeMachine } from "../upgrade/machine";
import { createCommonActorsImplementation } from "../utils/actors";
import { ensureIntegrityServiceIsStoreReadyOrThrow } from "../../common/utils/itwStoreUtils";
import { generateKeysWithWalletUnitAttestation } from "../../common/utils/itwCredentialIssuanceUtils";
import type {
  AuthenticationContext,
  CieContext,
  EidIssuanceLevel,
  IdentificationContext,
  MrtdPoPContext
} from "./context";

export type CreateWalletInstanceActorParams = { isRenewal: boolean };

export type RequestAccessTokenActorParams = {
  walletInstanceAttestation: string | undefined;
  authenticationContext: AuthenticationContext | undefined;
};

export type RequestEidActorParams = {
  identification: IdentificationContext | undefined;
  authenticationContext: AuthenticationContext | undefined;
  level: EidIssuanceLevel | undefined;
  integrityKeyTag: string | undefined;
  accessToken: CredentialAccessToken | undefined;
};

export type RequestEidActorOutput = {
  credential: CredentialBundle;
  walletUnitAttestations: Record<string, string>;
};

export type StartAuthFlowActorParams = {
  walletInstanceAttestation: string | undefined;
  identification: IdentificationContext | undefined;
  withMRTDPoP: boolean;
};

export type InitMrtdPoPChallengeActorParams = {
  authenticationContext: AuthenticationContext | undefined;
  walletInstanceAttestation: string | undefined;
};

export type ValidateMrtdPoPChallengeActorParams = {
  authenticationContext: AuthenticationContext | undefined;
  walletInstanceAttestation: string | undefined;
  mrtdContext: MrtdPoPContext | undefined;
};

export type GetWalletAttestationActorParams = {
  integrityKeyTag: string | undefined;
};

export type StoreEidCredentialActorParams = {
  eid: CredentialBundle | undefined;
  walletUnitAttestations?: Record<string, string>;
};

/**
 * Creates the actors for the eid issuance machine
 * @param env - The environment to use for the IT Wallet API calls
 * @param itwVersion - IT-Wallet technical specs version
 * @param store the IOStore
 * @returns the actors
 */
export const createEidIssuanceActorsImplementation = (
  env: Env,
  itwVersion: ItwVersion,
  store: ReturnType<typeof useIOStore>
) => ({
  getCieStatus: fromPromise<CieContext>(async () => {
    const [isNFCEnabled, isCIEAuthenticationSupported] = await Promise.all([
      cieUtils.isNfcEnabled(),
      CieUtils.isCieAuthenticationSupported()
    ]);
    return {
      isNFCEnabled,
      isCIEAuthenticationSupported
    };
  }),

  verifyTrustFederation: fromPromise(async () => {
    const ioWallet = getIoWallet(itwVersion);
    // Evaluate the issuer trust
    const trustAnchorEntityConfig =
      await ioWallet.Trust.getTrustAnchorEntityConfiguration(
        env.WALLET_TA_BASE_URL
      );

    // Create the trust chain for the PID provider
    const builtChainJwts = await ioWallet.Trust.buildTrustChain(
      env.WALLET_PID_PROVIDER_BASE_URL.value(itwVersion),
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
  }),

  createWalletInstance: fromPromise<string, CreateWalletInstanceActorParams>(
    async ({ input }) => {
      const sessionToken = sessionTokenSelector(store.getState());
      assert(sessionToken, "sessionToken is undefined");

      // Reset the wallet store to prevent having dirty state before registering a new wallet instance.
      // This is skipped for renewal otherwise the entire wallet is lost if the user abandons the flow.
      if (!input.isRenewal) {
        store.dispatch(itwLifecycleStoresReset());
      }

      // Await the integrity preparation before requesting the integrity key tag
      await ensureIntegrityServiceIsStoreReadyOrThrow(store);

      const hardwareKeyTag = await getIntegrityHardwareKeyTag();
      await registerWalletInstance(
        env,
        itwVersion,
        hardwareKeyTag,
        sessionToken,
        { isRenewal: input.isRenewal }
      );

      return hardwareKeyTag;
    }
  ),

  getWalletAttestation: fromPromise<
    WalletInstanceAttestations,
    GetWalletAttestationActorParams
  >(async ({ input }) => {
    const sessionToken = sessionTokenSelector(store.getState());
    assert(sessionToken, "sessionToken is undefined");
    assert(input.integrityKeyTag, "integrityKeyTag is undefined");

    try {
      return await getWalletInstanceAttestation(
        env,
        itwVersion,
        input.integrityKeyTag,
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
      const newHardwareKeyTag = await getIntegrityHardwareKeyTag();
      store.dispatch(itwStoreIntegrityKeyTag(newHardwareKeyTag));
      await registerWalletInstance(
        env,
        itwVersion,
        newHardwareKeyTag,
        sessionToken,
        { isRenewal: true }
      );

      return await getWalletInstanceAttestation(
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
  }),

  revokeWalletInstance: fromPromise(async () => {
    const state = store.getState();
    const sessionToken = sessionTokenSelector(state);
    const integrityKeyTag = itwIntegrityKeyTagSelector(state);

    if (O.isNone(integrityKeyTag)) {
      return;
    }
    assert(sessionToken, "sessionToken is undefined");

    await revokeCurrentWalletInstance(
      env,
      itwVersion,
      sessionToken,
      integrityKeyTag.value
    );

    // Removes all credentials stored in the secure storage, as they are all linked
    // to the revoked wallet instance
    await CredentialsVault.clear();
  }),

  startAuthFlow: fromPromise<AuthenticationContext, StartAuthFlowActorParams>(
    async ({ input }) => {
      assert(
        input.walletInstanceAttestation,
        "walletInstanceAttestation is undefined"
      );
      assert(input.identification, "identification is undefined");

      const authenticationContext = await issuanceUtils.startAuthFlow({
        env,
        itwVersion,
        walletAttestation: input.walletInstanceAttestation,
        identification: input.identification,
        withMRTDPoP: input.withMRTDPoP
      });

      return {
        ...authenticationContext,
        callbackUrl: "" // This is not important in this phase, it will be set after completing the auth flow
      };
    }
  ),

  initMrtdPoPChallenge: fromPromise<
    MrtdPoPContext,
    InitMrtdPoPChallengeActorParams
  >(async ({ input }) => {
    assert(input.authenticationContext, "authenticationContext is undefined");
    assert(
      input.walletInstanceAttestation,
      "walletInstanceAttestation is undefined"
    );

    return mrtdUtils.initMrtdPoPChallenge({
      itwVersion,
      issuerConf: input.authenticationContext.issuerConf,
      walletInstanceAttestation: input.walletInstanceAttestation,
      authRedirectUrl: input.authenticationContext.callbackUrl
    });
  }),

  validateMrtdPoPChallenge: fromPromise<
    string,
    ValidateMrtdPoPChallengeActorParams
  >(async ({ input }) => {
    assert(input.authenticationContext, "authenticationContext is undefined");
    assert(
      input.walletInstanceAttestation,
      "walletInstanceAttestation is undefined"
    );
    assert(input.mrtdContext, "mrtdContext is undefined");
    assert(input.mrtdContext.ias, "IAS is undefined");
    assert(input.mrtdContext.mrtd, "MRTD is undefined");

    const { callbackUrl } = await mrtdUtils.validateMrtdPoPChallenge({
      itwVersion,
      issuerConf: input.authenticationContext.issuerConf,
      walletInstanceAttestation: input.walletInstanceAttestation,
      mrtd_auth_session: input.mrtdContext.mrtd_auth_session,
      mrtd_pop_nonce: input.mrtdContext.mrtd_pop_nonce,
      validationUrl: input.mrtdContext.validationUrl,
      ias: input.mrtdContext.ias,
      mrtd: input.mrtdContext.mrtd
    });

    return callbackUrl;
  }),

  requestAccessToken: fromPromise<
    CredentialAccessToken,
    RequestAccessTokenActorParams
  >(async ({ input }) => {
    assert(
      input.walletInstanceAttestation,
      "walletInstanceAttestation is undefined"
    );
    assert(
      input.authenticationContext,
      "authenticationContext must exist when the identification mode is ciePin"
    );

    const { accessToken } = await issuanceUtils.completeAuthFlow({
      ...input.authenticationContext,
      itwVersion,
      walletAttestation: input.walletInstanceAttestation
    });
    return accessToken;
  }),

  // To ensure a smooth experience when the session token expires, it is important to keep this actor
  // retriable: it must fail as early as possible when `generateKeysWithWalletUnitAttestation` is
  // rejected for session expired, so it can be reentered and retried from where it failed.
  requestEid: fromPromise<RequestEidActorOutput, RequestEidActorParams>(
    async ({ input }) => {
      assert(input.identification, "identification is undefined");
      assert(input.integrityKeyTag, "integrityKeyTag is undefined");
      assert(input.accessToken, "accessToken is undefined");
      assert(input.authenticationContext, "authenticationContext is undefined");

      const sessionToken = sessionTokenSelector(store.getState());
      assert(sessionToken, "sessionToken is undefined");

      // The Wallet Unit Attestation makes use of the integrity service
      if (getIoWallet(itwVersion).WalletUnitAttestation.isSupported) {
        await ensureIntegrityServiceIsStoreReadyOrThrow(store);
      }

      // Take the first element as only one credential is authorized during PID issuance
      const [authorizedCredential] =
        await generateKeysWithWalletUnitAttestation(input.accessToken, {
          env,
          itwVersion,
          hardwareKeyTag: input.integrityKeyTag,
          sessionToken
        });

      trackItwRequest(
        input.identification.mode,
        input.level === "l3" ? "L3" : "L2"
      );

      const credential = await issuanceUtils.getPid({
        authorizedCredential,
        itwVersion,
        accessToken: input.accessToken,
        ...input.authenticationContext
      });

      const { walletUnitAttestationId, walletUnitAttestation } =
        authorizedCredential;
      return {
        credential,
        walletUnitAttestations:
          walletUnitAttestationId && walletUnitAttestation
            ? { [walletUnitAttestationId]: walletUnitAttestation }
            : {}
      };
    }
  ),

  storeEidCredential: fromPromise<void, StoreEidCredentialActorParams>(
    async ({ input }) => {
      const { eid, walletUnitAttestations } = input;
      assert(eid, "eID credential is undefined");

      // Waits for the credential store/replace to complete before proceeding
      await new Promise<void>((resolve, reject) => {
        store.dispatch(
          itwCredentialsReplaceByType([eid], {
            onComplete: resolve,
            onError: reject
          })
        );
      });

      if (walletUnitAttestations) {
        store.dispatch(itwWalletUnitAttestationsStore(walletUnitAttestations));
      }
    }
  ),

  credentialUpgradeMachine: itwCredentialUpgradeMachine.provide({
    actions: createCredentialUpgradeActionsImplementation(store),
    actors: createCredentialUpgradeActorsImplementation(env, itwVersion, store)
  }),

  ...createCommonActorsImplementation(store)
});
