/* eslint-disable @typescript-eslint/no-empty-function */
import { IOToast } from "@pagopa/io-app-design-system";
import { Alert } from "react-native";
import I18n from "../../../../i18n";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIODispatch } from "../../../../store/hooks";
import ROUTES from "../../../../navigation/routes";
import { ITW_ROUTES } from "../../navigation/routes";
import { itwLifecycleStateUpdated } from "../../lifecycle/store/actions";
import { ItwLifecycleState } from "../../lifecycle/store/reducers";
import { itwStoreIntegrityKeyTag } from "../../issuance/store/actions";

export const createEidIssuanceActionsImplementation = (
  navigation: ReturnType<typeof useIONavigation>,
  dispatch: ReturnType<typeof useIODispatch>,
  toast: IOToast
) => ({
  navigateToTosScreen: () => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.DISCOVERY.INFO
    });
  },

  navigateToIdentificationModeScreen: () => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.IDENTIFICATION.MODE_SELECTION
    });
  },

  navigateToIdpSelectionScreen: () => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.IDENTIFICATION.IDP_SELECTION
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
    Alert.alert("Failure");
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

  closeIssuance: () => {
    navigation.popToTop();
  },

  setWalletInstanceToOperational: () => {
    dispatch(
      itwLifecycleStateUpdated(ItwLifecycleState.ITW_LIFECYCLE_OPERATIONAL)
    );
  },

  setWalletInstanceToValid: () => {
    dispatch(itwLifecycleStateUpdated(ItwLifecycleState.ITW_LIFECYCLE_VALID));
  },

  storeWalletAttestation: () => {},

  storeIntegrityKeyTag: (_: unknown, params: { keyTag: string }) => {
    dispatch(itwStoreIntegrityKeyTag(params.keyTag));
  },

  storeEidCredential: () => {},

  requestAssistance: () => {}
});
