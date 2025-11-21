import { CieUtils } from "@pagopa/io-react-native-cie";
import { Trust } from "@pagopa/io-react-native-wallet";
import * as O from "fp-ts/lib/Option";
import { fromPromise } from "xstate";
import { useIOStore } from "../../../../store/hooks";
import { assert } from "../../../../utils/assert";
import { sessionTokenSelector } from "../../../authentication/common/store/selectors";
import * as cieUtils from "../../../authentication/login/cie/utils/cie";
import { trackItwRequest } from "../../analytics";
import { Env } from "../../common/utils/environment";
import {
  getAttestation,
  getIntegrityHardwareKeyTag,
  registerWalletInstance
} from "../../common/utils/itwAttestationUtils";
import * as issuanceUtils from "../../common/utils/itwIssuanceUtils";
import { revokeCurrentWalletInstance } from "../../common/utils/itwRevocationUtils";
import { pollForStoreValue } from "../../common/utils/itwStoreUtils";
import {
  StoredCredential,
  WalletInstanceAttestations
} from "../../common/utils/itwTypesUtils";
import * as mrtdUtils from "../../common/utils/mrtd";
import {
  itwIntegrityKeyTagSelector,
  itwIntegrityServiceStatusSelector
} from "../../issuance/store/selectors";
import { itwLifecycleStoresReset } from "../../lifecycle/store/actions";
import { createCredentialUpgradeActionsImplementation } from "../upgrade/actions";
import { createCredentialUpgradeActorsImplementation } from "../upgrade/actors";
import { itwCredentialUpgradeMachine } from "../upgrade/machine";
import type {
  AuthenticationContext,
  CieContext,
  EidIssuanceLevel,
  IdentificationContext,
  MrtdPoPContext
} from "./context";

export type RequestEidActorParams = {
  identification: IdentificationContext | undefined;
  walletInstanceAttestation: string | undefined;
  authenticationContext: AuthenticationContext | undefined;
  level: EidIssuanceLevel | undefined;
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

export type GetWalletAttestationActorParams = {
  integrityKeyTag: string | undefined;
};

/**
 * Creates the actors for the eid issuance machine
 * @param env - The environment to use for the IT Wallet API calls
 * @param store the IOStore
 * @returns the actors
 */
export const createEidIssuanceActorsImplementation = (
  env: Env,
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
    // Evaluate the issuer trust
    const trustAnchorEntityConfig =
      await Trust.Build.getTrustAnchorEntityConfiguration(
        env.WALLET_TA_BASE_URL
      );

    // Create the trust chain for the PID provider
    const builtChainJwts = await Trust.Build.buildTrustChain(
      env.WALLET_PID_PROVIDER_BASE_URL,
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
  }),

  createWalletInstance: fromPromise<string>(async () => {
    const sessionToken = sessionTokenSelector(store.getState());
    assert(sessionToken, "sessionToken is undefined");

    // Reset the wallet store to prevent having dirty state before registering a new wallet instance
    store.dispatch(itwLifecycleStoresReset());

    // Await the integrity preparation before requesting the integrity key tag
    const integrityServiceStatus = await pollForStoreValue({
      getState: store.getState,
      selector: itwIntegrityServiceStatusSelector,
      condition: value => value !== undefined
    }).catch(() => {
      throw new Error("Integrity service status check timed out");
    });

    // If the integrity service preparation is not ready (still undefined) or in an error state after 10 seconds the user will be prompted with an error,
    // he will need to retry.
    assert(
      integrityServiceStatus === "ready",
      `Integrity service status is ${integrityServiceStatus}`
    );

    const hardwareKeyTag = await getIntegrityHardwareKeyTag();
    await registerWalletInstance(env, hardwareKeyTag, sessionToken);

    return hardwareKeyTag;
  }),

  getWalletAttestation: fromPromise<
    WalletInstanceAttestations,
    GetWalletAttestationActorParams
  >(({ input }) => {
    const sessionToken = sessionTokenSelector(store.getState());
    assert(sessionToken, "sessionToken is undefined");
    assert(input.integrityKeyTag, "integrityKeyTag is undefined");

    return getAttestation(env, input.integrityKeyTag, sessionToken);
  }),

  revokeWalletInstance: fromPromise(async () => {
    const state = store.getState();
    const sessionToken = sessionTokenSelector(state);
    const integrityKeyTag = itwIntegrityKeyTagSelector(state);

    if (O.isNone(integrityKeyTag)) {
      return;
    }
    assert(sessionToken, "sessionToken is undefined");

    await revokeCurrentWalletInstance(env, sessionToken, integrityKeyTag.value);
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
      issuerConf: input.authenticationContext.issuerConf,
      walletInstanceAttestation: input.walletInstanceAttestation,
      authRedirectUrl: input.authenticationContext.callbackUrl
    });
  }),

  requestEid: fromPromise<StoredCredential, RequestEidActorParams>(
    async ({ input }) => {
      assert(input.identification, "identification is undefined");
      assert(
        input.walletInstanceAttestation,
        "walletInstanceAttestation is undefined"
      );

      // At this point, the authorization flow has already started and just needs to be completed
      assert(
        input.authenticationContext,
        "authenticationContext must exist when the identification mode is ciePin"
      );

      const authParams = await issuanceUtils.completeAuthFlow({
        ...input.authenticationContext,
        walletAttestation: input.walletInstanceAttestation
      });

      trackItwRequest(
        input.identification.mode,
        input.level === "l3" ? "L3" : "L2"
      );

      return issuanceUtils.getPid({
        ...authParams,
        ...input.authenticationContext
      });
    }
  ),

  credentialUpgradeMachine: itwCredentialUpgradeMachine.provide({
    actors: createCredentialUpgradeActorsImplementation(env),
    actions: createCredentialUpgradeActionsImplementation(store)
  })
});
