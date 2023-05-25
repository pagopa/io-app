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
import calendarEventsReducer, { CalendarEventsState } from "./calendarEvents";
import messagesReducer, { MessagesState } from "./messages";
import messagesStatusReducer, {
  MessagesStatus
} from "./messages/messagesStatus";
import organizationsReducer, { OrganizationsState } from "./organizations";
import { paymentByRptIdReducer, PaymentByRptIdState } from "./payments";
import servicesReducer, { ServicesState } from "./services";

export type EntitiesState = Readonly<{
  messages: MessagesState;
  messagesStatus: MessagesStatus;
  services: ServicesState;
  organizations: OrganizationsState;
  paymentByRptId: PaymentByRptIdState;
  calendarEvents: CalendarEventsState;
}>;

export type PersistedEntitiesState = EntitiesState & PersistPartial;

const CURRENT_REDUX_ENTITIES_STORE_VERSION = 2;
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
  }
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
  messagesStatus: messagesStatusReducer,
  services: servicesReducer,
  organizations: organizationsReducer,
  paymentByRptId: paymentByRptIdReducer,
  calendarEvents: calendarEventsReducer
});

export default reducer;
