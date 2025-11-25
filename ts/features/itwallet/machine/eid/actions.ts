import { IOToast } from "@pagopa/io-app-design-system";
import * as O from "fp-ts/lib/Option";
import I18n from "i18next";
import { ActionArgs, assertEvent, assign } from "xstate";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import ROUTES from "../../../../navigation/routes";
import { useIOStore } from "../../../../store/hooks";
import { assert } from "../../../../utils/assert";
import { checkCurrentSession } from "../../../authentication/common/store/actions";
import {
  trackItWalletIDMethodSelected,
  trackItwDeactivated,
  trackSaveCredentialSuccess,
  updateITWStatusAndPIDProperties
} from "../../analytics";
import {
  itwSetAuthLevel,
  itwFreezeSimplifiedActivationRequirements,
  itwClearSimplifiedActivationRequirements
} from "../../common/store/actions/preferences";
import {
  itwCredentialsRemoveByType,
  itwCredentialsStore
} from "../../credentials/store/actions";
import {
  itwCredentialsEidSelector,
  itwCredentialsSelector
} from "../../credentials/store/selectors";
import {
  itwRemoveIntegrityKeyTag,
  itwStoreIntegrityKeyTag
} from "../../issuance/store/actions";
import { itwIntegrityKeyTagSelector } from "../../issuance/store/selectors";
import { itwLifecycleWalletReset } from "../../lifecycle/store/actions";
import { ITW_ROUTES } from "../../navigation/routes";
import { itwWalletInstanceAttestationStore } from "../../walletInstance/store/actions";
import { itwWalletInstanceAttestationSelector } from "../../walletInstance/store/selectors";
import { itwLifecycleIsITWalletValidSelector } from "../../lifecycle/store/selectors";
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
        integrityKeyTag: O.toUndefined(storedIntegrityKeyTag),
        walletInstanceAttestation,
        legacyCredentials: Object.values(credentials)
      };
    }
  ),

  navigateToTosScreen: ({
    context
  }: ActionArgs<Context, EidIssuanceEvents, EidIssuanceEvents>) => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.DISCOVERY.INFO,
      params: { level: context.level }
    });
  },

  navigateToIpzsPrivacyScreen: () => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.DISCOVERY.IPZS_PRIVACY
    });
  },

  navigateToIdentificationScreen: ({
    context
  }: ActionArgs<Context, EidIssuanceEvents, EidIssuanceEvents>) => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.IDENTIFICATION.MODE_SELECTION,
      params: { eidReissuing: context.mode === "reissuance" }
    });
  },

  navigateToIdpSelectionScreen: () => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.IDENTIFICATION.IDP_SELECTION
    });
  },

  navigateToSpidLoginScreen: () => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.IDENTIFICATION.SPID.LOGIN
    });
  },

  navigateToCieIdLoginScreen: () => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.IDENTIFICATION.CIE_ID.LOGIN
    });
  },

  navigateToEidPreviewScreen: () => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.ISSUANCE.EID_PREVIEW
    });
  },

  navigateToSuccessScreen: () => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.ISSUANCE.EID_RESULT
    });
  },

  navigateToFailureScreen: () => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.ISSUANCE.EID_FAILURE
    });
  },

  navigateToNfcInstructionsScreen: () => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.IDENTIFICATION.CIE.ACTIVATE_NFC
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

  navigateToCredentialCatalog: () => {
    navigation.replace(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.ONBOARDING
    });
  },

  navigateToCieNfcPreparationScreen: () => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.IDENTIFICATION.CIE.PREPARATION.NFC_SCREEN
    });
  },

  navigateToCiePinPreparationScreen: () => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.IDENTIFICATION.CIE.PREPARATION.PIN_SCREEN
    });
  },

  navigateToCiePinScreen: () => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.IDENTIFICATION.CIE.PIN_SCREEN
    });
  },

  navigateToCieCardPreparationScreen: () => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.IDENTIFICATION.CIE.PREPARATION.CARD_SCREEN
    });
  },

  navigateToCieCanPreparationScreen: () => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.IDENTIFICATION.CIE.PREPARATION.CAN_SCREEN
    });
  },

  navigateToCieCanScreen: () => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.IDENTIFICATION.CIE.CAN_SCREEN
    });
  },

  navigateToCieAuthenticationScreen: () => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.IDENTIFICATION.CIE.AUTH_SCREEN
    });
  },

  navigateToCieInternalAuthAndMrtdScreen: () => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.IDENTIFICATION.CIE.INTERNAL_AUTH_MRTD_SCREEN
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
        type: event.warning
      }
    });
  },

  closeIssuance: ({
    context
  }: ActionArgs<Context, EidIssuanceEvents, EidIssuanceEvents>) => {
    navigation.reset({
      index: 1,
      routes: [
        {
          name: ROUTES.MAIN,
          params: {
            screen: ROUTES.WALLET_HOME,
            params: {
              requiredEidFeedback: context.mode === "reissuance"
            }
          }
        }
      ]
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

  storeEidCredential: ({
    context
  }: ActionArgs<Context, EidIssuanceEvents, EidIssuanceEvents>) => {
    assert(context.eid, "eID is undefined");
    // When upgrading to IT-Wallet it is possible to end up with the old and the new PID
    // at the same time, because they have different IDs and are not overwritten. To avoid this issue,
    // the eID is always removed before storing the new one. If no previous eID is present, the action is a no-op.
    store.dispatch(itwCredentialsRemoveByType(context.eid.credentialType));
    store.dispatch(itwCredentialsStore([context.eid]));
  },

  handleSessionExpired: () =>
    store.dispatch(checkCurrentSession.success({ isSessionValid: false })),

  resetWalletInstance: () => {
    store.dispatch(itwLifecycleWalletReset());
    store.dispatch(itwSetAuthLevel(undefined));
    toast.success(I18n.t("features.itWallet.issuance.credentialResult.toast"));
  },

  storeAuthLevel: ({
    context
  }: ActionArgs<Context, EidIssuanceEvents, EidIssuanceEvents>) => {
    // Save the auth level in the preferences
    store.dispatch(itwSetAuthLevel(context.identification?.level));
  },

  freezeSimplifiedActivationRequirements: () => {
    store.dispatch(itwFreezeSimplifiedActivationRequirements());
  },

  clearSimplifiedActivationRequirements: () => {
    store.dispatch(itwClearSimplifiedActivationRequirements());
  },

  loadPidIntoContext: assign<
    Context,
    EidIssuanceEvents,
    unknown,
    EidIssuanceEvents,
    any
  >(() => {
    const pid = itwCredentialsEidSelector(store.getState());
    return { eid: O.toUndefined(pid) };
  }),

  trackWalletInstanceCreation: ({
    context
  }: ActionArgs<Context, EidIssuanceEvents, EidIssuanceEvents>) => {
    trackSaveCredentialSuccess(
      context.level === "l3" ? "ITW_PID" : "ITW_ID_V2"
    );
    updateITWStatusAndPIDProperties(store.getState());
  },

  trackWalletInstanceRevocation: () => {
    const isItwL3 = itwLifecycleIsITWalletValidSelector(store.getState());
    trackItwDeactivated(store.getState(), isItwL3 ? "ITW_PID" : "ITW_ID_V2");
  },

  trackIdentificationMethodSelected: ({
    context,
    event
  }: ActionArgs<Context, EidIssuanceEvents, EidIssuanceEvents>) => {
    assertEvent(event, "select-identification-mode");

    trackItWalletIDMethodSelected({
      ITW_ID_method: event.mode,
      itw_flow: context.level === "l3" ? "L3" : "L2"
    });
  }
});
