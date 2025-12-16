import { getType } from "typesafe-actions";
import { createSelector } from "reselect";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { IndexedById, toIndexed } from "../../../../store/helpers/indexer";
import { ZendeskCategory } from "../../../../../definitions/content/ZendeskCategory";
import {
  remoteError,
  remoteLoading,
  remoteReady,
  remoteUndefined,
  RemoteValue
} from "../../../../common/model/RemoteValue";
import { NetworkError } from "../../../../utils/errors";
import { Action } from "../../../../store/actions/types";
import {
  getZendeskConfig,
  zendeskRequestTicketNumber,
  zendeskSelectedCategory,
  zendeskSelectedSubcategory,
  zendeskStartPolling,
  zendeskStopPolling,
  zendeskSupportStart,
  getZendeskToken,
  getZendeskPaymentConfig
} from "../actions";
import { GlobalState } from "../../../../store/reducers/types";
import { ZendeskSubCategory } from "../../../../../definitions/content/ZendeskSubCategory";
import { ZendeskSubcategoriesErrors } from "../../../../../definitions/content/ZendeskSubcategoriesErrors";

type ZendeskValue = {
  panicMode: boolean;
  zendeskCategories?: {
    id: string;
    categories: IndexedById<ZendeskCategory>;
  };
};
export type ZendeskConfig = RemoteValue<ZendeskValue, NetworkError>;

export type ZendeskSubcategoriesErrorsConfig = RemoteValue<
  ZendeskSubcategoriesErrors,
  NetworkError
>;

export enum ZendeskTokenStatusEnum {
  SUCCESS = "success",
  ERROR = "error",
  REQUEST = "request"
}

export type ZendeskState = {
  zendeskConfig: ZendeskConfig;
  selectedCategory?: ZendeskCategory;
  selectedSubcategory?: ZendeskSubCategory;
  ticketNumber: pot.Pot<number, Error>;
  getSessionPollingRunning?: boolean;
  getZendeskTokenStatus?: ZendeskTokenStatusEnum | "401";
  zendeskSubcategoriesErrorMap: ZendeskSubcategoriesErrorsConfig;
};

const INITIAL_STATE: ZendeskState = {
  zendeskConfig: remoteUndefined,
  ticketNumber: pot.none,
  zendeskSubcategoriesErrorMap: remoteUndefined
};

const reducer = (
  state: ZendeskState = INITIAL_STATE,
  action: Action
): ZendeskState => {
  switch (action.type) {
    case getType(getZendeskToken.request):
      return {
        ...state,
        getZendeskTokenStatus: ZendeskTokenStatusEnum.REQUEST
      };

    case getType(getZendeskToken.success):
      return {
        ...state,
        getZendeskTokenStatus: ZendeskTokenStatusEnum.SUCCESS
      };
    case getType(getZendeskToken.failure):
      return {
        ...state,
        getZendeskTokenStatus:
          action.payload === "401"
            ? action.payload
            : ZendeskTokenStatusEnum.ERROR
      };
    case getType(zendeskStopPolling):
      return {
        ...state,
        getSessionPollingRunning: false
      };
    case getType(zendeskStartPolling):
      return {
        ...state,
        getSessionPollingRunning: true
      };
    case getType(zendeskSupportStart):
      return {
        ...state,
        zendeskConfig: remoteUndefined,
        selectedCategory: undefined,
        selectedSubcategory: undefined,
        ticketNumber: pot.none
      };
    case getType(getZendeskConfig.request):
      return {
        ...state,
        zendeskConfig: remoteLoading
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
      return { ...state, ticketNumber: pot.toLoading(state.ticketNumber) };
    case getType(zendeskRequestTicketNumber.success):
      return { ...state, ticketNumber: pot.some(action.payload) };
    case getType(zendeskRequestTicketNumber.failure):
      return {
        ...state,
        ticketNumber: pot.toError(state.ticketNumber, action.payload)
      };
    case getType(getZendeskPaymentConfig.request):
      return {
        ...state,
        zendeskSubcategoriesErrorMap: remoteLoading
      };
    case getType(getZendeskPaymentConfig.success):
      return {
        ...state,
        zendeskSubcategoriesErrorMap: remoteReady(action.payload)
      };
    case getType(getZendeskPaymentConfig.failure):
      return {
        ...state,
        zendeskSubcategoriesErrorMap: remoteError(action.payload)
      };
  }
  return state;
};

export const zendeskGetSessionPollingRunningSelector = (state: GlobalState) =>
  state.assistanceTools.zendesk.getSessionPollingRunning ?? false;

export const zendeskConfigSelector = createSelector(
  [(state: GlobalState) => state.assistanceTools.zendesk.zendeskConfig],
  (zendeskConfig: ZendeskConfig): ZendeskConfig => zendeskConfig
);

export const getZendeskTokenStatusSelector = (state: GlobalState) =>
  state.assistanceTools.zendesk.getZendeskTokenStatus;

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
  (ticketNumber: pot.Pot<number, Error>): pot.Pot<number, Error> => ticketNumber
);

export const zendeskMapSelector = createSelector(
  [
    (state: GlobalState) =>
      state.assistanceTools.zendesk.zendeskSubcategoriesErrorMap
  ],
  (zendeskMap): ZendeskSubcategoriesErrorsConfig => zendeskMap
);

export default reducer;
