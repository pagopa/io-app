import { Theme } from "../types";
import variables from "../variables";
import { FOOTER_SAFE_AREA } from '../../utils/constants';

declare module "native-base" {
  namespace NativeBase {
    interface Container {
      withSafeArea?: boolean;
    }
  }
}

export default (): Theme => ({
  "NativeBase.Container": {
    backgroundColor: variables.contentBackground,
    ".withSafeArea":{
      // It grants the content backgound color covers the bottom 
      // space in iPhone X
      marginBottom: -FOOTER_SAFE_AREA,
      paddingBottom: FOOTER_SAFE_AREA
    }
  },
});
