import { IOToast } from "@pagopa/io-app-design-system";
import { ActionArgs, assign } from "xstate";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import I18n from "i18next";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import ROUTES from "../../../../navigation/routes";
import { checkCurrentSession } from "../../../authentication/common/store/actions";
import { useIOStore } from "../../../../store/hooks";
import { assert } from "../../../../utils/assert";
import {
  getMixPanelCredential,
  trackAddCredentialProfileAndSuperProperties,
  trackSaveCredentialSuccess,
  trackStartAddNewCredential,
  trackStartCredentialUpgrade,
  trackWalletDataShare,
  trackWalletDataShareAccepted
} from "../../analytics";
import {
  itwFlagCredentialAsRequested,
  itwUnflagCredentialAsRequested
} from "../../common/store/actions/preferences";
import {
  itwCredentialsRemoveByType,
  itwCredentialsStore
} from "../../credentials/store/actions";
import { ITW_ROUTES } from "../../navigation/routes";
import { itwWalletInstanceAttestationStore } from "../../walletInstance/store/actions";
import { itwWalletInstanceAttestationSelector } from "../../walletInstance/store/selectors";
import { itwLifecycleIsITWalletValidSelector } from "../../lifecycle/store/selectors";
import { itwRequestedCredentialsSelector } from "../../common/store/selectors/preferences";
import { CredentialType } from "../../common/utils/itwMocksUtils";
import { Context } from "./context";
import { CredentialIssuanceEvents } from "./events";

export const createCredentialIssuanceActionsImplementation = (
  navigation: ReturnType<typeof useIONavigation>,
  store: ReturnType<typeof useIOStore>,
  toast: IOToast
) => ({
  onInit: assign<
    Context,
    CredentialIssuanceEvents,
    unknown,
    CredentialIssuanceEvents,
    any
  >(() => {
    const state = store.getState();

    return {
      isItWalletValid: itwLifecycleIsITWalletValidSelector(state),
      walletInstanceAttestation: itwWalletInstanceAttestationSelector(state)
    };
  }),

  navigateToTrustIssuerScreen: () => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.ISSUANCE.CREDENTIAL_TRUST_ISSUER
    });
  },

  navigateToCredentialPreviewScreen: () => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.ISSUANCE.CREDENTIAL_PREVIEW
    });
  },

  navigateToFailureScreen: () => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.ISSUANCE.CREDENTIAL_FAILURE
    });
  },

  navigateToWallet: () => {
    toast.success(I18n.t("features.itWallet.issuance.credentialResult.toast"));
    navigation.reset({
      index: 1,
      routes: [
        {
          name: ROUTES.MAIN,
          params: {
            screen: ROUTES.WALLET_HOME
          }
        }
      ]
    });
  },

  navigateToEidVerificationExpiredScreen: () => {
    navigation.replace(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.PRESENTATION.EID_VERIFICATION_EXPIRED
    });
  },

  closeIssuance: () => {
    navigation.popToTop();
  },

  storeWalletInstanceAttestation: ({
    context
  }: ActionArgs<
    Context,
    CredentialIssuanceEvents,
    CredentialIssuanceEvents
  >) => {
    assert(
      context.walletInstanceAttestation,
      "walletInstanceAttestation is undefined"
    );
    store.dispatch(
      itwWalletInstanceAttestationStore(context.walletInstanceAttestation)
    );
  },

  storeCredential: ({
    context
  }: ActionArgs<
    Context,
    CredentialIssuanceEvents,
    CredentialIssuanceEvents
  >) => {
    assert(context.credentialType, "credentialType is undefined");
    assert(context.credentials, "credential is undefined");
    // Removes any credentials with thye same type stored in the wallet
    store.dispatch(itwCredentialsRemoveByType(context.credentialType));
    // Stores the new obtained credentials
    store.dispatch(itwCredentialsStore(context.credentials));
  },

  flagCredentialAsRequested: ({
    context
  }: ActionArgs<
    Context,
    CredentialIssuanceEvents,
    CredentialIssuanceEvents
  >) => {
    assert(context.credentialType, "credentialType is undefined");
    store.dispatch(itwFlagCredentialAsRequested(context.credentialType));
  },

  unflagCredentialAsRequested: ({
    context
  }: ActionArgs<
    Context,
    CredentialIssuanceEvents,
    CredentialIssuanceEvents
  >) => {
    assert(context.credentialType, "credentialType is undefined");
    store.dispatch(itwUnflagCredentialAsRequested(context.credentialType));
  },

  trackStartAddCredential: ({
    context
  }: ActionArgs<
    Context,
    CredentialIssuanceEvents,
    CredentialIssuanceEvents
  >) => {
    if (context.credentialType) {
      const isItwL3 = itwLifecycleIsITWalletValidSelector(store.getState());
      const credential = getMixPanelCredential(context.credentialType, isItwL3);
      trackStartAddNewCredential(credential);
    }
  },

  trackAddCredential: ({
    context
  }: ActionArgs<
    Context,
    CredentialIssuanceEvents,
    CredentialIssuanceEvents
  >) => {
    if (context.credentialType) {
      const isItwL3 = itwLifecycleIsITWalletValidSelector(store.getState());
      const credential = getMixPanelCredential(context.credentialType, isItwL3);
      trackSaveCredentialSuccess(credential);
      trackAddCredentialProfileAndSuperProperties(store.getState(), credential);
    }
  },

  handleSessionExpired: () =>
    store.dispatch(checkCurrentSession.success({ isSessionValid: false })),

  trackCredentialIssuingDataShare: ({
    context
  }: ActionArgs<Context, CredentialIssuanceEvents, CredentialIssuanceEvents>) =>
    trackDataShareEvent(context, store),

  trackCredentialIssuingDataShareAccepted: ({
    context
  }: ActionArgs<Context, CredentialIssuanceEvents, CredentialIssuanceEvents>) =>
    trackDataShareEvent(context, store, true),

  trackStartCredentialReissuing: ({
    context
  }: ActionArgs<
    Context,
    CredentialIssuanceEvents,
    CredentialIssuanceEvents
  >) => {
    assert(context.credentialType, "credentialType is undefined");
    trackStartCredentialUpgrade(
      getMixPanelCredential(context.credentialType, true)
    );
  }
});

const trackDataShareEvent = (
  context: Context,
  store: ReturnType<typeof useIOStore>,
  isAccepted = false
) => {
  if (context.credentialType) {
    const { credentialType, isAsyncContinuation } = context;
    const requestedCredentials = itwRequestedCredentialsSelector(
      store.getState()
    );
    const isItwL3 = itwLifecycleIsITWalletValidSelector(store.getState());
    const credential = getMixPanelCredential(context.credentialType, isItwL3);
    const isMdlRequested = requestedCredentials.includes(
      CredentialType.DRIVING_LICENSE
    );

    /** Determine the correct phase based on the following conditions:
     *
     * - `initial_request`: No active request, user clicks on the driving license from the credential selection screen.
     * - `request_in_progress`: An ongoing request is active, but the IPZS message has not yet been received, and the user clicks on the driving license from the credential selection screen again.
     * - `old_message_request`: No active request, but the user clicks on an old IPZS message.
     * - `async_continuation`: An ongoing request is active, and the user opens the IPZS message.
     *
     * This logic ensures that the phase is accurate regardless of whether
     * there is an active MDL request or if the credential is requested
     * from ItwCredentialOnboardingSection.
     */
    const trackingData = pipe(
      O.fromPredicate(() => credentialType === CredentialType.DRIVING_LICENSE)(
        credentialType
      ),
      O.map(() => {
        if (isAsyncContinuation) {
          // TODO to be removed in [SIW-2839]
          return isMdlRequested ? "async_continuation" : "old_message_request";
        }
        return isMdlRequested ? "request_in_progress" : "initial_request";
      }),
      O.fold(
        () => ({ credential }),
        phase => ({ credential, phase })
      )
    );

    (isAccepted ? trackWalletDataShareAccepted : trackWalletDataShare)(
      trackingData
    );
  }
};
