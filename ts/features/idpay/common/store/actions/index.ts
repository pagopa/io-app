import { IdPayCodeActions } from "../../../code/store/actions";
import { IDPayInitiativeConfigurationActions } from "../../../configuration/store/actions";
import { IDPayInitiativeActions } from "../../../details/store/actions";
import { IdPayTimelineActions } from "../../../timeline/store/actions";
import { IdPayWalletActions } from "../../../wallet/store/actions";

export type IdPayActions =
  | IdPayWalletActions
  | IDPayInitiativeActions
  | IdPayTimelineActions
  | IdPayCodeActions
  | IDPayInitiativeConfigurationActions;
