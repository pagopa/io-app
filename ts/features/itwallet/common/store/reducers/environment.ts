import { type ItwVersion } from "@pagopa/io-react-native-wallet";
import { getType } from "typesafe-actions";

import { Action } from "../../../../../store/actions/types";
import { EnvType } from "../../utils/environment.ts";
import {
  itwResetEnv,
  itwSetEnv,
  itwSetSpecsVersion
} from "../actions/environment.ts";

export type ItwEnvironmentState = {
  // Indicates the environment for IT Wallet
  env?: EnvType;
  // IT-Wallet technical specifications version
  itWalletSpecsVersion: ItwVersion;
};

const initialState: ItwEnvironmentState = {
  env: "prod",
  itWalletSpecsVersion: "1.0.0"
};

const reducer = (
  state: ItwEnvironmentState = initialState,
  action: Action
): ItwEnvironmentState => {
  switch (action.type) {
    case getType(itwResetEnv): {
      return {
        ...state,
        env: initialState.env
      };
    }

    case getType(itwSetEnv): {
      return {
        ...state,
        env: action.payload
      };
    }

    case getType(itwSetSpecsVersion):
      return {
        ...state,
        itWalletSpecsVersion: action.payload
      };

    default:
      return state;
  }
};

export default reducer;
