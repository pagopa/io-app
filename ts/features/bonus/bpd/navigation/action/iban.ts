import { NavigationActions } from "react-navigation";
import BPD_ROUTES from "../routes";

export const navigateToBpdIbanInsertion = () =>
  NavigationActions.navigate({
    routeName: BPD_ROUTES.IBAN
  });
