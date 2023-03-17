import { IDPayInitiativeActions } from "../../initiative/details/store/actions";
import { IDPayWalletActions } from "../../wallet/store/actions";

export type IDPayActions = IDPayWalletActions | IDPayInitiativeActions;
