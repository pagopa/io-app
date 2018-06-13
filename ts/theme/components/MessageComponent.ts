import { Theme } from "../types";
import variables from "../variables";

export default (): Theme => {
  return {
    "NativeBase.ListItem": {
      "NativeBase.Right": {
        "NativeBase.Text": {
          alignSelf: "flex-end",
          fontWeight: "bold",
          fontSize: variables.fontSize2,
          lineHeight: variables.lineHeight1
        },
        "NativeBase.Icon": {
          color: variables.brandPrimaryLight,
          alignSelf: "flex-end",
          paddingTop: 20
        },
        flex: 3,
        flexDirection: "column",
        alignSelf: "flex-start"
      },
      "NativeBase.Left": {
        "NativeBase.Text": {
          alignSelf: "flex-start"
        },
        alignSelf: "flex-start",
        flexDirection: "column",
        flex: 9
      },
      marginLeft: 0,
      flexDirection: "row",
      flex: 1,
      borderBottomColor: variables.brandLightGray,
      borderBottomWidth: 0.5
    }
  };
};
