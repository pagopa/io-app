import { Theme } from "../types";
import variables from "../variables";

declare module "native-base" {
  namespace NativeBase {
    interface List {
      withContentLateralPadding?: boolean;
    }
  }
}

export default (): Theme => {
  return {
    ".withContentLateralPadding": {
      paddingLeft: variables.contentPadding,
      paddingRight: variables.contentPadding
    }
  };
};
