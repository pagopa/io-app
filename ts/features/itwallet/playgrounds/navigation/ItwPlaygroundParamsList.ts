import { ItwL3CredentialDetailScreenNavigationParams } from "../screens/ItwL3CredentialDetailScreen.tsx";
import { ITW_PLAYGROUND_ROUTES } from "./routes.ts";

export type ItwPlaygroundParamsList = {
  [ITW_PLAYGROUND_ROUTES.LANDING]: undefined;
  [ITW_PLAYGROUND_ROUTES.CREDENTIAL_DETAIL]: ItwL3CredentialDetailScreenNavigationParams;
  [ITW_PLAYGROUND_ROUTES.DISCOVERY_INFO_NEW]: undefined;
};
