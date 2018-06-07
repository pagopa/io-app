import { Theme } from "../types";
import variables from "../variables";

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
        flex: 2,
        alignSelf: "flex-start"
      },
      "NativeBase.Left": {
        "NativeBase.Text": {
          alignSelf: "flex-start"
        },
        alignSelf: "flex-start",
        flexDirection: "column",
        flex: 6
      },
      marginLeft: variables.itemSingleMessageMarginLeft,
      flexDirection: "row",
      flex: 1,
      borderBottomColor: variables.brandLightGray,
      borderBottomWidth: variables.itemSingleMessageBorderBottomWidth
    }
  };
};
