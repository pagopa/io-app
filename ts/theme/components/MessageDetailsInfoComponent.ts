import { IOColors } from "../../components/core/variables/IOColors";
import { Theme } from "../types";

export default (): Theme => ({
  "NativeBase.ViewNB": {
    "NativeBase.ViewNB": {
      flex: 1,
      flexDirection: "row",
      alignSelf: "flex-start"
    },
    paddingLeft: 10,
    borderLeftWidth: 2,
    borderLeftColor: IOColors.greyLight
  }
});
