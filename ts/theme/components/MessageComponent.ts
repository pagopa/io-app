import { TouchableOpacityProperties } from "react-native";

import { Theme } from "../types";
import variables from "../variables";

declare module "native-base" {
  namespace NativeBase {
    interface MessageComponent extends TouchableOpacityProperties, BsStyle {
      left?: boolean;
      right?: boolean;
    }
  }
}

export default (): Theme => {
  return {
    "NativeBase.Item": {
      "NativeBase.ViewNB": {
        flexDirection: "row",
        flex: variables.flexLeftAlign
      }
    },

    flexDirection: "column",
    flex: variables.flexLeftAlign
  };
};
