import { getType } from "typesafe-actions";
import { createSelector } from "reselect";
import { IndexedById, toIndexed } from "../../../../store/helpers/indexer";
import { ZendeskCategory } from "../../../../../definitions/content/ZendeskCategory";
import {
  remoteError,
  remoteLoading,
  remoteReady,
  remoteUndefined,
  RemoteValue
} from "../../../bonus/bpd/model/RemoteValue";
import { NetworkError } from "../../../../utils/errors";
import { Action } from "../../../../store/actions/types";
import {
  getZendeskConfig,
  zendeskRequestTicketNumber,
  zendeskSelectedCategory,
  zendeskSelectedSubcategory
} from "../actions";
import { GlobalState } from "../../../../store/reducers/types";
import { ZendeskSubCategory } from "../../../../../definitions/content/ZendeskSubCategory";

type ZendeskValue = {
  panicMode: boolean;
  zendeskCategories?: {
    id: string;
    categories: IndexedById<ZendeskCategory>;
  };
};
export type ZendeskConfig = RemoteValue<ZendeskValue, NetworkError>;

export type ZendeskState = {
  zendeskConfig: ZendeskConfig;
  selectedCategory?: ZendeskCategory;
  selectedSubcategory?: ZendeskSubCategory;
  ticketNumber: RemoteValue<number, Error>;
};

const INITIAL_STATE: ZendeskState = {
  zendeskConfig: remoteUndefined,
  ticketNumber: remoteUndefined
};

const reducer = (
  state: ZendeskState = INITIAL_STATE,
  action: Action
): ZendeskState => {
  switch (action.type) {
    case getType(getZendeskConfig.request):
      return {
        ...state,
        zendeskConfig: remoteLoading,
        selectedCategory: undefined,
        selectedSubcategory: undefined
      };
    case getType(getZendeskConfig.success):
      return {
        ...state,
        zendeskConfig: remoteReady({
          panicMode: action.payload.panicMode,
          zendeskCategories: action.payload.zendeskCategories
            ? {
                id: action.payload.zendeskCategories.id,
                categories: toIndexed(
                  action.payload.zendeskCategories.categories,
                  c => c.value
                )
              }
            : undefined
        })
      };
    case getType(getZendeskConfig.failure):
      return {
        ...state,
        zendeskConfig: remoteError(action.payload)
      };
    case getType(zendeskSelectedCategory):
      return { ...state, selectedCategory: action.payload };
    case getType(zendeskSelectedSubcategory):
      return { ...state, selectedSubcategory: action.payload };
    case getType(zendeskRequestTicketNumber.request):
      return { ...state, ticketNumber: remoteLoading };
    case getType(zendeskRequestTicketNumber.success):
      return { ...state, ticketNumber: remoteReady(action.payload) };
    case getType(zendeskRequestTicketNumber.failure):
      return { ...state, ticketNumber: remoteError(action.payload) };
  }
  return state;
};

export const zendeskConfigSelector = createSelector(
  [(state: GlobalState) => state.assistanceTools.zendesk.zendeskConfig],
  (zendeskConfig: ZendeskConfig): ZendeskConfig => zendeskConfig
);

export const zendeskSelectedCategorySelector = createSelector(
  [(state: GlobalState) => state.assistanceTools.zendesk.selectedCategory],
  (zendeskCategory: ZendeskCategory | undefined): ZendeskCategory | undefined =>
    zendeskCategory
);

export const zendeskSelectedSubcategorySelector = createSelector(
  [(state: GlobalState) => state.assistanceTools.zendesk.selectedSubcategory],
  (
    zendeskSubcategory: ZendeskSubCategory | undefined
  ): ZendeskSubCategory | undefined => zendeskSubcategory
);

export const zendeskTicketNumberSelector = createSelector(
  [(state: GlobalState) => state.assistanceTools.zendesk.ticketNumber],
  (ticketNumber: RemoteValue<number, Error>): RemoteValue<number, Error> =>
    ticketNumber
);

export default reducer;
