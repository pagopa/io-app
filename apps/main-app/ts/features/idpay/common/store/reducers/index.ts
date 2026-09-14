import { combineReducers } from "redux";
import { PersistPartial } from "redux-persist";

import { barcodeReducer } from "../../../barcode/store/reducers/barcodeReducer";
import { staticCodeReducer } from "../../../barcode/store/reducers/staticCodeReducer";
import {
  IdPayBarcodeState,
  IdPayStaticCodeState
} from "../../../barcode/store/types";
import codePersistor, { IdPayCodeState } from "../../../code/store/reducers";
import configurationReducer, {
  IdPayInitiativeConfigurationState
} from "../../../configuration/store";
import initiativeDetailsReducer, {
  IdPayInitiativeState
} from "../../../details/store/index";
import timelineReducer, { IdPayTimelineState } from "../../../timeline/store";
import unsubscriptionReducer, {
  IdPayUnsubscriptionState
} from "../../../unsubscription/store/reducers";
import walletReducer, {
  IdPayWalletState
} from "../../../wallet/store/reducers/index";

export type IDPayState = {
  barcode: IdPayBarcodeState;
  code: IdPayCodeState & PersistPartial;
  configuration: IdPayInitiativeConfigurationState;
  initiative: IdPayInitiativeState;
  staticCode: IdPayStaticCodeState;
  timeline: IdPayTimelineState;
  unsubscription: IdPayUnsubscriptionState;
  wallet: IdPayWalletState;
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
