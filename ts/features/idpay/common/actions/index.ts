import { IDPayInitiativeActions } from "../../details/store/actions";
import { IDPayTimelineActions } from "../../timeline/store/actions";
import { IDPayWalletActions } from "../../wallet/store/actions";

export type IDPayActions =
  | IDPayWalletActions
  | IDPayInitiativeActions
  | IDPayTimelineActions;
