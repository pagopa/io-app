import { type ActionArgs, assign, type DoneActorEvent } from "xstate";

import type { WalletInstanceAttestations } from "../../../common/utils/itwTypesUtils.ts";

import { useIONavigation } from "../../../../../navigation/params/AppParamsList.ts";
import ROUTES from "../../../../../navigation/routes.ts";
import { useIOStore } from "../../../../../store/hooks.ts";
import { checkCurrentSession } from "../../../../authentication/common/store/actions/index.ts";
import { BATCH_ISSUANCE_CREDENTIALS } from "../../../common/utils/itwCredentialIssuanceUtils.ts";
import {
  getCredentialKeyTags,
  isBatchCredential
} from "../../../common/utils/itwCredentialUtils.ts";
import { itwCredentialsConsumeInstance } from "../../../credentials/store/actions/index.ts";
import {
  itwAllStoredCredentialsSelector,
  itwCredentialsAllSelector
} from "../../../credentials/store/selectors/index.ts";
import { ITW_ROUTES } from "../../../navigation/routes.ts";
import { itwWalletInstanceAttestationStore } from "../../../walletInstance/store/actions/index.ts";
import { itwWalletInstanceAttestationSelector } from "../../../walletInstance/store/selectors/index.ts";
import { trackItwRemoteDataShare } from "../analytics";
import { ITW_REMOTE_ROUTES } from "../navigation/routes.ts";
import {
  getRemoteCredentialCombination,
  groupCredentialsByPurpose
} from "../utils/itwRemotePresentationUtils";
import { Context } from "./context.ts";
import { RemoteEvents } from "./events.ts";

export const createRemoteActionsImplementation = (
  navigation: ReturnType<typeof useIONavigation>,
  store: ReturnType<typeof useIOStore>
) => ({
  onInit: assign<Context, RemoteEvents, unknown, RemoteEvents, any>(() => {
    const state = store.getState();

    return {
      walletInstanceAttestation: itwWalletInstanceAttestationSelector(state),
      credentials: itwCredentialsAllSelector(state)
    };
  }),

  navigateToFailureScreen: () => {
    navigation.navigate(ITW_REMOTE_ROUTES.MAIN, {
      screen: ITW_REMOTE_ROUTES.FAILURE
    });
  },

  navigateToDiscoveryScreen: () => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.DISCOVERY.INFO,
      params: { level: "l3" } // To continue with the presentation, IT-Wallet must be activated
    });
  },

  navigateToClaimsDisclosureScreen: () => {
    navigation.navigate(ITW_REMOTE_ROUTES.MAIN, {
      screen: ITW_REMOTE_ROUTES.CLAIMS_DISCLOSURE
    });
  },

  navigateToBarcodeScanScreen: () => {
    navigation.navigate(ROUTES.BARCODE_SCAN, undefined);
  },

  navigateToAuthResponseScreen: () => {
    navigation.navigate(ITW_REMOTE_ROUTES.MAIN, {
      screen: ITW_REMOTE_ROUTES.AUTH_RESPONSE
    });
  },

  closePresentation: () => {
    navigation.popToTop();
  },

  trackRemoteDataShare: ({
    context
  }: ActionArgs<Context, RemoteEvents, RemoteEvents>) => {
    if (context.presentationDetails) {
      const { required, optional } = groupCredentialsByPurpose(
        context.presentationDetails
      );
      const credential_type = getRemoteCredentialCombination(
        context.presentationDetails
      );
      const requestedCredentials = [...required, ...optional];

      const data_type = optional.length > 0 ? "optional" : "required";

      /**
       * Returns the request type based on the "purpose" fields in the credentials:
       * - "no_purpose" if none are defined
       * - "unique_purpose" if there's only one purpose, or all share the same purpose
       * - "multiple_purpose" if there are multiple distinct valid purposes
       * A purpose is considered valid only if it's a non-empty, non-whitespace string.
       */
      const purposes = [
        ...new Set(
          requestedCredentials
            .map(item => item.purpose)
            .filter((purpose): purpose is string => !!purpose?.trim())
        )
      ];

      const request_type =
        purposes.length === 0
          ? "no_purpose"
          : purposes.length === 1
            ? "unique_purpose"
            : "multiple_purpose";

      trackItwRemoteDataShare({
        data_type,
        request_type,
        credential_type
      });
    }
  },

  storeWalletInstanceAttestation: ({
    event
  }: ActionArgs<Context, RemoteEvents, RemoteEvents>) => {
    store.dispatch(
      itwWalletInstanceAttestationStore(
        (event as DoneActorEvent<WalletInstanceAttestations>).output
      )
    );
  },

  consumePresentedBatchCredentials: ({
    context
  }: ActionArgs<Context, RemoteEvents, RemoteEvents>) => {
    const credentials = itwAllStoredCredentialsSelector(store.getState());

    // Restrict consumption to credential types explicitly opted in via
    // `consumeOnPresentation` in BATCH_ISSUANCE_CREDENTIALS (currently only Proof of Age):
    // presenting any other credential, batch or not, has no effect here.
    const consumedInstances = context.presentedKeyTags
      .map(keyTag => {
        const credential = credentials.find(
          c =>
            BATCH_ISSUANCE_CREDENTIALS[c.credentialType]
              ?.consumeOnPresentation === true &&
            isBatchCredential(c) &&
            getCredentialKeyTags(c).includes(keyTag)
        );
        return credential
          ? { credentialId: credential.credentialId, keyTag }
          : undefined;
      })
      .filter(
        (instance): instance is { credentialId: string; keyTag: string } =>
          instance !== undefined
      );

    if (consumedInstances.length > 0) {
      store.dispatch(itwCredentialsConsumeInstance(consumedInstances));
    }
  },

  handleSessionExpired: () =>
    store.dispatch(checkCurrentSession.success({ isSessionValid: false }))
});
