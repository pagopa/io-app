// TODO: remove after the introduction of the bpd detail screen
import { NavigationActions } from "react-navigation";
import BPD_ROUTES from "../routes";

export const navigateToBpdTestScreen = () =>
  NavigationActions.navigate({
    routeName: BPD_ROUTES.TEST
  });
