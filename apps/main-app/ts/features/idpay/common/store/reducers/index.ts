import { combineReducers } from "redux";
import { PersistPartial } from "redux-persist";

import codePersistor, { IdPayCodeState } from "../../../code/store/reducers";
import configurationReducer, {
  IdPayInitiativeConfigurationState
} from "../../../configuration/store";
import initiativeDetailsReducer, {
  IdPayInitiativeState
} from "../../../details/store/index";
import timelineReducer, { IdPayTimelineState } from "../../../timeline/store";
import walletReducer, {
  IdPayWalletState
} from "../../../wallet/store/reducers/index";

import { barcodeReducer } from "../../../barcode/store/reducers/barcodeReducer";
import { staticCodeReducer } from "../../../barcode/store/reducers/staticCodeReducer";
import unsubscriptionReducer, {
  IdPayUnsubscriptionState
} from "../../../unsubscription/store/reducers";
import {
  IdPayBarcodeState,
  IdPayStaticCodeState
} from "../../../barcode/store/types";

export type IDPayState = {
  wallet: IdPayWalletState;
  initiative: IdPayInitiativeState;
  timeline: IdPayTimelineState;
  configuration: IdPayInitiativeConfigurationState;
  code: IdPayCodeState & PersistPartial;
  barcode: IdPayBarcodeState;
  staticCode: IdPayStaticCodeState;
  unsubscription: IdPayUnsubscriptionState;
};

const idPayReducer = combineReducers({
  wallet: walletReducer,
  initiative: initiativeDetailsReducer,
  timeline: timelineReducer,
  code: codePersistor,
  configuration: configurationReducer,
  barcode: barcodeReducer,
  staticCode: staticCodeReducer,
  unsubscription: unsubscriptionReducer
});

export default idPayReducer;
