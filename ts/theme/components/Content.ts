import { Theme } from "../types";
import variables from "../variables";

declare module "native-base" {
  namespace NativeBase {
    interface Content {
      alternative?: boolean;
      noPadded?: boolean;
      primary?: boolean;
      overScrollMode?: "never" | "always" | "auto";
      bounces?: boolean;
    }
  }
}

export default (): Theme => {
  return {
    ".alternative": {
      backgroundColor: variables.contentAlternativeBackground
    },
    ".noPadded": {
      padding: 0
    },
    ".primary": {
      backgroundColor: variables.contentPrimaryBackground
    },
    padding: variables.contentPadding,
    backgroundColor: variables.contentBackground
  };
};
