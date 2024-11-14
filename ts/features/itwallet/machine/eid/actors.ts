import * as O from "fp-ts/lib/Option";
import { fromPromise } from "xstate";
import { useIOStore } from "../../../../store/hooks";
import { sessionTokenSelector } from "../../../../store/reducers/authentication";
import { assert } from "../../../../utils/assert";
import { trackItwRequest } from "../../analytics";
import {
  getAttestation,
  getIntegrityHardwareKeyTag,
  registerWalletInstance
} from "../../common/utils/itwAttestationUtils";
import { revokeCurrentWalletInstance } from "../../common/utils/itwRevocationUtils";
import * as issuanceUtils from "../../common/utils/itwIssuanceUtils";
import { StoredCredential } from "../../common/utils/itwTypesUtils";
import { itwIntegrityKeyTagSelector } from "../../issuance/store/selectors";
import { itwLifecycleStoresReset } from "../../lifecycle/store/actions";
import { openUrlAndListenForAuthRedirect } from "../../common/utils/itwOpenUrlAndListenForRedirect";
import type { AuthenticationContext, IdentificationContext } from "./context";

export type RequestEidActorParams = {
  identification: IdentificationContext | undefined;
  walletInstanceAttestation: string | undefined;
  authenticationContext: AuthenticationContext | undefined;
};

export type StartAuthFlowActorParams = {
  walletInstanceAttestation: string | undefined;
  identification: IdentificationContext | undefined;
};

export type CompleteAuthFlowActorParams = {
  authenticationContext: AuthenticationContext | undefined;
  walletInstanceAttestation: string | undefined;
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

  getAuthRedirectUrl: fromPromise<string, GetAuthRedirectUrlActorParam>(
    async ({ input }) => {
      assert(
        input.redirectUri,
        "redirectUri must be defined to get authRedirectUrl"
      );
      assert(input.authUrl, "authUrl must be defined to get authRedirectUrl");
      assert(input.identification, "identification is undefined");

      const { authRedirectUrl } = await openUrlAndListenForAuthRedirect(
        input.redirectUri,
        input.authUrl,
        input.identification.abortController?.signal
      );

      return authRedirectUrl;
    }
  ),

  revokeWalletInstance: fromPromise(async () => {
    const sessionToken = sessionTokenSelector(store.getState());
    assert(sessionToken, "sessionToken is undefined");

    await revokeCurrentWalletInstance(sessionToken);
  })
});
