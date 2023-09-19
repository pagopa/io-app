import { IdPayCodeActions } from "../../../code/store/actions";
import { IdPayInitiativeActions } from "../../../details/store/actions";
import { IdPayTimelineActions } from "../../../timeline/store/actions";
import { IdPayWalletActions } from "../../../wallet/store/actions";

export type IdPayActions =
  | IdPayWalletActions
  | IdPayInitiativeActions
  | IdPayTimelineActions
  | IdPayCodeActions;
