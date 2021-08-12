import color from "color";

import { Theme } from "../types";
import variables from "../variables";

declare module "native-base" {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NativeBase {
    interface Item {
      active?: boolean;
      spacer?: boolean;
    }
  }
}

export default (): Theme => ({
  ".active": {
    borderBottomWidth: variables.borderWidth * 4,
    borderColor: color(variables.inputBorderColor).darken(0.2).hex()
  },
  ".spacer": {
    paddingTop: 20
  }
});
