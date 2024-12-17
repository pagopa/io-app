import { ItwCredentialsActions } from "../../../credentials/store/actions";
import { ItwIssuanceActions } from "../../../issuance/store/actions";
import { ItwLifecycleActions } from "../../../lifecycle/store/actions";
import { ItwWalletInstanceActions } from "../../../walletInstance/store/actions";
import { ItwPreferencesActions } from "./preferences";

export type ItwActions =
  | ItwIssuanceActions
  | ItwLifecycleActions
  | ItwCredentialsActions
  | ItwWalletInstanceActions
  | ItwPreferencesActions;
