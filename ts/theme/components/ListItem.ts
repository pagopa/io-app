import { Theme } from "../types";
import variables from "../variables";

export default (): Theme => ({
    marginLeft: 0,
    marginRight: 0,
    paddingTop: variables.fontSizeBase,
    paddingBottom: variables.fontSizeBase,

    ".itemHeader": {
      paddingLeft: 0,
      paddingRight: 0,
      paddingBottom: 0,
      paddingTop: 40
    },
    ".last": {
      borderBottomWidth: 0,
      marginLeft: 0
    }
  });
