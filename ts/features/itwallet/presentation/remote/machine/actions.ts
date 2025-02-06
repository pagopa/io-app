import { useIONavigation } from "../../../../../navigation/params/AppParamsList.ts";
import { ITW_REMOTE_ROUTES } from "../navigation/routes.ts";
import ROUTES from "../../../../../navigation/routes.ts";
import { ITW_ROUTES } from "../../../navigation/routes.ts";

export const createRemoteActionsImplementation = (
  navigation: ReturnType<typeof useIONavigation>
) => ({
  navigateToItwWalletInactiveScreen: () => {
    navigation.navigate(ITW_REMOTE_ROUTES.MAIN, {
      screen: ITW_REMOTE_ROUTES.WALLET_INACTIVE
    });
  },

  navigateToTosScreen: () => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.DISCOVERY.INFO
    });
  },

  navigateToWallet: () => {
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

  closeIssuance: () => {
    navigation.popToTop();
  }
});
