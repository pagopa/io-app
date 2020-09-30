import { NavigationActions } from "react-navigation";
import BPD_ROUTES from "../routes";

export const navigateToBpdIbanInsertion = () =>
  NavigationActions.navigate({
    routeName: BPD_ROUTES.IBAN.INSERTION
  });

export const navigateToBpdIbanLoadingUpsert = () =>
  NavigationActions.navigate({
    routeName: BPD_ROUTES.IBAN.LOADING_UPSERT
  });

export const navigateToBpdIbanKOCannotVerify = () =>
  NavigationActions.navigate({
    routeName: BPD_ROUTES.IBAN.KO_CANNOT_VERIFY
  });

export const navigateToBpdIbanKONotOwned = () =>
  NavigationActions.navigate({
    routeName: BPD_ROUTES.IBAN.KO_NOT_OWNED
  });

export const navigateToBpdIbanKOWrong = () =>
  NavigationActions.navigate({
    routeName: BPD_ROUTES.IBAN.KO_WRONG
  });
