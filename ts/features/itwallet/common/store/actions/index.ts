import { ItwCredentialsActions } from "../../../credentials/store/actions";
import { ItwIdentificationActions } from "../../../identification/store/actions";
import { ItwIssuanceActions } from "../../../issuance/store/actions";
import { ItwLifecycleActions } from "../../../lifecycle/store/actions";
import { ItwWiaActions } from "../../../wia/store/actions";

export type ItwActions =
  | ItwIdentificationActions
  | ItwIssuanceActions
  | ItwLifecycleActions
  | ItwCredentialsActions
  | ItwWiaActions;
