import { Theme } from "../types";
import variables from "../variables";

declare module "native-base" {
  namespace NativeBase {
    interface Content {
      alternative?: boolean;
      original?: boolean;
      primary?: boolean
    }
  }
}

export default (): Theme => {
  return {
    ".alternative": {
      backgroundColor: variables.contentAlternativeBackground
    },
    ".original": {
      padding: 0
    },
    ".primary": {
      backgroundColor: variables.contentPrimaryBackground
    },
    padding: variables.contentPadding,
    backgroundColor: variables.contentBackground
  };
};
