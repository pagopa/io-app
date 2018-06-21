import { Theme } from "../types";
import variables from "../variables";

declare module "native-base" {
  namespace NativeBase {
    interface Content {
      alternative?: boolean;
      original?: boolean;
      primary?: boolean;
      noPadded?: true;
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
    ".noPadded": {
      padding: 0
    },
    padding: variables.contentPadding,
    backgroundColor: variables.contentBackground
  };
};
