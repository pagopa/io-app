import * as O from "fp-ts/lib/Option";
import I18n from "i18next";
import { ActionArgs, assertEvent, assign } from "xstate";

import ROUTES from "../../../../navigation/routes";
import { assert } from "../../../../utils/assert";
import { isRouteInNavigationState } from "../../../../utils/navigation";
import { checkCurrentSession } from "../../../authentication/common/store/actions";
import {
  trackItWalletIDMethodSelected,
  trackItWalletIntroScreen,
  trackItwDeactivated,
  trackItwIdAuthenticationCompleted as trackItwIdAuthenticationCompletedEvent,
  trackItwIdVerifiedDocument as trackItwIdVerifiedDocumentEvent,
  trackSaveCredentialSuccess
} from "../../analytics";
import { itwMixPanelCredentialDetailsSelector } from "../../analytics/store/selectors";
import { toSurveyAuthMethod } from "../../analytics/utils";
import { toItwIdMethod } from "../../analytics/utils/types";
import { itwShowBanner } from "../../common/store/actions/banners";
import {
  itwSetAuthLevel,
  itwSetCredentialUpgradeFailed,
  itwSetIdentificationMode,
  itwSetWalletActivationFeedbackBannerData
} from "../../common/store/actions/preferences";
import {
  itwSetActivationExitSurvey,
  itwSetFeedbackBottomSheetVisible
} from "../../common/store/actions/ui";
import { selectItwSpecsVersion } from "../../common/store/selectors/environment";
import { itwIsPidReissuingSurveyHiddenSelector } from "../../common/store/selectors/preferences";
import { itwCredentialsSelector } from "../../credentials/store/selectors";
import { itwFetchCredentialsCatalogue } from "../../credentialsCatalogue/store/actions";
import {
  itwRemoveIntegrityKeyTag,
  itwStoreIntegrityKeyTag
} from "../../issuance/store/actions";
import { itwIntegrityKeyTagSelector } from "../../issuance/store/selectors";
import { itwLifecycleWalletReset } from "../../lifecycle/store/actions";
import { itwLifecycleIsITWalletValidSelector } from "../../lifecycle/store/selectors";
import { ITW_ROUTES } from "../../navigation/routes";
import { itwWalletInstanceAttestationStore } from "../../walletInstance/store/actions";
import { itwWalletInstanceAttestationSelector } from "../../walletInstance/store/selectors";
import { Context } from "./context";
import { EidIssuanceEvents } from "./events";

type EidActionArgs = ActionArgs<Context, EidIssuanceEvents, EidIssuanceEvents>;

export const onInitAction = assign<
  Context,
  EidIssuanceEvents,
  unknown,
  EidIssuanceEvents,
  any
>(({ context }) => {
  const state = context.deps.store.getState();
  const storedIntegrityKeyTag = itwIntegrityKeyTagSelector(state);
  const walletInstanceAttestation = itwWalletInstanceAttestationSelector(state);
  const credentials = itwCredentialsSelector(state);

  return {
    // Get the IT-Wallet version from the global store; this can be overriden during the issuance flow.
    itwVersion: selectItwSpecsVersion(state),
    integrityKeyTag: O.toUndefined(storedIntegrityKeyTag),
    walletInstanceAttestation,
    credentialsToUpgrade: Object.values(credentials)
  };
});

export const navigateToTosScreenAction = ({ context }: EidActionArgs) => {
  context.deps.navigation.navigate(ITW_ROUTES.MAIN, {
    screen: ITW_ROUTES.DISCOVERY.INFO,
    params: { level: context.level }
  });
};

export const navigateToIpzsPrivacyScreenAction = ({
  context
}: EidActionArgs) => {
  context.deps.navigation.navigate(ITW_ROUTES.MAIN, {
    screen: ITW_ROUTES.DISCOVERY.IPZS_PRIVACY
  });
};

export const navigateToIdentificationScreenAction = ({
  context
}: EidActionArgs) => {
  context.deps.navigation.navigate(ITW_ROUTES.MAIN, {
    screen: ITW_ROUTES.IDENTIFICATION.MODE_SELECTION,
    params: { eidReissuing: context.mode === "reissuance" }
  });
};

export const navigateToIdpSelectionScreenAction = ({
  context
}: EidActionArgs) => {
  context.deps.navigation.navigate(ITW_ROUTES.MAIN, {
    screen: ITW_ROUTES.IDENTIFICATION.IDP_SELECTION
  });
};

export const navigateToSpidLoginScreenAction = ({ context }: EidActionArgs) => {
  context.deps.navigation.navigate(ITW_ROUTES.MAIN, {
    screen: ITW_ROUTES.IDENTIFICATION.SPID.LOGIN
  });
};

export const navigateToCieIdLoginScreenAction = ({
  context
}: EidActionArgs) => {
  context.deps.navigation.navigate(ITW_ROUTES.MAIN, {
    screen: ITW_ROUTES.IDENTIFICATION.CIE_ID.LOGIN
  });
};

export const navigateToEidPreviewScreenAction = ({
  context
}: EidActionArgs) => {
  context.deps.navigation.navigate(ITW_ROUTES.MAIN, {
    screen: ITW_ROUTES.ISSUANCE.EID_PREVIEW
  });
};

export const navigateToSuccessScreenAction = ({ context }: EidActionArgs) => {
  context.deps.navigation.navigate(ITW_ROUTES.MAIN, {
    screen: ITW_ROUTES.ISSUANCE.EID_RESULT
  });
};

export const navigateToFailureScreenAction = ({ context }: EidActionArgs) => {
  context.deps.navigation.navigate(ITW_ROUTES.MAIN, {
    screen: ITW_ROUTES.ISSUANCE.EID_FAILURE
  });
};

export const navigateToNfcInstructionsScreenAction = ({
  context
}: EidActionArgs) => {
  context.deps.navigation.navigate(ITW_ROUTES.MAIN, {
    screen: ITW_ROUTES.IDENTIFICATION.CIE.ACTIVATE_NFC
  });
};

export const navigateToWalletAction = ({ context }: EidActionArgs) => {
  const { toast, navigation } = context.deps;
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
};

export const navigateToCredentialCatalogAction = ({
  context
}: EidActionArgs) => {
  context.deps.navigation.replace(ITW_ROUTES.MAIN, {
    screen:
      context.level === "l3"
        ? ITW_ROUTES.L3_ONBOARDING
        : context.level === "l2-fallback"
          ? ITW_ROUTES.L2_ONBOARDING
          : ITW_ROUTES.ONBOARDING
  });
};

export const navigateToCieNfcPreparationScreenAction = ({
  context
}: EidActionArgs) => {
  context.deps.navigation.navigate(ITW_ROUTES.MAIN, {
    screen: ITW_ROUTES.IDENTIFICATION.CIE.PREPARATION.NFC_SCREEN
  });
};

export const navigateToCiePinPreparationScreenAction = ({
  context
}: EidActionArgs) => {
  context.deps.navigation.navigate(ITW_ROUTES.MAIN, {
    screen: ITW_ROUTES.IDENTIFICATION.CIE.PREPARATION.PIN_SCREEN
  });
};

export const navigateToCiePinScreenAction = ({ context }: EidActionArgs) => {
  context.deps.navigation.navigate(ITW_ROUTES.MAIN, {
    screen: ITW_ROUTES.IDENTIFICATION.CIE.PIN_SCREEN
  });
};

export const navigateToCieCardPreparationScreenAction = ({
  context
}: EidActionArgs) => {
  context.deps.navigation.navigate(ITW_ROUTES.MAIN, {
    screen: ITW_ROUTES.IDENTIFICATION.CIE.PREPARATION.CARD_SCREEN
  });
};

export const navigateToCieCanPreparationScreenAction = ({
  context
}: EidActionArgs) => {
  context.deps.navigation.navigate(ITW_ROUTES.MAIN, {
    screen: ITW_ROUTES.IDENTIFICATION.CIE.PREPARATION.CAN_SCREEN
  });
};

export const navigateToCieCanScreenAction = ({ context }: EidActionArgs) => {
  context.deps.navigation.navigate(ITW_ROUTES.MAIN, {
    screen: ITW_ROUTES.IDENTIFICATION.CIE.CAN_SCREEN
  });
};

export const navigateToCieAuthenticationScreenAction = ({
  context
}: EidActionArgs) => {
  context.deps.navigation.navigate(ITW_ROUTES.MAIN, {
    screen: ITW_ROUTES.IDENTIFICATION.CIE.AUTH_SCREEN
  });
};

export const navigateToCieInternalAuthAndMrtdScreenAction = ({
  context
}: EidActionArgs) => {
  assert(context.mrtdContext, "mrtdContext is undefined");
  assert(context.mrtdContext.can, "CAN is undefined");

  context.deps.navigation.navigate(ITW_ROUTES.MAIN, {
    screen: ITW_ROUTES.IDENTIFICATION.CIE.INTERNAL_AUTH_MRTD_SCREEN,
    params: {
      can: context.mrtdContext.can,
      challenge: context.mrtdContext.challenge
    }
  });
};

export const navigateToWalletRevocationScreenAction = ({
  context
}: EidActionArgs) => {
  context.deps.navigation.navigate(ITW_ROUTES.MAIN, {
    screen: ITW_ROUTES.WALLET_REVOCATION_SCREEN
  });
};

export const navigateToCieWarningScreenAction = ({
  context,
  event
}: EidActionArgs) => {
  assertEvent(event, "go-to-cie-warning");

  context.deps.navigation.navigate(ITW_ROUTES.MAIN, {
    screen: ITW_ROUTES.IDENTIFICATION.CIE_WARNING,
    params: {
      type: event.warning,
      routeName: event.routeName
    }
  });
};

export const closeIssuanceAction = ({ context, event }: EidActionArgs) => {
  const { navigation, store } = context.deps;
  const isWalletInNavigationState = isRouteInNavigationState(
    navigation.getState(),
    ROUTES.WALLET_HOME
  );

  if (!isWalletInNavigationState && navigation.canGoBack()) {
    navigation.goBack();
    return;
  }

  const isSurveyHidden = itwIsPidReissuingSurveyHiddenSelector(
    store.getState()
  );
  const isReissuance = context.mode === "reissuance";

  const surveyStep = event.type === "close" ? event.surveyStep : undefined;

  if (isReissuance && !isSurveyHidden) {
    store.dispatch(itwSetFeedbackBottomSheetVisible(true));
  } else if (surveyStep) {
    store.dispatch(itwSetActivationExitSurvey({ step: surveyStep }));
  }

  navigation.navigate(ROUTES.MAIN, {
    screen: ROUTES.WALLET_HOME,
    params: {}
  });
};

export const storeIntegrityKeyTagAction = ({ context }: EidActionArgs) => {
  assert(context.integrityKeyTag, "integrityKeyTag is undefined");
  context.deps.store.dispatch(itwStoreIntegrityKeyTag(context.integrityKeyTag));
};

export const cleanupIntegrityKeyTagAction = ({ context }: EidActionArgs) => {
  // Remove the integrity key tag from the store
  context.deps.store.dispatch(itwRemoveIntegrityKeyTag());
};

export const storeWalletInstanceAttestationAction = ({
  context
}: EidActionArgs) => {
  assert(
    context.walletInstanceAttestation,
    "walletInstanceAttestation is undefined"
  );
  context.deps.store.dispatch(
    itwWalletInstanceAttestationStore(context.walletInstanceAttestation)
  );
};

export const handleSessionExpiredAction = ({ context }: EidActionArgs) =>
  context.deps.store.dispatch(
    checkCurrentSession.success({ isSessionValid: false })
  );

export const resetWalletInstanceAction = ({ context }: EidActionArgs) => {
  const { store, toast } = context.deps;
  store.dispatch(itwLifecycleWalletReset());
  store.dispatch(itwSetAuthLevel(undefined));
  store.dispatch(itwSetIdentificationMode(undefined));
  toast.success(I18n.t("features.itWallet.issuance.credentialResult.toast"));
};

export const storeAuthLevelAction = ({ context }: EidActionArgs) => {
  const { store } = context.deps;
  // Save the auth level in the preferences
  store.dispatch(itwSetAuthLevel(context.identification?.level));
  store.dispatch(itwSetIdentificationMode(context.identification?.mode));
};

export const storeWalletActivationFeedbackBannerDataAction = ({
  context
}: EidActionArgs) => {
  // Store banner data only for:
  // - credential-triggered activation (credentialType set): user skips success page
  // - upgrade flow (mode === "upgrade")
  // Regular issuance with "Add document" CTA keeps the banner on the success page directly.
  // This survey is reserved to IT-Wallet (L3): "Documenti su IO" (L2/l2-fallback) must never trigger it.
  if (
    context.level !== "l3" ||
    (!context.credentialType && context.mode !== "upgrade")
  ) {
    return;
  }
  const docStatus = context.mode === "upgrade" ? "active" : "not_active";
  const authMethod = toSurveyAuthMethod(context.identification);
  context.deps.store.dispatch(
    itwSetWalletActivationFeedbackBannerData({
      docStatus,
      authMethod
    })
  );
  context.deps.store.dispatch(itwShowBanner("activationSuccessFeedback"));
};

export const storeCredentialUpgradeFailuresAction = ({
  context,
  event
}: EidActionArgs) => {
  assertEvent(event, "xstate.done.actor.credentialUpgradeMachine");
  context.deps.store.dispatch(
    itwSetCredentialUpgradeFailed(
      event.output.failedCredentials.map(
        failedCredential => failedCredential.credentialType
      )
    )
  );
};

export const trackIntroScreenAction = ({ context }: EidActionArgs) => {
  trackItWalletIntroScreen(context.level === "l3" ? "L3" : "L2");
};

export const trackWalletInstanceCreationAction = ({
  context
}: EidActionArgs) => {
  trackSaveCredentialSuccess({
    credential: context.level === "l3" ? "ITW_PID" : "ITW_ID_V2",
    ITW_ID_method: context.identification
      ? toItwIdMethod(context.identification)
      : undefined,
    credential_details: itwMixPanelCredentialDetailsSelector(
      context.deps.store.getState()
    )
  });
};

export const trackWalletInstanceRevocationAction = ({
  context
}: EidActionArgs) => {
  const isItwL3 = itwLifecycleIsITWalletValidSelector(
    context.deps.store.getState()
  );
  trackItwDeactivated(isItwL3 ? "ITW_PID" : "ITW_ID_V2");
};

export const trackIdentificationMethodSelectedAction = ({
  context,
  event
}: EidActionArgs) => {
  assertEvent(event, "select-identification-mode");
  if (context.level === "l3") {
    return;
  }

  trackItWalletIDMethodSelected({
    ITW_ID_method: event.mode,
    itw_flow: "L2"
  });
};

// Track SPID+CIE first phase
export const trackItwIdAuthenticationCompletedAction = ({
  context
}: EidActionArgs) => {
  assert(context.identification, "identification context is undefined");
  assert(
    context.identification.mode !== "ciePin",
    "identification mode can not be ciePin"
  );

  trackItwIdAuthenticationCompletedEvent(context.identification);
};

// Track SPID+CIE final phase
export const trackItwIdVerifiedDocumentAction = ({
  context
}: EidActionArgs) => {
  assert(context.identification, "identification context is undefined");
  assert(
    context.identification.mode !== "ciePin",
    "identification mode can not be ciePin"
  );

  trackItwIdVerifiedDocumentEvent(toItwIdMethod(context.identification));
};

export const refreshCredentialsCatalogueAction = ({
  context
}: EidActionArgs) => {
  context.deps.store.dispatch(itwFetchCredentialsCatalogue.request());
};
