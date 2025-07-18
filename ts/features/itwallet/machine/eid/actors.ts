import cieManager from "@pagopa/react-native-cie";
import * as O from "fp-ts/lib/Option";
import { fromPromise } from "xstate";
import { useIOStore } from "../../../../store/hooks";
import { sessionTokenSelector } from "../../../authentication/common/store/selectors";
import { assert } from "../../../../utils/assert";
import * as cieUtils from "../../../authentication/login/cie/utils/cie";
import { trackItwRequest } from "../../analytics";
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
import {
  itwIntegrityKeyTagSelector,
  itwIntegrityServiceStatusSelector
} from "../../issuance/store/selectors";
import { itwLifecycleStoresReset } from "../../lifecycle/store/actions";
import { Env } from "../../common/utils/environment";
import type {
  AuthenticationContext,
  CieContext,
  IdentificationContext
} from "./context";

export type RequestEidActorParams = {
  identification: IdentificationContext | undefined;
  walletInstanceAttestation: string | undefined;
  authenticationContext: AuthenticationContext | undefined;
  isL3IssuanceEnabled?: boolean;
};

export type StartAuthFlowActorParams = {
  walletInstanceAttestation: string | undefined;
  identification: IdentificationContext | undefined;
  isL3IssuanceEnabled?: boolean;
};

export type GetWalletAttestationActorParams = {
  integrityKeyTag: string | undefined;
  isL3IssuanceEnabled?: boolean;
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

    return getAttestation(
      env,
      input.integrityKeyTag,
      sessionToken,
      input.isL3IssuanceEnabled
    );
  }),

  getCieStatus: fromPromise<CieContext>(async () => {
    const [isNFCEnabled, isCIEAuthenticationSupported] = await Promise.all([
      cieUtils.isNfcEnabled(),
      cieManager.isCIEAuthenticationSupported()
    ]);
    return {
      isNFCEnabled,
      isCIEAuthenticationSupported
    };
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
        isL3IssuanceEnabled: !!input.isL3IssuanceEnabled
      });

      return {
        ...authenticationContext,
        callbackUrl: "" // This is not important in this phase, it will be set after completing the auth flow
      };
    }
  ),

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
        walletAttestation: input.walletInstanceAttestation,
        isL3IssuanceEnabled: !!input.isL3IssuanceEnabled
      });

      trackItwRequest(input.identification.mode, input.identification.level);

      return issuanceUtils.getPid({
        ...authParams,
        ...input.authenticationContext,
        isL3IssuanceEnabled: !!input.isL3IssuanceEnabled
      });
    }
  ),

  revokeWalletInstance: fromPromise(async () => {
    const state = store.getState();
    const sessionToken = sessionTokenSelector(state);
    const integrityKeyTag = itwIntegrityKeyTagSelector(state);

    if (O.isNone(integrityKeyTag)) {
      return;
    }
    assert(sessionToken, "sessionToken is undefined");

    await revokeCurrentWalletInstance(env, sessionToken, integrityKeyTag.value);
  })
});
