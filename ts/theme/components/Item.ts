import color from "color";

import { Theme } from "../types";
import variables from "../variables";

declare module "native-base" {
  namespace NativeBase {
    interface Item {
      active?: boolean;
    }
  }
}

export default (): Theme => {
  const theme = {
    ".active": {
      // eslint-disable-next-line no-magic-numbers
      borderBottomWidth: variables.borderWidth * 4,
      borderColor: color(variables.inputBorderColor)
        // eslint-disable-next-line no-magic-numbers
        .darken(0.2)
        .hex()
    }
  };

  return theme;
};
