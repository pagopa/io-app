import cieManager from "@pagopa/react-native-cie";
import * as O from "fp-ts/lib/Option";
import { fromPromise } from "xstate";
import { useIOStore } from "../../../../store/hooks";
import { sessionTokenSelector } from "../../../../store/reducers/authentication";
import { assert } from "../../../../utils/assert";
import * as cieUtils from "../../../../utils/cie";
import { trackItwRequest } from "../../analytics";
import {
  getAttestation,
  getIntegrityHardwareKeyTag,
  registerWalletInstance
} from "../../common/utils/itwAttestationUtils";
import * as issuanceUtils from "../../common/utils/itwIssuanceUtils";
import { revokeCurrentWalletInstance } from "../../common/utils/itwRevocationUtils";
import { pollForStoreValue } from "../../common/utils/itwStoreUtils";
import { StoredCredential } from "../../common/utils/itwTypesUtils";
import {
  itwIntegrityKeyTagSelector,
  itwIntegrityServiceReadySelector
} from "../../issuance/store/selectors";
import { itwLifecycleStoresReset } from "../../lifecycle/store/actions";
import type {
  AuthenticationContext,
  CieContext,
  IdentificationContext
} from "./context";

export type RequestEidActorParams = {
  identification: IdentificationContext | undefined;
  walletInstanceAttestation: string | undefined;
  authenticationContext: AuthenticationContext | undefined;
};

export type StartAuthFlowActorParams = {
  walletInstanceAttestation: string | undefined;
  identification: IdentificationContext | undefined;
};

export type GetWalletAttestationActorParams = {
  integrityKeyTag: string | undefined;
};

export type GetAuthRedirectUrlActorParam = {
  redirectUri: string | undefined;
  authUrl: string | undefined;
  identification: IdentificationContext | undefined;
};

export const createEidIssuanceActorsImplementation = (
  store: ReturnType<typeof useIOStore>
) => ({
  createWalletInstance: fromPromise<string>(async () => {
    const sessionToken = sessionTokenSelector(store.getState());
    assert(sessionToken, "sessionToken is undefined");
    const storedIntegrityKeyTag = itwIntegrityKeyTagSelector(store.getState());

    // If there is a stored key tag we assume the wallet instance was already created
    // so we just need to prepare the integrity service and return the existing key tag.
    if (O.isSome(storedIntegrityKeyTag)) {
      return storedIntegrityKeyTag.value;
    }

    // Reset the wallet store to prevent having dirty state before registering a new wallet instance
    store.dispatch(itwLifecycleStoresReset());
    // Await the integrity preparation before requesting the integrity key tag
    const isIntegrityServiceReady = await pollForStoreValue({
      getState: store.getState,
      selector: itwIntegrityServiceReadySelector,
      condition: value => value !== undefined
    });
    // If the integrity service preparation is not ready (still undefined) after 10 seconds the user will be prompted with an error,
    // he will need to retry.
    // TODO: Create a personalized error message for this case informing the user that the integrity service is not ready yet.
    assert(
      isIntegrityServiceReady !== undefined,
      "Integrity service not ready after 10 seconds"
    );
    // If the integrity service preparation is ready, but it is failed, the user will be prompted with an error
    // and the wallet instance creation will be aborted.
    // TODO: Create a personalized error message for this case informing the user that the integrity service is not available on his device.
    assert(isIntegrityServiceReady, "Integrity service not available");
    const hardwareKeyTag = await getIntegrityHardwareKeyTag();
    await registerWalletInstance(hardwareKeyTag, sessionToken);

    return hardwareKeyTag;
  }),

  getWalletAttestation: fromPromise<string, GetWalletAttestationActorParams>(
    ({ input }) => {
      const sessionToken = sessionTokenSelector(store.getState());
      assert(sessionToken, "sessionToken is undefined");
      assert(input.integrityKeyTag, "integrityKeyTag is undefined");

      return getAttestation(input.integrityKeyTag, sessionToken);
    }
  ),

  getCieStatus: fromPromise<CieContext>(async () => {
    const [isNFCEnabled, isCIEAuthenticationSupported] = await Promise.all([
      cieUtils.isNfcEnabled(),
      cieManager.isCIEAuthenticationSupported()
    ]);
    return { isNFCEnabled, isCIEAuthenticationSupported };
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

      trackItwRequest(input.identification.mode);

      return issuanceUtils.getPid({
        ...authParams,
        ...input.authenticationContext
      });
    }
  ),

  startAuthFlow: fromPromise<AuthenticationContext, StartAuthFlowActorParams>(
    async ({ input }) => {
      assert(
        input.walletInstanceAttestation,
        "walletInstanceAttestation is undefined"
      );
      assert(input.identification, "identification is undefined");

      const authenticationContext = await issuanceUtils.startAuthFlow({
        walletAttestation: input.walletInstanceAttestation,
        identification: input.identification
      });

      return {
        ...authenticationContext,
        callbackUrl: "" // This is not important in this phase, it will be set after completing the auth flow
      };
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

    await revokeCurrentWalletInstance(sessionToken, integrityKeyTag.value);
  })
});
