import { NavigationActions } from "react-navigation";
import WALLET_ADD_BANCOMAT_ROUTES from "./routes";

export const navigateToWalletAddBancomatChooseBank = () =>
  NavigationActions.navigate({
    routeName: WALLET_ADD_BANCOMAT_ROUTES.CHOOSE_BANK
  });

export const navigateToWalletAddBancomatSearchAvailableUserBancomat = () =>
  NavigationActions.navigate({
    routeName: WALLET_ADD_BANCOMAT_ROUTES.SEARCH_AVAILABLE_USER_BANCOMAT
  });

export const navigateToWalletAddBancomat = () =>
  NavigationActions.navigate({
    routeName: WALLET_ADD_BANCOMAT_ROUTES.ADD_BANCOMAT
  });
