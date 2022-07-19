import { IOColors } from "../../components/core/variables/IOColors";
import { FOOTER_SAFE_AREA } from "../../utils/constants";
import { Theme } from "../types";
import variables from "../variables";

declare module "native-base" {
  // eslint-disable-next-line @typescript-eslint/no-namespace
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

export default (): Theme => ({
  ".alternative": {
    backgroundColor: IOColors.greyUltraLight
  },
  ".noPadded": {
    paddingBottom: FOOTER_SAFE_AREA,
    paddingTop: 0,
    paddingHorizontal: 0
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
});
