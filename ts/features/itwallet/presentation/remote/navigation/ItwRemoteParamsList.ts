import { ItwRemoteClaimsDisclosureScreenNavigationParams } from "../screens/ItwRemoteClaimsDisclosureScreen.tsx";
import { ITW_REMOTE_ROUTES } from "./routes.ts";

export type ItwRemoteParamsList = {
  [ITW_REMOTE_ROUTES.CLAIMS_DISCLOSURE]: ItwRemoteClaimsDisclosureScreenNavigationParams;
  [ITW_REMOTE_ROUTES.FAILURE]: undefined;
};
