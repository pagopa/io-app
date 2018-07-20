import { Theme } from "../types";
import variables from "../variables";

export default (): Theme => {
  return {
    "NativeBase.ListItem": {
      "NativeBase.ViewNB": {
        "NativeBase.Left": {
          "NativeBase.Text": {
            alignSelf: "flex-start"
          },
          alignSelf: "flex-start",
          flexDirection: "column",
          flex: 9
        },
        "NativeBase.Right": {
          "NativeBase.Text": {
            alignSelf: "flex-end",
            fontWeight: "bold",
            fontSize: variables.fontSize2,
            lineHeight: variables.lineHeight2
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
        flex: 1,
        flexDirection: "row"
      },
      flex: 1,
      flexDirection: "column",
      marginLeft: 0,
      borderBottomColor: variables.brandLightGray,
      borderBottomWidth: 0.5
    }
  };
};
