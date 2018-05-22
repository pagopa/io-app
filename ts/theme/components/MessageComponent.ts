import { TouchableOpacityProperties } from "react-native";

import { Theme } from "../types";
import variables from "../variables";

declare module "native-base" {
  namespace NativeBase {
    interface MessageComponent extends TouchableOpacityProperties, BsStyle {}
  }
}

export default (): Theme => {
  return {
    "NativeBase.ListItem": {
      "NativeBase.Right": {
        "NativeBase.Text": {
          alignSelf: "center"
        },
        "NativeBase.Icon": {
          alignSelf: "center",
          paddingTop: variables.iconSingleMessagePaddingTop
        },
        flexDirection: "column",
        flex: 1,
        alignSelf: "flex-start"
      },
      "NativeBase.Left": {
        "NativeBase.Text": {
          alignSelf: "flex-start"
        },
        alignSelf: "flex-start",
        flexDirection: "column",
        flex: 7
      },
      marginLeft: variables.itemSingleMessageMarginLeft,
      flexDirection: "row",
      flex: 1,
      borderBottomColor: variables.brandLightGray,
      borderBottomWidth: variables.itemSingleMessageBorderBottomWidth
    }
  };
};
