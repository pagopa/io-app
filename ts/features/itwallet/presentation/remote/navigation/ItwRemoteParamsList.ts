import { ItwEidClaimsSelectionScreenNavigationParams } from "../screens/ItwEidClaimsSelectionScreen.tsx";
import { ITW_REMOTE_ROUTES } from "./routes.ts";

export type ItwRemoteParamsList = {
  [ITW_REMOTE_ROUTES.EID_CLAIMS_SELECTION]: ItwEidClaimsSelectionScreenNavigationParams;
};
