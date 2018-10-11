import { Theme } from "../types";
import variables from "../variables";

declare module "native-base" {
  namespace NativeBase {
    interface List {
      padded?: boolean;
    }
  }
}

export default (): Theme => {
  return {
    ".padded": {
      paddingLeft: variables.contentPadding,
      paddingRight: variables.contentPadding
    }
  };
};
