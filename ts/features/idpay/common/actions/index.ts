import { IDPayInitiativeActions } from "../../initiative/details/store";
import { IDPayWalletActions } from "../../wallet/store/actions";

export type IDPayActions = IDPayWalletActions | IDPayInitiativeActions;
