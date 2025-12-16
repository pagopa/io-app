import {
  IdPayBarcodeActions,
  IdPayStaticCodeActions
} from "../../../barcode/store/actions";
import { IdPayCodeActions } from "../../../code/store/actions";
import { IDPayInitiativeConfigurationActions } from "../../../configuration/store/actions";
import { IdPayInitiativeActions } from "../../../details/store/actions";
import { IdPayTimelineActions } from "../../../timeline/store/actions";
import { IdPayUnsubscriptionActions } from "../../../unsubscription/store/actions";
import { IdPayWalletActions } from "../../../wallet/store/actions";

export type IdPayActions =
  | IdPayWalletActions
  | IdPayInitiativeActions
  | IdPayTimelineActions
  | IdPayCodeActions
  | IDPayInitiativeConfigurationActions
  | IdPayBarcodeActions
  | IdPayStaticCodeActions
  | IdPayUnsubscriptionActions;
