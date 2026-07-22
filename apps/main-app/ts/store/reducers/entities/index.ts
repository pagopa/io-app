/**
 * Entities reducer
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import { omit } from "lodash";
import { combineReducers } from "redux";
import {
  createMigrate,
  MigrationManifest,
  PersistConfig,
  PersistedState,
  PersistPartial
} from "redux-persist";

import messagesReducer, {
  MessagesState
} from "../../../features/messages/store/reducers";
import { isDevEnv } from "../../../utils/environment";
import { Action } from "../../actions/types";
import { DateISO8601Transform } from "../../transforms/dateISO8601Tranform";
import { PotTransform } from "../../transforms/potTransform";
import calendarEventsReducer, { CalendarEventsState } from "./calendarEvents";
import { paymentByRptIdReducer, PaymentByRptIdState } from "./payments";

export type EntitiesState = Readonly<{
  calendarEvents: CalendarEventsState;
  messages: MessagesState;
  paymentByRptId: PaymentByRptIdState;
}>;

export type PersistedEntitiesState = EntitiesState & PersistPartial;

const CURRENT_REDUX_ENTITIES_STORE_VERSION = 5;

export const migrations: MigrationManifest = {
  // remove "currentSelectedService" section
  "0": (state: PersistedState) =>
    omit(state, "services.currentSelectedService"),
  // version 1
  // remove services section from persisted entities
  // TO avoid the proliferation of too many API requests until paged messages' API has been introduced
  // we restore the persistence of services so this RULE doesn't actually migrates the store.
  // ref: https://pagopa.atlassian.net/browse/IA-292
  "1": (state: PersistedState): PersistedEntitiesState =>
    ({
      ...state
    }) as PersistedEntitiesState,
  // version 2
  // remove some sections unused after moving to pagination.
  "2": (state: PersistedState) => {
    const entities = state as PersistedEntitiesState;
    return {
      ...entities,
      messages: omit(entities.messages, "allIds", "idsByServiceId", "byId")
    };
  },
  // version 3
  // remove services from persisted entities
  "3": (state: PersistedState) => omit(state, "services"),
  // version 4
  // remove messagesStatus (messages migration)
  "4": (state: PersistedState) => omit(state, "messagesStatus"),
  // version 5
  // remove organizations section
  "5": (state: PersistedState) => omit(state, "organizations")
};

// A custom configuration to avoid persisting messages section
export const entitiesPersistConfig: PersistConfig = {
  key: "entities",
  storage: AsyncStorage,
  version: CURRENT_REDUX_ENTITIES_STORE_VERSION,
  blacklist: ["messages"],
  migrate: createMigrate(migrations, { debug: isDevEnv }),
  transforms: [DateISO8601Transform, PotTransform]
};

const reducer = combineReducers<EntitiesState, Action>({
  messages: messagesReducer,
  paymentByRptId: paymentByRptIdReducer,
  calendarEvents: calendarEventsReducer
});

export default reducer;
