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
      backgroundColor: variables.brandGray
    },
    ".noPadded": {
      paddingTop: 0,
      paddingHorizontal: 0
    },
    ".primary": {
      backgroundColor: variables.contentPrimaryBackground
    },
    backgroundColor: variables.contentBackground,

    paddingTop: variables.contentPadding,
    paddingHorizontal: variables.contentPadding
  };
};
