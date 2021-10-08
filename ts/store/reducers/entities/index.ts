/**
 * Entities reducer
 */
import { combineReducers } from "redux";
import {
  createMigrate,
  MigrationManifest,
  PersistConfig,
  PersistedState,
  PersistPartial
} from "redux-persist";
import _ from "lodash";
import AsyncStorage from "@react-native-community/async-storage";
import * as pot from "italia-ts-commons/lib/pot";
import { Action } from "../../actions/types";
import { GlobalState } from "../types";
import { isDevEnv } from "../../../utils/environment";
import calendarEventsReducer, { CalendarEventsState } from "./calendarEvents";
import messagesReducer, { MessagesState } from "./messages";
import messagesStatusReducer, {
  MessagesStatus
} from "./messages/messagesStatus";
import organizationsReducer, { OrganizationsState } from "./organizations";
import { paymentByRptIdReducer, PaymentByRptIdState } from "./payments";
import {
  ReadTransactionsState,
  transactionsReadReducer
} from "./readTransactions";
import servicesReducer, { ServicesState } from "./services";

export type EntitiesState = Readonly<{
  messages: MessagesState;
  messagesStatus: MessagesStatus;
  services: ServicesState;
  organizations: OrganizationsState;
  paymentByRptId: PaymentByRptIdState;
  calendarEvents: CalendarEventsState;
  transactionsRead: ReadTransactionsState;
}>;

export type PersistedEntitiesState = EntitiesState & PersistPartial;

const CURRENT_REDUX_ENTITIES_STORE_VERSION = 1;
const migrations: MigrationManifest = {
  // version 0
  // remove "currentSelectedService" section
  "0": (state: PersistedState): PersistedEntitiesState => {
    const entities = state as PersistedEntitiesState;
    return {
      ...entities,
      services: { ..._.omit(entities.services, "currentSelectedService") }
    };
  },
  // version 1
  // remove services section from persisted entities
  "1": (state: PersistedState): PersistedEntitiesState => {
    const entities = state as PersistedEntitiesState;
    return {
      ...entities,
      services: {
        servicePreference: pot.none,
        byId: {},
        byOrgFiscalCode: {},
        readState: {},
        visible: pot.none,
        firstLoading: { isFirstServicesLoadingCompleted: false }
      }
    };
  }
};

// A custom configuration to avoid to persist messages section
export const entitiesPersistConfig: PersistConfig = {
  key: "entities",
  storage: AsyncStorage,
  version: CURRENT_REDUX_ENTITIES_STORE_VERSION,
  blacklist: ["messages", "services"],
  migrate: createMigrate(migrations, { debug: isDevEnv })
};

const reducer = combineReducers<EntitiesState, Action>({
  messages: messagesReducer,
  messagesStatus: messagesStatusReducer,
  services: servicesReducer,
  organizations: organizationsReducer,
  paymentByRptId: paymentByRptIdReducer,
  calendarEvents: calendarEventsReducer,
  transactionsRead: transactionsReadReducer
});

export default reducer;

// Selector
export const transactionsReadSelector = (state: GlobalState) =>
  state.entities.transactionsRead;
