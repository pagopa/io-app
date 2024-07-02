/* eslint-disable @typescript-eslint/no-empty-function */
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import ROUTES from "../../../../navigation/routes";
import { WalletRoutes } from "../../../newWallet/navigation/routes";
import { ITW_ROUTES } from "../../navigation/routes";

export const createEidIssuanceActionsImplementation = (
  navigation: ReturnType<typeof useIONavigation>
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
      screen: ITW_ROUTES.ISSUANCE.RESULT
    });
  },

  navigateToFailureScreen: () => {},

  navigateToWallet: () => {
    navigation.reset({
      index: 1,
      routes: [
        {
          name: ROUTES.MAIN,
          params: {
            screen: ROUTES.WALLET_HOME,
            params: {
              newMethodAdded: true
            }
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
          name: WalletRoutes.WALLET_NAVIGATOR,
          params: {
            screen: WalletRoutes.WALLET_CARD_ONBOARDING
          }
        }
      ]
    });
  },

  closeIssuance: () => {
    navigation.popToTop();
  },

  storeWalletAttestation: () => {},

  storeEidCredential: () => {},

  requestAssistance: () => {}
});
