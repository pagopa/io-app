/* eslint-disable @typescript-eslint/no-empty-function */
import { IOToast } from "@pagopa/io-app-design-system";
import { ActionArgs, assign } from "xstate";
import * as O from "fp-ts/lib/Option";
import I18n from "../../../../i18n";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import ROUTES from "../../../../navigation/routes";
import { checkCurrentSession } from "../../../../store/actions/authentication";
import { useIOStore } from "../../../../store/hooks";
import { assert } from "../../../../utils/assert";
import { itwCredentialsStore } from "../../credentials/store/actions";
import {
  itwRemoveIntegrityKeyTag,
  itwStoreIntegrityKeyTag
} from "../../issuance/store/actions";
import {
  itwLifecycleStateUpdated,
  itwLifecycleWalletReset
} from "../../lifecycle/store/actions";
import { ItwLifecycleState } from "../../lifecycle/store/reducers";
import { ITW_ROUTES } from "../../navigation/routes";
import { itwWalletInstanceAttestationStore } from "../../walletInstance/store/actions";
import {
  trackItwDeactivated,
  trackSaveCredentialSuccess,
  updateITWStatusAndIDProperties
} from "../../analytics";
import { itwIntegrityKeyTagSelector } from "../../issuance/store/selectors";
import { itwWalletInstanceAttestationSelector } from "../../walletInstance/store/selectors";
import { itwSetAuthLevel } from "../../common/store/actions/preferences.ts";
import { Context } from "./context";
import { EidIssuanceEvents } from "./events";

export const createEidIssuanceActionsImplementation = (
  navigation: ReturnType<typeof useIONavigation>,
  store: ReturnType<typeof useIOStore>,
  toast: IOToast
) => ({
  navigateToTosScreen: () => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.DISCOVERY.INFO
    });
  },

  navigateToIpzsPrivacyScreen: () => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.DISCOVERY.IPZS_PRIVACY
    });
  },

  navigateToIdentificationModeScreen: () => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.IDENTIFICATION.MODE_SELECTION,
      params: { eidReissuing: false }
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
    toast.success(I18n.t("features.itWallet.issuance.eidResult.success.toast"));
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
    navigation.reset({
      index: 1,
      routes: [
        {
          name: ROUTES.MAIN,
          params: {
            screen: ROUTES.WALLET_HOME
          }
        },
        {
          name: ITW_ROUTES.MAIN,
          params: {
            screen: ITW_ROUTES.ONBOARDING
          }
        }
      ]
    });
  },

  navigateToCiePinScreen: () => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.IDENTIFICATION.CIE.PIN_SCREEN
    });
  },

  navigateToCieReadCardScreen: () => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.IDENTIFICATION.CIE.CARD_READER_SCREEN
    });
  },

  navigateToWalletRevocationScreen: () => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.WALLET_REVOCATION_SCREEN
    });
  },

  closeIssuance: () => {
    navigation.popToTop();
  },

  setWalletInstanceToOperational: () => {
    store.dispatch(
      itwLifecycleStateUpdated(ItwLifecycleState.ITW_LIFECYCLE_OPERATIONAL)
    );
  },

  setWalletInstanceToValid: () => {
    store.dispatch(
      itwLifecycleStateUpdated(ItwLifecycleState.ITW_LIFECYCLE_VALID)
    );
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
    store.dispatch(itwCredentialsStore([context.eid]));
  },

  requestAssistance: () => {},

  handleSessionExpired: () =>
    store.dispatch(checkCurrentSession.success({ isSessionValid: false })),

  resetWalletInstance: () => {
    store.dispatch(itwLifecycleWalletReset());
    store.dispatch(itwSetAuthLevel(undefined));
    toast.success(I18n.t("features.itWallet.issuance.eidResult.success.toast"));
  },

  trackWalletInstanceCreation: () => {
    trackSaveCredentialSuccess("ITW_ID_V2");
    updateITWStatusAndIDProperties(store.getState());
  },

  trackWalletInstanceRevocation: () => {
    trackItwDeactivated(store.getState());
  },

  storeAuthLevel: ({
    context
  }: ActionArgs<Context, EidIssuanceEvents, EidIssuanceEvents>) => {
    // Save the auth level in the preferences
    store.dispatch(itwSetAuthLevel(context.identification?.level));
  },

  onInit: assign<Context, EidIssuanceEvents, unknown, EidIssuanceEvents, any>(
    () => {
      const state = store.getState();
      const storedIntegrityKeyTag = itwIntegrityKeyTagSelector(state);
      const walletInstanceAttestation =
        itwWalletInstanceAttestationSelector(state);
      return {
        integrityKeyTag: O.toUndefined(storedIntegrityKeyTag),
        walletInstanceAttestation
      };
    }
  )
});
