import { ItwRemoteRequestValidationScreenNavigationParams } from "../screens/ItwRemoteRequestValidationScreen.tsx";
import { ITW_REMOTE_ROUTES } from "./routes.ts";

export type ItwRemoteParamsList = {
  [ITW_REMOTE_ROUTES.REQUEST_VALIDATION]: ItwRemoteRequestValidationScreenNavigationParams;
  [ITW_REMOTE_ROUTES.CLAIMS_DISCLOSURE]: undefined;
  [ITW_REMOTE_ROUTES.AUTH_RESPONSE]: undefined;
  [ITW_REMOTE_ROUTES.FAILURE]: undefined;
};
