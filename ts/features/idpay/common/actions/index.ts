import { IDPayInitiativeConfigurationActions } from "../../initiative/configuration/store/actions";
import { IDPayInitiativeActions } from "../../initiative/details/store/actions";
import { IDPayTimelineActions } from "../../initiative/timeline/store/actions";
import { IDPayWalletActions } from "../../wallet/store/actions";

export type IDPayActions =
  | IDPayWalletActions
  | IDPayInitiativeActions
  | IDPayTimelineActions
  | IDPayInitiativeConfigurationActions;
