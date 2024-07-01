import { ItwIdentificationActions } from "../../../identification/store/actions";
import { ItwIssuanceActions } from "../../../issuance/store/actions";

export type ItwActions = ItwIdentificationActions | ItwIssuanceActions;
