import { getType } from "typesafe-actions";
import { Action } from "../../../../../store/actions/types";
import { EnvType } from "../../utils/environment.ts";
import { itwResetEnv, itwSetEnv } from "../actions/environment.ts";

export type ItwEnvironmentState = {
  // Indicates the environment for IT Wallet
  env?: EnvType;
};

const initialState: ItwEnvironmentState = {
  env: "prod"
};

const reducer = (
  state: ItwEnvironmentState = initialState,
  action: Action
): ItwEnvironmentState => {
  switch (action.type) {
    case getType(itwSetEnv): {
      return {
        ...state,
        env: action.payload
      };
    }

    case getType(itwResetEnv): {
      return {
        ...state,
        env: initialState.env
      };
    }

    default:
      return state;
  }
};

export default reducer;
