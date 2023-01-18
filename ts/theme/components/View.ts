import * as ReactNative from "react-native";
import { Theme } from "../types";
import customVariables from "../variables";

declare module "native-base" {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NativeBase {
    interface View extends ReactNative.ViewProperties {
      content?: boolean;
      padded?: boolean;
    }
  }
}

/**
 * @deprecated
 */
export default (): Theme => ({
  ".padded": {
    paddingBottom: 15
  },
  ".content": {
    padding: customVariables.contentPadding,
    backgroundColor: customVariables.contentBackground,
    flex: 1
  }
});
