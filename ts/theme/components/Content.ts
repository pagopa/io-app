import { FOOTER_SAFE_AREA } from "../../utils/constants";
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
    backgroundColor: variables.contentBackground,

    // It implies the content backgound color covers the bottom space in iPhone X
    marginBottom: -FOOTER_SAFE_AREA,
    paddingBottom: FOOTER_SAFE_AREA + variables.contentPadding,
    paddingTop: variables.contentPadding,
    paddingHorizontal: variables.contentPadding
  };
};
