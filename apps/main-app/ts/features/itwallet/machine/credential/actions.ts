import { IOToast } from "@io-app/design-system";
import I18n from "i18next";
import { ActionArgs, assertEvent, assign } from "xstate";

import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import ROUTES from "../../../../navigation/routes";
import { useIOStore } from "../../../../store/hooks";
import { assert } from "../../../../utils/assert";
import { isRouteInNavigationState } from "../../../../utils/navigation";
import { checkCurrentSession } from "../../../authentication/common/store/actions";
import {
  trackSaveCredentialSuccess,
  trackStartAddNewCredential,
  trackStartCredentialUpgrade,
  trackWalletDataShare,
  trackWalletDataShareAccepted
} from "../../analytics";
import { itwMixPanelCredentialDetailsSelector } from "../../analytics/store/selectors";
import { getMixPanelCredential } from "../../analytics/utils";
import { itwClearCredentialUpgradeFailed } from "../../common/store/actions/preferences";
import { itwSetCredentialExitSurvey } from "../../common/store/actions/ui";
import { CredentialMetadata } from "../../common/utils/itwTypesUtils";
import { itwCredentialsReplaceByType } from "../../credentials/store/actions";
import { itwCredentialsCatalogueByTypesSelector } from "../../credentialsCatalogue/store/selectors";
import {
  itwLifecycleIsITWalletValidSelector,
  itwLifecycleIsValidSelector
} from "../../lifecycle/store/selectors";
import { ITW_ROUTES } from "../../navigation/routes";
import {
  itwWalletInstanceAttestationStore,
  itwWalletUnitAttestationsStore
} from "../../walletInstance/store/actions";
import { itwWalletInstanceAttestationSelector } from "../../walletInstance/store/selectors";
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
      walletInstanceAttestation: itwWalletInstanceAttestationSelector(state),
      credentialsCatalogue: itwCredentialsCatalogueByTypesSelector(state),
      isWalletValid: itwLifecycleIsValidSelector(state)
    };
  }),

  navigateToCredentialIntroductionScreen: () => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.ISSUANCE.CREDENTIAL_INTRODUCTION,
      pop: true
    });
  },

  navigateToTrustIssuerScreen: () => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.ISSUANCE.CREDENTIAL_TRUST_ISSUER,
      pop: true
    });
  },

  navigateToCredentialPreviewScreen: () => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.ISSUANCE.CREDENTIAL_PREVIEW,
      pop: true
    });
  },

  navigateToFailureScreen: () => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.ISSUANCE.CREDENTIAL_FAILURE,
      pop: true
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

  navigateToCardOnboardingScreen: ({
    context
  }: ActionArgs<
    Context,
    CredentialIssuanceEvents,
    CredentialIssuanceEvents
  >) => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: context.isItWalletValid
        ? ITW_ROUTES.L3_ONBOARDING
        : ITW_ROUTES.ONBOARDING,
      pop: true
    });
  },

  closeIssuance: ({
    event
  }: ActionArgs<
    Context,
    CredentialIssuanceEvents,
    CredentialIssuanceEvents
  >) => {
    const isWalletInNavigationState = isRouteInNavigationState(
      navigation.getState(),
      ROUTES.WALLET_HOME
    );

    if (!isWalletInNavigationState && navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    assertEvent(event, "close");
    const { surveyStep, surveyCredential } = event;

    if (surveyStep && surveyCredential) {
      store.dispatch(
        itwSetCredentialExitSurvey({
          step: surveyStep,
          credential: surveyCredential
        })
      );
    }

    navigation.navigate(ROUTES.MAIN, {
      screen: ROUTES.WALLET_HOME,
      params: {},
      pop: true
    });
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
    assert(context.credentials, "credentials is undefined");
    // A credential offer (deeplink/QR code) is the only alternative entry point to the
    // catalogue/list for issuing a credential, so its presence in the context is what
    // distinguishes the two flows for analytics purposes.
    const origin: CredentialMetadata["origin"] = context.resolvedCredentialOffer
      ? "credentialOffer"
      : "catalogue";
    const credentials = context.credentials.map(bundle => ({
      ...bundle,
      metadata: { ...bundle.metadata, origin }
    }));
    // Removes any credentials with the same type and stores the new ones atomically
    store.dispatch(itwCredentialsReplaceByType(credentials, {}));
    // Clear older upgrade-failed flag for this credential after a successful issuance/upgrade.
    store.dispatch(itwClearCredentialUpgradeFailed(context.credentialType));
    // Stores WUAs separately if present
    if (context.walletUnitAttestations) {
      store.dispatch(
        itwWalletUnitAttestationsStore(context.walletUnitAttestations)
      );
    }
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
      const state = store.getState();
      const isItwL3 = itwLifecycleIsITWalletValidSelector(state);
      const credential = getMixPanelCredential(context.credentialType, isItwL3);
      trackSaveCredentialSuccess({
        credential,
        credential_details: itwMixPanelCredentialDetailsSelector(state)
      });
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
      getMixPanelCredential(context.credentialType, context.isItWalletValid)
    );
  }
});

const trackDataShareEvent = (
  context: Context,
  store: ReturnType<typeof useIOStore>,
  isAccepted = false
) => {
  if (context.credentialType) {
    const { credentialType } = context;
    if (!credentialType) {
      return;
    }
    const isItwL3 = itwLifecycleIsITWalletValidSelector(store.getState());
    const credential = getMixPanelCredential(context.credentialType, isItwL3);

    const trackDataFn = isAccepted
      ? trackWalletDataShareAccepted
      : trackWalletDataShare;
    trackDataFn({ credential, phase: "initial_request" });
  }
};
