import { Theme } from "../types";
import variables from "../variables";

declare module "native-base" {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NativeBase {
    interface List {
      withContentLateralPadding?: boolean;
    }
  }
}

export default (): Theme => ({
    ".withContentLateralPadding": {
      paddingLeft: variables.contentPadding,
      paddingRight: variables.contentPadding
    }
  });
