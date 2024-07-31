/**
 * Entities reducer
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import _ from "lodash";
import { combineReducers } from "redux";
import {
  createMigrate,
  MigrationManifest,
  PersistConfig,
  PersistedState,
  PersistPartial
} from "redux-persist";
import { isDevEnv } from "../../../utils/environment";
import { Action } from "../../actions/types";
import { DateISO8601Transform } from "../../transforms/dateISO8601Tranform";
import { PotTransform } from "../../transforms/potTransform";
import messagesReducer, {
  MessagesState
} from "../../../features/messages/store/reducers";
import calendarEventsReducer, { CalendarEventsState } from "./calendarEvents";
import organizationsReducer, { OrganizationsState } from "./organizations";
import { paymentByRptIdReducer, PaymentByRptIdState } from "./payments";

export type EntitiesState = Readonly<{
  messages: MessagesState;
  organizations: OrganizationsState;
  paymentByRptId: PaymentByRptIdState;
  calendarEvents: CalendarEventsState;
}>;

export type PersistedEntitiesState = EntitiesState & PersistPartial;

const CURRENT_REDUX_ENTITIES_STORE_VERSION = 4;
const migrations: MigrationManifest = {
  // version 0
  // remove "currentSelectedService" section
  "0": (state: PersistedState) =>
    _.omit(state, "services.currentSelectedService"),
  // version 1
  // remove services section from persisted entities
  // TO avoid the proliferation of too many API requests until paged messages' API has been introduced
  // we restore the persistence of services so this RULE doesn't actually migrates the store.
  // ref: https://pagopa.atlassian.net/browse/IA-292
  "1": (state: PersistedState): PersistedEntitiesState =>
    ({
      ...state
    } as PersistedEntitiesState),
  // version 2
  // remove some sections unused after moving to pagination.
  "2": (state: PersistedState): PersistedEntitiesState => {
    const entities = state as PersistedEntitiesState;
    return {
      ...entities,
      messages: {
        ..._.omit(entities.messages, "allIds", "idsByServiceId", "byId")
      }
    };
  },
  // version 3
  // remove services from persisted entities
  "3": (state: PersistedState) => _.omit(state, "services"),
  // version 4
  // remove messagesStatus (messages migration)
  "4": (state: PersistedState) => _.omit(state, "messagesStatus")
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
  organizations: organizationsReducer,
  paymentByRptId: paymentByRptIdReducer,
  calendarEvents: calendarEventsReducer
});

export default reducer;
