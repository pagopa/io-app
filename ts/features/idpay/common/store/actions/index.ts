import { IdPayCodeActions } from "../../../code/store/actions";
import { IdPayInitiativeActions } from "../../../initiative/details/store/actions";
import { IdPayTimelineActions } from "../../../initiative/timeline/store/actions";
import { IdPayWalletActions } from "../../../wallet/store/actions";

export type IdPayActions =
  | IdPayWalletActions
  | IdPayInitiativeActions
  | IdPayTimelineActions
  | IdPayCodeActions;
