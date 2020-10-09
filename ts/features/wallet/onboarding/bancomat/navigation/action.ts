import { NavigationActions } from "react-navigation";
import WALLET_ADD_BANCOMAT_ROUTES from "./routes";

export const navigateToWalletAddBancomatChooseBank = () =>
  NavigationActions.navigate({
    routeName: WALLET_ADD_BANCOMAT_ROUTES.CHOOSE_BANK
  });

export const navigateToWalletAddBancomat = () =>
  NavigationActions.navigate({
    routeName: WALLET_ADD_BANCOMAT_ROUTES.ADD_BANCOMAT
  });

// TODO: temp only, will be removed when linked with the real workflow
export const navigateToWalletPoc1 = () =>
  NavigationActions.navigate({
    routeName: WALLET_ADD_BANCOMAT_ROUTES.POC1
  });
