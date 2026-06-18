import { IOToast } from "@pagopa/io-app-design-system";
import * as O from "fp-ts/lib/Option";
import I18n from "i18next";
import { ActionArgs, assertEvent, assign } from "xstate";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import ROUTES from "../../../../navigation/routes";
import { useIOStore } from "../../../../store/hooks";
import { assert } from "../../../../utils/assert";
import { isRouteInNavigationState } from "../../../../utils/navigation";
import { checkCurrentSession } from "../../../authentication/common/store/actions";
import {
  trackItWalletIDMethodSelected,
  trackItwDeactivated,
  trackItwIdAuthenticationCompleted,
  trackItwIdVerifiedDocument,
  trackSaveCredentialSuccess
} from "../../analytics";
import { toItwIdMethod } from "../../analytics/utils/types";
import { itwMixPanelCredentialDetailsSelector } from "../../analytics/store/selectors";
import {
  itwSetAuthLevel,
  itwSetCredentialUpgradeFailed,
  itwSetIdentificationMode
} from "../../common/store/actions/preferences";
import { itwIsPidReissuingSurveyHiddenSelector } from "../../common/store/selectors/preferences";
import { itwCredentialsSelector } from "../../credentials/store/selectors";
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
import { selectItwSpecsVersion } from "../../common/store/selectors/environment";
import { itwFetchCredentialsCatalogue } from "../../credentialsCatalogue/store/actions";
import { Context } from "./context";
import { EidIssuanceEvents } from "./events";

export const createEidIssuanceActionsImplementation = (
  navigation: ReturnType<typeof useIONavigation>,
  store: ReturnType<typeof useIOStore>,
  toast: IOToast
) => ({
  onInit: assign<Context, EidIssuanceEvents, unknown, EidIssuanceEvents, any>(
    () => {
      const state = store.getState();
      const storedIntegrityKeyTag = itwIntegrityKeyTagSelector(state);
      const walletInstanceAttestation =
        itwWalletInstanceAttestationSelector(state);
      const credentials = itwCredentialsSelector(state);

      return {
        // Get the IT-Wallet version from the global store; this can be overriden during the issuance flow.
        itwVersion: selectItwSpecsVersion(state),
        integrityKeyTag: O.toUndefined(storedIntegrityKeyTag),
        walletInstanceAttestation,
        credentialsToUpgrade: Object.values(credentials)
      };
    }
  ),

  navigateToTosScreen: ({
    context
  }: ActionArgs<Context, EidIssuanceEvents, EidIssuanceEvents>) => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.DISCOVERY.INFO,
      params: { level: context.level },
      pop: true
    });
  },

  navigateToIpzsPrivacyScreen: () => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.DISCOVERY.IPZS_PRIVACY,
      pop: true
    });
  },

  navigateToIdentificationScreen: ({
    context
  }: ActionArgs<Context, EidIssuanceEvents, EidIssuanceEvents>) => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.IDENTIFICATION.MODE_SELECTION,
      params: { eidReissuing: context.mode === "reissuance" },
      pop: true
    });
  },

  navigateToIdpSelectionScreen: () => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.IDENTIFICATION.IDP_SELECTION,
      pop: true
    });
  },

  navigateToSpidLoginScreen: () => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.IDENTIFICATION.SPID.LOGIN,
      pop: true
    });
  },

  navigateToCieIdLoginScreen: () => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.IDENTIFICATION.CIE_ID.LOGIN,
      pop: true
    });
  },

  navigateToEidPreviewScreen: () => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.ISSUANCE.EID_PREVIEW,
      pop: true
    });
  },

  navigateToSuccessScreen: () => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.ISSUANCE.EID_RESULT,
      pop: true
    });
  },

  navigateToFailureScreen: () => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.ISSUANCE.EID_FAILURE,
      pop: true
    });
  },

  navigateToNfcInstructionsScreen: () => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.IDENTIFICATION.CIE.ACTIVATE_NFC,
      pop: true
    });
  },

  navigateToWallet: () => {
    toast.success(I18n.t("features.itWallet.issuance.credentialResult.toast"));
    navigation.popTo(ROUTES.MAIN, {
      screen: ROUTES.WALLET_HOME,
      params: {}
    });
  },

  navigateToCredentialCatalog: ({
    context
  }: ActionArgs<Context, EidIssuanceEvents, EidIssuanceEvents>) => {
    navigation.replace(ITW_ROUTES.MAIN, {
      screen:
        context.level === "l3"
          ? ITW_ROUTES.L3_ONBOARDING
          : context.level === "l2-fallback"
            ? ITW_ROUTES.L2_ONBOARDING
            : ITW_ROUTES.ONBOARDING
    });
  },

  navigateToCieNfcPreparationScreen: () => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.IDENTIFICATION.CIE.PREPARATION.NFC_SCREEN,
      pop: true
    });
  },

  navigateToCiePinPreparationScreen: () => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.IDENTIFICATION.CIE.PREPARATION.PIN_SCREEN,
      pop: true
    });
  },

  navigateToCiePinScreen: () => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.IDENTIFICATION.CIE.PIN_SCREEN,
      pop: true
    });
  },

  navigateToCieCardPreparationScreen: () => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.IDENTIFICATION.CIE.PREPARATION.CARD_SCREEN,
      pop: true
    });
  },

  navigateToCieCanPreparationScreen: () => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.IDENTIFICATION.CIE.PREPARATION.CAN_SCREEN,
      pop: true
    });
  },

  navigateToCieCanScreen: () => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.IDENTIFICATION.CIE.CAN_SCREEN,
      pop: true
    });
  },

  navigateToCieAuthenticationScreen: () => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.IDENTIFICATION.CIE.AUTH_SCREEN,
      pop: true
    });
  },

  navigateToCieInternalAuthAndMrtdScreen: ({
    context
  }: ActionArgs<Context, EidIssuanceEvents, EidIssuanceEvents>) => {
    assert(context.mrtdContext, "mrtdContext is undefined");
    assert(context.mrtdContext.can, "CAN is undefined");

    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.IDENTIFICATION.CIE.INTERNAL_AUTH_MRTD_SCREEN,
      params: {
        can: context.mrtdContext.can,
        challenge: context.mrtdContext.challenge
      }
    });
  },

  navigateToWalletRevocationScreen: () => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.WALLET_REVOCATION_SCREEN
    });
  },

  navigateToCieWarningScreen: ({
    event
  }: ActionArgs<Context, EidIssuanceEvents, EidIssuanceEvents>) => {
    assertEvent(event, "go-to-cie-warning");

    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.IDENTIFICATION.CIE_WARNING,
      params: {
        type: event.warning,
        routeName: event.routeName
      }
    });
  },

  navigateToUpgradeCredentialsScreen: () => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.ISSUANCE.UPGRADE_CREDENTIALS
    });
  },

  closeIssuance: ({
    context
  }: ActionArgs<Context, EidIssuanceEvents, EidIssuanceEvents>) => {
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

    navigation.popTo(ROUTES.MAIN, {
      screen: ROUTES.WALLET_HOME,
      params: { requiredEidFeedback: isReissuance && !isSurveyHidden }
    });
  },

  storeIntegrityKeyTag: ({
    context
  }: ActionArgs<Context, EidIssuanceEvents, EidIssuanceEvents>) => {
    assert(context.integrityKeyTag, "integrityKeyTag is undefined");
    store.dispatch(itwStoreIntegrityKeyTag(context.integrityKeyTag));
  },

  cleanupIntegrityKeyTag: () => {
    // Remove the integrity key tag from the store
    store.dispatch(itwRemoveIntegrityKeyTag());
  },

  storeWalletInstanceAttestation: ({
    context
  }: ActionArgs<Context, EidIssuanceEvents, EidIssuanceEvents>) => {
    assert(
      context.walletInstanceAttestation,
      "walletInstanceAttestation is undefined"
    );
    store.dispatch(
      itwWalletInstanceAttestationStore(context.walletInstanceAttestation)
    );
  },

  handleSessionExpired: () =>
    store.dispatch(checkCurrentSession.success({ isSessionValid: false })),

  resetWalletInstance: () => {
    store.dispatch(itwLifecycleWalletReset());
    store.dispatch(itwSetAuthLevel(undefined));
    store.dispatch(itwSetIdentificationMode(undefined));
    toast.success(I18n.t("features.itWallet.issuance.credentialResult.toast"));
  },

  storeAuthLevel: ({
    context
  }: ActionArgs<Context, EidIssuanceEvents, EidIssuanceEvents>) => {
    // Save the auth level in the preferences
    store.dispatch(itwSetAuthLevel(context.identification?.level));
    store.dispatch(itwSetIdentificationMode(context.identification?.mode));
  },

  storeCredentialUpgradeFailures: ({
    event
  }: ActionArgs<Context, EidIssuanceEvents, EidIssuanceEvents>) => {
    assertEvent(event, "xstate.done.actor.credentialUpgradeMachine");
    store.dispatch(
      itwSetCredentialUpgradeFailed(
        event.output.failedCredentials.map(
          failedCredential => failedCredential.credentialType
        )
      )
    );
  },

  trackWalletInstanceCreation: ({
    context
  }: ActionArgs<Context, EidIssuanceEvents, EidIssuanceEvents>) => {
    trackSaveCredentialSuccess({
      credential: context.level === "l3" ? "ITW_PID" : "ITW_ID_V2",
      ITW_ID_method: context.identification?.mode,
      credential_details: itwMixPanelCredentialDetailsSelector(store.getState())
    });
  },

  trackWalletInstanceRevocation: () => {
    const isItwL3 = itwLifecycleIsITWalletValidSelector(store.getState());
    trackItwDeactivated(isItwL3 ? "ITW_PID" : "ITW_ID_V2");
  },

  trackIdentificationMethodSelected: ({
    context,
    event
  }: ActionArgs<Context, EidIssuanceEvents, EidIssuanceEvents>) => {
    assertEvent(event, "select-identification-mode");
    if (context.level === "l3") {
      return;
    }

    trackItWalletIDMethodSelected({
      ITW_ID_method: event.mode,
      itw_flow: "L2"
    });
  },

  // Track SPID+CIE first phase
  trackItwIdAuthenticationCompleted: ({
    context
  }: ActionArgs<Context, EidIssuanceEvents, EidIssuanceEvents>) => {
    assert(context.identification, "identification context is undefined");
    assert(
      context.identification.mode !== "ciePin",
      "identification mode can not be ciePin"
    );

    trackItwIdAuthenticationCompleted(toItwIdMethod(context.identification));
  },

  // Track SPID+CIE final phase
  trackItwIdVerifiedDocument: ({
    context
  }: ActionArgs<Context, EidIssuanceEvents, EidIssuanceEvents>) => {
    assert(context.identification, "identification context is undefined");
    assert(
      context.identification.mode !== "ciePin",
      "identification mode can not be ciePin"
    );

    trackItwIdVerifiedDocument(toItwIdMethod(context.identification));
  },

  refreshCredentialsCatalogue: () => {
    store.dispatch(itwFetchCredentialsCatalogue.request());
  }
});
