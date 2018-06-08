import color from "color";

import { Theme } from "../types";
import variables from "../variables";

declare module "native-base" {
  namespace NativeBase {
    interface Item {
      active?: boolean;
      spacer?: boolean;
    }
  }
}

export default (): Theme => {
  return {
    ".active": {
      borderBottomWidth: variables.borderWidth * 4,
      borderColor: color(variables.inputBorderColor)
        .darken(0.2)
        .hex()
    },
    ".spacer": {
      paddingTop: variables.itemPaddingTopSpacer
    }
  };
};
