import { combineReducers } from "redux";
import { PersistPartial } from "redux-persist";

import codePersistor, { IdPayCodeState } from "../../../code/store/reducers";
import initiativeDetailsReducer, {
  IdPayInitiativeState
} from "../../../details/store/index";
import timelineReducer, { IdPayTimelineState } from "../../../timeline/store";
import walletReducer, {
  IdPayWalletState
} from "../../../wallet/store/reducers/index";
import configurationReducer, {
  IdPayInitiativeConfigurationState
} from "../../../configuration/store";
import barcodeReducer, { IdPayBarcodeState } from "../../../barcode/store";
import unsubscriptionReducer, {
  IdPayUnsubscriptionState
} from "../../../unsubscription/store/reducers";

export type IDPayState = {
  wallet: IdPayWalletState;
  initiative: IdPayInitiativeState;
  timeline: IdPayTimelineState;
  configuration: IdPayInitiativeConfigurationState;
  code: IdPayCodeState & PersistPartial;
  barcode: IdPayBarcodeState;
  unsubscription: IdPayUnsubscriptionState;
};

const idPayReducer = combineReducers({
  wallet: walletReducer,
  initiative: initiativeDetailsReducer,
  timeline: timelineReducer,
  code: codePersistor,
  configuration: configurationReducer,
  barcode: barcodeReducer,
  unsubscription: unsubscriptionReducer
});

export default idPayReducer;
