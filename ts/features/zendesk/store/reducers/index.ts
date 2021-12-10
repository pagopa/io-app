import { getType } from "typesafe-actions";
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
import { getZendeskConfig, zendeskSelectedCategory } from "../actions";

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
};

const INITIAL_STATE: ZendeskState = {
  zendeskConfig: remoteUndefined
};

const reducer = (
  state: ZendeskState = INITIAL_STATE,
  action: Action
): ZendeskState => {
  switch (action.type) {
    case getType(getZendeskConfig.request):
      return { zendeskConfig: remoteLoading };
    case getType(getZendeskConfig.success):
      return {
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
        zendeskConfig: remoteError(action.payload)
      };
    case getType(zendeskSelectedCategory):
      return { ...state, selectedCategory: action.payload };
  }
  return state;
};

export default reducer;
