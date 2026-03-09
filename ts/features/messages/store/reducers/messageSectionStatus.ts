import { getType } from "typesafe-actions";
import { GlobalState } from "../../../../store/reducers/types";
import { setMessageSagasRegisteredAction } from "../actions";
import { Action } from "../../../../store/actions/types";
import { startApplicationInitialization } from "../../../../store/actions/application";

export type MessageSectionStatusType = {
  // This property is used to know if message's sagas have been
  // properly instantiated in the related saga (index.ts). This
  // prevents the firing of the automatic message refresh when
  // the startup saga has been reloaded (e.g., by a fast-login
  // or active-session-login flow)
  messageSagasRegistered: boolean;
};

export const messageSectionStatusInitialState: MessageSectionStatusType = {
  messageSagasRegistered: false
};

export const messageSectionStatusReducer = (
  state: MessageSectionStatusType = messageSectionStatusInitialState,
  action: Action
): MessageSectionStatusType => {
  switch (action.type) {
    case getType(startApplicationInitialization):
      return messageSectionStatusInitialState;
    case getType(setMessageSagasRegisteredAction): {
      return {
        messageSagasRegistered: true
      };
    }
    default:
      return state;
  }
};

export const areMessageSagasRegisteredSelector = (state: GlobalState) =>
  state.entities.messages.sectionStatus.messageSagasRegistered;
