import { FciRouterScreenNavigationParams } from "../screens/FciRouterScreen";
import { FCI_ROUTES } from "./routes";

export type FciParamsList = {
  [FCI_ROUTES.ROUTER]: FciRouterScreenNavigationParams;
  [FCI_ROUTES.DOCUMENTS]: undefined;
};
